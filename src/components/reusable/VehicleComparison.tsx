import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Info, HelpCircle } from 'lucide-react';
import { VehicleOption } from '../../types';
import { VehicleCard } from './VehicleCard';

interface VehicleComparisonProps {
  options: VehicleOption[];
  onSelectVehicle?: (option: VehicleOption) => void;
  selectedVehicleId?: string;
  quantityKg: number;
  distanceKm: number;
}

export const VehicleComparison: React.FC<VehicleComparisonProps> = ({
  options,
  onSelectVehicle,
  selectedVehicleId,
  quantityKg,
  distanceKm
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4" id="vehicle-economics-engine">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#2d7a4a]" />
            {t('vehicle.title')}
          </h3>
          <p className="text-xs text-gray-500">{t('vehicle.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
          <span>Batch: <strong className="text-gray-900">{quantityKg} KG</strong></span>
          <span className="text-gray-300">|</span>
          <span>Distance: <strong className="text-gray-900">{distanceKm} KM</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map(opt => (
          <VehicleCard
            key={opt.vehicle.id}
            option={opt}
            isSelected={selectedVehicleId === opt.vehicle.id}
            onSelect={onSelectVehicle}
          />
        ))}
      </div>

      <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong>Core Vehicle Intelligence Principle:</strong> A heavy truck costs ₹40/km (₹1,360 total) versus a Mini Pickup at ₹14/km (₹476 total). For an 800 kg load, hiring a heavy truck consumes ₹884 of unnecessary freight overhead with zero refrigeration benefit. FreshRoute AI automatically recommends the payload-matched carrier.
        </div>
      </div>
    </div>
  );
};
