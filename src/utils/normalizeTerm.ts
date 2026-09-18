import { TermData, CategoryId, StageId } from '../types';
import { STAGES } from '../data/stages';

/**
 * Normalizes any raw term data from Gemini AI responses
 * to ensure all mandatory bell curve mapping properties are present,
 * flexible to field naming variations, and strictly typed.
 */
export function normalizeTermData(raw: any, fallbackName = '新着ワード'): TermData {
  // 1. Flexible word name resolution: name || word || title || term || fallbackName
  const name = String(
    raw?.name || raw?.word || raw?.title || raw?.term || fallbackName || ''
  ).trim() || '新着ワード';

  const id = String(
    raw?.id || `term-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  );

  // 2. Flexible description resolution: description || explanation || summary || definition
  const description = String(
    raw?.description || raw?.explanation || raw?.summary || raw?.definition || ''
  ).trim();

  // 3. Flexible category resolution: category || genre || "AI・テクノロジー"
  const rawCat = String(raw?.category || raw?.genre || 'AI・テクノロジー').trim();
  const catLower = rawCat.toLowerCase();

  let category: CategoryId = 'ai';
  let categoryLabel = 'AI・テクノロジー';

  if (
    rawCat.includes('生産性') ||
    rawCat.includes('ライフハック') ||
    rawCat.includes('効率') ||
    catLower.includes('prod') ||
    catLower.includes('hack') ||
    catLower.includes('life')
  ) {
    category = 'productivity';
    categoryLabel = '生産性・ライフハック';
  } else if (
    rawCat.includes('ビジネス') ||
    rawCat.includes('働き方') ||
    rawCat.includes('業務') ||
    rawCat.includes('キャリア') ||
    catLower.includes('bus') ||
    catLower.includes('work') ||
    catLower.includes('biz')
  ) {
    category = 'business';
    categoryLabel = 'ビジネス・働き方';
  } else if (
    rawCat.includes('カルチャー') ||
    rawCat.includes('若者言葉') ||
    rawCat.includes('スラング') ||
    rawCat.includes('ミーム') ||
    rawCat.includes('流行語') ||
    catLower.includes('cult') ||
    catLower.includes('slang')
  ) {
    category = 'culture';
    categoryLabel = 'カルチャー・若者言葉';
  } else if (
    rawCat.includes('AI') ||
    rawCat.includes('テクノロジー') ||
    rawCat.includes('人工知能') ||
    catLower.includes('ai') ||
    catLower.includes('tech') ||
    catLower.includes('cpu') ||
    catLower.includes('llm') ||
    catLower.includes('gpt')
  ) {
    category = 'ai';
    categoryLabel = 'AI・テクノロジー';
  } else {
    // Default as instructed: "AI・テクノロジー"
    category = 'ai';
    categoryLabel = 'AI・テクノロジー';
  }

  // 4. Calculate and sanitize stageProgress (X coordinate on bell curve, 0-100)
  let rawProgress = raw?.score ?? raw?.stageProgress ?? raw?.position ?? raw?.progress;
  if (typeof rawProgress === 'string') {
    rawProgress = parseFloat(rawProgress.replace(/[^0-9.]/g, ''));
  }
  let stageProgress = 
    typeof rawProgress === 'number' && Number.isFinite(rawProgress)
      ? Math.max(4, Math.min(96, Math.round(rawProgress)))
      : 20;

  // 5. Normalize stage / phase
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
    // Derive stage from score/progress
    if (stageProgress < 17) stage = 'innovator';
    else if (stageProgress < 35) stage = 'early_adopter';
    else if (stageProgress < 68) stage = 'early_majority';
    else if (stageProgress < 85) stage = 'late_majority';
    else stage = 'laggard';
  }

  const nearChasm = Boolean(
    raw?.nearChasm ?? (stageProgress >= 25 && stageProgress <= 36)
  );

  const term: any = {
    id,
    name,
    title: name,
    reading: raw?.reading || name,
    category,
    categoryLabel,
    stage,
    phase: stage,
    stageProgress,
    score: stageProgress,
    position: stageProgress,
    nearChasm,
    summary: description || raw?.summary || `${name}に関する概念と社会学的普及度`,
    definition: description || raw?.definition || `${name}の定義`,
    firstAppearedYear: Number(raw?.firstAppearedYear) || new Date().getFullYear(),
    tags: Array.isArray(raw?.tags) && raw.tags.length > 0 
      ? raw.tags 
      : [categoryLabel, STAGES[stage]?.name || stage, 'Gemini分析'],
    isCustom: true,
    isTrending: Boolean(raw?.isTrending),
    journey: Array.isArray(raw?.journey) && raw.journey.length > 0
      ? raw.journey
      : [
          {
            phase: 'origin',
            phaseTitle: '【水源（誕生）】',
            year: `${new Date().getFullYear() - 1}年`,
            platform: 'コミュニティ・開発者フォーラム',
            title: `${name}の提唱`,
            description: `${name}という概念が最初に議論・提案された初期フェーズ。`,
            keyArtifact: `${name}の初期投稿・議論`,
          },
          {
            phase: 'spread',
            phaseTitle: '【合流（拡散）】',
            year: `${new Date().getFullYear()}年`,
            platform: 'SNS (X, Reddit, Hacker News)',
            title: 'アーリーアダプター層での拡散',
            description: `先鋭層やインフルエンサーによって注目度が高まり急拡散。`,
            keyArtifact: 'バイラル投稿や関連記事',
          },
          {
            phase: 'border_crossing',
            phaseTitle: '【国境越え（翻訳）】',
            year: `${new Date().getFullYear()}年`,
            platform: '国内テックメディア・note・Zenn',
            title: '日本語圏への上陸・検証',
            description: `日本国内の実務者やコミュニティで紹介され検証が進む。`,
            keyArtifact: '解説記事や検証レポート',
          },
          {
            phase: 'mainstream',
            phaseTitle: '【大河（現在地）】',
            year: '現在',
            platform: 'ビジネス実務・メディア特集',
            title: `現在地（普及度: ${stageProgress}%）`,
            description: description || `${name}の現在の社会・業務での活用状況。`,
            keyArtifact: '市場動向・言及トレンド',
          },
        ],
    insights: raw?.insights && typeof raw.insights.comprehensionScore === 'number'
      ? {
          comprehensionScore: Math.min(100, Math.max(0, Math.round(raw.insights.comprehensionScore))),
          daysTraveled: Number(raw.insights.daysTraveled) || 60,
          targetAudience: raw.insights.targetAudience || '先端層・ビジネス層',
          chasmStatus: raw.insights.chasmStatus || (nearChasm ? 'crossing' : stageProgress < 35 ? 'before' : 'crossed'),
          recommendedContext: raw.insights.recommendedContext || '業界動向分析',
          riskLevel: raw.insights.riskLevel || (stageProgress < 35 ? '意識高いと見られる' : '一般常識'),
        }
      : {
          comprehensionScore: Math.round(stageProgress * 0.9),
          daysTraveled: 60,
          targetAudience: stageProgress < 20 ? '先端エンジニア・研究層' : stageProgress < 40 ? 'アーリーアダプター層' : '一般ビジネス層',
          chasmStatus: nearChasm ? 'crossing' : stageProgress < 35 ? 'before' : 'crossed',
          recommendedContext: '最新トレンド検証・社内情報共有',
          riskLevel: stageProgress < 35 ? '意識高いと見られる' : '一般常識',
        },
    audienceSafety: raw?.audienceSafety || {
      executiveClient: {
        status: stageProgress > 50 ? 'safe' : 'caution',
        statusLabel: stageProgress > 50 ? '🟢 安全' : '🟡 要言い換え',
        confusionProbability: Math.max(10, 100 - stageProgress),
        advice: '文脈に応じた平易な解説を添えて使用してください。'
      },
      techInternal: {
        status: 'safe',
        statusLabel: '🟢 通じる（推奨）',
        advice: '社内での議論や技術検討で活用可能です。'
      },
      paraphraseSuggestion: {
        plainTerm: description || name,
        exampleSentence: `${name}（${description || '新しい取り組み'}）について検討を進めています。`
      }
    },
    semanticShift: raw?.semanticShift || {
      originalMeaning: description || name,
      originalContext: '提唱された初期の文脈',
      currentNuance: '現在実務で使われている解釈',
      shiftHighlight: '普及に伴う受容の変化'
    },
  };

  return term as TermData;
}
