import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Award, ThermometerSnowflake, Fuel, TrendingUp, CheckCircle2 } from 'lucide-react';
import { VehicleOption } from '../../types';
import { Card } from '../common/Card';

interface VehicleCardProps {
  option: VehicleOption;
  isSelected?: boolean;
  onSelect?: (option: VehicleOption) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  option,
  isSelected = false,
  onSelect
}) => {
  const { t } = useTranslation();
  const { vehicle, isBestProfit } = option;

  return (
    <Card
      id={`vehicle-card-${vehicle.id}`}
      padding="none"
      borderVariant={isBestProfit ? 'success' : isSelected ? 'accent' : 'default'}
      className={`relative overflow-hidden transition-all duration-200 ${
        isBestProfit
          ? 'ring-2 ring-[#2d7a4a] shadow-md bg-gradient-to-b from-emerald-50/30 to-white'
          : isSelected
          ? 'ring-2 ring-emerald-600 shadow-md'
          : 'hover:border-gray-300'
      } ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={() => onSelect && onSelect(option)}
    >
      {/* Top Banner if Best Option */}
      {isBestProfit && (
        <div className="bg-[#1b4d2f] text-[#a8d43a] px-4 py-1.5 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#a8d43a]" />
            {t('vehicle.bestNetProfit')}
          </span>
          <span className="text-[11px] text-white/90">Highest Take-Home Earnings</span>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Header with image & name */}
        <div className="flex items-start gap-3">
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900 leading-snug">{vehicle.name}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{vehicle.description}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                {vehicle.capacityKg.toLocaleString('en-IN')} kg cap
              </span>
              <span className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                ₹{vehicle.costPerKm}/km
              </span>
              {vehicle.coolingAvailable && (
                <span className="text-[11px] bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  <ThermometerSnowflake className="w-3 h-3" />
                  Chilled
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-[#faf8f5] p-3 rounded-xl border border-gray-100">
          <div>
            <span className="text-gray-400 block text-[11px]">Trips Needed</span>
            <span className="font-semibold text-gray-800">{option.tripsNeeded} Trip(s)</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Transport Cost</span>
            <span className="font-semibold text-gray-900">₹{option.transportCost.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Transit Spoilage</span>
            <span className={`font-semibold ${option.spoilagePercentDuringTransit > 8 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {option.spoilagePercentDuringTransit}%
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Recoverable KG</span>
            <span className="font-semibold text-gray-800">{option.recoverableQuantityKg.toLocaleString('en-IN')} kg</span>
          </div>
        </div>

        {/* Net Take-Home Highlight */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 block uppercase tracking-wider font-semibold">
              Expected Net Take-Home
            </span>
            <span className="text-xl font-extrabold text-[#1b4d2f]">
              ₹{option.netProfit.toLocaleString('en-IN')}
            </span>
          </div>

          {isBestProfit ? (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-[#2d7a4a]" />
              Recommended
            </div>
          ) : (
            <div className="text-xs text-gray-400 font-medium">
              -₹{(Math.abs(option.netProfit - (option.isBestProfit ? option.netProfit : option.netProfit))).toLocaleString('en-IN')}
            </div>
          )}
        </div>

        {option.whyRecommended && isBestProfit && (
          <p className="text-[11px] text-[#1b4d2f] font-medium bg-[#a8d43a]/15 p-2 rounded-lg border border-[#a8d43a]/30">
            💡 {option.whyRecommended}
          </p>
        )}
      </div>
    </Card>
  );
};
