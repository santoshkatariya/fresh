import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BuyerLogin } from '../components/auth/BuyerLogin';
import { BuyerSignup } from '../components/auth/BuyerSignup';

export const BuyerAuthPage: React.FC = () => {
  const location = useLocation();
  const isSignup = location.pathname.includes('/signup');

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isSignup ? 'buyer-signup' : 'buyer-login'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full min-h-screen"
      >
        {isSignup ? <BuyerSignup /> : <BuyerLogin />}
      </motion.div>
    </AnimatePresence>
  );
};

