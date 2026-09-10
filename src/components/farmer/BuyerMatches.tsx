import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Store, ShieldCheck, MapPin, ArrowRight, CheckCircle2, Award, Zap, Phone } from 'lucide-react';
import { BuyerMatch } from '../../types';
import { getStoredBuyers } from '../../utils/storage';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const BuyerMatches: React.FC<{ onSelectBuyer?: (buyer: BuyerMatch) => void }> = ({
  onSelectBuyer
}) => {
  const { t } = useTranslation();
  const [buyers, setBuyers] = useState<BuyerMatch[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);

  useEffect(() => {
    setBuyers(getStoredBuyers());
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="farmer-buyer-matches-view">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-[#2d7a4a]" />
            {t('buyerMatches.title')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">{t('buyerMatches.subtitle')}</p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-[#1b4d2f] rounded-full self-start sm:self-auto">
          {buyers.length} Verified Enterprise Buyers Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {buyers.map((buyer, idx) => (
          <Card
            key={buyer.id}
            id={`buyer-card-${buyer.id}`}
            borderVariant={idx === 0 ? 'success' : 'default'}
            hoverEffect
            className={`space-y-4 relative ${
              idx === 0 ? 'ring-2 ring-[#2d7a4a] bg-gradient-to-b from-emerald-50/30 to-white' : ''
            }`}
          >
            {idx === 0 && (
              <div className="absolute -top-3 right-4 bg-[#1b4d2f] text-[#a8d43a] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                ★ 98% AI Match
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d7a4a]">
                {buyer.buyerType}
              </span>
              <h3 className="text-base font-bold text-gray-900 leading-snug">{buyer.companyName}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {buyer.location} ({buyer.distanceKm} km away)
              </p>
            </div>

            <div className="bg-[#faf8f5] p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Offered Rate</span>
                <span className="text-lg font-extrabold text-[#1b4d2f]">
                  ₹{buyer.offeredPricePerKg}/kg
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block text-[10px] uppercase">Min Quality</span>
                <span className="font-bold text-gray-800">{buyer.requiredQualityScore}/100</span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span>Daily Capacity:</span>
                <strong className="text-gray-900">{buyer.demandQuantityKg} KG</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Settlement Terms:</span>
                <strong className="text-emerald-700 font-semibold">{buyer.paymentTerms}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Verification:</span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>

            <Button
              variant={idx === 0 ? 'primary' : 'outline'}
              fullWidth
              size="sm"
              onClick={() => onSelectBuyer && onSelectBuyer(buyer)}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Direct Dispatch Contract
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
