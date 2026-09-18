import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, 
  X, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Cpu, 
  Trash2, 
  ExternalLink,
  Save
} from 'lucide-react';
import { 
  getClientGeminiApiKey, 
  setClientGeminiApiKey, 
  getClientGeminiModel, 
  setClientGeminiModel, 
  PRESET_GEMINI_MODELS 
} from '../services/geminiClient';

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
  const [selectedDropdown, setSelectedDropdown] = useState('gemini-flash-latest');
  const [customModelInput, setCustomModelInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim() || '';
  const currentKey = getClientGeminiApiKey();
  const isUsingEnv = Boolean(envKey && currentKey === envKey);
  const isUsingLocal = Boolean(!isUsingEnv && currentKey);

  useEffect(() => {
    if (isOpen) {
      // 1. Load API Key
      try {
        const localKey = localStorage.getItem('lexicurve_gemini_api_key') || '';
        setInputKey(localKey);
      } catch {
        setInputKey('');
      }

      // 2. Load Model
      const activeModel = getClientGeminiModel();
      const isPreset = PRESET_GEMINI_MODELS.some((m) => m.id === activeModel);
      if (isPreset) {
        setSelectedDropdown(activeModel);
        setCustomModelInput('');
      } else {
        setSelectedDropdown('custom');
        setCustomModelInput(activeModel);
      }

      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 1. Save API Key
    setClientGeminiApiKey(inputKey.trim());

    // 2. Save Model
    if (selectedDropdown === 'custom') {
      const modelToSave = customModelInput.trim() || 'gemini-flash-latest';
      setClientGeminiModel(modelToSave);
    } else {
      setClientGeminiModel(selectedDropdown);
    }

    onKeyUpdated();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClearKey = () => {
    setClientGeminiApiKey('');
    setInputKey('');
    onKeyUpdated();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-200 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Gemini API & モデル設定</h3>
                <p className="text-xs text-slate-400">使用するモデルの選択とAPIキー設定</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-4 space-y-5 overflow-y-auto pr-1 flex-1 text-xs">
            {/* 1. Gemini Model Selector Dropdown */}
            <div>
              <label 
                htmlFor="gemini-model-select"
                className="block font-semibold text-slate-200 mb-1.5 text-xs"
              >
                使用するGeminiモデル（ドロップダウン選択）
              </label>
              <div className="relative">
                <select
                  id="gemini-model-select"
                  value={selectedDropdown}
                  onChange={(e) => {
                    setSelectedDropdown(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="gemini-flash-latest">gemini-flash-latest（推奨：常に最新に追従）</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-3.7-flash">gemini-3.7-flash</option>
                  <option value="custom">自由入力（カスタム）...</option>
                </select>
              </div>

              {/* Custom Model Input if 'custom' is selected */}
              {selectedDropdown === 'custom' && (
                <div className="mt-2.5 pl-0.5">
                  <label htmlFor="custom-model-input" className="block text-[11px] text-slate-400 mb-1">
                    任意のモデル名を入力してください：
                  </label>
                  <input
                    id="custom-model-input"
                    type="text"
                    placeholder="例: gemini-3.0-flash"
                    value={customModelInput}
                    onChange={(e) => setCustomModelInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-indigo-500/60 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="mt-1 text-[10px] text-slate-500">
                    エンドポイント: <code>https://generativelanguage.googleapis.com/v1beta/models/{customModelInput || '{model}'}:generateContent</code>
                  </p>
                </div>
              )}

              <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
                ※ 選択したモデルは localStorage に保存され、APIリクエスト時のエンドポイントURLに動的に反映されます。
              </p>
            </div>

            {/* 2. API Key Section */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="gemini-api-key-input"
                  className="font-semibold text-slate-200 flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Gemini API キー</span>
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
                >
                  <span>APIキー取得 (Google AI Studio)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Key status indicator */}
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 mb-2.5 ${
                currentKey 
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              }`}>
                {currentKey ? (
                  <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span className="leading-tight text-[11px]">
                  {isUsingEnv ? (
                    <>環境変数 <code className="bg-slate-800 px-1 py-0.5 rounded font-mono text-emerald-200">VITE_GEMINI_API_KEY</code> を使用中</>
                  ) : isUsingLocal ? (
                    <>ブラウザ（LocalStorage）にキーが設定されています</>
                  ) : (
                    <strong className="text-rose-300">APIキーが設定されていません。下記フォームに入力して保存してください。</strong>
                  )}
                </span>
              </div>

              <div className="relative">
                <input
                  id="gemini-api-key-input"
                  type="password"
                  placeholder="AIzaSy..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                {inputKey && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-rose-400 cursor-pointer p-1"
                    title="キーを消去"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                ※ 入力されたキーはブラウザ内のみに保存され、Google Gemini APIサーバーへの通信時のみ使用されます。
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs"
              >
                キャンセル
              </button>

              <button
                type="submit"
                id="save-api-key-btn"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer text-xs shadow-md shadow-indigo-500/20"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>設定を保存しました</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>設定を保存</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
