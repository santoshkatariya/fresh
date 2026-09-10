import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf, Menu, X, ArrowRight, Sparkles, UserCheck, ShieldCheck, Tractor, ShoppingCart } from 'lucide-react';
import { Button } from './Button';
import { LanguageSelector } from './LanguageSelector';
import { getCurrentUser } from '../../utils/auth';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUser = getCurrentUser();

  const isAppRoute = location.pathname.startsWith('/farmer') || location.pathname.startsWith('/buyer');
  const isFarmer = location.pathname.startsWith('/farmer');
  const isBuyer = location.pathname.startsWith('/buyer');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/90 transition-all text-stone-900 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group" id="navbar-brand-logo">
            <div className="w-9 h-9 rounded-xl bg-[#1b4332] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Fresh<span className="text-[#0B3D2E]">Route</span><span className="text-[#18A558]">.2</span>
                </span>
                <span className="bg-[#0B3D2E] text-white text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase shadow-xs">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold hidden sm:inline-block">
                Post-Harvest Value Optimizer
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {!isAppRoute ? (
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-600">
              <a href="#product" className="hover:text-stone-950 transition-colors">
                {t('nav.product')}
              </a>
              <a href="#how-it-works" className="hover:text-stone-950 transition-colors">
                {t('nav.howItWorks')}
              </a>
              <a href="#five-actions" className="hover:text-stone-950 transition-colors">
                {t('nav.fiveActions')}
              </a>
              <a href="#impact" className="hover:text-stone-950 transition-colors">
                {t('nav.impact')}
              </a>
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-200 flex items-center gap-1.5">
                {isFarmer ? <Tractor className="w-3.5 h-3.5 text-[#2d6a4f]" /> : <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />}
                {isFarmer ? t('nav.farmerPortal') : t('nav.buyerPortal')}
              </span>
              <span className="text-xs text-stone-600 font-medium">
                {currentUser?.farmOrBusinessName || currentUser?.name}
              </span>
            </div>
          )}

          {/* Actions & Controls */}
          <div className="hidden sm:flex items-center gap-3">
            <LanguageSelector variant="light" />

            {!isAppRoute ? (
              <>
                <Link to="/login/farmer">
                  <Button variant="outline" size="sm" icon={<Tractor className="w-4 h-4 text-[#2d6a4f]" />}>
                    {t('nav.farmerPortal')}
                  </Button>
                </Link>
                <Link to="/login/buyer">
                  <Button variant="primary" size="sm" icon={<ShoppingCart className="w-4 h-4 text-white" />}>
                    {t('nav.buyerPortal')}
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to={isFarmer ? '/buyer/dashboard' : '/farmer/dashboard'}>
                  <Button variant="outline" size="sm">
                    {isFarmer ? t('app.switch_role_buyer') : t('app.switch_role_farmer')}
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    Home
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 sm:hidden">
            <LanguageSelector variant="light" />
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-stone-900" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu-drawer" className="sm:hidden border-t border-stone-200 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4 shadow-xl">
          {!isAppRoute ? (
            <div className="flex flex-col space-y-2.5 text-sm font-semibold text-stone-700">
              <a
                href="#product"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-stone-100 text-stone-900"
              >
                {t('nav.product')}
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-stone-100 text-stone-900"
              >
                {t('nav.howItWorks')}
              </a>
              <a
                href="#five-actions"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-stone-100 text-stone-900"
              >
                {t('nav.fiveActions')}
              </a>
              <a
                href="#impact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-stone-100 text-stone-900"
              >
                {t('nav.impact')}
              </a>
            </div>
          ) : (
            <div className="px-3 py-2 rounded-xl bg-stone-100 text-stone-900 text-sm font-semibold flex items-center gap-2 border border-stone-200">
              <UserCheck className="w-4 h-4 text-[#2d6a4f]" />
              <span>{currentUser?.name} ({currentUser?.role?.toUpperCase()})</span>
            </div>
          )}

          <div className="pt-2 border-t border-stone-200 flex flex-col gap-2.5">
            <Link to="/login/farmer" onClick={() => setMobileMenuOpen(false)}>
              <Button fullWidth variant="outline" icon={<Tractor className="w-4 h-4 text-[#2d6a4f]" />}>
                Farmer Portal (ರೈತ / किसान)
              </Button>
            </Link>
            <Link to="/login/buyer" onClick={() => setMobileMenuOpen(false)}>
              <Button fullWidth variant="primary" icon={<ShoppingCart className="w-4 h-4 text-white" />}>
                Buyer Portal (ಖರೀದಿದಾರ / खरीदार)
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

