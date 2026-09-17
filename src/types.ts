export type CategoryId = 'all' | 'productivity' | 'ai' | 'business' | 'culture';

export interface Category {
  id: CategoryId;
  name: string;
  iconName: string;
  color: string;
}

export type StageId = 
  | 'innovator' 
  | 'early_adopter' 
  | 'early_majority' 
  | 'late_majority' 
  | 'laggard';

export interface StageInfo {
  id: StageId;
  name: string;
  nameEn: string;
  percentage: string;
  description: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  rangeX: [number, number]; // Percentage on curve 0 - 100
}

export interface JourneyStep {
  phase: 'origin' | 'spread' | 'border_crossing' | 'mainstream';
  phaseTitle: string; // e.g. "【水源（誕生）】"
  year: string;
  platform: string;
  platformIcon?: string;
  title: string;
  description: string;
  keyArtifact: string; // e.g., "海外ブログ記事「Interstitial Journaling: A Productivity Tactic」"
}

export interface InsightMetrics {
  comprehensionScore: number; // 0 - 100 ("通じる度スコア")
  daysTraveled: number; // e.g. 1840 ("旅した日数")
  targetAudience: string; // e.g. "個人開発者・先鋭ノーション使い"
  chasmStatus: 'before' | 'crossing' | 'crossed' | 'settled';
  recommendedContext: string; // e.g. "社内Slackの雑談ch、テックカンファレンス"
  riskLevel: '理解されない' | '意識高いと見られる' | '一般常識' | '今更感';
}

export interface AudienceSafety {
  executiveClient: {
    status: 'safe' | 'caution' | 'danger'; // 🟢 安全 / 🟡 要言い換え / 🔴 通じない
    statusLabel: string;
    confusionProbability: number; // e.g. 75 (%)
    advice: string;
  };
  techInternal: {
    status: 'safe' | 'caution' | 'danger';
    statusLabel: string;
    advice: string;
  };
  paraphraseSuggestion: {
    plainTerm: string; // e.g. "社内マニュアルをAIに参照させる仕組み"
    exampleSentence: string; // e.g. 役員報告での言い換え例
  };
}

export interface SemanticShift {
  originalMeaning: string; // 発祥当初の原義（海外コミュニティで生まれた時の使われ方）
  originalContext: string; // 背景や当時の使われ方
  currentNuance: string;   // 日本・現在でのニュアンス（輸入されてどう変化・拡大したか）
  shiftHighlight: string;  // 「歪み」やギャップのポイント
}

export interface TermData {
  id: string;
  name: string;
  reading?: string;
  category: CategoryId;
  categoryLabel: string;
  stage: StageId;
  stageProgress: number; // 0 to 100 across the whole curve
  nearChasm?: boolean; // true if right in front of or inside chasm
  summary: string;
  definition: string;
  firstAppearedYear: number;
  journey: JourneyStep[];
  insights: InsightMetrics;
  audienceSafety?: AudienceSafety;
  semanticShift?: SemanticShift;
  tags: string[];
  isCustom?: boolean;
}
