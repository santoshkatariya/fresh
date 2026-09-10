import React from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, TrendingUp, ArrowDownRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card } from '../common/Card';
import { CountUp } from '../common/CountUp';

interface ProfitBreakdownProps {
  grossRevenue: number;
  transportCost: number;
  holdingOrHandlingCost?: number;
  netProfit: number;
  quantityKg: number;
  pricePerKg: number;
}

export const ProfitBreakdown: React.FC<ProfitBreakdownProps> = ({
  grossRevenue,
  transportCost,
  holdingOrHandlingCost = 0,
  netProfit,
  quantityKg,
  pricePerKg
}) => {
  const { t } = useTranslation();

  return (
    <Card id="profit-breakdown-card" className="space-y-4">
      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-[#2d7a4a]" />
        Transparent Net Earnings Breakdown
      </h4>

      <div className="space-y-2.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <span className="text-gray-600">
            Gross Produce Value ({quantityKg} kg @ ₹{pricePerKg}/kg)
          </span>
          <span className="font-semibold text-gray-900">
            +₹{grossRevenue.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <span className="text-gray-600 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
            Optimized Vehicle Freight
          </span>
          <span className="font-semibold text-rose-600">
            -₹{transportCost.toLocaleString('en-IN')}
          </span>
        </div>

        {holdingOrHandlingCost > 0 && (
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-gray-600 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-amber-500" />
              Packaging & Loading
            </span>
            <span className="font-semibold text-amber-600">
              -₹{holdingOrHandlingCost.toLocaleString('en-IN')}
            </span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/60">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1b4d2f] block">
              Farmer Net Bank Payout (T+0)
            </span>
            <span className="text-[11px] text-emerald-700">100% Direct Deposit Guaranteed</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#1b4d2f]">
            <CountUp end={netProfit} prefix="₹" />
          </span>
        </div>
      </div>
    </Card>
  );
};
