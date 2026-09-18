import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString()
    });
  });

  // Word analysis endpoint
  app.post('/api/analyze-word', async (req, res) => {
    const { word, model = 'gemini-2.5-flash' } = req.body || {};
    if (!word || typeof word !== 'string' || !word.trim()) {
      return res.status(400).json({ error: 'Word parameter is required' });
    }

    const query = word.trim();
    const gemini = getGemini();

    if (!gemini) {
      return res.status(400).json({ 
        error: 'APIキーが設定されていません。右上の設定から入力してください' 
      });
    }

    try {
      const prompt = `あなたは新造語・バズワード・テクノロジー用語の社会学的浸透度・イノベーター理論・語源変遷の専門家アナリストです。
入力された単語「${query}」について、客観的な事実・Web上の言及トレンドに基づき、以下のJSON形式で分析結果を出力してください。

【出力要件】
必ず以下のキーを持つ有効なJSONのみを出力してください（Markdownのバッククォート \`\`\`json も不要です）：
{
  "name": "単語の正式名称（例: ${query}）",
  "reading": "読み方（カタカナまたは英語）",
  "category": "productivity" | "ai" | "business" | "culture" のいずれか1つ,
  "categoryLabel": "生産性・ライフハック" | "AI・テクノロジー" | "ビジネス・働き方" | "カルチャー・若者言葉" のいずれか,
  "stage": "innovator" | "early_adopter" | "early_majority" | "late_majority" | "laggard" のいずれか（現在の日本での普及度）,
  "stageProgress": 0から100の数値（ベルカーブ上のX座標パーセンテージ。イノベーター: 1〜15, アーリーアダプター: 16〜34, アーリーマジョリティ: 35〜67, レイトマジョリティ: 68〜84, ラガード: 85〜100）,
  "nearChasm": boolean（stageProgressが12〜25の間、つまりキャズムの溝付近ならtrue、それ以外はfalse）,
  "summary": "1行の簡潔な解説（50文字以内）",
  "definition": "概念の厳密な定義（100文字程度）",
  "firstAppearedYear": 初出年（西暦の整数、例: 2023）,
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

      const response = await gemini.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '';
      const cleaned = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsedData = JSON.parse(cleaned);

      parsedData.id = `term-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      parsedData.isCustom = true;

      return res.json({
        success: true,
        source: 'gemini',
        term: parsedData,
      });
    } catch (apiError: any) {
      console.error('[analyze-word] Google API Error:', apiError);
      const status = apiError?.status || apiError?.statusCode || 500;
      const message = apiError?.message || 'Google API通信エラーが発生しました';
      return res.status(status).json({
        error: `Google API エラー [HTTP ${status}]: ${message}`,
      });
    }
  });

  // Trending buzzwords automatic scan endpoint
  app.post('/api/scan-trending-words', async (req, res) => {
    const { model = 'gemini-2.5-flash' } = req.body || {};
    const gemini = getGemini();

    if (!gemini) {
      return res.status(400).json({ 
        error: 'APIキーが設定されていません。右上の設定から入力してください' 
      });
    }

    try {
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

      const response = await gemini.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text || '';
      const cleaned = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsedList = JSON.parse(cleaned);

      if (!Array.isArray(parsedList) || parsedList.length === 0) {
        throw new Error('Google APIから有効な配列レスポンスを受信できませんでした');
      }

      const validatedList = parsedList.map((item, idx) => {
        const wordName = item?.name || item?.word || item?.title || item?.term || '新着ワード';
        const description = item?.description || item?.explanation || item?.summary || item?.definition || '';
        const category = item?.category || item?.genre || 'AI・テクノロジー';
        const score = typeof item?.score === 'number' ? item.score : 20;

        return {
          id: item.id || `trend-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          name: wordName,
          title: wordName,
          description,
          summary: description,
          definition: description,
          category,
          score,
          isCustom: true,
          isTrending: true,
        };
      });

      return res.json({
        success: true,
        source: 'gemini_trending',
        terms: validatedList,
      });
    } catch (apiErr: any) {
      console.error('[scan-trending] Google API Error:', apiErr);
      const status = apiErr?.status || apiErr?.statusCode || 500;
      const message = apiErr?.message || 'Google API通信エラーが発生しました';
      return res.status(status).json({
        error: `Google API エラー [HTTP ${status}]: ${message}`,
      });
    }
  });

  // Vite middleware for dev or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
