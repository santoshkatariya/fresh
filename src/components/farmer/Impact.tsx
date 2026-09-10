import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, ShieldCheck, Leaf, DollarSign, Award, Droplets, HeartHandshake } from 'lucide-react';
import { Card } from '../common/Card';
import { MetricCard } from '../reusable/MetricCard';

export const Impact: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="farmer-impact-analytics">
      <div className="space-y-1 pb-2 border-b border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#2d7a4a]" />
          Economic & Climate Impact Metrics
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Quantified financial gains, post-harvest food waste mitigation, and CO2 emissions prevented
        </p>
      </div>

      {/* 4 Big Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Cumulative Extra Profit"
          value={48600}
          prefix="₹"
          trend="+18.4%"
          trendLabel="vs unoptimized mandi sales"
          icon={<DollarSign className="w-5 h-5 text-emerald-800" />}
          borderVariant="success"
        />

        <MetricCard
          title="Food Waste Diverted"
          value={3240}
          suffix=" KG"
          trend="-78%"
          trendLabel="spoilage rate reduction"
          icon={<Leaf className="w-5 h-5 text-emerald-800" />}
          borderVariant="default"
        />

        <MetricCard
          title="CO2 Emissions Saved"
          value={1820}
          suffix=" KG"
          trend="Scope 3"
          trendLabel="optimized vehicle payload"
          icon={<ShieldCheck className="w-5 h-5 text-blue-800" />}
          borderVariant="default"
        />

        <MetricCard
          title="Avg Dispatch Turnaround"
          value={2.4}
          suffix=" hrs"
          trend="T+0"
          trendLabel="rapid buyer matching"
          icon={<Award className="w-5 h-5 text-purple-800" />}
          borderVariant="accent"
        />
      </div>

      {/* Case Study Card */}
      <Card className="p-6 bg-[#faf8f5] space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-[#2d7a4a]" />
          Smart India Hackathon 2026 Verification Report
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-1">
            <span className="text-gray-400 font-bold block uppercase">Baseline APMC Friction</span>
            <p className="text-gray-700">
              Farmers historically lost ~22% value waiting 18–36 hours at physical wholesale gates under hot sun with 8% middleman commission deductions.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-1">
            <span className="text-[#2d7a4a] font-bold block uppercase">FreshRoute AI Optimization</span>
            <p className="text-gray-700">
              Instant farm-gate quality classification, direct payload matching, and time-decay pricing yielded net take-home profits of ₹19.5/kg vs ₹14.0/kg.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-1">
            <span className="text-emerald-800 font-bold block uppercase">Zero Waste Guarantee</span>
            <p className="text-gray-700">
              B-grade or soft produce is algorithmically redirected to local puree pulpers or food banks, achieving zero landfill waste.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
