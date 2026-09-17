import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { generateAnalyzedTerm } from './src/utils/termGenerator.js';

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
    const { word } = req.body || {};
    if (!word || typeof word !== 'string' || !word.trim()) {
      return res.status(400).json({ error: 'Word parameter is required' });
    }

    const query = word.trim();
    const gemini = getGemini();

    if (!gemini) {
      console.log(`[analyze-word] GEMINI_API_KEY not configured. Using intelligent dynamic generator for "${query}".`);
      const fallbackTerm = generateAnalyzedTerm(query);
      return res.json({
        success: true,
        source: 'dynamic_fallback',
        term: fallbackTerm,
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
      "plainTerm": "専門用語を避けた平易な言い換え表現（例: 『社内マニュアルをAIに参照させる仕組み』）",
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
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '';
      let parsedData;
      try {
        // Strip markdown backticks if any
        const cleaned = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        parsedData = JSON.parse(cleaned);
      } catch (parseErr) {
        console.warn('[analyze-word] Failed to parse Gemini response as JSON. Falling back to dynamic generator.', parseErr);
        const fallbackTerm = generateAnalyzedTerm(query);
        return res.json({
          success: true,
          source: 'dynamic_fallback',
          term: fallbackTerm,
        });
      }

      // Add unique id and isCustom flag
      parsedData.id = `term-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      parsedData.isCustom = true;

      return res.json({
        success: true,
        source: 'gemini',
        term: parsedData,
      });
    } catch (apiError) {
      console.error('[analyze-word] Gemini API call error:', apiError);
      // Graceful fallback so app always works
      const fallbackTerm = generateAnalyzedTerm(query);
      return res.json({
        success: true,
        source: 'dynamic_fallback',
        term: fallbackTerm,
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
