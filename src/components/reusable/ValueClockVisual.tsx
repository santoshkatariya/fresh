import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Clock, TrendingDown } from 'lucide-react';
import { ProduceBatch, ValueTimePoint } from '../../types';
import { generateValueTimeline, calculateValueAtTime } from '../../utils/valueDecay';
import { CountUp } from '../common/CountUp';

interface ValueClockVisualProps {
  batch: ProduceBatch;
  distanceKm?: number;
  onTimeChange?: (hours: number) => void;
  interactive?: boolean;
}

export const ValueClockVisual: React.FC<ValueClockVisualProps> = ({
  batch,
  distanceKm = 34,
  onTimeChange,
  interactive = true
}) => {
  const { t } = useTranslation();
  const [selectedHours, setSelectedHours] = useState<number>(0);

  const timeline = generateValueTimeline(batch, 36, distanceKm);
  const currentPoint = calculateValueAtTime(batch, selectedHours, distanceKm);
  const nowPoint = timeline[0];
  const valueLost = Math.max(0, nowPoint.netProfit - currentPoint.netProfit);

  const handleHourSelect = (hours: number) => {
    setSelectedHours(hours);
    if (onTimeChange) onTimeChange(hours);
  };

  const getStatusColor = (risk: ValueTimePoint['statusRisk']) => {
    switch (risk) {
      case 'Prime':
        return 'text-[#a8d43a] bg-lime-500/20 border-lime-500/40';
      case 'Good':
        return 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40';
      case 'Moderate':
        return 'text-amber-300 bg-amber-500/20 border-amber-500/40';
      case 'Critical':
        return 'text-rose-300 bg-rose-500/20 border-rose-500/40';
    }
  };

  return (
    <div
      id="interactive-value-clock"
      className="rounded-3xl border border-emerald-800/50 bg-gradient-to-br from-[#062016] via-[#0B3D2E] to-[#08281D] text-white p-5 sm:p-7 shadow-xl shadow-emerald-950/20 space-y-6 overflow-hidden relative"
    >
      {/* Subtle ambient light depth */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-lime-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A8D94C] to-[#18A558] text-[#062016] flex items-center justify-center font-bold shadow-lg shadow-lime-500/20">
              <Clock className="w-5 h-5 text-[#062016]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                {t('valueClock.title')}
              </h3>
              <p className="text-xs text-emerald-100/75">{t('valueClock.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-emerald-100 border border-white/15 backdrop-blur-md">
            {batch.quantityKg} KG {batch.crop} ({batch.variety})
          </span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border backdrop-blur-md ${getStatusColor(currentPoint.statusRisk)}`}>
            {currentPoint.statusRisk} State
          </span>
        </div>
      </div>

      {/* Interactive Time Slider & Preset Buttons */}
      <div className="space-y-3 bg-black/25 p-4 sm:p-5 rounded-2xl border border-white/10 backdrop-blur-md relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200/80">
            {t('valueClock.adjustTime')}
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-[#A8D94C] bg-white/10 px-3 py-1 rounded-xl border border-white/15 shadow-xs">
            {selectedHours === 0 ? 'HARVEST TIME (0h)' : `+${selectedHours} HOURS DELAY`}
          </span>
        </div>

        {/* Timeline Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {[0, 12, 24, 36].map(hours => {
            const isSelected = selectedHours === hours;
            const pt = timeline.find(p => p.hoursElapsed === hours) || calculateValueAtTime(batch, hours, distanceKm);
            return (
              <button
                key={hours}
                id={`time-btn-${hours}h`}
                type="button"
                onClick={() => handleHourSelect(hours)}
                className={`flex flex-col items-center py-2.5 px-2 rounded-2xl text-center transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-[#A8D94C] text-[#062016] border-[#A8D94C] shadow-lg shadow-lime-500/20 scale-[1.02] font-black'
                    : 'bg-white/5 text-white border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <span className="text-xs font-bold">{hours === 0 ? 'NOW' : `+${hours}H`}</span>
                <span className={`text-[11px] font-extrabold mt-0.5 ${isSelected ? 'text-[#062016]' : 'text-[#A8D94C]'}`}>
                  ₹{pt.netProfit.toLocaleString('en-IN')}
                </span>
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#062016]/80 font-semibold' : 'text-emerald-200/60'}`}>
                  {pt.qualityScore}/100 Q
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Slider */}
        {interactive && (
          <div className="pt-3">
            <input
              type="range"
              min="0"
              max="36"
              step="1"
              value={selectedHours}
              onChange={e => handleHourSelect(Number(e.target.value))}
              className="w-full h-2.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#A8D94C]"
              id="value-decay-range-slider"
            />
            <div className="flex justify-between text-[10px] text-emerald-200/60 font-semibold px-1 mt-1.5">
              <span>0h (Peak Freshness)</span>
              <span>12h (Mandi Gate)</span>
              <span>24h (Softening)</span>
              <span>36h (Critical Rot)</span>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 relative z-10">
        {/* Quality Metric */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-xs space-y-1.5 backdrop-blur-md">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200/80 block">
            Quality Score
          </span>
          <div className="text-xl sm:text-2xl font-black text-white">
            <CountUp end={currentPoint.qualityScore} suffix="/100" duration={300} />
          </div>
          <div className="text-[11px] text-emerald-100/70">
            Shelf Life: ~{currentPoint.shelfLifeHoursRemaining}h left
          </div>
        </div>

        {/* Spoilage Loss */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-xs space-y-1.5 backdrop-blur-md">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200/80 block">
            Spoilage Rate
          </span>
          <div className={`text-xl sm:text-2xl font-black ${currentPoint.spoilageRatePercent > 15 ? 'text-rose-400' : 'text-amber-400'}`}>
            <CountUp end={currentPoint.spoilageRatePercent} suffix="%" decimals={1} duration={300} />
          </div>
          <div className="text-[11px] text-emerald-100/70">
            Good: {currentPoint.recoverableKg} / {batch.quantityKg} kg
          </div>
        </div>

        {/* Market Rate */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-xs space-y-1.5 backdrop-blur-md">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200/80 block">
            Realized Price
          </span>
          <div className="text-xl sm:text-2xl font-black text-white">
            ₹{currentPoint.marketPricePerKg}
            <span className="text-xs font-normal text-emerald-200/60">/kg</span>
          </div>
          <div className="text-[11px] text-emerald-100/70">
            Gross: ₹{currentPoint.expectedRevenue.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Net Farmer Profit */}
        <div className="bg-gradient-to-br from-[#18A558]/25 via-lime-500/20 to-emerald-900/30 p-4 rounded-2xl border border-[#A8D94C]/40 shadow-xs space-y-1.5 backdrop-blur-md">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8D94C] block">
            Net Take-Home
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#A8D94C]">
            <CountUp end={currentPoint.netProfit} prefix="₹" duration={300} />
          </div>
          <div className="text-[11px] text-emerald-200 font-medium">
            After ₹{currentPoint.transportCost} transit
          </div>
        </div>
      </div>

      {/* Loss Warning Banner if time > 0 */}
      {selectedHours > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/35 backdrop-blur-md flex items-start gap-3 text-white text-xs sm:text-sm relative z-10"
        >
          <TrendingDown className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-rose-200">
              Value Loss Alert: ₹{valueLost.toLocaleString('en-IN')} Vanished!
            </span>
            <span className="text-rose-100/90 text-xs mt-0.5 block leading-relaxed">
              Holding this batch for {selectedHours} hours causes tissue softening, reducing recoverable weight by{' '}
              {batch.quantityKg - currentPoint.recoverableKg} kg and dragging net profit from ₹
              {nowPoint.netProfit.toLocaleString('en-IN')} down to ₹{currentPoint.netProfit.toLocaleString('en-IN')}.
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

