import React from 'react';
import { GitCompare, History, Sparkles, ArrowRight, Compass } from 'lucide-react';
import { SemanticShift } from '../types';

interface SemanticShiftCardProps {
  shift?: SemanticShift;
  termName: string;
}

export const SemanticShiftCard: React.FC<SemanticShiftCardProps> = ({ shift, termName }) => {
  if (!shift) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-purple-500/20 text-purple-400">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              語義の変遷とギャップ (Semantic Shift)
            </h4>
            <span className="text-[10px] text-slate-400">
              海外発祥の厳密な原義 vs 日本でのバズ受容ニュアンス
            </span>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
          意味の伝言ゲーム分析
        </span>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* 1. 原義 (Original Meaning) */}
        <div className="p-3.5 rounded-lg bg-sky-950/20 border border-sky-500/25 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
            <History className="w-3.5 h-3.5" />
            <span>【発祥の原義】海外提唱時の厳密な意味</span>
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            {shift.originalMeaning}
          </p>
          <div className="text-[11px] text-slate-400 border-t border-sky-500/15 pt-2">
            <span className="text-sky-300 font-medium mr-1">提唱背景:</span>
            {shift.originalContext}
          </div>
        </div>

        {/* 2. 現在のニュアンス (Current Nuance) */}
        <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-500/25 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>【現在の受容】日本でのバズ・浸透ニュアンス</span>
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            {shift.currentNuance}
          </p>
          <div className="text-[11px] text-slate-400 border-t border-purple-500/15 pt-2 flex items-start gap-1">
            <Compass className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
            <span>日常の実務・SNSでの使われ方の実態</span>
          </div>
        </div>
      </div>

      {/* 3. 変遷ハイライト (Shift Highlight) */}
      <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/25 flex items-start gap-2.5">
        <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-xs font-bold text-amber-300 block mb-0.5">
            ニュアンスの乖離ポイント:
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {shift.shiftHighlight}
          </p>
        </div>
      </div>
    </div>
  );
};
