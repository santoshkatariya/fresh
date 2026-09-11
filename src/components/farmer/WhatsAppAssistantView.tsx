import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Camera,
  MapPin,
  RefreshCw,
  Phone,
  CheckCheck,
  Sparkles,
  Volume2,
  VolumeX,
  Languages,
  Info,
  ExternalLink,
  ShieldCheck,
  Clock,
  ChevronRight,
  TrendingUp,
  Store,
  Truck,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { SupportedLanguage } from '../../../server/whatsapp/types';

interface ChatMessage {
  id: string;
  sender: 'farmer' | 'assistant';
  text: string;
  timestamp: string;
  type?: 'text' | 'interactive' | 'location' | 'image' | 'audio';
  buttons?: Array<{ id: string; title: string }>;
  location?: { name: string; latitude: number; longitude: number };
  imageUrl?: string;
  audioUrl?: string;
  audioText?: string;
}

interface WebhookLog {
  id: string;
  timestamp: string;
  phone: string;
  type: string;
  intent: string;
  incomingSnippet: string;
  responseSnippet: string;
  status: 'SUCCESS' | 'ERROR' | 'PENDING';
}

export const WhatsAppAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-1',
        sender: 'assistant',
        text: '🌾 FreshRoute Farmer Assistant\nHow can I help you today?\n\nWhat do you need?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        buttons: [
          { id: 'BTN_MARKET_PRICE', title: '📊 Market Price' },
          { id: 'BTN_FIND_BUYER', title: '🤝 Find Buyer' },
          { id: 'BTN_CHECK_PRODUCE', title: '📸 Check Produce' },
        ],
      },
    ];
  });

  const [inputVal, setInputVal] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'setup' | 'logs'>('chat');
  const [config, setConfig] = useState<any>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load config & logs
  useEffect(() => {
    fetchConfig();
    fetchLogs();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/whatsapp/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (e) {
      console.warn('Failed to load config', e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/whatsapp/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.warn('Failed to load logs', e);
    }
  };

  // Text to Speech playback
  const speakText = (text: string, lang: SupportedLanguage) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Clean emojis and markdown characters
    const clean = text
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
      .replace(/[*_#•]/g, ' ')
      .slice(0, 200);

    const utterance = new SpeechSynthesisUtterance(clean);
    if (lang === 'kn') utterance.lang = 'kn-IN';
    else if (lang === 'hi') utterance.lang = 'hi-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Send message to WhatsApp Simulator API
  const handleSendMessage = async (
    customText?: string,
    buttonId?: string,
    locationData?: any,
    imageBase64?: string
  ) => {
    const textToSend = customText !== undefined ? customText : inputVal.trim();
    if (!textToSend && !buttonId && !locationData && !imageBase64) return;

    setInputVal('');

    // Add farmer message to UI
    const newFarmerMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'farmer',
      text: textToSend || (buttonId ? `Clicked: ${buttonId}` : 'Sent attachment'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (locationData) {
      newFarmerMsg.type = 'location';
      newFarmerMsg.location = locationData;
    }
    if (imageBase64) {
      newFarmerMsg.type = 'image';
      newFarmerMsg.imageUrl = imageBase64;
    }

    setMessages((prev) => [...prev, newFarmerMsg]);
    setIsLoading(true);

    try {
      const payload: any = {
        phone: '919822012345',
        text: textToSend,
        type: locationData ? 'location' : imageBase64 ? 'image' : buttonId ? 'interactive' : 'text',
        buttonId,
        location: locationData,
        imageBase64,
        language,
      };

      const res = await fetch('/api/whatsapp/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const outgoing = data.replyMessage;
      let replyBody = '';
      let replyButtons: Array<{ id: string; title: string }> = [];

      if (outgoing.type === 'interactive' && outgoing.interactive) {
        replyBody = outgoing.interactive.body?.text || '';
        replyButtons = (outgoing.interactive.action?.buttons || []).map((b: any) => ({
          id: b.reply?.id,
          title: b.reply?.title,
        }));
      } else if (outgoing.text) {
        replyBody = outgoing.text.body || '';
      }

      if (data.state?.language) {
        setLanguage(data.state.language);
      }

      const botReplyMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyBody,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        buttons: replyButtons,
        audioText: data.audioResponseText,
      };

      setMessages((prev) => [...prev, botReplyMsg]);

      // Speak spoken summary if voice is active or returned
      if (data.audioResponseText) {
        speakText(data.audioResponseText, data.state?.language || language);
      }

      fetchLogs();
    } catch (err) {
      console.error('Error in WhatsApp conversation:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text: '⚠️ Network connection issue. Please retry or click Main Menu.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          buttons: [{ id: 'BTN_MAIN_MENU', title: '🏠 Main Menu' }],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Web Speech API Voice Recognition
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type or use the quick buttons.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      if (language === 'kn') recognition.lang = 'kn-IN';
      else if (language === 'hi') recognition.lang = 'hi-IN';
      else recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputVal(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition failed to start:', err);
      setIsRecording(false);
    }
  };

  // Send Browser GPS Location
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          name: 'My Farm Gate (GPS)',
          address: `Lat ${pos.coords.latitude.toFixed(4)}, Lon ${pos.coords.longitude.toFixed(4)}`,
        };
        handleSendMessage('📍 Shared GPS Location', undefined, coords);
      },
      (err) => {
        console.warn('Geolocation failed:', err);
        // Fallback default Nashik/Kolar farm coordinates
        const fallback = {
          latitude: 20.0059,
          longitude: 73.7898,
          name: 'Nashik Farm Gate (Default)',
          address: 'Dindori Taluka, Nashik, Maharashtra',
        };
        handleSendMessage('📍 Shared Farm Location (Nashik)', undefined, fallback);
      }
    );
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleSendMessage('📸 Sent Produce Photo', undefined, undefined, base64);
    };
    reader.readAsDataURL(file);
  };

  // Reset Conversation
  const handleResetChat = async () => {
    try {
      await fetch('/api/whatsapp/conversation/919822012345/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });
      setMessages([
        {
          id: `msg-reset-${Date.now()}`,
          sender: 'assistant',
          text:
            language === 'kn'
              ? '🌾 FreshRoute ಕಿಸಾನ್ ಸಹಾಯಕ\nಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?'
              : language === 'hi'
              ? '🌾 FreshRoute किसान साथी\nआज मैं आपकी क्या सहायता करूँ?'
              : '🌾 FreshRoute Farmer Assistant\nHow can I help you today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          buttons: [
            { id: 'BTN_MARKET_PRICE', title: language === 'kn' ? '📊 ಮಂಡಿ ದರ' : language === 'hi' ? '📊 मंडी भाव' : '📊 Market Price' },
            { id: 'BTN_FIND_BUYER', title: language === 'kn' ? '🤝 ಖರೀದಿದಾರರು' : language === 'hi' ? '🤝 खरीदार खोजें' : '🤝 Find Buyer' },
            { id: 'BTN_CHECK_PRODUCE', title: language === 'kn' ? '📸 ಬೆಳೆ ಪರಿಶೀಲನೆ' : language === 'hi' ? '📸 फसल जांचें' : '📸 Check Produce' },
          ],
        },
      ]);
    } catch (e) {
      console.warn('Failed to reset conversation', e);
    }
  };

  // Copy webhook url
  const copyWebhookUrl = () => {
    if (config?.webhookCallbackUrl) {
      navigator.clipboard.writeText(config.webhookCallbackUrl);
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    }
  };

  return (
    <div id="whatsapp-farmer-assistant-root" className="w-full max-w-6xl mx-auto p-4 sm:p-6">
      {/* Top Header & Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Meta Cloud API Ready
            </span>
            <span className="text-xs text-slate-500 font-medium">WhatsApp v21.0 Webhook</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            WhatsApp Farmer AI Assistant
          </h1>
          <p className="text-sm text-slate-600">
            Voice-first, multilingual agro logistics engine designed for low-literacy farmers.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            id="tab-chat-simulator"
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💬 Interactive Bot
          </button>
          <button
            id="tab-setup-guide"
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              activeTab === 'setup'
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚙️ Meta Cloud API
          </button>
          <button
            id="tab-audit-logs"
            onClick={() => {
              setActiveTab('logs');
              fetchLogs();
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              activeTab === 'logs'
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Webhook Logs ({logs.length})
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE CHAT SIMULATOR */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main WhatsApp Window */}
          <div className="lg:col-span-8 flex flex-col h-[740px] bg-slate-100 rounded-2xl shadow-lg border border-slate-300 overflow-hidden">
            {/* Authentic WhatsApp Green Header */}
            <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#075e54] flex items-center justify-center font-bold text-lg border-2 border-white/20">
                    FR
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075e54] rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-semibold text-sm sm:text-base leading-tight">
                      FreshRoute Kisan AI
                    </h2>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  </div>
                  <p className="text-xs text-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Online • AI Agro Assistant (EN, HI, KN)
                  </p>
                </div>
              </div>

              {/* Sound & Reset Controls */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-toggle-sound"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? 'Mute Speech Synthesis' : 'Enable Speech Synthesis'}
                  className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-200" /> : <VolumeX className="w-5 h-5 text-slate-300" />}
                </button>
                <button
                  id="btn-reset-chat"
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="p-2 rounded-full hover:bg-white/10 text-white transition-colors text-xs flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body (WhatsApp wallpaper pattern background) */}
            <div
              className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#e5ddd5]"
              style={{
                backgroundImage:
                  'radial-gradient(#cfc5b8 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            >
              {/* Security Pill */}
              <div className="flex justify-center">
                <span className="bg-[#ffeecd] text-[#554228] text-[11px] px-3 py-1 rounded-md shadow-sm border border-[#e0cba8] flex items-center gap-1 max-w-sm text-center">
                  🔒 Messages are processed with AI Post-Harvest Logistics Engine.
                </span>
              </div>

              {/* Message Feed */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'farmer' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-3.5 py-2.5 shadow-sm text-sm relative ${
                      msg.sender === 'farmer'
                        ? 'bg-[#dcf8c6] text-slate-900 rounded-tr-none'
                        : 'bg-white text-slate-900 rounded-tl-none border border-slate-200'
                    }`}
                  >
                    {/* Location Card if location sent */}
                    {msg.type === 'location' && msg.location && (
                      <div className="mb-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-xs text-emerald-950">{msg.location.name}</p>
                          <p className="text-[11px] text-slate-600">
                            {msg.location.latitude.toFixed(4)}, {msg.location.longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Image Thumbnail if photo sent */}
                    {msg.type === 'image' && msg.imageUrl && (
                      <div className="mb-2 rounded-lg overflow-hidden border border-slate-200 max-h-48">
                        <img
                          src={msg.imageUrl}
                          alt="Farmer Produce"
                          className="w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Text Body formatted nicely */}
                    <div className="whitespace-pre-line leading-relaxed text-slate-800">
                      {msg.text}
                    </div>

                    {/* Interactive Action Buttons (WhatsApp Quick Reply Buttons) */}
                    {msg.buttons && msg.buttons.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                        {msg.buttons.map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => handleSendMessage(undefined, btn.id)}
                            className="w-full py-2 px-3 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-300 rounded-lg transition-all text-center flex items-center justify-center gap-1 shadow-sm"
                          >
                            <span>{btn.title}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Timestamp & Read Tick */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-500">
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'farmer' && (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-start">
                  <div className="bg-white text-slate-600 rounded-xl rounded-tl-none px-4 py-2 shadow-sm text-xs flex items-center gap-2 border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-slate-500 font-medium">FreshRoute AI is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="bg-[#f0f2f5] p-2.5 sm:p-3 border-t border-slate-300 flex items-center gap-2">
              {/* Camera / Photo Button */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                id="btn-upload-photo"
                onClick={() => fileInputRef.current?.click()}
                title="Send Produce Photo"
                className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-200 rounded-full transition-colors"
              >
                <Camera className="w-5 h-5" />
              </button>

              {/* Location Share Button */}
              <button
                id="btn-share-location"
                onClick={handleShareLocation}
                title="Send GPS Location"
                className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-200 rounded-full transition-colors"
              >
                <MapPin className="w-5 h-5" />
              </button>

              {/* Text Input */}
              <input
                id="input-whatsapp-message"
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  language === 'kn'
                    ? 'ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...'
                    : language === 'hi'
                    ? 'संदेश लिखें...'
                    : 'Type message e.g. "I have 500 kg tomatoes"...'
                }
                className="flex-1 bg-white text-slate-800 text-sm px-4 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />

              {/* Mic / Voice Recording Button */}
              <button
                id="btn-voice-record"
                onClick={toggleSpeechRecognition}
                title={isRecording ? 'Stop Recording' : 'Speak in Kannada, Hindi, or English'}
                className={`p-2.5 rounded-full transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-200'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Send Button */}
              <button
                id="btn-send-message"
                onClick={() => handleSendMessage()}
                disabled={!inputVal.trim() && !isLoading}
                className="p-2.5 bg-[#00a884] text-white hover:bg-[#008f6f] disabled:opacity-50 disabled:hover:bg-[#00a884] rounded-full shadow transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Side Helper & Low-Literacy Quick Actions */}
          <div className="lg:col-span-4 space-y-4">
            {/* Language Selector Card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-slate-800 font-semibold text-sm">
                <Languages className="w-4 h-4 text-emerald-600" />
                <span>Farmer Language / ಭಾಷೆ / भाषा</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  id="btn-lang-en"
                  onClick={() => {
                    setLanguage('en');
                    handleSendMessage('English', 'BTN_LANG_EN');
                  }}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    language === 'en'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🇬🇧 English
                </button>
                <button
                  id="btn-lang-hi"
                  onClick={() => {
                    setLanguage('hi');
                    handleSendMessage('हिन्दी', 'BTN_LANG_HI');
                  }}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    language === 'hi'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🇮🇳 हिन्दी
                </button>
                <button
                  id="btn-lang-kn"
                  onClick={() => {
                    setLanguage('kn');
                    handleSendMessage('ಕನ್ನಡ', 'BTN_LANG_KN');
                  }}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    language === 'kn'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🇮🇳 ಕನ್ನಡ
                </button>
              </div>
            </div>

            {/* Low-Literacy Quick Action Pills */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>One-Click Farmer Questions</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click any button to test realistic WhatsApp voice/text interactions:
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() =>
                    handleSendMessage(
                      language === 'kn' ? 'ಟೊಮೇಟೊ ದರ ಎಷ್ಟು?' : language === 'hi' ? 'टमाटर का भाव क्या है?' : 'Tomato price'
                    )
                  }
                  className="text-left px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-medium text-emerald-900 transition-colors flex items-center justify-between"
                >
                  <span>🍅 {language === 'kn' ? 'ಟೊಮೇಟೊ ದರ' : language === 'hi' ? 'टमाटर का भाव' : 'Tomato price'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                </button>

                <button
                  onClick={() =>
                    handleSendMessage(
                      language === 'kn' ? 'ನನ್ನ ಬಳಿ ೫೦೦ ಕೆಜಿ ಟೊಮೇಟೊ ಇದೆ' : language === 'hi' ? 'मेरे पास 500 किलो टमाटर है' : 'I have 500 kg tomatoes'
                    )
                  }
                  className="text-left px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-medium text-blue-900 transition-colors flex items-center justify-between"
                >
                  <span>📦 {language === 'kn' ? '೫೦೦ ಕೆಜಿ ಟೊಮೇಟೊ ಇದೆ' : language === 'hi' ? '500 किलो टमाटर है' : 'I have 500 kg tomato'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                </button>

                <button
                  onClick={() =>
                    handleSendMessage(
                      language === 'kn' ? 'ಯಾವ ಮಂಡಿ ಉತ್ತಮ?' : language === 'hi' ? 'कौन सी मंडी अच्छी है?' : 'Which market is best?'
                    )
                  }
                  className="text-left px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-medium text-amber-900 transition-colors flex items-center justify-between"
                >
                  <span>🌾 {language === 'kn' ? 'ಯಾವ ಮಂಡಿ ಉತ್ತಮ?' : language === 'hi' ? 'सर्वोत्तम मंडी?' : 'Best market?'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                </button>

                <button
                  onClick={() =>
                    handleSendMessage(
                      language === 'kn' ? 'ಈಗ ಮಾರಾಟ ಮಾಡಬೇಕಾ?' : language === 'hi' ? 'क्या अभी बेचें?' : 'What should I do? Sell now?'
                    )
                  }
                  className="text-left px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-medium text-purple-900 transition-colors flex items-center justify-between"
                >
                  <span>💡 {language === 'kn' ? 'ಏನು ಮಾಡಬೇಕು?' : language === 'hi' ? 'क्या करना चाहिए?' : 'What should I do?'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-purple-600" />
                </button>

                <button
                  onClick={() =>
                    handleSendMessage(
                      language === 'kn' ? 'ಕಾಯ್ದರೆ ಏನಾಗುತ್ತದೆ?' : language === 'hi' ? 'अगर रुकें तो क्या होगा?' : 'What if I wait?'
                    )
                  }
                  className="text-left px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-medium text-rose-900 transition-colors flex items-center justify-between"
                >
                  <span>🤔 {language === 'kn' ? 'ಕಾಯ್ದರೆ ಏನಾಗುತ್ತದೆ?' : language === 'hi' ? 'अगर रुकें तो?' : 'What if I wait?'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-rose-600" />
                </button>

                <button
                  onClick={() =>
                    handleSendMessage(
                      language === 'kn' ? 'ಖರೀದಿದಾರರನ್ನು ಹುಡುಕಿ' : language === 'hi' ? 'खरीदार ढूंढो' : 'Find buyer'
                    )
                  }
                  className="text-left px-3 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs font-medium text-teal-900 transition-colors flex items-center justify-between"
                >
                  <span>🤝 {language === 'kn' ? 'ಖರೀದಿದಾರರು' : language === 'hi' ? 'खरीदार खोजें' : 'Find buyer'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-teal-600" />
                </button>

                <button
                  onClick={() =>
                    handleSendMessage(
                      language === 'kn' ? 'ನನ್ನ ಆರ್ಡರ್ ಎಲ್ಲಿ?' : language === 'hi' ? 'मेरा ऑर्डर कहाँ है?' : 'Where is my order?'
                    )
                  }
                  className="text-left px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-medium text-slate-900 transition-colors flex items-center justify-between"
                >
                  <span>🚚 {language === 'kn' ? 'ಆರ್ಡರ್ ಮಾಹಿತಿ' : language === 'hi' ? 'ऑर्डर की स्थिति' : 'My order status'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Quick Live Integration Box */}
            <div className="bg-emerald-900 text-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Real WhatsApp Link</span>
              </div>
              <p className="text-xs text-emerald-100 mb-3 leading-relaxed">
                Connect your real WhatsApp account to the webhook, or open a live test chat on your mobile.
              </p>
              <a
                href={`https://wa.me/?text=${encodeURIComponent('Hi FreshRoute, what is today tomato price?')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <span>Open in WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: META CLOUD API SETUP GUIDE */}
      {activeTab === 'setup' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Meta WhatsApp Cloud API Configuration</h2>
            <p className="text-sm text-slate-600 mt-1">
              Instructions to connect the FreshRoute AI Webhook to your Meta Developer WhatsApp Business Account.
            </p>
          </div>

          {/* Webhook URL Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">1. Webhook Callback URL</h3>
            <p className="text-xs text-slate-600">
              Paste this URL in your Meta App Dashboard under <strong>WhatsApp &gt; Configuration &gt; Webhook</strong>:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={config?.webhookCallbackUrl || `${window.location.origin}/api/whatsapp/webhook`}
                className="flex-1 bg-white font-mono text-xs px-3 py-2 rounded-lg border border-slate-300 text-slate-800 select-all"
              />
              <button
                onClick={copyWebhookUrl}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Verify Token Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">2. Verify Token</h3>
            <p className="text-xs text-slate-600">
              Enter this Verify Token in the Meta App Webhook verification modal:
            </p>
            <div className="inline-block bg-white font-mono text-xs px-3 py-1.5 rounded border border-slate-300 font-semibold text-emerald-800">
              {config?.verifyToken || 'freshroute_farmer_verify_token'}
            </div>
          </div>

          {/* Environment Variables Checklist */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">3. Environment Variables (.env)</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 text-xs">
                <div>
                  <span className="font-mono font-semibold text-slate-900">WHATSAPP_ACCESS_TOKEN</span>
                  <p className="text-slate-500">System user permanent access token from Meta Business Manager</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full font-semibold ${
                    config?.hasToken
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {config?.hasToken ? 'Active' : 'Pending in Settings'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 text-xs">
                <div>
                  <span className="font-mono font-semibold text-slate-900">WHATSAPP_PHONE_NUMBER_ID</span>
                  <p className="text-slate-500">Phone Number ID from WhatsApp App Dashboard</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full font-semibold ${
                    config?.hasPhoneId
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {config?.hasPhoneId ? 'Active' : 'Pending in Settings'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 text-xs">
                <div>
                  <span className="font-mono font-semibold text-slate-900">GEMINI_API_KEY</span>
                  <p className="text-slate-500">Powers vision quality grading and multilingual voice transcription</p>
                </div>
                <span className="px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Active in Server
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEBHOOK AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Webhook Audit Logs</h2>
              <p className="text-xs text-slate-500">Real-time incoming WhatsApp messages & responses</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchLogs}
                className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1 border border-slate-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
              <button
                onClick={async () => {
                  await fetch('/api/whatsapp/logs', { method: 'DELETE' });
                  setLogs([]);
                }}
                className="px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold border border-rose-200"
              >
                Clear Logs
              </button>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No webhook interactions recorded yet. Send a message in the bot to view live logs.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="p-2.5 font-semibold">Time</th>
                    <th className="p-2.5 font-semibold">Phone</th>
                    <th className="p-2.5 font-semibold">Type</th>
                    <th className="p-2.5 font-semibold">Intent</th>
                    <th className="p-2.5 font-semibold">Incoming Message</th>
                    <th className="p-2.5 font-semibold">FreshRoute Reply</th>
                    <th className="p-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 text-slate-500 font-mono whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-2.5 font-mono text-slate-800">{log.phone}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                          {log.type}
                        </span>
                      </td>
                      <td className="p-2.5 font-semibold text-emerald-800">{log.intent}</td>
                      <td className="p-2.5 text-slate-700 max-w-xs truncate">{log.incomingSnippet}</td>
                      <td className="p-2.5 text-slate-600 max-w-xs truncate">{log.responseSnippet}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
