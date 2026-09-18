import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, 
  X, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Cpu, 
  Trash2, 
  ExternalLink,
  Layers,
  Edit3
} from 'lucide-react';
import { 
  getClientGeminiApiKey, 
  setClientGeminiApiKey, 
  getClientGeminiModel, 
  setClientGeminiModel, 
  AVAILABLE_GEMINI_MODELS 
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
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelName, setCustomModelName] = useState('');
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

      const activeModel = getClientGeminiModel();
      const isPreset = AVAILABLE_GEMINI_MODELS.some((m) => m.id === activeModel);
      if (isPreset) {
        setSelectedModel(activeModel);
        setIsCustomModel(false);
        setCustomModelName('');
      } else {
        setSelectedModel('custom');
        setIsCustomModel(true);
        setCustomModelName(activeModel);
      }

      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectModel = (modelId: string) => {
    if (modelId === 'custom') {
      setIsCustomModel(true);
      setSelectedModel('custom');
    } else {
      setIsCustomModel(false);
      setSelectedModel(modelId);
      setClientGeminiModel(modelId);
      onKeyUpdated();
    }
  };

  const handleCustomModelSave = () => {
    if (customModelName.trim()) {
      setClientGeminiModel(customModelName.trim());
      onKeyUpdated();
    }
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    setClientGeminiApiKey(inputKey.trim());
    
    if (isCustomModel && customModelName.trim()) {
      setClientGeminiModel(customModelName.trim());
    } else if (!isCustomModel) {
      setClientGeminiModel(selectedModel);
    }

    setSavedSuccess(true);
    onKeyUpdated();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
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
          className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-200 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Gemini モデル設定 & API連携</h3>
                <p className="text-xs text-slate-400">利用時期に応じたモデルの選択とAPIキー設定</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="mt-4 space-y-5 overflow-y-auto pr-1 flex-1 text-xs">
            {/* 1. Model Selector Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>使用するGeminiモデル（時期・世代別）</span>
                </label>
                <span className="text-[11px] text-indigo-300 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  現在: {isCustomModel ? customModelName || 'カスタム' : selectedModel}
                </span>
              </div>

              <div className="space-y-2">
                {AVAILABLE_GEMINI_MODELS.map((m) => {
                  const isChecked = !isCustomModel && selectedModel === m.id;
                  return (
                    <label
                      key={m.id}
                      onClick={() => handleSelectModel(m.id)}
                      className={`block p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="gemini-model"
                            checked={isChecked}
                            onChange={() => handleSelectModel(m.id)}
                            className="accent-indigo-500 cursor-pointer"
                          />
                          <span className="font-bold text-white text-[13px]">{m.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {m.era}
                          </span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          m.recommended 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] pl-5 leading-relaxed">
                        {m.description}
                      </p>
                    </label>
                  );
                })}

                {/* Custom Model Option */}
                <label
                  onClick={() => handleSelectModel('custom')}
                  className={`block p-3 rounded-xl border transition-all cursor-pointer ${
                    isCustomModel
                      ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gemini-model"
                        checked={isCustomModel}
                        onChange={() => handleSelectModel('custom')}
                        className="accent-indigo-500 cursor-pointer"
                      />
                      <span className="font-bold text-white text-[13px] flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        カスタムモデル指定
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      将来の新モデル自由指定
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] pl-5 leading-relaxed">
                    今後Googleから発表される新モデルやプレビュー版（例: gemini-3.0-flash など）を直接文字列で指定して利用できます。
                  </p>

                  {isCustomModel && (
                    <div className="mt-2 pl-5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        placeholder="例: gemini-3.0-flash"
                        value={customModelName}
                        onChange={(e) => {
                          setCustomModelName(e.target.value);
                          setClientGeminiModel(e.target.value);
                          onKeyUpdated();
                        }}
                        onBlur={handleCustomModelSave}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-indigo-500/50 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* 2. API Key Section */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="font-semibold text-slate-200 flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-indigo-400" />
                  Gemini API キー
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
                >
                  <span>Google AI Studioでキーを取得</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>

              {/* Status Badge */}
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 mb-3 ${
                currentKey 
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
              }`}>
                {currentKey ? (
                  <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                )}
                <span className="leading-tight text-[11px]">
                  {isUsingEnv ? (
                    <>環境変数 <code className="bg-slate-800 px-1 py-0.5 rounded font-mono text-emerald-200">VITE_GEMINI_API_KEY</code> から適用中</>
                  ) : isUsingLocal ? (
                    <>ブラウザのLocalStorageに保存されたキーで連携中</>
                  ) : (
                    <>APIキーが未入力です。単語分析やスキャンを行うにはキーを入力してください。</>
                  )}
                </span>
              </div>

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
                    onClick={handleClearKey}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-rose-400 cursor-pointer p-1"
                    title="キーを消去"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                ※ APIキーはブラウザ内部（LocalStorage）にのみ安全に保持され、外部サーバーへは送信されません。
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs"
            >
              閉じる
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer text-xs shadow-md shadow-indigo-500/20"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>設定を保存しました</span>
                </>
              ) : (
                <span>設定を保存</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
