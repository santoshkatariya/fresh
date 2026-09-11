export type SupportedLanguage = 'en' | 'hi' | 'kn';

export interface WhatsAppIncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'interactive' | 'location' | 'image' | 'audio' | 'voice' | 'button';
  text?: { body: string };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  image?: {
    id?: string;
    mime_type?: string;
    sha256?: string;
    caption?: string;
    link?: string;
    base64?: string;
  };
  audio?: {
    id?: string;
    mime_type?: string;
    link?: string;
    voice?: boolean;
    base64?: string;
  };
  button?: {
    text: string;
    payload: string;
  };
}

export interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    field: string;
    value: {
      messaging_product: 'whatsapp';
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Array<{
        profile: { name: string };
        wa_id: string;
      }>;
      messages?: WhatsAppIncomingMessage[];
      statuses?: Array<{
        id: string;
        status: 'sent' | 'delivered' | 'read' | 'failed';
        timestamp: string;
        recipient_id: string;
      }>;
    };
  }>;
}

export interface WhatsAppWebhookPayload {
  object: 'whatsapp_business_account';
  entry: WhatsAppWebhookEntry[];
}

export interface WhatsAppInteractiveButton {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}

export interface WhatsAppOutgoingMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text' | 'interactive' | 'location' | 'audio';
  text?: {
    body: string;
    preview_url?: boolean;
  };
  interactive?: {
    type: 'button' | 'list';
    body: {
      text: string;
    };
    action: {
      buttons?: WhatsAppInteractiveButton[];
      button?: string;
      sections?: Array<{
        title: string;
        rows: Array<{
          id: string;
          title: string;
          description?: string;
        }>;
      }>;
    };
  };
  location?: {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
  };
  audio?: {
    link: string;
  };
}

export interface WhatsAppQualityCheck {
  crop: string;
  quality_grade: 'A' | 'B' | 'C' | 'D';
  quality_score: number;
  freshness: 'HIGH' | 'MODERATE' | 'LOW';
  ripeness: number;
  visible_defects: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH';
  spoilage_risk: 'LOW' | 'MODERATE' | 'HIGH';
  estimated_shelf_life: string;
  confidence: number;
  explanation: string;
}

export interface WhatsAppConversationState {
  userId: string;
  phone: string;
  userName?: string;
  language: SupportedLanguage;
  crop?: string;
  variety?: string;
  quantityKg?: number;
  harvestTime?: string;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  quality?: WhatsAppQualityCheck;
  conversationStep?:
    | 'IDLE'
    | 'AWAITING_HARVEST_TIME'
    | 'AWAITING_LOCATION'
    | 'AWAITING_PHOTO'
    | 'DECISION_PRESENTED'
    | 'BUYER_SELECTION';
  selectedBuyerId?: string;
  lastBatchId?: string;
  lastOrderId?: string;
  lastInteraction: string;
}

export interface WhatsAppWebhookLog {
  id: string;
  timestamp: string;
  phone: string;
  type: string;
  intent: string;
  incomingSnippet: string;
  responseSnippet: string;
  status: 'SUCCESS' | 'ERROR' | 'PENDING';
  error?: string;
  payload?: any;
  responsePayload?: any;
}
