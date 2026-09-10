import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowUpRight, Factory, Snowflake, HeartHandshake } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../animations/variants';
import { Card3D, Card3DLayer } from '../common/Card3D';

export const FiveActions: React.FC = () => {
  const { t } = useTranslation();

  const actions = [
    {
      id: 'sell',
      title: t('fiveActions.sell_title'),
      desc: t('fiveActions.sell_desc'),
      icon: ShoppingBag,
      tag: 'Peak Freshness Premium',
      variant: 'amber' as const,
      iconBg: 'bg-emerald-50 text-[#0B3D2E] border-emerald-200'
    },
    {
      id: 'reroute',
      title: t('fiveActions.reroute_title'),
      desc: t('fiveActions.reroute_desc'),
      icon: ArrowUpRight,
      tag: 'Urban Arbitrage',
      variant: 'default' as const,
      iconBg: 'bg-sky-50 text-sky-800 border-sky-200'
    },
    {
      id: 'process',
      title: t('fiveActions.process_title'),
      desc: t('fiveActions.process_desc'),
      icon: Factory,
      tag: 'Guaranteed Offtake',
      variant: 'default' as const,
      iconBg: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      id: 'store',
      title: t('fiveActions.store_title'),
      desc: t('fiveActions.store_desc'),
      icon: Snowflake,
      tag: 'Supply Buffer',
      variant: 'default' as const,
      iconBg: 'bg-teal-50 text-teal-800 border-teal-200'
    },
    {
      id: 'donate',
      title: t('fiveActions.donate_title'),
      desc: t('fiveActions.donate_desc'),
      icon: HeartHandshake,
      tag: '100% Zero Food Waste',
      variant: 'default' as const,
      iconBg: 'bg-rose-50 text-rose-800 border-rose-200'
    }
  ];

  return (
    <section id="five-actions" className="py-24 bg-slate-50/50 border-t border-slate-200/90 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="text-center max-w-3xl mx-auto space-y-4 mb-16"
        >
          <span className="text-xs font-bold text-[#0B3D2E] tracking-wider uppercase bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200 shadow-2xs inline-block">
            Decision Intelligence Matrix
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {t('fiveActions.title')}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {t('fiveActions.subtitle')}
          </p>
        </motion.div>

        {/* 5 Actions 3D Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {actions.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                variants={fadeUp}
                className={index === 0 ? 'lg:col-span-2 h-full' : 'h-full'}
              >
                <Card3D
                  id={`five-actions-${item.id}`}
                  depth={13}
                  glareEffect={true}
                  scaleOnHover={1.025}
                  variant={item.variant}
                  className="p-6 sm:p-7 h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Card3DLayer zDepth={30}>
                        <div className={`p-3.5 rounded-2xl border shadow-xs ${item.iconBg}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </Card3DLayer>
                      <Card3DLayer zDepth={25}>
                        <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white/90 text-slate-700 border border-slate-200/90 shadow-2xs">
                          {item.tag}
                        </span>
                      </Card3DLayer>
                    </div>

                    <div className="space-y-2">
                      <Card3DLayer zDepth={25}>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{item.title}</h3>
                      </Card3DLayer>
                      <Card3DLayer zDepth={15}>
                        <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                      </Card3DLayer>
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
