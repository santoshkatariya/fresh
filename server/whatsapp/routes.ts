import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import {
  processWhatsAppIncomingMessage,
  sendWhatsAppMessage,
} from './service.js';
import {
  WhatsAppIncomingMessage,
  WhatsAppWebhookPayload,
} from './types.js';

export const whatsappRouter = Router();

/**
 * GET /api/whatsapp/webhook
 * Verification endpoint for Meta WhatsApp Cloud API
 */
whatsappRouter.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'freshroute_farmer_verify_token';

  if (mode === 'subscribe' && token === expectedVerifyToken) {
    console.log('[WhatsApp Webhook] Verification successful with token');
    res.status(200).send(challenge);
  } else {
    console.warn('[WhatsApp Webhook] Verification token mismatch. Received:', token, 'Expected:', expectedVerifyToken);
    res.status(403).json({
      error: 'Verification token mismatch',
      received: token,
      hint: 'Ensure WHATSAPP_VERIFY_TOKEN environment variable matches Meta App dashboard configuration.',
    });
  }
});

/**
 * POST /api/whatsapp/webhook
 * Ingests incoming WhatsApp messages and notifications from Meta Cloud API
 */
whatsappRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const payload = req.body as WhatsAppWebhookPayload;

    if (!payload || payload.object !== 'whatsapp_business_account') {
      return res.status(400).send('Invalid webhook event source');
    }

    // Acknowledge webhook receipt quickly as required by Meta (under 3 seconds)
    res.status(200).send('EVENT_RECEIVED');

    // Process all entries asynchronously
    if (payload.entry && Array.isArray(payload.entry)) {
      for (const entry of payload.entry) {
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            const value = change.value;
            if (value && value.messages && Array.isArray(value.messages)) {
              for (const incomingMsg of value.messages) {
                try {
                  const result = await processWhatsAppIncomingMessage(incomingMsg, payload);
                  // Dispatch response back to user's WhatsApp number
                  await sendWhatsAppMessage(incomingMsg.from, result.replyMessage);
                } catch (msgErr) {
                  console.error('[WhatsApp Webhook] Error processing message:', msgErr);
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[WhatsApp Webhook] General ingestion error:', err);
    // Even on error, return 200 to prevent Meta from disabling webhook retries
    if (!res.headersSent) {
      res.status(200).send('EVENT_RECEIVED_WITH_INTERNAL_LOG');
    }
  }
});

/**
 * POST /api/whatsapp/simulate
 * Interactive test simulator for farmers & developers without requiring live Meta Cloud credentials
 */
whatsappRouter.post('/simulate', async (req: Request, res: Response) => {
  try {
    const {
      phone = '919822012345',
      text = '',
      type = 'text',
      buttonId,
      location,
      imageBase64,
      audioBase64,
      language,
    } = req.body;

    const incoming: WhatsAppIncomingMessage = {
      from: phone,
      id: `wamid.sim_${Date.now()}`,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      type: type as any,
    };

    if (type === 'text') {
      incoming.text = { body: text };
    } else if (type === 'interactive' || buttonId) {
      incoming.type = 'interactive';
      incoming.interactive = {
        type: 'button_reply',
        button_reply: {
          id: buttonId || 'BTN_HELP',
          title: text || 'Option',
        },
      };
    } else if (type === 'location' && location) {
      incoming.location = location;
    } else if (type === 'image') {
      incoming.image = {
        base64: imageBase64,
        caption: text,
      };
    } else if (type === 'audio') {
      incoming.audio = {
        base64: audioBase64,
        voice: true,
      };
    }

    const result = await processWhatsAppIncomingMessage(incoming, { simulated: true });
    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('Simulation error:', err);
    res.status(500).json({ error: err.message || 'Simulation failed' });
  }
});

/**
 * GET /api/whatsapp/conversation/:phone
 * Retrieve current conversation state
 */
whatsappRouter.get('/conversation/:phone', (req: Request, res: Response) => {
  const phone = req.params.phone;
  const state = db.getWhatsAppConversation(phone);
  res.json({
    phone,
    exists: Boolean(state),
    state: state || {
      userId: `wa-${phone}`,
      phone,
      language: 'en',
      conversationStep: 'IDLE',
      lastInteraction: new Date().toISOString(),
    },
  });
});

/**
 * POST /api/whatsapp/conversation/:phone/reset
 * Reset conversation state for testing
 */
whatsappRouter.post('/conversation/:phone/reset', (req: Request, res: Response) => {
  const phone = req.params.phone;
  const lang = (req.body.language || 'en') as 'en' | 'hi' | 'kn';
  const newState = db.resetWhatsAppConversation(phone, lang);
  res.json({ success: true, state: newState });
});

/**
 * GET /api/whatsapp/logs
 * Retrieve recent webhook and message audit logs
 */
whatsappRouter.get('/logs', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 50;
  const logs = db.getWhatsAppLogs(limit);
  res.json({ logs, count: logs.length });
});

/**
 * DELETE /api/whatsapp/logs
 * Clear all audit logs
 */
whatsappRouter.delete('/logs', (req: Request, res: Response) => {
  db.clearWhatsAppLogs();
  res.json({ success: true });
});

/**
 * GET /api/whatsapp/config
 * Check configuration status
 */
whatsappRouter.get('/config', (req: Request, res: Response) => {
  const hasToken = Boolean(process.env.WHATSAPP_ACCESS_TOKEN);
  const hasPhoneId = Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID);
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'freshroute_farmer_verify_token';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  res.json({
    isConfigured: hasToken && hasPhoneId,
    hasToken,
    hasPhoneId,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ? `...${process.env.WHATSAPP_PHONE_NUMBER_ID.slice(-4)}` : null,
    verifyToken,
    webhookCallbackUrl: `${appUrl}/api/whatsapp/webhook`,
    supportedLanguages: ['en', 'hi', 'kn'],
  });
});
