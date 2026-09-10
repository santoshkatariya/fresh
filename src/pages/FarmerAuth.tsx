import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FarmerLogin } from '../components/auth/FarmerLogin';
import { FarmerSignup } from '../components/auth/FarmerSignup';

export const FarmerAuthPage: React.FC = () => {
  const location = useLocation();
  const isSignup = location.pathname.includes('/signup');

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isSignup ? 'farmer-signup' : 'farmer-login'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full min-h-screen"
      >
        {isSignup ? <FarmerSignup /> : <FarmerLogin />}
      </motion.div>
    </AnimatePresence>
  );
};

