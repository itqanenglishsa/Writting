import React, { useRef, useState, useEffect, useMemo } from 'react';
import { VocabularyWord, UserStats, PracticeStory } from '../types';
import { Volume2, Eraser, RotateCcw, CheckCircle2, Sparkles, Pencil, ArrowRight, ShoppingBag, AlertCircle, Target, Navigation, MoveDownRight, Layers, ZoomIn, Compass, ListOrdered } from 'lucide-react';
import { INITIAL_SHOP_ITEMS } from '../data/vocabulary';
import { speakText } from '../utils/speechUtils';
import { EducationalTracingGuide } from './EducationalTracingGuide';

interface PenWritingCanvasProps {
  vocabulary: VocabularyWord[];
  activeWord: VocabularyWord;
  onSelectWord: (word: VocabularyWord) => void;
  stories?: PracticeStory[];
  activeStory?: PracticeStory;
  onSelectStory?: (story: PracticeStory) => void;
  stats: UserStats;
  onRewardXp: (amount: number) => void;
  onUseHint: () => boolean;
  isStrictMode?: boolean;
  isFocusMode?: boolean;
  onOpenShop?: () => void;
  onSelectPenColor?: (colorHex: string) => void;
}

interface StrokePoint {
  x: number;
  y: number;
  t: number;
}

interface Stroke {
  id: string;
  points: StrokePoint[];
  isEraser: boolean;
}

interface StrokeAnalysisBreakdown {
  orderScore: number;       // Left to right temporal progression
  directionScore: number;   // Proper downstroke / forward stroke vectors
  boundsScore: number;      // Letter bounding box distribution & limits
  structureScore: number;   // Stroke count & stroke shape appropriateness
  pixelCoverageScore: number; // Grid pixel alignment with guide
  overallScore: number;     // Weighted total (must be >= 40%)
  diagnosticMsg: string;
}



