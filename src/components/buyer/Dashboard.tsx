import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShoppingCart,
  Truck,
  ShieldCheck,
  Tag,
  DollarSign,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Boxes,
  CalendarClock,
  Repeat,
  BellRing
} from 'lucide-react';
import { Order, ProduceBatch, StandingOrder } from '../../types';
import { getStoredOrders, getStoredBatches, getStoredStandingOrders } from '../../utils/storage';
import { getCurrentUser } from '../../utils/auth';
import { MetricCard } from '../reusable/MetricCard';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface BuyerDashboardProps {
  onNavigateTab?: (tab: string) => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ onNavigateTab }) => {
  const { t } = useTranslation();
  const user = getCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [standingOrders, setStandingOrders] = useState<StandingOrder[]>([]);

  useEffect(() => {
    setOrders(getStoredOrders());
    setBatches(getStoredBatches());
    setStandingOrders(getStoredStandingOrders());
  }, []);

  const totalProcuredKg = orders.reduce((acc, o) => acc + (o.quantityKg || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto" id="buyer-dashboard-root">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500 text-white font-bold text-xs">
              🏢 Verified Enterprise Buyer
            </span>
            <span className="text-xs text-gray-300">
              {user?.location || 'Bhandup Central DC, Mumbai'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.name || 'Anil Sharma (FreshMart)'}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
            Real-time direct farm procurement hub. 100% pre-graded batches, live temperature telemetry, and digital weighbridge audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Button
            variant="success"
            size="md"
            onClick={() => onNavigateTab && onNavigateTab('standing-orders')}
            icon={<CalendarClock className="w-4 h-4" />}
            className="bg-[#18A558] hover:bg-[#158f4c] text-white font-bold shadow-md"
          >
            Standing Pre-Orders
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigateTab && onNavigateTab('marketplace')}
            icon={<ShoppingCart className="w-4 h-4" />}
          >
            Explore Marketplace
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => onNavigateTab && onNavigateTab('inbound')}
            icon={<Truck className="w-4 h-4" />}
            className="text-white border-white/30 hover:bg-white/10"
          >
            Track Inbound Fleet
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Inbound Shipments"
          value={orders.length}
          trend="1 arriving in ~1h"
          icon={<Truck className="w-5 h-5 text-blue-700" />}
          borderVariant="default"
        />

        <MetricCard
          title="Direct Sourced Volume"
          value={totalProcuredKg > 0 ? totalProcuredKg : 800}
          suffix=" KG"
          trend="+22.5%"
          trendLabel="direct vs brokers"
          icon={<Boxes className="w-5 h-5 text-indigo-700" />}
          borderVariant="default"
        />

        <MetricCard
          title="Dock Quality Score"
          value={82}
          suffix="/100"
          trend="Grade A"
          trendLabel="zero rejected crates"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-700" />}
          borderVariant="success"
        />

        <MetricCard
          title="Commission Saved"
          value={12450}
          prefix="₹"
          trend="~9.2%"
          trendLabel="margin enhancement"
          icon={<DollarSign className="w-5 h-5 text-purple-700" />}
          borderVariant="accent"
        />
      </div>

      {/* Standing Orders (Hotel / Restaurant & Household Recurring) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-[#18A558]" />
            Standing Pre-Orders ({standingOrders.length})
          </h2>
          <button
            onClick={() => onNavigateTab && onNavigateTab('standing-orders')}
            className="text-xs font-semibold text-[#18A558] hover:underline flex items-center gap-1"
          >
            Manage Standing Schedules & Policy Rules <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {standingOrders.slice(0, 2).map(so => (
            <Card key={so.id} hoverEffect className="p-5 space-y-3 border-2 border-emerald-100 bg-white">
              {/* Notification Banner */}
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs flex items-start gap-2.5">
                <BellRing className="w-4 h-4 text-[#18A558] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-950 block">
                    {so.autoConfirmNotification.noticeHeadline}
                  </span>
                  <p className="text-[11px] text-emerald-800 leading-snug mt-0.5">
                    {so.autoConfirmNotification.notificationMessage}
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900">
                      {so.buyerTier === 'bulk_business' ? 'Bulk (5-Day Cutoff)' : 'Household (24h Flex)'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">#{so.id}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    {so.quantityKg} KG {so.crop}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cadence: {so.cycleDay} • Farmer: {so.assignedFarmerName}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Cycle Total</span>
                  <span className="text-base font-black text-[#0B3D2E]">
                    ₹{so.estimatedCycleTotalINR.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  Next fulfillment: <strong>{so.nextFulfillmentDate}</strong>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateTab && onNavigateTab('standing-orders')}
                >
                  Adjust / Pause Exception
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Inbound Shipments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-700" />
            Live Inbound Shipments ({orders.length})
          </h2>
          <button
            onClick={() => onNavigateTab && onNavigateTab('inbound')}
            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
          >
            Open Live Telemetry Map <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map(order => (
            <Card key={order.id} hoverEffect className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-gray-500">#{order.id}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                  In Transit ({order.estimatedTransitTime || '1h 15m'})
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {order.quantityKg} KG {order.crop}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Origin: {order.farmLocation} • Carrier: {order.selectedVehicle}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl">
                <div>
                  <span className="text-gray-400 block text-[10px]">Pre-Grade</span>
                  <strong>{order.qualityScore}/100 Grade A</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Contract Escrow</span>
                  <strong className="text-blue-800">₹{(order.totalValue || order.quantityKg * order.pricePerKg).toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Payload Temp</span>
                  <strong className="text-emerald-700">{order.temperatureReadingC || 22.4}°C Steady</strong>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Fresh Farm Lots Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-700" />
            Newly Listed Farm Batches
          </h2>
          <button
            onClick={() => onNavigateTab && onNavigateTab('marketplace')}
            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
          >
            View All in Marketplace <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {batches.slice(0, 3).map(batch => (
            <Card key={batch.id} hoverEffect className="p-4 space-y-3">
              <div className="relative h-36 rounded-xl overflow-hidden bg-slate-100">
                <img src={batch.imageUrl} alt={batch.crop} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Grade {batch.currentQualityScore}/100
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900">{batch.crop} ({batch.variety})</h4>
                <p className="text-xs text-gray-500">{batch.farmLocation || (batch as any).location || 'Nashik'} • {batch.quantityKg} KG</p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-base font-extrabold text-[#0B3D2E]">₹{(batch as any).targetPricePerKg || batch.basePricePerKg}/kg</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateTab && onNavigateTab('marketplace')}
                >
                  Procure Lot
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
