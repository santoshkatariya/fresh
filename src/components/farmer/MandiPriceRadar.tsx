import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Building2,
  Store,
  Truck,
  Sparkles,
  Volume2,
  Share2,
  RefreshCw,
  Info,
  Scale,
  Percent,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { MandiTickerBar } from '../reusable/MandiTickerBar';
import {
  COMMODITY_MARKET_REGISTRY,
  calculateRealTimePriceComparison,
  getMandiVoiceReport
} from '../../utils/marketRates';
import { RealTimePriceComparison, QualityGrade } from '../../types';
import { speakKisanGuidance } from '../../utils/kisanVoice';

interface MandiPriceRadarProps {
  initialCrop?: string;
  initialWeightKg?: number;
  initialQualityScore?: number;
  onBookDispatch?: (crop: string, rate: number) => void;
}

export const MandiPriceRadar: React.FC<MandiPriceRadarProps> = ({
  initialCrop = 'Tomatoes',
  initialWeightKg = 850,
  initialQualityScore = 82,
  onBookDispatch
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  // Selected filters
  const [selectedCrop, setSelectedCrop] = useState<string>(initialCrop);
  const [selectedWeightKg, setSelectedWeightKg] = useState<number>(initialWeightKg);
  const [selectedQualityScore, setSelectedQualityScore] = useState<number>(initialQualityScore);
  const [selectedMandiId, setSelectedMandiId] = useState<string>('');
  const [selectedTargetCity, setSelectedTargetCity] = useState<string>('Mumbai');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Computed live comparison state
  const [comparison, setComparison] = useState<RealTimePriceComparison>(() =>
    calculateRealTimePriceComparison({
      crop: selectedCrop,
      weightKg: selectedWeightKg,
      qualityScore: selectedQualityScore,
      qualityGrade: selectedQualityScore >= 80 ? 'A' : selectedQualityScore >= 65 ? 'B' : 'C',
      selectedMandiId: undefined,
      targetCity: selectedTargetCity,
    })
  );

  // Recompute comparison whenever filters change
  const refreshComparison = async () => {
    setIsRefreshing(true);
    try {
      // Attempt to query real-time server endpoint with Gemini intelligence
      const res = await fetch(
        `/api/market/prices?crop=${encodeURIComponent(selectedCrop)}&weightKg=${selectedWeightKg}&qualityScore=${selectedQualityScore}&qualityGrade=${selectedQualityScore >= 80 ? 'A' : 'B'}&mandiId=${encodeURIComponent(selectedMandiId)}&city=${encodeURIComponent(selectedTargetCity)}&language=${lang}`
      );
      if (res.ok) {
        const data = await res.json();
        // Recalculate local model with returned live server state
        const localComp = calculateRealTimePriceComparison({
          crop: selectedCrop,
          weightKg: selectedWeightKg,
          qualityScore: selectedQualityScore,
          qualityGrade: selectedQualityScore >= 80 ? 'A' : 'B',
          selectedMandiId: selectedMandiId || (data.mandi ? data.mandi.id : undefined),
          targetCity: selectedTargetCity,
        });

        if (data.aiMarketInsight) {
          localComp.aiPriceArbitrageInsight = data.aiMarketInsight;
        }
        setComparison(localComp);
      } else {
        // Fallback local calculation
        const localComp = calculateRealTimePriceComparison({
          crop: selectedCrop,
          weightKg: selectedWeightKg,
          qualityScore: selectedQualityScore,
          qualityGrade: selectedQualityScore >= 80 ? 'A' : 'B',
          selectedMandiId,
          targetCity: selectedTargetCity,
        });
        setComparison(localComp);
      }
    } catch (e) {
      const localComp = calculateRealTimePriceComparison({
        crop: selectedCrop,
        weightKg: selectedWeightKg,
        qualityScore: selectedQualityScore,
        qualityGrade: selectedQualityScore >= 80 ? 'A' : 'B',
        selectedMandiId,
        targetCity: selectedTargetCity,
      });
      setComparison(localComp);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    refreshComparison();
  }, [selectedCrop, selectedWeightKg, selectedQualityScore, selectedMandiId, selectedTargetCity, lang]);

  // Find active commodity details
  const activeCommodity =
    COMMODITY_MARKET_REGISTRY.find(
      (c) => c.crop.toLowerCase() === selectedCrop.toLowerCase() || selectedCrop.toLowerCase().includes(c.crop.toLowerCase())
    ) || COMMODITY_MARKET_REGISTRY[0];

  // Spoken voice guidance
  const handleListenVoice = () => {
    const report = getMandiVoiceReport(comparison, lang);
    speakKisanGuidance(report, lang);
  };

  // WhatsApp formatted share slip
  const handleShareWhatsApp = () => {
    const slip = `🌾 *FreshRoute AI - Real-Time Mandi vs Our Price Report* 🌾\n` +
      `📅 *Date:* ${new Date().toLocaleDateString('en-IN')}\n` +
      `📦 *Crop Lot:* ${comparison.crop} (${comparison.harvestLotWeightKg} KG)\n` +
      `⭐ *Quality Grade:* Grade ${comparison.qualityGrade} (${comparison.qualityScore}/100)\n\n` +
      `🏛️ *Local APMC Mandi (${comparison.selectedMandi.mandiName}):*\n` +
      `• Gross Modal Rate: ₹${comparison.selectedMandi.modalPricePerKg}/kg\n` +
      `• Trader Cut & Weighment Loss: -₹${(comparison.selectedMandi.modalPricePerKg - comparison.selectedMandi.netRealizedFarmerRate).toFixed(2)}/kg\n` +
      `• *Farmer Net Take-Home:* ₹${comparison.selectedMandi.netRealizedFarmerRate}/kg (Total: ₹${comparison.mandiEarningsForLot.toLocaleString('en-IN')})\n\n` +
      `🚀 *FreshRoute Farm Gate Direct Contract:*\n` +
      `• Direct Buyer Offer: ₹${comparison.freshRoutePrice.baseFarmGatePricePerKg}/kg\n` +
      `• Quality Bonus: +₹${comparison.freshRoutePrice.gradeBonusPerKg}/kg\n` +
      `• Middleman Commission: 0%\n` +
      `• *Farmer Net Take-Home:* ₹${comparison.freshRoutePrice.netRealizedFarmerRate}/kg (Total: ₹${comparison.freshRouteEarningsForLot.toLocaleString('en-IN')})\n\n` +
      `💰 *YOUR NET EXTRA PROFIT:* ₹${comparison.netExtraTakeHomeForLot.toLocaleString('en-IN')} (+${comparison.freshRoutePrice.percentageAdvantageVsMandi}%)\n` +
      `🏙️ *City Consumer Rate (${selectedTargetCity}):* ₹${comparison.cityRates.find(c => c.city === selectedTargetCity)?.averageRetailRatePerKg || 58}/kg\n\n` +
      `🔗 Track Live: https://freshroute.ai/mandi-rates`;

    navigator.clipboard.writeText(slip);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(slip)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="mandi-price-radar-root">
      {/* Top Live Ticker Banner */}
      <MandiTickerBar />

      {/* Header & Controls Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#0B3D2E] text-xs font-black flex items-center gap-1.5 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-[#18A558] animate-pulse" />
                {lang === 'kn' ? 'ಲೈವ್ ದರ ಹೋಲಿಕೆ' : lang === 'hi' ? 'लाइव भाव रडार' : 'Real-Time Price Radar'}
              </span>
              <span className="text-xs text-stone-500 font-mono">
                Agmarknet & APMC Feed Synced
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#17201C] mt-1.5">
              {lang === 'kn'
                ? 'ಮಂಡಿ ದರ vs ನಮ್ಮ ನೇರ ದರ vs ನಗರ ಚಿಲ್ಲರೆ ದರ'
                : lang === 'hi'
                ? 'मंडी भाव vs हमारा भाव vs शहर का खुदरा भाव'
                : 'Mandi Rate vs FreshRoute Price vs City Retail Rate'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6F7D75] mt-1 max-w-2xl">
              {lang === 'kn'
                ? 'ಸ್ಥಳೀಯ ಮಂಡಿಯ ದಲ್ಲಾಳಿ ಕಮಿಷನ್, ತೂಕದ ಕಡಿತ ಮತ್ತು ಸಾರಿಗೆ ನಷ್ಟಗಳನ್ನು ಲೆಕ್ಕಹಾಕಿ, ನೇರ ಖರೀದಿದಾರರೊಂದಿಗೆ ನಿಮ್ಮ ನಿವ್ವಳ ಲಾಭವನ್ನು ಪರಿಶೀಲಿಸಿ.'
                : lang === 'hi'
                ? 'स्थानीय मंडी की आढ़त, कटाई और परिवहन नुकसान की तुलना FreshRoute के सीधे खरीदार भाव और मुंबई/बेंगलुरु के खुदरा भाव से करें।'
                : 'Compare local APMC mandi deductions (commission, weighment cuts, transit bruising) against FreshRoute 0% commission farm gate price and city retail benchmarks.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleListenVoice}
              icon={<Volume2 className="w-4 h-4 text-amber-600" />}
              className="border-stone-200 text-stone-700 hover:bg-amber-50 hover:border-amber-300"
            >
              {lang === 'kn' ? 'ಧ್ವನಿ ಆಲಿಸಿ' : lang === 'hi' ? 'भाव सुनें' : 'Listen Voice'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShareWhatsApp}
              icon={<Share2 className="w-4 h-4 text-emerald-600" />}
              className="border-stone-200 text-stone-700 hover:bg-emerald-50 hover:border-emerald-300"
            >
              {copiedShare ? 'Copied Slip!' : 'Share WhatsApp'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={refreshComparison}
              disabled={isRefreshing}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            >
              {isRefreshing ? 'Syncing...' : 'Sync Live'}
            </Button>
          </div>
        </div>

        {/* Dynamic Selector Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-stone-100">
          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1.5">
              🌾 {lang === 'kn' ? 'ಬೆಳೆ ಆಯ್ಕೆ' : lang === 'hi' ? 'फसल चुनें' : 'Select Commodity'}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                setSelectedMandiId('');
              }}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-[#17201C] focus:outline-hidden focus:ring-2 focus:ring-[#18A558]"
            >
              {COMMODITY_MARKET_REGISTRY.map((c) => (
                <option key={c.crop} value={c.crop}>
                  {c.crop} ({c.variety})
                </option>
              ))}
            </select>
          </div>

          {/* Local Mandi Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1.5">
              🏛️ {lang === 'kn' ? 'ಹತ್ತಿರದ APMC ಮಂಡಿ' : lang === 'hi' ? 'निकटतम APMC मंडी' : 'Local APMC Mandi'}
            </label>
            <select
              value={selectedMandiId || activeCommodity.mandis[0].id}
              onChange={(e) => setSelectedMandiId(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-[#17201C] focus:outline-hidden focus:ring-2 focus:ring-[#18A558]"
            >
              {activeCommodity.mandis.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (₹{m.modalPrice}/kg)
                </option>
              ))}
            </select>
          </div>

          {/* Target City Benchmark */}
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1.5">
              🏙️ {lang === 'kn' ? 'ನಗರ ಮಾರುಕಟ್ಟೆ' : lang === 'hi' ? 'शहर का बाजार' : 'Target Consumer City'}
            </label>
            <select
              value={selectedTargetCity}
              onChange={(e) => setSelectedTargetCity(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-[#17201C] focus:outline-hidden focus:ring-2 focus:ring-[#18A558]"
            >
              {activeCommodity.cityBenchmarks.map((cb) => (
                <option key={cb.city} value={cb.city}>
                  {cb.city} ({cb.distanceKm} km)
                </option>
              ))}
            </select>
          </div>

          {/* Batch Weight Slider / Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-600">
                ⚖️ {lang === 'kn' ? 'ಕೊಯ್ಲು ಪ್ರಮಾಣ' : lang === 'hi' ? 'लॉट वजन' : 'Harvest Batch Size'}
              </label>
              <span className="text-xs font-mono font-black text-[#0B3D2E]">
                {selectedWeightKg.toLocaleString('en-IN')} KG
              </span>
            </div>
            <input
              type="range"
              min={200}
              max={5000}
              step={50}
              value={selectedWeightKg}
              onChange={(e) => setSelectedWeightKg(Number(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#18A558]"
            />
          </div>
        </div>
      </div>

      {/* 3-Way Core Price Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CARD 1: Traditional APMC Mandi Rate */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    Traditional APMC Gate
                  </span>
                  <h3 className="text-sm font-black text-[#17201C] line-clamp-1">
                    {comparison.selectedMandi.mandiName}
                  </h3>
                </div>
              </div>

              <span
                className={`text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                  comparison.selectedMandi.dailyChangePercent >= 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {comparison.selectedMandi.dailyChangePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {comparison.selectedMandi.dailyChangePercent > 0 ? `+${comparison.selectedMandi.dailyChangePercent}%` : `${comparison.selectedMandi.dailyChangePercent}%`}
              </span>
            </div>

            {/* Gross vs Realized */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Quoted Modal Price:</span>
                <span className="font-bold text-stone-900 line-through">₹{comparison.selectedMandi.modalPricePerKg}/kg</span>
              </div>

              <div className="flex items-baseline justify-between pt-1 border-t border-amber-200/60">
                <span className="text-xs font-bold text-amber-900">Farmer Net Take-Home:</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-950">₹{comparison.selectedMandi.netRealizedFarmerRate}</span>
                  <span className="text-xs font-bold text-stone-500"> / kg</span>
                </div>
              </div>
            </div>

            {/* Hidden Middleman Deductions Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600">
              <span className="text-[11px] font-bold text-rose-700 block uppercase tracking-wider">
                ⚠️ Hidden Mandi Deductions:
              </span>
              <div className="flex justify-between py-0.5 border-b border-stone-100">
                <span>• Trader Commission (6.5%):</span>
                <span className="font-mono text-rose-600 font-bold">-₹{(comparison.selectedMandi.modalPricePerKg * 0.065).toFixed(2)}/kg</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-stone-100">
                <span>• Weighment & Katla Fee:</span>
                <span className="font-mono text-rose-600 font-bold">-₹{comparison.selectedMandi.weighmentFeePerKg.toFixed(2)}/kg</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-stone-100">
                <span>• Unloading & Coolie:</span>
                <span className="font-mono text-rose-600 font-bold">-₹{comparison.selectedMandi.loadingFeePerKg.toFixed(2)}/kg</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>• Uncooled Rough Transit Loss (7.5%):</span>
                <span className="font-mono text-rose-600 font-bold">-₹{(comparison.selectedMandi.modalPricePerKg * 0.075).toFixed(2)}/kg</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500">Total Lot Realization:</span>
            <span className="font-black text-stone-900 text-sm">
              ₹{comparison.mandiEarningsForLot.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* CARD 2: FreshRoute Direct Farm Gate Contract Price (WINNER) */}
        <div className="bg-gradient-to-br from-[#0B3D2E] to-[#124d3b] text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden border-2 border-[#18A558]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#18A558]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#18A558] text-white flex items-center justify-center font-black">
                  FR
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                    0% Commission Direct Contract
                  </span>
                  <h3 className="text-sm font-black text-white">
                    FreshRoute Farm Gate Price
                  </h3>
                </div>
              </div>

              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#18A558] text-white flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3" />
                +{comparison.freshRoutePrice.percentageAdvantageVsMandi}% Boost
              </span>
            </div>

            {/* Net Rate Display */}
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-200">
                <span>Base Contract Rate:</span>
                <span className="font-bold text-white">₹{comparison.freshRoutePrice.baseFarmGatePricePerKg}/kg</span>
              </div>

              <div className="flex items-baseline justify-between pt-1 border-t border-emerald-800">
                <span className="text-xs font-bold text-emerald-200">Net Take-Home in Pocket:</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-[#A8D94C]">₹{comparison.freshRoutePrice.netRealizedFarmerRate}</span>
                  <span className="text-xs font-bold text-emerald-200"> / kg</span>
                </div>
              </div>
            </div>

            {/* Premium Incentives Breakdown */}
            <div className="space-y-1.5 text-xs text-emerald-100">
              <span className="text-[11px] font-bold text-emerald-300 block uppercase tracking-wider">
                ✨ Direct Advantages:
              </span>
              <div className="flex justify-between py-0.5 border-b border-emerald-800/60">
                <span>• Grade-A Quality Bonus:</span>
                <span className="font-mono text-[#A8D94C] font-bold">+₹{comparison.freshRoutePrice.gradeBonusPerKg.toFixed(2)}/kg</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-emerald-800/60">
                <span>• Pre-Cooling Transit Incentive:</span>
                <span className="font-mono text-[#A8D94C] font-bold">+₹{comparison.freshRoutePrice.preCoolingIncentivePerKg.toFixed(2)}/kg</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-emerald-800/60">
                <span>• Middleman Commission:</span>
                <span className="font-mono text-[#A8D94C] font-bold">0% (Zero Cut)</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>• Digital Escrow Payout:</span>
                <span className="font-mono text-white font-bold">Guaranteed 2 Hours</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-emerald-800 flex items-center justify-between text-xs relative z-10">
            <span className="text-emerald-200">Total Lot Realization:</span>
            <span className="font-black text-[#A8D94C] text-lg">
              ₹{comparison.freshRouteEarningsForLot.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* CARD 3: City Retail / Quick-Commerce Benchmark */}
        {(() => {
          const activeCityQuote =
            comparison.cityRates.find((c) => c.city === selectedTargetCity) || comparison.cityRates[0];

          return (
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                        City Consumer Benchmark
                      </span>
                      <h3 className="text-sm font-black text-[#17201C]">
                        {activeCityQuote.city} ({activeCityQuote.distanceFromFarmKm} km)
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Retail Market
                  </span>
                </div>

                {/* Consumer Retail Price */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span>Central DC Intake Rate:</span>
                    <span className="font-bold text-stone-900">₹{activeCityQuote.cityDcIntakeRatePerKg}/kg</span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1 border-t border-blue-200/60">
                    <span className="text-xs font-bold text-blue-900">Consumer Shelf Rate:</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-blue-950">₹{activeCityQuote.averageRetailRatePerKg}</span>
                      <span className="text-xs font-bold text-stone-500"> / kg</span>
                    </div>
                  </div>
                </div>

                {/* City Channel Breakdown */}
                <div className="space-y-1.5 text-xs text-stone-600">
                  <span className="text-[11px] font-bold text-blue-800 block uppercase tracking-wider">
                    🛒 City Channel Prices:
                  </span>
                  <div className="flex justify-between py-0.5 border-b border-stone-100">
                    <span>• Blinkit / Zepto Dark Stores:</span>
                    <span className="font-mono text-stone-900 font-bold">₹{activeCityQuote.quickCommerceRatePerKg}/kg</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-stone-100">
                    <span>• Supermarkets (Reliance / Nature's):</span>
                    <span className="font-mono text-stone-900 font-bold">₹{activeCityQuote.supermarketRatePerKg}/kg</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-stone-100">
                    <span>• Freight from Farm Gate:</span>
                    <span className="font-mono text-stone-500 font-bold">₹{activeCityQuote.estimatedFreightPerKg}/kg</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>• Consumer-Farm Price Spread:</span>
                    <span className="font-mono text-blue-700 font-bold">₹{activeCityQuote.consumerPriceSpread}/kg</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500">Target Demand Cluster:</span>
                <span className="font-bold text-stone-800 text-[11px] line-clamp-1">
                  {activeCityQuote.topBuyerCluster}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Net Extra Take-Home Profit Highlight Banner */}
      <div className="bg-emerald-50 border-2 border-[#18A558] rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#18A558]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#0B3D2E]">
              {lang === 'kn' ? 'ನಿವ್ವಳ ಲಾಭ ಹೆಚ್ಚಳ ಲೆಕ್ಕಾಚಾರ' : lang === 'hi' ? 'शुद्ध अतिरिक्त मुनाफा गणना' : 'Net Extra Farmer Take-Home Cash'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17201C]">
            {lang === 'kn' ? 'ಫ್ರೆಶ್‌ರೂಟ್ ಮೂಲಕ ಹೆಚ್ಚುವರಿ ಲಾಭ:' : lang === 'hi' ? 'FreshRoute पर सीधा अतिरिक्त लाभ:' : 'Extra Profit via FreshRoute Direct Sale:'}{' '}
            <span className="text-[#18A558]">
              +₹{comparison.netExtraTakeHomeForLot.toLocaleString('en-IN')}
            </span>
          </h2>
          <p className="text-xs text-stone-600 max-w-2xl">
            {lang === 'kn'
              ? `ಈ ${comparison.harvestLotWeightKg} ಕೆಜಿ ಬೆಳೆಯನ್ನು ಸಾಮಾನ್ಯ ಮಂಡಿಗೆ ಮಾರಾಟ ಮಾಡುವ ಬದಲು ಫ್ರೆಶ್‌ರೂಟ್ ನೇರ ಖರೀದಿದಾರರಿಗೆ ಮಾರಿದರೆ, ದಲ್ಲಾಳಿ ಕಮಿಷನ್ ಮತ್ತು ಸಾರಿಗೆ ನಷ್ಟ ತಪ್ಪಿಸಿ ₹${comparison.netExtraTakeHomeForLot.toLocaleString('en-IN')} ಹೆಚ್ಚಿನ ಹಣ ನಿಮ್ಮ ಕೈಸೇರುತ್ತದೆ.`
              : lang === 'hi'
              ? `इस ${comparison.harvestLotWeightKg} किलो उपज को स्थानीय मंडी के बजाय FreshRoute के सत्यापित खरीदार को बेचने पर बिचौलियों की ₹${comparison.middlemanCutExtractedForLot.toLocaleString('en-IN')} कटौती बचती है।`
              : `Bypassing traditional mandi deductions and transport bruising saves ₹${comparison.middlemanCutExtractedForLot.toLocaleString('en-IN')} in middlemen markups, giving you +₹${comparison.freshRoutePrice.priceAdvantageVsMandi}/kg extra net profit.`}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="success"
            size="lg"
            onClick={() => {
              if (onBookDispatch) {
                onBookDispatch(comparison.crop, comparison.freshRoutePrice.netRealizedFarmerRate);
              }
            }}
            icon={<ArrowRight className="w-4 h-4" />}
            className="bg-[#18A558] hover:bg-[#158f4c] text-white shadow-md font-black"
          >
            {lang === 'kn' ? 'ನೇರ ಮಾರಾಟ ಆರ್ಡರ್ ರಚಿಸಿ' : lang === 'hi' ? 'सीधा खरीदार ऑर्डर बुक करें' : 'Dispatch at ₹' + comparison.freshRoutePrice.netRealizedFarmerRate + '/kg'}
          </Button>
        </div>
      </div>

      {/* Visual Consumer Rupee Waterfall & Price Spread Distribution */}
      <Card className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-[#17201C] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#18A558]" />
              {lang === 'kn'
                ? 'ಗ್ರಾಹಕರ ರೂಪಾಯಿ ವಿತರಣೆ: ರೈತನ ಪಾಲು ಹೋಲಿಕೆ'
                : lang === 'hi'
                ? 'उपभोक्ता के ₹100 में किसान का हिस्सा'
                : 'Where Does the Consumer Rupee Go? (Farmer Share Breakdown)'}
            </h3>
            <p className="text-xs text-[#6F7D75]">
              Percentage of retail consumer spend received directly by the farmer.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
            Benchmark: {selectedTargetCity} Consumer Rate (₹{comparison.cityRates.find(c => c.city === selectedTargetCity)?.averageRetailRatePerKg || 58}/kg)
          </span>
        </div>

        {/* Comparison Stack Bars */}
        <div className="space-y-4">
          {/* 1. Traditional Mandi Supply Chain */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-stone-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Traditional APMC Mandi Chain
              </span>
              <span className="text-amber-800 font-black">
                Farmer Receives {comparison.farmerShareOfConsumerRupeeAtMandi}% of Consumer Price (₹{comparison.selectedMandi.netRealizedFarmerRate}/kg)
              </span>
            </div>

            <div className="h-7 w-full bg-stone-100 rounded-xl overflow-hidden flex text-[10px] font-black text-white shadow-inner">
              <div
                style={{ width: `${comparison.farmerShareOfConsumerRupeeAtMandi}%` }}
                className="bg-amber-600 flex items-center justify-center px-2"
                title="Farmer Take-Home"
              >
                Farmer ({comparison.farmerShareOfConsumerRupeeAtMandi}%)
              </div>
              <div
                style={{ width: '22%' }}
                className="bg-rose-500 flex items-center justify-center px-1"
                title="Mandi Commission & Trader Cut"
              >
                Trader (22%)
              </div>
              <div
                style={{ width: '18%' }}
                className="bg-stone-500 flex items-center justify-center px-1"
                title="Logistics & Handling"
              >
                Logistics (18%)
              </div>
              <div
                style={{ width: `${100 - comparison.farmerShareOfConsumerRupeeAtMandi - 40}%` }}
                className="bg-blue-600 flex items-center justify-center px-1"
                title="City Retailer Margin"
              >
                Retailer ({100 - comparison.farmerShareOfConsumerRupeeAtMandi - 40}%)
              </div>
            </div>
          </div>

          {/* 2. FreshRoute Direct-to-Buyer */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-stone-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#18A558]" />
                FreshRoute Direct Farm-Gate Supply Link
              </span>
              <span className="text-[#0B3D2E] font-black">
                Farmer Receives {comparison.farmerShareOfConsumerRupeeAtFreshRoute}% of Consumer Price (₹{comparison.freshRoutePrice.netRealizedFarmerRate}/kg)
              </span>
            </div>

            <div className="h-7 w-full bg-stone-100 rounded-xl overflow-hidden flex text-[10px] font-black text-white shadow-inner">
              <div
                style={{ width: `${comparison.farmerShareOfConsumerRupeeAtFreshRoute}%` }}
                className="bg-[#18A558] flex items-center justify-center px-2"
                title="Farmer Direct Take-Home"
              >
                Farmer Take-Home ({comparison.farmerShareOfConsumerRupeeAtFreshRoute}%)
              </div>
              <div
                style={{ width: '12%' }}
                className="bg-emerald-900 flex items-center justify-center px-1"
                title="Smart Chilled Logistics"
              >
                Cold Fleet (12%)
              </div>
              <div
                style={{ width: `${100 - comparison.farmerShareOfConsumerRupeeAtFreshRoute - 12}%` }}
                className="bg-blue-600 flex items-center justify-center px-1"
                title="Quick-Commerce Fulfillment"
              >
                DC Retail ({100 - comparison.farmerShareOfConsumerRupeeAtFreshRoute - 12}%)
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Real-Time City Arbitrage Comparison Matrix */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#17201C] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#18A558]" />
              {lang === 'kn'
                ? 'ನಗರವಾರು ದರ ಮತ್ತು ಸಾರಿಗೆ ಲಾಭ ಹೋಲಿಕೆ'
                : lang === 'hi'
                ? 'शहरवार भाव एवं परिवहन मुनाफा मैट्रिक्स'
                : 'Inter-City Price Arbitrage & Delivered Net Rate Matrix'}
            </h3>
            <p className="text-xs text-[#6F7D75]">
              Real-time delivery rates across major consumption hubs after subtracting freight and transit vibration loss.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-y border-stone-200 text-stone-600 font-bold">
                <th className="py-3 px-4">Destination City</th>
                <th className="py-3 px-3">Distance</th>
                <th className="py-3 px-3">Consumer Retail</th>
                <th className="py-3 px-3">Quick-Commerce (Blinkit)</th>
                <th className="py-3 px-3">Freight Cost</th>
                <th className="py-3 px-3">Net Delivered Realization</th>
                <th className="py-3 px-4 text-right">Advantage vs Mandi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {comparison.cityRates.map((c) => {
                const diffVsMandi = Number((c.netDeliveredRatePerKg - comparison.selectedMandi.netRealizedFarmerRate).toFixed(1));
                const isCurrent = c.city === selectedTargetCity;

                return (
                  <tr
                    key={c.city}
                    className={`hover:bg-stone-50 transition-colors ${
                      isCurrent ? 'bg-emerald-50/60 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#18A558]' : 'text-stone-400'}`} />
                        <span className="font-bold text-stone-900">{c.city}</span>
                        <span className="text-[10px] text-stone-500 font-mono">({c.state})</span>
                        {isCurrent && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#18A558] text-white">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-600">{c.distanceFromFarmKm} km</td>
                    <td className="py-3 px-3 font-black text-stone-900">₹{c.averageRetailRatePerKg}/kg</td>
                    <td className="py-3 px-3 font-mono text-blue-700 font-bold">₹{c.quickCommerceRatePerKg}/kg</td>
                    <td className="py-3 px-3 font-mono text-stone-500">-₹{c.estimatedFreightPerKg.toFixed(1)}/kg</td>
                    <td className="py-3 px-3">
                      <span className="font-black text-emerald-800 text-sm">
                        ₹{c.netDeliveredRatePerKg}/kg
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-black px-2 py-0.5 rounded-md ${
                          diffVsMandi >= 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {diffVsMandi >= 0 ? `+₹${diffVsMandi}/kg` : `₹${diffVsMandi}/kg`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Market Arbitrage Intelligence Box */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 sm:p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-amber-950">
              {lang === 'kn' ? 'AI ಮಾರುಕಟ್ಟೆ ಸಲಹೆಗಾರ' : lang === 'hi' ? 'AI बाजार बुद्धिमत्ता' : 'AI Real-Time Market Advisor'}
            </h4>
            <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
              Neural Market Reasoning
            </span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            {comparison.aiPriceArbitrageInsight}
          </p>
        </div>
      </div>
    </div>
  );
};
