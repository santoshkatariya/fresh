import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Repeat,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  PauseCircle,
  PlayCircle,
  Sliders,
  XCircle,
  Building,
  Home,
  ArrowRight,
  Info,
  DollarSign,
  Package,
  BellRing
} from 'lucide-react';
import { StandingOrder, BuyerTier, CropType } from '../../types';
import {
  getStoredStandingOrders,
  saveStoredStandingOrders,
  pauseStandingOrder,
  resumeStandingOrder,
  adjustStandingOrder,
  cancelStandingOrder,
  createStandingOrder
} from '../../utils/storage';
import { getCurrentUser } from '../../utils/auth';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const StandingOrders: React.FC = () => {
  const currentUser = getCurrentUser();
  const [orders, setOrders] = useState<StandingOrder[]>([]);
  const [currentTier, setCurrentTier] = useState<BuyerTier>(currentUser.buyerTier || 'bulk_business');
  
  // Modals & form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pauseTargetOrder, setPauseTargetOrder] = useState<StandingOrder | null>(null);
  const [pauseReason, setPauseReason] = useState('Seasonal menu update');
  const [adjustTargetOrder, setAdjustTargetOrder] = useState<StandingOrder | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(80);
  const [adjustReason, setAdjustReason] = useState('Upcoming weekend banquet surge');
  const [cancelTargetOrder, setCancelTargetOrder] = useState<StandingOrder | null>(null);
  const [cancellationResult, setCancellationResult] = useState<{
    order: StandingOrder;
    penaltyApplied: boolean;
    penaltyAmount: number;
    message: string;
  } | null>(null);

  // New Order Form state
  const [newCrop, setNewCrop] = useState<CropType>('Tomatoes');
  const [newVariety, setNewVariety] = useState('Abhinav Hybrid (Table Grade)');
  const [newQuantity, setNewQuantity] = useState<number>(80);
  const [newFrequency, setNewFrequency] = useState<'weekly' | 'bi-weekly' | 'daily'>('weekly');
  const [newCycleDay, setNewCycleDay] = useState('Every Monday 07:00 AM');
  const [newPricePerKg, setNewPricePerKg] = useState<number>(24.5);

  const reloadOrders = () => {
    setOrders(getStoredStandingOrders());
  };

  useEffect(() => {
    reloadOrders();
  }, []);

  const handlePauseConfirm = () => {
    if (!pauseTargetOrder) return;
    pauseStandingOrder(pauseTargetOrder.id, pauseReason);
    setPauseTargetOrder(null);
    reloadOrders();
  };

  const handleResume = (id: string) => {
    resumeStandingOrder(id);
    reloadOrders();
  };

  const handleAdjustConfirm = () => {
    if (!adjustTargetOrder) return;
    adjustStandingOrder(adjustTargetOrder.id, adjustQty, adjustReason);
    setAdjustTargetOrder(null);
    reloadOrders();
  };

  const handleCancelConfirm = () => {
    if (!cancelTargetOrder) return;
    const res = cancelStandingOrder(cancelTargetOrder.id);
    setCancelTargetOrder(null);
    if (res) {
      setCancellationResult(res);
    }
    reloadOrders();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStandingOrder({
      buyerId: currentUser.id || 'buyer-hotel-grand',
      buyerName: currentUser.farmOrBusinessName || currentUser.name || 'Hotel Grand Residency',
      buyerTier: currentTier,
      businessCategory: currentTier === 'bulk_business' ? 'Hotel & Fine Dining' : 'Residential Society Co-op',
      crop: newCrop,
      variety: newVariety,
      quantityKg: newQuantity,
      frequency: newFrequency,
      cycleDay: newCycleDay,
      unitPricePerKg: newPricePerKg,
      assignedFarmerId: 'farmer-ramesh-01',
      assignedFarmerName: 'Ramesh Patil',
      farmLocation: 'Niphad, Nashik, Maharashtra'
    });
    setIsCreateModalOpen(false);
    reloadOrders();
  };

  const filteredOrders = orders.filter(o => o.buyerTier === currentTier);

  return (
    <div className="space-y-8 max-w-7xl mx-auto" id="standing-orders-root">
      {/* Header Banner */}
      <div className="bg-[#0B3D2E] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#18A558] text-white font-black text-xs">
              {currentTier === 'bulk_business' ? '🏨 Hotel & Restaurant Mode' : '🏡 Household Community Mode'}
            </span>
            <span className="text-xs text-emerald-200">
              Standing Recurring Pre-Orders Engine
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {currentTier === 'bulk_business'
              ? 'Bulk Buyer Standing Pre-Orders'
              : 'Household Collective Basket Pre-Orders'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            {currentTier === 'bulk_business'
              ? 'Lock recurring supply for unchanging restaurant menus (e.g. 80 kg tomatoes every week). Standing orders auto-confirm with 3-day notice before cutoff. Pausing or adjusting is strictly an exception.'
              : 'Flexible household pre-orders with zero cancellation penalty up to 24–48 hours prior to fulfillment.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Button
            variant="success"
            size="md"
            onClick={() => setIsCreateModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
            className="bg-[#18A558] hover:bg-[#158f4c] text-white shadow-md font-bold"
          >
            Create Standing Order
          </Button>

          {/* Tier Switcher for Testing Both Policies */}
          <div className="bg-white/10 p-1 rounded-2xl border border-white/20 flex items-center">
            <button
              onClick={() => setCurrentTier('bulk_business')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTier === 'bulk_business'
                  ? 'bg-white text-[#0B3D2E] shadow-xs'
                  : 'text-white hover:text-emerald-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Hotel/Bulk (5d Lock)</span>
            </button>
            <button
              onClick={() => setCurrentTier('household')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTier === 'household'
                  ? 'bg-white text-[#0B3D2E] shadow-xs'
                  : 'text-white hover:text-emerald-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Household (24h Flex)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tier Policy Comparison Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-5 rounded-2xl border transition-all ${
          currentTier === 'bulk_business'
            ? 'bg-amber-50/70 border-amber-300 shadow-xs'
            : 'bg-white border-slate-200 opacity-70'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-100 text-amber-900">
                <Building className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-black text-slate-900">
                Bulk Buyer Policy (Hotels & Restaurants)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-200 text-amber-950">
              5–7 Day Cutoff
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Standing orders reflect unchanging menu needs. Because orders represent a significant share of the farmer's planned harvest, changes after the <strong>5-day cutoff</strong> incur a <strong>25% cancellation charge</strong> to compensate the farmer for unmarketable harvest loss.
          </p>
          <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
            <span className="text-amber-900 font-bold">Farmer Protection: <strong>Guaranteed 25% Escrow</strong></span>
            <span className="text-slate-500 font-mono text-[11px]">Free edit window: 5+ days prior</span>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${
          currentTier === 'household'
            ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
            : 'bg-white border-slate-200 opacity-70'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-900">
                <Home className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-black text-slate-900">
                Household Buyer Policy (Families & Co-ops)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-200 text-emerald-950">
              24–48h Flexible
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Individual household basket sizes are small and aggregated across many residential consumers. Households can freely edit, skip, or pause baskets up to <strong>24–48 hours</strong> before fulfillment with <strong>₹0 penalty</strong>.
          </p>
          <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs">
            <span className="text-emerald-900 font-bold">Cancellation Fee: <strong>₹0 (Zero Penalty)</strong></span>
            <span className="text-slate-500 font-mono text-[11px]">Aggregated pooling buffer</span>
          </div>
        </div>
      </div>

      {/* Cancellation Result Notification if just triggered */}
      {cancellationResult && (
        <div className={`p-5 rounded-2xl border ${
          cancellationResult.penaltyApplied
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : 'bg-emerald-50 border-emerald-300 text-emerald-950'
        } flex items-start justify-between gap-4 shadow-sm`}>
          <div className="flex items-start gap-3">
            {cancellationResult.penaltyApplied ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-sm font-black">
                {cancellationResult.penaltyApplied
                  ? `Late Cancellation Recorded: 25% Compensation Fee Charged`
                  : `Standing Order Cancelled Successfully`}
              </h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {cancellationResult.message}
              </p>
              {cancellationResult.penaltyApplied && (
                <div className="mt-2 text-xs font-mono font-bold bg-white/80 px-3 py-1.5 rounded-xl border border-rose-200 inline-block">
                  Farmer Payout: ₹{cancellationResult.penaltyAmount.toLocaleString('en-IN')} routed directly to {cancellationResult.order.assignedFarmerName}'s Kisan account
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setCancellationResult(null)}
            className="text-xs font-bold px-2 py-1 rounded-lg bg-black/5 hover:bg-black/10"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Standing Orders Active List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-[#18A558]" />
              Active Standing Pre-Orders ({filteredOrders.length})
            </h2>
            <p className="text-xs text-slate-500">
              Auto-renewing farm-to-kitchen schedules with automated cycle cutoff alerts
            </p>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <Card className="p-10 text-center space-y-3 border-dashed border-2">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No standing orders in this category</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Hotels and restaurants can set up fixed weekly pre-orders to secure harvest allocations without re-ordering every week.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="mx-auto mt-2"
            >
              Create First Standing Order
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredOrders.map(order => {
              const isBulk = order.buyerTier === 'bulk_business';
              const isLocked = isBulk && order.daysUntilCutoff <= 0;
              const isPaused = order.status === 'paused';
              const isAdjusted = order.status === 'adjusted';

              return (
                <Card
                  key={order.id}
                  id={`standing-order-card-${order.id}`}
                  className={`p-5 space-y-4 border-2 transition-all ${
                    isPaused
                      ? 'bg-slate-50/80 border-slate-300 opacity-80'
                      : isLocked
                      ? 'bg-white border-amber-300 shadow-md'
                      : 'bg-white border-slate-200/90 hover:border-emerald-500 hover:shadow-md'
                  }`}
                >
                  {/* Top Notification Mockup: Auto-Confirm in X days */}
                  {!isPaused && (
                    <div className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 border ${
                      isLocked
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    }`}>
                      <BellRing className="w-4 h-4 shrink-0 text-[#18A558] mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between font-bold">
                          <span>{order.autoConfirmNotification.noticeHeadline}</span>
                          <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                            {isLocked ? 'Cutoff Passed' : `Cutoff in ${order.daysUntilCutoff} days`}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                          {order.autoConfirmNotification.notificationMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Order Overview Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">#{order.id}</span>
                        {isPaused ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-700">
                            PAUSED
                          </span>
                        ) : isLocked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                            HARVEST LOCKED (Within 5-Day Cutoff)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            ACTIVE STANDING
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-slate-900 mt-1">
                        {order.quantityKg} KG {order.crop} ({order.variety})
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Repeat className="w-3.5 h-3.5 text-[#18A558]" />
                        <span>Cadence: <strong>{order.cycleDay}</strong></span>
                        <span>•</span>
                        <span>{order.frequency.toUpperCase()}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Cycle Amount</span>
                      <span className="text-lg font-black text-[#0B3D2E]">
                        ₹{order.estimatedCycleTotalINR.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ₹{order.unitPricePerKg}/kg
                      </span>
                    </div>
                  </div>

                  {/* Farm Assignment and Location */}
                  <div className="bg-slate-50 p-3 rounded-2xl text-xs flex items-center justify-between border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Assigned Farmer</span>
                      <span className="font-bold text-slate-800">{order.assignedFarmerName}</span>
                      <span className="text-slate-400 block text-[10px]">{order.farmLocation}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] font-semibold">Next Fulfillment</span>
                      <span className="font-bold text-slate-800 font-mono">{order.nextFulfillmentDate}</span>
                      <span className="text-emerald-700 font-bold text-[10px] block">Contract Price Locked</span>
                    </div>
                  </div>

                  {/* Policy & Protection Details */}
                  <div className="text-xs space-y-1 bg-amber-50/50 border border-amber-200/60 p-3 rounded-2xl text-slate-700">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
                      <span>{order.cancellationPolicy.policyLabel}</span>
                      {isBulk && (
                        <span>
                          Penalty Protection: ₹{order.cancellationPolicy.penaltyProtectionINR}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {order.cancellationPolicy.description}
                    </p>
                    {isAdjusted && order.adjustmentDetails && (
                      <div className="mt-1 pt-1 border-t border-amber-200 text-slate-600 text-[10px]">
                        Adjusted from {order.adjustmentDetails.originalQuantityKg} KG to {order.adjustmentDetails.adjustedQuantityKg} KG ({order.adjustmentDetails.reason})
                      </div>
                    )}
                    {isPaused && order.pauseDetails && (
                      <div className="mt-1 pt-1 border-t border-slate-200 text-slate-600 text-[10px]">
                        Paused reason: {order.pauseDetails.reason} (Resumes automatically)
                      </div>
                    )}
                  </div>

                  {/* Action Controls: Pause / Adjust / Cancel */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {isPaused ? (
                        <button
                          onClick={() => handleResume(order.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#0B3D2E] text-white hover:bg-emerald-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-[0.98]"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Resume Cycle</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setPauseTargetOrder(order)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                          title="Pause for next cycle only (as exception)"
                        >
                          <PauseCircle className="w-3.5 h-3.5" />
                          <span>Pause Next Cycle</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setAdjustTargetOrder(order);
                          setAdjustQty(order.quantityKg);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Adjust Volume</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setCancelTargetOrder(order)}
                      className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Order</span>
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Pause Exception */}
      {pauseTargetOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <PauseCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Pause Standing Pre-Order
                </h3>
                <p className="text-xs text-slate-500">
                  {pauseTargetOrder.quantityKg} KG {pauseTargetOrder.crop} ({pauseTargetOrder.buyerName})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Standing orders are designed for unchanging kitchen menus. Pausing is treated as an <strong>exception</strong> (e.g. temporary kitchen closure or seasonal menu change). It will automatically resume after the pause duration.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Reason for Pause Exception
              </label>
              <select
                value={pauseReason}
                onChange={e => setPauseReason(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-sm"
              >
                <option value="Seasonal menu update">Seasonal menu update</option>
                <option value="Temporary kitchen renovation">Temporary kitchen renovation</option>
                <option value="Holiday / public closure">Holiday / public closure</option>
                <option value="Inventory surplus in cold storage">Inventory surplus in cold storage</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPauseTargetOrder(null)}
              >
                Keep Active
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePauseConfirm}
                className="bg-amber-700 hover:bg-amber-800 text-white"
              >
                Confirm Temporary Pause
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adjust Volume Exception */}
      {adjustTargetOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Adjust Standing Volume Exception
                </h3>
                <p className="text-xs text-slate-500">
                  Modify quantity for the upcoming cycle only
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>New Cycle Quantity</span>
                  <span className="text-emerald-700 font-mono">{adjustQty} KG</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="400"
                  step="10"
                  value={adjustQty}
                  onChange={e => setAdjustQty(parseInt(e.target.value))}
                  className="w-full accent-[#0B3D2E]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>20 KG</span>
                  <span>Baseline: {adjustTargetOrder.quantityKg} KG</span>
                  <span>400 KG</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Exception Reason
                </label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-sm"
                >
                  <option value="Upcoming weekend banquet surge">Upcoming weekend banquet surge</option>
                  <option value="Monsoon dining off-peak adjustment">Monsoon dining off-peak adjustment</option>
                  <option value="Catering contract volume revision">Catering contract volume revision</option>
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Cycle Total:</span>
                  <strong className="text-slate-900">
                    ₹{Math.round(adjustQty * adjustTargetOrder.unitPricePerKg).toLocaleString('en-IN')}
                  </strong>
                </div>
                <div className="flex justify-between text-amber-900">
                  <span>Farmer Pre-allocation:</span>
                  <strong>{adjustQty} KG dedicated by {adjustTargetOrder.assignedFarmerName}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdjustTargetOrder(null)}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={handleAdjustConfirm}
                className="bg-[#18A558] hover:bg-[#158f4c] text-white"
              >
                Save Quantity Adjustment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cancel Confirmation & Tiered Policy Enforcement */}
      {cancelTargetOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-900 flex items-center justify-center font-bold">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Confirm Cancellation of Standing Order
                </h3>
                <p className="text-xs text-slate-500">
                  Order #{cancelTargetOrder.id} • {cancelTargetOrder.quantityKg} KG {cancelTargetOrder.crop}
                </p>
              </div>
            </div>

            {cancelTargetOrder.buyerTier === 'bulk_business' ? (
              <div className="space-y-3">
                {cancelTargetOrder.daysUntilCutoff <= 0 ? (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 space-y-2">
                    <div className="flex items-center gap-2 font-black text-sm">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Cutoff Passed: 25% Cancellation Charge Applies</span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">
                      The 5-day cutoff for this harvest cycle has passed. Farmer {cancelTargetOrder.assignedFarmerName} has already prepared dedicated field harvesting. In accordance with the Bulk Buyer Agreement, cancelling now triggers a <strong>25% compensation charge</strong>.
                    </p>
                    <div className="bg-white/90 p-3 rounded-xl border border-rose-200 text-xs flex justify-between items-center font-mono">
                      <span>Order Value: ₹{cancelTargetOrder.estimatedCycleTotalINR}</span>
                      <strong className="text-rose-700">
                        25% Compensation: ₹{cancelTargetOrder.cancellationPolicy.penaltyProtectionINR}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Before 5-Day Cutoff: Free Cancellation</span>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed">
                      You are cancelling {cancelTargetOrder.daysUntilCutoff} days before the harvest cutoff. Zero penalty charge applies. The farmer will be notified in time to reallocate this volume.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Household Flexible Window Active</span>
                </div>
                <p className="text-xs opacity-90 leading-relaxed">
                  As a household buyer, your volume is pooled across collective members. You can cancel with <strong>₹0 penalty</strong>.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelTargetOrder(null)}
              >
                Keep Order
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCancelConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Standing Pre-Order */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0B3D2E] text-white flex items-center justify-center font-bold">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Set Up Standing Pre-Order
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentTier === 'bulk_business'
                      ? 'Fixed hotel/restaurant volume locked directly with farmer'
                      : 'Recurring household fresh food basket'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Crop Commodity</label>
                  <select
                    value={newCrop}
                    onChange={e => {
                      const c = e.target.value as CropType;
                      setNewCrop(c);
                      if (c === 'Tomatoes') {
                        setNewVariety('Abhinav Hybrid (Table Grade)');
                        setNewPricePerKg(24.5);
                      } else if (c === 'Onions') {
                        setNewVariety('Garwa Dark Red');
                        setNewPricePerKg(20.0);
                      } else if (c === 'Capsicum') {
                        setNewVariety('Indra Green Bell');
                        setNewPricePerKg(38.0);
                      } else if (c === 'Grapes') {
                        setNewVariety('Thompson Seedless');
                        setNewPricePerKg(68.0);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-sm"
                  >
                    <option value="Tomatoes">Tomatoes (Table / Puree)</option>
                    <option value="Onions">Onions (Garwa Dark Red)</option>
                    <option value="Capsicum">Capsicum (Bell Pepper)</option>
                    <option value="Grapes">Grapes (Table / Juice)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Variety / Grade</label>
                  <input
                    type="text"
                    value={newVariety}
                    onChange={e => setNewVariety(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Quantity per Cycle (KG)</label>
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    value={newQuantity}
                    onChange={e => setNewQuantity(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Direct Farm Rate (₹/KG)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newPricePerKg}
                    onChange={e => setNewPricePerKg(parseFloat(e.target.value) || 20)}
                    className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Recurrence Cadence</label>
                  <select
                    value={newFrequency}
                    onChange={e => setNewFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-sm"
                  >
                    <option value="weekly">Weekly (Standard)</option>
                    <option value="bi-weekly">Bi-Weekly (Alternate Weeks)</option>
                    <option value="daily">Daily Morning Restock</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Cycle Dispatch Schedule</label>
                  <input
                    type="text"
                    value={newCycleDay}
                    onChange={e => setNewCycleDay(e.target.value)}
                    placeholder="e.g. Every Monday 07:00 AM"
                    className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Economic Preview */}
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-emerald-950">
                  <span>Cycle Contract Value:</span>
                  <span className="font-mono text-sm">
                    ₹{Math.round(newQuantity * newPricePerKg).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {currentTier === 'bulk_business'
                    ? '🛡️ Bulk Protection: Farmer Ramesh Patil will reserve acreage for your 80 kg weekly order. 5-day cancellation cutoff applies with 25% penalty backing.'
                    : '🌿 Household Flexibility: Pooled with community collective with zero penalty up to 24h prior.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  size="md"
                  className="bg-[#18A558] hover:bg-[#158f4c] text-white font-bold"
                >
                  Confirm & Activate Standing Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
