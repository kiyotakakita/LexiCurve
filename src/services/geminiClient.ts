// WARNING: Client-side Gemini API integration requested by user.
// Notice: Calling Gemini API directly from the client exposes the API key in browser network traffic.
// Ensure your API key is restricted or use server-side routing in production.

import { GoogleGenAI } from '@google/genai';
import { TermData } from '../types';
import { generateAnalyzedTerm } from '../utils/termGenerator';
import { CURATED_TRENDING_TERMS } from '../data/trendingTerms';
import { normalizeTermData } from '../utils/normalizeTerm';

/**
 * Retrieves the Gemini API key from import.meta.env or localStorage fallback
 */
export function getClientGeminiApiKey(): string {
  // 1. Vite environment variable
  const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();
  if (envKey) return envKey;

  // 2. Local storage if the user saved an API key in the browser
  try {
    const localKey = localStorage.getItem('lexicurve_gemini_api_key')?.trim();
    if (localKey) return localKey;
  } catch {
    // Ignore localStorage access errors (e.g. strict iframe)
  }

  return '';
}

/**
 * Sets or clears the local Gemini API key
 */
export function setClientGeminiApiKey(key: string) {
  try {
    if (key.trim()) {
      localStorage.setItem('lexicurve_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('lexicurve_gemini_api_key');
    }
  } catch {
    // Ignore
  }
}

const ANALYSIS_PROMPT_TEMPLATE = (word: string) => `あなたは新造語・バズワード・テクノロジー用語の社会学的浸透度・イノベーター理論・語源変遷の専門家アナリストです。
入力された単語「${word}」について、客観的な事実・Web上の言及トレンドに基づき、以下のJSON形式で分析結果を出力してください。

【出力要件】
必ず以下のキーを持つ有効なJSONのみを出力してください（Markdownのバッククォート \`\`\`json も不要です）：
{
  "name": "単語の正式名称（例: ${word}）",
  "reading": "読み方（カタカナまたは英語）",
  "category": "productivity" | "ai" | "business" | "culture" のいずれか1つ,
  "categoryLabel": "生産性・ライフハック" | "AI・テクノロジー" | "ビジネス・働き方" | "カルチャー・若者言葉" のいずれか,
  "stage": "innovator" | "early_adopter" | "early_majority" | "late_majority" | "laggard" のいずれか（現在の日本での普及度）,
  "stageProgress": 0から100の数値（ベルカーブ上のX座標パーセンテージ。イノベーター: 1〜15, アーリーアダプター: 16〜34, アーリーマジョリティ: 35〜67, レイトマジョリティ: 68〜84, ラガード: 85〜100）,
  "nearChasm": boolean（stageProgressが12〜25の間、つまりキャズムの溝付近ならtrue、それ以外はfalse）,
  "summary": "1行の簡潔な解説（50文字以内）",
  "definition": "概念の厳密な定義（100文字程度）",
  "firstAppearedYear": 初出年（西暦の整数、例: 2024）,
  "tags": ["タグ1", "タグ2", "タグ3", "タグ4"],
  "journey": [
    {
      "phase": "origin",
      "phaseTitle": "【水源（誕生）】",
      "year": "誕生の年月（例: 2023年春）",
      "platform": "発祥元のプラットフォーム・論文・ブログ名",
      "title": "誕生時の出来事タイトル",
      "description": "誰がどういう文脈でこの言葉や概念を生み出したか",
      "keyArtifact": "初出の文献名・論文・ポストの引用"
    },
    {
      "phase": "spread",
      "phaseTitle": "【合流（拡散）】",
      "year": "拡散の時期",
      "platform": "拡散メディア（X, YouTube, Hacker News等）",
      "title": "海外または初期コミュニティでの拡散タイトル",
      "description": "どうやって注目を集めコミュニティを越えて広まったか",
      "keyArtifact": "バイラルした投稿やエビデンス"
    },
    {
      "phase": "border_crossing",
      "phaseTitle": "【国境越え（翻訳）】",
      "year": "日本への輸入時期",
      "platform": "国内メディア（note, Zenn, 書籍, メディア特集等）",
      "title": "日本語圏へのローカライズと実務での検証",
      "description": "日本で誰が紹介し、どう解釈されて受け入れられたか",
      "keyArtifact": "日本での代表的な記事や書籍名"
    },
    {
      "phase": "mainstream",
      "phaseTitle": "【大河（現在地）】",
      "year": "2025年〜現在",
      "platform": "現在の主戦場メディア・実務現場",
      "title": "現在の浸透状況タイトル",
      "description": "現在どこまで普及し、どう使われているか",
      "keyArtifact": "現在の市場レポートやビジネスニュースの引用"
    }
  ],
  "insights": {
    "comprehensionScore": 0から100の整数（一般的な社会人への通じる度スコア）,
    "daysTraveled": 誕生から現在までの推定日数（整数）,
    "targetAudience": "現在理解している主なターゲット層（例: 先端AIエンジニア）",
    "chasmStatus": "before" | "crossing" | "crossed" | "settled",
    "recommendedContext": "おすすめの使用シーン（例: 社内Slack、勉強会）",
    "riskLevel": "理解されない" | "意識高いと見られる" | "一般常識" | "今更感"
  },
  "audienceSafety": {
    "executiveClient": {
      "status": "safe" | "caution" | "danger",
      "statusLabel": "🟢 安全" | "🟡 要言い換え" | "🔴 通じない",
      "confusionProbability": 0から100の整数（役員・クライアントにキョトンとされる確率%）,
      "advice": "役員やクライアントに向けて話す際の具体的な注意点と助言"
    },
    "techInternal": {
      "status": "safe" | "caution" | "danger",
      "statusLabel": "🟢 通じる（推奨）" | "🟡 要言い換え" | "🔴 注意",
      "advice": "社内テックチームや実務陣との会話での使い所"
    },
    "paraphraseSuggestion": {
      "plainTerm": "専門用語を避けた平易な言い換え表現",
      "exampleSentence": "役員報告やクライアント会議でそのまま使える言い換え例文"
    }
  },
  "semanticShift": {
    "originalMeaning": "海外コミュニティで生まれた当初の厳密な原義",
    "originalContext": "提唱された当時の背景や制約",
    "currentNuance": "日本に輸入されて現在使われているニュアンスや使われ方",
    "shiftHighlight": "伝言ゲームでどう意味が変化・拡大・あるいは形骸化したかのポイント"
  }
}`;

/**
 * Direct browser call to Gemini API using @google/genai or REST fetch
 * Falls back immediately to the local intelligent generator if no key is present or on network failure.
 */
export async function analyzeWordDirect(word: string): Promise<{ term: TermData; source: 'gemini' | 'dynamic_fallback' }> {
  const query = word.trim();
  const apiKey = getClientGeminiApiKey();

  // 3. Requirement: Fallback if no API key is provided
  if (!apiKey) {
    console.info(`[Client-Gemini] VITE_GEMINI_API_KEY is not set. Generating realistic simulated Innovator Theory data for "${query}".`);
    const fallback = generateAnalyzedTerm(query);
    return {
      term: normalizeTermData(fallback, query),
      source: 'dynamic_fallback'
    };
  }

  const prompt = ANALYSIS_PROMPT_TEMPLATE(query);

  // 1. Try @google/genai SDK first
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Try gemini-2.5-flash first as modern standard, fallback to gemini-1.5-flash if requested
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text || '';
    const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    const normalized = normalizeTermData(parsed, query);
    return {
      term: normalized,
      source: 'gemini'
    };
  } catch (sdkError) {
    console.warn('[Client-Gemini] @google/genai SDK call failed, attempting direct REST fetch fallback (gemini-1.5-flash)...', sdkError);
    
    // Try direct REST fetch with gemini-1.5-flash as specified by user
    try {
      const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
      const restResponse = await fetch(restUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      });

      if (restResponse.ok) {
        const data = await restResponse.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const cleaned = candidateText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          const parsed = JSON.parse(cleaned);
          const normalized = normalizeTermData(parsed, query);
          return {
            term: normalized,
            source: 'gemini'
          };
        }
      }
    } catch (fetchError) {
      console.warn('[Client-Gemini] Direct fetch call also failed:', fetchError);
    }
  }

  // If both failed or API key was invalid, smoothly fall back to realistic data generator
  console.info(`[Client-Gemini] API execution failed or key rate-limited. Falling back to dynamic term generator for "${query}".`);
  const fallback = generateAnalyzedTerm(query);
  return {
    term: normalizeTermData(fallback, query),
    source: 'dynamic_fallback'
  };
}

