// Direct Client-side Gemini API Service with model selection and strict error reporting
import { TermData } from '../types';
import { normalizeTermData } from '../utils/normalizeTerm';

export interface GeminiModelOption {
  id: string;
  name: string;
  badge?: string;
  description: string;
}

export const PRESET_GEMINI_MODELS: GeminiModelOption[] = [
  {
    id: 'gemini-flash-latest',
    name: 'gemini-flash-latest',
    badge: '推奨・最新自動追従',
    description: 'Googleが常に最新の安定版Flashモデルにルーティングする公式推奨モデル',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'gemini-2.5-flash',
    badge: '高速推論',
    description: '思考・推論能力と低レイテンシーを両立した2.5世代Flashモデル',
  },
  {
    id: 'gemini-3.7-flash',
    name: 'gemini-3.7-flash',
    badge: '次世代ハイブリッド',
    description: '最新ハイブリッド推論対応の3.7世代Flashモデル',
  },
];

const LOCAL_STORAGE_KEY = 'lexicurve_gemini_api_key';
const LOCAL_STORAGE_MODEL_KEY = 'lexicurve_gemini_selected_model';

/**
 * Retrieves the Gemini API key from import.meta.env or localStorage
 */
export function getClientGeminiApiKey(): string {
  // 1. Vite environment variable
  const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();
  if (envKey) return envKey;

  // 2. Local storage if the user saved an API key in the browser
  try {
    const localKey = localStorage.getItem(LOCAL_STORAGE_KEY)?.trim();
    if (localKey) return localKey;
  } catch {
    // Ignore localStorage access errors
  }

  return '';
}

/**
 * Sets or clears the local Gemini API key
 */
export function setClientGeminiApiKey(key: string) {
  try {
    if (key.trim()) {
      localStorage.setItem(LOCAL_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
}

/**
 * Gets the selected Gemini model ID from localStorage or fallback
 */
export function getClientGeminiModel(): string {
  try {
    const localModel = localStorage.getItem(LOCAL_STORAGE_MODEL_KEY)?.trim();
    if (localModel) return localModel;
  } catch {
    // Ignore
  }
  const envModel = (import.meta.env.VITE_GEMINI_MODEL as string | undefined)?.trim();
  if (envModel) return envModel;

  return 'gemini-flash-latest';
}

/**
 * Sets the selected Gemini model ID to localStorage
 */
export function setClientGeminiModel(modelId: string) {
  try {
    if (modelId.trim()) {
      localStorage.setItem(LOCAL_STORAGE_MODEL_KEY, modelId.trim());
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
 * Low-level HTTP call to Google Gemini generateContent REST API
 * Dynamic endpoint: https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}
 * Throws honest errors containing HTTP status code and raw Google error message.
 */
async function callGeminiRestApi(prompt: string, modelOverride?: string): Promise<{ text: string; model: string }> {
  const apiKey = getClientGeminiApiKey();
  if (!apiKey) {
    throw new Error('APIキーが設定されていません。右上の設定から入力してください');
  }

  const selectedModel = (modelOverride || getClientGeminiModel()).trim() || 'gemini-flash-latest';
  const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(selectedModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let response: Response;
  try {
    response = await fetch(endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      })
    });
  } catch (networkErr: any) {
    throw new Error(`ネットワーク通信エラー: ${networkErr?.message || networkErr}`);
  }

  if (!response.ok) {
    let rawGoogleErrorMessage = '';
    try {
      const errorJson = await response.json();
      if (errorJson?.error) {
        const { code, status, message } = errorJson.error;
        rawGoogleErrorMessage = `${status || code || ''} - ${message || ''}`.trim();
      } else {
        rawGoogleErrorMessage = JSON.stringify(errorJson);
      }
    } catch {
      rawGoogleErrorMessage = await response.text().catch(() => response.statusText);
    }

    throw new Error(`Google API エラー [HTTP ${response.status}]: ${rawGoogleErrorMessage || response.statusText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(`Google API エラー [HTTP ${response.status}]: モデル「${selectedModel}」からの応答が空でした。`);
  }

  return { text, model: selectedModel };
}

/**
 * Direct browser call to Gemini API to analyze a single term.
 * Absolutely no dummy fallback data is created if the API fails.
 */
export async function analyzeWordDirect(word: string): Promise<{ term: TermData; model: string }> {
  const query = word.trim();
  const prompt = ANALYSIS_PROMPT_TEMPLATE(query);

  const { text: rawJsonText, model } = await callGeminiRestApi(prompt);

  const cleaned = rawJsonText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (jsonErr) {
    throw new Error(`Google API エラー: モデル「${model}」が返却したJSONの解析に失敗しました。生出力: ${cleaned.slice(0, 100)}...`);
  }

  const normalized = normalizeTermData(parsed, query);

  return {
    term: normalized,
    model,
  };
}

/**
 * Direct browser call to Gemini API to scan trending buzzwords.
 * Absolutely no dummy fallback data is created if the API fails.
 */
export async function scanTrendingDirect(): Promise<{ terms: TermData[]; model: string }> {
  const prompt = `あなたはインターネットカルチャー、シリコンバレーの先端テック、生成AI、新世代の生産性・働き方に最も精通した社会言語学・イノベータートレンド分析AIです。
現在話題沸騰・急浮上している「最新の新造語・バズワード」について、AI、生産性、ビジネス、カルチャーの各分野からバランスよく合計5〜6個の新造語を抽出してください。

必ず以下のキーを持つJSON配列（Array）形式のみを出力してください：
[
  {
    "name": "単語名（例: Vibe Coding）",
    "description": "簡潔な説明文",
    "category": "以下の4つの中から最も適切なものを1つ選択: [生産性・ライフハック, AI・テクノロジー, ビジネス・働き方, カルチャー・若者言葉]",
    "score": ベルカーブ上の位置（イノベーターなら5〜15、アダプターなら20〜35等の数値0〜100）
  }
]`;

  const { text: rawJsonText, model } = await callGeminiRestApi(prompt);

  const cleaned = rawJsonText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (jsonErr) {
    throw new Error(`Google API エラー: モデル「${model}」が返却したトレンドデータのJSON解析に失敗しました。`);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error(`Google API エラー: モデル「${model}」から取得したトレンドデータが配列形式ではありませんでした。`);
  }

  const normalized = parsed.map((item: any) => {
    // Keys resolution with full fluctuation tolerance:
    // 単語名: item.name || item.word || item.title || item.term || "新着ワード"
    // 説明文: item.description || item.explanation || item.summary || ""
    // カテゴリ: item.category || item.genre || "AI・テクノロジー"
    // ※単語名に絶対に固定文字列の「トレンドワード」を代入しないでください。
    const wordName = item?.name || item?.word || item?.title || item?.term || '新着ワード';
    const description = item?.description || item?.explanation || item?.summary || item?.definition || '';
    const category = item?.category || item?.genre || 'AI・テクノロジー';
    const score = item?.score ?? item?.stageProgress ?? item?.position ?? 20;

    const termPayload = {
      ...item,
      name: wordName,
      title: wordName,
      description,
      summary: description,
      definition: description,
      category,
      score,
    };

    return {
      ...normalizeTermData(termPayload, wordName),
      isTrending: true,
      isCustom: true,
    };
  });

  return {
    terms: normalized,
    model,
  };
}
