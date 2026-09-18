import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Globe, 
  Cpu, 
  Sparkles, 
  Loader2
} from 'lucide-react';
import { getClientGeminiModel } from '../services/geminiClient';

interface TrendingScanModalProps {
  isOpen: boolean;
}

export const TrendingScanModal: React.FC<TrendingScanModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  const activeModel = getClientGeminiModel();

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
          className="relative w-full max-w-md bg-[#0c1017] border border-amber-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 text-center z-10 overflow-hidden"
        >
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Glowing Radar Animation Circle */}
          <div className="relative w-20 h-20 mx-auto mb-5 flex items-center justify-center">
            {/* Outer radar pulse rings */}
            <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-ping" />
            <div className="absolute -inset-2 rounded-full border border-amber-400/20 animate-pulse" />
            
            {/* Center radar disk */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-slate-900 to-amber-950/60 border border-amber-500/60 flex items-center justify-center shadow-xl shadow-amber-500/25">
              <Cpu className="w-8 h-8 text-amber-400 animate-pulse" />
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
            <span>Gemini API リアルタイムトレンド走査</span>
          </div>

          {/* Heading */}
          <h3 className="text-lg sm:text-xl font-extrabold text-white mb-2 tracking-tight">
            最新トレンドワードをスキャン中...
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed">
            Google Gemini API（モデル: <code className="text-amber-300 font-mono bg-slate-900 px-1 py-0.5 rounded">{activeModel}</code>）へリクエストを送信し、最新のバズワード群とイノベーター理論上の座標を取得しています。
          </p>

          <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-300/90 py-2.5 px-4 bg-slate-900/80 rounded-xl border border-slate-800">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Google API レスポンス待機中...</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