export const PenWritingCanvas: React.FC<PenWritingCanvasProps> = ({
  vocabulary,
  activeWord,
  onSelectWord,
  stories,
  activeStory,
  onSelectStory,
  stats,
  onRewardXp,
  onUseHint,
  isStrictMode = false,
  isFocusMode = false,
  onOpenShop,
  onSelectPenColor
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#214ECF');
  const [penLineWidth, setPenLineWidth] = useState(8);
  const [isEraser, setIsEraser] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Stroke Tracking
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);

  const [feedback, setFeedback] = useState<{
    isSuccess: boolean;
    msg: string;
    score?: number;
    breakdown?: StrokeAnalysisBreakdown;
  } | null>(null);

  // Auto-fit font size state (incremental fit on button click)
  const [customFontSize, setCustomFontSize] = useState<number | null>(null);

  // Educational Tracing Guide settings (Dashed letters + Directional Arrows + Stroke numbers + Guidelines)
  const [showTracingGuide, setShowTracingGuide] = useState<boolean>(true);
  const [showTracingArrows, setShowTracingArrows] = useState<boolean>(true);
  const [showStrokeNumbers, setShowStrokeNumbers] = useState<boolean>(true);
  const [showNotebookGuidelines, setShowNotebookGuidelines] = useState<boolean>(true);

  const fittedFontSize = customFontSize ?? 110;

  // Measure word width with current fitted font size
  const wordFitInfo = useMemo(() => {
    const word = activeWord?.word || '';
    if (!word || typeof document === 'undefined') return { width: 0, fits: true };

    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return { width: 0, fits: true };

    ctx.font = `900 ${fittedFontSize}px Outfit, sans-serif`;
    const measuredWidth = ctx.measureText(word).width;
    const maxAvailableWidth = 630; // 700px canvas minus safe padding margin

    return {
      width: Math.round(measuredWidth),
      fits: measuredWidth <= maxAvailableWidth
    };
  }, [fittedFontSize, activeWord]);

  const handleFitWordStep = () => {
    const current = customFontSize ?? 110;
    const nextSize = Math.max(18, current - 15);
    setCustomFontSize(nextSize);
  };

  const handleResetFitWord = () => {
    setCustomFontSize(null);
  };

  // Sound Pronunciation Helper using Web Speech API
  const speakWord = (text: string) => {
    speakText(text);
  };

  // Reset Canvas on Word Change
  useEffect(() => {
    clearCanvas();
    setCustomFontSize(null);
    setHasChecked(false);
    setFeedback(null);
  }, [activeWord]);

  // Sync active pen color from user stats / shop selection
  useEffect(() => {
    if (stats.activePenColor) {
      setPenColor(stats.activePenColor);
    }
  }, [stats.activePenColor]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokesRef.current = [];
    currentStrokeRef.current = null;
    setHasChecked(false);
    setFeedback(null);
  };

  // Get precise scaled coordinates relative to canvas internal pixel dimensions
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Canvas Mouse & Touch Drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    setIsDrawing(true);

    const { x, y } = getCoordinates(e);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    if (ctx.setLineDash) {
      ctx.setLineDash([]);
    }

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = penLineWidth * 3.5;
      ctx.beginPath();
      ctx.arc(x, y, (penLineWidth * 3.5) / 2, 0, Math.PI * 2);
      ctx.fill();

      currentStrokeRef.current = {
        id: Math.random().toString(36).substring(2, 9),
        points: [{ x, y, t: Date.now() }],
        isEraser: true
      };
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.fillStyle = penColor;
      ctx.lineWidth = penLineWidth;

      // Render crisp round cap dot on initial touch / tap
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.5, penLineWidth / 2), 0, Math.PI * 2);
      ctx.fill();

      // Init stroke data
      currentStrokeRef.current = {
        id: Math.random().toString(36).substring(2, 9),
        points: [{ x, y, t: Date.now() }],
        isEraser: false
      };
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    if (ctx.setLineDash) {
      ctx.setLineDash([]);
    }

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = penLineWidth * 3.5;
      if (currentStrokeRef.current) {
        const points = currentStrokeRef.current.points;
        const last = points[points.length - 1];
        if (last) {
          ctx.beginPath();
          ctx.moveTo(last.x, last.y);
          ctx.lineTo(x, y);
          ctx.stroke();
          points.push({ x, y, t: Date.now() });
        }
      }
    } else {
      ctx.globalCompositeOperation = 'source-over';
      if (penColor === 'rainbow') {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#EF4444');
        grad.addColorStop(0.2, '#F59E0B');
        grad.addColorStop(0.4, '#10B981');
        grad.addColorStop(0.6, '#06B6D4');
        grad.addColorStop(0.8, '#214ECF');
        grad.addColorStop(1, '#8B5CF6');
        ctx.strokeStyle = grad;
      } else {
        ctx.strokeStyle = penColor;
      }
      ctx.lineWidth = penLineWidth;

      if (currentStrokeRef.current) {
        const points = currentStrokeRef.current.points;
        const last = points[points.length - 1];

        if (last) {
          const dist = Math.hypot(x - last.x, y - last.y);
          if (dist > 0.5) {
            ctx.beginPath();
            ctx.moveTo(last.x, last.y);
            ctx.lineTo(x, y);
            ctx.stroke();

            points.push({ x, y, t: Date.now() });
          }
        } else {
          points.push({ x, y, t: Date.now() });
        }
      }
    }
  };

  const stopDrawing = () => {
    if (currentStrokeRef.current && currentStrokeRef.current.points.length >= 1) {
      strokesRef.current.push(currentStrokeRef.current);
    }
    currentStrokeRef.current = null;
    setIsDrawing(false);
  };

  // Comprehensive Handwriting Accuracy Verification Engine (Stroke Matching Engine)
  const handleVerifyHandwriting = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Get user drawing pixel data
    const userImgData = ctx.getImageData(0, 0, width, height);
    const userPixels = userImgData.data;

    // Count user drawn non-transparent pixels
    let drawnPixelCount = 0;
    for (let i = 3; i < userPixels.length; i += 4) {
      if (userPixels[i] > 20) {
        drawnPixelCount++;
      }
    }

    // Blank canvas check
    if (drawnPixelCount < 120) {
      setFeedback({
        isSuccess: false,
        msg: 'اللوحة فارغة أو تحتوي خطوطاً قليلة جداً! يرجى كتابة وتتبع الكلمة بالكامل بالقلم. ✍️'
      });
      return;
    }

    // Filter valid strokes (at least 2 points)
    const userStrokes = strokesRef.current.filter((s) => !s.isEraser && s.points.length >= 2);

    // Classify strokes into Real Letter Strokes vs Dots/Taps
    interface EvaluatedStroke {
      stroke: Stroke;
      length: number;
      spanX: number;
      spanY: number;
      maxSpan: number;
      isDot: boolean;
      avgX: number;
      avgY: number;
    }

    const evaluatedStrokes: EvaluatedStroke[] = userStrokes.map((s) => {
      let len = 0;
      let minSx = width;
      let maxSx = 0;
      let minSy = height;
      let maxSy = 0;
      let sumX = 0;
      let sumY = 0;

      s.points.forEach((p, idx) => {
        sumX += p.x;
        sumY += p.y;
        if (p.x < minSx) minSx = p.x;
        if (p.x > maxSx) maxSx = p.x;
        if (p.y < minSy) minSy = p.y;
        if (p.y > maxSy) maxSy = p.y;

        if (idx > 0) {
          const prev = s.points[idx - 1];
          len += Math.hypot(p.x - prev.x, p.y - prev.y);
        }
      });

      const spanX = Math.max(0, maxSx - minSx);
      const spanY = Math.max(0, maxSy - minSy);
      const maxSpan = Math.max(spanX, spanY);
      const count = Math.max(1, s.points.length);

      // A stroke is a dot/tap if its path length is short (< 35px) AND its spatial span is small (< 22px)
      const isDot = len < 35 && maxSpan < 22;

      return {
        stroke: s,
        length: len,
        spanX,
        spanY,
        maxSpan,
        isDot,
        avgX: sumX / count,
        avgY: sumY / count
      };
    });

    const realStrokes = evaluatedStrokes.filter((es) => !es.isDot);
    const dotStrokes = evaluatedStrokes.filter((es) => es.isDot);

    // 1. Create reference guide canvas to get text bounding box & character bounds
    const guideCanvas = document.createElement('canvas');
    guideCanvas.width = width;
    guideCanvas.height = height;
    const guideCtx = guideCanvas.getContext('2d');
    if (!guideCtx) return;

    guideCtx.font = `900 ${fittedFontSize}px Outfit, sans-serif`;
    guideCtx.textAlign = 'center';
    guideCtx.textBaseline = 'middle';
    guideCtx.fillStyle = '#000000';
    guideCtx.fillText(activeWord.word, width / 2, height / 2);

    const guideImgData = guideCtx.getImageData(0, 0, width, height);
    const guidePixels = guideImgData.data;

    // Determine guide text bounding box
    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    let guideTargetPixelCount = 0;

    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const idx = (y * width + x) * 4;
        if (guidePixels[idx + 3] > 40) {
          guideTargetPixelCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (guideTargetPixelCount === 0) guideTargetPixelCount = 1;

    const wordLen = Math.max(1, activeWord.word.length);
    const textWidth = Math.max(20, maxX - minX);
    const charWidth = textWidth / wordLen;

    // Define horizontal character zones for letter bounds check
    const charZones = Array.from({ length: wordLen }, (_, k) => ({
      index: k,
      char: activeWord.word[k],
      xStart: minX + k * charWidth - 8,
      xEnd: minX + (k + 1) * charWidth + 8,
      hasRealStroke: false,
      hasDot: false
    }));

    // Associate evaluated strokes to character zones
    evaluatedStrokes.forEach((es) => {
      charZones.forEach((z) => {
        if (es.avgX >= z.xStart && es.avgX <= z.xEnd) {
          if (es.isDot) {
            z.hasDot = true;
          } else {
            z.hasRealStroke = true;
          }
        }
      });
    });

    // --- STROKE MATCHING ANALYSIS ENGINE ---

    // A. Stroke Order & Temporal Progression Score (15%)
    let strokeOrderScore = 100;
    const strokesForOrder = realStrokes.length >= 1 ? realStrokes : evaluatedStrokes;

    if (strokesForOrder.length >= 2) {
      let orderViolations = 0;
      let totalComparisons = 0;

      for (let i = 0; i < strokesForOrder.length; i++) {
        const sA = strokesForOrder[i];
        for (let j = i + 1; j < strokesForOrder.length; j++) {
          const sB = strokesForOrder[j];
          totalComparisons++;
          if (sB.avgX < sA.avgX - charWidth * 0.75) {
            orderViolations++;
          }
        }
      }

      if (totalComparisons > 0) {
        strokeOrderScore = Math.max(0, Math.round(100 - (orderViolations / totalComparisons) * 180));
      }
    } else if (wordLen >= 3 && realStrokes.length === 1) {
      strokeOrderScore = 25;
    }

    // B. Stroke Vector Directions & Pen Motion Score (15%)
    let totalStrokeLength = 0;
    let validDirectionLength = 0;

    userStrokes.forEach((stroke) => {
      const pts = stroke.points;
      for (let i = 0; i < pts.length - 1; i++) {
        const dx = pts[i + 1].x - pts[i].x;
        const dy = pts[i + 1].y - pts[i].y;
        const segLen = Math.hypot(dx, dy);
        if (segLen === 0) continue;

        totalStrokeLength += segLen;
        if (dy >= -0.3 * segLen && dx >= -0.4 * segLen) {
          validDirectionLength += segLen;
        } else if (dx > 0) {
          validDirectionLength += segLen * 0.8;
        }
      }
    });

    const strokeDirectionScore = totalStrokeLength > 0
      ? Math.min(100, Math.round((validDirectionLength / totalStrokeLength) * 100))
      : 0;

    // C. Letter Bounding Boxes & Spatial Fit Score (25%) - REAL STROKES ONLY
    const coveredRealZonesCount = charZones.filter((z) => z.hasRealStroke).length;
    const zoneCoverageRatio = coveredRealZonesCount / wordLen;

    let outOfBoundsCount = 0;
    let totalPointsCount = 0;

    userStrokes.forEach((s) => {
      s.points.forEach((p) => {
        totalPointsCount++;
        if (p.y < minY - 35 || p.y > maxY + 35 || p.x < minX - 45 || p.x > maxX + 45) {
          outOfBoundsCount++;
        }
      });
    });

    const boundStrictnessRatio = totalPointsCount > 0 ? Math.max(0, 1 - outOfBoundsCount / totalPointsCount) : 0;
    const letterBoundsScore = Math.round((zoneCoverageRatio * 0.75 + boundStrictnessRatio * 0.25) * 100);

    // D. Stroke Structure & Dot Penalty Score (10%)
    let strokeStructureScore = 100;
    const numReal = realStrokes.length;
    const numDots = dotStrokes.length;

    if (numDots > 0 && numReal === 0) {
      // 100% dots penalty
      strokeStructureScore = 0;
    } else if (numReal === 1 && wordLen >= 3) {
      // Lazy single-line strike
      strokeStructureScore = 20;
    } else if (numReal < Math.ceil(wordLen * 0.5)) {
      strokeStructureScore = 40;
    } else if (numDots > numReal) {
      strokeStructureScore = 50;
    } else {
      strokeStructureScore = 95;
    }

    // E. Grid Pixel Subsampling Alignment & Guide Line Coverage (35%)
    const gridW = Math.floor(width / 4);
    const gridH = Math.floor(height / 4);
    const guideGrid = new Uint8Array(gridW * gridH);
    const userGrid = new Uint8Array(gridW * gridH);

    let targetGridPixels = 0;

    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const idx = (y * width + x) * 4;
        const gy = Math.floor(y / 4);
        const gx = Math.floor(x / 4);
        const gIdx = gy * gridW + gx;

        if (guidePixels[idx + 3] > 40) {
          guideGrid[gIdx] = 1;
          targetGridPixels++;
        }
        if (userPixels[idx + 3] > 20) {
          userGrid[gIdx] = 1;
        }
      }
    }

    if (targetGridPixels === 0) targetGridPixels = 1;

    let targetCoveredCount = 0;
    let userInTargetCount = 0;
    let userTotalSamples = 0;

    for (let i = 0; i < gridW * gridH; i++) {
      if (guideGrid[i] === 1) {
        let hit = false;
        const gy = Math.floor(i / gridW);
        const gx = i % gridW;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const ny = gy + dy;
            const nx = gx + dx;
            if (ny >= 0 && ny < gridH && nx >= 0 && nx < gridW) {
              if (userGrid[ny * gridW + nx] === 1) {
                hit = true;
                break;
              }
            }
          }
          if (hit) break;
        }
        if (hit) targetCoveredCount++;
      }

      if (userGrid[i] === 1) {
        userTotalSamples++;
        const gy = Math.floor(i / gridW);
        const gx = i % gridW;
        let inDilated = false;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const ny = gy + dy;
            const nx = gx + dx;
            if (ny >= 0 && ny < gridH && nx >= 0 && nx < gridW && guideGrid[ny * gridW + nx] === 1) {
              inDilated = true;
              break;
            }
          }
          if (inDilated) break;
        }
        if (inDilated) userInTargetCount++;
      }
    }

    const coverageRatio = targetCoveredCount / targetGridPixels; // How much of actual guide letter ink is covered
    const precisionRatio = userTotalSamples > 0 ? userInTargetCount / userTotalSamples : 0;

    // Scale coverage expectation dynamically based on pen thickness (baseline 8px) so thin, medium, and thick lines are evaluated fairly
    const penFactor = Math.min(1.3, Math.max(0.65, penLineWidth / 8));
    const expectedCoverage = 0.32 * penFactor;
    const minGateCoverage = 0.16 * penFactor;

    // Convert raw guide coverage ratio into 0-100 score
    const guideTracingScore = Math.min(100, Math.round((coverageRatio / expectedCoverage) * 100));
    const pixelCoverageScore = Math.min(100, Math.round((guideTracingScore * 0.75 + precisionRatio * 25)));

    // OVERALL WEIGHTED STROKE MATCH SCORE (0 - 100%)
    let overallScore = Math.min(
      100,
      Math.round(
        guideTracingScore * 0.35 +
        letterBoundsScore * 0.25 +
        strokeOrderScore * 0.15 +
        strokeDirectionScore * 0.15 +
        strokeStructureScore * 0.10
      )
    );

    // --- STRICT GATEKEEPER CHECKS (Instant Failures for Cheating / Dots / Single Scribbles) ---
    let diagnosticMsg = '';

    if (numDots > 0 && numReal < Math.ceil(wordLen * 0.5)) {
      // User placed dots instead of writing letter lines
      overallScore = Math.min(overallScore, 15);
      diagnosticMsg = 'خطأ! قمت بوضع نقاط بسيطة بدلاً من رسم خطوط الحروف الكاملة. يرجى كتابة كل حرف كخط متصل وواضح.';
    } else if (coverageRatio < minGateCoverage) {
      // User barely covered minimum letter shapes
      overallScore = Math.min(overallScore, Math.round((coverageRatio / minGateCoverage) * 35));
      diagnosticMsg = 'تغطية خطوط الكلمة غير كافية إطلاقاً. لم تقم بتتبع خطوط وجسم الحروف بشكل كامل.';
    } else if (coveredRealZonesCount < wordLen) {
      // Missing some letters completely
      overallScore = Math.min(overallScore, 38);
      const missingCount = wordLen - coveredRealZonesCount;
      diagnosticMsg = `لم تقم بكتابة كافة الحروف! هناك ${missingCount} حرف/حروف لم تُكتب بخطوط واضحة.`;
    } else if (numReal === 1 && wordLen >= 3) {
      overallScore = Math.min(overallScore, 30);
      diagnosticMsg = 'طريقة الكتابة غير صحيحة! قمت بشطب الكلمة بضربة واحدة مستمرة بدلاً من كتابة كل حرف بذاته.';
    } else if (strokeOrderScore < 70) {
      diagnosticMsg = 'ترتيب الحروف غير صحيح! يجب البدء بالحرف الأول من اليسار والتسلسل نحو اليمين.';
    } else if (strokeDirectionScore < 60) {
      diagnosticMsg = 'اتجاه حركات القلم خاطئة! يرجى اتباع رسم الضربات من الأعلى للأسفل ومن اليسار لليمين.';
    } else {
      diagnosticMsg = 'نسبة تطابق طريقة رسم وبنية الكلمة لم تتجاوز الحد الأدنى المطلوب (40%).';
    }

    const breakdown: StrokeAnalysisBreakdown = {
      orderScore: strokeOrderScore,
      directionScore: strokeDirectionScore,
      boundsScore: letterBoundsScore,
      structureScore: strokeStructureScore,
      pixelCoverageScore: pixelCoverageScore,
      overallScore: overallScore,
      diagnosticMsg: diagnosticMsg
    };

    setHasChecked(true);

    // PASS CONDITION: Match Score MUST be >= 40%
    if (overallScore >= 40) {
      setFeedback({
        isSuccess: true,
        msg: `ممتاز جداً! تم كتابة كلمة "${activeWord.word}" باتباع طريقة ورسم الحروف الصحيحة بنسبة تطابق ${overallScore}% ✍️✨ (+15 XP)`,
        score: overallScore,
        breakdown
      });
      onRewardXp(15);
      speakWord(activeWord.word);
    } else {
      setFeedback({
        isSuccess: false,
        msg: `نسبة تطابق طريقة الكتابة هي ${overallScore}% (المطلوب 40% فأكثر للنجاح). ${diagnosticMsg} 🎯`,
        score: overallScore,
        breakdown
      });
    }
  };

  // Filter words by activeStory (or fall back to vocabulary)
  const storyWords = useMemo(() => {
    if (activeStory && activeStory.sentences && activeStory.sentences.length > 0) {
      return activeStory.sentences.map((sent, idx) => {
        const match = vocabulary.find(
          (v) => v.word.trim().toLowerCase() === sent.en.trim().toLowerCase()
        );
        if (match) return match;
        return {
          id: `story-${activeStory.id}-${idx}`,
          word: sent.en,
          arabic: sent.ar,
          category: activeStory.titleAr,
          phonetic: '',
          exampleEn: sent.en,
          exampleAr: sent.ar,
          difficulty: 'beginner'
        } as VocabularyWord;
      });
    }
    return vocabulary;
  }, [activeStory, vocabulary]);

  // Sync activeWord when activeStory changes if current word is not in storyWords
  useEffect(() => {
    if (activeStory && storyWords.length > 0) {
      const isCurrentInStory = storyWords.some(
        (w) => w.word.trim().toLowerCase() === activeWord.word.trim().toLowerCase()
      );
      if (!isCurrentInStory) {
        onSelectWord(storyWords[0]);
      }
    }
  }, [activeStory, storyWords]);

  // Next Word Navigation
  const currentIndex = storyWords.findIndex(
    (w) => w.word.trim().toLowerCase() === activeWord.word.trim().toLowerCase()
  );
  const validIndex = currentIndex !== -1 ? currentIndex : 0;
  const totalWords = storyWords.length;
  const remainingWords = Math.max(0, totalWords - (validIndex + 1));
  const nextWord =
    validIndex + 1 < storyWords.length
      ? storyWords[validIndex + 1]
      : storyWords[0];

  const handleNextWord = () => {
    if (nextWord) {
      onSelectWord(nextWord);
      clearCanvas();
      setFeedback(null);
      setHasChecked(false);
    }
  };

  // Derive unlocked pen colors from XP shop + default base pens
  const shopPenItems = INITIAL_SHOP_ITEMS.filter(item => item.type === 'pen_color');

  const defaultPens = [
    { id: 'pen_blue', value: '#214ECF', nameAr: 'أزرق إتقان' },
    { id: 'pen_black', value: '#000000', nameAr: 'أسود حبر' },
  ];

  const availablePenColors = [
    ...defaultPens,
    ...shopPenItems
      .filter(item => item.priceXp === 0 || stats.unlockedItems.includes(item.id) || stats.activePenColor === item.value)
      .map(item => ({
        id: item.id,
        value: item.value as string,
        nameAr: item.nameAr
      }))
  ].filter((pen, index, self) => index === self.findIndex(p => p.value === pen.value));

  const lockedPenCount = shopPenItems.filter(item => item.priceXp > 0 && !stats.unlockedItems.includes(item.id)).length;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm dir-rtl">
      
      {/* Header & Word Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span>الكلمة {validIndex + 1} من {totalWords}</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2 flex-wrap font-['Almarai',sans-serif]">
            اكتب كلمة{' '}
            <span
              className={`text-[#214ECF] font-['Outfit'] font-extrabold uppercase underline decoration-blue-400 dir-ltr inline-block transition-all cursor-pointer ${
                isStrictMode
                  ? 'blur-md select-none bg-slate-200 text-slate-400 rounded px-2 hover:blur-none hover:text-[#214ECF] hover:bg-transparent'
                  : ''
              }`}
              title={isStrictMode ? 'مرر الماوس لكشف الكلمة مؤقتاً' : ''}
            >
              {isStrictMode ? '🔒 •••••••' : activeWord.word}
            </span>{' '}
            بالقلم
          </h2>

          {!isFocusMode && (
            <p className="text-xs text-slate-600 font-medium mt-1.5 flex items-center gap-2 flex-wrap">
              <span>المعنى بالعربية:</span>
              <span className="font-semibold text-[#214ECF] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">{activeWord.arabic}</span>
              <span className="text-slate-400 font-normal">|</span>
              <span className="text-slate-700 font-bold">
                ملاحظة: يشترط النظام كتابة الحروف بالتسلسل الصحيح من اليسار لليمين وبعدد ضربات متناسقة!
              </span>
            </p>
          )}
        </div>

        {/* Audio Pronunciation & Group/Word Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => speakWord(activeWord.word)}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#214ECF] border border-blue-200 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-[#214ECF]" />
            <span>نطق الكلمة</span>
          </button>

          {/* Group / Story Selector Dropdown */}
          {stories && activeStory && onSelectStory && (
            <select
              value={activeStory.id}
              onChange={(e) => {
                const selected = stories.find((s) => s.id === e.target.value);
                if (selected) {
                  onSelectStory(selected);
                }
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer hover:bg-slate-50 transition-colors"
            >
              {stories.map((s) => (
                <option key={s.id} value={s.id}>
                  المجموعة: {s.titleAr}
                </option>
              ))}
            </select>
          )}

          {/* Word Selector dropdown */}
          <select
            value={activeWord.id}
            onChange={(e) => {
              const selected = storyWords.find((w) => w.id === e.target.value) || vocabulary.find((w) => w.id === e.target.value);
              if (selected) onSelectWord(selected);
            }}
            className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-[#214ECF] focus:outline-none cursor-pointer hover:bg-blue-100 transition-colors"
          >
            {storyWords.map((w, idx) => (
              <option key={w.id} value={w.id}>
                {idx + 1}. {isStrictMode ? '🔒 •••••••' : w.word} ({w.arabic})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
        
        {/* Colors / Ink Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-600 font-semibold ml-1 flex items-center gap-1">
            <Pencil className="w-4 h-4 text-[#214ECF]" />
            <span>حبر القلم:</span>
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            {availablePenColors.map((p) => {
              const isSelected = penColor === p.value && !isEraser;
              const isRainbow = p.value === 'rainbow';

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setPenColor(p.value);
                    if (onSelectPenColor) onSelectPenColor(p.value);
                    setIsEraser(false);
                  }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-300 transition-all cursor-pointer flex items-center justify-center relative shadow-xs ${
                    isSelected
                      ? 'scale-110 ring-2 ring-[#214ECF] ring-offset-1 z-10'
                      : 'hover:scale-105 opacity-90 hover:opacity-100'
                  }`}
                  style={
                    isRainbow
                      ? { background: 'linear-gradient(135deg, #EF4444, #F59E0B, #10B981, #06B6D4, #8B5CF6)' }
                      : { backgroundColor: p.value }
                  }
                  title={`${p.nameAr} ${isSelected ? '(مُفعّل حالياً)' : '(متاح)'}`}
                >
                  {isRainbow && <span className="text-[11px] leading-none">🌈</span>}
                  {isSelected && !isRainbow && (
                    <span className="w-2 h-2 rounded-full bg-white" />
                  )}
                </button>
              );
            })}

            {/* Quick Button to open XP Shop if there are locked colors */}
            {lockedPenCount > 0 && onOpenShop && (
              <button
                onClick={onOpenShop}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs mr-1"
                title="افتح المتجر لشراء ألوان أقلام إضافية بـ XP!"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>+ فتح ألوان ({lockedPenCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Line Width Thickness Selector */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-600 font-semibold px-1.5">سمك القلم:</span>
          {[
            { width: 4, label: 'رفيع' },
            { width: 8, label: 'متوسط' },
            { width: 12, label: 'عريض' }
          ].map((w) => (
            <button
              key={w.width}
              onClick={() => setPenLineWidth(w.width)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                penLineWidth === w.width
                  ? 'bg-[#214ECF] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={`خط ${w.label} (${w.width}px)`}
            >
              {w.label}
            </button>
          ))}
        </div>

        {/* Educational Tracing & Directional Arrow Controls */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setShowTracingGuide(!showTracingGuide)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              showTracingGuide
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="تفعيل/تعطيل نمط خطوط التتبع التعليمية المنقطة (Tracing Letters)"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>خطوط التتبع التعليمية</span>
          </button>

          {showTracingGuide && (
            <>
              <button
                onClick={() => setShowTracingArrows(!showTracingArrows)}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  showTracingArrows
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-400 hover:bg-slate-100'
                }`}
                title="إظهار/إخفاء أسهم اتجاه الكتابة"
              >
                <span>الأسهم ➔</span>
              </button>

              <button
                onClick={() => setShowStrokeNumbers(!showStrokeNumbers)}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  showStrokeNumbers
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-400 hover:bg-slate-100'
                }`}
                title="إظهار/إخفاء ترقيم خطوات رسم الحرف (1, 2, 3)"
              >
                <ListOrdered className="w-3 h-3 inline ml-0.5" />
                <span>الترقيم ①</span>
              </button>

              <button
                onClick={() => setShowNotebookGuidelines(!showNotebookGuidelines)}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  showNotebookGuidelines
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-400 hover:bg-slate-100'
                }`}
                title="إظهار/إخفاء أسطر كراسة الخط الأربعة (Ascender, Midline, Baseline, Descender)"
              >
                <span>الأسطر ≡</span>
              </button>
            </>
          )}
        </div>

        {/* Auto-Fit Word Size Controls */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            onClick={handleFitWordStep}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#214ECF] border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="تصغير حجم الكلمة الإرشادية تدريجياً لملاءمة اللوحة"
          >
            <ZoomIn className="w-4 h-4" />
            <span>تلاؤم الكلمة مع اللوحة</span>
          </button>

          {customFontSize !== null && (
            <button
              onClick={handleResetFitWord}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs animate-in fade-in duration-200"
              title="إعادة الكلمة للحجم الأصلي وإخفاء هذا الزر"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إلغاء التلاؤم</span>
            </button>
          )}
        </div>

        {/* Eraser & Clear */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEraser(!isEraser)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
              isEraser
                ? 'bg-rose-500 text-white border-rose-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span>{isEraser ? 'الممحاة مفعّلة' : 'ممحاة'}</span>
          </button>

          <button
            onClick={clearCanvas}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>مسح اللوحة</span>
          </button>
        </div>
      </div>

      {/* Interactive Handwriting Canvas Stage */}
      <div className="relative w-full h-[280px] bg-slate-50 rounded-2xl border border-dashed border-slate-300 overflow-hidden flex items-center justify-center select-none">
        
        {/* Faint Ruled Notebook Paper Background Lines */}
        <div 
          className="absolute inset-0 pointer-events-none select-none z-0 rounded-2xl"
          style={{
            backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 31px, rgba(148, 163, 184, 0.18) 31px, rgba(148, 163, 184, 0.18) 32px)',
            backgroundPosition: '0 8px'
          }}
        />

        {/* LTR Direction Guide Badge */}
        <div className="absolute top-3 left-4 z-20 bg-white/90 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5 font-['Outfit'] shadow-2xs" dir="ltr">
          <span>LTR ➔</span>
          <span>Left to Right (Stroke Match Active)</span>
        </div>

        {/* Floating Auto-Fit Badge on Stage when Custom Size is Active */}
        {customFontSize !== null && (
          <div className="absolute top-3 right-4 z-20 bg-blue-600/90 text-white backdrop-blur-xs text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>حجم الخط: {fittedFontSize}px {wordFitInfo.fits ? '(تتسع داخل اللوحة ✓)' : '(اضغط مجدداً لتصغيرها أكثر)'}</span>
          </div>
        )}

        {/* Educational Tracing Letters Guide Layer (Dashed Strokes + Directional Arrows + Stroke 1,2,3 Dots) */}
        {showTracingGuide ? (
          <EducationalTracingGuide
            word={activeWord.word}
            fittedFontSize={fittedFontSize}
            showArrows={showTracingArrows}
            showNumbers={showStrokeNumbers}
            showGuidelines={showNotebookGuidelines}
            showDashedOutline={true}
          />
        ) : (
          /* Plain Text Outline Fallback when Tracing Guide is Toggled Off */
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 px-3" dir="ltr">
            <span 
              className={`font-black text-slate-200/80 font-[Outfit] tracking-widest text-center transition-all duration-200 ${
                customFontSize !== null ? '' : 'text-8xl sm:text-9xl'
              }`}
              style={
                customFontSize !== null
                  ? { 
                      fontSize: `${fittedFontSize}px`,
                      WebkitTextStroke: fittedFontSize > 60 ? '2px #CBD5E1' : '1.5px #CBD5E1',
                      lineHeight: '1.1',
                      whiteSpace: 'nowrap'
                    }
                  : { WebkitTextStroke: '2px #CBD5E1' }
              }
            >
              {activeWord.word}
            </span>
          </div>
        )}

        {/* User Interactive Canvas (1:1 standard scale, no transform/zoom/crop) */}
        <canvas
          ref={canvasRef}
          width={700}
          height={280}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`absolute inset-0 w-full h-full touch-none z-10 ${
            isEraser ? 'cursor-cell' : 'cursor-crosshair'
          }`}
        />

        {/* Status watermark indicator */}
        <div className="absolute bottom-3 right-4 text-[11px] text-slate-500 font-bold pointer-events-none bg-white/90 px-3 py-1 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-1.5 z-20">
          {isEraser ? (
            <>
              <Eraser className="w-3.5 h-3.5 text-amber-500" />
              <span>وضع الممحاة: مرر لإزالة خطوط الرسم</span>
            </>
          ) : (
            <>
              <Pencil className="w-3.5 h-3.5 text-indigo-600" />
              <span>وضع القلم: اكتب الحروف بالترتيب الصحيح من اليسار لليمين</span>
            </>
          )}
        </div>
      </div>

      {/* Feedback Banner & Detailed Stroke Matching Breakdown */}
      {feedback && (
        <div className="mt-4 space-y-3">
          <div
            className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200 ${
              feedback.isSuccess
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.isSuccess ? (
                <Sparkles className="w-6 h-6 text-amber-500 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
              )}
              <div>
                <span className="text-xs sm:text-sm font-black block">{feedback.msg}</span>
                <span className="text-[11px] font-bold text-slate-600 block mt-0.5">
                  {feedback.isSuccess
                    ? 'تم اجتياز معيار مطابقة طريقة رسم الحروف بنجاح (تجاوزت 40%).'
                    : 'لم يتم تحقيق درجة النجاح. يجب ألا تقل نسبة مطابقة طريقة الكتابة عن 40%.'}
                </span>
              </div>
            </div>

            {feedback.isSuccess && (
              <button
                onClick={handleNextWord}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              >
                <span>التالي ({nextWord?.word}) • متبقي {remainingWords} كلمة</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Stroke Analysis Metrics Diagnostic Panel */}
          {feedback.breakdown && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white border-2 border-black shadow-[3px_3px_0px_0px_#000]">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-amber-400">
                    تقرير مطابقة طريقة ورسم الحروف (Stroke Matching Report)
                  </span>
                </div>
                <span className={`text-xs font-black font-['Outfit'] px-2.5 py-0.5 rounded-full border ${
                  feedback.breakdown.overallScore >= 40
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500'
                }`}>
                  الإجمالي: {feedback.breakdown.overallScore}% {feedback.breakdown.overallScore >= 40 ? '✅ (ناجح)' : '❌ (غير كافٍ)'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 mb-4 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    feedback.breakdown.overallScore >= 40 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${feedback.breakdown.overallScore}%` }}
                />
              </div>

              {/* Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] mb-1 font-bold">
                    <Navigation className="w-3 h-3 text-blue-400" />
                    <span>تسلسل وترتيب الحروف</span>
                  </div>
                  <span className={`font-black font-['Outfit'] text-sm ${
                    feedback.breakdown.orderScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {feedback.breakdown.orderScore}%
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] mb-1 font-bold">
                    <MoveDownRight className="w-3 h-3 text-indigo-400" />
                    <span>اتجاه وحركة القلم</span>
                  </div>
                  <span className={`font-black font-['Outfit'] text-sm ${
                    feedback.breakdown.directionScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {feedback.breakdown.directionScore}%
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] mb-1 font-bold">
                    <Layers className="w-3 h-3 text-purple-400" />
                    <span>حدود ونطاق الحروف</span>
                  </div>
                  <span className={`font-black font-['Outfit'] text-sm ${
                    feedback.breakdown.boundsScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {feedback.breakdown.boundsScore}%
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] mb-1 font-bold">
                    <Pencil className="w-3 h-3 text-emerald-400" />
                    <span>بنية وعدد الضربات</span>
                  </div>
                  <span className={`font-black font-['Outfit'] text-sm ${
                    feedback.breakdown.structureScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {feedback.breakdown.structureScore}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex items-center justify-between gap-3">
        {hasChecked && feedback?.isSuccess ? (
          <button
            onClick={handleNextWord}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
          >
            <span>التالي ({nextWord?.word}) — متبقي {remainingWords} كلمة</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleVerifyHandwriting}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>فحص مطابقة الضربات والخط (Stroke Verification)</span>
          </button>
        )}

        <p className="text-xs text-slate-400 font-medium hidden sm:block">
          تساعدك هذه الاستراتيجية على ترسيخ الذاكرة الحركية للحروف الإنجليزية.
        </p>
      </div>

    </div>
  );
};

