import React from 'react';
import { motion } from 'motion/react';
import { 
  Droplets, 
  GitMerge, 
  Languages, 
  Waves, 
  Calendar, 
  ExternalLink, 
  Tag, 
  FileText,
  Sparkles,
  ArrowRight,
  Bookmark,
  Trash2
} from 'lucide-react';
import { TermData, JourneyStep } from '../types';
import { STAGES } from '../data/stages';
import { SemanticShiftCard } from './SemanticShiftCard';

interface JourneyFlowProps {
  term: TermData;
  isWatched?: boolean;
  onToggleWatch?: () => void;
  onDeleteTerm?: (termId: string) => void;
  onOpenDetailModal?: () => void;
}

export const JourneyFlow: React.FC<JourneyFlowProps> = ({ 
  term,
  isWatched = false,
  onToggleWatch,
  onDeleteTerm,
  onOpenDetailModal,
}) => {
  const getPhaseIcon = (phase: JourneyStep['phase']) => {
    switch (phase) {
      case 'origin':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'spread':
        return <GitMerge className="w-4 h-4 text-violet-400" />;
      case 'border_crossing':
        return <Languages className="w-4 h-4 text-emerald-400" />;
      case 'mainstream':
        return <Waves className="w-4 h-4 text-amber-400" />;
      default:
        return <Droplets className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getPhaseBadgeColor = (phase: JourneyStep['phase']) => {
    switch (phase) {
      case 'origin':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'spread':
        return 'bg-violet-500/10 text-violet-300 border-violet-500/30';
      case 'border_crossing':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'mainstream':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    }
  };

  const stage = STAGES[term.stage];

  return (
    <div className="bg-[#0d1117] rounded-2xl border border-slate-800/80 p-5 sm:p-6 shadow-xl flex flex-col h-full">
      {/* Term Header & Definition */}
      <div className="border-b border-slate-800 pb-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700/60 shadow-inner">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {term.name}
                </h3>
                {term.reading && (
                  <span className="text-xs text-slate-400 font-medium">
                    ({term.reading})
                  </span>
                )}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                  {term.categoryLabel}
                </span>
                <span 
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                  style={{ 
                    borderColor: stage.borderColor,
                    color: stage.color,
                    backgroundColor: `${stage.color}15`
                  }}
                >
                  {stage.name} ({stage.percentage})
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-normal">
                {term.summary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onToggleWatch && (
              <button
                id="toggle-watch-btn"
                onClick={onToggleWatch}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                  isWatched
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/80'
                }`}
                title={isWatched ? 'ウォッチリストから解除' : 'ウォッチリストに追加（先物買い）'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isWatched ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                <span>{isWatched ? '★ ウォッチ中' : '★ ウォッチする'}</span>
              </button>
            )}

            {onOpenDetailModal && (
              <button
                id="journey-open-detail-modal-btn"
                onClick={onOpenDetailModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 transition-colors cursor-pointer"
                title="ポップアップモーダルで詳細を開く"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>詳細モーダル</span>
              </button>
            )}

            {/* Requirement 2: Delete button in detail section */}
            {onDeleteTerm && (
              <button
                id="journey-delete-term-btn"
                onClick={() => onDeleteTerm(term.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-600 transition-all cursor-pointer shadow-sm active:scale-95"
                title="この単語をグラフから削除"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>この単語をグラフから削除</span>
              </button>
            )}

            {term.tags.map((tag) => (
              <span 
                key={tag} 
                className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 flex items-center gap-1 font-mono"
              >
                <Tag className="w-2.5 h-2.5 opacity-60" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Detailed Concept Definition Box */}
        <div className="mt-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 leading-relaxed">
          <strong className="text-slate-100 font-semibold mr-1">概念の定義：</strong>
          {term.definition}
        </div>
      </div>

      {/* River Flow Timeline (4 Phases) */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              言葉の源流ジャーニー (River Flow Timeline)
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            左：初出（水源） ───→ 右：現在地（大河）
          </span>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 relative">
          {term.journey.map((step, idx) => (
            <motion.div
              key={`${term.id}-${step.phase}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.08 }}
              className="group relative flex flex-col bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-200 shadow-md"
            >
              {/* Top Phase Badge & Year */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${getPhaseBadgeColor(step.phase)}`}>
                  {getPhaseIcon(step.phase)}
                  <span>{step.phaseTitle}</span>
                </span>
                <div className="flex items-center gap-1 text-xs font-mono font-semibold text-slate-300">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{step.year}</span>
                </div>
              </div>

              {/* Platform / Medium */}
              <div className="text-[11px] font-medium text-indigo-300/90 mb-1 flex items-center gap-1">
                <span>媒体:</span>
                <span className="text-slate-200">{step.platform}</span>
              </div>

              {/* Step Title */}
              <h5 className="text-sm font-bold text-white mb-2 leading-snug">
                {step.title}
              </h5>

              {/* Step Description */}
              <p className="text-xs text-slate-400 leading-relaxed mb-3 flex-1">
                {step.description}
              </p>

              {/* Key Artifact / Document Quote Box */}
              <div className="mt-auto bg-black/40 border border-slate-800/80 rounded-lg p-2.5">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  <FileText className="w-3 h-3 text-indigo-400" />
                  <span>主要エビデンス / 文献</span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono italic break-words line-clamp-2">
                  "{step.keyArtifact}"
                </p>
              </div>

              {/* Connector arrow on desktop between columns */}
              {idx < term.journey.length - 1 && (
                <div className="hidden xl:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#0d1117] border border-slate-700 items-center justify-center text-slate-400 pointer-events-none">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Semantic Shift Comparison Section */}
        {term.semanticShift && (
          <div className="mt-6">
            <SemanticShiftCard shift={term.semanticShift} termName={term.name} />
          </div>
        )}
      </div>
    </div>
  );
};
