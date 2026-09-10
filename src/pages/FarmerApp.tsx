import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Sprout,
  ScanLine,
  Clock,
  Cpu,
  Store,
  Navigation,
  Package,
  TrendingUp,
  LogOut,
  Bell,
  User,
  ShieldCheck,
  Menu,
  X,
  Mic,
  Volume2,
  Scale
} from 'lucide-react';
import { Sidebar } from '../components/common/Sidebar';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { FarmerDashboard } from '../components/farmer/Dashboard';
import { ProduceList } from '../components/farmer/ProduceList';
import { QualityScanner } from '../components/farmer/QualityScanner';
import { ValueClock } from '../components/farmer/ValueClock';
import { MandiPriceRadar } from '../components/farmer/MandiPriceRadar';
import { DecisionEngine } from '../components/farmer/DecisionEngine';
import { BuyerMatches } from '../components/farmer/BuyerMatches';
import { SmartRoutes } from '../components/farmer/SmartRoutes';
import { Orders } from '../components/farmer/Orders';
import { Impact } from '../components/farmer/Impact';
import { KisanVoiceAssistant } from '../components/farmer/KisanVoiceAssistant';
import { SaralKisanView } from '../components/farmer/SaralKisanView';
import { getCurrentUser, logoutUser } from '../utils/auth';
import { getStoredBatches } from '../utils/storage';

