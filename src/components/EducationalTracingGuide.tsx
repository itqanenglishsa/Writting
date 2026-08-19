import React, { useMemo } from 'react';
import { LETTER_STROKES, CharacterTracingData, LetterStroke } from '../data/letterStrokes';

interface EducationalTracingGuideProps {
  word: string;
  fittedFontSize?: number;
  showArrows?: boolean;
  showNumbers?: boolean;
  showGuidelines?: boolean;
  showDashedOutline?: boolean;
  tracingColor?: string;
  guideOpacity?: number;
}

export const EducationalTracingGuide: React.FC<EducationalTracingGuideProps> = ({
  word = '',
  fittedFontSize = 110,
  showArrows = true,
  showNumbers = true,
  showGuidelines = true,
  showDashedOutline = true,
  tracingColor = '#214ECF',
  guideOpacity = 1
}) => {
  const characters = useMemo(() => word.split(''), [word]);

  // Compute character layout and overall bounding box
  const layout = useMemo(() => {
    let totalWidth = 0;
    const letterSpacing = 8; // Normalized spacing in standard 100-height font box

    const charItems: {
      char: string;
      data: CharacterTracingData | null;
      x: number;
      width: number;
    }[] = [];

    characters.forEach((ch) => {
      const data = LETTER_STROKES[ch] || null;
      const width = data ? data.width : (ch === ' ' ? 30 : 50);
      charItems.push({
        char: ch,
        data,
        x: totalWidth,
        width
      });
      totalWidth += width + letterSpacing;
    });

    // Remove trailing space
    if (charItems.length > 0) {
      totalWidth -= letterSpacing;
    }

    if (totalWidth <= 0) totalWidth = 100;

    return {
      charItems,
      totalWidth,
      height: 130 // Includes ascenders (0-10) and descenders (90-125)
    };
  }, [characters]);

  // Calculate dynamic scale factor to center inside 700 x 280 stage
  const scale = useMemo(() => {
    const maxStageWidth = 640; // 700 - safe margins
    const maxStageHeight = 220; // 280 - safe margins

    // Calculate base font scale relative to 100 viewBox units
    const baseScale = (fittedFontSize / 110) * 1.55;
    const targetWidth = layout.totalWidth * baseScale;
    const targetHeight = layout.height * baseScale;

    const scaleX = targetWidth > maxStageWidth ? maxStageWidth / layout.totalWidth : baseScale;
    const scaleY = targetHeight > maxStageHeight ? maxStageHeight / layout.height : baseScale;

    return Math.min(scaleX, scaleY, 2.2);
  }, [layout, fittedFontSize]);

  const scaledWidth = layout.totalWidth * scale;
  const scaledHeight = layout.height * scale;

  const offsetX = (700 - scaledWidth) / 2;
  const offsetY = (280 - scaledHeight) / 2;

  // Guidelines positions in standard 0-130 space
  const ascenderY = 12;
  const midlineY = 44;
  const baselineY = 90;
  const descenderY = 120;

  return (
    <div 
      className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden flex items-center justify-center"
      style={{ opacity: guideOpacity }}
      dir="ltr"
    >
      <svg
        viewBox="0 0 700 280"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Arrowhead marker for straight strokes */}
          <marker
            id="stroke-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="4.5"
            markerHeight="4.5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563EB" />
          </marker>

          {/* Curved direction arrow marker */}
          <marker
            id="stroke-arrow-accent"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#EA580C" />
          </marker>
        </defs>

        {/* 1. Educational Penmanship Guidelines (أسطر كراسة تحسين الخط) */}
        {showGuidelines && (
          <g className="guidelines-group opacity-70">
            {/* Top Line / Ascender Line (Solid) */}
            <line
              x1={Math.max(20, offsetX - 20)}
              y1={offsetY + ascenderY * scale}
              x2={Math.min(680, offsetX + scaledWidth + 20)}
              y2={offsetY + ascenderY * scale}
              stroke="#94A3B8"
              strokeWidth="1.2"
              strokeDasharray="4,3"
            />
            {/* Midline / Waistline (Dashed Orange/Pink) */}
            <line
              x1={Math.max(20, offsetX - 20)}
              y1={offsetY + midlineY * scale}
              x2={Math.min(680, offsetX + scaledWidth + 20)}
              y2={offsetY + midlineY * scale}
              stroke="#F97316"
              strokeWidth="1.5"
              strokeDasharray="5,4"
            />
            {/* Baseline (Primary Solid Reference Line) */}
            <line
              x1={Math.max(15, offsetX - 25)}
              y1={offsetY + baselineY * scale}
              x2={Math.min(685, offsetX + scaledWidth + 25)}
              y2={offsetY + baselineY * scale}
              stroke="#3B82F6"
              strokeWidth="2"
            />
            {/* Descender Line (Bottom Dashed) */}
            <line
              x1={Math.max(20, offsetX - 20)}
              y1={offsetY + descenderY * scale}
              x2={Math.min(680, offsetX + scaledWidth + 20)}
              y2={offsetY + descenderY * scale}
              stroke="#CBD5E1"
              strokeWidth="1.2"
              strokeDasharray="3,3"
            />
          </g>
        )}

        {/* 2. Scaled Container for Tracing Letters & Directional Arrows */}
        <g transform={`translate(${offsetX}, ${offsetY}) scale(${scale})`}>
          {layout.charItems.map((item, charIdx) => {
            const charData = item.data;

            return (
              <g key={`char-${charIdx}-${item.char}`} transform={`translate(${item.x}, 0)`}>
                {charData ? (
                  // Vectorized Tracing Letter with Directional Arrows & Stroke Order
                  <g className="letter-strokes">
                    {/* Layer A: Wide Soft Guided Underlay Track */}
                    {charData.strokes.map((stroke, sIdx) => (
                      <path
                        key={`track-${sIdx}`}
                        d={stroke.d}
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="11"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}

                    {/* Layer B: Primary Educational Dashed Tracing Line */}
                    {showDashedOutline &&
                      charData.strokes.map((stroke, sIdx) => (
                        <path
                          key={`dashed-${sIdx}`}
                          d={stroke.d}
                          fill="none"
                          stroke="#64748B"
                          strokeWidth="2.8"
                          strokeDasharray="5,5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ))}

                    {/* Layer C: Directional Guide Arrows along strokes */}
                    {showArrows &&
                      charData.strokes.map((stroke, sIdx) => {
                        const { arrow } = stroke;
                        const isCurved = arrow.type === 'curve_cw' || arrow.type === 'curve_ccw';
                        const isDot = arrow.type === 'dot';

                        if (isDot) return null;

                        return (
                          <g
                            key={`arrow-${sIdx}`}
                            transform={`translate(${arrow.x}, ${arrow.y}) rotate(${arrow.angle})`}
                          >
                            {/* Direction Arrow Glyph */}
                            <path
                              d="M -4 -3 L 4 0 L -4 3 Z"
                              fill={isCurved ? '#EA580C' : '#2563EB'}
                              opacity="0.9"
                            />
                          </g>
                        );
                      })}

                    {/* Layer D: Numbered Starting Point Dots (1, 2, 3...) */}
                    {showNumbers &&
                      charData.strokes.map((stroke, sIdx) => {
                        const { startPoint, strokeNum } = stroke;
                        const isPrimary = strokeNum === 1;

                        return (
                          <g key={`start-dot-${sIdx}`} transform={`translate(${startPoint.x}, ${startPoint.y})`}>
                            {/* Glowing halo for start #1 */}
                            {isPrimary && (
                              <circle
                                cx="0"
                                cy="0"
                                r="8"
                                fill="#3B82F6"
                                opacity="0.25"
                                className="animate-pulse"
                              />
                            )}

                            {/* Solid start dot */}
                            <circle
                              cx="0"
                              cy="0"
                              r="5"
                              fill={isPrimary ? '#214ECF' : '#475569'}
                              stroke="#FFFFFF"
                              strokeWidth="1.2"
                            />

                            {/* Stroke order number */}
                            <text
                              x="0"
                              y="3"
                              textAnchor="middle"
                              fontSize="6.5"
                              fontWeight="900"
                              fill="#FFFFFF"
                              fontFamily="system-ui, sans-serif"
                            >
                              {strokeNum}
                            </text>
                          </g>
                        );
                      })}
                  </g>
                ) : (
                  // Fallback for special punctuation or unexpected symbols
                  <g className="fallback-char">
                    <text
                      x={item.width / 2}
                      y={baselineY}
                      textAnchor="middle"
                      fontSize="80"
                      fontWeight="900"
                      fontFamily="Outfit, sans-serif"
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="2.5"
                      strokeDasharray="5,5"
                    >
                      {item.char}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
