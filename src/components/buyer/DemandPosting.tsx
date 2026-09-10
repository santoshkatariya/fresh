import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Plus, CheckCircle2, Building, DollarSign, Scale, Calendar, Repeat, ShieldCheck, Home } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { getCurrentUser } from '../../utils/auth';
import { BuyerTier } from '../../types';

export const DemandPosting: React.FC = () => {
  const { t } = useTranslation();
  const user = getCurrentUser();

  const [demands, setDemands] = useState([
    {
      id: 'dem-01',
      crop: 'Tomatoes (Grade A Table)',
      buyerTier: 'bulk_business' as BuyerTier,
      buyerName: 'Hotel Grand Residency',
      quantityKg: 80,
      targetPricePerKg: 24.5,
      minQualityScore: 82,
      fulfillmentFrequency: 'Weekly Recurring (Every Tuesday)',
      orderMode: 'standing_recurring',
      cancellationPolicy: '5-Day Strict Cutoff • 25% Escrow Penalty Protection',
      status: 'ACTIVE_MATCHING'
    },
    {
      id: 'dem-02',
      crop: 'Thompson Seedless Grapes',
      buyerTier: 'bulk_business' as BuyerTier,
      buyerName: 'Spice & Curry Kitchens',
      quantityKg: 150,
      targetPricePerKg: 46.0,
      minQualityScore: 85,
      fulfillmentFrequency: 'Bi-Weekly (Mon/Thu)',
      orderMode: 'standing_recurring',
      cancellationPolicy: '5-Day Strict Cutoff • 25% Escrow Penalty Protection',
      status: 'ACTIVE_MATCHING'
    },
    {
      id: 'dem-03',
      crop: 'Onions (Red Nashik Medium)',
      buyerTier: 'household' as BuyerTier,
      buyerName: 'Pune West Apartment Collective',
      quantityKg: 140,
      targetPricePerKg: 26.0,
      minQualityScore: 78,
      fulfillmentFrequency: 'Weekly (Saturdays)',
      orderMode: 'standing_recurring',
      cancellationPolicy: '24–48h Flexible Window • 8% Aggregate Buffer',
      status: 'ACTIVE_MATCHING'
    }
  ]);

  const [crop, setCrop] = useState('Tomatoes (Grade A Table)');
  const [buyerTier, setBuyerTier] = useState<BuyerTier>(user?.buyerTier || 'bulk_business');
  const [quantityKg, setQuantityKg] = useState(buyerTier === 'bulk_business' ? 80 : 30);
  const [pricePerKg, setPricePerKg] = useState(25);
  const [minQuality, setMinQuality] = useState(80);
  const [frequency, setFrequency] = useState('Weekly Recurring (Fixed Schedule)');
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePostDemand = (e: React.FormEvent) => {
    e.preventDefault();
    const isBulk = buyerTier === 'bulk_business';
    const newDem = {
      id: `dem-${Date.now()}`,
      crop,
      buyerTier,
      buyerName: user?.name || (isBulk ? 'Hotel Procurement Desk' : 'Community Basket Lead'),
      quantityKg,
      targetPricePerKg: pricePerKg,
      minQualityScore: minQuality,
      fulfillmentFrequency: frequency,
      orderMode: 'standing_recurring',
      cancellationPolicy: isBulk
        ? '5-Day Strict Cutoff • 25% Escrow Penalty Protection'
        : '24–48h Flexible Window • 8% Aggregate Buffer',
      status: 'ACTIVE_MATCHING'
    };

    setDemands([newDem, ...demands]);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="buyer-demand-posting">
      <div className="space-y-1 pb-2 border-b border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Tag className="w-6 h-6 text-emerald-700" />
          Pre-Order Procurement Demands & Standing Schedules
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Publish fixed recurring cycles (Hotels/Restaurants) or flexible community baskets directly to verified FPO farm clusters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column (6 cols) */}
        <div className="lg:col-span-6">
          <Card className="p-5 space-y-4 border-2 border-emerald-900/10 bg-white">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-[#18A558]" />
              Post Recurring Pre-Order Contract
            </h3>

            {isSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#18A558] shrink-0" />
                Standing demand broadcasted to verified FPOs with automated confirmation notifications!
              </div>
            )}

            <form onSubmit={handlePostDemand} className="space-y-4 text-xs sm:text-sm">
              {/* Buyer Classification Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">
                  Procurement Classification
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBuyerTier('bulk_business');
                      if (quantityKg < 50) setQuantityKg(80);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      buyerTier === 'bulk_business'
                        ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-bold'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-xs">Bulk Commercial</span>
                    </div>
                    <span className="text-[10px] text-amber-800/80 block mt-0.5">
                      Hotel/Restaurant (5d cutoff)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBuyerTier('household');
                      if (quantityKg > 100) setQuantityKg(30);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      buyerTier === 'household'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="text-xs">Household Co-op</span>
                    </div>
                    <span className="text-[10px] text-emerald-800/80 block mt-0.5">
                      Apartment collective (24h flex)
                    </span>
                  </button>
                </div>
              </div>

              {/* Crop Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 block">Commodity</label>
                <select
                  value={crop}
                  onChange={e => setCrop(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Tomatoes (Grade A Table)">Tomatoes (Grade A Table)</option>
                  <option value="Thompson Seedless Grapes">Grapes (Thompson Seedless)</option>
                  <option value="Onions (Red Nashik Medium)">Onions (Red Nashik Medium)</option>
                  <option value="Capsicum (Green Box)">Capsicum (Indra Bell Green)</option>
                </select>
              </div>

              {/* Volume & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">Cycle Volume (KG)</label>
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={e => setQuantityKg(Number(e.target.value))}
                    min={5}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">Offered Rate (₹/kg)</label>
                  <input
                    type="number"
                    value={pricePerKg}
                    onChange={e => setPricePerKg(Number(e.target.value))}
                    min={5}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              </div>

              {/* Recurring Cycle Cadence */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 block">Recurring Cycle Cadence</label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Weekly Recurring (Fixed Schedule)">Weekly Standing (Every Tuesday)</option>
                  <option value="Bi-Weekly Recurring (Mon & Thu)">Bi-Weekly Standing (Mon & Thu)</option>
                  <option value="Daily Fixed Dispatch">Daily Fixed Supply (High Volume)</option>
                  <option value="Fortnightly Schedule">Fortnightly (Every 14 Days)</option>
                </select>
              </div>

              {/* Policy Preview Banner */}
              <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                buyerTier === 'bulk_business'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    {buyerTier === 'bulk_business'
                      ? 'Bulk Protection: 5-Day Change Cutoff'
                      : 'Household: 24–48h Flexible Window'}
                  </span>
                  <p className="text-[11px] leading-snug mt-0.5 opacity-90">
                    {buyerTier === 'bulk_business'
                      ? 'Automated cycle confirmation sent 3 days before cutoff. Changes after cutoff incur 25% compensation credited to the farmer.'
                      : 'Changes or skips allowed with zero penalty up to 24 hours prior. Aggregated across collective members.'}
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                icon={<Plus className="w-4 h-4" />}
                className="bg-[#0B3D2E] hover:bg-[#062016] text-white font-bold"
              >
                Broadcast Standing Demand to FPOs
              </Button>
            </form>
          </Card>
        </div>

        {/* Existing Broadcasts List (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center justify-between">
            <span>Active Standing Broadcasts ({demands.length})</span>
            <span className="text-xs text-slate-400 font-normal">FPO Match Pool</span>
          </h3>

          <div className="space-y-3">
            {demands.map(dem => {
              const isBulk = dem.buyerTier === 'bulk_business';
              return (
                <Card key={dem.id} hoverEffect className="p-4 space-y-2 border border-slate-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-gray-900">{dem.crop}</span>
                      <span className="text-[11px] text-slate-500 block">{dem.buyerName}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isBulk ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isBulk ? '🏢 Bulk Standing' : '🏡 Household Co-op'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Volume</span>
                      <strong className="text-gray-900">{dem.quantityKg} KG</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Offered Rate</span>
                      <strong className="text-emerald-700">₹{dem.targetPricePerKg}/kg</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Cycle</span>
                      <strong className="text-gray-900 truncate block">Weekly</strong>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-100 text-[10px] text-slate-600 font-mono">
                    Policy: {dem.cancellationPolicy}
                  </div>

                  <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
                    <span>{dem.fulfillmentFrequency}</span>
                    <span className="text-emerald-700 font-bold cursor-pointer hover:underline">
                      View FPO Allocation →
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

