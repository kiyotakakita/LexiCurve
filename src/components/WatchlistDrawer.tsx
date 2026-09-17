import React from 'react';
import { 
  X, 
  Bookmark, 
  Trash2, 
  TrendingUp, 
  Calendar, 
  ExternalLink, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TermData } from '../types';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistTerms: TermData[];
  onSelectTerm: (term: TermData) => void;
  onRemoveFromWatchlist: (id: string) => void;
  onAddQuickTerm: (id: string) => void;
  availableTerms: TermData[];
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  watchlistTerms,
  onSelectTerm,
  onRemoveFromWatchlist,
  onAddQuickTerm,
  availableTerms,
}) => {
  if (!isOpen) return null;

  // Find candidate terms not currently in watchlist
  const unwatchedCandidates = availableTerms
    .filter((t) => !watchlistTerms.some((w) => w.id === t.id))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Bookmark className="w-5 h-5 fill-amber-400/20" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  マイ・ウォッチリスト
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                    {watchlistTerms.length} 語
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  先物買い・普及動向トラッキング
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {watchlistTerms.length === 0 ? (
              /* Empty state */
              <div className="text-center py-10 px-4 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <Bookmark className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-200">
                    ウォッチ中の単語はありません
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    気になる新造語やキャズム前の概念を「★ ウォッチ」に追加して、普及フェーズの進行をトラッキングしましょう。
                  </p>
                </div>

                {/* Candidate suggestions */}
                {unwatchedCandidates.length > 0 && (
                  <div className="pt-4 border-t border-slate-800/80 text-left space-y-2.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      おすすめの先物買い候補:
                    </span>
                    <div className="space-y-2">
                      {unwatchedCandidates.map((cand) => (
                        <div
                          key={cand.id}
                          className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">
                              {cand.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {cand.categoryLabel}
                            </span>
                          </div>
                          <button
                            onClick={() => onAddQuickTerm(cand.id)}
                            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium border border-amber-500/40 shrink-0 transition-colors"
                          >
                            + 追加
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* List of Watched terms */
              <div className="space-y-3">
                <div className="text-[11px] text-slate-400 flex items-center justify-between pb-1">
                  <span>保存された単語（クリックで詳細表示）</span>
                  <span>{watchlistTerms.length}件</span>
                </div>

                {watchlistTerms.map((term) => {
                  return (
                    <div
                      key={term.id}
                      className="group p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all shadow-md relative"
                    >
                      <div 
                        className="cursor-pointer space-y-2 pr-6"
                        onClick={() => {
                          onSelectTerm(term);
                          onClose();
                        }}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {term.name}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {term.categoryLabel}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                          {term.summary}
                        </p>

                        <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                          <span className="flex items-center gap-1 font-mono">
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            通じる度: <strong className="text-slate-200">{term.insights.comprehensionScore}%</strong>
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-indigo-400" />
                            {term.insights.daysTraveled}日経過
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFromWatchlist(term.id);
                        }}
                        className="absolute top-3 right-3 p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="ウォッチリストから削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>ブラウザ（LocalStorage）に自動保存</span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
