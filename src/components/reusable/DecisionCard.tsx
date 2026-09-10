import React from 'react';
import { useTranslation } from 'react-i18next';
import { Award, ArrowRight, ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { DecisionOption } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface DecisionCardProps {
  decision: DecisionOption;
  onAccept?: (decision: DecisionOption) => void;
  isSelected?: boolean;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({
  decision,
  onAccept,
  isSelected = false
}) => {
  const { t } = useTranslation();

  const getRiskColor = (risk: DecisionOption['riskLevel']) => {
    switch (risk) {
      case 'Low':
        return 'text-emerald-700 bg-emerald-100 border-emerald-300';
      case 'Medium':
        return 'text-amber-700 bg-amber-100 border-amber-300';
      case 'High':
        return 'text-rose-700 bg-rose-100 border-rose-300';
    }
  };

  return (
    <Card
      id={`decision-card-${decision.action}`}
      padding="none"
      borderVariant={decision.isBest ? 'success' : isSelected ? 'accent' : 'default'}
      className={`relative overflow-hidden transition-all duration-200 ${
        decision.isBest
          ? 'ring-2 ring-[#2d7a4a] shadow-lg bg-gradient-to-b from-emerald-50/40 via-white to-white'
          : isSelected
          ? 'ring-2 ring-emerald-600 shadow-md'
          : 'hover:shadow-md'
      }`}
    >
      {decision.isBest && (
        <div className="bg-[#1b4d2f] text-[#a8d43a] px-4 py-2 text-xs font-extrabold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#a8d43a]" />
            {t('decision.bestChoice')}
          </span>
          <span className="text-[11px] text-white/90">Max Net Take-Home</span>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Title & Subtitle */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-base font-bold text-gray-900 leading-snug">{decision.title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{decision.subtitle}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getRiskColor(decision.riskLevel)}`}>
            {decision.riskLevel} Risk
          </span>
        </div>

        {/* Expected Net Profit Banner */}
        <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block">
              Expected Net Profit
            </span>
            <span className={`text-2xl font-extrabold ${decision.isBest ? 'text-[#1b4d2f]' : 'text-gray-900'}`}>
              ₹{decision.expectedNetProfit.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="text-right text-xs text-gray-500 space-y-0.5">
            <div>Gross: ₹{decision.expectedGrossRevenue.toLocaleString('en-IN')}</div>
            <div>Costs: -₹{decision.totalCosts.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-gray-50 rounded-lg">
            <span className="text-gray-400 block text-[10px] uppercase">Quality at Dest</span>
            <span className="font-bold text-gray-800">{decision.qualityAtDestination}/100</span>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <span className="text-gray-400 block text-[10px] uppercase">Shelf Life Left</span>
            <span className="font-bold text-gray-800">~{decision.shelfLifeRemainingHours}h</span>
          </div>
        </div>

        {/* Explanation */}
        <div className="text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-200/70 space-y-1">
          <div className="font-semibold text-gray-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#2d7a4a]" />
            {decision.keyAdvantage}
          </div>
          <p className="text-gray-500 leading-relaxed text-[11px]">{decision.explanation}</p>
        </div>

        {/* Accept Button */}
        {onAccept && (
          <div className="pt-2">
            <Button
              variant={decision.isBest ? 'primary' : 'outline'}
              fullWidth
              size="sm"
              onClick={() => onAccept(decision)}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              {decision.isBest ? 'Accept & Lock Recommendation' : 'Select This Action'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
