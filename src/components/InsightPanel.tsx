import React from 'react';
import { 
  Gauge, 
  Clock, 
  Users, 
  Compass, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { TermData } from '../types';
import { STAGES } from '../data/stages';
import { AudienceSafetyCard } from './AudienceSafetyCard';

interface InsightPanelProps {
  term: TermData;
}

export const InsightPanel: React.FC<InsightPanelProps> = ({ term }) => {
  const [copied, setCopied] = React.useState(false);
  const { insights } = term;
  const stageId = (term.stage || (term as any).phase || 'innovator');
  const stage = STAGES[stageId] || STAGES.innovator;

  const handleCopySummary = () => {
    const text = `【${term.name}】（現在：${stage.name} / 通じる度：${insights.comprehensionScore}%）\n誕生：${term.firstAppearedYear}年（旅した日数：${insights.daysTraveled.toLocaleString()}日）\n推定到達層：${insights.targetAudience}\n詳細：${term.summary} #LexiCurve`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color logic for comprehension score
  const getScoreColor = (score: number) => {
    if (score < 30) return { text: 'text-cyan-400', stroke: '#06b6d4', label: '先鋭・専門ギーク限定' };
    if (score < 60) return { text: 'text-violet-400', stroke: '#8b5cf6', label: '業界・感度の高い実務者層' };
    if (score < 85) return { text: 'text-emerald-400', stroke: '#10b981', label: '一般ビジネスパーソン層' };
    return { text: 'text-amber-400', stroke: '#f59e0b', label: '社会全体の一般常識' };
  };

  const scoreInfo = getScoreColor(insights.comprehensionScore);

  // Risk badge styling
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case '理解されない':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case '意識高いと見られる':
        return 'bg-violet-500/15 text-violet-300 border-violet-500/30';
      case '一般常識':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case '今更感':
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getChasmText = (status: string) => {
    switch (status) {
      case 'before':
        return { label: 'キャズム手前', desc: '熱心なファン層で醸成中', color: 'text-cyan-300' };
      case 'crossing':
        return { label: 'キャズム突破に挑戦中', desc: '実用化の壁と格闘中', color: 'text-rose-400' };
      case 'crossed':
        return { label: 'キャズム突破済み', desc: '実用主義者への普及加速', color: 'text-emerald-300' };
      case 'settled':
        return { label: '完全定着', desc: '生活・業務の所与のインフラ', color: 'text-slate-300' };
      default:
        return { label: '通常推移', desc: '段階的に拡大中', color: 'text-slate-300' };
    }
  };

  const chasmInfo = getChasmText(insights.chasmStatus);

  // Circular gauge calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (insights.comprehensionScore / 100) * circumference;

  return (
    <div className="bg-[#0d1117] rounded-2xl border border-slate-800/80 p-5 sm:p-6 shadow-xl flex flex-col justify-between h-full">
      <div>
        {/* Panel Title & Share */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-indigo-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              浸透度インサイト (Insights)
            </h4>
          </div>

          <button
            id="copy-insight-btn"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
            title="分析サマリーをクリップボードにコピー"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">コピー完了</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>サマリー共有</span>
              </>
            )}
          </button>
        </div>

        {/* 1. Score Meter & Days Traveled */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Comprehension Gauge */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3.5 flex flex-col items-center justify-center text-center">
            <div className="relative w-20 h-20 flex items-center justify-center mb-1">
              <svg className="w-20 h-20 -rotate-90 transform">
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="#1e293b"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke={scoreInfo.stroke}
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-xl font-extrabold font-mono ${scoreInfo.text}`}>
                  {insights.comprehensionScore}
                  <span className="text-xs">%</span>
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-200">通じる度スコア</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{scoreInfo.label}</span>
          </div>

          {/* Days Traveled */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>旅した日数</span>
              <Clock className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <div className="my-1">
              <div className="text-2xl font-black text-white font-mono tracking-tight">
                {insights.daysTraveled.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1">日</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                初出：<strong className="text-slate-200">{term.firstAppearedYear}年</strong>
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-800/70 text-[10px] text-indigo-300 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>源流から現在までの道のり</span>
            </div>
          </div>
        </div>

        {/* 2. Target Audience */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              推定到達層
            </span>
            <span className="text-[10px] font-mono text-slate-500">Target Segment</span>
          </div>
          <p className="text-xs font-bold text-slate-100">
            {insights.targetAudience}
          </p>
        </div>

        {/* 3. Chasm Status */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Compass className="w-3.5 h-3.5 text-rose-400" />
              キャズム到達状況
            </span>
            <span className={`text-[11px] font-bold ${chasmInfo.color}`}>
              {chasmInfo.label}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {chasmInfo.desc}
          </p>
        </div>

        {/* 4. Recommended Usage Context & Risk */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium">推奨使用シーン</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRiskBadge(insights.riskLevel)}`}>
              リスク評価: {insights.riskLevel}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {insights.recommendedContext}
          </p>
        </div>

        {/* 5. Audience Safety Checker */}
        {term.audienceSafety && (
          <div className="mt-3">
            <AudienceSafetyCard safety={term.audienceSafety} termName={term.name} />
          </div>
        )}
      </div>

      {/* Tip footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/70 text-[11px] text-slate-500 leading-tight">
        💡 言葉を口にする相手の層（イノベーター〜マジョリティ）を見極めて使うことで、知的な共通言語としての効果が最大化します。
      </div>
    </div>
  );
};
