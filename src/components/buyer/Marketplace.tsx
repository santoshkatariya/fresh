import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  CheckCircle2,
  MapPin,
  ArrowRight,
  ShoppingCart,
  Sprout,
  Sparkles,
  RefreshCw,
  X,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { ProduceBatch, DecisionOption } from '../../types';
import { getStoredBatches, createOrderFromBatch } from '../../utils/storage';
import { evaluateAllDecisions } from '../../utils/profit';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { MandiTickerBar } from '../reusable/MandiTickerBar';

const VEGETABLE_KEYWORDS = ['vegetable', 'vehetable', 'veg', 'veggies', 'tarakari', 'sabzi', 'sabji'];
const FRUIT_KEYWORDS = ['fruit', 'fruits', 'phal', 'phala', 'fal'];
const CROP_KEYWORDS = ['crop', 'crops', 'produce', 'fasal', 'bele'];

const isVegetableCrop = (cropName?: string): boolean => {
  const c = String(cropName || '').toLowerCase();
  return (
    c.includes('tomato') ||
    c.includes('onion') ||
    c.includes('potato') ||
    c.includes('capsicum') ||
    c.includes('chilli') ||
    c.includes('chili') ||
    c.includes('cabbage') ||
    c.includes('cauliflower') ||
    c.includes('spinach') ||
    c.includes('carrot') ||
    c.includes('cucumber') ||
    c.includes('brinjal') ||
    c.includes('eggplant') ||
    c.includes('pea')
  );
};

const isFruitCrop = (cropName?: string): boolean => {
  const c = String(cropName || '').toLowerCase();
  return (
    c.includes('grape') ||
    c.includes('mango') ||
    c.includes('pomegranate') ||
    c.includes('banana') ||
    c.includes('apple') ||
    c.includes('orange') ||
    c.includes('papaya') ||
    c.includes('guava')
  );
};

