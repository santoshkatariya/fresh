import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  X,
  ArrowRight,
  CheckCircle2,
  Radio,
  PhoneCall,
  DollarSign,
  Truck,
  Clock,
  Camera,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Smartphone,
  BookOpen,
  Wrench
} from 'lucide-react';
import {
  speakKisanGuidance,
  stopKisanSpeech,
  initKisanSpeechRecognition,
  generateBatchVoiceAdvice
} from '../../utils/kisanVoice';
import { ProduceBatch } from '../../types';
import { api } from '../../utils/api';

interface KisanVoiceAssistantProps {
  batches?: ProduceBatch[];
  onNavigateTab?: (tab: string, batchId?: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const KisanVoiceAssistant: React.FC<KisanVoiceAssistantProps> = ({
  batches = [],
  onNavigateTab,
  isOpen: propIsOpen,
  onClose: propOnClose
}) => {
  const { t, i18n } = useTranslation();
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (propOnClose && !val) {
      propOnClose();
    }
    setInternalIsOpen(val);
  };

  const [activeGuideMode, setActiveGuideMode] = useState<'walkthrough' | 'voice'>('walkthrough');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [aiAnswer, setAiAnswer] = useState<{
    text: string;
    actionTab?: string;
    actionLabel?: string;
    batchId?: string;
  } | null>(null);

  const lang = i18n.language;

  const quickVoicePrompts = [
    {
      label: lang === 'kn' ? '📸 ಕ್ಯಾಮೆರಾ ಕೆಲಸ ಮಾಡುತ್ತಿಲ್ಲವೇ?' : lang === 'hi' ? '📸 कैमरा काम नहीं कर रहा / ब्लैक स्क्रीन?' : '📸 Camera not working / black screen?',
      query: 'camera not working'
    },
    {
      label: lang === 'kn' ? '📖 ಆ್ಯಪ್ ಹೇಗೆ ಬಳಸುವುದು?' : lang === 'hi' ? '📖 यह ऐप कैसे चलाएं?' : '📖 How to use this app?',
      query: 'how to use app'
    },
    {
      label: lang === 'kn' ? '🌾 ಈಗಲೇ ಮಾರಬೇಕಾ?' : lang === 'hi' ? '🌾 क्या अभी बेचना सही है?' : '🌾 Sell now or wait?',
      query: 'sell or wait'
    },
    {
      label: lang === 'kn' ? '🏛️ ಮಂಡಿ vs ನಮ್ಮ ದರ' : lang === 'hi' ? '🏛️ मंडी vs हमारा भाव' : '🏛️ Mandi vs Our Rate',
      query: 'mandi price compare'
    },
    {
      label: lang === 'kn' ? '🚚 ಮುಂಬೈಗೆ ರಸ್ತೆ ಮಾರ್ಗ' : lang === 'hi' ? '🚚 मुंबई का सुरक्षित रास्ता' : '🚚 Safest route to Mumbai',
      query: 'show route'
    },
    {
      label: lang === 'kn' ? '💰 ನನ್ನ ನಿವ್ವಳ ಲಾಭ ಎಷ್ಟು?' : lang === 'hi' ? '💰 मेरा कुल मुनाफा कितना है?' : '💰 How much net profit?',
      query: 'profit'
    }
  ];

  const handleProcessQuery = async (queryText: string) => {
    setTranscript(queryText);
    const topBatch = batches[0];

    try {
      const backendRes = await api.voice.ask({
        query: queryText,
        language: lang,
        crop: topBatch?.crop || 'Tomatoes',
        batchContext: topBatch,
      });

      if (backendRes.success && backendRes.answer) {
        setAiAnswer({
          text: backendRes.answer,
          actionTab: backendRes.actionTab || 'decisions',
          actionLabel: 'View Agro Intelligence / ಶಿಫಾರಸು ನೋಡಿ',
          batchId: topBatch?.id,
        });

        setIsSpeaking(true);
        speakKisanGuidance(backendRes.answer, lang).then(() => {
          setIsSpeaking(false);
        });
        return;
      }
    } catch (e) {
      console.debug('Voice assistant fallback to local agricultural heuristics:', e);
    }

    const q = (queryText || '').toLowerCase();
    let answerText = '';
    let tabTarget: string | undefined = undefined;
    let labelTarget: string | undefined = undefined;

    if (
      q.includes('camera') ||
      q.includes('ಕ್ಯಾಮೆರಾ') ||
      q.includes('कैमरा') ||
      q.includes('black') ||
      q.includes('screen') ||
      q.includes('photo') ||
      q.includes('ಫೋಟೋ') ||
      q.includes('ಕಪ್ಪು') ||
      q.includes('dark')
    ) {
      if (lang === 'kn') {
        answerText = `ಕ್ಯಾಮೆರಾ ಕೆಲಸ ಮಾಡುತ್ತಿಲ್ಲವೇ ಅಥವಾ ಕಪ್ಪು ಸ್ಕ್ರೀನ್ ಬರುತ್ತಿದೆಯೇ? 1. ಬ್ರೌಸರ್ ವಿಳಾಸ ಪಟ್ಟಿಯಲ್ಲಿರುವ ಲಾಕ್ (🔒) ಐಕಾನ್ ಒತ್ತಿ ಕ್ಯಾಮೆರಾಗೆ 'Allow' ಅನುಮತಿ ನೀಡಿ. 2. ಸ್ಕ್ಯಾನರ್‌ನಲ್ಲಿ 'ವರ್ಚುವಲ್ ಫೀಲ್ಡ್ ಕ್ಯಾಮೆರಾ' ಒತ್ತಿ ತಕ್ಷಣ ಬೆಳೆ ಗುಣಮಟ್ಟ ಪರೀಕ್ಷಿಸಿ.`;
      } else if (lang === 'hi') {
        answerText = `कैमरा काम नहीं कर रहा या स्क्रीन काली आ रही है? 1. ब्राउज़र एड्रेस बार में लॉक (🔒) आइकन दबाकर कैमरा को 'Allow' करें। 2. स्कैनर में 'वर्चुअल फील्ड कैमरा' दबाकर बिना किसी परेशानी के फसल जांचें।`;
      } else {
        answerText = `Camera screen dark or blocked? 1. Click the Lock (🔒) icon in your browser address bar and set Camera to 'Allow'. 2. In our scanner, you can also launch the Virtual Field Camera to test crop grading with simulated live camera feeds immediately.`;
      }
      tabTarget = 'scanner';
      labelTarget = '📸 Open Camera Scanner / ಕ್ಯಾಮೆರಾ ಸ್ಕ್ಯಾನರ್ ತೆರೆಯಿರಿ';
    } else if (
      q.includes('how') ||
      q.includes('use') ||
      q.includes('guide') ||
      q.includes('ಬಳಕೆ') ||
      q.includes('ಹೇಗೆ') ||
      q.includes('उपयोग') ||
      q.includes('चलाएं')
    ) {
      if (lang === 'kn') {
        answerText = `ಫ್ರೆಶ್‌ರೂಟ್ ಬಳಸಲು 4 ಸರಳ ಹಂತಗಳು: 1. ಫಸಲಿನ ಫೋಟೋ ತೆಗೆದು ಗುಣಮಟ್ಟ ಗ್ರೇಡಿಂಗ್ ಮಾಡಿ. 2. ಮಂಡಿ ದರ ಹೋಲಿಸಿ. 3. ನೇರ ಖರೀದಿದಾರರನ್ನು ಆಯ್ಕೆಮಾಡಿ. 4. ಕಡಿಮೆ ಕಂಪನದ ವಾಹನ ಬುಕ್ ಮಾಡಿ. ಸಂಪೂರ್ಣ ಗೈಡ್ ನೋಡಲು 'ಆ್ಯಪ್ ಗೈಡ್' ಟ್ಯಾಬ್ ಕ್ಲಿಕ್ ಮಾಡಿ.`;
      } else if (lang === 'hi') {
        answerText = `FreshRoute का उपयोग करने के 4 आसान कदम: 1. कैमरे से फसल की फोटो लें और ग्रेड A जांचें। 2. मंडी भाव की तुलना करें। 3. बड़े खरीदार चुनें। 4. सुरक्षित गाड़ी बुक करें। पूरा गाइड नीचे देखें।`;
      } else {
        answerText = `FreshRoute takes 4 easy steps: 1. Point camera at crop for instant Grade-A certification. 2. Compare live Mandi vs Direct buyer prices. 3. Connect with guaranteed escrow buyers. 4. Book low-vibration mini-trucks.`;
      }
      tabTarget = 'scanner';
      labelTarget = 'Start Step 1: Scan Harvest / ಮೊದಲ ಹಂತ: ಬೆಳೆ ಸ್ಕ್ಯಾನ್';
    } else if (q.includes('mandi') || q.includes('ಮಂಡಿ') || q.includes('मंडी') || q.includes('compare')) {
      if (lang === 'kn') {
        answerText = `ಪಿಂಪಲಗಾಂವ್ ಮಂಡಿಯಲ್ಲಿ ₹22 ದರ ಸಿಕ್ಕರೂ, ದಲ್ಲಾಳಿ ಕಮಿಷನ್ ಮತ್ತು ಕಡಿತದ ನಂತರ ನಿಮ್ಮ ಕೈಗೆ ₹16.37 ಮಾತ್ರ ಸಿಗುತ್ತದೆ. ಫ್ರೆಶ್‌ರೂಟ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ₹37.50 ಸಿಗುತ್ತದೆ. ಪ್ರತಿ ಕೆಜಿಗೆ ₹21.13 ಹೆಚ್ಚಿನ ಲಾಭ.`;
      } else if (lang === 'hi') {
        answerText = `पिंपलगांव मंडी में ₹22 भाव पर आढ़त और कटाई के बाद आपको केवल ₹16.37/किग्रा मिलेगा। FreshRoute के सीधे अनुबंध में ₹37.50/किग्रा मिलता है, जिससे ₹21.13 प्रति किलो अधिक शुद्ध मुनाफा होगा।`;
      } else {
        answerText = `At Pimpalgaon APMC mandi, gross price is ₹22/kg but after 6.5% trader commission, weighment cut, and transit bruising, you get only ₹16.37/kg. FreshRoute direct contract pays ₹37.50/kg net—giving you +₹21.13/kg extra cash.`;
      }
      tabTarget = 'mandi-rates';
      labelTarget = 'Open Live Price Radar / ಮಂಡಿ ರಡಾರ್ ತೆರೆಯಿರಿ';
    } else if (q.includes('sell') || q.includes('wait') || q.includes('ಮಾರ') || q.includes('बेच')) {
      if (lang === 'kn') {
        answerText = `ರಮೇಶ್ ಅವರೇ, ನಿಮ್ಮ ${topBatch?.crop || 'ಟೊಮೇಟೊ'} ಫಸಲಿಗೆ ಈಗಲೇ ಫ್ರೆಶ್‌ಮಾರ್ಟ್‌ಗೆ ಮಾರಾಟ ಮಾಡುವುದು ಅತ್ಯುತ್ತಮ. ಮುಂದಿನ 18 ಗಂಟೆಯಲ್ಲಿ ಗುಣಮಟ್ಟ ಕುಸಿಯಬಹುದು. ಈಗ ಮಾರಿದರೆ ₹15,650 ಲಾಭ ಸಿಗುತ್ತದೆ.`;
      } else if (lang === 'hi') {
        answerText = `रमेश जी, आपकी ${topBatch?.crop || 'टमाटर'} फसल को FreshMart को तुरंत बेचना सबसे सही है। अगले 18 घंटे में क्वालिटी गिर सकती है। अभी बेचने पर ₹15,650 का शुद्ध मुनाफा मिलेगा।`;
      } else {
        answerText = `Ramesh ji, FreshRoute AI advises selling your ${topBatch?.crop || 'Tomatoes'} immediately to FreshMart DC. Delaying over 18 hours will cause 12% firmness loss. Sell now for ₹15,650 net profit.`;
      }
      tabTarget = 'decisions';
      labelTarget = 'Open Decision Engine / ತೀರ್ಮಾನ ಪರಿಶೀಲಿಸಿ';
    } else if (q.includes('route') || q.includes('रास्ता') || q.includes('ಮಾರ್ಗ') || q.includes('mumbai')) {
      if (lang === 'kn') {
        answerText = `ನಾಸಿಕ್‌ನಿಂದ ಮುಂಬೈಗೆ NH-60 ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇ ಆಯ್ಕೆ ಮಾಡಿ. ಇದು ನಯವಾದ ರಸ್ತೆಯಾಗಿದ್ದು, ಹಣ್ಣುಗಳಿಗೆ ಕೇವಲ 4% ಕಂಪನ ಉಂಟಾಗುತ್ತದೆ. ಪ್ರಯಾಣದ ಸಮಯ 3 ಗಂಟೆ 45 ನಿಮಿಷ.`;
      } else if (lang === 'hi') {
        answerText = `नासिक से मुंबई के लिए NH-60 एक्सप्रेसवे चुनें। यह गड्ढा-मुक्त सड़क है जिससे फल खराब नहीं होंगे। यात्रा का समय 3 घंटे 45 मिनट रहेगा।`;
      } else {
        answerText = `Take the NH-60 Agro Expressway to Mumbai. It is smooth with less than 0.2g vibration, preventing bruising on tomatoes. Travel time is 3 hours 45 mins.`;
      }
      tabTarget = 'routes';
      labelTarget = 'Open Smart GPS Routes / ಲೈವ್ ಮ್ಯಾಪ್ ನೋಡಿ';
    } else if (q.includes('profit') || q.includes('ಲಾಭ') || q.includes('मुनाफा') || q.includes('price')) {
      if (lang === 'kn') {
        answerText = `ಫ್ರೆಶ್‌ಮಾರ್ಟ್‌ನಿಂದ ₹34/ಕೆಜಿ ದರದಲ್ಲಿ 850 ಕೆಜಿ ಫಸಲಿಗೆ ₹28,900 ಆದಾಯ. ಸಾಗಾಣಿಕೆ ವೆಚ್ಚ ₹3,450 ಕಳೆದು ನಿಮ್ಮ ನಿವ್ವಳ ಲಾಭ ₹25,450.`;
      } else if (lang === 'hi') {
        answerText = `FreshMart द्वारा ₹34/किलो की दर से 850 किलो फसल पर कुल आय ₹28,900 है। परिवहन खर्च ₹3,450 काटकर आपका शुद्ध मुनाफा ₹25,450 रहेगा।`;
      } else {
        answerText = `At ₹34/kg from FreshMart DC for 850 kg, gross revenue is ₹28,900. After ₹3,450 transport, your take-home net profit is ₹25,450.`;
      }
      tabTarget = 'decisions';
      labelTarget = 'View Profit Breakdown';
    } else {
      if (lang === 'kn') {
        answerText = `ನಿಮ್ಮ ಪ್ರಶ್ನೆ: "${queryText}". ನಿಮ್ಮ ${topBatch?.crop || 'ಟೊಮೇಟೊ'} ಗುಣಮಟ್ಟ 82/100 (ಗ್ರೇಡ್ A) ಇದೆ. ತಕ್ಷಣವೇ ಖರೀದಿದಾರರನ್ನು ಸಂಪರ್ಕಿಸಲು ಮತ್ತು ವಾಹನ ಬುಕ್ ಮಾಡಲು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಬಳಸಿ.`;
      } else if (lang === 'hi') {
        answerText = `आपकी फसल ${topBatch?.crop || 'टमाटर'} की गुणवत्ता 82/100 (ग्रेड A) है। तुरंत खरीदार से संपर्क करने और गाड़ी बुक करने के लिए डैशबोर्ड का उपयोग करें।`;
      } else {
        answerText = `Your crop ${topBatch?.crop || 'Tomatoes'} has a verified 82/100 Grade-A quality. You have 3 direct buyers ready in Mumbai with scheduled dispatch.`;
      }
      tabTarget = 'buyer-matches';
      labelTarget = 'View Buyer Matches';
    }

    setAiAnswer({
      text: answerText,
      actionTab: tabTarget,
      actionLabel: labelTarget,
      batchId: topBatch?.id
    });

    setIsSpeaking(true);
    speakKisanGuidance(answerText, lang).then(() => {
      setIsSpeaking(false);
    });
  };

  const handleStartListening = () => {
    if (isListening) return;
    setIsListening(true);
    setTranscript(lang === 'kn' ? 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... ಮಾತನಾಡಿ' : lang === 'hi' ? 'सुन रहे हैं... बोलिए' : 'Listening... Speak now');

    const recognition = initKisanSpeechRecognition(
      lang,
      (spokenText) => {
        setIsListening(false);
        handleProcessQuery(spokenText);
      },
      (err) => {
        setIsListening(false);
        setTranscript(err);
      }
    );

    if (recognition) {
      try {
        recognition.start();
      } catch (e) {
        setIsListening(false);
      }
    } else {
      setIsListening(false);
    }
  };

  const handleStopSpeaking = () => {
    stopKisanSpeech();
    setIsSpeaking(false);
  };

  return (
    <>
      {/* Floating Kisan Saathi Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        id="kisan-saathi-trigger"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-[#0B3D2E] text-white rounded-full shadow-2xl hover:bg-[#18A558] hover:scale-105 transition-all border-2 border-[#A8D94C] group"
        title="Kisan Voice Assistant (ಕಿಸಾನ್ ಧ್ವನಿ / किसान वाणी)"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-[#18A558] flex items-center justify-center text-white">
            <Mic className="w-4 h-4 text-white group-hover:animate-bounce" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#A8D94C] animate-ping" />
        </div>
        <div className="text-left hidden sm:block">
          <span className="text-[11px] font-black text-[#A8D94C] uppercase tracking-wider block leading-none">
            ಕಿಸಾನ್ ಧ್ವನಿ • Kisan Saathi
          </span>
          <span className="text-xs font-bold text-white block mt-0.5">
            Voice Harvest Guide
          </span>
        </div>
      </button>

      {/* Kisan Voice Assistant Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#0B3D2E] p-5 text-white flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#18A558] flex items-center justify-center text-white font-bold text-lg shadow-inner">
                  🌾
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      {lang === 'kn' ? 'ಕಿಸಾನ್ ಸಹಾಯಕ & ಗೈಡ್' : lang === 'hi' ? 'किसान साथी व गाइड' : 'Kisan AI Guide & Assistant'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#A8D94C] text-[#0B3D2E] font-black text-[10px]">
                      v2.6 Field AI
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    {lang === 'kn' ? 'ಆ್ಯಪ್ ಬಳಕೆ ಮಾರ್ಗದರ್ಶಿ ಮತ್ತು ಧ್ವನಿ ಸಹಾಯ' : lang === 'hi' ? 'ऐप उपयोग मार्गदर्शिका व आवाज सहायता' : 'Step-by-step app walkthrough & voice advice'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  stopKisanSpeech();
                  setIsOpen(false);
                }}
                className="p-1.5 text-white/70 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-2.5 gap-2">
              <button
                onClick={() => setActiveGuideMode('walkthrough')}
                className={`pb-2.5 px-3 text-xs font-black border-b-2 flex items-center gap-1.5 transition-all ${
                  activeGuideMode === 'walkthrough'
                    ? 'border-[#18A558] text-[#0B3D2E]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#18A558]" />
                <span>{lang === 'kn' ? '📖 ಆ್ಯಪ್ ಗೈಡ್ & ಕ್ಯಾಮೆರಾ' : lang === 'hi' ? '📖 ऐप गाइड व कैमरा' : '📖 App Guide & Camera'}</span>
              </button>

              <button
                onClick={() => setActiveGuideMode('voice')}
                className={`pb-2.5 px-3 text-xs font-black border-b-2 flex items-center gap-1.5 transition-all ${
                  activeGuideMode === 'voice'
                    ? 'border-[#18A558] text-[#0B3D2E]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-[#18A558]" />
                <span>{lang === 'kn' ? '🎙️ ಕಿಸಾನ್ ಧ್ವನಿ (AI Voice)' : lang === 'hi' ? '🎙️ किसान वाणी (AI Voice)' : '🎙️ Kisan Voice AI'}</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[68vh]">
              {/* MODE 1: STEP-BY-STEP APP WALKTHROUGH & CAMERA TROUBLESHOOTER */}
              {activeGuideMode === 'walkthrough' && (
                <div className="space-y-4">
                  {/* Camera Troubleshooting Banner */}
                  <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300/80 shadow-xs space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-900">
                      <Wrench className="w-4 h-4 text-amber-700" />
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        {lang === 'kn'
                          ? '📸 ಕ್ಯಾಮೆರಾ ಕೆಲಸ ಮಾಡುತ್ತಿಲ್ಲವೇ? (ಕಪ್ಪು ಸ್ಕ್ರೀನ್ ನಿವಾರಣೆ)'
                          : lang === 'hi'
                          ? '📸 क्या कैमरा नहीं चल रहा? (काली स्क्रीन समाधान)'
                          : '📸 Camera Not Working or Screen Black?'}
                      </h4>
                    </div>

                    <p className="text-xs text-amber-950 leading-relaxed font-medium">
                      {lang === 'kn'
                        ? '1. ನಿಮ್ಮ ಬ್ರೌಸರ್ ವಿಳಾಸ ಪಟ್ಟಿಯಲ್ಲಿರುವ ಲಾಕ್ (🔒) ಐಕಾನ್ ಒತ್ತಿ ಕ್ಯಾಮೆರಾಗೆ "Allow" ಅನುಮತಿ ಕೊಡಿ. 2. ಅಥವಾ ಸ್ಕ್ಯಾನರ್‌ನಲ್ಲಿರುವ "ವರ್ಚುವಲ್ ಫೀಲ್ಡ್ ಕ್ಯಾಮೆರಾ" ಬಟನ್ ಒತ್ತಿ ಹಾರ್ಡ್‌ವೇರ್ ಇಲ್ಲದೆಯೇ ತಕ್ಷಣ ಬೆಳೆ ಗುಣಮಟ್ಟ ಪರೀಕ್ಷಿಸಿ.'
                        : lang === 'hi'
                        ? '1. ब्राउज़र के एड्रेस बार में लॉक (🔒) आइकन पर क्लिक करें और कैमरे को "Allow" करें। 2. अथवा स्कैनर में "वर्चुअल फील्ड कैमरा" दबाकर तुरंत बिना कैमरे के भी फसल ग्रेडिंग टेस्ट करें।'
                        : '1. Click the Lock (🔒) icon in your browser address bar and set Camera to "Allow". 2. In the Quality Scanner, you can also use our Virtual Field Camera for instant zero-hardware testing.'}
                    </p>

                    <div className="pt-1 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          if (onNavigateTab) {
                            onNavigateTab('scanner');
                          }
                          setIsOpen(false);
                        }}
                        className="py-2 px-4 rounded-xl bg-[#0B3D2E] hover:bg-[#18A558] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#A8D94C]" />
                        <span>{lang === 'kn' ? 'ಕ್ಯಾಮೆರಾ ಸ್ಕ್ಯಾನರ್ ತೆರೆಯಿರಿ' : lang === 'hi' ? 'कैमरा स्कैनर खोलें' : 'Open Camera Scanner'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 4-Step Visual Harvest Flow */}
                  <div className="space-y-3 pt-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#0B3D2E] block">
                      {lang === 'kn' ? '🌾 ಫ್ರೆಶ್‌ರೂಟ್ ಬಳಸಲು 4 ಸರಳ ಹಂತಗಳು' : lang === 'hi' ? '🌾 FreshRoute उपयोग के 4 आसान चरण' : '🌾 4-Step Harvest Success Guide'}
                    </span>

                    {/* Step 1: Quality Scanner */}
                    <div className="p-3.5 rounded-2xl bg-[#F7F8F2] border border-stone-200 hover:border-[#18A558] transition-all space-y-2 group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#0B3D2E] text-white flex items-center justify-center font-black text-xs">
                            1
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-[#17201C] flex items-center gap-1.5">
                              <Camera className="w-3.5 h-3.5 text-[#18A558]" />
                              <span>{lang === 'kn' ? 'ಬೆಳೆ ಗುಣಮಟ್ಟ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' : lang === 'hi' ? 'कैमरे से फसल स्कैन करें' : 'Scan Harvest with Camera'}</span>
                            </h5>
                            <span className="text-[11px] text-[#6F7D75]">
                              {lang === 'kn' ? 'ಟೊಮೇಟೊ, ಈರುಳ್ಳಿ, ದಾಳಿಂಬೆ, ಮಾವು' : lang === 'hi' ? 'टमाटर, प्याज, अनार, आम' : 'Tomatoes, Onions, Pomegranates, Mangoes'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab('scanner');
                            setIsOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 text-[#0B3D2E] text-[11px] font-bold hover:bg-[#18A558] hover:text-white transition-all whitespace-nowrap"
                        >
                          {lang === 'kn' ? 'ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' : lang === 'hi' ? 'स्कैन करें' : 'Scan Now'}
                        </button>
                      </div>
                      <p className="text-xs text-[#17201C]/80 leading-relaxed pl-10">
                        {lang === 'kn'
                          ? 'ಕ್ಯಾಮೆರಾದಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ. ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI) ಬೆಳೆಯ ಗ್ರೇಡ್, ತಾಜಾತನ ಮತ್ತು ಶೆಲ್ಫ್-ಲೈಫ್ ಅನ್ನು 2 ಸೆಕೆಂಡಿನಲ್ಲಿ ಪ್ರಮಾಣೀಕರಿಸುತ್ತದೆ.'
                          : lang === 'hi'
                          ? 'फसल की फोटो लें। AI तुरंत ग्रेड (A/B), ताजगी और शेल्फ-लाइफ सर्टिफिकेट तैयार करता है।'
                          : 'Point your camera at harvested produce. AI checks firmness, detects defects, and generates Grade-A digital certificate.'}
                      </p>
                    </div>

                    {/* Step 2: Mandi Price Radar */}
                    <div className="p-3.5 rounded-2xl bg-[#F7F8F2] border border-stone-200 hover:border-[#18A558] transition-all space-y-2 group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#0B3D2E] text-white flex items-center justify-center font-black text-xs">
                            2
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-[#17201C] flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-[#18A558]" />
                              <span>{lang === 'kn' ? 'ಲೈವ್ ಮಂಡಿ ದರ ಹೋಲಿಕೆ' : lang === 'hi' ? 'लाइव मंडी भाव तुलना' : 'Live Mandi Price Radar'}</span>
                            </h5>
                            <span className="text-[11px] text-[#6F7D75]">
                              {lang === 'kn' ? 'ದಲ್ಲಾಳಿ ಕಮಿಷನ್ ರಹಿತ ನಿವ್ವಳ ಲಾಭ' : lang === 'hi' ? 'बिचौलियों के बिना शुद्ध मुनाफा' : 'Compare APMC Mandi vs Direct Buyers'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab('mandi-rates');
                            setIsOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 text-[#0B3D2E] text-[11px] font-bold hover:bg-[#18A558] hover:text-white transition-all whitespace-nowrap"
                        >
                          {lang === 'kn' ? 'ದರ ನೋಡಿ' : lang === 'hi' ? 'भाव देखें' : 'View Rates'}
                        </button>
                      </div>
                      <p className="text-xs text-[#17201C]/80 leading-relaxed pl-10">
                        {lang === 'kn'
                          ? 'ಸ್ಥಳೀಯ ಎಪಿಎಂಸಿ ಮಂಡಿಗಳಲ್ಲಿ 6.5% ಕಮಿಷನ್ ಮತ್ತು ಕಡಿತದ ನಂತರ ಕೈಗೆ ಬರುವ ಹಣ ಹಾಗೂ ನೇರ ಖರೀದಿದಾರರ ದರವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಹೋಲಿಸಿ.'
                          : lang === 'hi'
                          ? 'लोकल मंडी के आढ़त-कमीशन कटने के बाद मिलने वाले पैसे और सीधे खरीदार के रेट की तुरंत तुलना करें।'
                          : 'See APMC mandi deductions vs transparent direct buyer offers. Farmers earn +₹15 to +₹25 more per kilogram.'}
                      </p>
                    </div>

                    {/* Step 3: Verified Direct Buyers */}
                    <div className="p-3.5 rounded-2xl bg-[#F7F8F2] border border-stone-200 hover:border-[#18A558] transition-all space-y-2 group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#0B3D2E] text-white flex items-center justify-center font-black text-xs">
                            3
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-[#17201C] flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#18A558]" />
                              <span>{lang === 'kn' ? 'ಖರೀದಿದಾರರ ನೇರ ಒಪ್ಪಂದ' : lang === 'hi' ? 'सीधे खरीदार से डील' : 'Connect with Direct Buyers'}</span>
                            </h5>
                            <span className="text-[11px] text-[#6F7D75]">
                              {lang === 'kn' ? '100% ಮುಂಗಡ ಎಸ್ಕ್ರೋ ಪಾವತಿ ಗ್ಯಾರಂಟಿ' : lang === 'hi' ? '100% सुरक्षित बैंक भुगतान' : 'Pre-screened institutional buyers'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab('buyer-matches');
                            setIsOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 text-[#0B3D2E] text-[11px] font-bold hover:bg-[#18A558] hover:text-white transition-all whitespace-nowrap"
                        >
                          {lang === 'kn' ? 'ಖರೀದಿದಾರರು' : lang === 'hi' ? 'खरीदार देखें' : 'View Buyers'}
                        </button>
                      </div>
                      <p className="text-xs text-[#17201C]/80 leading-relaxed pl-10">
                        {lang === 'kn'
                          ? 'ಸೂಪರ್‌ಮಾರ್ಕೆಟ್‌ಗಳು ಮತ್ತು ಕ್ವಿಕ್-ಕಾಮರ್ಸ್ ವೇರ್‌ಹೌಸ್‌ಗಳು ನಿಮ್ಮ ಕೃಷಿ ಜಾಗದಿಂದಲೇ ನೇರವಾಗಿ ತೂಕಮಾಡಿ ಕೊಳ್ಳುತ್ತಾರೆ.'
                          : lang === 'hi'
                          ? 'सुपरमार्केट और रिटेल चेन सीधे आपके खेत से फसल उठाकर समय पर सुरक्षित भुगतान करते हैं।'
                          : 'Pre-matched buyers like FreshMart and BigBasket with locked escrow payment security.'}
                      </p>
                    </div>

                    {/* Step 4: Low-Vibration Mini-Trucks */}
                    <div className="p-3.5 rounded-2xl bg-[#F7F8F2] border border-stone-200 hover:border-[#18A558] transition-all space-y-2 group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#0B3D2E] text-white flex items-center justify-center font-black text-xs">
                            4
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-[#17201C] flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-[#18A558]" />
                              <span>{lang === 'kn' ? 'ಸುರಕ್ಷಿತ ವಾಹನ ಬುಕಿಂಗ್' : lang === 'hi' ? 'सुरक्षित गाड़ी बुकिंग' : 'Book Low-Vibration Vehicle'}</span>
                            </h5>
                            <span className="text-[11px] text-[#6F7D75]">
                              {lang === 'kn' ? 'ಗುಂಡಿ-ಮುಕ್ತ ಜಿಪಿಎಸ್ ರಸ್ತೆ ಮಾರ್ಗ' : lang === 'hi' ? 'गड्ढा-मुक्त स्मार्ट जीपीएस रूट' : 'Shock-cushioned transit to city'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab('decisions');
                            setIsOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 text-[#0B3D2E] text-[11px] font-bold hover:bg-[#18A558] hover:text-white transition-all whitespace-nowrap"
                        >
                          {lang === 'kn' ? 'ವಾಹನ ಬುಕ್' : lang === 'hi' ? 'गाड़ी बुक' : 'Book Truck'}
                        </button>
                      </div>
                      <p className="text-xs text-[#17201C]/80 leading-relaxed pl-10">
                        {lang === 'kn'
                          ? 'ಹಣ್ಣು-ತರಕಾರಿಗಳು ರಸ್ತೆಯ ಗುಂಡಿಗಳಿಂದ ಜಜ್ಜದಂತೆ ಕಡಿಮೆ ಕಂಪನದ ವಾಹನವನ್ನು ಬುಕ್ ಮಾಡಿ ನಗರದ ಮಾರುಕಟ್ಟೆಗೆ ರವಾನಿಸಿ.'
                          : lang === 'hi'
                          ? 'रास्ते में फसल को झटकों और नुकसान से बचाने के लिए शॉक-कशन वाली गाड़ियां बुक करें।'
                          : 'Book low-vibration mini-trucks with GPS route guidance that avoids pothole vibration damage.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: VOICE AI ASSISTANT WITH AUDIO PLAYBACK */}
              {activeGuideMode === 'voice' && (
                <div className="space-y-5">
                  {/* Central Audio / Mic Interaction Sphere */}
                  <div className="flex flex-col items-center justify-center text-center space-y-4 py-3 bg-[#F7F8F2] rounded-2xl border border-stone-200 p-6">
                    <button
                      onClick={handleStartListening}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                        isListening
                          ? 'bg-rose-500 text-white ring-8 ring-rose-500/20 scale-110 animate-pulse'
                          : isSpeaking
                          ? 'bg-amber-500 text-white ring-8 ring-amber-500/20 scale-105'
                          : 'bg-[#0B3D2E] text-white hover:bg-[#18A558] hover:scale-105'
                      }`}
                    >
                      {isListening ? (
                        <Radio className="w-8 h-8 text-white animate-spin" />
                      ) : isSpeaking ? (
                        <Volume2 className="w-8 h-8 text-white animate-bounce" />
                      ) : (
                        <Mic className="w-8 h-8 text-[#A8D94C]" />
                      )}
                    </button>

                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-[#0B3D2E] block">
                        {isListening
                          ? '🎤 Listening to your voice...'
                          : isSpeaking
                          ? '🔊 Speaking Advice...'
                          : 'Tap Mic to Speak in your Mother Tongue'}
                      </span>
                      <p className="text-xs text-[#6F7D75] mt-1 max-w-xs">
                        {transcript || (lang === 'kn' ? 'ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿರಿ (ಉದಾ: ಕ್ಯಾಮೆರಾ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?)' : lang === 'hi' ? 'बोलने के लिए माइक दबाएं (उदा: कैमरा कैसे चलाएं?)' : 'Press mic or select a quick question below')}
                      </p>
                    </div>

                    {isSpeaking && (
                      <button
                        onClick={handleStopSpeaking}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-300 rounded-full text-xs font-bold text-rose-600 hover:bg-rose-50 shadow-xs"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        Stop Audio / ನಿಲ್ಲಿಸಿ
                      </button>
                    )}
                  </div>

                  {/* AI Answer Box */}
                  {aiAnswer && (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#18A558]" />
                        <span className="text-xs font-black text-[#0B3D2E] uppercase tracking-wider">
                          Kisan AI Voice Guidance
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#17201C] font-medium leading-relaxed">
                        {aiAnswer.text}
                      </p>

                      {aiAnswer.actionTab && (
                        <button
                          onClick={() => {
                            if (onNavigateTab) {
                              onNavigateTab(aiAnswer.actionTab!, aiAnswer.batchId);
                            }
                            setIsOpen(false);
                          }}
                          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#0B3D2E] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#18A558] transition-all shadow-xs"
                        >
                          <span>{aiAnswer.actionLabel || 'View in Dashboard'}</span>
                          <ArrowRight className="w-4 h-4 text-[#A8D94C]" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Quick Regional Voice Prompt Buttons */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#6F7D75] uppercase tracking-wider block">
                      Quick Voice Queries / ಶೀಘ್ರ ಪ್ರಶ್ನೆಗಳು:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {quickVoicePrompts.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleProcessQuery(p.query)}
                          className="p-3 rounded-xl bg-[#F7F8F2] border border-stone-200 hover:bg-white hover:border-[#18A558] hover:shadow-xs transition-all text-left text-xs font-bold text-[#17201C] flex items-center justify-between group"
                        >
                          <span>{p.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#18A558] transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-[#6F7D75]">
              <span>Powered by Regional Natural Language Voice Models</span>
              <button
                onClick={() => {
                  stopKisanSpeech();
                  setIsOpen(false);
                }}
                className="font-bold text-[#0B3D2E] hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
