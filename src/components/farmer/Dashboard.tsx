import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Tractor,
  ScanLine,
  Clock,
  Cpu,
  Truck,
  TrendingUp,
  Store,
  DollarSign,
  Leaf,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Mic,
  Volume2,
  PhoneCall,
  Navigation,
  Share2
} from 'lucide-react';
import { ProduceBatch, DecisionOption, VehicleOption, BuyerMatch, Order } from '../../types';
import { getStoredBatches, getStoredOrders, getStoredBuyers, getStoredVehicles } from '../../utils/storage';
import { evaluateAllDecisions } from '../../utils/profit';
import { evaluateVehicleOptions } from '../../utils/transport';
import { getCurrentUser } from '../../utils/auth';
import { MetricCard } from '../reusable/MetricCard';
import { ProduceCard } from '../reusable/ProduceCard';
import { AIRecommendation } from '../reusable/AIRecommendation';
import { ValueClockVisual } from '../reusable/ValueClockVisual';
import { GoogleSmartRouteMap } from '../reusable/GoogleSmartRouteMap';
import { MandiTickerBar } from '../reusable/MandiTickerBar';
import { MandiVsOurPriceWidget } from '../reusable/MandiVsOurPriceWidget';
import { DemandBreakdownWidget } from './DemandBreakdownWidget';
import { Card } from '../common/Card';
import { Card3D, Card3DLayer } from '../common/Card3D';
import { Button } from '../common/Button';
import { speakKisanGuidance } from '../../utils/kisanVoice';

