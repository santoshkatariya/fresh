import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WhatsAppAssistantView } from '../components/farmer/WhatsAppAssistantView';
import { ArrowLeft, Sprout } from 'lucide-react';

export const WhatsAppPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8faf7] text-slate-900 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/farmer/dashboard')}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Farmer Portal</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                FR
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900">
                FreshRoute.2 WhatsApp Kisan AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/farmer/dashboard')}
              className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 transition-all"
            >
              Back to Full Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-4 sm:py-6">
        <WhatsAppAssistantView />
      </main>
    </div>
  );
};
