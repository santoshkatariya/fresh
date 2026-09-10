import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building,
  Home,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Info,
  Sliders,
  DollarSign,
  PackageCheck,
  Repeat,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { CropType, DemandBreakdown, StandingOrder } from '../../types';
import {
  getDemandBreakdownForCrop,
  getStoredStandingOrders,
  getStoredHouseholdSkipRate,
  saveStoredHouseholdSkipRate
} from '../../utils/storage';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface DemandBreakdownWidgetProps {
  initialCrop?: CropType | string;
  totalHarvestKg?: number;
  onNavigateTab?: (tab: string) => void;
}

export const DemandBreakdownWidget: React.FC<DemandBreakdownWidgetProps> = ({
  initialCrop = 'Tomatoes',
  totalHarvestKg = 800,
  onNavigateTab
}) => {
  const normalizedCrop = (['Tomatoes', 'Onions', 'Capsicum'].includes(initialCrop as string)
    ? (initialCrop as CropType)
    : 'Tomatoes');
  const [selectedCrop, setSelectedCrop] = useState<CropType>(normalizedCrop);
  const [skipRate, setSkipRate] = useState<number>(getStoredHouseholdSkipRate());
  const [breakdown, setBreakdown] = useState<DemandBreakdown>(
    getDemandBreakdownForCrop(normalizedCrop, totalHarvestKg, skipRate)
  );
  const [standingOrders, setStandingOrders] = useState<StandingOrder[]>([]);

  useEffect(() => {
    const updated = getDemandBreakdownForCrop(selectedCrop, totalHarvestKg, skipRate);
    setBreakdown(updated);
    const orders = getStoredStandingOrders().filter(
      o => o.crop === selectedCrop && o.status !== 'cancelled'
    );
    setStandingOrders(orders);
  }, [selectedCrop, totalHarvestKg, skipRate]);

  const handleSkipRateChange = (newRate: number) => {
    setSkipRate(newRate);
    saveStoredHouseholdSkipRate(newRate);
  };

  return (
    <Card className="p-6 sm:p-7 space-y-6 border-2 border-emerald-950/10 shadow-sm bg-white" id="farmer-demand-breakdown-card">
      {/* Title & Crop Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-50 text-[#18A558] border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Pre-Order Demand Breakdown & Harvest Risk Buffer
            </h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            Protects you from last-minute demand loss by segmenting locked bulk orders from flexible household baskets with an automated risk buffer.
          </p>
        </div>

        {/* Commodity Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
          {(['Tomatoes', 'Onions', 'Capsicum'] as CropType[]).map(crop => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCrop === crop
                  ? 'bg-white text-[#0B3D2E] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* Main Breakdown Visual & Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-amber-900">
              <Building className="w-4 h-4 text-amber-700" />
              <span>Bulk Pre-Orders: <strong>{breakdown.bulkStandingOrdersKg} KG ({breakdown.bulkStandingOrdersPercent}%)</strong></span>
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300/60 font-mono font-black">
              🔒 5-Day Lock (25% Penalty Protected)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-300/60 font-mono font-black">
              🌿 24–48h Flexible
            </span>
            <span className="flex items-center gap-1.5 text-emerald-900">
              <Home className="w-4 h-4 text-emerald-700" />
              <span>Household: <strong>{breakdown.householdOrdersKg} KG ({breakdown.householdOrdersPercent}%)</strong></span>
            </span>
          </div>
        </div>

        {/* Proportional Segmented Bar */}
        <div className="h-6 rounded-2xl overflow-hidden flex shadow-inner bg-slate-100 border border-slate-200">
          <div
            style={{ width: `${breakdown.bulkStandingOrdersPercent}%` }}
            className="bg-amber-600 text-white text-[11px] font-black flex items-center justify-center transition-all duration-500 relative group"
            title={`Bulk Demand: ${breakdown.bulkStandingOrdersKg} KG`}
          >
            <span className="px-2 truncate">
              {breakdown.bulkStandingOrdersPercent}% Bulk Contracted ({breakdown.bulkStandingOrdersKg} KG)
            </span>
          </div>
          <div
            style={{ width: `${breakdown.householdOrdersPercent}%` }}
            className="bg-[#18A558] text-white text-[11px] font-black flex items-center justify-center transition-all duration-500"
            title={`Household Demand: ${breakdown.householdOrdersKg} KG`}
          >
            <span className="px-2 truncate">
              {breakdown.householdOrdersPercent}% Household ({breakdown.householdOrdersKg} KG)
            </span>
          </div>
        </div>
      </div>

      {/* 3 Core Intelligence Cards: Bulk Locked vs Household Risk vs Safe Listing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Bulk Protection Pillar */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-700" />
              Bulk Buyer Contracts
            </span>
            <span className="text-[11px] font-black font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
              {breakdown.bulkOrderCount} standing orders
            </span>
          </div>
          <div className="pt-1">
            <div className="text-2xl font-black text-amber-950">
              ₹{breakdown.bulkLockedRevenueINR.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-amber-800 leading-snug mt-1">
              Guaranteed committed revenue. Orders cannot be dropped without a <strong>25% escrow cancellation compensation</strong> paid to your bank account.
            </p>
          </div>
          <div className="pt-2 border-t border-amber-200/60 text-[10px] text-amber-900 flex justify-between font-mono">
            <span>Reliability Tier:</span>
            <strong>99% High Commitment</strong>
          </div>
        </div>

        {/* 2. Household Buffer Pillar */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-emerald-700" />
              Household Aggregate Buffer
            </span>
            <span className="text-[11px] font-black font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              {breakdown.householdOrderCount} collective clusters
            </span>
          </div>
          <div className="pt-1">
            <div className="text-2xl font-black text-emerald-950 flex items-baseline gap-2">
              <span>{breakdown.safetyRiskBufferKg} KG</span>
              <span className="text-xs font-medium text-emerald-700 font-sans">
                buffer ({Math.round(breakdown.historicalHouseholdSkipRate * 100)}% skip rate)
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-snug mt-1">
              Historical analytics show households skip ~{Math.round(breakdown.historicalHouseholdSkipRate * 100)}% of orders. We automatically discount this volume so you never over-harvest.
            </p>
          </div>
          <div className="pt-2 border-t border-emerald-200/60 text-[10px] text-emerald-900 flex justify-between font-mono">
            <span>Expected Realized Volume:</span>
            <strong>{breakdown.householdOrdersKg - breakdown.expectedHouseholdSkipsKg} KG</strong>
          </div>
        </div>

        {/* 3. Recommended Safe Pre-Order Listing Quantity */}
        <div className="p-4 rounded-2xl bg-[#0B3D2E] text-white space-y-2 border border-emerald-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-[#18A558]" />
              Safe Listing Recommendation
            </span>
            <span className="text-[10px] font-bold bg-[#18A558] text-white px-2 py-0.5 rounded-md">
              Zero-Waste Target
            </span>
          </div>
          <div className="pt-1">
            <div className="text-2xl font-black text-white">
              {breakdown.recommendedSafePreOrderListingKg} KG
            </div>
            <p className="text-[11px] text-emerald-200 leading-snug mt-1">
              List exactly <strong>{breakdown.recommendedSafePreOrderListingKg} KG</strong> for pre-orders. Reserve remaining <strong>{breakdown.unhedgedSpotReserveKg} KG</strong> for spot mandi arbitrage or secondary purees.
            </p>
          </div>
          <div className="pt-2 border-t border-white/10 text-[10px] text-emerald-200 flex justify-between font-mono">
            <span>Guaranteed Price Floor:</span>
            <strong className="text-white">₹{breakdown.guaranteedRevenueFloorINR.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>

      {/* Interactive Skip Rate Simulation Slider */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-800">
              Simulate Household Skip-Rate History:
            </span>
            <span className="text-xs font-black font-mono text-[#0B3D2E] bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
              {Math.round(skipRate * 100)}% Average Historical Skip
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Current dynamic buffer: <strong>{breakdown.safetyRiskBufferKg} KG reserved</strong>
          </span>
        </div>

        <input
          type="range"
          min="0.02"
          max="0.25"
          step="0.01"
          value={skipRate}
          onChange={e => handleSkipRateChange(parseFloat(e.target.value))}
          className="w-full accent-[#0B3D2E]"
        />

        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>2% (High Commitment Society)</span>
          <span>8% (Nashik City Average)</span>
          <span>25% (Monsoon Holiday Surge)</span>
        </div>
      </div>

      {/* Active Buyer Subscriptions Linked to This Crop */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Repeat className="w-3.5 h-3.5 text-[#18A558]" />
            Standing Buyer Orders Backing This Harvest ({standingOrders.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            Directly mapped to your farm acreage
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {standingOrders.map(order => {
            const isBulk = order.buyerTier === 'bulk_business';
            return (
              <div
                key={order.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      isBulk ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {isBulk ? '🏢 Bulk Buyer' : '🏡 Household Co-op'}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">#{order.id}</span>
                  </div>
                  <h4 className="font-bold text-slate-900">
                    {order.buyerName}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {order.quantityKg} KG • {order.cycleDay}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className="font-black text-slate-900 block">
                    ₹{order.estimatedCycleTotalINR.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    ₹{order.unitPricePerKg}/kg
                  </span>
                  {isBulk ? (
                    <span className="inline-block text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                      25% Escrow Backed
                    </span>
                  ) : (
                    <span className="inline-block text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                      24h Flexible Window
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
