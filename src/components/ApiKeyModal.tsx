import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, X, Check, AlertCircle, Sparkles, Shield, Trash2 } from 'lucide-react';
import { getClientGeminiApiKey, setClientGeminiApiKey } from '../services/geminiClient';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [inputKey, setInputKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim() || '';
  const currentKey = getClientGeminiApiKey();
  const isUsingEnv = Boolean(envKey && currentKey === envKey);
  const isUsingLocal = Boolean(!isUsingEnv && currentKey);

  useEffect(() => {
    if (isOpen) {
      try {
        const localVal = localStorage.getItem('lexicurve_gemini_api_key') || '';
        setInputKey(localVal);
      } catch {
        setInputKey('');
      }
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setClientGeminiApiKey(inputKey.trim());
    setSavedSuccess(true);
    onKeyUpdated();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setClientGeminiApiKey('');
    setInputKey('');
    onKeyUpdated();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-200"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Gemini API 設定</h3>
                <p className="text-xs text-slate-400">直接ブラウザからGoogle Geminiを呼び出します</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            {/* Status notification */}
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              currentKey 
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
            }`}>
              {currentKey ? (
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              )}
              <div className="leading-relaxed">
                {isUsingEnv ? (
                  <>
                    <strong className="text-white block font-medium">環境変数から連携中</strong>
                    <code className="text-[11px] font-mono bg-slate-800 px-1 py-0.5 rounded text-emerald-200">
                      VITE_GEMINI_API_KEY
                    </code>{' '}
                    が検出され、リアルタイムAI分析が有効です。
                  </>
                ) : isUsingLocal ? (
                  <>
                    <strong className="text-white block font-medium">ローカル入力キーで連携中</strong>
                    ブラウザに保存されたAPIキーを使用して直接Gemini APIを呼び出します。
                  </>
                ) : (
                  <>
                    <strong className="text-white block font-medium">キー未設定（自動フォールバック稼働中）</strong>
                    APIキーがなくてもエラーで止まることなく、高精度なリアルタイム架空データシミュレーションでベルカーブ上に即時追加されます。
                  </>
                )}
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">
                  Gemini API キー（ローカル入力）:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                  />
                  {inputKey && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-rose-400 cursor-pointer p-1"
                      title="クリア"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400 leading-normal">
                  ※ ブラウザのローカル（LocalStorage）にのみ安全に保存されます。未入力の場合は自動シミュレーターが動きます。
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Client-Side API</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    閉じる
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-500/20"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>保存完了</span>
                      </>
                    ) : (
                      <span>保存する</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
