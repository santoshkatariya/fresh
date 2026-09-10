import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tractor,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  Sparkles,
  Smartphone,
  KeyRound,
  ShoppingCart,
  Zap,
  Leaf,
  Eye,
  EyeOff,
  TrendingUp,
  MapPin,
  Check,
  Activity,
  Award,
  Mic,
  BadgeCheck
} from 'lucide-react';
import { Button } from '../common/Button';
import { Card3D, Card3DLayer } from '../common/Card3D';
import { LanguageSelector } from '../common/LanguageSelector';
import { loginUser, loginUserAsync, sendOtpAsync, verifyOtpAsync } from '../../utils/auth';
import { OtpVerification } from './OtpVerification';
import farmHeroBg from '../../assets/images/indian_farmer_vast_land_1787689207508.jpg';

export const FarmerLogin: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language || 'en';

  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('ramesh.patil@kisanmail.in');
  const [password, setPassword] = useState('pass1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [phone, setPhone] = useState('+91 98220 12345');
  const [otpStep, setOtpStep] = useState<'phone' | 'verify'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(
        lang === 'kn'
          ? 'ದಯವಿಟ್ಟು ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಎರಡನ್ನೂ ನಮೂದಿಸಿ'
          : lang === 'hi'
          ? 'कृपया ईमेल और पासवर्ड दोनों दर्ज करें'
          : 'Please enter both email and password'
      );
      return;
    }
    setLoading(true);
    setError('');
    try {
      await loginUserAsync({ email }, 'farmer');
      navigate('/farmer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError(
        lang === 'kn'
          ? 'ದಯವಿಟ್ಟು ಸರಿಯಾದ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ'
          : lang === 'hi'
          ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें'
          : 'Please enter a valid 10-digit mobile number'
      );
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendOtpAsync(phone);
      setOtpStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = async (code: string) => {
    setLoading(true);
    try {
      await verifyOtpAsync(phone, code, 'farmer');
      navigate('/farmer/dashboard');
    } catch {
      loginUser('ramesh.patil@kisanmail.in', 'farmer');
      navigate('/farmer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail('ramesh.patil@kisanmail.in');
    setPassword('pass1234');
    setLoading(true);
    setError('');
    try {
      await loginUserAsync({ email: 'ramesh.patil@kisanmail.in' }, 'farmer');
      navigate('/farmer/dashboard');
    } catch {
      loginUser('ramesh.patil@kisanmail.in', 'farmer');
      navigate('/farmer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans overflow-x-hidden">
      {/* 1. IMMERSIVE FULL-SCREEN BACKGROUND: Farmer working in vast farmland */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={farmHeroBg}
          alt="Indian Farmer in his vast agricultural land"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.12] scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Subtle cinematic gradient overlays allowing clear view of the farmer and crops */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/75 lg:bg-gradient-to-r lg:from-black/75 lg:via-black/35 lg:to-black/80" />
        <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/15 rounded-full blur-3xl" />
      </div>

      {/* 2. MAIN PARALLEL CONTAINER: Left scenic telemetry showcase + Right login card */}
      <div className="relative z-10 w-full max-w-7xl mx-auto min-h-[85vh] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* LEFT PARALLEL SIDE: Vast Farm View & Real-Time Kisan Intelligence HUD */}
        <div className="lg:col-span-7 flex flex-col justify-between py-4 lg:py-8 space-y-8 text-white">
          {/* Top Brand Logo & Home Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0B3D2E] via-[#18A558] to-emerald-400 flex items-center justify-center text-white font-black shadow-xl shadow-emerald-950/60 group-hover:scale-105 transition-transform ring-1 ring-white/30">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                  Fresh<span className="text-emerald-400">Route</span>.2
                </span>
                <span className="text-[11px] text-emerald-200/90 font-bold uppercase tracking-wider drop-shadow">
                  Smart India Hackathon 2026
                </span>
              </div>
            </Link>

            <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 bg-black/50 backdrop-blur-md border border-emerald-400/30 px-4 py-1.5 rounded-full shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              {lang === 'kn' ? 'ನೇರ ಮಾರುಕಟ್ಟೆ ಸಕ್ರಿಯ' : lang === 'hi' ? 'सीधा बाजार सक्रिय' : 'Live APMC Arbitrage Active'}
            </span>
          </div>

          {/* Hero Banner Text Over Vast Land */}
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 backdrop-blur-md shadow-lg">
              <Tractor className="w-4 h-4 text-emerald-400" />
              {lang === 'kn' ? 'ರೈತರ ಕೃಷಿ ದ್ವಾರ' : lang === 'hi' ? 'किसान कृषि प्रवेश' : 'Kisan Agricultural Gateway'}
            </div>

            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
              {lang === 'kn'
                ? 'ನಿಮ್ಮ ಸ್ವಂತ ಭೂಮಿಯಿಂದ ನೇರ ಗರಿಷ್ಠ ಬೆಲೆ.'
                : lang === 'hi'
                ? 'अपनी भूमि से सीधा अधिकतम मंडी भाव और लाभ।'
                : 'Direct Market Value From Your Vast Farmland.'}
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed drop-shadow">
              {lang === 'kn'
                ? 'AI ಕ್ಯಾಮರಾ ತಪಾಸಣೆ, ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದ ನೇರ ಖರೀದಿ ಮತ್ತು ತ್ವರಿತ ಬ್ಯಾಂಕ್ ಪಾವತಿ.'
                : lang === 'hi'
                ? 'एआई क्वालिटी स्कैनर, बिना बिचौलियों के सीधा व्यापार और तुरंत यूपीआई भुगतान।'
                : 'AI-powered produce grading, zero middleman arbitrage, and guaranteed instant UPI bank settlements.'}
            </p>
          </div>

          {/* Interactive Floating 3D Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {/* Card 1: Live Arbitrage */}
            <Card3D
              variant="emerald-glass"
              depth={12}
              glareEffect={true}
              scaleOnHover={1.03}
              className="p-4 bg-black/45 backdrop-blur-xl border-emerald-400/40 shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <Card3DLayer zDepth={20} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Live Batch Arbitrage</h4>
                    <span className="text-[10px] text-emerald-200/80">Kolar Hybrid • Grade A</span>
                  </div>
                </Card3DLayer>
                <Card3DLayer zDepth={25}>
                  <span className="text-[11px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    +38% Net Gain
                  </span>
                </Card3DLayer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <Card3DLayer zDepth={15} className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[9px] text-emerald-200/70 font-semibold block uppercase">Local Mandi</span>
                  <span className="text-sm font-black text-rose-300">₹24/kg</span>
                </Card3DLayer>
                <Card3DLayer zDepth={25} className="p-2 rounded-xl bg-emerald-500/25 border border-emerald-400/50 shadow-inner">
                  <span className="text-[9px] text-emerald-200 font-bold block uppercase">FreshRoute.2</span>
                  <span className="text-sm font-black text-emerald-300">₹34/kg</span>
                </Card3DLayer>
              </div>
            </Card3D>

            {/* Card 2: Voice & Quality Guarantee */}
            <Card3D
              variant="emerald-glass"
              depth={12}
              glareEffect={true}
              scaleOnHover={1.03}
              className="p-4 bg-black/45 backdrop-blur-xl border-emerald-400/40 shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <Card3DLayer zDepth={20} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/30 border border-teal-400/40 flex items-center justify-center text-teal-300">
                    <Mic className="w-4 h-4 text-emerald-300 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Multilingual Voice Bot</h4>
                    <span className="text-[10px] text-emerald-200/80">ಕನ್ನಡ • हिंदी • English</span>
                  </div>
                </Card3DLayer>
                <Card3DLayer zDepth={25}>
                  <span className="text-[10px] font-black text-white bg-teal-900/80 border border-teal-400/40 px-2 py-0.5 rounded-full">
                    Voice Active
                  </span>
                </Card3DLayer>
              </div>

              <div className="space-y-1.5 text-[11px] text-emerald-100/90 pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>1-Click Produce AI Camera Grading</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Direct Escrow Bank Transfer</span>
                </div>
              </div>
            </Card3D>
          </div>

          {/* Bottom Security Trust Footprint */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-emerald-200/80 pt-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              256-Bit Encrypted Security
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              Government APMC Verified
            </span>
          </div>
        </div>

        {/* RIGHT PARALLEL SIDE: Blended Translucent Glass Login Card */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full bg-black/45 hover:bg-black/50 backdrop-blur-2xl border border-white/20 hover:border-emerald-400/40 shadow-[0_25px_70px_rgba(0,0,0,0.65)] rounded-3xl p-6 sm:p-8 xl:p-9 text-white relative transition-all duration-300 ring-1 ring-white/10"
          >
            {/* Top Navigation Row Inside Card */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/15">
              <Link
                to="/"
                className="text-xs font-bold text-emerald-200 hover:text-white transition-colors flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-white/10"
              >
                ← {lang === 'kn' ? 'ಮುಖಪುಟ' : lang === 'hi' ? 'होम' : 'Home'}
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  to="/login/buyer"
                  className="text-xs font-bold text-emerald-200 hover:text-white flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1.5 rounded-xl border border-emerald-400/40 transition-all shadow-2xs hover:-translate-y-0.5 active:scale-95"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Buyer Portal</span>
                </Link>
                <LanguageSelector variant="dark" />
              </div>
            </div>

            {/* OTP Mode Screen or Password Mode */}
            {authMode === 'otp' && otpStep === 'verify' ? (
              <OtpVerification
                phone={phone}
                onSuccess={handleOtpSuccess}
                onBack={() => setOtpStep('phone')}
                role="farmer"
              />
            ) : (
              <div className="space-y-5">
                {/* Form Title & Icon */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 flex items-center justify-center shadow-xs shrink-0 backdrop-blur-md">
                      <Tractor className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow">
                        {lang === 'kn' ? 'ರೈತರ ಲಾಗಿನ್' : lang === 'hi' ? 'किसान लॉगिन' : t('auth.farmerLoginTitle')}
                      </h2>
                      <p className="text-xs text-emerald-200/80">
                        {lang === 'kn'
                          ? 'ಫಸಲಿನ ನಿರ್ವಹಣೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ'
                          : lang === 'hi'
                          ? 'फसल प्रबंधन के लिए लॉगिन करें'
                          : 'Sign in to access your farm intelligence'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1-Click Fast Interactive Demo Sign-In Card */}
                <Card3D
                  id="quick-demo-farmer-btn"
                  depth={8}
                  glareEffect={true}
                  scaleOnHover={1.02}
                  onClick={handleQuickDemo}
                  className="p-3.5 bg-gradient-to-r from-emerald-950/70 via-emerald-900/50 to-teal-950/70 border-emerald-400/40 hover:border-emerald-300 shadow-lg cursor-pointer rounded-2xl backdrop-blur-md text-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-black text-xs shadow-md shrink-0 ring-1 ring-white/20">
                        RP
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs sm:text-sm text-white">Ramesh Patil</span>
                          <span className="text-[9px] font-bold text-emerald-200 bg-emerald-500/30 border border-emerald-400/40 px-1.5 py-0.2 rounded">
                            Verified Farmer
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-200/80 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          Patil Organic Farms, Kolar
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-black text-white bg-emerald-500/30 hover:bg-emerald-500/40 px-2.5 py-1.5 rounded-xl border border-emerald-400/50 shadow-sm shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                      <span>Instant Demo</span>
                    </div>
                  </div>
                </Card3D>

                {/* Switcher Tabs: Password vs Mobile OTP */}
                <div className="p-1 rounded-2xl bg-black/50 border border-white/15 grid grid-cols-2 gap-1 text-xs font-bold backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('password');
                      setError('');
                    }}
                    className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      authMode === 'password'
                        ? 'bg-gradient-to-r from-emerald-500 to-[#18A558] text-white shadow-md font-black'
                        : 'text-emerald-200/80 hover:text-white'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-emerald-200" />
                    {lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್' : lang === 'hi' ? 'पासवर्ड' : 'Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('otp');
                      setError('');
                    }}
                    className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      authMode === 'otp'
                        ? 'bg-gradient-to-r from-emerald-500 to-[#18A558] text-white shadow-md font-black'
                        : 'text-emerald-200/80 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
                    {lang === 'kn' ? 'ಮೊಬೈಲ್ ಒಟಿಪಿ' : lang === 'hi' ? 'मोबाइल ओटीपी' : 'Mobile OTP'}
                  </button>
                </div>

                {/* Error Message Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-xs text-rose-200 font-medium flex items-center gap-2 backdrop-blur-md"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 animate-ping" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Form Body */}
                {authMode === 'password' ? (
                  <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-100 block">
                        {t('auth.email')} / Kisan ID
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-emerald-300/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="ramesh.patil@kisanmail.in"
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-white/20 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-emerald-400 focus:bg-black/60 focus:ring-2 focus:ring-emerald-500/30 transition-all backdrop-blur-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-emerald-100 block">
                          {t('auth.password')}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            alert(
                              lang === 'kn'
                                ? 'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಲು ಡೆಮೊ ಖಾತೆಯ ಇಮೇಲ್ ಅಥವಾ ಒಟಿಪಿ ಮೋಡ್ ಬಳಸಿ.'
                                : 'For demo access, you can sign in directly with 1-click or use OTP mode.'
                            );
                          }}
                          className="text-[11px] text-emerald-300 hover:text-emerald-200 hover:underline cursor-pointer font-bold"
                        >
                          {lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರುವಿರಾ?' : lang === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-emerald-300/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-black/40 border border-white/20 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-emerald-400 focus:bg-black/60 focus:ring-2 focus:ring-emerald-500/30 transition-all backdrop-blur-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300/70 hover:text-white p-1 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-emerald-200/90 pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-white/30 bg-black/40 text-emerald-500 focus:ring-emerald-400"
                        />
                        <span>{lang === 'kn' ? 'ನನ್ನನ್ನು ನೆನಪಿಡಿ' : lang === 'hi' ? 'मुझे याद रखें' : 'Remember this device'}</span>
                      </label>
                      <span className="text-[10px] text-emerald-300/60 font-mono hidden sm:inline">Press Enter ↵</span>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      size="lg"
                      loading={loading}
                      icon={<ArrowRight className="w-4 h-4 text-white" />}
                      iconPosition="right"
                      className="shadow-xl mt-2 bg-gradient-to-r from-emerald-500 via-[#18A558] to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 border border-emerald-300/30 text-white font-bold"
                    >
                      {lang === 'kn' ? 'ಲಾಗಿನ್ ಮಾಡಿ' : lang === 'hi' ? 'लॉगिन करें' : t('auth.loginBtn')}
                    </Button>
                  </form>
                ) : (
                  /* Mobile OTP Phone Form */
                  <form onSubmit={handleSendOtp} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-100 block">
                        {lang === 'kn'
                          ? 'ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ'
                          : lang === 'hi'
                          ? 'पंजीकृत मोबाइल नंबर'
                          : 'Registered Kisan Mobile Number'}
                      </label>
                      <div className="relative">
                        <Smartphone className="w-4 h-4 text-emerald-300/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+91 98220 12345"
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-white/20 text-white placeholder:text-stone-400 text-sm font-mono focus:outline-none focus:border-emerald-400 focus:bg-black/60 focus:ring-2 focus:ring-emerald-500/30 transition-all backdrop-blur-sm"
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
                      className="shadow-xl mt-2 bg-gradient-to-r from-emerald-500 via-[#18A558] to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 border border-emerald-300/30 text-white font-bold"
                    >
                      {lang === 'kn'
                        ? '೬-ಅಂಕಿಯ ಒಟಿಪಿ ಕಳುಹಿಸಿ →'
                        : lang === 'hi'
                        ? '६-अंकों का ओटीपी भेजें →'
                        : 'Send 6-Digit OTP →'}
                    </Button>
                  </form>
                )}

                {/* Sign Up Redirect */}
                <div className="pt-3 text-center text-xs text-emerald-200/80 border-t border-white/15">
                  {t('auth.dontHaveAccount')}{' '}
                  <Link to="/signup/farmer" className="font-bold text-emerald-300 hover:text-emerald-100 underline ml-1">
                    {lang === 'kn' ? 'ಹೊಸ ರೈತ ಖಾತೆ ತೆರೆಯಿರಿ' : lang === 'hi' ? 'नया खाता बनाएं' : t('auth.signupBtn')}
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
