import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Navigation, Thermometer, Droplets, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Order } from '../../types';
import { getStoredOrders } from '../../utils/storage';
import { GoogleSmartRouteMap } from '../reusable/GoogleSmartRouteMap';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const IncomingShipments: React.FC<{ onVerifyDockQuality?: (orderId: string) => void }> = ({
  onVerifyDockQuality
}) => {
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

  const activeOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto" id="buyer-incoming-shipments">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-700" />
            Live Inbound Fleet Telemetry & Logistics Cost
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Real-time Google Maps routing, cold chain temperature tracking, and transparent landed freight cost
          </p>
        </div>

        {orders.length > 0 && (
          <select
            value={selectedOrderId}
            onChange={e => setSelectedOrderId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {orders.map(o => (
              <option key={o.id} value={o.id}>
                #{o.id} - {o.quantityKg || 800}kg {o.crop || 'Tomatoes'} ({o.status})
              </option>
            ))}
          </select>
        )}
      </div>

      {activeOrder ? (
        <div className="space-y-6">
          <GoogleSmartRouteMap
            origin={activeOrder.farmLocation || 'Niphad Farm Gate, Nashik'}
            destination={activeOrder.buyerLocation || activeOrder.buyerName || 'FreshMart Central DC, Mumbai'}
            cropName={activeOrder.crop || 'Tomatoes'}
            batchWeightKg={activeOrder.quantityKg || 850}
            cropValuePerKg={activeOrder.pricePerKg || 34}
          />

          <Card className="p-6 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Receiving Dock Gate Workflow
              </span>
              <h3 className="text-lg font-bold text-white">
                Carrier Approaching Dock (ETA ~1h 15m)
              </h3>
              <p className="text-xs text-blue-200/90 max-w-xl">
                Prepare digital scale weighbridge and AI dock scanner to instantly release digital escrow upon delivery.
              </p>
            </div>

            {onVerifyDockQuality && (
              <Button
                variant="success"
                size="md"
                onClick={() => onVerifyDockQuality(activeOrder.id)}
                icon={<ShieldCheck className="w-4 h-4" />}
                className="shrink-0"
              >
                Perform Dock Quality Scan
              </Button>
            )}
          </Card>
        </div>
      ) : (
        <Card className="p-8 text-center text-gray-400">
          No inbound shipments currently in transit.
        </Card>
      )}
    </div>
  );
};
