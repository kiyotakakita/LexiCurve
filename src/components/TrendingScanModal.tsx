import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Globe, 
  Radio, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  Compass, 
  TrendingUp,
  Search
} from 'lucide-react';

interface TrendingScanModalProps {
  isOpen: boolean;
}

export const TrendingScanModal: React.FC<TrendingScanModalProps> = ({ isOpen }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [detectedChips, setDetectedChips] = useState<string[]>([]);

  const scanningSources = [
    { name: 'X / Twitter', status: '走査完了' },
    { name: 'Hacker News', status: '走査完了' },
    { name: 'Reddit (r/technology, r/GenZ)', status: '走査完了' },
    { name: 'Zenn / note / Qiita', status: '走査完了' },
    { name: 'TikTok / YouTube Shorts', status: '解析中' },
  ];

  const steps = [
    {
      title: '世界のコミュニティやSNSを探索中...',
      desc: 'X・Reddit・Hacker Newsの急上昇キーワードおよび発話スパイクを検知中',
      icon: Globe,
      color: 'text-amber-400',
    },
    {
      title: '言及頻度と拡散速度の時系列クロス分析...',
      desc: 'テックコミュニティ・Z世代カルチャー・実務現場での言及急増シグナルを抽出',
      icon: Radio,
      color: 'text-rose-400',
    },
    {
      title: 'イノベーター理論ベルカーブへマッピング中...',
      desc: 'イノベーター／アーリーアダプター／キャズム境界の普及位置と源流ツリーを算出',
      icon: Cpu,
      color: 'text-indigo-400',
    },
    {
      title: '最新トレンドワードのプロット準備完了！',
      desc: '旬なバズワードをベルカーブ上へ一括展開中...',
      icon: Sparkles,
      color: 'text-emerald-400',
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      setDetectedChips([]);
      return;
    }

    const t1 = setTimeout(() => {
      setStepIndex(1);
      setDetectedChips(['Vibe Coding', 'AI Slop']);
    }, 600);

    const t2 = setTimeout(() => {
      setStepIndex(2);
      setDetectedChips(['Vibe Coding', 'AI Slop', 'ブレインロット (Brain Rot)', 'シャドウAI']);
    }, 1300);

    const t3 = setTimeout(() => {
      setStepIndex(3);
      setDetectedChips([
        'Vibe Coding', 
        'AI Slop', 
        'ブレインロット (Brain Rot)', 
        'シャドウAI',
        'タイムブロッキング 2.0',
        'コンテキストエンジニアリング',
        'エージェンティックAI'
      ]);
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = steps[stepIndex];
  const StepIcon = currentStep.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#0c1017] border border-amber-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 text-center z-10 overflow-hidden"
        >
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Glowing Radar Animation Circle */}
          <div className="relative w-20 h-20 mx-auto mb-5 flex items-center justify-center">
            {/* Outer radar pulse rings */}
            <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-ping" />
            <div className="absolute -inset-2 rounded-full border border-amber-400/20 animate-pulse" />
            
            {/* Center radar disk */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-slate-900 to-amber-950/60 border border-amber-500/60 flex items-center justify-center shadow-xl shadow-amber-500/25">
              <StepIcon className={`w-8 h-8 ${currentStep.color} animate-bounce transition-colors duration-300`} />
            </div>

            {/* Orbiting blip */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-md shadow-amber-400/80 -top-1 left-1/2 -translate-x-1/2" />
            </motion.div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold mb-3">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
            <span>AI Real-time Trend Radar Scanner</span>
          </div>

          {/* Heading */}
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 tracking-tight">
            {currentStep.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed min-h-[40px] flex items-center justify-center px-2">
            {currentStep.desc}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800/90 rounded-full h-2 overflow-hidden mb-5 border border-slate-700/60">
            <motion.div
              className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 h-full rounded-full"
              initial={{ width: '15%' }}
              animate={{ 
                width: stepIndex === 0 ? '28%' : stepIndex === 1 ? '58%' : stepIndex === 2 ? '85%' : '100%' 
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Detected Keywords Live Preview Area */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 text-left mb-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-1">
                <Search className="w-3 h-3 text-amber-400" />
                <span>検知された急上昇シグナル:</span>
              </span>
              <span className="text-amber-400 font-bold">{detectedChips.length} 件検出</span>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[36px]">
              {detectedChips.map((chip, idx) => (
                <motion.span
                  key={chip}
                  initial={{ opacity: 0, scale: 0.7, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm shadow-amber-500/10"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{chip}</span>
                </motion.span>
              ))}

              {detectedChips.length === 0 && (
                <span className="text-xs text-slate-500 italic py-1">
                  世界のプラットフォームから言語データをストリーミング中...
                </span>
              )}
            </div>
          </div>

          {/* Crawler Sources Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-3">
            {scanningSources.slice(0, 3).map((s) => (
              <div key={s.name} className="flex items-center gap-1 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="truncate">{s.name}</span>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-3 text-[10px] text-slate-500 text-center mt-1">
              ※ テクノロジー、ライフハック、働き方、カルチャーから旬なバズワードを自動抽出します
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
