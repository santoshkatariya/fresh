import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  ArrowRight,
  Building,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  Tag,
  Leaf,
  ShieldCheck,
  CheckCircle2,
  Tractor
} from 'lucide-react';
import { Button } from '../common/Button';
import { LanguageSelector } from '../common/LanguageSelector';
import { registerBuyer } from '../../utils/auth';
import { OtpVerification } from './OtpVerification';

export const BuyerSignup: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [buyerTier, setBuyerTier] = useState<'bulk_business' | 'household'>('bulk_business');
  const [formData, setFormData] = useState({
    businessName: 'Hotel Grand Residency & Banquets',
    contactName: 'Anil Sharma',
    phone: '+91 98110 33411',
    email: 'anil.sharma@freshmart.co.in',
    password: 'password123',
    businessType: 'Hotel & Banquets (4-Star)',
    location: 'Bhandup Central DC, Mumbai',
    requiredProduce: 'Tomatoes (Grade A), Onions, Capsicum'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.contactName || !formData.phone || !formData.email || !formData.password) {
      setError('Please fill in all required procurement fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 400);
  };

  const handleOtpSuccess = () => {
    registerBuyer({
      ...formData,
      buyerTier,
      businessCategory: formData.businessType
    });
    navigate('/buyer/dashboard');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#f8faf7] text-stone-900 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-stone-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Left Visual Half */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-[#1b4332] text-white overflow-hidden flex-col justify-between p-12">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
          alt="Wholesale food procurement"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-md group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Fresh<span className="text-emerald-400">Route</span> AI
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-4 max-w-md">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md inline-block">
            🏢 Enterprise Procurement Setup
          </span>
          <h2 className="text-3xl font-black text-white leading-snug">
            Streamline Fresh Produce Procurement with Direct Farm Contracts.
          </h2>
          <p className="text-sm text-emerald-100/85 leading-relaxed">
            Eliminate intermediary markups, view pre-harvest quality scores, and automate receiving dock workflows.
          </p>

          <div className="space-y-2 pt-2 text-xs text-stone-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Automated GST invoicing & digital consignment receipts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Digital Escrow with guaranteed dock-grade quality</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Real-time GPS reefer & ambient vehicle tracking</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-emerald-200/70 border-t border-white/10 pt-4">
          Automated GST invoicing • Digital Escrow • Quality Guarantee
        </div>
      </div>

      {/* Right Form Half */}
      <div className="col-span-12 lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 md:p-12 bg-white">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-stone-600 hover:text-stone-900 text-sm">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/signup/farmer"
              className="text-xs font-bold text-[#1b4332] hover:underline flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200"
            >
              <Tractor className="w-3.5 h-3.5" />
              Register as Farmer
            </Link>
            <LanguageSelector variant="light" />
          </div>
        </div>

        <div className="max-w-xl w-full mx-auto my-6 space-y-6">
          {step === 'otp' ? (
            <OtpVerification
              phone={formData.phone}
              onSuccess={handleOtpSuccess}
              onBack={() => setStep('form')}
              role="buyer"
            />
          ) : (
            <>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1b4332] border border-emerald-200 flex items-center justify-center mb-2 shadow-xs">
                  <ShoppingCart className="w-6 h-6 text-[#1b4332]" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  {t('auth.buyerSignupTitle')}
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Connect your supply chain directly to verified harvest batches.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}

              {/* Buyer Classification Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black text-stone-800 uppercase tracking-wider block">
                  Select Buyer Classification & Procurement Tier *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setBuyerTier('bulk_business');
                      setFormData({
                        ...formData,
                        businessName: 'Hotel Grand Residency & Banquets',
                        businessType: 'Hotel & Banquets (4-Star)',
                        requiredProduce: 'Tomatoes (Grade A, 80kg/wk), Onions, Capsicum'
                      });
                    }}
                    className={`p-3.5 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                      buyerTier === 'bulk_business'
                        ? 'border-[#1b4332] bg-emerald-50/50 shadow-xs'
                        : 'border-stone-200 bg-stone-50/60 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                          <span>🏢</span> Bulk / Business Buyer
                        </span>
                        {buyerTier === 'bulk_business' && (
                          <CheckCircle2 className="w-4 h-4 text-[#1b4332]" />
                        )}
                      </div>
                      <p className="text-xs text-stone-600 leading-snug">
                        Hotels, Restaurants, Cloud Kitchens, Caterers & Retail Chains.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-emerald-900/10">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300/60">
                        🛡️ 5–7 Day Cutoff • 25% Farmer Protection
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBuyerTier('household');
                      setFormData({
                        ...formData,
                        businessName: 'Pune West Apartment Society Co-op',
                        businessType: 'Residential Apartment Society Co-op',
                        requiredProduce: 'Tomatoes (15kg/wk), Onions, Leafy Greens'
                      });
                    }}
                    className={`p-3.5 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                      buyerTier === 'household'
                        ? 'border-[#1b4332] bg-emerald-50/50 shadow-xs'
                        : 'border-stone-200 bg-stone-50/60 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                          <span>🏡</span> Household / Co-op
                        </span>
                        {buyerTier === 'household' && (
                          <CheckCircle2 className="w-4 h-4 text-[#1b4332]" />
                        )}
                      </div>
                      <p className="text-xs text-stone-600 leading-snug">
                        Individual households, families & residential apartment groups.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-emerald-900/10">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300/60">
                        🌿 Flexible 24–48h Skip • ₹0 Penalty
                      </span>
                    </div>
                  </button>
                </div>

                {/* Tier Policy Transparency Explainer */}
                <div className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 ${
                  buyerTier === 'bulk_business'
                    ? 'bg-amber-50/80 border border-amber-200 text-amber-900'
                    : 'bg-emerald-50/80 border border-emerald-200 text-emerald-900'
                }`}>
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>
                      {buyerTier === 'bulk_business'
                        ? 'Tier Policy: Farmer Harvest Lock & 5–7 Day Cutoff'
                        : 'Tier Policy: Household Flexible Window (24–48 hrs)'}
                    </strong>
                    <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                      {buyerTier === 'bulk_business'
                        ? 'Because hotel & restaurant orders constitute a large volume of the farmer’s planned harvest, modifications are locked 5 days prior. Cancellations after cutoff incur a 25% compensation fee paid directly to the farmer to cover unharvested crop losses.'
                        : 'Household pre-orders are aggregated across many families. You may freely adjust, skip, or pause baskets up to 24–48 hours before fulfillment with zero penalty.'}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">
                      {t('auth.businessName')} *
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="e.g. FreshMart Logistics Pvt Ltd"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-[#1b4332] focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">
                      {t('auth.contactName')} *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.contactName}
                        onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                        placeholder="e.g. Anil Sharma"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-[#1b4332] focus:bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">
                      {t('auth.email')} *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="anil@freshmart.co.in"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-[#1b4332] focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">
                      {t('auth.phone')} * (Mobile for OTP)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98110 33411"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-sm font-mono focus:outline-none focus:border-[#1b4332] focus:bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">
                      {t('auth.password')} *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-[#1b4332] focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">
                      {buyerTier === 'bulk_business' ? 'Establishment Category' : 'Household / Co-op Category'}
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-[#1b4332] focus:bg-white"
                    >
                      {buyerTier === 'bulk_business' ? (
                        <>
                          <option value="Hotel & Banquets (4-Star)">Hotel & Banquets (4-Star / 5-Star)</option>
                          <option value="Fine-Dine Restaurant / Bistro">Fine-Dine Restaurant / Bistro</option>
                          <option value="Cloud Kitchen / Dark Store">Cloud Kitchen / Dark Store (Zepto, Blinkit)</option>
                          <option value="Corporate / Mandir Catering Cluster">Corporate / Mandir Catering Cluster</option>
                          <option value="Supermarket / Retail Chain">Supermarket / Retail Chain (Reliance Fresh, DMart)</option>
                          <option value="Food Processing / Canning Unit">Food Processing / Puree Canning Unit</option>
                        </>
                      ) : (
                        <>
                          <option value="Residential Apartment Society Co-op">Residential Apartment Society Co-op</option>
                          <option value="Single Family Household">Single Family Household</option>
                          <option value="Urban Organic Consumer Collective">Urban Organic Consumer Collective</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">
                      {t('auth.location')}
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Bhandup DC, Mumbai"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-[#1b4332] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">
                      {t('auth.requiredProduce')}
                    </label>
                    <div className="relative">
                      <Tag className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.requiredProduce}
                        onChange={e => setFormData({ ...formData, requiredProduce: e.target.value })}
                        placeholder="e.g. Tomatoes (800kg/day), Onions"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-[#1b4332] focus:bg-white"
                      />
                    </div>
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
                  className="mt-4 shadow-sm"
                >
                  Continue to Mobile OTP Verification →
                </Button>
              </form>

              <div className="text-center text-xs text-stone-600">
                {t('auth.alreadyHaveAccount')}{' '}
                <Link to="/login/buyer" className="font-bold text-[#1b4332] hover:underline">
                  {t('auth.loginBtn')}
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="text-center text-xs text-stone-400">
          FreshRoute AI • Smart India Hackathon 2026 Procurement Engine
        </div>
      </div>
    </div>
  );
};

