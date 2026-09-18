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
  Bookmark,
  RotateCcw
} from 'lucide-react';
import { TermData, CategoryId } from './types';
import { INITIAL_TERMS } from './data/mockTerms';
import { STAGES } from './data/stages';
import { generateAnalyzedTerm } from './utils/termGenerator';
import { normalizeTermData } from './utils/normalizeTerm';
import { Header } from './components/Header';
import { BellCurveMap } from './components/BellCurveMap';
import { JourneyFlow } from './components/JourneyFlow';
import { InsightPanel } from './components/InsightPanel';
import { TheoryModal } from './components/TheoryModal';
import { AnalyzingOverlay } from './components/AnalyzingOverlay';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { TrendingScanModal } from './components/TrendingScanModal';
import { TermDetailModal } from './components/TermDetailModal';

const LOCAL_STORAGE_WATCHLIST_KEY = 'lexicurve_watchlist_ids_v1';
const LOCAL_STORAGE_WORDS_KEY = 'lexicurve_all_words_v2';

export default function App() {
  // 1. Unified words state persisted in LocalStorage
  const [words, setWords] = useState<TermData[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_WORDS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Migrate from old custom terms if present
      const legacyCustom = localStorage.getItem('lexicurve_custom_terms_v1');
      if (legacyCustom) {
        const parsedCustom = JSON.parse(legacyCustom);
        if (Array.isArray(parsedCustom) && parsedCustom.length > 0) {
          const map = new Map<string, TermData>();
          parsedCustom.forEach((t: TermData) => map.set(t.id, t));
          INITIAL_TERMS.forEach((t) => {
            if (!map.has(t.id)) map.set(t.id, t);
          });
          return Array.from(map.values());
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored words', e);
    }
    return INITIAL_TERMS;
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

  // Automatically save words to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_WORDS_KEY, JSON.stringify(words));
    } catch (e) {
      console.error('Failed to save words to localStorage', e);
    }
  }, [words]);

  // Save watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_WATCHLIST_KEY, JSON.stringify(watchlistIds));
    } catch (e) {
      console.error('Failed to save watchlist', e);
    }
  }, [watchlistIds]);

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [selectedTermId, setSelectedTermId] = useState<string>('mcp');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzingWord, setAnalyzingWord] = useState<string>('');
  const [isScanningTrending, setIsScanningTrending] = useState<boolean>(false);
  const [highlightedTermIds, setHighlightedTermIds] = useState<string[]>([]);
  const [theoryModalOpen, setTheoryModalOpen] = useState<boolean>(false);
  const [theoryModalTab, setTheoryModalTab] = useState<'theory' | 'chasm'>('theory');
  const [watchlistOpen, setWatchlistOpen] = useState<boolean>(false);
  const [detailModalTerm, setDetailModalTerm] = useState<TermData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Global Escape key listener to close all popups, drawers, and modals on screen
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDetailModalTerm(null);
        setTheoryModalOpen(false);
        setWatchlistOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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
        // Normalize each term ensuring all bell curve attributes are valid
        const normalizedTrending = trendingTerms.map((t) => normalizeTermData(t, t.name));

        // Merge into words state, avoiding duplicates
        setWords((prev) => {
          const newMap = new Map<string, TermData>();
          normalizedTrending.forEach((t) => newMap.set(t.id, t));
          prev.forEach((t) => {
            if (!newMap.has(t.id)) newMap.set(t.id, t);
          });
          return Array.from(newMap.values());
        });

        // Switch to 'all' so all newly scanned trending terms are immediately visible
        setSelectedCategory('all');
        const newIds = normalizedTrending.map((t) => t.id);
        setHighlightedTermIds(newIds);

        // Select the first trending term (e.g. Vibe Coding)
        if (normalizedTrending[0]) {
          setSelectedTermId(normalizedTrending[0].id);
        }

        setToastMessage(
          `🔥 最新の急上昇ワード ${normalizedTrending.length} 件（Vibe Coding, AI Slop, ブレインロット等）をAIスキャンし、ベルカーブ上に一括プロットしました！`
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
    return words.find(t => t.id === selectedTermId) || words[0] || null;
  }, [words, selectedTermId]);

  // When category changes, if selected term is not in that category, pick first visible one
  const handleSelectCategory = (cat: CategoryId) => {
    setSelectedCategory(cat);
    if (cat !== 'all') {
      const isCurrentInCat = selectedTerm && selectedTerm.category === cat;
      if (!isCurrentInCat) {
        const firstInCat = words.find(t => t.category === cat);
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

  // 1. Requirement: Formally add searched word to words state, position on bell curve, and persist in localStorage
  const handleAnalyzeWord = async (word: string) => {
    const cleanWord = word.trim();
    if (!cleanWord) return;

    // Check if word already exists in words list (check name and title)
    const existing = words.find(
      (w) => w.name.toLowerCase() === cleanWord.toLowerCase() || (w as any).title?.toLowerCase() === cleanWord.toLowerCase()
    );
    if (existing) {
      setSelectedCategory('all');
      setSelectedTermId(existing.id);
      setHighlightedTermIds([existing.id]);
      setToastMessage(`「${existing.name}」は既に登録されています。ベルカーブ上の位置を選択・表示しました！`);
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    setAnalyzingWord(cleanWord);
    setIsAnalyzing(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch('/api/analyze-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: cleanWord }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.term) {
          // Normalize with guaranteed ID, progress, score, position, stage, and phase
          const newWord = normalizeTermData(result.term, cleanWord);
          
          // Formally add to words state: setWords(prev => [newWord, ...prev])
          setWords((prev) => [newWord, ...prev.filter((w) => w.id !== newWord.id)]);
          
          // Auto-switch to 'all' so the new term is immediately visible on the bell curve
          setSelectedCategory('all');
          setSelectedTermId(newWord.id);
          setHighlightedTermIds([newWord.id]);

          setIsAnalyzing(false);
          const stageName = STAGES[newWord.stage]?.name || 'イノベーター理論';
          setToastMessage(
            `「${newWord.name}」を分析し、ベルカーブ上に正式追加しました！（${stageName} / 普及度 ${newWord.stageProgress}%）`
          );
          setTimeout(() => setToastMessage(null), 5000);
          setTimeout(() => {
            setHighlightedTermIds((prev) => prev.filter((id) => id !== newWord.id));
          }, 15000);
          return;
        }
      }
      throw new Error('API response invalid');
    } catch (err) {
      console.warn('Server analyze API request failed or timed out, using fallback generator', err);
      // Fallback generator
      const fallbackTerm = generateAnalyzedTerm(cleanWord);
      const newWord = normalizeTermData(fallbackTerm, cleanWord);

      setWords((prev) => [newWord, ...prev.filter((w) => w.id !== newWord.id)]);
      setSelectedCategory('all');
      setSelectedTermId(newWord.id);
      setHighlightedTermIds([newWord.id]);

      setIsAnalyzing(false);
      const stageName = STAGES[newWord.stage]?.name || 'イノベーター理論';
      setToastMessage(`「${newWord.name}」を分析し、ベルカーブ上に正式追加しました！（${stageName} / 普及度 ${newWord.stageProgress}%）`);
      setTimeout(() => setToastMessage(null), 5000);
      setTimeout(() => {
        setHighlightedTermIds((prev) => prev.filter((id) => id !== newWord.id));
      }, 15000);
    }
  };

  // 2. Requirement: Delete term from words state, close modal immediately, and persist
  const handleDeleteTerm = useCallback((termId: string) => {
    const termToDelete = words.find((w) => w.id === termId);
    
    // 1. Remove target term from words state
    setWords((prev) => prev.filter((w) => w.id !== termId));
    setWatchlistIds((prev) => prev.filter((id) => id !== termId));

    // 2. Immediately close detail modal
    setDetailModalTerm(null);

    // If currently selected term is deleted, auto-select first remaining term
    setSelectedTermId((prevSelected) => {
      if (prevSelected === termId) {
        const remaining = words.filter((w) => w.id !== termId);
        return remaining.length > 0 ? remaining[0].id : '';
      }
      return prevSelected;
    });

    const termName = termToDelete?.name || '単語';
    setToastMessage(`「${termName}」をベルカーブから削除しました`);
    setTimeout(() => setToastMessage(null), 3500);
  }, [words]);

  // Reset to default terms
  const handleResetDefaultTerms = () => {
    setWords(INITIAL_TERMS);
    setSelectedTermId('mcp');
    setSelectedCategory('all');
    setToastMessage('初期の単語リストに復元しました');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Open Theory modal
  const handleOpenTheory = (tab: 'theory' | 'chasm' = 'theory') => {
    setTheoryModalTab(tab);
    setTheoryModalOpen(true);
  };

  // Filtered terms for the horizontal quick-selector strip
  const visibleTerms = useMemo(() => {
    if (selectedCategory === 'all') return words;
    return words.filter(t => t.category === selectedCategory);
  }, [words, selectedCategory]);

  // Watched terms objects
  const watchedTerms = useMemo(() => {
    return words.filter((t) => watchlistIds.includes(t.id));
  }, [words, watchlistIds]);

  return (
    <div className="min-h-screen bg-[#090b10] text-[#e2e8f0] flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 1. Header & Control Bar */}
      <Header
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        terms={words}
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
        {/* Toast alert when new term is analyzed, watched, or deleted */}
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
            terms={words}
            selectedCategory={selectedCategory}
            selectedTerm={selectedTerm}
            onSelectTerm={(term) => setSelectedTermId(term.id)}
            onShowChasmInfo={() => handleOpenTheory('chasm')}
            highlightedTermIds={highlightedTermIds}
            onDeleteTerm={handleDeleteTerm}
            onOpenDetailModal={(term) => setDetailModalTerm(term)}
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
        {selectedTerm ? (
          <section id="term-journey-insight-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left/Main Column: Words Journey Flow Timeline & Semantic Shift (8 cols on lg) */}
            <div className="lg:col-span-8 flex flex-col">
              <JourneyFlow 
                term={selectedTerm} 
                isWatched={watchlistIds.includes(selectedTerm.id)}
                onToggleWatch={() => handleToggleWatch(selectedTerm.id)}
                onDeleteTerm={handleDeleteTerm}
                onOpenDetailModal={() => setDetailModalTerm(selectedTerm)}
              />
            </div>

            {/* Right Column: Insight Metrics Panel & Audience Safety (4 cols on lg) */}
            <div className="lg:col-span-4 flex flex-col">
              <InsightPanel term={selectedTerm} />
            </div>
          </section>
        ) : (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
            <p className="text-slate-400 mb-3">グラフ上に単語が存在しません。</p>
            <button
              onClick={handleResetDefaultTerms}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>初期単語リストを復元する</span>
            </button>
          </div>
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
          <div className="flex items-center gap-4 text-slate-400 flex-wrap justify-center">
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
            <button
              onClick={handleResetDefaultTerms}
              className="hover:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
              title="初期の単語リスト状態に戻す"
            >
              <RotateCcw className="w-3 h-3" />
              <span>単語リスト初期化</span>
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

      {/* Detail Modal for in-depth viewing and deletion */}
      <TermDetailModal
        isOpen={Boolean(detailModalTerm)}
        onClose={() => setDetailModalTerm(null)}
        term={detailModalTerm}
        onDeleteTerm={handleDeleteTerm}
        isWatched={detailModalTerm ? watchlistIds.includes(detailModalTerm.id) : false}
        onToggleWatch={() => detailModalTerm && handleToggleWatch(detailModalTerm.id)}
      />

      {/* Watchlist Side Drawer */}
      <WatchlistDrawer
        isOpen={watchlistOpen}
        onClose={() => setWatchlistOpen(false)}
        watchlistTerms={watchedTerms}
        onSelectTerm={(term) => setSelectedTermId(term.id)}
        onRemoveFromWatchlist={(id) => handleToggleWatch(id)}
        onAddQuickTerm={(id) => handleToggleWatch(id)}
        availableTerms={words}
      />
    </div>
  );
}