export const FarmerAppPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const batches = getStoredBatches();

  // Determine active tab from URL path
  const pathSegment = location.pathname.split('/farmer/')[1] || 'dashboard';
  const [activeTab, setActiveTab] = useState<string>(pathSegment.split('/')[0] || 'dashboard');
  const [activeBatchId, setActiveBatchId] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainContainerRef = useRef<HTMLElement>(null);

  const [farmerMode, setFarmerMode] = useState<'simple' | 'detailed'>(() => {
    return (localStorage.getItem('freshroute_farmer_mode') as 'simple' | 'detailed') || 'simple';
  });

  const handleSetFarmerMode = (mode: 'simple' | 'detailed') => {
    setFarmerMode(mode);
    localStorage.setItem('freshroute_farmer_mode', mode);
  };

  useEffect(() => {
    const tabFromUrl = location.pathname.split('/farmer/')[1] || 'dashboard';
    setActiveTab(tabFromUrl.split('/')[0] || 'dashboard');
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, path: '/farmer/dashboard' },
    { id: 'produce', label: t('nav.produce'), icon: Sprout, path: '/farmer/produce' },
    { id: 'scanner', label: t('nav.scanner'), icon: ScanLine, path: '/farmer/scanner' },
    { id: 'mandi-rates', label: t('nav.mandiRates') || 'Mandi vs Our Price', icon: Scale, path: '/farmer/mandi-rates' },
    { id: 'value-clock', label: t('nav.valueClock'), icon: Clock, path: '/farmer/value-clock' },
    { id: 'decisions', label: t('nav.decisions'), icon: Cpu, path: '/farmer/decisions' },
    { id: 'buyer-matches', label: t('nav.buyerMatches'), icon: Store, path: '/farmer/buyer-matches' },
    { id: 'smart-routes', label: t('nav.routes'), icon: Navigation, path: '/farmer/smart-routes' },
    { id: 'orders', label: t('nav.orders'), icon: Package, path: '/farmer/orders' },
    { id: 'impact', label: t('nav.impact'), icon: TrendingUp, path: '/farmer/impact' }
  ];

  const handleTabSelect = (tabId: string, batchId?: string) => {
    setActiveTab(tabId);
    if (batchId) setActiveBatchId(batchId);
    setMobileMenuOpen(false);
    navigate(`/farmer/${tabId}`);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#17201C] flex" id="farmer-portal-root">
      {/* Desktop Sidebar */}
      <Sidebar
        role="farmer"
        activeItem={activeTab}
        onSelect={handleTabSelect}
        navItems={navItems}
      />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-full bg-white text-[#17201C] flex flex-col justify-between p-6 z-10 shadow-2xl border-r border-stone-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0B3D2E] text-white font-black flex items-center justify-center text-sm">
                    FR
                  </div>
                  <span className="text-base font-black text-[#17201C]">FreshRoute AI</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-stone-500 hover:text-stone-900">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabSelect(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#0B3D2E] text-white font-bold shadow-sm'
                          : 'text-[#6F7D75] hover:bg-stone-100 hover:text-[#17201C]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <LanguageSelector variant="light" />
              <button onClick={handleLogout} className="p-2 text-rose-600 hover:text-rose-700">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Header */}
        <header className="h-16 bg-white border-b border-stone-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mode Switcher Pill */}
            <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200 shadow-2xs">
              <button
                onClick={() => handleSetFarmerMode('simple')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  farmerMode === 'simple'
                    ? 'bg-[#0B3D2E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>🌿</span>
                <span>{i18n.language === 'kn' ? 'ಸರಳ ಕಿಸಾನ್' : i18n.language === 'hi' ? 'सरल किसान' : 'Saral Kisan (Simple)'}</span>
              </button>
              <button
                onClick={() => handleSetFarmerMode('detailed')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  farmerMode === 'detailed'
                    ? 'bg-[#0B3D2E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>📊</span>
                <span>{i18n.language === 'kn' ? 'ವಿವರವಾದ FPO' : i18n.language === 'hi' ? 'विस्तृत FPO' : 'Detailed FPO'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSelector variant="light" />

            <div className="h-6 w-px bg-stone-200 hidden sm:block" />

            {/* Profile pill */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0B3D2E] flex items-center justify-center font-black text-xs shadow-xs border border-[#18A558]/30">
                {user?.name ? user.name[0] : 'R'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-[#17201C] block leading-tight">
                  {user?.name || 'Ramesh Patil'}
                </span>
                <span className="text-[10px] text-[#6F7D75] block leading-none mt-0.5">
                  {user?.location?.split(',')[0] || 'Niphad FPO'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tab View Container */}
        <main ref={mainContainerRef} className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{
                duration: 0.22,
                ease: [0.25, 0.1, 0.25, 1.0],
              }}
              className="w-full"
            >
              {/* Return banner if in simple mode but browsing another tab */}
              {farmerMode === 'simple' && activeTab !== 'dashboard' && (
                <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2 text-xs text-emerald-950 font-black">
                    <span className="text-base">🌿</span>
                    <span>
                      {i18n.language === 'kn'
                        ? 'ಸರಳ ಕಿಸಾನ್ ಮೋಡ್‌ನಲ್ಲಿದ್ದೀರಿ'
                        : i18n.language === 'hi'
                        ? 'सरल किसान मोड सक्रिय है'
                        : 'Saral Kisan Field Mode Active'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleTabSelect('dashboard')}
                    className="text-xs font-black text-[#0B3D2E] hover:text-emerald-700 flex items-center gap-1 cursor-pointer bg-white px-3.5 py-1.5 rounded-xl border border-emerald-300 shadow-2xs transition-all active:scale-[0.98]"
                  >
                    <span>← {i18n.language === 'kn' ? 'ಸರಳ ಕಿಸಾನ್ ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ' : i18n.language === 'hi' ? 'सरल किसान मुख्य स्क्रीन' : 'Back to Simple Kisan View'}</span>
                  </button>
                </div>
              )}

              {activeTab === 'dashboard' && (
                farmerMode === 'simple' ? (
                  <SaralKisanView
                    onSwitchToDetailed={() => handleSetFarmerMode('detailed')}
                    onNavigateTab={handleTabSelect}
                  />
                ) : (
                  <FarmerDashboard
                    onNavigateTab={handleTabSelect}
                    onSwitchToSimple={() => handleSetFarmerMode('simple')}
                  />
                )
              )}

              {activeTab === 'produce' && (
                <ProduceList
                  onSelectBatch={(b) => handleTabSelect('decisions', b.id)}
                  onRunScanner={() => handleTabSelect('scanner')}
                />
              )}

              {activeTab === 'scanner' && (
                <QualityScanner
                  onScanComplete={(b) => handleTabSelect('value-clock', b.id)}
                />
              )}

              {activeTab === 'mandi-rates' && (
                <MandiPriceRadar
                  onBookDispatch={() => handleTabSelect('decisions')}
                />
              )}

              {activeTab === 'value-clock' && (
                <ValueClock
                  onNavigateToDecision={(id) => handleTabSelect('decisions', id)}
                />
              )}

              {activeTab === 'decisions' && (
                <DecisionEngine
                  batchId={activeBatchId}
                  onOrderCreated={() => handleTabSelect('smart-routes')}
                />
              )}

              {activeTab === 'buyer-matches' && (
                <BuyerMatches
                  onSelectBuyer={() => handleTabSelect('decisions')}
                />
              )}

              {activeTab === 'smart-routes' && (
                <SmartRoutes />
              )}

              {activeTab === 'orders' && (
                <Orders
                  onTrackOrder={() => handleTabSelect('smart-routes')}
                />
              )}

              {activeTab === 'impact' && (
                <Impact />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Farmer Voice Assistant Bot */}
      <KisanVoiceAssistant
        batches={batches}
        onNavigateTab={handleTabSelect}
      />
    </div>
  );
};
