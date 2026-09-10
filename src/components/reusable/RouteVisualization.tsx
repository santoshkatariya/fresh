import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Navigation,
  MapPin,
  Truck,
  Clock,
  Thermometer,
  Droplets,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../common/Card';

interface RouteVisualizationProps {
  origin?: string;
  destination?: string;
  distanceKm?: number;
  eta?: string;
  transportCost?: number;
  transitRiskPercent?: number;
  vehicleName?: string;
  temperatureC?: number;
  humidityPercent?: number;
}

export const RouteVisualization: React.FC<RouteVisualizationProps> = ({
  origin = 'Niphad Farm, Nashik',
  destination = 'FreshMart DC, Bhandup, Mumbai',
  distanceKm = 34,
  eta = '1h 15m',
  transportCost = 476,
  transitRiskPercent = 4,
  vehicleName = 'Mini Pickup (Tata Ace)',
  temperatureC = 22.4,
  humidityPercent = 78
}) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(45);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 95 ? 10 : prev + 1));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card id="smart-routes-telemetry" className="space-y-6 overflow-hidden bg-white border border-stone-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#18A558] animate-pulse" />
            <h3 className="text-base sm:text-lg font-black text-[#17201C] flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#18A558]" />
              {t('routes.title')}
            </h3>
          </div>
          <p className="text-xs text-[#6F7D75] mt-0.5">{t('routes.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#18A558]/10 text-[#0B3D2E] border border-[#18A558]/20">
            <span className="w-2 h-2 rounded-full bg-[#18A558] animate-ping" />
            Live GPS Transit Simulation
          </span>
        </div>
      </div>

      {/* Clean Light Map Visual SVG */}
      <div className="relative w-full h-64 sm:h-76 bg-[#F7F8F2] rounded-2xl overflow-hidden border border-stone-200 p-4">
        {/* Subtle Map Grid Pattern */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#18A558_1px,transparent_1px)] [background-size:20px_20px]" />
        
        {/* Topographic Contour Lines */}
        <svg className="w-full h-full" viewBox="0 0 700 300" fill="none" preserveAspectRatio="none">
          {/* Subtle contour lines */}
          <path
            d="M 0,100 C 150,60 300,140 500,80 C 600,50 680,110 700,90"
            stroke="#6F7D75"
            strokeWidth="1"
            strokeOpacity="0.15"
            fill="none"
          />
          <path
            d="M 0,220 C 180,180 320,260 520,200 C 620,170 660,230 700,210"
            stroke="#6F7D75"
            strokeWidth="1"
            strokeOpacity="0.15"
            fill="none"
          />

          {/* Secondary road network */}
          <path
            d="M 50,150 Q 200,80 350,160 T 650,140"
            stroke="#6F7D75"
            strokeWidth="3"
            strokeDasharray="4 4"
            strokeOpacity="0.25"
          />
          <path
            d="M 80,240 Q 250,200 450,220 T 640,200"
            stroke="#6F7D75"
            strokeWidth="3"
            strokeDasharray="6 6"
            strokeOpacity="0.25"
          />

          {/* Primary Optimized Corridor - Glow */}
          <path
            d="M 80,180 C 220,100 400,240 620,130"
            stroke="#A8D94C"
            strokeWidth="12"
            strokeLinecap="round"
            strokeOpacity="0.45"
          />
          {/* Primary Route Line - Fresh Green */}
          <path
            d="M 80,180 C 220,100 400,240 620,130"
            stroke="#18A558"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Origin Node: Farm */}
          <g>
            <circle cx="80" cy="180" r="16" fill="#0B3D2E" stroke="#FFFFFF" strokeWidth="3" />
            <circle cx="80" cy="180" r="7" fill="#A8D94C" />
            <rect x="25" y="206" width="110" height="24" rx="12" fill="#FFFFFF" stroke="#0B3D2E" strokeWidth="1.5" />
            <text x="80" y="222" fill="#0B3D2E" fontSize="11" fontWeight="800" textAnchor="middle">
              🌱 Farm Gate
            </text>
          </g>

          {/* Expressway Highway Badge */}
          <g>
            <rect x="240" y="142" width="200" height="22" rx="11" fill="#FFFFFF" stroke="#18A558" strokeWidth="1.5" />
            <text x="340" y="157" fill="#0B3D2E" fontSize="10" fontWeight="700" textAnchor="middle">
              NH-60 Corridor (Low Shock Transit)
            </text>
          </g>

          {/* Destination Node: Buyer */}
          <g>
            <circle cx="620" cy="130" r="16" fill="#0B3D2E" stroke="#FFFFFF" strokeWidth="3" />
            <circle cx="620" cy="130" r="7" fill="#18A558" />
            <rect x="560" y="92" width="120" height="24" rx="12" fill="#FFFFFF" stroke="#0B3D2E" strokeWidth="1.5" />
            <text x="620" y="108" fill="#0B3D2E" fontSize="11" fontWeight="800" textAnchor="middle">
              🏢 Buyer Dock
            </text>
          </g>
        </svg>

        {/* Live Truck on Path */}
        <div
          className="absolute transition-all duration-300 pointer-events-none"
          style={{
            left: `${8 + progress * 0.78}%`,
            top: `${50 - Math.sin((progress / 100) * Math.PI) * 18}%`
          }}
        >
          <div className="relative -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="bg-[#0B3D2E] text-white px-3 py-1 rounded-full text-[10px] font-black shadow-md flex items-center gap-1 border border-white">
              <Truck className="w-3 h-3 text-[#A8D94C]" />
              {vehicleName.split('(')[0]} • {progress}%
            </div>
            <div className="w-8 h-8 rounded-full bg-white text-[#0B3D2E] flex items-center justify-center shadow-lg mt-1 border-2 border-[#18A558]">
              <Truck className="w-4 h-4 text-[#18A558]" />
            </div>
          </div>
        </div>

        {/* Live Sensor Telemetry Badge Bar */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-stone-200 text-[#17201C] flex flex-wrap items-center gap-4 text-xs shadow-md">
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-[#18A558]" />
            <span className="text-[#6F7D75]">Temp: <strong className="text-[#17201C]">{temperatureC}°C</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-sky-600" />
            <span className="text-[#6F7D75]">Humidity: <strong className="text-[#17201C]">{humidityPercent}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#18A558]" />
            <span className="text-[#6F7D75]">Transit Risk: <strong className="text-[#0B3D2E]">{transitRiskPercent}% (Low)</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#F7F8F2] p-4 sm:p-5 rounded-2xl border border-stone-200">
        <div>
          <span className="text-[#6F7D75] block text-[11px] font-bold uppercase tracking-wider">{t('routes.origin')}</span>
          <span className="font-bold text-[#17201C] truncate block mt-1">{origin}</span>
        </div>
        <div>
          <span className="text-[#6F7D75] block text-[11px] font-bold uppercase tracking-wider">{t('routes.destination')}</span>
          <span className="font-bold text-[#17201C] truncate block mt-1">{destination}</span>
        </div>
        <div>
          <span className="text-[#6F7D75] block text-[11px] font-bold uppercase tracking-wider">Distance & ETA</span>
          <span className="font-black text-[#0B3D2E] block mt-1">
            {distanceKm} KM ({eta})
          </span>
        </div>
        <div>
          <span className="text-[#6F7D75] block text-[11px] font-bold uppercase tracking-wider">{t('routes.transportCost')}</span>
          <span className="font-black text-[#18A558] text-sm block mt-1">
            ₹{transportCost.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </Card>
  );
};

