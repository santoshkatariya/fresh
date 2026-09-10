import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Radio, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TickerItem {
  id: string;
  mandi: string;
  crop: string;
  price: number;
  change: number;
  arrivalQtl: number;
}

const INITIAL_TICKERS: TickerItem[] = [
  { id: '1', mandi: 'Pimpalgaon APMC', crop: 'Tomatoes (Grade-A)', price: 22.0, change: 2.8, arrivalQtl: 3850 },
  { id: '2', mandi: 'Kolar Agro Mandi', crop: 'Tomatoes (Hybrid)', price: 24.5, change: -1.2, arrivalQtl: 6200 },
  { id: '3', mandi: 'Lasalgaon APMC', crop: 'Nashik Red Onions', price: 18.5, change: -3.2, arrivalQtl: 14200 },
  { id: '4', mandi: 'Vashi APMC Mumbai', crop: 'Capsicum (Indra)', price: 42.0, change: 6.0, arrivalQtl: 950 },
  { id: '5', mandi: 'Sangli Mandi', crop: 'Grapes (Thompson)', price: 48.0, change: 3.2, arrivalQtl: 3600 },
  { id: '6', mandi: 'Solapur Mandi', crop: 'Pomegranate (Bhagwa)', price: 88.0, change: 2.4, arrivalQtl: 2100 },
  { id: '7', mandi: 'Azadpur Delhi', crop: 'Potatoes (Jyoti)', price: 18.0, change: 1.5, arrivalQtl: 9500 },
  { id: '8', mandi: 'Gultekdi Pune', crop: 'Tomatoes (Desi)', price: 23.5, change: 1.1, arrivalQtl: 2900 },
];

export const MandiTickerBar: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_TICKERS);
  const [lastTickTime, setLastTickTime] = useState<string>('Live');

  // Simulated live micro-fluctuations every 12 seconds for realism
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prev) =>
        prev.map((item) => {
          const delta = (Math.random() * 0.6 - 0.3);
          const newPrice = Number(Math.max(10, item.price + delta).toFixed(1));
          const newChange = Number((item.change + (delta > 0 ? 0.2 : -0.2)).toFixed(1));
          return {
            ...item,
            price: newPrice,
            change: newChange,
          };
        })
      );
      setLastTickTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0B3D2E] text-white border-y border-emerald-800/60 overflow-hidden shadow-inner py-2 px-4 flex items-center justify-between gap-4 select-none">
      {/* Live Badge */}
      <div className="flex items-center gap-2 shrink-0 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
        <span className="w-2 h-2 rounded-full bg-[#18A558] animate-ping" />
        <span className="text-[11px] font-black tracking-wider uppercase text-emerald-300 flex items-center gap-1">
          <Radio className="w-3 h-3 text-[#18A558]" />
          {lang === 'kn' ? 'ಲೈವ್ ಮಂಡಿ ದರಗಳು' : lang === 'hi' ? 'लाइव मंडी भाव' : 'Live APMC Ticker'}
        </span>
      </div>

      {/* Marquee Ticker Stream */}
      <div className="overflow-x-auto no-scrollbar flex items-center gap-6 whitespace-nowrap text-xs font-mono">
        {tickers.map((t) => (
          <div key={t.id} className="flex items-center gap-2 bg-emerald-900/40 px-3 py-1 rounded-xl border border-emerald-700/40 shrink-0">
            <span className="font-bold text-stone-200">{t.mandi}:</span>
            <span className="text-emerald-200">{t.crop}</span>
            <span className="font-black text-white">₹{t.price.toFixed(1)}/kg</span>
            <span
              className={`flex items-center gap-0.5 font-bold text-[10px] px-1.5 py-0.5 rounded ${
                t.change >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {t.change >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {t.change >= 0 ? `+${t.change}%` : `${t.change}%`}
            </span>
          </div>
        ))}
      </div>

      {/* Agmarknet / Sync Pill */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0 text-[10px] text-emerald-300/80 font-mono">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span>Agmarknet Synced</span>
      </div>
    </div>
  );
};
