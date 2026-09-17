import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  AlertTriangle, 
  BookOpen, 
  Lightbulb, 
  Layers, 
  TrendingUp,
  ExternalLink 
} from 'lucide-react';
import { STAGES } from '../data/stages';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'theory' | 'chasm';
}

export const TheoryModal: React.FC<TheoryModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'theory',
}) => {
  const [activeTab, setActiveTab] = React.useState<'theory' | 'chasm'>(defaultTab);

  React.useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-[#0d1117] border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-200 z-10 max-h-[90vh] overflow-y-auto no-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  理論フレームワーク解説
                </h3>
                <p className="text-xs text-slate-400">
                  イノベーター理論 × キャズム理論 × 言葉の源流
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub tabs */}
          <div className="flex gap-2 my-4 border-b border-slate-800 pb-2 text-xs">
            <button
              onClick={() => setActiveTab('theory')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'theory'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              イノベーター理論とは (5つの層)
            </button>
            <button
              onClick={() => setActiveTab('chasm')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'chasm'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              キャズムの溝 (16%の壁)
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'theory' ? (
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
              <p className="text-slate-300">
                スタンフォード大学のエベレット・M・ロジャーズ（Everett M. Rogers）教授が1962年に提唱した、新しい革新的な概念やテクノロジーが社会に普及していくプロセスを正規分布曲線で表した理論です。
              </p>

              <div className="space-y-2.5 pt-2">
                {Object.values(STAGES).map((st) => (
                  <div
                    key={st.id}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3"
                  >
                    <span
                      className="w-3 h-3 rounded-full mt-1 shrink-0"
                      style={{ backgroundColor: st.color }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs sm:text-sm">
                          {st.name} ({st.nameEn})
                        </span>
                        <span className="text-xs font-mono font-bold" style={{ color: st.color }}>
                          {st.percentage}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {st.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-300 mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  なぜ「キャズム」が新造語の生死を分けるのか？
                </div>
                <p className="text-xs text-rose-300/90">
                  ジェフリー・ムーア（Geoffrey Moore）が指摘した通り、アーリーアダプター（革新の信奉者：16%）とアーリーマジョリティ（実用性を重んじる慎重派：34%）の間には、越えがたい深い溝（キャズム）が存在します。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <h5 className="font-bold text-violet-300 text-xs mb-1">
                    アーリーアダプターの欲求
                  </h5>
                  <p className="text-xs text-slate-400">
                    「他人がやっていない最先端を試したい」「多少の不便やバグは自分で解決する」。新奇性そのものに価値を見出す。
                  </p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <h5 className="font-bold text-emerald-300 text-xs mb-1">
                    アーリーマジョリティの欲求
                  </h5>
                  <p className="text-xs text-slate-400">
                    「同業他社で実績はあるか？」「誰でも簡単に使えるマニュアルはあるか？」。安心と実用性を何よりも重視する。
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                <strong className="text-white">言葉のキャズム越え：</strong>
                多くのバズワードはギーク界隈で盛り上がったあと、実用的なソリューションや一般的な分かりやすい言葉に翻訳されないままキャズムに落ちて消え去ります。一方、越えた言葉は「日常の常識」となります。
              </div>
            </div>
          )}

          {/* Footer close */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              閉じる
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
