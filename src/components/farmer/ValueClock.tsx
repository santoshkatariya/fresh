import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, TrendingDown, ArrowRight, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { ProduceBatch } from '../../types';
import { getStoredBatches } from '../../utils/storage';
import { ValueClockVisual } from '../reusable/ValueClockVisual';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const ValueClock: React.FC<{ onNavigateToDecision?: (batchId: string) => void }> = ({
  onNavigateToDecision
}) => {
  const { t } = useTranslation();
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');

  useEffect(() => {
    const list = getStoredBatches();
    setBatches(list);
    if (list.length > 0) {
      setSelectedBatchId(list[0].id);
    }
  }, []);

  const currentBatch = batches.find(b => b.id === selectedBatchId) || batches[0];

  if (!currentBatch) {
    return (
      <div className="p-8 text-center text-gray-500">
        No active harvest batches loaded.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="value-clock-engine-view">
      {/* Top Batch Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#2d7a4a]" />
          <div>
            <h3 className="text-sm font-bold text-gray-900">Select Active Harvest Batch</h3>
            <p className="text-xs text-gray-500">Simulate time-decay dynamics for any listed lot</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedBatchId}
            onChange={e => setSelectedBatchId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1b4d2f]"
          >
            {batches.map(b => (
              <option key={b.id} value={b.id}>
                {b.quantityKg} KG {b.crop} ({b.variety}) - Grade {b.currentQualityScore}/100
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Interactive Visual */}
      <ValueClockVisual batch={currentBatch} distanceKm={34} />

      {/* Action Forward Card */}
      <Card className="p-6 bg-gradient-to-r from-emerald-950 via-[#143d24] to-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#a8d43a]">
            FreshRoute What-If Simulation
          </span>
          <h4 className="text-lg font-bold text-white">
            Ready to Compare 5 Route & Market Scenarios?
          </h4>
          <p className="text-xs text-emerald-200/90 max-w-xl">
            See algorithmic side-by-side net profits for Immediate Sale, 12H Wait, Urban Reroute, Food Processing Offtake, and Cold Storage.
          </p>
        </div>

        <Button
          variant="success"
          size="md"
          onClick={() => onNavigateToDecision && onNavigateToDecision(currentBatch.id)}
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
          className="shrink-0"
        >
          Compare All 5 Market Decisions
        </Button>
      </Card>
    </div>
  );
};
