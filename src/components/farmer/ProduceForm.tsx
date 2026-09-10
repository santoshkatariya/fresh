import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Plus, Sparkles, Scale, MapPin } from 'lucide-react';
import { ProduceBatch, CropType } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface ProduceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (batch: ProduceBatch) => void;
}

export const ProduceForm: React.FC<ProduceFormProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState<CropType>('Tomatoes');
  const [variety, setVariety] = useState('Abhinav Hybrid');
  const [quantityKg, setQuantityKg] = useState<number>(800);
  const [targetPricePerKg, setTargetPricePerKg] = useState<number>(22);
  const [location, setLocation] = useState('Niphad, Nashik, Maharashtra');
  const [qualityScore, setQualityScore] = useState<number>(82);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newBatch: ProduceBatch = {
      id: `batch-${Date.now()}`,
      farmerId: 'farmer-ramesh-01',
      farmerName: 'Ramesh Patil',
      farmLocation: location,
      crop: crop,
      variety: variety,
      quantityKg: quantityKg,
      harvestDate: new Date().toISOString().split('T')[0],
      harvestTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      basePricePerKg: targetPricePerKg,
      currentQualityScore: qualityScore,
      freshnessPercent: qualityScore > 80 ? 90 : 75,
      ripenessPercent: 82,
      damagePercent: Math.max(2, 100 - qualityScore),
      estimatedShelfLifeHours: Math.round((qualityScore / 100) * 36),
      spoilageRiskPercent: Math.max(5, 100 - qualityScore),
      detectedIssues: ['Optimal table firmness index', 'Harvest field verified'],
      imageUrl:
        crop === 'Tomatoes'
          ? 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'
          : crop === 'Grapes'
          ? 'https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
      status: 'available',
      storageType: 'ambient',
      createdAt: new Date().toISOString()
    };

    onSubmit(newBatch);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Harvest Batch" size="md">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 block">Crop Type</label>
            <select
              value={crop}
              onChange={e => setCrop(e.target.value as CropType)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1b4d2f]"
            >
              <option value="Tomatoes">Tomatoes (ಟೊಮೆಟೊ / टमाटर)</option>
              <option value="Grapes">Grapes (ದ್ರಾಕ್ಷಿ / अंगूर)</option>
              <option value="Onions">Onions (ಈರುಳ್ಳಿ / प्याज)</option>
              <option value="Capsicum">Capsicum (ದಪ್ಪಮೆಣಸಿನಕಾಯಿ / शिमला मिर्च)</option>
              <option value="Pomegranates">Pomegranates (ದಾಳಿಂಬೆ / अनार)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 block">Variety</label>
            <input
              type="text"
              value={variety}
              onChange={e => setVariety(e.target.value)}
              placeholder="e.g. Abhinav Hybrid"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d2f]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 block">Quantity (KG)</label>
            <input
              type="number"
              value={quantityKg}
              onChange={e => setQuantityKg(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d2f]"
              required
              min={50}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 block">Baseline Target Price (₹/kg)</label>
            <input
              type="number"
              value={targetPricePerKg}
              onChange={e => setTargetPricePerKg(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d2f]"
              required
              min={5}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 block">Farm / Village Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d2f]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 block">Initial Quality Score ({qualityScore}/100)</label>
            <input
              type="range"
              min={40}
              max={100}
              value={qualityScore}
              onChange={e => setQualityScore(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2d7a4a] mt-2"
            />
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" icon={<Plus className="w-4 h-4" />}>
            Create Harvest Batch
          </Button>
        </div>
      </form>
    </Modal>
  );
};
