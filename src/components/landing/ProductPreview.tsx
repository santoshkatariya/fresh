import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  TrendingUp,
  Cpu,
  BarChart3,
  Boxes,
  ArrowRight
} from 'lucide-react';
import { fadeUp } from '../../animations/variants';
import { Card } from '../common/Card';

export const ProductPreview: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="product" className="py-24 bg-stone-50/50 border-t border-stone-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="text-center max-w-3xl mx-auto space-y-4 mb-14"
        >
          <span className="text-xs font-bold text-[#1b4332] tracking-wider uppercase bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200 shadow-2xs inline-block">
            SaaS Product Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
            Designed for Instant Operational Clarity
          </h2>
          <p className="text-base sm:text-lg text-stone-600">
            Judged not by cosmetic dashboards, but by mathematically sound profit maximization at every hour following harvest.
          </p>
        </motion.div>

        {/* Browser Mockup Frame with Natural Stone styling */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-60px' }}
          className="max-w-5xl mx-auto rounded-3xl border border-stone-300 shadow-xl overflow-hidden bg-white text-stone-900"
        >
          {/* Browser Window Bar */}
          <div className="bg-stone-100 px-4 py-3 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            </div>
            <div className="text-xs font-mono text-stone-700 bg-white px-4 py-1 rounded-xl border border-stone-200 truncate max-w-md shadow-2xs">
              https://app.freshroute.ai/farmer/decision?batch=batch-tomato-01
            </div>
            <div className="text-xs text-stone-400 font-mono">FreshRoute OS v2.6</div>
          </div>

          {/* Browser Content Area */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Top Stat Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">Active Batch</span>
                <span className="text-lg font-black text-stone-900">800 KG Tomatoes</span>
                <span className="text-xs text-[#2d6a4f] block mt-0.5 font-medium">Niphad, Nashik</span>
              </div>
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">AI Quality Score</span>
                <span className="text-lg font-black text-[#1b4332]">82 / 100 Grade A</span>
                <span className="text-xs text-stone-500 block mt-0.5">Firmness 7.8/10</span>
              </div>
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">Predicted Shelf Life</span>
                <span className="text-lg font-black text-amber-700">~31 Hours</span>
                <span className="text-xs text-stone-500 block mt-0.5">At 30°C Ambient</span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-2xs">
                <span className="text-[11px] font-bold text-[#1b4332] uppercase block">Max Net Take-Home</span>
                <span className="text-xl font-black text-stone-900">₹15,652</span>
                <span className="text-xs text-[#2d6a4f] block mt-0.5 font-bold">Immediate Dispatch</span>
              </div>
            </div>

            {/* Middle Feature Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Value Clock Decay Graph Mockup */}
              <div className="bg-stone-50 p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#2d6a4f]" />
                    Value Clock Hourly Decay
                  </h4>
                  <span className="text-xs text-rose-600 font-bold">-₹1,706 per 12h wait</span>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1b4332]">0h (Now)</span>
                    <span className="font-black text-stone-900">₹15,652 Net</span>
                    <div className="w-32 bg-stone-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-[#1b4332] h-2.5 rounded-full w-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-700">12h Wait</span>
                    <span className="font-bold text-stone-800">₹13,946 Net</span>
                    <div className="w-32 bg-stone-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-amber-500 h-2.5 rounded-full w-[89%]" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-600">24h Wait</span>
                    <span className="font-bold text-stone-800">₹10,774 Net</span>
                    <div className="w-32 bg-stone-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-rose-500 h-2.5 rounded-full w-[68%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Channel Ranking */}
              <div className="bg-stone-50 p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-[#2d6a4f]" />
                    What-If Decision Ranking
                  </h4>
                  <span className="text-xs text-[#1b4332] font-bold">1st Ranked</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between font-medium">
                    <span className="text-stone-900 font-bold">1. Sell Immediately (FreshMart Quick Commerce)</span>
                    <span className="font-black text-[#1b4332]">₹15,652</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-stone-200 flex items-center justify-between text-stone-700">
                    <span>2. Reroute to Mumbai APMC (95 km haul)</span>
                    <span className="font-semibold text-stone-900">₹14,800</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-stone-200 flex items-center justify-between text-stone-700">
                    <span>3. Puree & Pulping Cluster (22 km)</span>
                    <span className="font-semibold text-stone-900">₹12,400</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

