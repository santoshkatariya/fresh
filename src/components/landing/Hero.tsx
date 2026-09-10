import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Truck,
  Award,
  ShieldCheck,
  CheckCircle2,
  Tractor,
  ShoppingCart,
  Zap,
  MapPin,
  Scale,
  BadgeIndianRupee,
  ChevronRight
} from 'lucide-react';
import { fadeUp, staggerContainer } from '../../animations/variants';
import { Button } from '../common/Button';
import { Card3D, Card3DLayer } from '../common/Card3D';
import farmHeroBg from '../../assets/images/indian_farmer_vast_land_1787689207508.jpg';

export const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden pt-12 pb-24 sm:pt-20 sm:pb-32 text-white min-h-[85vh] flex items-center">
      {/* Background High-Impact Attracting Image with Cinematic Agricultural Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={farmHeroBg}
          alt="Fresh Indian Farm Harvest Landscape"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 filter brightness-95"
        />
        {/* Multilayered Emerald-Dark Gradient Overlay for Contrast & Elegance */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#062016]/90 via-[#072a1e]/80 to-[#062016]/95 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/25 via-transparent to-black/60 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="text-center max-w-4xl mx-auto space-y-8"
        >
          {/* SIH 2026 Innovation Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md shadow-lg shadow-emerald-950/40">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Smart India Hackathon 2026 • AI Post-Harvest Value Optimizer
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] text-balance drop-shadow-sm"
          >
            Don't Let Time Decide the Value of Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-200 to-teal-100">
              Harvest.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="text-base sm:text-xl text-emerald-100/90 max-w-3xl mx-auto leading-relaxed font-normal drop-shadow"
          >
            Empowering Indian farmers with real-time biological shelf-life forecasting, APMC mandi arbitrage intelligence, and direct instant-settlement enterprise buyer channels.
          </motion.p>

          {/* 3D Dual Access Portals (Farmer & Buyer) with Floating Layers */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto pt-4 text-left"
          >
            {/* 3D Farmer Experience Card */}
            <Link to="/farmer/dashboard" className="block group">
              <Card3D
                variant="emerald-glass"
                depth={16}
                glareEffect={true}
                scaleOnHover={1.03}
                className="p-6 h-full flex flex-col justify-between border-white/20 hover:border-emerald-400/80 shadow-2xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Card3DLayer zDepth={35}>
                      <div className="w-13 h-13 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-400/30">
                        <Tractor className="w-6 h-6" />
                      </div>
                    </Card3DLayer>
                    <Card3DLayer zDepth={25}>
                      <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-500/40 shadow-inner">
                        ರೈತ / किसान
                      </span>
                    </Card3DLayer>
                  </div>
                  <div>
                    <Card3DLayer zDepth={30}>
                      <h3 className="text-2xl font-black text-white group-hover:text-emerald-200 transition-colors flex items-center gap-2">
                        Farmer Portal
                        <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1.5 transition-transform" />
                      </h3>
                    </Card3DLayer>
                    <Card3DLayer zDepth={20}>
                      <p className="text-xs sm:text-sm text-emerald-100/85 mt-1.5 leading-relaxed">
                        Direct farm-gate pricing, Mandi vs. FreshRoute live rate radar, and instant WhatsApp rate slips.
                      </p>
                    </Card3DLayer>
                  </div>
                </div>

                <Card3DLayer zDepth={25} className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Launch Farmer Experience
                  </span>
                  <span className="text-emerald-300 group-hover:text-white font-black group-hover:translate-x-1 transition-all">Enter Portal →</span>
                </Card3DLayer>
              </Card3D>
            </Link>

            {/* 3D Buyer Marketplace Card */}
            <Link to="/buyer/dashboard" className="block group">
              <Card3D
                variant="teal-glass"
                depth={16}
                glareEffect={true}
                scaleOnHover={1.03}
                className="p-6 h-full flex flex-col justify-between border-white/20 hover:border-teal-400/80 shadow-2xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Card3DLayer zDepth={35}>
                      <div className="w-13 h-13 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-950/60 ring-2 ring-teal-400/30">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                    </Card3DLayer>
                    <Card3DLayer zDepth={25}>
                      <span className="text-xs font-bold text-teal-300 bg-teal-950/80 px-3.5 py-1.5 rounded-full border border-teal-500/40 shadow-inner">
                        Enterprise / B2B
                      </span>
                    </Card3DLayer>
                  </div>
                  <div>
                    <Card3DLayer zDepth={30}>
                      <h3 className="text-2xl font-black text-white group-hover:text-teal-200 transition-colors flex items-center gap-2">
                        Buyer Marketplace
                        <ChevronRight className="w-5 h-5 text-teal-400 group-hover:translate-x-1.5 transition-transform" />
                      </h3>
                    </Card3DLayer>
                    <Card3DLayer zDepth={20}>
                      <p className="text-xs sm:text-sm text-emerald-100/85 mt-1.5 leading-relaxed">
                        Direct verified Grade-A produce batches, algorithmic shelf-life guarantees, and cold-chain dispatches.
                      </p>
                    </Card3DLayer>
                  </div>
                </div>

                <Card3DLayer zDepth={25} className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-teal-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                    Explore Live Batches
                  </span>
                  <span className="text-teal-300 group-hover:text-white font-black group-hover:translate-x-1 transition-all">Open Market →</span>
                </Card3DLayer>
              </Card3D>
            </Link>
          </motion.div>

          {/* 3D Key Value Metric Badges */}
          <motion.div
            variants={fadeUp}
            className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto"
          >
            <Card3D depth={10} glareEffect={true} scaleOnHover={1.04} variant="dark" className="p-4 bg-black/40 border-white/15 text-center">
              <Card3DLayer zDepth={20}>
                <span className="text-2xl sm:text-3xl font-black text-emerald-300 block tracking-tight">+38%</span>
                <span className="text-xs text-emerald-100/80 font-semibold mt-0.5 block">Farmer Profit Boost</span>
              </Card3DLayer>
            </Card3D>

            <Card3D depth={10} glareEffect={true} scaleOnHover={1.04} variant="dark" className="p-4 bg-black/40 border-white/15 text-center">
              <Card3DLayer zDepth={20}>
                <span className="text-2xl sm:text-3xl font-black text-white block tracking-tight">0%</span>
                <span className="text-xs text-emerald-100/80 font-semibold mt-0.5 block">Middleman Cut</span>
              </Card3DLayer>
            </Card3D>

            <Card3D depth={10} glareEffect={true} scaleOnHover={1.04} variant="dark" className="p-4 bg-black/40 border-white/15 text-center">
              <Card3DLayer zDepth={20}>
                <span className="text-2xl sm:text-3xl font-black text-teal-300 block tracking-tight">&lt; 2 Hrs</span>
                <span className="text-xs text-emerald-100/80 font-semibold mt-0.5 block">Escrow Payout</span>
              </Card3DLayer>
            </Card3D>

            <Card3D depth={10} glareEffect={true} scaleOnHover={1.04} variant="dark" className="p-4 bg-black/40 border-white/15 text-center">
              <Card3DLayer zDepth={20}>
                <span className="text-2xl sm:text-3xl font-black text-amber-300 block tracking-tight">28%</span>
                <span className="text-xs text-emerald-100/80 font-semibold mt-0.5 block">Spoilage Prevented</span>
              </Card3DLayer>
            </Card3D>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
