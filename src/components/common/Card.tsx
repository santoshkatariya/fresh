import React from 'react';
import { motion } from 'motion/react';
import { Card3D } from './Card3D';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  tilt3d?: boolean;
  onClick?: () => void;
  id?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderVariant?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  tilt3d = false,
  onClick,
  id,
  padding = 'md',
  borderVariant = 'default'
}) => {
  // Padding Math: Container outer padding meets minimum 16px
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  // Sophisticated neutrals, WCAG AA contrast, subtle 1px translucent borders
  const borderStyles = {
    default: 'border-slate-200/90 bg-white text-slate-900 shadow-xs hover:border-slate-300/90',
    accent: 'border-emerald-200/90 bg-gradient-to-b from-white to-[#f4f9f4] text-slate-900 shadow-xs',
    success: 'border-emerald-300 bg-gradient-to-b from-white to-[#f0fdf4] text-slate-900 shadow-xs',
    warning: 'border-amber-200 bg-gradient-to-b from-white to-[#fffbeb] text-slate-900 shadow-xs',
    danger: 'border-rose-200 bg-gradient-to-b from-white to-[#fef2f2] text-slate-900 shadow-xs'
  };

  if (tilt3d) {
    return (
      <Card3D
        id={id}
        onClick={onClick}
        className={`p-0 ${borderStyles[borderVariant]} ${className}`}
      >
        <div className={paddingClasses[padding]}>{children}</div>
      </Card3D>
    );
  }

  const Component = hoverEffect ? motion.div : 'div';
  const motionProps = hoverEffect
    ? {
        whileHover: { y: -3, transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] } },
        whileTap: { scale: 0.99 }
      }
    : {};

  return (
    <Component
      id={id}
      onClick={onClick}
      className={`rounded-3xl border transition-all ${borderStyles[borderVariant]} ${paddingClasses[padding]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...motionProps}
    >
      {children}
    </Component>
  );
};



