import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Plus, 
  HelpCircle, 
  Compass, 
  Layers, 
  Search, 
  Check, 
  RefreshCw,
  ExternalLink,
  Flame,
  AlertTriangle,
  Bookmark
} from 'lucide-react';
import { TermData, CategoryId } from './types';
import { INITIAL_TERMS } from './data/mockTerms';
import { STAGES } from './data/stages';
import { generateAnalyzedTerm } from './utils/termGenerator';
import { Header } from './components/Header';
import { BellCurveMap } from './components/BellCurveMap';
import { JourneyFlow } from './components/JourneyFlow';
import { InsightPanel } from './components/InsightPanel';
import { TheoryModal } from './components/TheoryModal';
import { AnalyzingOverlay } from './components/AnalyzingOverlay';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { TrendingScanModal } from './components/TrendingScanModal';

const LOCAL_STORAGE_WATCHLIST_KEY = 'lexicurve_watchlist_ids_v1';
const LOCAL_STORAGE_CUSTOM_TERMS_KEY = 'lexicurve_custom_terms_v1';

export default function App() {
  // 1. Custom terms persisted in LocalStorage
  const [customTerms, setCustomTerms] = useState<TermData[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CUSTOM_TERMS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored custom terms', e);
    }
    return [];
  });

  // Watchlist IDs persisted in LocalStorage
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_WATCHLIST_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored watchlist', e);
    }
    return ['mcp', 'interstitial-journaling'];
  });

  // Save custom terms to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_TERMS_KEY, JSON.stringify(customTerms));
    } catch (e) {
      console.error('Failed to save custom terms', e);
    }
  }, [customTerms]);

  // Save watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_WATCHLIST_KEY, JSON.stringify(watchlistIds));
    } catch (e) {
      console.error('Failed to save watchlist', e);
    }
  }, [watchlistIds]);

  // Combined terms
  const terms = useMemo(() => {
    // Avoid duplicate IDs
    const customFiltered = customTerms.filter(
      (ct) => !INITIAL_TERMS.some((it) => it.id === ct.id)
    );
    return [...INITIAL_TERMS, ...customFiltered];
  }, [customTerms]);

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [selectedTermId, setSelectedTermId] = useState<string>('mcp');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzingWord, setAnalyzingWord] = useState<string>('');
  const [isScanningTrending, setIsScanningTrending] = useState<boolean>(false);
  const [highlightedTermIds, setHighlightedTermIds] = useState<string[]>([]);
  const [theoryModalOpen, setTheoryModalOpen] = useState<boolean>(false);
  const [theoryModalTab, setTheoryModalTab] = useState<'theory' | 'chasm'>('theory');
  const [watchlistOpen, setWatchlistOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scan trending buzzwords via AI
  const handleScanTrending = async () => {
    setIsScanningTrending(true);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/scan-trending-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      let trendingTerms: TermData[] = [];
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.terms)) {
          trendingTerms = data.terms.map((t: TermData) => ({
            ...t,
            isCustom: true,
            isTrending: true,
          }));
        }
      }

      // Ensure minimum 2.3 seconds for scanning animation to play smoothly
      const elapsed = Date.now() - startTime;
      if (elapsed < 2300) {
        await new Promise((r) => setTimeout(r, 2300 - elapsed));
      }

      if (trendingTerms.length > 0) {
        // Merge into custom terms, avoiding duplicates
        setCustomTerms((prev) => {
          const newMap = new Map<string, TermData>();
          trendingTerms.forEach((t) => newMap.set(t.id, t));
          prev.forEach((t) => {
            if (!newMap.has(t.id)) newMap.set(t.id, t);
          });
          return Array.from(newMap.values());
        });

        const newIds = trendingTerms.map((t) => t.id);
        setHighlightedTermIds(newIds);

        // Select the first trending term (e.g. Vibe Coding)
        if (trendingTerms[0]) {
          setSelectedTermId(trendingTerms[0].id);
        }

        setToastMessage(
          `🔥 最新の急上昇ワード ${trendingTerms.length} 件（Vibe Coding, AI Slop, ブレインロット等）をAIスキャンし、ベルカーブ上に一括プロットしました！`
        );
        setTimeout(() => setToastMessage(null), 6000);

        // Keep highlighted animation for 18 seconds
        setTimeout(() => {
          setHighlightedTermIds([]);
        }, 18000);
      }
    } catch (err) {
      console.error('Error scanning trending words:', err);
      setToastMessage('最新トレンドのスキャン中にエラーが発生しました');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsScanningTrending(false);
    }
  };

  // Selected term object
  const selectedTerm = useMemo(() => {
    return terms.find(t => t.id === selectedTermId) || terms[0];
  }, [terms, selectedTermId]);

  // When category changes, if selected term is not in that category, pick first visible one
  const handleSelectCategory = (cat: CategoryId) => {
    setSelectedCategory(cat);
    if (cat !== 'all') {
      const isCurrentInCat = selectedTerm && selectedTerm.category === cat;
      if (!isCurrentInCat) {
        const firstInCat = terms.find(t => t.category === cat);
        if (firstInCat) {
          setSelectedTermId(firstInCat.id);
        }
      }
    }
  };

  // Toggle watchlist
  const handleToggleWatch = useCallback((termId: string) => {
    setWatchlistIds((prev) => {
      if (prev.includes(termId)) {
        const updated = prev.filter((id) => id !== termId);
        setToastMessage('ウォッチリストから解除しました');
        setTimeout(() => setToastMessage(null), 3000);
        return updated;
      } else {
        const updated = [...prev, termId];
        setToastMessage('★ ウォッチリストに追加しました（先物買い）');
        setTimeout(() => setToastMessage(null), 3000);
        return updated;
      }
    });
  }, []);

  // Trigger analysis for any search query using /api/analyze-word or fallback
  const handleAnalyzeWord = async (word: string) => {
    const cleanWord = word.trim();
    if (!cleanWord) return;

    setAnalyzingWord(cleanWord);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: cleanWord }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.term) {
          const analyzed = result.term as TermData;
          setCustomTerms((prev) => [analyzed, ...prev]);
          setSelectedTermId(analyzed.id);
          setIsAnalyzing(false);
          setToastMessage(
            result.source === 'gemini'
              ? `「${analyzed.name}」をGemini AIがリアルタイム推論分析し、プロットしました！`
              : `「${analyzed.name}」の分析を完了し、ベルカーブにプロットしました！`
          );
          setTimeout(() => setToastMessage(null), 4500);
          return;
        }
      }
      throw new Error('API response invalid');
    } catch (err) {
      console.warn('Server analyze API request failed, using intelligent fallback generator', err);
      // Fallback
      setTimeout(() => {
        const fallbackTerm = generateAnalyzedTerm(cleanWord);
        setCustomTerms((prev) => [fallbackTerm, ...prev]);
        setSelectedTermId(fallbackTerm.id);
        setIsAnalyzing(false);
        setToastMessage(`「${fallbackTerm.name}」を分析し、ベルカーブにプロットしました！`);
        setTimeout(() => setToastMessage(null), 4500);
      }, 1500);
    }
  };

  // Open Theory modal
  const handleOpenTheory = (tab: 'theory' | 'chasm' = 'theory') => {
    setTheoryModalTab(tab);
    setTheoryModalOpen(true);
  };

  // Filtered terms for the horizontal quick-selector strip
  const visibleTerms = useMemo(() => {
    if (selectedCategory === 'all') return terms;
    return terms.filter(t => t.category === selectedCategory);
  }, [terms, selectedCategory]);

  // Watched terms objects
  const watchedTerms = useMemo(() => {
    return terms.filter((t) => watchlistIds.includes(t.id));
  }, [terms, watchlistIds]);

  return (
    <div className="min-h-screen bg-[#090b10] text-[#e2e8f0] flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 1. Header & Control Bar */}
      <Header
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        terms={terms}
        onAnalyzeWord={handleAnalyzeWord}
        isAnalyzing={isAnalyzing}
        onShowTheoryInfo={() => handleOpenTheory('theory')}
        watchlistCount={watchlistIds.length}
        onOpenWatchlist={() => setWatchlistOpen(true)}
        onScanTrending={handleScanTrending}
        isScanningTrending={isScanningTrending}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Toast alert when new term is analyzed or watched */}
        {toastMessage && (
          <div className="bg-gradient-to-r from-indigo-950/90 to-cyan-950/90 border border-indigo-500/50 text-indigo-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between shadow-lg shadow-indigo-500/10 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white text-xs underline cursor-pointer ml-3"
            >
              閉じる
            </button>
          </div>
        )}

        {/* 2. Upper Main: Innovator Theory Bell Curve Map */}
        <section id="innovator-bell-curve-section" aria-label="イノベーター理論ベルカーブ">
          <BellCurveMap
            terms={terms}
            selectedCategory={selectedCategory}
            selectedTerm={selectedTerm}
            onSelectTerm={(term) => setSelectedTermId(term.id)}
            onShowChasmInfo={() => handleOpenTheory('chasm')}
            highlightedTermIds={highlightedTermIds}
          />
        </section>

        {/* Quick Word Strip / Term Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-slate-500 text-[11px] font-mono whitespace-nowrap pl-1">
            単語クイック選択:
          </span>
          {visibleTerms.map((term) => {
            const isSelected = selectedTerm?.id === term.id;
            const isWatched = watchlistIds.includes(term.id);
            const stageConfig = STAGES[term.stage];
            return (
              <button
                key={term.id}
                id={`quick-term-${term.id}`}
                onClick={() => setSelectedTermId(term.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: stageConfig.color }}
                />
                <span>{term.name}</span>
                {isWatched && (
                  <span className="text-amber-400 text-[10px]">★</span>
                )}
                {term.nearChasm && (
                  <span className="text-[10px] text-rose-400 font-bold">⚡</span>
                )}
              </button>
            );
          })}

          {/* Quick analysis suggestions */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800 whitespace-nowrap">
            <span className="text-[11px] text-slate-500">解析例:</span>
            {['Vibe Coding', 'AIエージェント', 'プロンプトインジェクション', 'アテンションエコノミー'].map((keyword) => (
              <button
                key={keyword}
                onClick={() => handleAnalyzeWord(keyword)}
                disabled={isAnalyzing}
                className="px-2 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>{keyword}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Lower Detail: Selected Term's Journey Flow + Insight Panel */}
        {selectedTerm && (
          <section id="term-journey-insight-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left/Main Column: Words Journey Flow Timeline & Semantic Shift (8 cols on lg) */}
            <div className="lg:col-span-8 flex flex-col">
              <JourneyFlow 
                term={selectedTerm} 
                isWatched={watchlistIds.includes(selectedTerm.id)}
                onToggleWatch={() => handleToggleWatch(selectedTerm.id)}
              />
            </div>

            {/* Right Column: Insight Metrics Panel & Audience Safety (4 cols on lg) */}
            <div className="lg:col-span-4 flex flex-col">
              <InsightPanel term={selectedTerm} />
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0d1117] py-6 px-4 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">LexiCurve</span>
            <span>—</span>
            <span>新造語・バズワードの浸透度と源流ツリー可視化ダッシュボード</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setWatchlistOpen(true)}
              className="text-amber-400/90 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Bookmark className="w-3.5 h-3.5 fill-amber-400/30" />
              <span>ウォッチリスト ({watchlistIds.length})</span>
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenTheory('theory')}
              className="hover:text-indigo-400 transition-colors cursor-pointer"
            >
              イノベーター理論
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenTheory('chasm')}
              className="hover:text-rose-400 transition-colors cursor-pointer"
            >
              キャズムの溝
            </button>
            <span>•</span>
            <span className="text-slate-600 font-mono">React 19 + Express + Gemini</span>
          </div>
        </div>
      </footer>

      {/* Real-time Trend Discovery Radar Scanner Modal */}
      <TrendingScanModal
        isOpen={isScanningTrending}
      />

      {/* Theory & Chasm Explanation Modal */}
      <TheoryModal
        isOpen={theoryModalOpen}
        onClose={() => setTheoryModalOpen(false)}
        defaultTab={theoryModalTab}
      />

      {/* Simulated/AI Search Analysis Overlay */}
      <AnalyzingOverlay
        isAnalyzing={isAnalyzing}
        targetWord={analyzingWord}
      />

      {/* Watchlist Side Drawer */}
      <WatchlistDrawer
        isOpen={watchlistOpen}
        onClose={() => setWatchlistOpen(false)}
        watchlistTerms={watchedTerms}
        onSelectTerm={(term) => setSelectedTermId(term.id)}
        onRemoveFromWatchlist={(id) => handleToggleWatch(id)}
        onAddQuickTerm={(id) => handleToggleWatch(id)}
        availableTerms={terms}
      />
    </div>
  );
}
