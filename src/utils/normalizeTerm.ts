import { TermData, CategoryId, StageId } from '../types';
import { STAGES } from '../data/stages';
import { generateAnalyzedTerm } from './termGenerator';

/**
 * Normalizes any raw term data from AI responses or search results
 * to ensure all mandatory bell curve mapping properties are present,
 * valid, and strictly typed.
 */
export function normalizeTermData(raw: any, fallbackName: string): TermData {
  const name = String(raw?.name || raw?.title || fallbackName || '').trim() || '名称未設定';
  const id = String(
    raw?.id || `term-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  );

  // 1. Calculate and sanitize stageProgress (X coordinate on bell curve, 0-100)
  let rawProgress = raw?.stageProgress ?? raw?.score ?? raw?.position ?? raw?.progress;
  if (typeof rawProgress === 'string') {
    rawProgress = parseFloat(rawProgress.replace(/[^0-9.]/g, ''));
  }
  let stageProgress = 
    typeof rawProgress === 'number' && Number.isFinite(rawProgress)
      ? Math.max(4, Math.min(96, Math.round(rawProgress)))
      : 26;

  // 2. Normalize stage / phase
  let stageStr = String(raw?.stage || raw?.phase || '').toLowerCase().replace(/[\s-]+/g, '_');
  let stage: StageId = 'early_adopter';

  if (stageStr.includes('innovat')) {
    stage = 'innovator';
  } else if (stageStr.includes('adopter')) {
    stage = 'early_adopter';
  } else if (stageStr.includes('early_maj') || stageStr.includes('earlymaj')) {
    stage = 'early_majority';
  } else if (stageStr.includes('late_maj') || stageStr.includes('latemaj')) {
    stage = 'late_majority';
  } else if (stageStr.includes('laggard')) {
    stage = 'laggard';
  } else {
    // Derive stage from progress
    if (stageProgress < 18) stage = 'innovator';
    else if (stageProgress < 35) stage = 'early_adopter';
    else if (stageProgress < 63) stage = 'early_majority';
    else if (stageProgress < 85) stage = 'late_majority';
    else stage = 'laggard';
  }

  // 3. Normalize category
  let catStr = String(raw?.category || '').toLowerCase();
  let category: CategoryId = 'culture';
  let categoryLabel = 'カルチャー・若者言葉';

  if (catStr.includes('ai') || catStr.includes('tech') || catStr.includes('cpu') || catStr.includes('llm') || catStr.includes('gpt')) {
    category = 'ai';
    categoryLabel = 'AI・テクノロジー';
  } else if (catStr.includes('prod') || catStr.includes('hack') || catStr.includes('life') || catStr.includes('task') || catStr.includes('note')) {
    category = 'productivity';
    categoryLabel = '生産性・ライフハック';
  } else if (catStr.includes('bus') || catStr.includes('work') || catStr.includes('biz') || catStr.includes('dx') || catStr.includes('manage')) {
    category = 'business';
    categoryLabel = 'ビジネス・働き方';
  }

  const nearChasm = Boolean(
    raw?.nearChasm ?? (stageProgress >= 28 && stageProgress <= 38)
  );

  // Fallback term template for journey and metrics
  const fallback = generateAnalyzedTerm(name);

  const term: any = {
    id,
    name,
    title: name,
    reading: raw?.reading || name,
    category,
    categoryLabel: raw?.categoryLabel || categoryLabel,
    stage,
    phase: stage,
    stageProgress,
    score: stageProgress,
    position: stageProgress,
    nearChasm,
    summary: raw?.summary || fallback.summary,
    definition: raw?.definition || fallback.definition,
    firstAppearedYear: Number(raw?.firstAppearedYear) || fallback.firstAppearedYear,
    tags: Array.isArray(raw?.tags) && raw.tags.length > 0 
      ? raw.tags 
      : [categoryLabel, STAGES[stage]?.name || stage, 'AI解析'],
    isCustom: true,
    isTrending: Boolean(raw?.isTrending),
    journey: Array.isArray(raw?.journey) && raw.journey.length >= 4 
      ? raw.journey 
      : fallback.journey,
    insights: raw?.insights && typeof raw.insights.comprehensionScore === 'number'
      ? {
          comprehensionScore: Math.min(100, Math.max(0, Math.round(raw.insights.comprehensionScore))),
          daysTraveled: Number(raw.insights.daysTraveled) || fallback.insights.daysTraveled,
          targetAudience: raw.insights.targetAudience || fallback.insights.targetAudience,
          chasmStatus: raw.insights.chasmStatus || (nearChasm ? 'crossing' : stageProgress < 35 ? 'before' : 'crossed'),
          recommendedContext: raw.insights.recommendedContext || fallback.insights.recommendedContext,
          riskLevel: raw.insights.riskLevel || (stageProgress < 35 ? '意識高いと見られる' : '一般常識'),
        }
      : fallback.insights,
    audienceSafety: raw?.audienceSafety || fallback.audienceSafety,
    semanticShift: raw?.semanticShift || fallback.semanticShift,
  };

  return term as TermData;
}
