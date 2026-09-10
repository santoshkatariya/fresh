import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Navigation,
  Truck,
  MapPin,
  Thermometer,
  Droplets,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Sparkles,
  PhoneCall,
  Share2,
  FileText
} from 'lucide-react';
import { Order } from '../../types';
import { getStoredOrders } from '../../utils/storage';
import { GoogleSmartRouteMap } from '../reusable/GoogleSmartRouteMap';
import { Card } from '../common/Card';

export const SmartRoutes: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  useEffect(() => {
    const list = getStoredOrders();
    setOrders(list);
    if (list.length > 0) {
      setSelectedOrderId(list[0].id);
    }
  }, []);

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto" id="farmer-smart-routes-view">
      {/* Top Active Route Dispatch Switcher */}
      {orders.length > 0 && activeOrder && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#18A558] animate-ping" />
              <span className="text-xs font-bold text-[#18A558] uppercase tracking-wider block">
                Active Transit Dispatch Pipeline
              </span>
            </div>
            <h3 className="text-base font-black text-[#17201C] mt-0.5">
              Order #{activeOrder.id} • {activeOrder.crop || 'Tomatoes'} ({activeOrder.quantityKg || 800} kg)
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6F7D75] font-semibold hidden sm:inline">Select Dispatch:</span>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-[#F7F8F2] text-[#17201C] focus:outline-none focus:ring-2 focus:ring-[#18A558]"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.id} - {o.crop || 'Tomatoes'} ({o.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main Google Maps AI Route Navigator & Telemetry */}
      <GoogleSmartRouteMap
        origin={activeOrder?.farmLocation || 'Niphad Farm Gate, Nashik'}
        destination={activeOrder?.buyerLocation || activeOrder?.buyerName || 'FreshMart Central DC, Mumbai'}
        cropName={activeOrder?.crop || 'Grade-A Tomatoes'}
        batchWeightKg={activeOrder?.quantityKg || 850}
        cropValuePerKg={activeOrder?.pricePerKg || 34}
      />

      {/* Verified Waypoints & Quality Telemetry Timeline */}
      <Card className="space-y-5 bg-white border border-stone-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <h4 className="text-sm font-black text-[#17201C] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#18A558]" />
            Live Waypoint & Quality Gate Telemetry Log
          </h4>
          <span className="text-xs font-bold text-[#18A558] bg-[#18A558]/10 px-2.5 py-1 rounded-full border border-[#18A558]/20">
            GPS Lock: 8 Satellites
          </span>
        </div>

        <div className="space-y-4 text-xs">
          {/* Milestone 1 */}
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-full bg-[#18A558]/15 text-[#0B3D2E] flex items-center justify-center font-black text-xs shrink-0 mt-0.5 border border-[#18A558]/30">
              ✓
            </div>
            <div className="flex-1 bg-[#F7F8F2] p-3 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#17201C]">Farm Gate Loading Dock (Nashik) - 06:30 AM</span>
                <span className="text-[11px] font-semibold text-[#18A558]">COMPLETED</span>
              </div>
              <p className="text-[#6F7D75] mt-1">
                850 KG loaded into 42 aerated plastic crates. Initial AI Quality Score: 82/100 (Firmness: 7.2 N).
              </p>
            </div>
          </div>

          {/* Milestone 2 */}
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-full bg-[#18A558]/15 text-[#0B3D2E] flex items-center justify-center font-black text-xs shrink-0 mt-0.5 border border-[#18A558]/30">
              ✓
            </div>
            <div className="flex-1 bg-[#F7F8F2] p-3 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#17201C]">NH-60 Agro Expressway Corridor - 07:15 AM</span>
                <span className="text-[11px] font-semibold text-[#18A558]">IN TRANSIT</span>
              </div>
              <p className="text-[#6F7D75] mt-1">
                Vehicle traveling on low-vibration asphalt (vibration &lt; 0.18g). Ambient temperature: 22.4°C. Spoilage risk 0%.
              </p>
            </div>
          </div>

          {/* Milestone 3 */}
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 border border-amber-300">
              •
            </div>
            <div className="flex-1 bg-amber-50/50 p-3 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950">Bhandup Ring Road Bypass (ETA 07:45 AM)</span>
                <span className="text-[11px] font-bold text-amber-800">APPROACHING</span>
              </div>
              <p className="text-amber-900/80 mt-1">
                Vehicle in final approach. Automatic WhatsApp notification and digital delivery manifest sent to FreshMart receiving dock.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
