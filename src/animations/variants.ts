export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.4, ease: "easeOut" as const }
};

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.4, ease: "easeOut" as const }
};

export const fadeDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.35, ease: "easeOut" as const }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.35, ease: "easeOut" as const }
};

export const slideInRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.35, ease: "easeOut" as const }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 24 },
  transition: { duration: 0.35, ease: "easeOut" as const }
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const cardHover = {
  whileHover: { 
    y: -4, 
    boxShadow: "0 14px 30px -10px rgba(27, 77, 47, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.04)" 
  },
  transition: { duration: 0.25, ease: "easeOut" }
};

export const pulseBadge = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.9, 1, 0.9],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};
