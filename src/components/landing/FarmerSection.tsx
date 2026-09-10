import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Tractor, ArrowRight, CheckCircle2, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
import { fadeUp } from '../../animations/variants';
import { Button } from '../common/Button';
import farmHeroBg from '../../assets/images/indian_farmer_vast_land_1787689207508.jpg';

export const FarmerSection: React.FC = () => {
  const { t } = useTranslation();

  const benefits = [
    'Instant mobile photo scanning for firmness, brix & defect percentage',
    'Real-time Value Clock prevents price degradation by pinpointing dispatch window',
    'Automated vehicle economics ensures optimal freight payload without overpaying',
    'Direct T+0 digital bank payouts without intermediary deductions'
  ];

  return (
    <section className="py-24 bg-[#f8faf7] border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Column */}
          <motion.div
            variants={fadeUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-200 bg-white">
              <img
                src={farmHeroBg}
                alt="Farmer in vast fertile agricultural field"
                referrerPolicy="no-referrer"
                className="w-full h-96 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                  Verified Farmer / FPO Ecosystem
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  Empowering 140+ Progressive Farmers Across Maharashtra
                </h3>
                <p className="text-xs sm:text-sm text-stone-200 mt-1">
                  Realized an average net profit increase of 18.4% by avoiding premature or delayed mandi sales.
                </p>
              </div>
            </div>

            {/* Floating Metric Badge */}
            <div className="absolute -bottom-6 -right-4 sm:right-6 bg-white p-4 sm:p-5 rounded-3xl shadow-xl border border-stone-200 flex items-center gap-3 max-w-xs text-stone-900">
              <div className="w-12 h-12 rounded-2xl bg-[#1b4332] text-white flex items-center justify-center font-black text-base shadow-sm">
                +18%
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-stone-900 block">Higher Realized Net Profit</span>
                <span className="text-stone-500">Across 800+ tracked batches</span>
              </div>
            </div>
          </motion.div>

          {/* Text & CTAs Column */}
          <motion.div
            variants={fadeUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="lg:col-span-6 space-y-6"
          >
            <span className="text-xs font-bold text-[#1b4332] tracking-wider uppercase bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200 shadow-2xs inline-block">
              For Farmers & Agricultural FPOs
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Turn Perishable Harvests into Guaranteed Net Profit.
            </h2>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              No more guessing tomorrow's mandi rate. FreshRoute AI provides data-driven certainty from farm gate to payment receipt.
            </p>

            <div className="space-y-3.5 pt-2">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-stone-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#2d6a4f] shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link to="/farmer/dashboard">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Tractor className="w-5 h-5 text-white" />}
                  iconPosition="left"
                >
                  Enter Farmer Portal (ರೈತ / किसान)
                </Button>
              </Link>
              <Link to="/signup/farmer">
                <Button variant="outline" size="lg" className="bg-white border-stone-300 text-stone-800 hover:bg-stone-50">
                  Register Farm / FPO
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};


