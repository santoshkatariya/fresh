import React from 'react';
import { Card3D, Card3DLayer } from '../common/Card3D';
import { CountUp } from '../common/CountUp';

export interface MetricCardProps {
  label?: string;
  title?: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: React.ReactNode;
  trend?:
    | string
    | {
        value: string;
        isPositive?: boolean;
        label?: string;
      };
  trendLabel?: string;
  highlightColor?: 'emerald' | 'amber' | 'blue' | 'rose' | 'lime';
  borderVariant?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
  subtitle?: string;
  id?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  icon,
  trend,
  trendLabel,
  highlightColor = 'lime',
  borderVariant = 'default',
  subtitle,
  id
}) => {
  const displayLabel = title || label || '';

  const colorMap = {
    emerald: {
      iconBg: 'bg-emerald-50 text-[#0B3D2E] border border-emerald-200 shadow-xs',
      badge: 'text-[#0B3D2E] bg-emerald-50 border border-emerald-200'
    },
    lime: {
      iconBg: 'bg-emerald-100/70 text-[#18A558] border border-emerald-200 shadow-xs',
      badge: 'text-[#18A558] bg-emerald-100/70 border border-emerald-200'
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs',
      badge: 'text-amber-800 bg-amber-50 border border-amber-200'
    },
    blue: {
      iconBg: 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs',
      badge: 'text-sky-800 bg-sky-50 border border-sky-200'
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-800 border border-rose-200 shadow-xs',
      badge: 'text-rose-800 bg-rose-50 border border-rose-200'
    }
  };

  const currentTheme = colorMap[highlightColor];

  const trendText = typeof trend === 'string' ? trend : trend?.value;
  const trendSubtext = typeof trend === 'string' ? trendLabel : trend?.label || trendLabel;

  return (
    <Card3D
      id={id}
      depth={11}
      glareEffect={true}
      scaleOnHover={1.025}
      className="p-5 sm:p-6 bg-white border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-lg flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <Card3DLayer zDepth={15}>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{displayLabel}</p>
          </Card3DLayer>
          <Card3DLayer zDepth={30}>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {typeof value === 'number' ? (
                <CountUp end={value} prefix={prefix} suffix={suffix} decimals={decimals} />
              ) : (
                <span>
                  {prefix}
                  {value}
                  {suffix}
                </span>
              )}
            </div>
          </Card3DLayer>
          {subtitle && (
            <Card3DLayer zDepth={15}>
              <p className="text-xs text-slate-600 font-medium">{subtitle}</p>
            </Card3DLayer>
          )}
        </div>

        <Card3DLayer zDepth={25}>
          <div className={`p-3 rounded-2xl ${currentTheme.iconBg} shrink-0`}>
            {icon}
          </div>
        </Card3DLayer>
      </div>

      {trendText && (
        <Card3DLayer zDepth={20} className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-medium">
          <span className={`px-2.5 py-0.5 rounded-full ${currentTheme.badge} font-bold text-[11px]`}>
            {trendText}
          </span>
          {trendSubtext && <span className="text-slate-500">{trendSubtext}</span>}
        </Card3DLayer>
      )}
    </Card3D>
  );
};
