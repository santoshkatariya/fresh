import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // UI/UX Pro Max: Strict 2x horizontal to vertical padding geometry, tactile spring active feedback, WCAG AA compliance
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#f8faf7] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer whitespace-nowrap';

  const variants = {
    primary: 'bg-[#0B3D2E] text-white hover:bg-[#062016] focus:ring-emerald-700 shadow-sm shadow-emerald-950/15 hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-[#18A558] text-white hover:bg-[#158f4c] focus:ring-emerald-500 shadow-sm shadow-emerald-950/15 hover:-translate-y-0.5 active:translate-y-0',
    outline: 'border border-slate-300/90 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-400 shadow-xs hover:-translate-y-0.5 active:translate-y-0',
    ghost: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300',
    danger: 'bg-rose-700 text-white hover:bg-rose-800 focus:ring-rose-600 shadow-sm hover:-translate-y-0.5 active:translate-y-0',
    success: 'bg-[#18A558] text-white hover:bg-[#137f43] focus:ring-emerald-600 shadow-sm hover:-translate-y-0.5 active:translate-y-0'
  };

  // Math: 2x horizontal padding vs vertical padding
  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[36px] rounded-xl',
    md: 'text-sm px-5 py-2.5 gap-2 min-h-[44px] rounded-2xl',
    lg: 'text-base px-6 py-3 gap-2.5 min-h-[48px] rounded-2xl'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span className="truncate">{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};


