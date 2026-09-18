import React, { useState } from 'react';
import { 
  Compass, 
  Zap, 
  Cpu, 
  Briefcase, 
  Sparkles, 
  Search, 
  Loader2, 
  Info,
  TrendingUp,
  X,
  Bookmark,
  Flame,
  Key
} from 'lucide-react';
import { CategoryId, TermData } from '../types';
import { CATEGORIES } from '../data/stages';

interface HeaderProps {
  selectedCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  terms: TermData[];
  onAnalyzeWord: (word: string) => void;
  isAnalyzing: boolean;
  onShowTheoryInfo: () => void;
  watchlistCount: number;
  onOpenWatchlist: () => void;
  onScanTrending: () => void;
  isScanningTrending: boolean;
  onOpenApiKeyModal?: () => void;
  hasApiKey?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  terms,
  onAnalyzeWord,
  isAnalyzing,
  onShowTheoryInfo,
  watchlistCount,
  onOpenWatchlist,
  onScanTrending,
  isScanningTrending,
  onOpenApiKeyModal,
  hasApiKey,
}) => {
  const [searchValue, setSearchValue] = useState('');

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass': return <Compass className="w-4 h-4" />;
      case 'Zap': return <Zap className="w-4 h-4" />;
      case 'Cpu': return <Cpu className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      default: return <Compass className="w-4 h-4" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim() && !isAnalyzing) {
      onAnalyzeWord(searchValue.trim());
      setSearchValue('');
    }
  };

  const getCategoryCount = (catId: CategoryId) => {
    if (catId === 'all') return terms.length;
    return terms.filter(t => t.category === catId).length;
  };

  return (
    <header className="border-b border-slate-800/80 bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          {/* Logo and Subtitle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-[#0d1117] rounded-[11px] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                    LexiCurve
                    <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      v1.0
                    </span>
                  </h1>
                </div>
                <p className="text-xs text-slate-400 font-medium tracking-wide">
                  概念の浸透度＆源流マップ <span className="text-slate-600">|</span> イノベーター理論 × 源流ジャーニー
                </p>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <button
                id="scan-trending-mobile-btn"
                onClick={onScanTrending}
                disabled={isScanningTrending}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/25 to-rose-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold shadow-sm active:scale-95 disabled:opacity-50"
                title="🔥 最新の急上昇ワードをAIスキャン"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                <span>AI急上昇</span>
              </button>

              <button
                id="watchlist-mobile-btn"
                onClick={onOpenWatchlist}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-medium"
                title="ウォッチリストを開く"
              >
                <Bookmark className="w-4 h-4 fill-amber-400/20" />
                <span className="font-mono font-bold">{watchlistCount}</span>
              </button>

              <button
                id="theory-info-mobile-btn"
                onClick={onShowTheoryInfo}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                title="イノベーター理論とは"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar & Quick Input & Trending Scan */}
          <div className="flex items-center gap-2 flex-1 lg:max-w-2xl">
            <button
              id="scan-trending-desktop-btn"
              onClick={onScanTrending}
              disabled={isScanningTrending}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-200 hover:text-white bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-500/20 hover:from-amber-500/35 hover:via-rose-500/35 hover:to-indigo-500/35 border border-amber-500/50 hover:border-amber-400 rounded-xl transition-all whitespace-nowrap cursor-pointer shadow-md shadow-amber-500/10 active:scale-95 disabled:opacity-50 group"
              title="AIがネット・SNSを探索し、最新の旬なバズワード（Vibe Coding, AI Slop等）を一括発掘"
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
              <span>🔥 最新の急上昇ワードをAIスキャン</span>
            </button>

            <form onSubmit={handleSubmit} className="relative flex-1">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="word-search-input"
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="新造語・バズワードを分析（例: Vibe Coding, MCP...）"
                  disabled={isAnalyzing}
                  className="w-full pl-10 pr-24 py-2 text-sm bg-slate-900/90 border border-slate-700/70 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner disabled:opacity-50"
                />
                <div className="absolute right-1.5 flex items-center gap-1">
                  {searchValue && (
                    <button
                      type="button"
                      onClick={() => setSearchValue('')}
                      className="p-1 text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    id="analyze-submit-btn"
                    type="submit"
                    disabled={!searchValue.trim() || isAnalyzing}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>分析中</span>
                      </>
                    ) : (
                      <>
                        <span>解析</span>
                        <kbd className="hidden sm:inline-block text-[10px] font-mono opacity-70 bg-indigo-700 px-1 rounded">↵</kbd>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <button
              id="watchlist-desktop-btn"
              onClick={onOpenWatchlist}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all whitespace-nowrap cursor-pointer shadow-sm shadow-amber-500/5"
              title="マイ・ウォッチリスト（先物買い）を開く"
            >
              <Bookmark className="w-4 h-4 fill-amber-400/25" />
              <span>ウォッチリスト</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500/25 text-amber-300">
                {watchlistCount}
              </span>
            </button>

            <button
              id="theory-info-desktop-btn"
              onClick={onShowTheoryInfo}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              title="イノベーター理論とキャズムについて"
            >
              <Info className="w-4 h-4 text-indigo-400" />
              <span>理論解説</span>
            </button>

            {onOpenApiKeyModal && (
              <button
                id="gemini-api-key-btn"
                onClick={onOpenApiKeyModal}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                  hasApiKey
                    ? 'text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                }`}
                title="Gemini API 設定 (VITE_GEMINI_API_KEY またはローカル入力)"
              >
                <Key className={`w-3.5 h-3.5 ${hasApiKey ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{hasApiKey ? 'Gemini AI接続中' : 'AIキー設定'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar text-xs">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            const count = getCategoryCount(category.id);
            return (
              <button
                key={category.id}
                id={`cat-tab-${category.id}`}
                onClick={() => onSelectCategory(category.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {getCategoryIcon(category.iconName)}
                <span>{category.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
                  isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
