import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Radio, Database, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

interface AnalyzingOverlayProps {
  isAnalyzing: boolean;
  targetWord: string;
}

export const AnalyzingOverlay: React.FC<AnalyzingOverlayProps> = ({
  isAnalyzing,
  targetWord,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { label: 'GitHub・Reddit・海外フォーラムの初出・水源データをクローリング中...', icon: Database },
    { label: '国内メディア（Zenn・note・X・日経）の時系列言及頻度を解析中...', icon: Radio },
    { label: 'イノベーター理論ベルカーブ上の普及座標とキャズム距離を計算中...', icon: Cpu },
  ];

  useEffect(() => {
    if (!isAnalyzing) {
      setStepIndex(0);
      return;
    }

    const timer1 = setTimeout(() => setStepIndex(1), 600);
    const timer2 = setTimeout(() => setStepIndex(2), 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isAnalyzing]);

  if (!isAnalyzing) return null;

  const CurrentIcon = steps[stepIndex].icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative w-full max-w-md bg-[#0d1117] border border-indigo-500/40 rounded-2xl shadow-2xl p-6 text-center z-10 overflow-hidden"
        >
          {/* Glowing background aura */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Radar icon with pulse ring */}
          <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
            <div className="relative w-14 h-14 rounded-full bg-slate-900 border border-indigo-500/60 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/30">
              <CurrentIcon className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold mb-2">
            AI Lexical Intelligence
          </div>

          <h3 className="text-xl font-bold text-white mb-1">
            「{targetWord}」を解析中...
          </h3>

          <p className="text-xs text-slate-400 min-h-[38px] flex items-center justify-center px-4 leading-relaxed transition-all duration-300">
            {steps[stepIndex].label}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 h-full rounded-full"
              initial={{ width: '15%' }}
              animate={{ width: stepIndex === 0 ? '35%' : stepIndex === 1 ? '70%' : '100%' }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-2">
            <span>スキャン進捗</span>
            <span>{stepIndex === 0 ? '35%' : stepIndex === 1 ? '70%' : '98%'}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
