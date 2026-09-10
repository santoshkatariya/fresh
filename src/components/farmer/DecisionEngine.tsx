import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Award, ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, Cpu, Truck } from 'lucide-react';
import { ProduceBatch, DecisionOption, VehicleOption, BuyerMatch } from '../../types';
import { getStoredBatches, getStoredVehicles, getStoredBuyers, createOrderFromBatch } from '../../utils/storage';
import { evaluateAllDecisions } from '../../utils/profit';
import { evaluateVehicleOptions } from '../../utils/transport';
import { AIRecommendation } from '../reusable/AIRecommendation';
import { DecisionCard } from '../reusable/DecisionCard';
import { VehicleComparison } from '../reusable/VehicleComparison';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface DecisionEngineProps {
  batchId?: string;
  onOrderCreated?: (orderId: string) => void;
}

export const DecisionEngine: React.FC<DecisionEngineProps> = ({
  batchId,
  onOrderCreated
}) => {
  const { t } = useTranslation();
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batchId || '');
  const [decisions, setDecisions] = useState<DecisionOption[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);
  const [matchedBuyers, setMatchedBuyers] = useState<BuyerMatch[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<DecisionOption | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');

  useEffect(() => {
    const batchList = getStoredBatches();
    setBatches(batchList);

    const activeId = batchId && batchList.some(b => b.id === batchId)
      ? batchId
      : batchList[0]?.id || '';
    setSelectedBatchId(activeId);
  }, [batchId]);

  useEffect(() => {
    if (!selectedBatchId) return;
    const currentBatch = batches.find(b => b.id === selectedBatchId) || batches[0];
    if (!currentBatch) return;

    const vehicles = getStoredVehicles();
    const buyers = getStoredBuyers();

    const distanceKm = 34;
    const evaluatedDecisions = evaluateAllDecisions(currentBatch, distanceKm);
    const evaluatedVehicles = evaluateVehicleOptions(currentBatch.quantityKg, distanceKm, vehicles);

    setDecisions(evaluatedDecisions);
    setVehicleOptions(evaluatedVehicles);
    setMatchedBuyers(buyers);

    const best = evaluatedDecisions.find(d => d.isBest) || evaluatedDecisions[0];
    setSelectedDecision(best);
  }, [selectedBatchId, batches]);

  const currentBatch = batches.find(b => b.id === selectedBatchId) || batches[0];
  const bestDecision = decisions.find(d => d.isBest) || decisions[0];
  const bestVehicle = vehicleOptions.find(v => v.isRecommended) || vehicleOptions[0];
  const matchedBuyer = matchedBuyers[0];

  const handleLockRecommendation = () => {
    if (!currentBatch || !bestDecision) return;

    const newOrder = createOrderFromBatch(
      currentBatch,
      bestDecision,
      matchedBuyer?.companyName || 'FreshMart Quick Commerce',
      bestVehicle?.vehicle.name || 'Mini Pickup (Tata Ace)'
    );

    setCreatedOrderNumber(newOrder.id);
    setIsSuccessModalOpen(true);
  };

  if (!currentBatch || !bestDecision) {
    return <div className="p-8 text-center text-gray-500">Loading optimization engine...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto" id="farmer-decision-engine-full">
      {/* Top Batch Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#2d7a4a]" />
            What-If Scenario Optimization Engine
          </h2>
          <p className="text-xs text-gray-500">
            Real-time multi-channel ranking with payload economics & spoilage curves
          </p>
        </div>

        <select
          value={selectedBatchId}
          onChange={e => setSelectedBatchId(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1b4d2f]"
        >
          {batches.map(b => (
            <option key={b.id} value={b.id}>
              {b.quantityKg} KG {b.crop} ({b.variety})
            </option>
          ))}
        </select>
      </div>

      {/* 1. Main AI Recommendation Banner */}
      <AIRecommendation
        batch={currentBatch}
        bestDecision={bestDecision}
        bestVehicle={bestVehicle}
        matchedBuyer={matchedBuyer}
        onConfirmAction={handleLockRecommendation}
      />

      {/* 2. Side-by-Side 6 Decisions Comparison Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              Ranked Post-Harvest Pathways ({decisions.length} Options)
            </h3>
            <p className="text-xs text-gray-500">
              Each pathway calculates gross value minus real freight, handling, and decay penalties
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {decisions.map(dec => (
            <DecisionCard
              key={dec.action}
              decision={dec}
              isSelected={selectedDecision?.action === dec.action}
              onAccept={handleLockRecommendation}
            />
          ))}
        </div>
      </div>

      {/* 3. Carrier Payload Economics Comparison */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <VehicleComparison
          options={vehicleOptions}
          quantityKg={currentBatch.quantityKg}
          distanceKm={34}
          selectedVehicleId={bestVehicle?.vehicle.id}
        />
      </div>

      {/* Confirmation & Order Created Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Smart Route Locked & Order Dispatched!"
        size="md"
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#1b4d2f] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[#2d7a4a]" />
          </div>

          <div className="space-y-1">
            <h4 className="text-xl font-bold text-gray-900">Order #{createdOrderNumber} Created</h4>
            <p className="text-xs text-gray-500">
              Your {currentBatch.quantityKg} KG {currentBatch.crop} batch has been matched with{' '}
              <strong>{matchedBuyer?.companyName || 'FreshMart Quick Commerce'}</strong>.
            </p>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Assigned Vehicle:</span>
              <span className="font-bold text-gray-900">{bestVehicle?.vehicle.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Net Payout:</span>
              <span className="font-extrabold text-[#1b4d2f]">
                ₹{bestDecision.expectedNetProfit.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className="font-semibold text-emerald-800">Escrow Locked (T+0 on Delivery)</span>
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setIsSuccessModalOpen(false)}
            >
              Stay on Decisions
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setIsSuccessModalOpen(false);
                if (onOrderCreated) onOrderCreated(createdOrderNumber);
              }}
            >
              Track Live Route & Telemetry
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