/**
 * Direct browser scan for trending buzzwords using Gemini or curated fallback
 */
export async function scanTrendingDirect(): Promise<{ terms: TermData[]; source: 'gemini' | 'curated_trending' }> {
  const apiKey = getClientGeminiApiKey();

  if (!apiKey) {
    console.info('[Client-Gemini] No API key provided for trend scan. Using curated real-time dataset.');
    return {
      terms: CURATED_TRENDING_TERMS.map(t => normalizeTermData(t, t.name)),
      source: 'curated_trending'
    };
  }

  const prompt = `あなたは最新のインターネットカルチャー、シリコンバレーの先端テック、生成AI、新世代の生産性・働き方に最も精通した社会言語学・イノベータートレンド分析AIです。
現在（2025〜2026年）、X (Twitter)、Hacker News、Reddit、TikTok、Zenn、noteなどのコミュニティやビジネス現場で話題沸騰・急浮上している「最新の新造語・バズワード」を厳選して6〜8個ピックアップし、それぞれイノベーター理論の普及度、源流ツリー、実務通じる度、語義変遷を完全に分析したJSON配列（TermData[]）を出力してください。

【必須要件】
1. テクノロジー、ライフハック、働き方、カルチャーを網羅すること（例: "Vibe Coding", "AI Slop", "ブレインロット (Brain Rot)", "シャドウAI", "エージェンティック・ワークフロー" などの旬なキーワードを含むこと）。
2. イノベーター理論の5段階（innovator, early_adopter, early_majority, late_majority, laggard）に適切に分散してプロットできるようにstageとstageProgress (0〜100) を設定すること。
3. キャズム直前（nearChasm: true）のものを含めること。

出力はJSON配列のみとしてください。`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text || '';
    const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length > 0) {
      const normalized = parsed.map((t: any) => ({
        ...normalizeTermData(t, t?.name || 'トレンドワード'),
        isTrending: true,
        isCustom: true
      }));
      return {
        terms: normalized,
        source: 'gemini'
      };
    }
  } catch (err) {
    console.warn('[Client-Gemini] Trend scan API failed, using curated dataset.', err);
  }

  return {
    terms: CURATED_TRENDING_TERMS.map(t => normalizeTermData(t, t.name)),
    source: 'curated_trending'
  };
}
