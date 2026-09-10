import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Filter, Search, ShieldCheck, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { ProduceBatch } from '../../types';
import { getStoredBatches, createOrderFromBatch } from '../../utils/storage';
import { evaluateAllDecisions } from '../../utils/profit';
import { MandiTickerBar } from '../reusable/MandiTickerBar';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

export const Marketplace: React.FC<{ onOrderPlaced?: (orderId: string) => void }> = ({
  onOrderPlaced
}) => {
  const { t } = useTranslation();
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState<ProduceBatch | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  useEffect(() => {
    setBatches(getStoredBatches());
  }, []);

  const filteredBatches = batches.filter(b => {
    const matchesSearch =
      b.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = selectedCrop === 'ALL' || b.crop === selectedCrop;
    return matchesSearch && matchesCrop;
  });

  const handlePurchase = (batch: ProduceBatch) => {
    setSelectedBatch(batch);
    setIsBuyModalOpen(true);
  };

  const confirmPurchase = () => {
    if (!selectedBatch) return;

    const decisions = evaluateAllDecisions(selectedBatch, 34);
    const bestDec = decisions[0];

    const newOrder = createOrderFromBatch(
      selectedBatch,
      bestDec,
      'FreshMart Central DC (Bhandup, Mumbai)',
      'Mini Pickup (Tata Ace)'
    );

    setConfirmedOrderId(newOrder.id);
    setIsBuyModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto" id="buyer-marketplace-view">
      {/* Live APMC Mandi Ticker Stream */}
      <MandiTickerBar />

      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-700" />
            Verified Farm Produce Marketplace
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Source pre-graded farm-gate batches directly from verified farmers & FPOs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200">
            {filteredBatches.length} Lots Available
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search crop, variety, or farmer region..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCrop}
            onChange={e => setSelectedCrop(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
          >
            <option value="ALL">All Crops (ಎಲ್ಲಾ ಬೆಳೆಗಳು / सभी फसलें)</option>
            <option value="Tomatoes">Tomatoes</option>
            <option value="Grapes">Grapes</option>
            <option value="Onions">Onions</option>
            <option value="Capsicum">Capsicum</option>
          </select>
        </div>
      </div>

      {/* Grid of Available Batches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBatches.map(batch => (
          <Card
            key={batch.id}
            id={`marketplace-card-${batch.id}`}
            hoverEffect
            className="overflow-hidden space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Batch Image */}
              <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={batch.imageUrl}
                  alt={batch.crop}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#a8d43a]" />
                  Grade {batch.currentQualityScore}/100
                </div>

                <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-gray-900 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                  {batch.quantityKg} KG Available
                </div>
              </div>

              {/* Title & Location */}
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {batch.crop} ({batch.variety})
                </h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {batch.location} • ~34 KM Transit Distance
                </p>
              </div>

              {/* Biometrics Preview */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Shelf Life</span>
                  <strong className="text-gray-800">~{batch.estimatedShelfLifeHours} Hours</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Direct Rate</span>
                  <strong className="text-[#1b4d2f]">₹{batch.targetPricePerKg}/KG</strong>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="sm"
              onClick={() => handlePurchase(batch)}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Procure Lot (₹{(batch.quantityKg * batch.targetPricePerKg).toLocaleString('en-IN')})
            </Button>
          </Card>
        ))}
      </div>

      {/* Procurement Order Confirmation Modal */}
      {selectedBatch && (
        <Modal
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
          title="Confirm Direct Farm Procurement Order"
          size="md"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-700">Crop & Variety:</span>
                <span className="text-gray-900">{selectedBatch.crop} ({selectedBatch.variety})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-bold text-gray-900">{selectedBatch.quantityKg} KG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pre-Screened Quality:</span>
                <span className="font-bold text-emerald-800">{selectedBatch.currentQualityScore}/100 Grade A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Offered Rate:</span>
                <span className="font-bold text-gray-900">₹{selectedBatch.targetPricePerKg} / KG</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between text-base font-extrabold text-blue-900">
                <span>Total Contract Escrow:</span>
                <span>₹{(selectedBatch.quantityKg * selectedBatch.targetPricePerKg).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              By confirming, an automated digital smart escrow contract is generated. Funds are released to the farmer upon receiving dock digital weighbridge scan.
            </p>

            <div className="pt-2 flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setIsBuyModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" fullWidth onClick={confirmPurchase}>
                Lock Contract & Dispatch Carrier
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Procurement Order Confirmed!"
        size="md"
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-bold text-gray-900">Order #{confirmedOrderId} Dispatched</h4>
            <p className="text-xs text-gray-500">
              The farmer has been notified and carrier pickup is initiated from Niphad farm gate.
            </p>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              setIsSuccessModalOpen(false);
              if (onOrderPlaced) onOrderPlaced(confirmedOrderId);
            }}
          >
            View Live Incoming Telemetry
          </Button>
        </div>
      </Modal>
    </div>
  );
};
