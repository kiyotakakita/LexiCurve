import { Category, StageInfo, StageId, CategoryId } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'すべて', iconName: 'Compass', color: 'indigo' },
  { id: 'productivity', name: '生産性・ライフハック', iconName: 'Zap', color: 'emerald' },
  { id: 'ai', name: 'AI・テクノロジー', iconName: 'Cpu', color: 'cyan' },
  { id: 'business', name: 'ビジネス・働き方', iconName: 'Briefcase', color: 'amber' },
  { id: 'culture', name: 'カルチャー・若者言葉', iconName: 'Sparkles', color: 'pink' },
];

export const STAGES: Record<StageId, StageInfo> = {
  innovator: {
    id: 'innovator',
    name: 'イノベーター',
    nameEn: 'Innovators',
    percentage: '2.5%',
    description: '冒険的で技術への好奇心が極めて高い層。未完成でも自ら試す実験者たち。',
    color: '#06b6d4', // Cyan
    borderColor: 'rgba(6, 182, 212, 0.4)',
    bgGradient: 'from-cyan-500/15 to-transparent',
    rangeX: [4, 18],
  },
  early_adopter: {
    id: 'early_adopter',
    name: 'アーリーアダプター',
    nameEn: 'Early Adopters',
    percentage: '13.5%',
    description: 'オピニオンリーダー層。実用性と先進性を見極め、コミュニティに発信する。',
    color: '#8b5cf6', // Violet
    borderColor: 'rgba(139, 92, 246, 0.4)',
    bgGradient: 'from-violet-500/15 to-transparent',
    rangeX: [18, 35],
  },
  early_majority: {
    id: 'early_majority',
    name: 'アーリーマジョリティ',
    nameEn: 'Early Majority',
    percentage: '34.0%',
    description: '慎重派の実用主義者。キャズムを越えて周囲が使い始めた確信を得てから導入。',
    color: '#10b981', // Emerald
    borderColor: 'rgba(16, 185, 129, 0.4)',
    bgGradient: 'from-emerald-500/15 to-transparent',
    rangeX: [37, 63],
  },
  late_majority: {
    id: 'late_majority',
    name: 'レイトマジョリティ',
    nameEn: 'Late Majority',
    percentage: '34.0%',
    description: '保守的なフォロワー層。業界標準や世間の過半数が採用して初めて定着。',
    color: '#f59e0b', // Amber
    borderColor: 'rgba(245, 158, 11, 0.4)',
    bgGradient: 'from-amber-500/15 to-transparent',
    rangeX: [63, 85],
  },
  laggard: {
    id: 'laggard',
    name: 'ラガード',
    nameEn: 'Laggards',
    percentage: '16.0%',
    description: '伝統派・変化に極めて懐疑的な層。生活インフラとして不可避になってから受容。',
    color: '#64748b', // Slate
    borderColor: 'rgba(100, 116, 139, 0.4)',
    bgGradient: 'from-slate-500/15 to-transparent',
    rangeX: [85, 96],
  },
};

// Chasm boundary position (X % on the curve)
export const CHASM_X_PERCENT = 35.5;
