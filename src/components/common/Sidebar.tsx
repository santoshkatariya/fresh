import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Boxes,
  ScanLine,
  Clock,
  Cpu,
  Users,
  Navigation,
  FileCheck2,
  TrendingUp,
  Store,
  FileText,
  LogOut,
  ChevronRight,
  Tractor,
  ShoppingCart,
  Scale,
  LucideIcon
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { getCurrentUser, logoutUser } from '../../utils/auth';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  path?: string;
  to?: string;
  badge?: string;
  highlight?: boolean;
}

interface SidebarProps {
  role: 'farmer' | 'buyer';
  activeItem?: string;
  onSelect?: (id: string) => void;
  navItems?: NavItemConfig[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeItem,
  onSelect,
  navItems
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const defaultFarmerNav: NavItemConfig[] = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, path: '/farmer/dashboard' },
    { id: 'produce', label: t('nav.myProduce'), icon: Boxes, path: '/farmer/produce' },
    { id: 'scanner', label: t('nav.qualityScan'), icon: ScanLine, path: '/farmer/scanner', highlight: true },
    { id: 'mandi-rates', label: t('nav.mandiRates') || 'Mandi vs Our Price', icon: Scale, path: '/farmer/mandi-rates', badge: 'Live' },
    { id: 'value-clock', label: t('nav.valueClock'), icon: Clock, path: '/farmer/value-clock', badge: 'AI Core' },
    { id: 'decisions', label: t('nav.decisionEngine'), icon: Cpu, path: '/farmer/decisions' },
    { id: 'buyer-matches', label: t('nav.buyerMatches'), icon: Users, path: '/farmer/buyer-matches' },
    { id: 'smart-routes', label: t('nav.smartRoutes'), icon: Navigation, path: '/farmer/smart-routes' },
    { id: 'orders', label: t('nav.orders'), icon: FileCheck2, path: '/farmer/orders' },
    { id: 'impact', label: t('nav.impact'), icon: TrendingUp, path: '/farmer/impact' }
  ];

  const defaultBuyerNav: NavItemConfig[] = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, path: '/buyer/dashboard' },
    { id: 'marketplace', label: t('nav.marketplace'), icon: Store, path: '/buyer/marketplace', highlight: true },
    { id: 'inbound', label: 'Inbound Fleet', icon: Navigation, path: '/buyer/inbound' },
    { id: 'dock-verification', label: 'Dock Verification', icon: FileCheck2, path: '/buyer/dock-verification' },
    { id: 'demands', label: 'Post Requirements', icon: FileText, path: '/buyer/demands' }
  ];

  const items = navItems || (role === 'farmer' ? defaultFarmerNav : defaultBuyerNav);

  const handleItemClick = (item: NavItemConfig) => {
    if (onSelect) {
      onSelect(item.id);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <aside className="w-64 bg-white border-r border-stone-200 hidden lg:flex flex-col shrink-0 min-h-screen text-stone-900 shadow-2xs">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-xs ${
            role === 'farmer' ? 'bg-[#0B3D2E] text-white' : 'bg-[#0369a1] text-white'
          }`}>
            FR.2
          </div>
          <div>
            <span className="text-base font-black text-slate-900 tracking-tight">
              Fresh<span className={role === 'farmer' ? 'text-[#0B3D2E]' : 'text-blue-600'}>Route</span><span className="text-[#18A558]">.2</span>
            </span>
            <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-500">
              SIH 2026 Climate Tech
            </span>
          </div>
        </div>
      </div>

      {/* User Badge Info */}
      <div className="p-4 border-b border-stone-200 bg-stone-50/60">
        <div className="flex items-center gap-3">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-600/30"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-stone-900 truncate flex items-center gap-1">
              {user.name}
            </div>
            <div className="text-[11px] text-stone-500 truncate">{user.farmOrBusinessName}</div>
            <div className="text-[9px] font-bold text-[#2d6a4f] uppercase tracking-wider mt-0.5">
              {role === 'farmer' ? 'Verified Farmer / FPO' : 'Verified Buyer'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          {role === 'farmer' ? 'Farmer Decision Engine' : 'Procurement Workspace'}
        </div>

        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeItem ? activeItem === item.id : false;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                isActive
                  ? role === 'farmer'
                    ? 'bg-[#1b4332] text-white shadow-xs font-bold'
                    : 'bg-[#0369a1] text-white shadow-xs font-bold'
                  : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-white'
                      : 'text-stone-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-[#1b4332] border border-emerald-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Switch Role & Controls */}
      <div className="p-3 border-t border-stone-200 bg-stone-50/50 space-y-2">
        <button
          onClick={() => navigate(role === 'farmer' ? '/buyer/dashboard' : '/farmer/dashboard')}
          className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 rounded-2xl transition-colors"
        >
          <div className="flex items-center gap-2">
            {role === 'farmer' ? <ShoppingCart className="w-3.5 h-3.5 text-[#2d6a4f]" /> : <Tractor className="w-3.5 h-3.5 text-blue-600" />}
            <span>{role === 'farmer' ? 'Switch to Buyer View' : 'Switch to Farmer View'}</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>

        <div className="flex items-center justify-between pt-1">
          <LanguageSelector variant="light" />
          <button
            onClick={handleLogout}
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

