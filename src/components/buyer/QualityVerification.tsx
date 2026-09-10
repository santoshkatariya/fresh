import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, CheckCircle2, AlertTriangle, ScanLine, Scale, Award, ArrowRight, DollarSign } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { CountUp } from '../common/CountUp';

export const QualityVerification: React.FC = () => {
  const { t } = useTranslation();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [dockWeightKg, setDockWeightKg] = useState(792); // 8kg transit moisture loss (1%)
  const [arrivalQuality, setArrivalQuality] = useState(81);

  const handleRunDockVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsAccepted(true);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="dock-quality-verification">
      <div className="space-y-1 pb-2 border-b border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-700" />
          Receiving Dock Quality Verification
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Automated weighbridge discrepancy check & optical grading prior to escrow disbursement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Shipment Inspect (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Inbound Vehicle Inspection
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                Dock Bay #04
              </span>
            </div>

            <div className="relative h-64 rounded-2xl overflow-hidden bg-slate-900 border border-gray-200 shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80"
                alt="Receiving crates of tomatoes"
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-4 text-white">
                <div className="flex justify-between items-center text-xs">
                  <span className="bg-black/60 px-2 py-1 rounded">Camera 02 • High-Res RGB</span>
                  <span className="text-[#a8d43a] font-bold">Electronic Seal Intact</span>
                </div>

                <div className="bg-black/70 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-gray-300 block text-[10px]">Farm Gate Dispatched</span>
                    <strong>800 KG @ 82/100 Q</strong>
                  </div>
                  <div>
                    <span className="text-gray-300 block text-[10px]">Dock Digital Scale</span>
                    <strong className="text-[#a8d43a]">{dockWeightKg} KG (99.0%)</strong>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              loading={isVerifying}
              onClick={handleRunDockVerification}
              icon={<ScanLine className="w-4 h-4" />}
            >
              Trigger Dock Optical & Brix Scan
            </Button>
          </Card>
        </div>

        {/* Right Column: Verification Results & Escrow (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card borderVariant={isAccepted ? 'success' : 'default'} className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Dock Acceptance Audit
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  800 KG Tomatoes (Abhinav Hybrid)
                </h3>
              </div>

              {isAccepted && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 100% Passed
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-gray-400 block text-[10px] uppercase">Arrival Quality</span>
                <div className="text-xl font-bold text-emerald-700">
                  <CountUp end={arrivalQuality} suffix="/100" />
                </div>
                <span className="text-[10px] text-gray-500">Threshold: &gt;75/100</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-gray-400 block text-[10px] uppercase">Weight Tolerance</span>
                <div className="text-xl font-bold text-gray-900">
                  -1.0% <span className="text-xs font-normal text-gray-500">(Normal Moisture)</span>
                </div>
                <span className="text-[10px] text-emerald-600">Within ±3% SLA</span>
              </div>
            </div>

            {/* Smart Contract Escrow Release Status */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1b4d2f]">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-[#2d7a4a]" />
                  Automated Digital Escrow Settlement
                </span>
                <span>T+0 Release</span>
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Gross Invoice Amount:</span>
                  <strong className="text-gray-900">₹17,200.00</strong>
                </div>
                <div className="flex justify-between">
                  <span>Farmer Payout (Net):</span>
                  <strong className="text-[#1b4d2f]">₹15,652.00</strong>
                </div>
                <div className="flex justify-between">
                  <span>Carrier Freight Payout:</span>
                  <strong className="text-gray-900">₹476.00</strong>
                </div>
              </div>
            </div>

            {isAccepted ? (
              <div className="p-3 bg-emerald-100/70 text-emerald-950 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2d7a4a] shrink-0" />
                Escrow unlocked. Funds transferred directly to Farmer Ramesh Patil's bank account via IMPS/UPI.
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center">
                Click "Trigger Dock Optical & Brix Scan" above to verify crates and release smart contract escrow.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
