import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tractor,
  ArrowRight,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  Building,
  Sprout,
  Leaf,
  ShieldCheck,
  CheckCircle2,
  ShoppingCart,
  Sparkles,
  Award
} from 'lucide-react';
import { Button } from '../common/Button';
import { Card3D, Card3DLayer } from '../common/Card3D';
import { LanguageSelector } from '../common/LanguageSelector';
import { registerFarmer, registerFarmerAsync, sendOtpAsync } from '../../utils/auth';
import { OtpVerification } from './OtpVerification';
import farmHeroBg from '../../assets/images/indian_farmer_vast_land_1787689207508.jpg';

export const FarmerSignup: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({
    name: 'Suresh Patil',
    phone: '+91 98220 12345',
    email: 'suresh.patil@kisanmail.in',
    password: 'password123',
    location: 'Niphad, Nashik, Maharashtra',
    farmOrBusinessName: 'Patil Organic Agri Farms',
    primaryCropOrDemand: 'Tomatoes'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendOtpAsync(formData.phone);
      setStep('otp');
    } catch {
      setStep('otp');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = async () => {
    setLoading(true);
    try {
      await registerFarmerAsync(formData);
      navigate('/farmer/dashboard');
    } catch {
      registerFarmer(formData);
      navigate('/farmer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans overflow-x-hidden">
      {/* IMMERSIVE FULL-SCREEN BACKGROUND */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={farmHeroBg}
          alt="Indian Farmer in vast agricultural land"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.12] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/75 lg:bg-gradient-to-r lg:from-black/75 lg:via-black/35 lg:to-black/80" />
        <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply" />
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 w-full max-w-7xl mx-auto min-h-[85vh] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* LEFT SCENIC PANEL */}
        <div className="lg:col-span-6 flex flex-col justify-between py-4 lg:py-8 space-y-6 text-white">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0B3D2E] via-[#18A558] to-emerald-400 flex items-center justify-center text-white font-black shadow-xl ring-1 ring-white/30">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                  Fresh<span className="text-emerald-400">Route</span>.2
                </span>
                <span className="text-[11px] text-emerald-200/90 font-bold uppercase tracking-wider">
                  Smart India Hackathon 2026
                </span>
              </div>
            </Link>
          </div>

          <div className="space-y-4 max-w-lg">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 bg-emerald-950/70 px-3.5 py-1.5 rounded-full border border-emerald-400/40 backdrop-blur-md inline-block">
              🌾 Farmer & FPO Registration
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight drop-shadow-lg">
              Join 140+ Progressive Farmers & FPOs Maximizing Net Harvest Value.
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed drop-shadow">
              Register your farm in 60 seconds. Get AI produce grading, decay shelf-life forecasting, and direct bulk buyer contracts.
            </p>

            <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-emerald-100/95">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero signup fees or commission lock-in</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct instant UPI settlement on dispatch</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multilingual Voice & Chat Assistant support</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-emerald-200/80 border-t border-white/10 pt-4 flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Direct Bank Deposit
            </span>
            <span>•</span>
            <span>100% Data Privacy</span>
            <span>•</span>
            <span>Verified APMC Integration</span>
          </div>
        </div>

        {/* RIGHT REGISTRATION FORM: Translucent Glass Card */}
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full bg-black/45 hover:bg-black/50 backdrop-blur-2xl border border-white/20 hover:border-emerald-400/40 shadow-[0_25px_70px_rgba(0,0,0,0.65)] rounded-3xl p-6 sm:p-8 text-white relative transition-all duration-300 ring-1 ring-white/10"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/15">
              <Link to="/login/farmer" className="text-xs font-bold text-emerald-200 hover:text-white transition-colors">
                ← Already registered? Login
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  to="/signup/buyer"
                  className="text-xs font-bold text-emerald-200 hover:text-white flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1 rounded-xl border border-emerald-400/40"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                  Buyer Sign Up
                </Link>
                <LanguageSelector variant="dark" />
              </div>
            </div>

            {step === 'otp' ? (
              <OtpVerification
                phone={formData.phone}
                onSuccess={handleOtpSuccess}
                onBack={() => setStep('form')}
                role="farmer"
              />
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow">
                    {t('auth.farmerSignupTitle')}
                  </h3>
                  <p className="text-xs text-emerald-200/80">
                    {t('auth.farmerSignupSubtitle')}
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-200 font-medium backdrop-blur-md">
                    {error}
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-100 block">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-emerald-300/70 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-emerald-400 focus:bg-black/60 focus:ring-2 focus:ring-emerald-500/30 backdrop-blur-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-100 block">Mobile (WhatsApp)</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-emerald-300/70 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-stone-400 text-sm font-mono focus:outline-none focus:border-emerald-400 focus:bg-black/60 focus:ring-2 focus:ring-emerald-500/30 backdrop-blur-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-100 block">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-emerald-300/70 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-emerald-400 focus:bg-black/60 focus:ring-2 focus:ring-emerald-500/30 backdrop-blur-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-100 block">Create Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-emerald-300/70 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-emerald-400 focus:bg-black/60 focus:ring-2 focus:ring-emerald-500/30 backdrop-blur-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-100 block">Farm / FPO Name</label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-emerald-300/70 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.farmOrBusinessName}
                          onChange={e => setFormData({ ...formData, farmOrBusinessName: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-emerald-400 focus:bg-black/60 focus:ring-2 focus:ring-emerald-500/30 backdrop-blur-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-100 block">Primary Produce</label>
                      <div className="relative">
                        <Sprout className="w-4 h-4 text-emerald-300/70 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          value={formData.primaryCropOrDemand}
                          onChange={e => setFormData({ ...formData, primaryCropOrDemand: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white text-sm focus:outline-none focus:border-emerald-400 focus:bg-black/80 focus:ring-2 focus:ring-emerald-500/30 backdrop-blur-sm"
                        >
                          <option value="Tomatoes" className="bg-slate-900 text-white">Hybrid Tomatoes</option>
                          <option value="Onions" className="bg-slate-900 text-white">Nashik Red Onions</option>
                          <option value="Potatoes" className="bg-slate-900 text-white">Kufri Jyoti Potatoes</option>
                          <option value="Capsicum" className="bg-slate-900 text-white">Green Capsicum</option>
                          <option value="Bananas" className="bg-slate-900 text-white">Grand Naine Bananas</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-emerald-100 block">Farm Location / APMC Taluka</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-emerald-300/70 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-emerald-400 focus:bg-black/60 focus:ring-2 focus:ring-emerald-500/30 backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    loading={loading}
                    icon={<ArrowRight className="w-4 h-4 text-white" />}
                    iconPosition="right"
                    className="shadow-xl mt-3 bg-gradient-to-r from-emerald-500 via-[#18A558] to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 border border-emerald-300/30 text-white font-bold"
                  >
                    Proceed to OTP Verification →
                  </Button>
                </form>

                <div className="pt-2 text-center text-xs text-emerald-200/80 border-t border-white/15">
                  Already registered?{' '}
                  <Link to="/login/farmer" className="font-bold text-emerald-300 hover:underline">
                    Sign in to your farm
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
