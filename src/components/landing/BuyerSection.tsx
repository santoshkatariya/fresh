import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ShoppingCart, CheckCircle2, ShieldCheck, Truck, Store, ArrowRight } from 'lucide-react';
import { fadeUp } from '../../animations/variants';
import { Button } from '../common/Button';

export const BuyerSection: React.FC = () => {
  const { t } = useTranslation();

  const buyerBenefits = [
    'Pre-screened AI quality grades with verified defect and ripeness parameters',
    'Real-time temperature and humidity telemetry from farm dispatch to receiving dock',
    'Direct farm sourcing eliminates 3–4 layers of middlemen commissions',
    'Automated smart contract escrow for seamless digital weighbridge settlements'
  ];

  return (
    <section className="py-24 bg-stone-50/50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text & CTAs Column */}
          <motion.div
            variants={fadeUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="lg:col-span-6 space-y-6 order-2 lg:order-1"
          >
            <span className="text-xs font-bold text-[#1b4332] tracking-wider uppercase bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200 shadow-2xs inline-block">
              For Quick-Commerce, Retailers & Food Processors
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Direct-From-Farm Procurement with Zero Surprises.
            </h2>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              Source consistent high-grade fruits and vegetables directly from verified farmers. Eliminate arrival rejections through upfront AI grading.
            </p>

            <div className="space-y-3.5 pt-2">
              {buyerBenefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-stone-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#2d6a4f] shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link to="/buyer/dashboard">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ShoppingCart className="w-5 h-5 text-white" />}
                  iconPosition="left"
                >
                  Enter Buyer Marketplace
                </Button>
              </Link>
              <Link to="/signup/buyer">
                <Button variant="outline" size="lg" className="bg-white border-stone-300 text-stone-800 hover:bg-stone-50">
                  Register Enterprise Account
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Visual Column */}
          <motion.div
            variants={fadeUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="lg:col-span-6 relative order-1 lg:order-2"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-200 bg-white">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80"
                alt="Fresh produce marketplace distribution warehouse"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                  Enterprise Logistics Hub
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  Trusted by Retail Chains, Puree Plants & Dark Stores
                </h3>
                <p className="text-xs sm:text-sm text-stone-200 mt-1">
                  Reduced inventory receiving rejections from 14% to under 2.1%.
                </p>
              </div>
            </div>

            {/* Floating Metric Badge */}
            <div className="absolute -bottom-6 -left-4 sm:left-6 bg-white p-4 sm:p-5 rounded-3xl shadow-xl border border-stone-200 flex items-center gap-3 max-w-xs text-stone-900">
              <div className="w-12 h-12 rounded-2xl bg-[#1b4332] text-white flex items-center justify-center font-black text-base shadow-sm">
                98%
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-stone-900 block">Dock Quality Acceptance</span>
                <span className="text-stone-500">Zero hidden transit spoilage</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};


