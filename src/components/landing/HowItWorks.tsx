import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Sprout,
  ScanLine,
  LineChart,
  Truck,
  BrainCircuit,
  CheckCircle2
} from 'lucide-react';
import { fadeUp, staggerContainer } from '../../animations/variants';
import { Card3D, Card3DLayer } from '../common/Card3D';

export const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      num: '01',
      tag: t('howItWorks.step1_title'),
      desc: t('howItWorks.step1_desc'),
      icon: Sprout,
      color: 'bg-emerald-50 text-[#0B3D2E] border-emerald-200'
    },
    {
      num: '02',
      tag: t('howItWorks.step2_title'),
      desc: t('howItWorks.step2_desc'),
      icon: ScanLine,
      color: 'bg-emerald-100/70 text-[#18A558] border-emerald-300'
    },
    {
      num: '03',
      tag: t('howItWorks.step3_title'),
      desc: t('howItWorks.step3_desc'),
      icon: LineChart,
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      num: '04',
      tag: t('howItWorks.step4_title'),
      desc: t('howItWorks.step4_desc'),
      icon: Truck,
      color: 'bg-sky-50 text-sky-800 border-sky-200'
    },
    {
      num: '05',
      tag: t('howItWorks.step5_title'),
      desc: t('howItWorks.step5_desc'),
      icon: BrainCircuit,
      color: 'bg-teal-50 text-teal-800 border-teal-200'
    },
    {
      num: '06',
      tag: t('howItWorks.step6_title'),
      desc: t('howItWorks.step6_desc'),
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-[#0B3D2E] border-emerald-300'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#f8faf7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="text-center max-w-3xl mx-auto space-y-4 mb-16"
        >
          <span className="text-xs font-bold text-[#0B3D2E] tracking-wider uppercase bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200 shadow-2xs inline-block">
            Algorithmic Pipeline
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {t('howItWorks.title')}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {t('howItWorks.subtitle')}
          </p>
        </motion.div>

        {/* 6 Step 3D Interactive Process Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {steps.map(step => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                variants={fadeUp}
                className="h-full"
              >
                <Card3D
                  id={`how-it-works-step-${step.num}`}
                  depth={14}
                  glareEffect={true}
                  scaleOnHover={1.03}
                  className="p-6 h-full flex flex-col justify-between bg-white border border-slate-200/90 hover:border-emerald-300 shadow-sm hover:shadow-xl"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Card3DLayer zDepth={30}>
                        <div className={`p-3.5 rounded-2xl border shadow-xs ${step.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </Card3DLayer>
                      <Card3DLayer zDepth={20}>
                        <span className="text-3xl font-black text-slate-200 font-mono select-none">{step.num}</span>
                      </Card3DLayer>
                    </div>

                    <div className="space-y-2">
                      <Card3DLayer zDepth={25}>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                          {step.tag}
                        </h3>
                      </Card3DLayer>
                      <Card3DLayer zDepth={15}>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.desc}</p>
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
