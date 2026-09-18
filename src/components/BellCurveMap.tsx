import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Users,
  Compass,
  Zap,
  Flame
} from 'lucide-react';
import { TermData, CategoryId, StageId } from '../types';
import { STAGES, CHASM_X_PERCENT } from '../data/stages';

interface BellCurveMapProps {
  terms: TermData[];
  selectedCategory: CategoryId;
  selectedTerm: TermData | null;
  onSelectTerm: (term: TermData) => void;
  onShowChasmInfo?: () => void;
  highlightedTermIds?: string[];
  onDeleteTerm?: (termId: string) => void;
  onOpenDetailModal?: (term: TermData) => void;
}

export const BellCurveMap: React.FC<BellCurveMapProps> = ({
  terms,
  selectedCategory,
  selectedTerm,
  onSelectTerm,
  onShowChasmInfo,
  highlightedTermIds = [],
  onDeleteTerm,
  onOpenDetailModal,
}) => {
  const [hoveredTerm, setHoveredTerm] = useState<TermData | null>(null);
  const [hoveredZone, setHoveredZone] = useState<StageId | null>(null);

  // SVG dimensions
  const SVG_WIDTH = 1000;
  const SVG_HEIGHT = 380;
  const BASELINE_Y = 300;
  const PEAK_X = 580; // 50% cumulative mark (between Early and Late Majority)
  const PEAK_Y = 65;  // Top peak
  const SIGMA = 180;  // Standard deviation for curve math

  // Boundary X positions
  const BOUNDARIES = {
    start: 50,
    innovator_adopter: 175,
    chasm: 335, // The Chasm rift
    adopter_earlyMaj: 335,
    earlyMaj_lateMaj: 580,
    lateMaj_laggard: 805,
    end: 950,
  };

  // Gaussian Bell curve calculation
  const getY = (x: number): number => {
    const amplitude = BASELINE_Y - PEAK_Y;
    const exponent = -Math.pow(x - PEAK_X, 2) / (2 * Math.pow(SIGMA, 2));
    return BASELINE_Y - amplitude * Math.exp(exponent);
  };

  // Pre-generate smooth SVG path segments for each zone
  const generateZonePath = (x1: number, x2: number, step = 5): string => {
    const points: [number, number][] = [];
    for (let x = x1; x <= x2; x += step) {
      points.push([x, getY(x)]);
    }
    if (points[points.length - 1][0] < x2) {
      points.push([x2, getY(x2)]);
    }

    let d = `M ${x1} ${BASELINE_Y}`;
    for (let i = 0; i < points.length; i++) {
      d += ` L ${points[i][0]} ${points[i][1]}`;
    }
    d += ` L ${x2} ${BASELINE_Y} Z`;
    return d;
  };

  // Full curve stroke path
  const fullCurveStroke = useMemo(() => {
    let d = `M ${BOUNDARIES.start} ${getY(BOUNDARIES.start)}`;
    for (let x = BOUNDARIES.start; x <= BOUNDARIES.end; x += 4) {
      d += ` L ${x} ${getY(x)}`;
    }
    return d;
  }, []);

  // Filter terms by category
  const filteredTerms = useMemo(() => {
    if (selectedCategory === 'all') return terms;
    return terms.filter(t => t.category === selectedCategory);
  }, [terms, selectedCategory]);

  // Convert stageProgress (0 to 100) to X coordinate
  const getXForProgress = (progress: number): number => {
    const span = BOUNDARIES.end - BOUNDARIES.start;
    return BOUNDARIES.start + (progress / 100) * span;
  };

  // Calculate staggered vertical offsets so pins don't overlap
  const positionedTerms = useMemo(() => {
    // Sort terms by progress to calculate collision
    const sorted = [...filteredTerms].sort((a, b) => a.stageProgress - b.stageProgress);
    
    return sorted.map((term, index) => {
      const x = getXForProgress(term.stageProgress);
      const curveY = getY(x);

      // Check proximity with nearby terms
      let staggerLevel = 0;
      for (let i = 0; i < index; i++) {
        const prevTerm = sorted[i];
        const prevX = getXForProgress(prevTerm.stageProgress);
        if (Math.abs(x - prevX) < 65) {
          staggerLevel = (staggerLevel + 1) % 3;
        }
      }

      // Height offset above curve
      const pinDistance = 38 + staggerLevel * 28;
      const pinY = Math.max(45, curveY - pinDistance);

      return {
        ...term,
        x,
        curveY,
        pinY,
        staggerLevel,
      };
    });
  }, [filteredTerms]);

  return (
    <div className="w-full bg-[#0d1117] rounded-2xl border border-slate-800/80 shadow-2xl p-4 sm:p-6 overflow-hidden relative">
      {/* Header bar of the map */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              イノベーター理論 ベルカーブ（浸透度マップ）
            </h2>
            <span className="text-xs text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/50">
              表示中: {filteredTerms.length} 概念
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            各概念の現在地をプロット。ピンをクリックすると下部に「源流ジャーニー」を展開します。
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>イノベーター 2.5%</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-violet-950/40 border border-violet-500/30 text-violet-300">
            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
            <span>アーリーアダプター 13.5%</span>
          </div>
          <button
            onClick={onShowChasmInfo}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-950/60 border border-rose-500/50 text-rose-300 hover:bg-rose-900/60 transition-colors cursor-pointer"
            title="キャズム（死の谷）をクリックして詳細を見る"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
            <span className="font-bold">キャズムの溝 (Chasm)</span>
          </button>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>アーリーマジョリティ 34%</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-950/40 border border-amber-500/30 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>レイトマジョリティ 34%</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/80 border border-slate-700/40 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>ラガード 16%</span>
          </div>
        </div>
      </div>

      {/* SVG Bell Curve Container */}
      <div className="relative w-full overflow-x-auto select-none no-scrollbar pt-2 pb-1">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full min-w-[760px] h-auto overflow-visible"
        >
          <defs>
            {/* Zone Gradients */}
            <linearGradient id="grad-innovator" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="grad-early-adopter" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="grad-early-majority" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="grad-late-majority" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="grad-laggard" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.02" />
            </linearGradient>

            {/* Chasm Laser Glow Gradient */}
            <linearGradient id="chasm-laser" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.2" />
            </linearGradient>

            {/* Glowing filter for active pins */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#06b6d4" floodOpacity="0.6" />
            </filter>
            <filter id="glow-violet" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#8b5cf6" floodOpacity="0.6" />
            </filter>
            <filter id="glow-chasm" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f43f5e" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Background gridlines */}
          <line x1={BOUNDARIES.start} y1={BASELINE_Y} x2={BOUNDARIES.end} y2={BASELINE_Y} stroke="#334155" strokeWidth="1.5" />
          <line x1={BOUNDARIES.start} y1={BASELINE_Y + 1} x2={BOUNDARIES.end} y2={BASELINE_Y + 1} stroke="#1e293b" strokeWidth="1" />

          {/* 1. Zone 1: Innovator (2.5%) */}
          <path
            d={generateZonePath(BOUNDARIES.start, BOUNDARIES.innovator_adopter)}
            fill="url(#grad-innovator)"
            className="transition-opacity hover:opacity-90"
            onMouseEnter={() => setHoveredZone('innovator')}
            onMouseLeave={() => setHoveredZone(null)}
          />

          {/* 2. Zone 2: Early Adopter (13.5%) */}
          <path
            d={generateZonePath(BOUNDARIES.innovator_adopter, BOUNDARIES.chasm)}
            fill="url(#grad-early-adopter)"
            className="transition-opacity hover:opacity-90"
            onMouseEnter={() => setHoveredZone('early_adopter')}
            onMouseLeave={() => setHoveredZone(null)}
          />

          {/* 3. Zone 3: Early Majority (34%) */}
          <path
            d={generateZonePath(BOUNDARIES.chasm, BOUNDARIES.earlyMaj_lateMaj)}
            fill="url(#grad-early-majority)"
            className="transition-opacity hover:opacity-90"
            onMouseEnter={() => setHoveredZone('early_majority')}
            onMouseLeave={() => setHoveredZone(null)}
          />

          {/* 4. Zone 4: Late Majority (34%) */}
          <path
            d={generateZonePath(BOUNDARIES.earlyMaj_lateMaj, BOUNDARIES.lateMaj_laggard)}
            fill="url(#grad-late-majority)"
            className="transition-opacity hover:opacity-90"
            onMouseEnter={() => setHoveredZone('late_majority')}
            onMouseLeave={() => setHoveredZone(null)}
          />

          {/* 5. Zone 5: Laggard (16%) */}
          <path
            d={generateZonePath(BOUNDARIES.lateMaj_laggard, BOUNDARIES.end)}
            fill="url(#grad-laggard)"
            className="transition-opacity hover:opacity-90"
            onMouseEnter={() => setHoveredZone('laggard')}
            onMouseLeave={() => setHoveredZone(null)}
          />

          {/* Master Bell Curve Outline Stroke */}
          <path
            d={fullCurveStroke}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Vertical boundary dashed lines */}
          {/* Innovator / Adopter divider */}
          <line
            x1={BOUNDARIES.innovator_adopter}
            y1={getY(BOUNDARIES.innovator_adopter)}
            x2={BOUNDARIES.innovator_adopter}
            y2={BASELINE_Y}
            stroke="#06b6d4"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeOpacity="0.6"
          />

          {/* Early Majority / Late Majority divider (Peak) */}
          <line
            x1={BOUNDARIES.earlyMaj_lateMaj}
            y1={getY(BOUNDARIES.earlyMaj_lateMaj)}
            x2={BOUNDARIES.earlyMaj_lateMaj}
            y2={BASELINE_Y}
            stroke="#10b981"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeOpacity="0.5"
          />

          {/* Late Majority / Laggard divider */}
          <line
            x1={BOUNDARIES.lateMaj_laggard}
            y1={getY(BOUNDARIES.lateMaj_laggard)}
            x2={BOUNDARIES.lateMaj_laggard}
            y2={BASELINE_Y}
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeOpacity="0.5"
          />

          {/* ========================================================================= */}
          {/* THE CHASM: Prominent Red Rift, Warning Boundary & Crack */}
          {/* ========================================================================= */}
          <g className="cursor-pointer" onClick={onShowChasmInfo}>
            {/* Chasm rift background highlight glow */}
            <rect
              x={BOUNDARIES.chasm - 8}
              y={getY(BOUNDARIES.chasm) - 15}
              width={16}
              height={BASELINE_Y - getY(BOUNDARIES.chasm) + 15}
              fill="#f43f5e"
              opacity="0.08"
              rx="4"
            />
            
            {/* Red glowing laser boundary line */}
            <line
              x1={BOUNDARIES.chasm}
              y1={getY(BOUNDARIES.chasm) - 20}
              x2={BOUNDARIES.chasm}
              y2={BASELINE_Y}
              stroke="url(#chasm-laser)"
              strokeWidth="2.5"
              strokeDasharray="6 3"
              filter="url(#glow-chasm)"
            />

            {/* Chasm fissure crack jagged line inside the curve */}
            <path
              d={`M ${BOUNDARIES.chasm} ${getY(BOUNDARIES.chasm)} 
                  L ${BOUNDARIES.chasm - 4} ${getY(BOUNDARIES.chasm) + 35} 
                  L ${BOUNDARIES.chasm + 4} ${getY(BOUNDARIES.chasm) + 70} 
                  L ${BOUNDARIES.chasm - 3} ${getY(BOUNDARIES.chasm) + 105} 
                  L ${BOUNDARIES.chasm} ${BASELINE_Y}`}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="1.8"
              strokeOpacity="0.9"
            />

            {/* Chasm Floating Header Badge */}
            <g transform={`translate(${BOUNDARIES.chasm}, ${getY(BOUNDARIES.chasm) - 26})`}>
              <rect
                x="-58"
                y="-13"
                width="116"
                height="24"
                rx="12"
                fill="#881337"
                stroke="#f43f5e"
                strokeWidth="1.5"
                filter="url(#glow-chasm)"
              />
              <text
                x="0"
                y="3"
                fill="#ffe4e6"
                fontSize="10"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
                textAnchor="middle"
              >
                ⚠ キャズムの溝 (16%)
              </text>
            </g>
          </g>

          {/* ========================================================================= */}
          {/* Zone Base Labels & Percentages */}
          {/* ========================================================================= */}
          {/* Innovator */}
          <text
            x={(BOUNDARIES.start + BOUNDARIES.innovator_adopter) / 2}
            y={BASELINE_Y + 22}
            fill="#06b6d4"
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
          >
            イノベーター
          </text>
          <text
            x={(BOUNDARIES.start + BOUNDARIES.innovator_adopter) / 2}
            y={BASELINE_Y + 38}
            fill="#64748b"
            fontSize="11"
            fontFamily="monospace"
            textAnchor="middle"
          >
            2.5%
          </text>

          {/* Early Adopter */}
          <text
            x={(BOUNDARIES.innovator_adopter + BOUNDARIES.chasm) / 2}
            y={BASELINE_Y + 22}
            fill="#a78bfa"
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
          >
            アーリーアダプター
          </text>
          <text
            x={(BOUNDARIES.innovator_adopter + BOUNDARIES.chasm) / 2}
            y={BASELINE_Y + 38}
            fill="#64748b"
            fontSize="11"
            fontFamily="monospace"
            textAnchor="middle"
          >
            13.5%
          </text>

          {/* Early Majority */}
          <text
            x={(BOUNDARIES.chasm + BOUNDARIES.earlyMaj_lateMaj) / 2}
            y={BASELINE_Y + 22}
            fill="#34d399"
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
          >
            アーリーマジョリティ
          </text>
          <text
            x={(BOUNDARIES.chasm + BOUNDARIES.earlyMaj_lateMaj) / 2}
            y={BASELINE_Y + 38}
            fill="#64748b"
            fontSize="11"
            fontFamily="monospace"
            textAnchor="middle"
          >
            34.0%
          </text>

          {/* Late Majority */}
          <text
            x={(BOUNDARIES.earlyMaj_lateMaj + BOUNDARIES.lateMaj_laggard) / 2}
            y={BASELINE_Y + 22}
            fill="#fbbf24"
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
          >
            レイトマジョリティ
          </text>
          <text
            x={(BOUNDARIES.earlyMaj_lateMaj + BOUNDARIES.lateMaj_laggard) / 2}
            y={BASELINE_Y + 38}
            fill="#64748b"
            fontSize="11"
            fontFamily="monospace"
            textAnchor="middle"
          >
            34.0%
          </text>

          {/* Laggard */}
          <text
            x={(BOUNDARIES.lateMaj_laggard + BOUNDARIES.end) / 2}
            y={BASELINE_Y + 22}
            fill="#94a3b8"
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
          >
            ラガード
          </text>
          <text
            x={(BOUNDARIES.lateMaj_laggard + BOUNDARIES.end) / 2}
            y={BASELINE_Y + 38}
            fill="#64748b"
            fontSize="11"
            fontFamily="monospace"
            textAnchor="middle"
          >
            16.0%
          </text>

          {/* ========================================================================= */}
          {/* Word Pins Plotted along the curve */}
          {/* ========================================================================= */}
          {positionedTerms.map((term) => {
            const isSelected = selectedTerm?.id === term.id;
            const isHovered = hoveredTerm?.id === term.id;
            const stageConfig = STAGES[term.stage];

            // Badge color styling
            let badgeBg = '#1e293b';
            let badgeBorder = '#475569';
            let badgeText = '#e2e8f0';
            let glowFilter = '';

            if (term.stage === 'innovator') {
              badgeBorder = isSelected ? '#06b6d4' : '#0891b2';
              badgeBg = isSelected ? '#083344' : '#0f172a';
              glowFilter = isSelected ? 'url(#glow-cyan)' : '';
            } else if (term.stage === 'early_adopter') {
              badgeBorder = isSelected ? '#a855f7' : '#7c3aed';
              badgeBg = isSelected ? '#2e1065' : '#0f172a';
              glowFilter = isSelected ? 'url(#glow-violet)' : '';
            } else if (term.stage === 'early_majority') {
              badgeBorder = isSelected ? '#10b981' : '#059669';
              badgeBg = isSelected ? '#064e3b' : '#0f172a';
            } else if (term.stage === 'late_majority') {
              badgeBorder = isSelected ? '#f59e0b' : '#d97706';
              badgeBg = isSelected ? '#451a03' : '#0f172a';
            } else {
              badgeBorder = isSelected ? '#94a3b8' : '#64748b';
              badgeBg = isSelected ? '#334155' : '#0f172a';
            }

            // Estimate badge width
            const isTrending = term.isTrending || highlightedTermIds.includes(term.id);
            const showDelete = Boolean(onDeleteTerm && (isSelected || isHovered));
            const approxTextWidth = term.name.length * 9.5 + (isTrending ? 42 : 32);
            const badgeW = Math.max(90, Math.min(240, approxTextWidth + (showDelete ? 22 : 0)));
            const badgeH = 26;

            const finalBorder = isSelected 
              ? '#ffffff' 
              : isTrending 
              ? '#f59e0b' 
              : badgeBorder;

            return (
              <motion.g
                key={term.id}
                id={`term-pin-${term.id}`}
                initial={{ opacity: 0, y: -25, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: 'spring',
                  damping: 18,
                  stiffness: 260,
                  delay: Math.min(0.5, (term.stageProgress % 15) * 0.03),
                }}
                className="cursor-pointer"
                onClick={() => onSelectTerm(term)}
                onMouseEnter={() => setHoveredTerm(term)}
                onMouseLeave={() => setHoveredTerm(null)}
              >
                {/* Connecting drop line from pin down to curve */}
                <line
                  x1={term.x}
                  y1={term.pinY + badgeH / 2}
                  x2={term.x}
                  y2={term.curveY}
                  stroke={isSelected ? stageConfig.color : isTrending ? '#f59e0b' : '#64748b'}
                  strokeWidth={isSelected ? '2' : isTrending ? '1.5' : '1'}
                  strokeDasharray={isSelected ? 'none' : '2 2'}
                  strokeOpacity={isSelected ? '0.9' : isTrending ? '0.85' : '0.6'}
                />

                {/* Point on the curve itself */}
                <circle
                  cx={term.x}
                  cy={term.curveY}
                  r={isSelected ? 6 : isTrending ? 5 : 4}
                  fill={isTrending ? '#f59e0b' : stageConfig.color}
                  stroke="#0f172a"
                  strokeWidth={2}
                />
                {(isSelected || isTrending) && (
                  <circle
                    cx={term.x}
                    cy={term.curveY}
                    r={isSelected ? 10 : 8}
                    fill="none"
                    stroke={isSelected ? stageConfig.color : '#f59e0b'}
                    strokeWidth={1.5}
                    strokeOpacity={0.7}
                  />
                )}

                {/* Pin Badge Container */}
                <g transform={`translate(${term.x - badgeW / 2}, ${term.pinY})`}>
                  {/* Near chasm indicator badge on top */}
                  {term.nearChasm ? (
                    <g transform={`translate(${badgeW / 2}, -10)`}>
                      <rect
                        x="-40"
                        y="-8"
                        width="80"
                        height="16"
                        rx="8"
                        fill="#be123c"
                        stroke="#f43f5e"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="4"
                        fill="#fff"
                        fontSize="9"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        ⚡ キャズム直前
                      </text>
                    </g>
                  ) : isTrending ? (
                    <g transform={`translate(${badgeW / 2}, -10)`}>
                      <rect
                        x="-34"
                        y="-8"
                        width="68"
                        height="16"
                        rx="8"
                        fill="#b45309"
                        stroke="#f59e0b"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="4"
                        fill="#fff"
                        fontSize="9"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        🔥 急上昇
                      </text>
                    </g>
                  ) : null}

                  {/* Main Pin Pill */}
                  <rect
                    x="0"
                    y="0"
                    width={badgeW}
                    height={badgeH}
                    rx="13"
                    fill={badgeBg}
                    stroke={finalBorder}
                    strokeWidth={isSelected ? '2' : isTrending ? '1.5' : '1.2'}
                    filter={glowFilter}
                    className="transition-colors duration-150"
                  />

                  {/* Category color indicator dot or flame */}
                  {isTrending ? (
                    <text
                      x="7"
                      y={badgeH / 2 + 4}
                      fontSize="11"
                    >
                      🔥
                    </text>
                  ) : (
                    <circle
                      cx="12"
                      cy={badgeH / 2}
                      r="4"
                      fill={stageConfig.color}
                    />
                  )}

                  {/* Term Name */}
                  <text
                    x={isTrending ? "23" : "22"}
                    y={badgeH / 2 + 4}
                    fill={isSelected ? '#ffffff' : isTrending ? '#fef3c7' : badgeText}
                    fontSize="11.5"
                    fontWeight={isSelected || isTrending ? '700' : '600'}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {term.name.length > 14 ? term.name.substring(0, 13) + '…' : term.name}
                  </text>

                  {/* Requirement 2: Delete "×" button on badge on hover or select */}
                  {showDelete && (
                    <g
                      id={`pin-delete-${term.id}`}
                      className="cursor-pointer group/del"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTerm?.(term.id);
                      }}
                      transform={`translate(${badgeW - 13}, ${badgeH / 2})`}
                    >
                      <title>この単語をグラフから削除</title>
                      <circle
                        cx="0"
                        cy="0"
                        r="7"
                        fill="#be123c"
                        stroke="#f43f5e"
                        strokeWidth="1"
                        className="hover:fill-rose-500 hover:scale-110 transition-transform"
                      />
                      <path
                        d="M -2.5 -2.5 L 2.5 2.5 M 2.5 -2.5 L -2.5 2.5"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </g>
                  )}
                </g>
              </motion.g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        <AnimatePresence>
          {hoveredTerm && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 2, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 bg-[#161b22] border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl w-72 text-left"
              style={{
                left: `${Math.max(10, Math.min(75, hoveredTerm.stageProgress))}%`,
                top: '20px',
              }}
              onMouseEnter={() => setHoveredTerm(hoveredTerm)}
              onMouseLeave={() => setHoveredTerm(null)}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {hoveredTerm.categoryLabel}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {STAGES[hoveredTerm.stage].name}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white leading-snug">
                {hoveredTerm.name}
              </h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {hoveredTerm.summary}
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>通じる度: <strong className="text-cyan-300">{hoveredTerm.insights.comprehensionScore}%</strong></span>
                <span>誕生: <strong className="text-slate-200">{hoveredTerm.firstAppearedYear}年</strong></span>
                <div className="flex items-center gap-2">
                  {onOpenDetailModal && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetailModal(hoveredTerm);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                    >
                      詳細 ↗
                    </button>
                  )}
                  {onDeleteTerm && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTerm(hoveredTerm.id);
                      }}
                      className="text-rose-400 hover:text-rose-300 font-medium cursor-pointer flex items-center gap-0.5"
                      title="この単語をグラフから削除"
                    >
                      削除 ×
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer hint note */}
      <div className="mt-2 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            選択中: <strong className="text-white">{selectedTerm?.name ?? 'なし'}</strong>
            {selectedTerm?.nearChasm && (
              <span className="ml-2 text-rose-400 font-semibold">（現在キャズム直面中）</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span>※ イノベーター理論（E.M.ロジャーズ）およびキャズム理論（G.A.ムーア）に基づく浸透度モデル</span>
        </div>
      </div>
    </div>
  );
};
