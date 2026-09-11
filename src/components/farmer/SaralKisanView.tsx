import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tractor,
  TrendingUp,
  Truck,
  CheckCircle2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneCall,
  Share2,
  ScanLine,
  Scale,
  Package,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { ProduceBatch, Order, BuyerMatch } from '../../types';
import { getStoredBatches, getStoredOrders, getStoredBuyers, saveOrders } from '../../utils/storage';
import { getCurrentUser } from '../../utils/auth';
import {
  speakKisanGuidance,
  stopKisanSpeech,
  initKisanSpeechRecognition
} from '../../utils/kisanVoice';

interface SaralKisanViewProps {
  onSwitchToDetailed: () => void;
  onNavigateTab: (tab: string, batchId?: string) => void;
}

export const SaralKisanView: React.FC<SaralKisanViewProps> = ({
  onSwitchToDetailed,
  onNavigateTab
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const user = getCurrentUser();

  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedBatchIndex, setSelectedBatchIndex] = useState<number>(0);
  const [bookingSuccess, setBookingSuccess] = useState<Order | null>(null);
  const [isBooking, setIsBooking] = useState<boolean>(false);

  // Voice state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceReply, setVoiceReply] = useState<string | null>(null);

  useEffect(() => {
    const loadedBatches = getStoredBatches();
    const loadedOrders = getStoredOrders();
    setBatches(loadedBatches);
    setOrders(loadedOrders);
  }, []);

  const currentBatch: ProduceBatch | undefined = batches[selectedBatchIndex] || batches[0];

  // Financial calculations
  const mandiRateGross = currentBatch?.crop === 'Tomatoes' ? 21 : currentBatch?.crop === 'Onions' ? 18 : 24;
  const mandiDeductions = mandiRateGross * 0.22; // ~22% lost to dalal, loading, cuts, porter
  const mandiTakeHomePerKg = mandiRateGross - mandiDeductions;
  const mandiTotalTakeHome = Math.round(mandiTakeHomePerKg * (currentBatch?.quantityKg || 800));

  const directBuyerRate = currentBatch?.crop === 'Tomatoes' ? 34 : currentBatch?.crop === 'Onions' ? 28 : 38;
  const directTransportCostPerKg = 4.05;
  const directTakeHomePerKg = directBuyerRate - directTransportCostPerKg;
  const directTotalTakeHome = Math.round(directTakeHomePerKg * (currentBatch?.quantityKg || 800));

  const extraCashEarned = directTotalTakeHome - mandiTotalTakeHome;
  const profitPercentageIncrease = Math.round((extraCashEarned / mandiTotalTakeHome) * 100);

  // Handle instant one-click booking
  const handleConfirmSale = () => {
    if (!currentBatch) return;
    setIsBooking(true);

    setTimeout(() => {
      const newOrder: Order = {
        id: `FR-${Math.floor(10000 + Math.random() * 90000)}`,
        batchId: currentBatch.id,
        crop: currentBatch.crop,
        quantityKg: currentBatch.quantityKg,
        qualityScore: currentBatch.currentQualityScore,
        farmerId: user?.id || 'farmer-ramesh-01',
        farmerName: user?.name || 'Ramesh Patil',
        farmLocation: currentBatch.farmLocation,
        buyerId: 'buyer-freshmart-01',
        buyerName: 'FreshMart Quick-Commerce Hub',
        buyerLocation: 'Nashik Industrial Sector 4',
        distanceKm: 34,
        pricePerKg: directBuyerRate,
        totalValue: directBuyerRate * currentBatch.quantityKg,
        transportCost: Math.round(directTransportCostPerKg * currentBatch.quantityKg),
        netFarmerEarnings: directTotalTakeHome,
        selectedVehicle: 'Tata Ace EV',
        status: 'In Transit',
        estimatedTransitTime: '35 mins',
        createdAt: new Date().toISOString(),
        timeline: [
          {
            status: 'Requested',
            timestamp: new Date().toISOString(),
            description: 'Direct sale order placed by farmer',
            completed: true
          },
          {
            status: 'Accepted',
            timestamp: new Date().toISOString(),
            description: 'Buyer accepted and payment locked in escrow',
            completed: true
          },
          {
            status: 'In Transit',
            timestamp: new Date().toISOString(),
            description: 'Tata Ace EV dispatched to farm gate',
            completed: true
          }
        ]
      };

      const existingOrders = getStoredOrders();
      const updated = [newOrder, ...existingOrders];
      saveOrders(updated);
      setOrders(updated);
      setBookingSuccess(newOrder);
      setIsBooking(false);

      const successVoice =
        lang === 'kn'
          ? `ಅಭಿನಂದನೆಗಳು ರಮೇಶ್ ಅಣ್ಣಾ! ₹${directTotalTakeHome.toLocaleString('en-IN')} ಮಾರಾಟ ಖಚಿತವಾಗಿದೆ. ಟಾಟಾ ಏಸ್ ವಾಹನ 35 ನಿಮಿಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಹೊಲಕ್ಕೆ ತಲುಪಲಿದೆ.`
          : lang === 'hi'
          ? `बधाई हो रमेश जी! ₹${directTotalTakeHome.toLocaleString('en-IN')} की बिक्री पक्की हो गई है। टाटा ऐस वाहन 35 मिनट में आपके खेत पर पहुंच रहा है।`
          : `Congratulations! Your sale of ₹${directTotalTakeHome.toLocaleString('en-IN')} is locked. Tata Ace EV is arriving at your farm gate in 35 minutes.`;

      speakKisanGuidance(successVoice, lang);
    }, 900);
  };

  // Voice Interaction
  const handleVoiceTrigger = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = initKisanSpeechRecognition(
      lang,
      (transcript) => {
        setIsListening(false);
        processVoiceCommand(transcript);
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognition) {
      setIsListening(true);
      recognition.start();
    } else {
      // Fallback voice demo query
      processVoiceCommand('sell now');
    }
  };

  const processVoiceCommand = (cmd: string) => {
    let reply = '';
    const lower = (cmd || '').toLowerCase();

    if (lower.includes('camera') || lower.includes('ಕ್ಯಾಮೆರಾ') || lower.includes('कैमरा') || lower.includes('black') || lower.includes('screen')) {
      reply =
        lang === 'kn'
          ? `ಕ್ಯಾಮೆರಾ ತೆರೆಯಲು ಬ್ರೌಸರ್‌ನಲ್ಲಿ 'Allow' ಅನುಮತಿ ನೀಡಿ. ಅಥವಾ ಸ್ಕ್ಯಾನರ್‌ನಲ್ಲಿರುವ ವರ್ಚುವಲ್ ಕ್ಯಾಮೆರಾ ಬಳಸಿ. ಈಗ ಕ್ಯಾಮೆರಾ ತೆರೆಯಲಾಗುತ್ತಿದೆ.`
          : lang === 'hi'
          ? `कैमरा चालू करने के लिए ब्राउज़र में 'Allow' करें या वर्चुअल कैमरा चलाएं। अभी कैमरा खोला जा रहा है।`
          : `To fix camera, allow permissions in your browser or use our Virtual Field Camera. Opening scanner now.`;
      setTimeout(() => onNavigateTab('scanner'), 1500);
    } else if (lower.includes('mandi') || lower.includes('ದರ') || lower.includes('भाव') || lower.includes('rate')) {
      reply =
        lang === 'kn'
          ? `ಇಂದು ಮಂಡಿಯಲ್ಲಿ ಟೊಮೇಟೊ ಕೇವಲ ₹${mandiTakeHomePerKg.toFixed(1)}/ಕೆಜಿ ಸಿಗುತ್ತದೆ. ನಮ್ಮಲ್ಲಿ ನೇರ ಮಾರಾಟ ಮಾಡಿದರೆ ₹${directTakeHomePerKg.toFixed(1)}/ಕೆಜಿ ಸಿಗುತ್ತದೆ. ನಿಮಗೆ ₹${extraCashEarned.toLocaleString('en-IN')} ಹೆಚ್ಚು ಲಾಭ!`
          : lang === 'hi'
          ? `आज मंडी में टमाटर पर हाथ में केवल ₹${mandiTakeHomePerKg.toFixed(1)}/किग्रा मिलेगा। फ्रेश-रूट पर बेचने से ₹${directTakeHomePerKg.toFixed(1)}/किग्रा मिलेगा। आपको ₹${extraCashEarned.toLocaleString('en-IN')} का सीधा फायदा है!`
          : `Today Mandi gives only ₹${mandiTakeHomePerKg.toFixed(1)}/kg net. Selling direct via FreshRoute gives ₹${directTakeHomePerKg.toFixed(1)}/kg. You gain +₹${extraCashEarned.toLocaleString('en-IN')} extra cash!`;
    } else if (lower.includes('sell') || lower.includes('ಮಾರಿ') || lower.includes('बेच') || lower.includes('book')) {
      handleConfirmSale();
      return;
    } else {
      reply =
        lang === 'kn'
          ? `ರಮೇಶ್ ಅಣ್ಣಾ, ನಿಮ್ಮ ${currentBatch?.quantityKg} ಕೆಜಿ ${currentBatch?.crop} ಅತ್ಯುತ್ತಮ ಗುಣಮಟ್ಟದಲ್ಲಿದೆ. ನೇರವಾಗಿ ಮಾರಾಟ ಮಾಡಲು ಹಸಿರು ಬಟನ್ ಒತ್ತಿ!`
          : lang === 'hi'
          ? `रमेश जी, आपका ${currentBatch?.quantityKg} किलो ${currentBatch?.crop} उत्तम क्वालिटी का है। तुरंत बेचने के लिए हरा बटन दबाएं!`
          : `Ramesh ji, your ${currentBatch?.quantityKg}kg ${currentBatch?.crop} is Grade-A fresh. Tap the big green button to sell direct and lock ₹${directTotalTakeHome.toLocaleString('en-IN')}!`;
    }

    setVoiceReply(reply);
    setIsSpeaking(true);
    speakKisanGuidance(reply, lang).then(() => {
      setIsSpeaking(false);
    });
  };

  const handleShareWhatsApp = (order: Order) => {
    const text = encodeURIComponent(
      `🌾 *FreshRoute ಕಿಸಾನ್ ರಶೀದಿ (Farmer Receipt)*\n` +
      `ರೈತರು (Farmer): ${user?.name || 'Ramesh Patil'}\n` +
      `ಬೆಳೆ (Crop): ${currentBatch?.quantityKg} KG ${currentBatch?.crop}\n` +
      `ಗಳಿಕೆ (Direct Cash): ₹${order.netFarmerEarnings.toLocaleString('en-IN')}\n` +
      `ವಾಹನ (Vehicle): Tata Ace EV (Driver: Raju)\n` +
      `ಖಾತೆಗೆ ಜಮೆ (Bank Payout): SBI A/c ****4821 (Within 24 Hours)\n` +
      `ಆರ್ಡರ್ ಐಡಿ: #${order.id}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12" id="saral-kisan-portal">
      {/* Top Banner: Mode Indicator & Switch */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#0B3D2E] text-white flex items-center justify-center font-black shadow-md shadow-emerald-700/20">
            <Tractor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                {lang === 'kn' ? 'ಸರಳ ಕಿಸಾನ್ ಮೋಡ್' : lang === 'hi' ? 'सरल किसान मोड' : 'Saral Kisan Mode'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {lang === 'kn' ? 'ಹೊಲದ ಮೋಡ್' : lang === 'hi' ? 'खेत मोड' : 'Field Ready'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {lang === 'kn'
                ? 'ಸಂಕೀರ್ಣ ಚಾರ್ಟ್‌ಗಳಿಲ್ಲದೆ ಕೇವಲ 3 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ನೇರ ನಿರ್ಧಾರ'
                : lang === 'hi'
                ? 'बिना किसी उलझन के 3 सेकंड में सही फसल फैसला'
                : 'No complex graphs — instant cash & pickup decisions in 3 seconds'}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* WhatsApp Assistant Button */}
          <button
            id="btn-saral-whatsapp"
            onClick={() => onNavigateTab('whatsapp')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#075e54] hover:bg-[#064e46] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
          >
            <MessageSquare className="w-4 h-4 text-emerald-300" />
            <span>{lang === 'kn' ? 'WhatsApp ಕಿಸಾನ್ AI' : lang === 'hi' ? 'व्हाट्सएप किसान AI' : 'WhatsApp AI Assistant'}</span>
          </button>

          {/* Switch to Detailed FPO mode button */}
          <button
            onClick={onSwitchToDetailed}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-2 border border-stone-300 transition-all active:scale-[0.98]"
          >
            <Layers className="w-4 h-4 text-stone-600" />
            <span>{lang === 'kn' ? 'ವಿವರವಾದ ತಜ್ಞರ ಮೋಡ್ (Detailed FPO)' : lang === 'hi' ? 'विस्तृत FPO मोड' : 'Switch to Detailed FPO Mode'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Batch Selector (If farmer has multiple batches) */}
      {batches.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-stone-500 whitespace-nowrap pl-1">
            {lang === 'kn' ? 'ನಿಮ್ಮ ಬೆಳೆಗಳು:' : lang === 'hi' ? 'आपकी फसलें:' : 'Your Harvests:'}
          </span>
          {batches.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => setSelectedBatchIndex(idx)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                selectedBatchIndex === idx
                  ? 'bg-[#0B3D2E] text-white border-[#0B3D2E] shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {b.crop === 'Tomatoes' ? '🍅' : b.crop === 'Onions' ? '🧅' : '🍇'} {b.quantityKg} KG {b.crop}
            </button>
          ))}
        </div>
      )}

      {/* Main Harvest & Cash Comparison Card */}
      {currentBatch && (
        <div className="bg-white rounded-3xl border-2 border-emerald-600/30 p-5 sm:p-7 shadow-xl shadow-emerald-950/5 space-y-6">
          {/* Produce Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
            <div className="flex items-center gap-4">
              <img
                src={currentBatch.imageUrl}
                alt={currentBatch.crop}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-sm border border-stone-200"
              />
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 block">
                  {lang === 'kn' ? 'ಇಂದಿನ ಸಿದ್ಧ ಬೆಳೆ' : lang === 'hi' ? 'आज की तैयार फसल' : 'Harvest Ready in Field'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  {currentBatch.quantityKg} KG {currentBatch.crop}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                  {currentBatch.variety} • {currentBatch.farmLocation.split(',')[0]}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'kn' ? 'ಗ್ರೇಡ್-ಎ ತಾಜಾ (Grade A)' : lang === 'hi' ? 'ग्रेड-ए ताजा' : 'Grade-A Peak Fresh'}</span>
              </span>
              <span className="text-xs text-stone-500 font-semibold">
                {lang === 'kn' ? 'ಇನ್ನೂ 4 ದಿನ ಬಾಳಿಕೆ ಬರುತ್ತದೆ' : lang === 'hi' ? '4 दिन तक ताजा रहेगा' : 'Good for ~4 more days'}
              </span>
            </div>
          </div>

          {/* THE 3-SECOND FINANCIAL TRUTH COMPARISON */}
          <div className="space-y-3">
            <div className="text-center sm:text-left">
              <span className="text-xs font-black uppercase tracking-widest text-stone-400">
                {lang === 'kn' ? 'ನಿಮ್ಮ ಕೈಗೆ ಬರುವ ನಿವ್ವಳ ನಗದು ಹೋಲಿಕೆ' : lang === 'hi' ? 'आपके हाथ में आने वाला शुद्ध पैसा' : 'WHERE DO YOU GET MAXIMUM CASH IN HAND?'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* MANDI CARD */}
              <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-stone-600 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-stone-500" />
                    <span>{lang === 'kn' ? 'ಸ್ಥಳೀಯ APMC ಮಂಡಿ' : lang === 'hi' ? 'स्थानीय APMC मंडी' : 'Local APMC Mandi'}</span>
                  </span>
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                    {lang === 'kn' ? 'ದಲ್ಲಾಳಿ ಕಡಿತ' : lang === 'hi' ? 'दलाली व कट' : 'Middleman Deductions'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-stone-500 block">
                    {lang === 'kn' ? 'ಕೈಗೆ ಬರುವ ನಿವ್ವಳ ದರ:' : lang === 'hi' ? 'हाथ में मिलने वाला भाव:' : 'Net cash rate in hand:'}
                  </span>
                  <div className="text-xl font-bold text-stone-700">
                    ₹{mandiTakeHomePerKg.toFixed(1)} <span className="text-xs font-normal text-stone-500">/ kg</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200">
                  <span className="text-xs text-stone-500 block">
                    {lang === 'kn' ? 'ಒಟ್ಟು ನಗದು ಆದಾಯ:' : lang === 'hi' ? 'कुल हाथ में आने वाली रकम:' : 'Total Mandi Take-Home:'}
                  </span>
                  <div className="text-2xl font-black text-stone-800">
                    ₹{mandiTotalTakeHome.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    {lang === 'kn' ? '7-14 ದಿನಗಳ ಸಾಲದ ಚೀಟಿ' : lang === 'hi' ? '7-14 दिन की पर्ची' : 'Payment on 7-14 days credit voucher'}
                  </span>
                </div>
              </div>

              {/* FRESHROUTE DIRECT BUYER CARD */}
              <div className="bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-lime-50 rounded-2xl p-4 sm:p-5 border-2 border-emerald-500 shadow-md shadow-emerald-500/10 space-y-3 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {lang === 'kn' ? 'ಹೆಚ್ಚು ಲಾಭ' : lang === 'hi' ? 'अधिक मुनाफा' : 'Best Choice'}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-700" />
                    <span>{lang === 'kn' ? 'ನೇರ ಖರೀದಿ (FreshMart)' : lang === 'hi' ? 'सीधी खरीद (FreshMart)' : 'Direct Buyer (FreshMart)'}</span>
                  </span>
                </div>

                <div>
                  <span className="text-xs text-emerald-800 block">
                    {lang === 'kn' ? 'ಕೈಗೆ ಬರುವ ನಿವ್ವಳ ದರ:' : lang === 'hi' ? 'हाथ में मिलने वाला भाव:' : 'Net cash rate in hand:'}
                  </span>
                  <div className="text-xl font-black text-emerald-900">
                    ₹{directTakeHomePerKg.toFixed(1)} <span className="text-xs font-bold text-emerald-700">/ kg</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-300">
                  <span className="text-xs text-emerald-800 block">
                    {lang === 'kn' ? 'ಒಟ್ಟು ನಗದು ಆದಾಯ:' : lang === 'hi' ? 'कुल हाथ में आने वाली रकम:' : 'Total Direct Take-Home:'}
                  </span>
                  <div className="text-3xl font-black text-emerald-900">
                    ₹{directTotalTakeHome.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
                    {lang === 'kn' ? '24 ಗಂಟೆಗಳಲ್ಲಿ ನೇರ ಬ್ಯಾಂಕ್ ಜಮೆ' : lang === 'hi' ? '24 घंटे में सीधे बैंक खाते में' : 'Guaranteed bank transfer in 24 hours'}
                  </span>
                </div>
              </div>
            </div>

            {/* EXTRA PROFIT BANNER */}
            <div className="bg-gradient-to-r from-[#0B3D2E] via-emerald-800 to-[#062016] text-white p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="space-y-0.5">
                <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider block">
                  {lang === 'kn' ? 'ನಿಮಗೆ ಸಿಗುವ ಹೆಚ್ಚುವರಿ ನಗದು ಲಾಭ:' : lang === 'hi' ? 'आपको मिलने वाला अतिरिक्त नकद मुनाफा:' : 'Your Direct Extra Profit Today:'}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-lime-400 tracking-tight">
                  +₹{extraCashEarned.toLocaleString('en-IN')} EXTRA CASH ({profitPercentageIncrease}% More!)
                </div>
              </div>

              <span className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-emerald-100 whitespace-nowrap">
                {lang === 'kn' ? 'ಮಂಡಿಗಿಂತ ದುಪ್ಪಟ್ಟು ಆದಾಯ' : lang === 'hi' ? 'मंडी से लगभग दोगुना' : '83% Higher than Mandi'}
              </span>
            </div>

            {/* PRE-ORDER RISK PROTECTION BREAKDOWN (BULK 5-DAY LOCK VS HOUSEHOLD BUFFER) */}
            <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <h4 className="text-sm font-black text-amber-950">
                    {lang === 'kn' ? '🛡️ ಮುಂಗಡ ಆರ್ಡರ್ ರಕ್ಷಣೆ (Pre-Order Protection)' : lang === 'hi' ? '🛡️ अग्रिम आर्डर सुरक्षा (फसल नुकसान से बचाव)' : '🛡️ Pre-Order Harvest Protection (Demand Breakdown)'}
                  </h4>
                </div>
                <span className="text-[11px] font-bold bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-md">
                  {lang === 'kn' ? 'ಹೊಟೇಲ್ & ಮನೆಗಳ ಬೇಡಿಕೆ' : lang === 'hi' ? 'होटल और घरेलू मांग' : 'Hotel & Household Split'}
                </span>
              </div>

              <p className="text-xs text-amber-900/90 leading-relaxed">
                {lang === 'kn'
                  ? 'ನಿಮ್ಮ ಫಸಲಿನಲ್ಲಿ ೬೫% ಹೊಟೇಲ್ (ಗ್ರಾಂಡ್ ರೆಸಿಡೆನ್ಸಿ) ಮುಂಗಡ ಬುಕ್ ಆಗಿದೆ. ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ರದ್ದುಗೊಳಿಸಿದರೆ ೨೫% ಪರಿಹಾರ ನಿಮಗೆ ಸಿಗುತ್ತದೆ. ಮನೆಗಳ ಆರ್ಡರ್‌ಗೆ ೮% ರಕ್ಷಣಾ ಬಫರ್ ಇಡಲಾಗಿದೆ.'
                  : lang === 'hi'
                  ? 'आपकी फसल का 65% हिस्सा होटल और रेस्टोरेंट ने पक्का बुक किया है (5 दिन पहले लॉक, रद्द करने पर 25% हर्जाना)। बाकी 35% घरेलू मांग के लिए 8% सुरक्षा बफर रखा गया है।'
                  : '65% of your harvest is locked by Hotels & Restaurants (5-day strict cutoff; 25% compensation penalty protects you if cancelled). Household orders have an automatic 8% safety buffer to prevent unsold crop.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-white/90 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
                  <span className="text-amber-900 font-bold">🏢 Hotel Grand Standing Order:</span>
                  <span className="font-black text-amber-950 font-mono">80 KG/wk (₹1,960) • 25% Locked</span>
                </div>
                <div className="bg-white/90 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
                  <span className="text-amber-900 font-bold">🏡 Household Collective:</span>
                  <span className="font-black text-emerald-800 font-mono">140 KG • 8% Safe Buffer</span>
                </div>
              </div>
            </div>
          </div>

          {/* ONE GIANT ACTION BUTTON */}
          <div className="pt-2">
            <button
              onClick={handleConfirmSale}
              disabled={isBooking}
              className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-[#18A558] via-emerald-600 to-[#0B3D2E] hover:from-emerald-500 hover:to-emerald-700 text-white font-black text-base sm:text-lg shadow-xl shadow-emerald-700/25 flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <Truck className="w-6 h-6 shrink-0" />
              <span>
                {isBooking
                  ? (lang === 'kn' ? 'ವಾಹನ ಬುಕ್ ಆಗುತ್ತಿದೆ...' : lang === 'hi' ? 'वाहन बुक हो रहा है...' : 'Booking Vehicle & Locking Cash...')
                  : (lang === 'kn'
                      ? `ಈಗಲೇ ಮಾರಾಟ ಖಚಿತಪಡಿಸಿ & ವಾಹನ ಬುಕ್ ಮಾಡಿ (₹${directTotalTakeHome.toLocaleString('en-IN')})`
                      : lang === 'hi'
                      ? `अभी बिक्री पक्की करें और वाहन बुक करें (₹${directTotalTakeHome.toLocaleString('en-IN')})`
                      : `CONFIRM SALE & BOOK VEHICLE NOW (₹${directTotalTakeHome.toLocaleString('en-IN')})`)}
              </span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* BOOKING SUCCESS MODAL / CARD */}
      <AnimatePresence>
        {bookingSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-emerald-900 text-white p-6 sm:p-7 rounded-3xl shadow-2xl border-2 border-emerald-400 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-lime-400 text-emerald-950 flex items-center justify-center font-black">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-white">
                    {lang === 'kn' ? 'ವಾಹನ ಯಶಸ್ವಿಯಾಗಿ ಬುಕ್ ಆಗಿದೆ!' : lang === 'hi' ? 'गाड़ी सफलतापूर्वक बुक हो गई!' : 'Pickup Vehicle Booked Successfully!'}
                  </h4>
                  <p className="text-xs text-emerald-200">
                    {lang === 'kn' ? `ಆರ್ಡರ್ #${bookingSuccess.id} • ಹಣ ಬ್ಯಾಂಕಿಗೆ ಜಮೆಯಾಗಲಿದೆ` : lang === 'hi' ? `ऑर्डर #${bookingSuccess.id} • भुगतान सुरक्षित` : `Order #${bookingSuccess.id} • Cash Guaranteed`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBookingSuccess(null)}
                className="text-white/60 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/25 p-4 rounded-2xl border border-white/10 text-xs">
              <div>
                <span className="text-emerald-300 font-bold block">{lang === 'kn' ? 'ವಾಹನ ವಿವರ' : lang === 'hi' ? 'वाहन विवरण' : 'Assigned Vehicle'}</span>
                <span className="text-white font-black text-sm">Tata Ace EV</span>
                <span className="text-emerald-200/80 block mt-0.5">Driver: Raju (+91 98450 12345)</span>
              </div>
              <div>
                <span className="text-emerald-300 font-bold block">{lang === 'kn' ? 'ತಲುಪುವ ಸಮಯ' : lang === 'hi' ? 'पहुंचने का समय' : 'Estimated Arrival'}</span>
                <span className="text-white font-black text-sm">~35 Minutes</span>
                <span className="text-emerald-200/80 block mt-0.5">Pickup Code: 4829</span>
              </div>
              <div>
                <span className="text-emerald-300 font-bold block">{lang === 'kn' ? 'ಖಾತೆಗೆ ಜಮೆ' : lang === 'hi' ? 'बैंक खाता' : 'Bank Payout'}</span>
                <span className="text-lime-300 font-black text-sm">₹{bookingSuccess.netFarmerEarnings.toLocaleString('en-IN')}</span>
                <span className="text-emerald-200/80 block mt-0.5">SBI A/c ****4821</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => handleShareWhatsApp(bookingSuccess)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <Share2 className="w-4 h-4" />
                <span>{lang === 'kn' ? 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ರಸೀದಿ ಕಳುಹಿಸಿ' : lang === 'hi' ? 'व्हाट्सएप पर रसीद भेजें' : 'Share WhatsApp Receipt'}</span>
              </button>
              <button
                onClick={() => onNavigateTab('smart-routes')}
                className="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/20"
              >
                <span>{lang === 'kn' ? 'ಲೈವ್ ವಾಹನ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : lang === 'hi' ? 'लाइव गाड़ी ट्रैक करें' : 'Track Live Vehicle'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BIG PROMINENT VOICE ASSISTANT MIC */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-stone-900">
                {lang === 'kn' ? 'ಕಿಸಾನ್ ಧ್ವನಿ ಸಹಾಯಕ (Voice Assistant)' : lang === 'hi' ? 'किसान आवाज सहायक' : 'Kisan Voice Assistant'}
              </h4>
              <p className="text-xs text-stone-500">
                {lang === 'kn' ? 'ಟೈಪ್ ಮಾಡುವ ಅಗತ್ಯವಿಲ್ಲ • ಮಾತನಾಡಿ ಸಾಕು' : lang === 'hi' ? 'लिखने की जरूरत नहीं • बोलिए और जवाब सुनिए' : 'No typing needed • Just speak in your language'}
              </p>
            </div>
          </div>

          <button
            onClick={handleVoiceTrigger}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40 scale-105'
                : 'bg-[#18A558] hover:bg-emerald-600 text-white shadow-emerald-600/30'
            }`}
            title="Tap to speak"
          >
            {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </button>
        </div>

        {/* Voice suggestions */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => processVoiceCommand('camera help')}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all text-left"
          >
            {lang === 'kn' ? '📸 ಕ್ಯಾಮೆರಾ ಸಹಾಯ / ಕಪ್ಪು ಸ್ಕ್ರೀನ್' : lang === 'hi' ? '📸 कैमरा मदद / ब्लैक स्क्रीन' : '📸 Camera Help & Test'}
          </button>
          <button
            onClick={() => processVoiceCommand('mandi rate')}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-all text-left"
          >
            {lang === 'kn' ? '🏛️ ಮಂಡಿ vs ನಮ್ಮ ದರ ಎಷ್ಟು?' : lang === 'hi' ? '🏛️ मंडी vs हमारा भाव क्या है?' : '🏛️ Mandi vs Our Rate?'}
          </button>
          <button
            onClick={() => processVoiceCommand('sell now')}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-all text-left"
          >
            {lang === 'kn' ? '🌾 ಈಗಲೇ ಮಾರಾಟ ಮಾಡಬೇಕಾ?' : lang === 'hi' ? '🌾 क्या अभी बेचना चाहिए?' : '🌾 Sell now or wait?'}
          </button>
          <button
            onClick={() => processVoiceCommand('vehicle arrival')}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-all text-left"
          >
            {lang === 'kn' ? '🚚 ವಾಹನ ಯಾವಾಗ ಬರುತ್ತದೆ?' : lang === 'hi' ? '🚚 गाड़ी कब आएगी?' : '🚚 When does vehicle arrive?'}
          </button>
        </div>

        {voiceReply && (
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 flex items-start gap-2.5">
            <Volume2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{voiceReply}</p>
          </div>
        )}
      </div>

      {/* 3 BIG FIELD SHORTCUTS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigateTab('scanner')}
          className="bg-white p-5 rounded-3xl border border-stone-200 hover:border-emerald-500 hover:shadow-md transition-all text-left space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-sm font-black text-stone-900 group-hover:text-emerald-700">
              {lang === 'kn' ? 'ಕ್ಯಾಮೆರಾದಿಂದ ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' : lang === 'hi' ? 'कैमरे से फसल जांचें' : 'Scan Crop with Camera'}
            </h5>
            <p className="text-xs text-stone-500 mt-0.5">
              {lang === 'kn' ? 'ಫೋಟೋ ತೆಗೆದು ಗುಣಮಟ್ಟ ತಿಳಿಯಿರಿ' : lang === 'hi' ? 'फोटो खींचकर क्वालिटी पता करें' : 'Take a photo for instant grade'}
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('mandi-rates')}
          className="bg-white p-5 rounded-3xl border border-stone-200 hover:border-emerald-500 hover:shadow-md transition-all text-left space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-sm font-black text-stone-900 group-hover:text-emerald-700">
              {lang === 'kn' ? 'ಇಂದಿನ ಮಂಡಿ ದರ ಪಟ್ಟಿ' : lang === 'hi' ? 'आज के मंडी भाव' : "Today's Mandi Rates"}
            </h5>
            <p className="text-xs text-stone-500 mt-0.5">
              {lang === 'kn' ? 'ನಾಸಿಕ್, ಪಿಂಪಳಗಾವ್, ಲಾಸಲಗಾಂವ್' : lang === 'hi' ? 'नासिक, लासलगांव, पिंपलगांव' : 'Nashik, Pimpalgaon, Lasalgaon'}
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-5 rounded-3xl border border-stone-200 hover:border-emerald-500 hover:shadow-md transition-all text-left space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-sm font-black text-stone-900 group-hover:text-emerald-700">
              {lang === 'kn' ? 'ನನ್ನ ಮಾರಾಟ & ಖಾತೆ ಹಣ' : lang === 'hi' ? 'मेरी बिक्री और कमाई' : 'My Sold Batches & Cash'}
            </h5>
            <p className="text-xs text-stone-500 mt-0.5">
              {lang === 'kn' ? `${orders.length} ಪೂರ್ಣಗೊಂಡ ಆರ್ಡರ್‌ಗಳು` : lang === 'hi' ? `${orders.length} पूरे हुए आर्डर` : `${orders.length} active/completed orders`}
            </p>
          </div>
        </button>
      </div>

      {/* Reassurance Footer */}
      <div className="text-center pt-2">
        <button
          onClick={onSwitchToDetailed}
          className="text-xs text-stone-500 hover:text-stone-800 font-semibold inline-flex items-center gap-1.5 underline underline-offset-4"
        >
          <span>{lang === 'kn' ? 'ಸೆನ್ಸಾರ್ ಗ್ರಾಫ್‌ಗಳು ಮತ್ತು ಐಒಟಿ ವಿವರಗಳನ್ನು ನೋಡಬೇಕೆ? ತಜ್ಞರ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ' : lang === 'hi' ? 'विस्तृत सेंसर ग्राफ और रूट मैप देखना चाहते हैं? FPO मोड पर जाएं' : 'Need IoT sensor graphs, vibration logs, and route maps? Switch to Detailed FPO Mode'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
