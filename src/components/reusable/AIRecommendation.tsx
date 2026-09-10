import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Truck,
  Store,
  Volume2,
  VolumeX,
  Share2,
  PhoneCall
} from 'lucide-react';
import { ProduceBatch, DecisionOption, VehicleOption, BuyerMatch } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { speakKisanGuidance, stopKisanSpeech, generateBatchVoiceAdvice } from '../../utils/kisanVoice';

interface AIRecommendationProps {
  batch: ProduceBatch;
  bestDecision: DecisionOption;
  bestVehicle?: VehicleOption;
  matchedBuyer?: BuyerMatch;
  onConfirmAction?: () => void;
}

export const AIRecommendation: React.FC<AIRecommendationProps> = ({
  batch,
  bestDecision,
  bestVehicle,
  matchedBuyer,
  onConfirmAction
}) => {
  const { t, i18n } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const lang = i18n.language;

  const handleVoiceAdvice = () => {
    if (isSpeaking) {
      stopKisanSpeech();
      setIsSpeaking(false);
      return;
    }

    const advice = generateBatchVoiceAdvice(
      batch.crop,
      batch.quantityKg,
      bestDecision.title,
      matchedBuyer?.companyName || 'FreshMart DC',
      bestDecision.expectedNetProfit,
      lang
    );

    setIsSpeaking(true);
    speakKisanGuidance(advice, lang).then(() => {
      setIsSpeaking(false);
    });
  };

  const handleWhatsAppShare = () => {
    const text = `🌾 *FreshRoute AI Harvest Recommendation*\n*Batch:* ${batch.crop} (${batch.quantityKg} KG)\n*Action:* ${bestDecision.title}\n*Buyer:* ${matchedBuyer?.companyName || 'FreshMart DC'}\n*Expected Net Take-Home:* ₹${bestDecision.expectedNetProfit.toLocaleString('en-IN')}\n*Recommended Vehicle:* ${bestVehicle?.vehicle.name || 'Mini Pickup (Tata Ace)'}\n*Transport Route:* NH-60 Agro Corridor (0% transit spoilage)\n*Track Online:* https://freshroute.ai/batch/${batch.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Card
      id="main-ai-decision-center"
      padding="none"
      className="bg-white border-2 border-[#18A558]/40 text-[#17201C] shadow-lg overflow-hidden relative rounded-3xl"
    >
      {/* Top Banner Header */}
      <div className="bg-[#0B3D2E] text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-black tracking-wider uppercase">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#A8D94C] animate-ping" />
          <Sparkles className="w-4 h-4 text-[#A8D94C]" />
          <span>FreshRoute AI • Maximum Realized Profit Engine</span>
        </div>

        {/* Farmer Voice & Share Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleVoiceAdvice}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
              isSpeaking
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-[#18A558] text-white hover:bg-[#158f4c]'
            }`}
            title="Listen to advice in your language"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#A8D94C]" />}
            <span>{isSpeaking ? 'Speaking...' : 'ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ / Voice Guide'}</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba59] shadow-xs"
            title="Share on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F7F8F2] text-[#0B3D2E] border border-stone-200 inline-block">
                Batch #{batch.id}: {batch.quantityKg} KG {batch.crop}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-[#18A558] border border-emerald-200 inline-block">
                AI Quality: {batch.currentQualityScore}/100 Grade A
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17201C]">
              {bestDecision.title}
            </h2>

            <p className="text-[#6F7D75] text-sm leading-relaxed">
              {bestDecision.explanation}
            </p>
          </div>

          {/* Big Profit Highlight */}
          <div className="bg-[#F7F8F2] p-5 sm:p-6 rounded-3xl border border-stone-200 text-center sm:text-right shrink-0 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6F7D75] block">
              Estimated Net Take-Home
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#18A558] tracking-tight mt-1">
              ₹{bestDecision.expectedNetProfit.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] font-semibold text-[#0B3D2E] block mt-1">
              Guaranteed Direct Escrow Payout
            </span>
          </div>
        </div>

        {/* 3 Execution Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {/* Matched Buyer */}
          <div className="bg-[#F7F8F2] p-4 sm:p-5 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B3D2E] uppercase tracking-wider mb-1">
              <Store className="w-4 h-4 text-[#18A558]" />
              Matched Bulk Buyer
            </div>
            <div className="text-sm font-black text-[#17201C]">
              {matchedBuyer ? matchedBuyer.companyName : 'FreshMart Quick Commerce'}
            </div>
            <div className="text-xs text-[#6F7D75] mt-0.5">
              Distance: {matchedBuyer ? matchedBuyer.distanceKm : 34} KM • Rate: ₹{matchedBuyer ? matchedBuyer.offeredPricePerKg : 34}/kg
            </div>
          </div>

          {/* Recommended Vehicle */}
          <div className="bg-[#F7F8F2] p-4 sm:p-5 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B3D2E] uppercase tracking-wider mb-1">
              <Truck className="w-4 h-4 text-[#18A558]" />
              Recommended Transport
            </div>
            <div className="text-sm font-black text-[#17201C]">
              {bestVehicle ? bestVehicle.vehicle.name : 'Mini Pickup (Tata Ace)'}
            </div>
            <div className="text-xs text-[#6F7D75] mt-0.5">
              Cost: ₹{bestVehicle ? bestVehicle.transportCost : 3450} • 1 Trip • Low Vibration
            </div>
          </div>

          {/* Action Window */}
          <div className="bg-[#F7F8F2] p-4 sm:p-5 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B3D2E] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-[#18A558]" />
              Safe Dispatch Window
            </div>
            <div className="text-sm font-black text-[#17201C]">
              Dispatch Within 18 Hours
            </div>
            <div className="text-xs text-[#6F7D75] mt-0.5">
              Preserves 88% freshness & prevents ₹1,700+ value decay
            </div>
          </div>
        </div>

        {/* CTA */}
        {onConfirmAction && (
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200">
            <span className="text-xs text-[#6F7D75] flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#18A558]" />
              Automated NH-60 route locking, live vehicle telemetry & direct buyer escrow
            </span>

            <Button
              variant="success"
              size="lg"
              onClick={onConfirmAction}
              icon={<ArrowRight className="w-5 h-5 text-white" />}
              iconPosition="right"
              className="bg-[#0B3D2E] hover:bg-[#18A558] text-white shadow-md"
            >
              Lock & Dispatch Smart Route Now
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
