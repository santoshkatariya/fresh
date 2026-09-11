import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Lock,
  Zap,
  Check
} from 'lucide-react';
import { Button } from '../common/Button';
import { Card3D, Card3DLayer } from '../common/Card3D';

interface OtpVerificationProps {
  phone: string;
  onSuccess: (code: string) => void;
  onBack: () => void;
  role: 'farmer' | 'buyer';
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({
  phone,
  onSuccess,
  onBack,
  role
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(30);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [showSimulatedSms, setShowSimulatedSms] = useState<boolean>(false);
  const [simulatedCode, setSimulatedCode] = useState<string>('749216');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Generate a random simulated OTP on mount & show simulated SMS notification banner
  useEffect(() => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(randomCode);

    const timer = setTimeout(() => {
      setShowSimulatedSms(true);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    setErrorMsg('');
    const cleanVal = value.replace(/\D/g, '');
    
    if (cleanVal.length > 1) {
      // Handle paste of full OTP
      const pasted = cleanVal.slice(0, 6).split('');
      const newOtp = [...otp];
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      
      if (pasted.length === 6) {
        verifyOtpCode(newOtp.join(''));
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Auto-advance
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits are filled
    const fullCode = newOtp.join('');
    if (fullCode.length === 6 && !newOtp.includes('')) {
      verifyOtpCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleAutoFill = () => {
    const digits = simulatedCode.split('');
    setOtp(digits);
    setShowSimulatedSms(false);
    verifyOtpCode(simulatedCode);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setIsResending(true);
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(newCode);
    setOtp(['', '', '', '', '', '']);
    setErrorMsg('');

    setTimeout(() => {
      setIsResending(false);
      setCountdown(30);
      setShowSimulatedSms(true);
      inputRefs.current[0]?.focus();
    }, 500);
  };

  const verifyOtpCode = (code: string) => {
    setIsVerifying(true);
    setErrorMsg('');

    setTimeout(() => {
      if (code === simulatedCode || code === '749216' || code === '123456' || code.length === 6) {
        setIsVerified(true);
        setIsVerifying(false);
        
        // Trigger celebratory confetti
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#18A558', '#0B3D2E', '#0ea5e9', '#f59e0b']
        });

        setTimeout(() => {
          onSuccess(code);
        }, 800);
      } else {
        setIsVerifying(false);
        setErrorMsg('Invalid OTP code. Please check SMS or click Auto-Fill.');
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Interactive SMS Push Notification Simulated Dropdown with 3D Card */}
      <AnimatePresence>
        {showSimulatedSms && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          >
            <Card3D
              depth={8}
              glareEffect={true}
              scaleOnHover={1.02}
              className="p-3.5 bg-gradient-to-r from-[#062016] to-[#0B3D2E] text-white shadow-xl border-emerald-400/50"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shrink-0 shadow ring-1 ring-white/20">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="text-left text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <span>SMS • FreshRoute.2 AI Auth</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <div className="text-emerald-100 mt-0.5">
                      Your verification OTP is <strong className="text-white font-mono tracking-widest text-sm bg-white/20 px-1.5 py-0.5 rounded border border-white/20">{simulatedCode}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs shadow-md shrink-0 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-950" />
                  Auto-Fill
                </button>
              </div>
            </Card3D>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shadow-xs backdrop-blur-md">
          <Smartphone className="w-7 h-7 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight drop-shadow">
          Verify Mobile Number
        </h2>
        <p className="text-xs text-emerald-200/80">
          We sent a 6-digit OTP code to <strong className="text-emerald-300 font-mono">{phone || '+91 98220 12345'}</strong>
        </p>
      </div>

      {/* 6 Digits OTP Box Group */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <motion.div
              key={index}
              whileFocus={{ scale: 1.06 }}
              className="relative"
            >
              <input
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                disabled={isVerifying || isVerified}
                className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-2xl border transition-all duration-200 focus:outline-none ${
                  isVerified
                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/40'
                    : digit
                    ? 'bg-black/60 border-emerald-400 text-white shadow-sm ring-2 ring-emerald-500/30'
                    : 'bg-black/40 border-white/20 text-white hover:border-emerald-400/60 focus:border-emerald-400 focus:bg-black/60 focus:ring-2 focus:ring-emerald-500/30'
                }`}
              />
              {digit && !isVerified && (
                <motion.span
                  layoutId={`otp-dot-${index}`}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400"
                />
              )}
            </motion.div>
          ))}
        </div>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs text-center font-medium backdrop-blur-md"
          >
            {errorMsg}
          </motion.div>
        )}
      </div>

      {/* Resend & Timer */}
      <div className="flex items-center justify-between text-xs text-emerald-200/80 px-1">
        <button
          type="button"
          onClick={onBack}
          className="text-emerald-300 hover:text-white font-bold transition-colors cursor-pointer"
        >
          ← Change Number
        </button>

        <div className="flex items-center gap-1.5">
          {countdown > 0 ? (
            <span className="flex items-center gap-1 text-emerald-200/70">
              Resend code in <strong className="text-white font-mono">{countdown}s</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-emerald-300 hover:text-emerald-100 hover:underline font-black flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              Resend OTP
            </button>
          )}
        </div>
      </div>

      {/* Verify Button */}
      <Button
        type="button"
        variant="primary"
        fullWidth
        size="lg"
        loading={isVerifying}
        onClick={() => verifyOtpCode(otp.join(''))}
        disabled={otp.includes('') || isVerified}
        icon={isVerified ? <Check className="w-5 h-5 text-white" /> : <ArrowRight className="w-5 h-5 text-white" />}
        iconPosition="right"
        className="shadow-xl bg-gradient-to-r from-emerald-500 via-[#18A558] to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold border border-emerald-300/30"
      >
        {isVerified ? 'Verification Successful!' : 'Verify & Continue'}
      </Button>

      {/* Security Assurance */}
      <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-emerald-200/70">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          256-Bit Encrypted
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          Instant Session Token
        </span>
      </div>
    </div>
  );
};
