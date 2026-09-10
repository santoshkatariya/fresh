import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Sparkles, ArrowRight, Building2, Store, DollarSign, Scale } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { calculateRealTimePriceComparison } from '../../utils/marketRates';

interface MandiVsOurPriceWidgetProps {
  crop?: string;
  weightKg?: number;
  qualityScore?: number;
  onExploreFullRadar?: () => void;
}

export const MandiVsOurPriceWidget: React.FC<MandiVsOurPriceWidgetProps> = ({
  crop = 'Tomatoes',
  weightKg = 850,
  qualityScore = 82,
  onExploreFullRadar,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const comparison = calculateRealTimePriceComparison({
    crop,
    weightKg,
    qualityScore,
    qualityGrade: qualityScore >= 80 ? 'A' : 'B',
  });

  return (
    <Card className="p-5 sm:p-6 bg-white border border-stone-200 shadow-sm space-y-4" id="mandi-vs-our-price-widget">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#0B3D2E] flex items-center justify-center font-bold">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#0B3D2E] border border-emerald-200">
                Live Price Arbitrage
              </span>
              <span className="text-[11px] text-stone-400 font-mono">Agmarknet Stream</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-[#17201C] mt-0.5">
              {comparison.crop} • Mandi Rate vs FreshRoute Direct vs City Retail
            </h3>
          </div>
        </div>

        {onExploreFullRadar && (
          <button
            onClick={onExploreFullRadar}
            className="text-xs font-bold text-[#18A558] hover:text-[#0B3D2E] flex items-center gap-1 shrink-0 group transition-colors"
          >
            <span>Full Market Radar</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* 3 Price Comparison Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Mandi Rate */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="flex items-center gap-1 font-bold">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              APMC Mandi
            </span>
            <span className="line-through text-stone-400">₹{comparison.selectedMandi.modalPricePerKg}/kg</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-stone-900">₹{comparison.selectedMandi.netRealizedFarmerRate}</span>
            <span className="text-[11px] text-stone-500 font-medium">/ kg net</span>
          </div>
          <span className="text-[10px] text-rose-600 font-bold block mt-1">
            -₹{(comparison.selectedMandi.modalPricePerKg - comparison.selectedMandi.netRealizedFarmerRate).toFixed(1)}/kg middleman cuts
          </span>
        </div>

        {/* FreshRoute Price */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-[#18A558] shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
            <span className="flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#18A558]" />
              FreshRoute Direct
            </span>
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-[#18A558] text-white">
              0% Cut
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#0B3D2E]">₹{comparison.freshRoutePrice.netRealizedFarmerRate}</span>
            <span className="text-[11px] text-emerald-700 font-medium">/ kg in pocket</span>
          </div>
          <span className="text-[10px] text-[#18A558] font-bold block mt-1">
            +₹{comparison.freshRoutePrice.priceAdvantageVsMandi}/kg (+{comparison.freshRoutePrice.percentageAdvantageVsMandi}%) higher take-home
          </span>
        </div>

        {/* City Retail Rate */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80">
          <div className="flex items-center justify-between text-xs text-blue-800 mb-1">
            <span className="flex items-center gap-1 font-bold">
              <Store className="w-3.5 h-3.5 text-blue-600" />
              Mumbai / Bengaluru
            </span>
            <span className="text-[10px] text-blue-600 font-bold">Quick-Commerce</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-blue-950">₹{comparison.cityRates[0].averageRetailRatePerKg}</span>
            <span className="text-[11px] text-stone-500 font-medium">/ kg consumer</span>
          </div>
          <span className="text-[10px] text-blue-700 font-bold block mt-1">
            ₹{comparison.cityRates[0].quickCommerceRatePerKg}/kg on Blinkit/Zepto
          </span>
        </div>
      </div>

      {/* Quick Summary Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
        <span className="text-stone-600">
          On this <strong>{weightKg} KG</strong> lot, FreshRoute puts{' '}
          <strong className="text-[#18A558] font-black">
            +₹{comparison.netExtraTakeHomeForLot.toLocaleString('en-IN')} extra cash
          </strong>{' '}
          directly into your bank account.
        </span>

        {onExploreFullRadar && (
          <Button
            variant="success"
            size="sm"
            onClick={onExploreFullRadar}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            className="bg-[#18A558] hover:bg-[#158f4c] text-white shrink-0 font-bold text-xs"
          >
            Open Price Radar
          </Button>
        )}
      </div>
    </Card>
  );
};
