// Source: Google Maps Platform Code Assist
// Interactive Google Maps Smart Route & Landed Cost Optimizer for FreshRoute AI
import React, { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import {
  Navigation,
  Truck,
  MapPin,
  Thermometer,
  Droplets,
  ShieldCheck,
  Volume2,
  VolumeX,
  RotateCcw,
  AlertTriangle,
  Zap,
  PhoneCall,
  Share2,
  CheckCircle2,
  Sliders,
  DollarSign,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
  Snowflake,
  Fuel,
  CreditCard,
  Layers,
  Sparkles
} from 'lucide-react';
import { speakKisanGuidance, stopKisanSpeech } from '../../utils/kisanVoice';
import { useTranslation } from 'react-i18next';

export interface RouteOption {
  id: string;
  name: string;
  nameVernacular?: string;
  distanceKm: number;
  eta: string;
  durationMinutes: number;
  transportCost: number;
  fuelCost: number;
  driverWages: number;
  tollCost: number;
  additionalFee?: number;
  spoilageRiskPercent: number;
  spoilageLossValue: number;
  totalLandedCost: number;
  vehicleUsed: string;
  vibrationScore: string;
  roadQuality: 'Smooth Expressway' | 'Moderate State Highway' | 'Bumpy Rural Road';
  isRecommended?: boolean;
  economicAdvantage?: string;
  color: string;
  description: string;
  waypoints: {
    lat: number;
    lng: number;
    title: string;
    type: 'farm' | 'highway' | 'cold_hub' | 'buyer';
    info: string;
  }[];
}

const PRESET_ORIGINS = [
  { label: 'Niphad Farm Gate, Nashik (Grape & Tomato)', value: 'Niphad Farm Gate, Nashik', lat: 20.0063, lng: 73.7900 },
  { label: 'Kolar Agro Mandi, Karnataka (Tomato Hub)', value: 'Kolar Agro Mandi, Karnataka', lat: 13.1367, lng: 78.1292 },
  { label: 'Narayangaon Farm Belt, Pune (Vegetables)', value: 'Narayangaon Farm Belt, Pune', lat: 19.1245, lng: 73.9782 },
  { label: 'Sangli Pomegranate Farm Gate', value: 'Sangli Farm Gate', lat: 16.8524, lng: 74.5815 },
];

const PRESET_DESTINATIONS = [
  { label: 'FreshMart Central DC, Bhandup, Mumbai', value: 'FreshMart Central DC, Mumbai', lat: 19.1456, lng: 72.9360 },
  { label: 'Vashi APMC Wholesale Market, Navi Mumbai', value: 'Vashi APMC Market, Navi Mumbai', lat: 19.0760, lng: 72.9995 },
  { label: 'Blinkit / Zepto Quick-Commerce Hub, Mumbai', value: 'Quick-Commerce Hub, Mumbai', lat: 19.1136, lng: 72.8697 },
  { label: 'Bangalore Electronic City Fulfillment Center', value: 'Electronic City DC, Bangalore', lat: 12.8452, lng: 77.6602 },
];

interface GoogleSmartRouteMapProps {
  origin?: string;
  destination?: string;
  cropName?: string;
  batchWeightKg?: number;
  cropValuePerKg?: number;
  initialRouteId?: string;
}

export const GoogleSmartRouteMap: React.FC<GoogleSmartRouteMapProps> = ({
  origin: defaultOrigin = 'Niphad Farm Gate, Nashik',
  destination: defaultDestination = 'FreshMart Central DC, Mumbai',
  cropName = 'Grade-A Tomatoes',
  batchWeightKg = 850,
  cropValuePerKg = 34,
  initialRouteId = 'nh-express-corridor',
}) => {
  const { t, i18n } = useTranslation();
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  // Interactive state
  const [origin, setOrigin] = useState<string>(defaultOrigin);
  const [destination, setDestination] = useState<string>(defaultDestination);
  const [vehicleType, setVehicleType] = useState<'mini_truck' | 'reefer_van' | 'electric_van' | 'heavy_lorry'>('mini_truck');
  const [avoidTolls, setAvoidTolls] = useState<boolean>(false);
  const [preferColdChain, setPreferColdChain] = useState<boolean>(false);
  
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(initialRouteId);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(false);
  
  const [progress, setProgress] = useState<number>(38);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<boolean>(false);
  const [showCostBreakdown, setShowCostBreakdown] = useState<boolean>(true);
  const [activeWaypointPopup, setActiveWaypointPopup] = useState<number | null>(null);

  // Fetch or calculate routes via backend API
  const fetchSmartRoutes = async () => {
    setIsLoadingRoutes(true);
    try {
      const res = await fetch('/api/routes/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          cropName,
          batchWeightKg,
          cropValuePerKg,
          vehicleType,
          avoidTolls,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          setRoutes(data.routes);
          if (!selectedRouteId || !data.routes.some((r: RouteOption) => r.id === selectedRouteId)) {
            setSelectedRouteId(data.bestRouteId || data.routes[0].id);
          }
          setIsLoadingRoutes(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Using client-side fallback route computation:', err);
    }

    // Client-side fallback computation
    const computed = computeFallbackRoutes({
      origin,
      destination,
      cropName,
      batchWeightKg,
      cropValuePerKg,
      vehicleType,
      avoidTolls,
    });
    setRoutes(computed);
    const best = computed.find((r) => r.isRecommended) || computed[0];
    setSelectedRouteId(best.id);
    setIsLoadingRoutes(false);
  };

  useEffect(() => {
    fetchSmartRoutes();
  }, [origin, destination, vehicleType, avoidTolls, batchWeightKg, cropValuePerKg]);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0] || computeFallbackRoutes({})[0];

  // Animated truck along route
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 96) return 12;
        return prev + 1;
      });
    }, 450);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Voice navigation guidance for farmers
  const handleVoiceNavigation = () => {
    if (isSpeaking) {
      stopKisanSpeech();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    let speechMessage = '';
    const lang = i18n.language;

    if (lang === 'kn') {
      speechMessage = `ಸ್ಮಾರ್ಟ್ ರೂಟ್ ಮಾರ್ಗದರ್ಶನ: ನಿಮ್ಮ ${batchWeightKg} ಕೆಜಿ ${cropName} ಫಸಲಿಗೆ "${activeRoute.nameVernacular || activeRoute.name}" ಅತ್ಯುತ್ತಮ ಮಾರ್ಗವಾಗಿದೆ. ಒಟ್ಟು ಸಾಗಾಟ ವೆಚ್ಚ ₹${activeRoute.transportCost} ಮತ್ತು ಅಂದಾಜು ಸಮಯ ${activeRoute.eta}. ರಸ್ತೆ ನಷ್ಟ ಕೇವಲ ${activeRoute.spoilageRiskPercent}% ಆಗಿದೆ.`;
    } else if (lang === 'hi') {
      speechMessage = `स्मार्ट रूट मार्गदर्शन: आपकी ${batchWeightKg} किलो ${cropName} के लिए "${activeRoute.name}" सबसे किफायती रूट है। कुल किराया ₹${activeRoute.transportCost}, समय ${activeRoute.eta}, और फल की क्षति मात्र ${activeRoute.spoilageRiskPercent}% है।`;
    } else {
      speechMessage = `Smart Logistics Route Guidance: For your ${batchWeightKg} kg of ${cropName}, ${activeRoute.name} is the optimal choice. Freight cost is ₹${activeRoute.transportCost} with ETA of ${activeRoute.eta}. Spoilage damage is minimal at ${activeRoute.spoilageRiskPercent}%.`;
    }

    speakKisanGuidance(speechMessage, lang).then(() => {
      setIsSpeaking(false);
    });
  };

  const handleShareWhatsApp = () => {
    const text = `🚚 *FreshRoute AI Smart Logistics Pass* 🌾\n*Crop:* ${cropName} (${batchWeightKg} KG)\n*Optimal Route:* ${activeRoute.name}\n*Origin:* ${origin}\n*Destination:* ${destination}\n*Distance & ETA:* ${activeRoute.distanceKm} KM • ${activeRoute.eta}\n*Total Landed Cost:* ₹${activeRoute.totalLandedCost} (Freight: ₹${activeRoute.transportCost} | Toll: ₹${activeRoute.tollCost} | Loss Risk: ${activeRoute.spoilageRiskPercent}%)\n*Live GPS Tracking:* https://freshroute.ai/track/ORD-77291`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
  };

  // Center map between Nashik and Mumbai or dynamically based on waypoints
  const mapCenter = useMemo(() => {
    if (activeRoute?.waypoints && activeRoute.waypoints.length > 0) {
      const avgLat = activeRoute.waypoints.reduce((acc, wp) => acc + wp.lat, 0) / activeRoute.waypoints.length;
      const avgLng = activeRoute.waypoints.reduce((acc, wp) => acc + wp.lng, 0) / activeRoute.waypoints.length;
      return { lat: avgLat, lng: avgLng };
    }
    return { lat: 19.55, lng: 73.35 };
  }, [activeRoute]);

  return (
    <div className="space-y-6" id="google-smart-route-container">
      {/* Top Header & Fast Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#18A558] animate-pulse" />
            <h3 className="text-base sm:text-lg font-black text-[#17201C] flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#18A558]" />
              Google Maps Smart Route & Cost Optimizer
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#18A558]/10 text-[#0B3D2E] border border-[#18A558]/20">
              Vibration & Landed Cost AI
            </span>
          </div>
          <p className="text-xs text-[#6F7D75] mt-1">
            Calculates exact freight, toll passes, driver wages, and vibration damage to find the most profitable route for your harvest.
          </p>
        </div>

        {/* Action buttons: Voice Guidance + WhatsApp Share */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleVoiceNavigation}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isSpeaking
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-[#0B3D2E] text-white hover:bg-[#18A558]'
            }`}
            title="Listen to Route Guidance in your language"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#A8D94C]" />}
            <span>{isSpeaking ? 'Speaking...' : 'ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ / Voice Guide'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#25D366] text-white hover:bg-[#20ba59] transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp Slip</span>
          </button>
        </div>
      </div>

      {/* Interactive Controls & Scenario Customizer */}
      <div className="bg-[#F7F8F2] p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#0B3D2E]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B3D2E]">
              Route & Vehicle Parameters
            </span>
          </div>
          <span className="text-[11px] text-[#6F7D75] font-semibold">
            Payload: <strong className="text-[#17201C]">{batchWeightKg} KG {cropName}</strong> (@ ₹{cropValuePerKg}/kg)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Origin Selector */}
          <div>
            <label className="block text-[11px] font-bold text-[#17201C] mb-1">
              📍 Farm Origin Gate:
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-white text-[#17201C] focus:outline-none focus:ring-2 focus:ring-[#18A558]"
            >
              {PRESET_ORIGINS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Selector */}
          <div>
            <label className="block text-[11px] font-bold text-[#17201C] mb-1">
              🏢 Buyer Receiving Gate:
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-white text-[#17201C] focus:outline-none focus:ring-2 focus:ring-[#18A558]"
            >
              {PRESET_DESTINATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Type Selector */}
          <div>
            <label className="block text-[11px] font-bold text-[#17201C] mb-1">
              🚚 Transport Vehicle:
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-white text-[#17201C] focus:outline-none focus:ring-2 focus:ring-[#18A558]"
            >
              <option value="mini_truck">Tata Ace / 1.5T Pickup (₹6.8/km)</option>
              <option value="reefer_van">Chilled Reefer Van (₹11.5/km, 0% Loss)</option>
              <option value="electric_van">EV Cargo Van (₹3.4/km, Eco)</option>
              <option value="heavy_lorry">10-Ton Heavy Crate Truck (₹16/km)</option>
            </select>
          </div>

          {/* Preference Checkboxes */}
          <div className="flex items-center gap-3 pt-4 sm:pt-6">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#17201C] cursor-pointer">
              <input
                type="checkbox"
                checked={avoidTolls}
                onChange={(e) => setAvoidTolls(e.target.checked)}
                className="w-4 h-4 rounded text-[#18A558] focus:ring-[#18A558] border-stone-300"
              />
              <span>Avoid Tolls</span>
            </label>

            <button
              onClick={() => fetchSmartRoutes()}
              className="ml-auto px-3 py-1.5 rounded-xl bg-[#0B3D2E] text-white text-xs font-bold hover:bg-[#18A558] transition-colors"
            >
              {isLoadingRoutes ? 'Calculating...' : 'Recalculate'}
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Route Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {routes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          return (
            <button
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#18A558] ring-2 ring-[#18A558]/30 shadow-md'
                  : 'bg-[#F7F8F2] border-stone-200 hover:bg-white hover:border-stone-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      route.isRecommended
                        ? 'bg-[#18A558] text-white shadow-2xs'
                        : route.id === 'cold-hub-link'
                        ? 'bg-sky-100 text-sky-800'
                        : route.id === 'scenic-ghats-toll-free'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {route.isRecommended ? '🏆 Best Route' : route.roadQuality}
                  </span>
                  <span className="text-xs font-black text-[#17201C]">{route.eta}</span>
                </div>

                <h4 className="font-bold text-xs text-[#17201C] line-clamp-1 mt-1">
                  {route.name}
                </h4>

                <p className="text-[11px] text-[#6F7D75] mt-1 line-clamp-2">
                  {route.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-stone-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6F7D75]">Direct Freight:</span>
                  <span className="font-bold text-[#17201C]">₹{route.transportCost}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6F7D75]">Produce Damage:</span>
                  <span className={`font-bold ${route.spoilageRiskPercent > 5 ? 'text-amber-700' : 'text-[#18A558]'}`}>
                    {route.spoilageRiskPercent}% (₹{route.spoilageLossValue})
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-dashed border-stone-200">
                  <span className="font-bold text-[#0B3D2E]">Net Landed Cost:</span>
                  <span className="font-black text-sm text-[#0B3D2E]">
                    ₹{route.totalLandedCost}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Best Route Economic Justification Banner */}
      {activeRoute && (
        <div className="bg-gradient-to-r from-emerald-50 via-[#F7F8F2] to-emerald-50 p-4 rounded-2xl border border-[#18A558]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#18A558] text-white flex items-center justify-center font-black text-sm shrink-0">
              💡
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#0B3D2E] block">
                {activeRoute.isRecommended ? 'AI Best Route Analysis' : 'Route Trade-Off Evaluation'}
              </span>
              <p className="text-xs text-[#17201C] font-semibold mt-0.5">
                {activeRoute.economicAdvantage}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCostBreakdown(!showCostBreakdown)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0B3D2E] hover:underline self-end sm:self-center"
          >
            <span>{showCostBreakdown ? 'Hide Cost Breakdown' : 'View Itemized Cost'}</span>
            {showCostBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Itemized Cost Breakdown Accordion */}
      {showCostBreakdown && activeRoute && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#18A558]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#17201C]">
                Itemized Cost & Spoilage Audit: {activeRoute.name}
              </h4>
            </div>
            <span className="text-xs font-bold text-[#0B3D2E] bg-[#18A558]/10 px-2.5 py-0.5 rounded-full">
              Distance: {activeRoute.distanceKm} km
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="bg-[#F7F8F2] p-3 rounded-xl border border-stone-200">
              <div className="flex items-center gap-1 text-[#6F7D75] mb-1">
                <Fuel className="w-3.5 h-3.5 text-stone-600" />
                <span>Fuel / Energy</span>
              </div>
              <div className="font-black text-sm text-[#17201C]">₹{activeRoute.fuelCost}</div>
              <div className="text-[10px] text-[#6F7D75] mt-0.5">{activeRoute.vehicleUsed}</div>
            </div>

            <div className="bg-[#F7F8F2] p-3 rounded-xl border border-stone-200">
              <div className="flex items-center gap-1 text-[#6F7D75] mb-1">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>Highway Tolls</span>
              </div>
              <div className="font-black text-sm text-[#17201C]">₹{activeRoute.tollCost}</div>
              <div className="text-[10px] text-[#6F7D75] mt-0.5">FASTag Automated</div>
            </div>

            <div className="bg-[#F7F8F2] p-3 rounded-xl border border-stone-200">
              <div className="flex items-center gap-1 text-[#6F7D75] mb-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Driver & Handling</span>
              </div>
              <div className="font-black text-sm text-[#17201C]">₹{activeRoute.driverWages}</div>
              <div className="text-[10px] text-[#6F7D75] mt-0.5">Trip Time: {activeRoute.eta}</div>
            </div>

            <div className="bg-[#F7F8F2] p-3 rounded-xl border border-stone-200">
              <div className="flex items-center gap-1 text-[#6F7D75] mb-1">
                <Snowflake className="w-3.5 h-3.5 text-sky-600" />
                <span>Pre-Cooling Staging</span>
              </div>
              <div className="font-black text-sm text-[#17201C]">
                ₹{activeRoute.additionalFee || 0}
              </div>
              <div className="text-[10px] text-[#6F7D75] mt-0.5">
                {activeRoute.additionalFee ? '1-Hour Solar Hub' : 'None'}
              </div>
            </div>

            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
              <div className="flex items-center gap-1 text-amber-900 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Vibration Damage</span>
              </div>
              <div className="font-black text-sm text-amber-900">₹{activeRoute.spoilageLossValue}</div>
              <div className="text-[10px] text-amber-800 font-semibold mt-0.5">
                {activeRoute.spoilageRiskPercent}% crop loss
              </div>
            </div>

            <div className="bg-[#0B3D2E] p-3 rounded-xl text-white">
              <div className="text-[10px] text-[#A8D94C] uppercase tracking-wider font-bold mb-1">
                Total Landed Cost
              </div>
              <div className="font-black text-base text-white">₹{activeRoute.totalLandedCost}</div>
              <div className="text-[10px] text-stone-300 mt-0.5">Freight + Spoilage</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Map Canvas: If Google Maps API Key provided, render Google Map; otherwise render interactive high-resolution SVG Map with telemetry */}
      <div className="relative w-full h-[400px] sm:h-[460px] bg-[#eef2e6] rounded-3xl overflow-hidden border border-stone-200 shadow-lg">
        {apiKey ? (
          <APIProvider
            apiKey={apiKey}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            <Map
              style={{ width: '100%', height: '100%' }}
              defaultCenter={mapCenter}
              defaultZoom={9}
              mapId="DEMO_MAP_ID"
              disableDefaultUI={false}
            >
              {activeRoute.waypoints.map((wp, idx) => (
                <AdvancedMarker
                  key={idx}
                  position={{ lat: wp.lat, lng: wp.lng }}
                  onClick={() => setActiveWaypointPopup(activeWaypointPopup === idx ? null : idx)}
                >
                  <Pin
                    background={
                      wp.type === 'farm'
                        ? '#0B3D2E'
                        : wp.type === 'buyer'
                        ? '#18A558'
                        : wp.type === 'cold_hub'
                        ? '#0284c7'
                        : '#F4A62A'
                    }
                    glyphColor="#FFFFFF"
                    borderColor="#FFFFFF"
                  />
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        ) : (
          /* High-Fidelity Interactive Agro Map Canvas */
          <div className="relative w-full h-full bg-[#f3f6ec] p-4 flex flex-col justify-between overflow-hidden select-none">
            {/* Topographic Background Contour Grid */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#18A558_1.2px,transparent_1.2px)] [background-size:24px_24px]" />

            {/* SVG Roads & Waypoints Layer */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 900 460"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Mountainous Elevation contours */}
              <path
                d="M 50,80 Q 250,30 450,110 T 850,70"
                stroke="#6F7D75"
                strokeWidth="1.5"
                strokeOpacity="0.18"
                fill="none"
              />
              <path
                d="M 50,380 Q 300,320 550,400 T 880,330"
                stroke="#6F7D75"
                strokeWidth="1.5"
                strokeOpacity="0.18"
                fill="none"
              />

              {/* Alternate Road Network (Kasara Ghats) */}
              <path
                d="M 120,320 C 240,380 400,200 780,180"
                stroke="#F4A62A"
                strokeWidth={selectedRouteId === 'scenic-ghats-toll-free' ? 6 : 3}
                strokeDasharray={selectedRouteId === 'scenic-ghats-toll-free' ? 'none' : '6 6'}
                strokeOpacity={selectedRouteId === 'scenic-ghats-toll-free' ? 0.9 : 0.35}
                strokeLinecap="round"
              />

              {/* Cold Storage Loop */}
              <path
                d="M 120,320 C 300,160 520,120 780,180"
                stroke="#0284c7"
                strokeWidth={selectedRouteId === 'cold-hub-link' ? 6 : 3}
                strokeDasharray={selectedRouteId === 'cold-hub-link' ? 'none' : '6 6'}
                strokeOpacity={selectedRouteId === 'cold-hub-link' ? 0.9 : 0.35}
                strokeLinecap="round"
              />

              {/* Primary Expressway (NH-60 Agro Corridor) */}
              <path
                d="M 120,320 C 300,270 540,290 780,180"
                stroke="#A8D94C"
                strokeWidth={selectedRouteId === 'nh-express-corridor' ? 14 : 6}
                strokeOpacity={0.4}
                strokeLinecap="round"
              />
              <path
                d="M 120,320 C 300,270 540,290 780,180"
                stroke="#18A558"
                strokeWidth={selectedRouteId === 'nh-express-corridor' ? 6 : 3}
                strokeOpacity={selectedRouteId === 'nh-express-corridor' ? 1 : 0.4}
                strokeLinecap="round"
              />

              {/* Origin Point: Farm Gate */}
              <g
                transform="translate(120, 320)"
                className="cursor-pointer"
                onClick={() => setActiveWaypointPopup(0)}
              >
                <circle r="22" fill="#0B3D2E" opacity="0.15" />
                <circle r="14" fill="#0B3D2E" stroke="#FFFFFF" strokeWidth="3" />
                <circle r="5" fill="#A8D94C" />
                <rect x="-85" y="20" width="170" height="28" rx="8" fill="#FFFFFF" stroke="#0B3D2E" strokeWidth="1.5" />
                <text y="38" fill="#0B3D2E" fontSize="11" fontWeight="bold" textAnchor="middle">
                  🌱 {origin.split(',')[0]}
                </text>
              </g>

              {/* Mid Waypoint: Highway Toll Plaza */}
              <g
                transform="translate(440, 280)"
                className="cursor-pointer"
                onClick={() => setActiveWaypointPopup(1)}
              >
                <circle r="10" fill="#FFFFFF" stroke="#18A558" strokeWidth="2.5" />
                <circle r="4" fill="#18A558" />
                <rect x="-95" y="-34" width="190" height="22" rx="6" fill="#FFFFFF" stroke="#18A558" strokeWidth="1" />
                <text y="-20" fill="#0B3D2E" fontSize="10" fontWeight="bold" textAnchor="middle">
                  NH-60 Expressway (₹280 Toll)
                </text>
              </g>

              {/* Cold Hub Waypoint */}
              <g
                transform="translate(380, 150)"
                className="cursor-pointer"
                onClick={() => setActiveWaypointPopup(2)}
              >
                <circle r="10" fill="#FFFFFF" stroke="#0284c7" strokeWidth="2.5" />
                <circle r="4" fill="#0284c7" />
                <rect x="-90" y="-32" width="180" height="22" rx="6" fill="#FFFFFF" stroke="#0284c7" strokeWidth="1" />
                <text y="-18" fill="#0284c7" fontSize="10" fontWeight="bold" textAnchor="middle">
                  ❄️ Igatpuri Solar Pre-Cool Hub
                </text>
              </g>

              {/* Destination Point: Buyer Receiving Dock */}
              <g
                transform="translate(780, 180)"
                className="cursor-pointer"
                onClick={() => setActiveWaypointPopup(3)}
              >
                <circle r="22" fill="#18A558" opacity="0.2" />
                <circle r="14" fill="#18A558" stroke="#FFFFFF" strokeWidth="3" />
                <circle r="5" fill="#FFFFFF" />
                <rect x="-95" y="-45" width="190" height="28" rx="8" fill="#FFFFFF" stroke="#18A558" strokeWidth="1.5" />
                <text y="-27" fill="#17201C" fontSize="11" fontWeight="bold" textAnchor="middle">
                  🏢 {destination.split(',')[0]}
                </text>
              </g>
            </svg>

            {/* Animated GPS Truck on the Vector Map */}
            <div
              className="absolute transition-all duration-300 pointer-events-none z-20"
              style={{
                left: `${14 + progress * 0.72}%`,
                top: `${
                  selectedRouteId === 'cold-hub-link'
                    ? 70 - Math.sin((progress / 100) * Math.PI) * 35
                    : selectedRouteId === 'scenic-ghats-toll-free'
                    ? 70 - Math.sin((progress / 100) * Math.PI) * 15
                    : 70 - Math.sin((progress / 100) * Math.PI) * 26
                }%`,
              }}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="bg-[#0B3D2E] text-white px-3 py-1 rounded-full text-[11px] font-black shadow-lg flex items-center gap-1.5 border-2 border-white">
                  <Truck className="w-3.5 h-3.5 text-[#A8D94C]" />
                  <span>{activeRoute.vehicleUsed} • {progress}%</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white text-[#0B3D2E] flex items-center justify-center shadow-xl mt-1.5 border-2 border-[#18A558] ring-4 ring-[#18A558]/20">
                  <Truck className="w-5 h-5 text-[#18A558]" />
                </div>
              </div>
            </div>

            {/* Map Controls Floating Header */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-stone-200 text-xs font-bold text-[#17201C] flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#18A558] animate-ping" />
                Live Satellite & Vibration Telemetry
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100 shadow-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {isSimulating ? 'Pause GPS' : 'Resume GPS'}
                </button>
              </div>
            </div>

            {/* Bottom Real-time Telemetry Bar */}
            <div className="relative z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-stone-200 shadow-lg flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-[#18A558]" />
                  <span className="text-[#6F7D75]">
                    Crate Temp: <strong className="text-[#17201C] font-bold">22.4°C</strong> (Safe 18-24°C)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-sky-600" />
                  <span className="text-[#6F7D75]">
                    Humidity: <strong className="text-[#17201C] font-bold">78% RH</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#18A558]" />
                  <span className="text-[#6F7D75]">
                    Road Shock: <strong className="text-[#0B3D2E] font-bold">{activeRoute.vibrationScore}</strong>
                  </span>
                </div>
              </div>

              <div className="text-right font-bold text-[#0B3D2E]">
                ETA: {activeRoute.eta} remaining
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Driver & Buyer Quick Call & Escrow Bar */}
      <div className="bg-[#F7F8F2] p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B3D2E] text-white flex items-center justify-center font-bold text-sm">
            🚚
          </div>
          <div>
            <span className="font-bold text-[#17201C] block text-sm">Transporter: Santosh Yadav ({activeRoute.vehicleUsed})</span>
            <span className="text-[#6F7D75] block">Vehicle: MH-15-EG-4491 • FASTag Verified • Zero Distress Warranty</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-300 font-bold text-stone-800 hover:bg-stone-50 shadow-2xs"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#18A558]" />
            Call Driver
          </a>

          <a
            href="tel:+919822334455"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0B3D2E] text-white font-bold hover:bg-[#18A558] shadow-2xs"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#A8D94C]" />
            Call Receiving Gate
          </a>
        </div>
      </div>

      {shareToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-[#0B3D2E] rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#18A558]" />
          WhatsApp dispatch pass link generated and opened!
        </div>
      )}
    </div>
  );
};

// Client-side fallback route computation when offline or during initial render
function computeFallbackRoutes(params: any): RouteOption[] {
  const {
    origin = 'Niphad Farm Gate, Nashik',
    destination = 'FreshMart Central DC, Mumbai',
    batchWeightKg = 850,
    cropValuePerKg = 34,
    vehicleType = 'mini_truck',
  } = params;

  const vehicleRates: Record<string, { rate: number; label: string }> = {
    mini_truck: { rate: 6.8, label: 'Tata Ace / 1.5T Pickup' },
    reefer_van: { rate: 11.5, label: 'Chilled Reefer Van' },
    electric_van: { rate: 3.4, label: 'EV Cargo Van' },
    heavy_lorry: { rate: 16.0, label: '10-Ton Heavy Crate Truck' },
  };

  const v = vehicleRates[vehicleType] || vehicleRates.mini_truck;

  return [
    {
      id: 'nh-express-corridor',
      name: 'NH-60 Agro Expressway Corridor',
      nameVernacular: 'ರಾಷ್ಟ್ರೀಯ ಹೆದ್ದಾರಿ ೬೦ (ಅತಿ ಕಡಿಮೆ ನಷ್ಟ)',
      distanceKm: 185,
      eta: '3h 45m',
      durationMinutes: 225,
      transportCost: Math.round(185 * v.rate + 450 + 280),
      fuelCost: Math.round(185 * v.rate),
      driverWages: 450,
      tollCost: 280,
      spoilageRiskPercent: 1.2,
      spoilageLossValue: Math.round(batchWeightKg * 0.012 * cropValuePerKg),
      totalLandedCost: Math.round(185 * v.rate + 450 + 280 + batchWeightKg * 0.012 * cropValuePerKg),
      vehicleUsed: v.label,
      vibrationScore: 'Low Vibration (< 0.18g)',
      roadQuality: 'Smooth Expressway',
      isRecommended: true,
      economicAdvantage: '🏆 Best Overall Route: Saves ₹1,840 in net landed costs & produce bruising compared to alternate paths.',
      color: '#18A558',
      description: 'Paved 4-lane expressway with steady 60km/h velocity and minimal shock on crates.',
      waypoints: [
        { lat: 20.0063, lng: 73.7900, title: origin, type: 'farm', info: 'Harvest Loading & Certified Weight Verification' },
        { lat: 19.8970, lng: 73.6540, title: 'Sinnar Highway Toll Plaza', type: 'highway', info: 'FASTag Automated Produce Clearance (₹95)' },
        { lat: 19.6980, lng: 73.5580, title: 'Igatpuri Agro Expressway Tunnel', type: 'highway', info: 'Paved Surface (Vibration < 0.18g)' },
        { lat: 19.3919, lng: 73.0180, title: 'Kalyan Ingress Bypass', type: 'highway', info: 'Off-peak freight green lane' },
        { lat: 19.1456, lng: 72.9360, title: destination, type: 'buyer', info: 'Direct Receiving Dock with Escrow Settlement' },
      ],
    },
    {
      id: 'cold-hub-link',
      name: 'Igatpuri Solar Cold-Chain Interceptor',
      nameVernacular: 'ಶೀತಲೀಕರಣ ಸೌಲಭ್ಯ ಮಾರ್ಗ',
      distanceKm: 198,
      eta: '5h 15m',
      durationMinutes: 315,
      transportCost: Math.round(198 * v.rate + 630 + 280 + 250),
      fuelCost: Math.round(198 * v.rate),
      driverWages: 630,
      tollCost: 280,
      additionalFee: 250,
      spoilageRiskPercent: 0.4,
      spoilageLossValue: Math.round(batchWeightKg * 0.004 * cropValuePerKg),
      totalLandedCost: Math.round(198 * v.rate + 630 + 280 + 250 + batchWeightKg * 0.004 * cropValuePerKg),
      vehicleUsed: v.label,
      vibrationScore: 'Ultra-Low (< 0.15g)',
      roadQuality: 'Smooth Expressway',
      isRecommended: false,
      economicAdvantage: '❄️ Cold Pre-Cooling adds +36h shelf life and preserves Grade-A premium pricing at buyer dock.',
      color: '#0284c7',
      description: 'Includes 1-hour pre-cooling staging stop at FPO solar cold room to reset pulp temperature to 12°C.',
      waypoints: [
        { lat: 20.0063, lng: 73.7900, title: origin, type: 'farm', info: 'Farm Dispatch Gate' },
        { lat: 19.6980, lng: 73.5580, title: 'Igatpuri FPO Solar Pre-Cooling Hub', type: 'cold_hub', info: '1-Hour Core Pulp Chilling to 12°C (+36h Shelf Life)' },
        { lat: 19.2183, lng: 72.9781, title: 'Thane Green Corridor Link', type: 'highway', info: 'Dedicated agro fast-track' },
        { lat: 19.1456, lng: 72.9360, title: destination, type: 'buyer', info: 'Premium Intake Dock (Grade-A Zero Penalty)' },
      ],
    },
    {
      id: 'scenic-ghats-toll-free',
      name: 'Old Kasara Ghats Highway (Toll-Free Alternate)',
      nameVernacular: 'ಹಳೆಯ ಘಾಟ್ ರಸ್ತೆ (ಹೆಚ್ಚು ಹಾನಿ)',
      distanceKm: 165,
      eta: '4h 50m',
      durationMinutes: 290,
      transportCost: Math.round(165 * v.rate + 580),
      fuelCost: Math.round(165 * v.rate),
      driverWages: 580,
      tollCost: 0,
      spoilageRiskPercent: 11.8,
      spoilageLossValue: Math.round(batchWeightKg * 0.118 * cropValuePerKg),
      totalLandedCost: Math.round(165 * v.rate + 580 + batchWeightKg * 0.118 * cropValuePerKg),
      vehicleUsed: v.label,
      vibrationScore: 'High Vibration (> 0.85g)',
      roadQuality: 'Bumpy Rural Road',
      isRecommended: false,
      economicAdvantage: '⚠️ Hidden Loss Alert: Saves ₹280 in tolls, but causes ₹3,410 in bruised and soft produce markdown.',
      color: '#F4A62A',
      description: 'Shorter distance but steep hairpin bends & road rumble strips cause 11%+ produce bruising and softness markdown.',
      waypoints: [
        { lat: 20.0063, lng: 73.7900, title: origin, type: 'farm', info: 'Farm Loading' },
        { lat: 19.7120, lng: 73.4900, title: 'Kasara Ghat Hairpin Bends', type: 'highway', info: 'Severe Vibration Alert (0.92g Shock Recorded)' },
        { lat: 19.3500, lng: 73.1200, title: 'Bhiwandi Truck Congestion Bottleneck', type: 'highway', info: '50-minute idling delay in ambient heat' },
        { lat: 19.1456, lng: 72.9360, title: destination, type: 'buyer', info: 'Receiving Dock (Potential Dock Markdown Risk)' },
      ],
    },
  ];
}
