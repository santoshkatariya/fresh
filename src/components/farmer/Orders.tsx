import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Truck, CheckCircle2, Clock, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { getStoredOrders } from '../../utils/storage';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const Orders: React.FC<{ onTrackOrder?: (orderId: string) => void }> = ({
  onTrackOrder
}) => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getStoredOrders());
  }, []);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'In Transit':
      case 'Accepted':
      case 'Pickup Scheduled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            {status}
          </span>
        );
      case 'Delivered':
      case 'Completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivered & Settled
          </span>
        );
      case 'Requested':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            Pending Dispatch
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="farmer-orders-history">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-[#2d7a4a]" />
            Dispatched Orders & Settlements
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Track active live vehicle telemetry, escrow locks, and direct bank receipts
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <Card
            key={order.id}
            id={`farmer-order-row-${order.id}`}
            hoverEffect
            className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-gray-500">#{order.id}</span>
                {getStatusBadge(order.status)}
                <span className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-gray-900">
                  {order.quantityKg} KG {order.crop}
                </h3>
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span>Buyer: <strong>{order.buyerName}</strong></span>
                  <span className="text-gray-300">•</span>
                  <span>Vehicle: <strong>{order.selectedVehicle}</strong></span>
                  <span className="text-gray-300">•</span>
                  <span>Distance: {order.distanceKm} KM</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
              <div className="text-left md:text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Farmer Net Bank Payout
                </span>
                <span className="text-xl font-extrabold text-[#1b4d2f]">
                  ₹{order.netFarmerEarnings.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-emerald-700 block font-medium">
                  {order.status === 'Completed' || order.status === 'Delivered' ? 'Escrow Released to Bank' : 'Escrow Locked T+0'}
                </span>
              </div>

              {onTrackOrder && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTrackOrder(order.id)}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Live Route
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