export const Marketplace: React.FC<{ onOrderPlaced?: (orderId: string) => void }> = ({
  onOrderPlaced
}) => {
  const { t } = useTranslation();
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'vegetable' | 'fruit' | 'grade_a'>('ALL');
  const [selectedBatch, setSelectedBatch] = useState<ProduceBatch | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  const loadBatches = () => {
    try {
      const stored = getStoredBatches();
      setBatches(Array.isArray(stored) ? stored.filter(b => b && typeof b === 'object' && b.id) : []);
    } catch (err) {
      console.warn('Failed to load marketplace batches:', err);
      setBatches([]);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  // Filter batches with ultra-defensive string handling and semantic category matching
  const filteredBatches = useMemo(() => {
    return (batches || []).filter(b => {
      if (!b || typeof b !== 'object') return false;

      const cropStr = String(b.crop || '').toLowerCase();
      const varietyStr = String(b.variety || '').toLowerCase();
      const locationStr = String(b.farmLocation || (b as any).location || '').toLowerCase();
      const farmerStr = String(b.farmerName || '').toLowerCase();
      const categoryStr = String(
        (b as any).category || (isVegetableCrop(b.crop) ? 'vegetable' : isFruitCrop(b.crop) ? 'fruit' : '')
      ).toLowerCase();

      // Category Pill Filter
      if (activeCategory === 'vegetable') {
        if (!isVegetableCrop(b.crop) && categoryStr !== 'vegetable') return false;
      } else if (activeCategory === 'fruit') {
        if (!isFruitCrop(b.crop) && categoryStr !== 'fruit') return false;
      } else if (activeCategory === 'grade_a') {
        if ((Number(b.currentQualityScore) || 0) < 80) return false;
      }

      // Dropdown Crop Filter
      if (selectedCrop !== 'ALL') {
        if (b.crop !== selectedCrop) return false;
      }

      // Search Filter
      const search = String(searchTerm || '').trim().toLowerCase();
      if (!search) return true;

      // Smart semantic matching for "vegetable", "vehetable", "fruit", "crop"
      const isSearchingVegetables = VEGETABLE_KEYWORDS.some(kw => search.includes(kw));
      const isSearchingFruits = FRUIT_KEYWORDS.some(kw => search.includes(kw));
      const isSearchingCrops = CROP_KEYWORDS.some(kw => search === kw || search.includes(kw));

      if (isSearchingVegetables && (isVegetableCrop(b.crop) || categoryStr === 'vegetable')) {
        return true;
      }
      if (isSearchingFruits && (isFruitCrop(b.crop) || categoryStr === 'fruit')) {
        return true;
      }
      if (isSearchingCrops) {
        return true;
      }

      // Tokenized search for phrases like "tomato hybrid" or "nashik onion"
      const tokens = search.split(/\s+/).filter(Boolean);
      return tokens.every(token =>
        cropStr.includes(token) ||
        varietyStr.includes(token) ||
        locationStr.includes(token) ||
        farmerStr.includes(token) ||
        categoryStr.includes(token) ||
        (token === 'grade' && (b.currentQualityScore || 0) >= 80) ||
        (token === 'a' && (b.currentQualityScore || 0) >= 80)
      );
    });
  }, [batches, searchTerm, selectedCrop, activeCategory]);

  const handlePurchase = (batch: ProduceBatch) => {
    setSelectedBatch(batch);
    setIsBuyModalOpen(true);
  };

  const confirmPurchase = () => {
    if (!selectedBatch) return;

    const unitPrice = Number((selectedBatch as any).targetPricePerKg || selectedBatch.basePricePerKg || 20);
    const quantity = Number(selectedBatch.quantityKg || 0);
    const grossValue = Math.round(unitPrice * quantity);

    let bestDec: DecisionOption;
    try {
      const decisions = evaluateAllDecisions(selectedBatch, 34);
      if (decisions && decisions.length > 0) {
        bestDec = decisions[0];
      } else {
        bestDec = {
          expectedGrossRevenue: grossValue,
          totalCosts: Math.round(grossValue * 0.06),
          expectedNetProfit: Math.round(grossValue * 0.94),
          actionTitle: 'Direct Procurement Escrow',
          timingAdvice: 'Immediate dispatch',
          targetBuyer: 'FreshMart Quick Commerce'
        } as any;
      }
    } catch {
      bestDec = {
        expectedGrossRevenue: grossValue,
        totalCosts: Math.round(grossValue * 0.06),
        expectedNetProfit: Math.round(grossValue * 0.94),
        actionTitle: 'Direct Procurement Escrow',
        timingAdvice: 'Immediate dispatch',
        targetBuyer: 'FreshMart Quick Commerce'
      } as any;
    }

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

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCrop('ALL');
    setActiveCategory('ALL');
  };

  const getEffectiveRate = (batch: ProduceBatch): number => {
    return Number((batch as any).targetPricePerKg || batch.basePricePerKg || 20);
  };

  const getLotTotal = (batch: ProduceBatch): number => {
    const rate = getEffectiveRate(batch);
    const qty = Number(batch.quantityKg || 0);
    return Math.round(rate * qty);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto" id="buyer-marketplace-view">
      {/* Live APMC Mandi Ticker Stream */}
      <MandiTickerBar />

      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-700" />
            Verified Farm Produce Marketplace
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Source pre-graded farm-gate batches directly from verified farmers & FPOs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200 shadow-xs">
            {filteredBatches.length} Lots Available
          </span>
          <button
            type="button"
            onClick={loadBatches}
            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
            title="Refresh Batches"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap shadow-xs ${
            activeCategory === 'ALL'
              ? 'bg-[#0B3D2E] text-white'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          All Produce ({batches.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('vegetable')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap shadow-xs flex items-center gap-1.5 ${
            activeCategory === 'vegetable'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          🥦 Vegetables (ತರಕಾರಿಗಳು / सब्जियां)
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('fruit')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap shadow-xs flex items-center gap-1.5 ${
            activeCategory === 'fruit'
              ? 'bg-purple-700 text-white'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          🍇 Fruits (ಹಣ್ಣುಗಳು / फल)
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('grade_a')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap shadow-xs flex items-center gap-1.5 ${
            activeCategory === 'grade_a'
              ? 'bg-blue-700 text-white'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          ⭐ Grade-A Quality (≥80)
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search crop, variety, vegetables, fruits, or location..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs text-stone-900"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCrop}
            onChange={e => setSelectedCrop(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs text-stone-800"
          >
            <option value="ALL">All Crops (ಎಲ್ಲಾ ಬೆಳೆಗಳು / सभी फसलें)</option>
            <option value="Tomatoes">Tomatoes (ಟೊಮೆಟೊ)</option>
            <option value="Onions">Onions (ಈರುಳ್ಳಿ)</option>
            <option value="Potatoes">Potatoes (ಆಲೂಗಡ್ಡೆ)</option>
            <option value="Capsicum">Capsicum (ದಪ್ಪಮೆಣಸಿನಕಾಯಿ)</option>
            <option value="Green Chillies">Green Chillies (ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ)</option>
            <option value="Grapes">Grapes (ದ್ರಾಕ್ಷಿ)</option>
            <option value="Pomegranates">Pomegranates (ದಾಳಿಂಬೆ)</option>
            <option value="Mangoes">Mangoes (ಮಾವಿನಹಣ್ಣು)</option>
          </select>
        </div>
      </div>

      {/* Grid of Available Batches OR Empty State */}
      {filteredBatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBatches.map(batch => {
            const effectiveRate = getEffectiveRate(batch);
            const lotTotal = getLotTotal(batch);
            const isVeg = isVegetableCrop(batch.crop);

            return (
              <Card
                key={batch.id}
                id={`marketplace-card-${batch.id}`}
                hoverEffect
                className="p-4 flex flex-col justify-between space-y-4 border border-stone-200 shadow-sm"
              >
                <div className="space-y-3">
                  {/* Image & Quality Badge */}
                  <div className="relative h-44 rounded-xl overflow-hidden bg-stone-100">
                    <img
                      src={batch.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'}
                      alt={batch.crop || 'Produce Batch'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                      Grade {batch.currentQualityScore || 80}/100
                    </div>

                    <div className="absolute top-2.5 left-2.5 bg-emerald-700/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3" />
                      {isVeg ? 'Vegetable' : 'Fruit'}
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-sm text-stone-900 px-2.5 py-0.5 rounded-lg text-xs font-extrabold shadow-xs">
                      {batch.quantityKg || 0} KG Available
                    </div>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h3 className="text-base font-bold text-stone-900">
                      {batch.crop} ({batch.variety || 'Standard Lot'})
                    </h3>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">
                        {batch.farmLocation || (batch as any).location || 'Nashik, Maharashtra'} • ~34 KM
                      </span>
                    </p>
                    {batch.farmerName && (
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Farmer: <span className="font-semibold text-stone-700">{batch.farmerName}</span>
                      </p>
                    )}
                  </div>

                  {/* Biometrics Preview */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                        Shelf Life
                      </span>
                      <strong className="text-stone-800 font-bold">~{batch.estimatedShelfLifeHours || 36} Hours</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                        Direct Rate
                      </span>
                      <strong className="text-[#0B3D2E] font-extrabold">₹{effectiveRate}/KG</strong>
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
                  className="bg-[#0B3D2E] hover:bg-[#062016] text-white font-bold"
                >
                  Procure Lot (₹{lotTotal.toLocaleString('en-IN')})
                </Button>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 mx-auto flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-stone-900">
              No Farm Lots Found
            </h3>
            <p className="text-xs sm:text-sm text-stone-600">
              {searchTerm
                ? `No produce batches currently match "${searchTerm}". Try browsing our featured vegetable or fruit crops.`
                : 'No batches available for the selected crop filter.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-[#0B3D2E] text-white text-xs font-bold hover:bg-[#062016] transition-all shadow-sm"
            >
              Clear All Filters
            </button>
            <button
              type="button"
              onClick={() => {
                resetFilters();
                setActiveCategory('vegetable');
              }}
              className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs font-bold hover:bg-stone-50 transition-all shadow-xs"
            >
              View Vegetables (ತರಕಾರಿಗಳು)
            </button>
            <button
              type="button"
              onClick={() => {
                resetFilters();
                setActiveCategory('fruit');
              }}
              className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs font-bold hover:bg-stone-50 transition-all shadow-xs"
            >
              View Fruits (ಹಣ್ಣುಗಳು)
            </button>
          </div>
        </div>
      )}

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
                <span className="text-stone-700">Crop & Variety:</span>
                <span className="text-stone-900">{selectedBatch.crop} ({selectedBatch.variety || 'Hybrid'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Quantity:</span>
                <span className="font-bold text-stone-900">{selectedBatch.quantityKg || 0} KG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Pre-Screened Quality:</span>
                <span className="font-bold text-emerald-800">{selectedBatch.currentQualityScore || 80}/100 Grade A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Offered Rate:</span>
                <span className="font-bold text-stone-900">₹{getEffectiveRate(selectedBatch)} / KG</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between text-base font-extrabold text-blue-900">
                <span>Total Contract Escrow:</span>
                <span>₹{getLotTotal(selectedBatch).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <p className="text-xs text-stone-500">
              By confirming, an automated digital smart escrow contract is generated. Funds are released to the farmer upon receiving dock digital weighbridge scan.
            </p>

            <div className="pt-2 flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setIsBuyModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={confirmPurchase}
                className="bg-[#0B3D2E] hover:bg-[#062016] text-white font-bold"
              >
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
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-bold text-stone-900">Order #{confirmedOrderId} Dispatched</h4>
            <p className="text-xs text-stone-500">
              The farmer has been notified and carrier pickup is initiated from the farm gate.
            </p>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              setIsSuccessModalOpen(false);
              if (onOrderPlaced) onOrderPlaced(confirmedOrderId);
            }}
            className="bg-[#0B3D2E] hover:bg-[#062016] text-white font-bold"
          >
            View Live Incoming Telemetry
          </Button>
        </div>
      </Modal>
    </div>
  );
};
