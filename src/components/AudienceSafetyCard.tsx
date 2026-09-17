import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Briefcase, 
  Terminal, 
  MessageSquareQuote, 
  Copy, 
  Check, 
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { AudienceSafety } from '../types';

interface AudienceSafetyCardProps {
  safety?: AudienceSafety;
  termName: string;
}

export const AudienceSafetyCard: React.FC<AudienceSafetyCardProps> = ({ safety, termName }) => {
  const [copied, setCopied] = useState(false);

  if (!safety) {
    return null;
  }

  const { executiveClient, techInternal, paraphraseSuggestion } = safety;

  const handleCopySentence = () => {
    navigator.clipboard.writeText(paraphraseSuggestion.exampleSentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: 'safe' | 'caution' | 'danger', label: string) => {
    switch (status) {
      case 'safe':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{label}</span>
          </span>
        );
      case 'caution':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{label}</span>
          </span>
        );
      case 'danger':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>{label}</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              通じる度チェッカー (Audience Safety)
            </h4>
            <span className="text-[10px] text-slate-400">
              相手別の会話リスク判定 ＆ 言い換え処方箋
            </span>
          </div>
        </div>
      </div>

      {/* Target Audiences Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. 役員・クライアント向け */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${
          executiveClient.status === 'danger'
            ? 'bg-rose-950/20 border-rose-500/30'
            : (executiveClient.status === 'caution'
              ? 'bg-amber-950/20 border-amber-500/30'
              : 'bg-emerald-950/20 border-emerald-500/30')
        }`}>
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                役員・クライアント向け
              </span>
              {getStatusBadge(executiveClient.status, executiveClient.statusLabel)}
            </div>

            {/* Confusion probability bar */}
            <div className="space-y-1 mb-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">キョトンとされる確率:</span>
                <span className={`font-mono font-bold ${
                  executiveClient.confusionProbability > 60 
                    ? 'text-rose-400' 
                    : (executiveClient.confusionProbability > 30 ? 'text-amber-400' : 'text-emerald-400')
                }`}>
                  {executiveClient.confusionProbability}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    executiveClient.confusionProbability > 60 
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                      : (executiveClient.confusionProbability > 30 ? 'bg-amber-500' : 'bg-emerald-500')
                  }`}
                  style={{ width: `${executiveClient.confusionProbability}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {executiveClient.advice}
            </p>
          </div>
        </div>

        {/* 2. 社内テック界隈向け */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${
          techInternal.status === 'danger'
            ? 'bg-rose-950/20 border-rose-500/30'
            : (techInternal.status === 'caution'
              ? 'bg-amber-950/20 border-amber-500/30'
              : 'bg-indigo-950/25 border-indigo-500/30')
        }`}>
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                社内テック・開発陣向け
              </span>
              {getStatusBadge(techInternal.status, techInternal.statusLabel)}
            </div>

            <div className="text-[11px] text-slate-400 mb-1.5">
              技術的コンテキスト理解: <span className="text-indigo-300 font-medium">高感度</span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {techInternal.advice}
            </p>
          </div>
        </div>
      </div>

      {/* 3. 言い換えの提案 (Paraphrase Suggestion) */}
      <div className="bg-black/40 border border-indigo-500/25 rounded-lg p-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>おすすめの「言い換え表現」</span>
          </div>
          <button
            onClick={handleCopySentence}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="例文をコピー"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">コピー完了</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>例文コピー</span>
              </>
            )}
          </button>
        </div>

        {/* Plain Term */}
        <div className="text-xs text-slate-200 mb-2">
          <span className="text-slate-400 mr-1.5">平易な置換語:</span>
          <strong className="text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
            {paraphraseSuggestion.plainTerm}
          </strong>
        </div>

        {/* Example Sentence */}
        <div className="bg-slate-900/90 rounded border border-slate-800 p-2 text-[11px] text-slate-300 font-mono italic leading-relaxed flex items-start gap-1.5">
          <MessageSquareQuote className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <span>"{paraphraseSuggestion.exampleSentence}"</span>
        </div>
      </div>
    </div>
  );
};
