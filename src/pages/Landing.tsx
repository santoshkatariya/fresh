import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Navbar } from '../components/common/Navbar';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { FiveActions } from '../components/landing/FiveActions';
import { FarmerSection } from '../components/landing/FarmerSection';
import { BuyerSection } from '../components/landing/BuyerSection';
import { Button } from '../components/common/Button';
import { Tractor, ShoppingCart, Sparkles, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { fadeUp } from '../animations/variants';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf7] text-stone-900">
      {/* Top Main Navbar */}
      <Navbar />

      {/* Main Page Sections */}
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <FiveActions />
        <FarmerSection />
        <BuyerSection />

        {/* Global CTA Section */}
        <section className="py-24 bg-[#1b4332] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent pointer-events-none" />
          
          <motion.div
            variants={fadeUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10"
          >
            <span className="text-xs font-black uppercase tracking-widest text-emerald-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md inline-block">
              Smart India Hackathon 2026 Innovation
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to Maximize Post-Harvest Value Across India?
            </h2>

            <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
              Experience the dual-sided platform empowering farmers with algorithmic dispatch certainty and direct enterprise buyer channels.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/farmer/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="success"
                  size="lg"
                  fullWidth
                  icon={<Tractor className="w-5 h-5 text-white" />}
                  iconPosition="left"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/20"
                >
                  Launch Farmer Experience (ರೈತ / किसान)
                </Button>
              </Link>

              <Link to="/buyer/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  icon={<ShoppingCart className="w-5 h-5 text-stone-800" />}
                  iconPosition="left"
                  className="bg-white text-stone-900 border-white hover:bg-stone-100"
                >
                  Launch Buyer Experience
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                FR
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Fresh<span className="text-emerald-400">Route</span> AI
              </span>
            </div>

            <div className="flex flex-wrap gap-6 text-xs text-stone-300">
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#five-actions" className="hover:text-white transition-colors">Decision Intelligence</a>
              <Link to="/farmer/dashboard" className="hover:text-white transition-colors">Farmer App</Link>
              <Link to="/buyer/dashboard" className="hover:text-white transition-colors">Buyer Marketplace</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-stone-400">
            <p>© 2026 FreshRoute AI. Built with precision for Smart India Hackathon.</p>
            <p className="flex items-center gap-1">
              Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Agriculture
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};


