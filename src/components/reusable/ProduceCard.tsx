import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, ShieldAlert, Sparkles, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ProduceBatch } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface ProduceCardProps {
  batch: ProduceBatch;
  onSelect?: (batch: ProduceBatch) => void;
  onViewValueClock?: (batch: ProduceBatch) => void;
  onViewDecision?: (batch: ProduceBatch) => void;
  isSelected?: boolean;
}

export const ProduceCard: React.FC<ProduceCardProps> = ({
  batch,
  onSelect,
  onViewValueClock,
  onViewDecision,
  isSelected = false
}) => {
  const { t } = useTranslation();

  const getQualityBadge = (score: number) => {
    if (score >= 85) return 'bg-emerald-100 text-[#1b4332] border-emerald-300';
    if (score >= 70) return 'bg-emerald-50 text-[#2d6a4f] border-emerald-200';
    if (score >= 50) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-rose-50 text-rose-800 border-rose-200';
  };

  const getRiskBadge = (risk: number) => {
    if (risk > 20) return 'text-rose-700 bg-rose-50 border-rose-200';
    if (risk > 10) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-[#1b4332] bg-emerald-50 border-emerald-200';
  };

  return (
    <Card
      id={`produce-card-${batch.id}`}
      padding="none"
      className={`overflow-hidden transition-all ${
        isSelected ? 'ring-2 ring-[#1b4332] shadow-md' : 'hover:border-stone-300'
      }`}
    >
      <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
        <img
          src={batch.imageUrl}
          alt={batch.crop}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-black/75 text-white backdrop-blur-xs border border-white/20">
            {batch.quantityKg.toLocaleString('en-IN')} KG
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-[#1b4332] text-white shadow-xs">
            ₹{batch.basePricePerKg}/kg
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${getQualityBadge(
              batch.currentQualityScore
            )}`}
          >
            ★ {batch.currentQualityScore}/100 Quality
          </span>
        </div>

        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white bg-black/75 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/20">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            Shelf Life: ~{batch.estimatedShelfLifeHours}h
          </span>
          <span className="flex items-center gap-1 font-bold text-emerald-300">
            Freshness: {batch.freshnessPercent}%
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-3 bg-white">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              {batch.crop}
              <span className="text-xs font-normal text-stone-500">({batch.variety})</span>
            </h4>
            <p className="text-xs text-stone-600 flex items-center gap-1 mt-0.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#2d6a4f]" />
              {batch.farmLocation}
            </p>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge(batch.spoilageRiskPercent)}`}>
            {batch.spoilageRiskPercent}% Spoilage Risk
          </span>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {batch.detectedIssues.slice(0, 2).map((issue, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-stone-100 text-stone-700 font-medium px-2.5 py-1 rounded-xl border border-stone-200"
            >
              {issue}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-stone-200 flex items-center gap-2">
          {onViewValueClock && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs bg-white text-stone-800 border-stone-300 hover:bg-stone-50"
              onClick={() => onViewValueClock(batch)}
            >
              {t('farmer.viewValueClock')}
            </Button>
          )}

          {onViewDecision && (
            <Button
              variant="primary"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => onViewDecision(batch)}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
            >
              {t('farmer.viewDecision')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

