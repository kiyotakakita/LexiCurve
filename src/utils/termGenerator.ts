import { TermData, CategoryId, StageId } from '../types';

/**
 * Intelligent term generator to simulate real-time AI / Web trend analysis
 * when the user enters any word in the search bar.
 */
export function generateAnalyzedTerm(query: string): TermData {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();
  
  // Categorize based on keywords
  let category: CategoryId = 'culture';
  let categoryLabel = 'カルチャー・若者言葉';

  if (
    lower.includes('ai') || 
    lower.includes('agent') || 
    lower.includes('エージェント') || 
    lower.includes('llm') || 
    lower.includes('gpt') || 
    lower.includes('bot') || 
    lower.includes('vibe') ||
    lower.includes('prompt') ||
    lower.includes('プロンプト') ||
    lower.includes('ロボット') ||
    lower.includes('モデル')
  ) {
    category = 'ai';
    categoryLabel = 'AI・テクノロジー';
  } else if (
    lower.includes('ノート') || 
    lower.includes('習慣') || 
    lower.includes('タスク') || 
    lower.includes('時間') || 
    lower.includes('効率') || 
    lower.includes('hack') || 
    lower.includes('ハック') || 
    lower.includes('生産') ||
    lower.includes('睡眠') ||
    lower.includes('集中')
  ) {
    category = 'productivity';
    categoryLabel = '生産性・ライフハック';
  } else if (
    lower.includes('dx') || 
    lower.includes('マネジメント') || 
    lower.includes('リーダー') || 
    lower.includes('働き') || 
    lower.includes('キャリア') || 
    lower.includes('経営') || 
    lower.includes('人事') || 
    lower.includes('資本') || 
    lower.includes('副業') ||
    lower.includes('アジャイル')
  ) {
    category = 'business';
    categoryLabel = 'ビジネス・働き方';
  }

  // Determine an interesting stage based on query hash
  const hash = Array.from(trimmed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const stageOptions: { stage: StageId; progress: number; nearChasm?: boolean }[] = [
    { stage: 'innovator', progress: 8 + (hash % 8) },
    { stage: 'early_adopter', progress: 20 + (hash % 12) },
    { stage: 'early_adopter', progress: 32 + (hash % 3), nearChasm: true }, // Near chasm!
    { stage: 'early_majority', progress: 42 + (hash % 18) },
    { stage: 'late_majority', progress: 68 + (hash % 14) },
  ];
  const stageConfig = stageOptions[hash % stageOptions.length];

  const currentYear = 2025;
  const startYearOffset = 1 + (hash % 6);
  const startYear = currentYear - startYearOffset;
  const daysTraveled = Math.round(startYearOffset * 365 + (hash % 200));
  const compScore = Math.min(95, Math.max(15, Math.round(stageConfig.progress * 0.95 + (hash % 10))));

  const isEarly = stageConfig.stage === 'innovator' || stageConfig.stage === 'early_adopter';

  // Audience Safety metrics
  const execStatus: 'safe' | 'caution' | 'danger' = compScore < 35 ? 'danger' : (compScore < 70 ? 'caution' : 'safe');
  const execStatusLabel = execStatus === 'danger' ? '🔴 通じない' : (execStatus === 'caution' ? '🟡 要言い換え' : '🟢 安全');
  const confusionProb = Math.min(95, Math.max(5, Math.round(100 - compScore + (hash % 10))));

  const audienceSafety = {
    executiveClient: {
      status: execStatus,
      statusLabel: execStatusLabel,
      confusionProbability: confusionProb,
      advice: execStatus === 'danger'
        ? `役員や一般クライアントにはほぼ通じずキョトンとされる確率${confusionProb}%です。専門用語は避け、平易な日常語で目的から説明してください。`
        : (execStatus === 'caution'
          ? `感度の高い役員には通じますが、安全のため「要するに〇〇」と言い換える補足説明を添えるのが賢明です。`
          : `ビジネス層にも広く浸透しているため、そのまま提案書や報告で使っても安全です。`),
    },
    techInternal: {
      status: (isEarly ? 'safe' : 'safe') as 'safe' | 'caution' | 'danger',
      statusLabel: isEarly ? '🟢 通じる（推奨）' : '🟢 一般常識（前提）',
      advice: isEarly 
        ? `社内Slackやエンジニア・実務チーム間では知的好奇心を刺激するホットワードとして歓迎されます。`
        : `業界の前提知識として定着しているため、説明なしで使用して問題ありません。`,
    },
    paraphraseSuggestion: {
      plainTerm: category === 'ai' 
        ? `「${trimmed}（AIが自律的に外部ツールやデータを扱える仕組み）」`
        : (category === 'productivity'
          ? `「${trimmed}（作業の切り替えコストをゼロにするメモ・時間術）」`
          : (category === 'business'
            ? `「${trimmed}（業務プロセスを抜本的に再設計する改革）」`
            : `「${trimmed}（若年層やネット発の新しいトレンド）」`)),
      exampleSentence: `役員・クライアント向け例: 『専門的には「${trimmed}」と呼ばれていますが、要するに〇〇を自動化し、作業効率を向上させる施策です』`,
    },
  };

  // Semantic shift analysis
  const semanticShift = {
    originalMeaning: isEarly
      ? `海外の専門コミュニティや論文で、特定の技術的制約や課題を解決するために厳密に定義された概念。`
      : `当初は革新的なパラダイムシフトとして提唱され、限定された専門家コミュニティで議論されていた。`,
    originalContext: isEarly
      ? `GitHubの仕様策定、Hacker Newsでの激論、特定ツール愛好家による草の根の実践ログ。`
      : `学術論文や先駆的カンファレンスにおけるプロトタイプ発表。`,
    currentNuance: isEarly
      ? `日本国内では「最新のバズワード」「これさえ知っておけば最先端」として、利便性や仕事術の文脈で拡大解釈されて消費されやすい。`
      : `社会的制度や行政・メディアの定型句に組み込まれ、本来の尖った思想よりも形式的なラベルとして定着。`,
    shiftHighlight: isEarly
      ? `厳密なプロトコルや哲学よりも、「AIや業務がどう便利になるか」という実利面が強調されて伝播している点。`
      : `当初の変革思想から「言わないと予算がつかないお題目」へと意味合いが実利・義務化へシフトした点。`,
  };

  return {
    id: `term-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: trimmed,
    reading: trimmed,
    category,
    categoryLabel,
    stage: stageConfig.stage,
    stageProgress: stageConfig.progress,
    nearChasm: stageConfig.nearChasm,
    summary: `${trimmed}に関する最新の社会認知度・コミュニティ拡散トレンドのAI解析結果`,
    definition: `「${trimmed}」は、${categoryLabel}の分野で注目されている概念。初期のコアコミュニティでの議論を経て、現在のステージへと推移しています。`,
    firstAppearedYear: startYear,
    tags: [categoryLabel, stageConfig.stage.toUpperCase(), 'AI即時解析', '新興概念'],
    isCustom: true,
    journey: [
      {
        phase: 'origin',
        phaseTitle: '【水源（誕生）】',
        year: `${startYear}年`,
        platform: isEarly ? 'GitHub / Hacker News / 海外特化フォーラム' : '海外リサーチレポート / 業界誌',
        title: `「${trimmed}」のプロト概念・言及が初観測`,
        description: `特定の課題意識を持つクリエイターや研究者たちの間で、従来の枠組みを更新するキーワードとして初出。`,
        keyArtifact: `First Public Mention: "${trimmed} initial thread & discussion"`,
      },
      {
        phase: 'spread',
        phaseTitle: '【合流（拡散）】',
        year: `${startYear + 1}年`,
        platform: 'X (Twitter) / YouTube解説 / ポッドキャスト',
        title: 'インフルエンサーとオピニオンリーダーによる実験的言及',
        description: `「試してみたら効果的だった」「今後の標準になるかもしれない」という個人体験談とともに、特定クラスタ内で急速にリポストが急増。`,
        keyArtifact: `Viral Post: 「最近話題の『${trimmed}』を徹底解説してみた」`,
      },
      {
        phase: 'border_crossing',
        phaseTitle: '【国境越え（翻訳）】',
        year: `${Math.min(currentYear, startYear + 2)}年`,
        platform: '国内テックブログ / note / 専門誌特集',
        title: '日本語圏への本格ローカライズと実務での検証',
        description: `日本のアーリー層による実践レポートが公開され、類似概念との違いや日本特有のユースケースについての議論が白熱。`,
        keyArtifact: `noteトレンド記事: 「【決定版】なぜ今『${trimmed}』が重要なのか」`,
      },
      {
        phase: 'mainstream',
        phaseTitle: '【大河（現在地）】',
        year: `${currentYear}年〜現在`,
        platform: 'カンファレンス / 業界ニュース / 一般ビジネスメディア',
        title: isEarly 
          ? 'アーリー層での定着が進み、一般化の壁（キャズム）に挑戦中' 
          : 'マジョリティ層に浸透し、実務や生活の標準語へと定着',
        description: isEarly
          ? `実用的なベストプラクティスが固まりつつあり、一般層への敷居を下げるツールや解説が待望されている段階。`
          : `多くの企業やメディアで前提知識として扱われ、認知ギャップが急速に縮小している状態。`,
        keyArtifact: `Market Analysis 2025: 「${trimmed}の市場規模推移と今後の展望」`,
      },
    ],
    insights: {
      comprehensionScore: compScore,
      daysTraveled,
      targetAudience: isEarly ? '感度の高いギーク層・特定領域の実務者' : '一般ビジネスパーソン・広範な生活者',
      chasmStatus: stageConfig.nearChasm ? 'crossing' : (isEarly ? 'before' : 'crossed'),
      recommendedContext: isEarly ? '社内先鋭チーム、テック系Slack、専門勉強会' : '一般会議、クライアント提案、SNS',
      riskLevel: isEarly ? '意識高いと見られる' : '一般常識',
    },
    audienceSafety,
    semanticShift,
  };
}
