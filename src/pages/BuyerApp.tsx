import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Tag,
  CalendarClock,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Sidebar } from '../components/common/Sidebar';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { BuyerDashboard } from '../components/buyer/Dashboard';
import { Marketplace } from '../components/buyer/Marketplace';
import { IncomingShipments } from '../components/buyer/IncomingShipments';
import { QualityVerification } from '../components/buyer/QualityVerification';
import { DemandPosting } from '../components/buyer/DemandPosting';
import { StandingOrders } from '../components/buyer/StandingOrders';
import { getCurrentUser, logoutUser } from '../utils/auth';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const BuyerAppPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const pathSegment = location.pathname.split('/buyer/')[1] || 'dashboard';
  const [activeTab, setActiveTab] = useState<string>(pathSegment.split('/')[0] || 'dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const tabFromUrl = location.pathname.split('/buyer/')[1] || 'dashboard';
    setActiveTab(tabFromUrl.split('/')[0] || 'dashboard');
  }, [location.pathname]);

  const navItems = [
    { id: 'dashboard', label: 'Procurement Dashboard', icon: LayoutDashboard, path: '/buyer/dashboard' },
    { id: 'standing-orders', label: 'Standing Pre-Orders', icon: CalendarClock, path: '/buyer/standing-orders' },
    { id: 'marketplace', label: 'Produce Marketplace', icon: ShoppingCart, path: '/buyer/marketplace' },
    { id: 'inbound', label: 'Inbound Telemetry', icon: Truck, path: '/buyer/inbound' },
    { id: 'dock-verification', label: 'Dock Quality Audit', icon: ShieldCheck, path: '/buyer/dock-verification' },
    { id: 'demands', label: 'Post Farm Demands', icon: Tag, path: '/buyer/demands' }
  ];

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    navigate(`/buyer/${tabId}`);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] text-stone-900 flex">
      {/* Desktop Sidebar */}
      <Sidebar
        role="buyer"
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
          <div className="relative w-72 max-w-full bg-white text-stone-900 flex flex-col justify-between p-6 z-10 shadow-2xl border-r border-stone-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1b4332] text-white font-black flex items-center justify-center text-sm">
                    FR
                  </div>
                  <span className="text-base font-black text-stone-900">FreshRoute Buyer</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-stone-500 hover:text-stone-900">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabSelect(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#1b4332] text-white font-bold shadow-sm'
                          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
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
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-stone-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-[#1b4332] border border-emerald-200 hidden sm:inline-block">
              🏢 Enterprise Procurement OS
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSelector variant="light" />

            <div className="h-6 w-px bg-stone-200 hidden sm:block" />

            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#1b4332] flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.name ? user.name[0] : 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-stone-900 block leading-tight">
                  {user?.name || 'Anil Sharma'}
                </span>
                <span className="text-[10px] text-stone-500 block leading-none mt-0.5">
                  {user?.location?.split(',')[0] || 'FreshMart DC'}
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

        {/* Tab Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <ErrorBoundary fallbackTitle="Portal Tab Error" fallbackMessage="Could not load the requested section. Click retry below to reload.">
            {activeTab === 'dashboard' && (
              <BuyerDashboard onNavigateTab={handleTabSelect} />
            )}

            {activeTab === 'standing-orders' && (
              <StandingOrders />
            )}

            {activeTab === 'marketplace' && (
              <Marketplace onOrderPlaced={() => handleTabSelect('inbound')} />
            )}

            {activeTab === 'inbound' && (
              <IncomingShipments onVerifyDockQuality={() => handleTabSelect('dock-verification')} />
            )}

            {activeTab === 'dock-verification' && (
              <QualityVerification />
            )}

            {activeTab === 'demands' && (
              <DemandPosting />
            )}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

