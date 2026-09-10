import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'motion/react';

export interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
  id?: string;
  depth?: number; // max tilt degrees, default 14
  glareEffect?: boolean; // dynamic cursor light sheen
  variant?: 'default' | 'glass' | 'emerald-glass' | 'teal-glass' | 'dark' | 'amber';
  scaleOnHover?: number;
}

export interface Card3DLayerProps {
  children: React.ReactNode;
  zDepth?: number; // Z-axis translation in pixels (e.g., 20, 40, 60)
  className?: string;
}

export const Card3DLayer: React.FC<Card3DLayerProps> = ({ children, zDepth = 25, className = '' }) => {
  return (
    <div
      style={{
        transform: `translateZ(${zDepth}px)`,
        transformStyle: 'preserve-3d'
      }}
      className={className}
    >
      {children}
    </div>
  );
};

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  containerClassName = '',
  onClick,
  id,
  depth = 12,
  glareEffect = true,
  variant = 'default',
  scaleOnHover = 1.02
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Raw mouse coordinates relative to card center (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for organic motion
  const springConfig = { damping: 22, stiffness: 240, mass: 0.4 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [depth, -depth]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-depth, depth]), springConfig);
  const scale = useSpring(isHovered ? scaleOnHover : 1, springConfig);

  // Glare position (0% to 100%)
  const glarePercentX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glarePercentY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  // Reactive hardware-accelerated template for specular sheen
  const glareBackground = useMotionTemplate`radial-gradient(350px circle at ${glarePercentX}% ${glarePercentY}%, rgba(255,255,255,${
    variant === 'emerald-glass' || variant === 'teal-glass' || variant === 'dark' ? '0.22' : '0.45'
  }), transparent 75%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Normalize between -0.5 and 0.5
    mouseX.set(clientX / width - 0.5);
    mouseY.set(clientY / height - 0.5);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const variantStyles = {
    default: 'bg-white border border-slate-200/90 text-slate-900 shadow-sm hover:border-slate-300/90',
    glass: 'bg-white/80 backdrop-blur-xl border border-white/40 text-slate-900 shadow-xl',
    'emerald-glass': 'bg-[#062016]/85 backdrop-blur-xl border border-emerald-500/30 text-white shadow-2xl shadow-emerald-950/40 hover:border-emerald-400/60',
    'teal-glass': 'bg-[#042f2e]/85 backdrop-blur-xl border border-teal-500/30 text-white shadow-2xl shadow-teal-950/40 hover:border-teal-400/60',
    dark: 'bg-slate-900/90 backdrop-blur-xl border border-slate-800 text-white shadow-xl',
    amber: 'bg-gradient-to-b from-white to-amber-50/70 border border-amber-200/80 text-slate-900 shadow-md'
  };

  return (
    <div
      style={{ perspective: 1100 }}
      className={`relative select-none ${containerClassName}`}
    >
      <motion.div
        ref={cardRef}
        id={id}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d'
        }}
        className={`relative rounded-3xl transition-colors duration-200 overflow-hidden ${variantStyles[variant]} ${
          onClick ? 'cursor-pointer' : ''
        } ${className}`}
      >
        {/* Dynamic Specular Glare Layer */}
        {glareEffect && (
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-200 z-30"
            style={{
              opacity: isHovered ? 1 : 0,
              background: glareBackground
            }}
          />
        )}

        {/* Content Container with 3D Space */}
        <div
          style={{
            transform: 'translateZ(18px)',
            transformStyle: 'preserve-3d'
          }}
          className="relative z-10 h-full"
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
};
