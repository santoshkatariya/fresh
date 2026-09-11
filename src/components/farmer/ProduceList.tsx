import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, Sprout, ArrowRight } from 'lucide-react';
import { ProduceBatch } from '../../types';
import { getStoredBatches, saveBatches } from '../../utils/storage';
import { ProduceCard } from '../reusable/ProduceCard';
import { Button } from '../common/Button';
import { ProduceForm } from './ProduceForm';

interface ProduceListProps {
  onSelectBatch?: (batch: ProduceBatch) => void;
  onRunScanner?: () => void;
}

export const ProduceList: React.FC<ProduceListProps> = ({
  onSelectBatch,
  onRunScanner
}) => {
  const { t } = useTranslation();
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setBatches(getStoredBatches());
  }, []);

  const handleBatchCreated = (newBatch: ProduceBatch) => {
    const updated = [newBatch, ...batches];
    setBatches(updated);
    saveBatches(updated);
    setIsAddModalOpen(false);
  };

  const filteredBatches = batches.filter(b => {
    const search = (searchTerm || '').trim().toLowerCase();
    if (!search) return true;
    const cropStr = (b.crop || '').toLowerCase();
    const varietyStr = (b.variety || '').toLowerCase();
    const locationStr = (b.farmLocation || (b as any).location || '').toLowerCase();
    return cropStr.includes(search) || varietyStr.includes(search) || locationStr.includes(search);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto" id="farmer-produce-inventory">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-[#2d7a4a]" />
            Harvest Batches & Inventory
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Track real-time biometric quality grades and decay clocks for all harvested lots
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRunScanner && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRunScanner}
            >
              Scan New Sample
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Harvest Batch
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search crop, variety, or location..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d2f] shadow-xs"
        />
      </div>

      {/* Grid of Produce Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBatches.map(batch => (
          <ProduceCard
            key={batch.id}
            batch={batch}
            onSelect={onSelectBatch}
          />
        ))}
      </div>

      {/* Add Produce Batch Modal */}
      {isAddModalOpen && (
        <ProduceForm
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleBatchCreated}
        />
      )}
    </div>
  );
};
