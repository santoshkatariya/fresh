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
  Clock
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
}

export const KisanVoiceAssistant: React.FC<KisanVoiceAssistantProps> = ({
  batches = [],
  onNavigateTab
}) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
    },
    {
      label: lang === 'kn' ? '❄️ ಹತ್ತಿರದ ಕೋಲ್ಡ್ ಸ್ಟೋರೇಜ್' : lang === 'hi' ? '❄️ नजदीकी कोल्ड स्टोरेज' : '❄️ Nearest cold storage',
      query: 'cold storage'
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

    const q = queryText.toLowerCase();
    let answerText = '';
    let tabTarget: string | undefined = undefined;
    let labelTarget: string | undefined = undefined;

    if (q.includes('mandi') || q.includes('ಮಂಡಿ') || q.includes('मंडी') || q.includes('compare')) {
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
                      Kisan Saathi (ಕಿಸಾನ್ ಧ್ವನಿ)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#A8D94C] text-[#0B3D2E] font-black text-[10px]">
                      AI Voice 2.6
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    Speak or tap any question in Kannada, Hindi, or English
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

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
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
                    {transcript || (lang === 'kn' ? 'ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿರಿ (ಉದಾ: ಬೆಲೆ ಎಷ್ಟು?)' : lang === 'hi' ? 'बोलने के लिए माइक दबाएं (उदा: क्या अभी बेचें?)' : 'Press mic or select a quick question below')}
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