interface FarmerDashboardProps {
  onNavigateTab?: (tab: string, batchId?: string) => void;
  onSwitchToSimple?: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ onNavigateTab, onSwitchToSimple }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [primaryBatch, setPrimaryBatch] = useState<ProduceBatch | null>(null);
  const [bestDecision, setBestDecision] = useState<DecisionOption | null>(null);
  const [bestVehicle, setBestVehicle] = useState<VehicleOption | null>(null);
  const [matchedBuyer, setMatchedBuyer] = useState<BuyerMatch | null>(null);

  useEffect(() => {
    const batchList = getStoredBatches();
    const orderList = getStoredOrders();
    const buyers = getStoredBuyers();
    const vehicles = getStoredVehicles();

    setBatches(batchList);
    setOrders(orderList);

    if (batchList.length > 0) {
      const topBatch = batchList[0];
      setPrimaryBatch(topBatch);

      const decisions = evaluateAllDecisions(topBatch, 34);
      const vehicleOpts = evaluateVehicleOptions(topBatch.quantityKg, 34, vehicles);

      setBestDecision(decisions.find((d) => d.isBest) || decisions[0]);
      setBestVehicle(vehicleOpts.find((v) => v.isBestProfit) || vehicleOpts[0]);
      setMatchedBuyer(buyers[0]);
    }
  }, []);

  const totalHarvestKg = batches.reduce((acc, b) => acc + b.quantityKg, 0);
  const lang = i18n.language;

  return (
    <div className="space-y-8 max-w-7xl mx-auto" id="farmer-dashboard-root">
      {/* Real-time APMC Mandi Ticker Bar */}
      <MandiTickerBar />

      {/* Top Welcome Banner */}
      <div className="bg-[#0B3D2E] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Soft background accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#18A558]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#18A558] text-white font-bold text-xs">
              🌾 Verified FPO Farmer
            </span>
            <span className="text-xs text-emerald-200">
              {user?.location || 'Niphad, Nashik, Maharashtra'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {lang === 'kn' ? `ನಮಸ್ಕಾರ, ${user?.name || 'ರಮೇಶ್ ಪಾಟೀಲ್'}!` : lang === 'hi' ? `नमस्ते, ${user?.name || 'रमेश पाटिल'}!` : `Namaste, ${user?.name || 'Ramesh Patil'}!`}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
            {lang === 'kn'
              ? `FreshRoute.2 AI ನಿಮ್ಮ ${batches.length} ಫಸಲುಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡುತ್ತಿದೆ. ಶೂನ್ಯ ನಷ್ಟದೊಂದಿಗೆ ಗರಿಷ್ಠ ಲಾಭ ಗಳಿಸಿ.`
              : lang === 'hi'
              ? `FreshRoute.2 AI आपकी ${batches.length} फसलों की निगरानी कर रहा है। शून्य नुकसान के साथ अधिकतम लाभ प्राप्त करें।`
              : `FreshRoute.2 AI is tracking ${batches.length} active harvest lots. Zero value loss detected today.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {onSwitchToSimple && (
            <button
              onClick={onSwitchToSimple}
              className="px-4 py-2 rounded-2xl bg-white text-[#0B3D2E] hover:bg-emerald-50 font-black text-xs shadow-md flex items-center gap-2 border border-white/50 transition-all active:scale-[0.98]"
            >
              <span>🌿</span>
              <span>{lang === 'kn' ? 'ಸರಳ ಕಿಸಾನ್ ಮೋಡ್ (Simple)' : lang === 'hi' ? 'सरल किसान मोड' : 'Switch to Saral Kisan (Simple)'}</span>
            </button>
          )}

          <Button
            variant="success"
            size="md"
            onClick={() => onNavigateTab && onNavigateTab('scanner')}
            icon={<ScanLine className="w-4 h-4" />}
            className="bg-[#18A558] hover:bg-[#158f4c] text-white shadow-md"
          >
            {t('nav.scanner')}
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => onNavigateTab && onNavigateTab('smart-routes')}
            icon={<Navigation className="w-4 h-4 text-[#A8D94C]" />}
            className="text-white border-white/30 hover:bg-white/10"
          >
            {t('nav.routes')}
          </Button>
        </div>
      </div>

      {/* Kisan Quick Action Hub (Farmer Friendly Visual Shortcuts with 3D Hover) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card3D
          depth={14}
          glareEffect={true}
          onClick={() => onNavigateTab && onNavigateTab('scanner')}
          className="p-4 bg-white border border-slate-200/90 hover:border-[#18A558] hover:shadow-md transition-all text-left group h-full"
        >
          <Card3DLayer zDepth={25}>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#18A558] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ScanLine className="w-5 h-5" />
            </div>
          </Card3DLayer>
          <Card3DLayer zDepth={20}>
            <span className="font-extrabold text-sm text-[#17201C] block">
              {lang === 'kn' ? '೧-ಕ್ಲಿಕ್ ಸ್ಕ್ಯಾನ್' : lang === 'hi' ? '१-क्लिक स्कैन' : '1-Click Scan'}
            </span>
          </Card3DLayer>
          <Card3DLayer zDepth={12}>
            <span className="text-[11px] text-[#6F7D75] block mt-0.5">
              {lang === 'kn' ? 'ಕ್ಯಾಮರಾದಿಂದ ಗುಣಮಟ್ಟ ಪರೀಕ್ಷಿಸಿ' : lang === 'hi' ? 'कैमरा से क्वालिटी जांचें' : 'Instant AI camera grading'}
            </span>
          </Card3DLayer>
        </Card3D>

        <Card3D
          depth={14}
          glareEffect={true}
          onClick={() => onNavigateTab && onNavigateTab('smart-routes')}
          className="p-4 bg-white border border-slate-200/90 hover:border-[#18A558] hover:shadow-md transition-all text-left group h-full"
        >
          <Card3DLayer zDepth={25}>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#18A558] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Navigation className="w-5 h-5" />
            </div>
          </Card3DLayer>
          <Card3DLayer zDepth={20}>
            <span className="font-extrabold text-sm text-[#17201C] block">
              {lang === 'kn' ? 'ಜಿಪಿಎಸ್ ಮಾರ್ಗ' : lang === 'hi' ? 'जीपीएस रूट' : 'Smart GPS Route'}
            </span>
          </Card3DLayer>
          <Card3DLayer zDepth={12}>
            <span className="text-[11px] text-[#6F7D75] block mt-0.5">
              {lang === 'kn' ? 'ಕಡಿಮೆ ಕಂಪನದ ಹೆದ್ದಾರಿ' : lang === 'hi' ? 'कम कंपन वाला सुरक्षित रास्ता' : 'Vibration-aware corridor'}
            </span>
          </Card3DLayer>
        </Card3D>

        <Card3D
          depth={14}
          glareEffect={true}
          onClick={() => onNavigateTab && onNavigateTab('buyer-matches')}
          className="p-4 bg-white border border-slate-200/90 hover:border-[#18A558] hover:shadow-md transition-all text-left group h-full"
        >
          <Card3DLayer zDepth={25}>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#18A558] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
          </Card3DLayer>
          <Card3DLayer zDepth={20}>
            <span className="font-extrabold text-sm text-[#17201C] block">
              {lang === 'kn' ? 'ಖರೀದಿದಾರರ ಪಟ್ಟಿ' : lang === 'hi' ? 'ಥोक खरीदार' : 'Bulk Buyers'}
            </span>
          </Card3DLayer>
          <Card3DLayer zDepth={12}>
            <span className="text-[11px] text-[#6F7D75] block mt-0.5">
              {lang === 'kn' ? 'ನೇರ ₹೩೪/ಕೆಜಿ ದರ' : lang === 'hi' ? 'सीधे ₹३४/किग्रा' : '3 Verified direct bids'}
            </span>
          </Card3DLayer>
        </Card3D>

        <Card3D
          depth={14}
          glareEffect={true}
          onClick={() => {
            const advice = `ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಫಸಲಿಗೆ ಈಗ ಮಾರಾಟ ಮಾಡಲು ಫ್ರೆಶ್‌ಮಾರ್ಟ್ ಅತ್ಯುತ್ತಮ ಖರೀದಿದಾರ. ಲಾಭ ₹15,650.`;
            speakKisanGuidance(advice, lang);
          }}
          className="p-4 bg-white border border-slate-200/90 hover:border-[#18A558] hover:shadow-md transition-all text-left group h-full"
        >
          <Card3DLayer zDepth={25}>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Volume2 className="w-5 h-5" />
            </div>
          </Card3DLayer>
          <Card3DLayer zDepth={20}>
            <span className="font-extrabold text-sm text-[#17201C] block">
              {lang === 'kn' ? 'ಕಿಸಾನ್ ಧ್ವನಿ' : lang === 'hi' ? 'किसान वाणी' : 'Kisan Voice Bot'}
            </span>
          </Card3DLayer>
          <Card3DLayer zDepth={12}>
            <span className="text-[11px] text-[#6F7D75] block mt-0.5">
              {lang === 'kn' ? 'ಧ್ವನಿ ಸಲಹೆ ಆಲಿಸಿ' : lang === 'hi' ? 'आवाज़ में सलाह सुनें' : 'Spoken harvest guidance'}
            </span>
          </Card3DLayer>
        </Card3D>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t('metrics.activeBatches')}
          value={batches.length}
          trend={`${totalHarvestKg} KG total`}
          icon={<Tractor className="w-5 h-5 text-[#0B3D2E]" />}
          borderVariant="default"
        />

        <MetricCard
          title={t('metrics.totalRevenue')}
          value={34200}
          prefix="₹"
          trend="+18.4%"
          trendLabel="direct vs mandi"
          icon={<DollarSign className="w-5 h-5 text-[#18A558]" />}
          borderVariant="success"
        />

        <MetricCard
          title="Optimal Action Window"
          value="< 18 Hours"
          trend="88% Fresh"
          trendLabel="peak premium"
          icon={<Clock className="w-5 h-5 text-amber-700" />}
          borderVariant="accent"
        />

        <MetricCard
          title="Avg Quality Rating"
          value={82}
          suffix="/100"
          trend="Grade A"
          trendLabel="export/retail grade"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-800" />}
          borderVariant="default"
        />
      </div>

      {/* Real-Time Mandi Price vs FreshRoute vs City Rate Live Arbitrage Widget */}
      <MandiVsOurPriceWidget
        crop={primaryBatch?.crop || 'Tomatoes'}
        weightKg={primaryBatch?.weightKg || 850}
        qualityScore={primaryBatch?.qualityScore || 82}
        onExploreFullRadar={() => onNavigateTab && onNavigateTab('mandi-rates')}
      />

      {/* Pre-Order Demand Breakdown (Bulk Hotel 5-Day Lock vs Household Flexible Buffer) */}
      <DemandBreakdownWidget
        initialCrop={primaryBatch?.crop || 'Tomatoes'}
        totalHarvestKg={primaryBatch?.quantityKg || 800}
        onNavigateTab={onNavigateTab}
      />

      {/* Primary AI Recommendation Banner with Voice & WhatsApp */}
      {primaryBatch && bestDecision && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#17201C] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#18A558]" />
              Active Lot Optimization Focus
            </h2>
            <button
              onClick={() => onNavigateTab && onNavigateTab('decisions', primaryBatch.id)}
              className="text-xs font-bold text-[#18A558] hover:underline flex items-center gap-1"
            >
              Detailed Scenario Matrix <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <AIRecommendation
            batch={primaryBatch}
            bestDecision={bestDecision}
            bestVehicle={bestVehicle || undefined}
            matchedBuyer={matchedBuyer || undefined}
            onConfirmAction={() => onNavigateTab && onNavigateTab('decisions', primaryBatch.id)}
          />
        </div>
      )}

      {/* Connected Maps AI Smart Route Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#17201C] flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#18A558]" />
            AI Smart Transit Corridor (Connected Map)
          </h2>
          <button
            onClick={() => onNavigateTab && onNavigateTab('smart-routes')}
            className="text-xs font-bold text-[#18A558] hover:underline flex items-center gap-1"
          >
            Full GPS Route Navigator <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <GoogleSmartRouteMap
          origin="Niphad Farm Gate, Nashik"
          destination="FreshMart Central DC, Mumbai"
          cropName={primaryBatch?.crop || 'Grade-A Tomatoes'}
          batchWeightKg={primaryBatch?.quantityKg || 850}
        />
      </div>

      {/* Value Clock Live Simulation */}
      {primaryBatch && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#17201C] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#18A558]" />
              Hourly Value Clock & Decay Forecast
            </h2>
            <button
              onClick={() => onNavigateTab && onNavigateTab('value-clock', primaryBatch.id)}
              className="text-xs font-bold text-[#18A558] hover:underline flex items-center gap-1"
            >
              Full Screen Clock <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ValueClockVisual batch={primaryBatch} distanceKm={34} />
        </div>
      )}

      {/* Active Harvest Batches Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#17201C]">
            Registered Harvest Batches ({batches.length})
          </h2>
          <button
            onClick={() => onNavigateTab && onNavigateTab('produce')}
            className="text-xs font-bold text-[#18A558] hover:underline flex items-center gap-1"
          >
            Manage All Batches <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {batches.slice(0, 3).map((batch) => (
            <ProduceCard
              key={batch.id}
              batch={batch}
              onSelect={(b) => onNavigateTab && onNavigateTab('decisions', b.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
