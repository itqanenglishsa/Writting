export interface LetterStroke {
  d: string;
  startPoint: { x: number; y: number };
  arrow: {
    x: number;
    y: number;
    angle: number; // in degrees: 0 is right, 90 is down, 180 is left, 270 is up
    type?: 'arrow' | 'curve_cw' | 'curve_ccw' | 'dot';
  };
  strokeNum: number;
  guideText?: string;
}

export interface CharacterTracingData {
  char: string;
  width: number; // ViewBox width for normalized height of 100 (or 130 for descenders)
  strokes: LetterStroke[];
}

export const LETTER_STROKES: Record<string, CharacterTracingData> = {
  // --- UPPERCASE LETTERS (A-Z) ---
  'A': {
    char: 'A',
    width: 75,
    strokes: [
      { d: 'M 37.5 12 L 10 90', startPoint: { x: 37.5, y: 12 }, arrow: { x: 23, y: 52, angle: 110 }, strokeNum: 1 },
      { d: 'M 37.5 12 L 65 90', startPoint: { x: 37.5, y: 12 }, arrow: { x: 52, y: 52, angle: 70 }, strokeNum: 2 },
      { d: 'M 20 62 L 55 62', startPoint: { x: 20, y: 62 }, arrow: { x: 38, y: 62, angle: 0 }, strokeNum: 3 }
    ]
  },
  'B': {
    char: 'B',
    width: 65,
    strokes: [
      { d: 'M 18 12 L 18 90', startPoint: { x: 18, y: 12 }, arrow: { x: 18, y: 50, angle: 90 }, strokeNum: 1 },
      { d: 'M 18 12 C 45 12, 56 26, 56 36 C 56 47, 44 51, 18 51', startPoint: { x: 18, y: 12 }, arrow: { x: 54, y: 32, angle: 90, type: 'curve_cw' }, strokeNum: 2 },
      { d: 'M 18 51 C 48 51, 60 66, 60 74 C 60 86, 45 90, 18 90', startPoint: { x: 18, y: 51 }, arrow: { x: 58, y: 70, angle: 90, type: 'curve_cw' }, strokeNum: 3 }
    ]
  },
  'C': {
    char: 'C',
    width: 68,
    strokes: [
      { d: 'M 58 24 C 45 12, 16 16, 16 51 C 16 86, 46 90, 58 78', startPoint: { x: 58, y: 24 }, arrow: { x: 16, y: 51, angle: 90, type: 'curve_ccw' }, strokeNum: 1 }
    ]
  },
  'D': {
    char: 'D',
    width: 68,
    strokes: [
      { d: 'M 18 12 L 18 90', startPoint: { x: 18, y: 12 }, arrow: { x: 18, y: 51, angle: 90 }, strokeNum: 1 },
      { d: 'M 18 12 C 55 12, 62 30, 62 51 C 62 72, 55 90, 18 90', startPoint: { x: 18, y: 12 }, arrow: { x: 62, y: 51, angle: 90, type: 'curve_cw' }, strokeNum: 2 }
    ]
  },
  'E': {
    char: 'E',
    width: 62,
    strokes: [
      { d: 'M 18 12 L 18 90', startPoint: { x: 18, y: 12 }, arrow: { x: 18, y: 51, angle: 90 }, strokeNum: 1 },
      { d: 'M 18 12 L 56 12', startPoint: { x: 18, y: 12 }, arrow: { x: 38, y: 12, angle: 0 }, strokeNum: 2 },
      { d: 'M 18 51 L 48 51', startPoint: { x: 18, y: 51 }, arrow: { x: 34, y: 51, angle: 0 }, strokeNum: 3 },
      { d: 'M 18 90 L 56 90', startPoint: { x: 18, y: 90 }, arrow: { x: 38, y: 90, angle: 0 }, strokeNum: 4 }
    ]
  },
  'F': {
    char: 'F',
    width: 60,
    strokes: [
      { d: 'M 18 12 L 18 90', startPoint: { x: 18, y: 12 }, arrow: { x: 18, y: 51, angle: 90 }, strokeNum: 1 },
      { d: 'M 18 12 L 54 12', startPoint: { x: 18, y: 12 }, arrow: { x: 36, y: 12, angle: 0 }, strokeNum: 2 },
      { d: 'M 18 51 L 46 51', startPoint: { x: 18, y: 51 }, arrow: { x: 32, y: 51, angle: 0 }, strokeNum: 3 }
    ]
  },
  'G': {
    char: 'G',
    width: 70,
    strokes: [
      { d: 'M 60 24 C 45 12, 16 16, 16 51 C 16 86, 46 90, 60 90 L 60 55 L 42 55', startPoint: { x: 60, y: 24 }, arrow: { x: 16, y: 51, angle: 90, type: 'curve_ccw' }, strokeNum: 1 }
    ]
  },
  'H': {
    char: 'H',
    width: 68,
    strokes: [
      { d: 'M 18 12 L 18 90', startPoint: { x: 18, y: 12 }, arrow: { x: 18, y: 51, angle: 90 }, strokeNum: 1 },
      { d: 'M 54 12 L 54 90', startPoint: { x: 54, y: 12 }, arrow: { x: 54, y: 51, angle: 90 }, strokeNum: 2 },
      { d: 'M 18 51 L 54 51', startPoint: { x: 18, y: 51 }, arrow: { x: 36, y: 51, angle: 0 }, strokeNum: 3 }
    ]
  },
  'I': {
    char: 'I',
    width: 44,
    strokes: [
      { d: 'M 22 12 L 22 90', startPoint: { x: 22, y: 12 }, arrow: { x: 22, y: 51, angle: 90 }, strokeNum: 1 },
      { d: 'M 8 12 L 36 12', startPoint: { x: 8, y: 12 }, arrow: { x: 22, y: 12, angle: 0 }, strokeNum: 2 },
      { d: 'M 8 90 L 36 90', startPoint: { x: 8, y: 90 }, arrow: { x: 22, y: 90, angle: 0 }, strokeNum: 3 }
    ]
  },
  'J': {
    char: 'J',
    width: 52,
    strokes: [
      { d: 'M 10 12 L 42 12', startPoint: { x: 10, y: 12 }, arrow: { x: 26, y: 12, angle: 0 }, strokeNum: 1 },
      { d: 'M 34 12 L 34 72 C 34 88, 14 88, 10 74', startPoint: { x: 34, y: 12 }, arrow: { x: 34, y: 50, angle: 90 }, strokeNum: 2 }
    ]
  },
  'K': {
    char: 'K',
    width: 66,
    strokes: [
      { d: 'M 18 12 L 18 90', startPoint: { x: 18, y: 12 }, arrow: { x: 18, y: 51, angle: 90 }, strokeNum: 1 },
      { d: 'M 56 16 L 18 54', startPoint: { x: 56, y: 16 }, arrow: { x: 37, y: 35, angle: 135 }, strokeNum: 2 },
      { d: 'M 24 48 L 58 90', startPoint: { x: 24, y: 48 }, arrow: { x: 42, y: 70, angle: 50 }, strokeNum: 3 }
    ]
  },
  'L': {
    char: 'L',
    width: 58,
    strokes: [
      { d: 'M 18 12 L 18 90 L 52 90', startPoint: { x: 18, y: 12 }, arrow: { x: 18, y: 51, angle: 90 }, strokeNum: 1 }
    ]
  },
  'M': {
    char: 'M',
    width: 78,
    strokes: [
      { d: 'M 14 90 L 14 12 L 39 65 L 64 12 L 64 90', startPoint: { x: 14, y: 90 }, arrow: { x: 14, y: 45, angle: 270 }, strokeNum: 1 }
    ]
  },
  'N': {
    char: 'N',
    width: 68,
    strokes: [
      { d: 'M 16 90 L 16 12', startPoint: { x: 16, y: 90 }, arrow: { x: 16, y: 51, angle: 270 }, strokeNum: 1 },
      { d: 'M 16 12 L 52 90', startPoint: { x: 16, y: 12 }, arrow: { x: 34, y: 51, angle: 65 }, strokeNum: 2 },
      { d: 'M 52 90 L 52 12', startPoint: { x: 52, y: 90 }, arrow: { x: 52, y: 51, angle: 270 }, strokeNum: 3 }
    ]
  },
  'O': {
    char: 'O',
    width: 72,
    strokes: [
      { d: 'M 36 12 C 16 12, 14 36, 14 51 C 14 66, 16 90, 36 90 C 56 90, 58 66, 58 51 C 58 36, 56 12, 36 12 Z', startPoint: { x: 36, y: 12 }, arrow: { x: 14, y: 51, angle: 90, type: 'curve_ccw' }, strokeNum: 1 }
    ]
  },
  'P': {
    char: 'P',
    width: 62,
    strokes: [
      { d: 'M 18 12 L 18 90', startPoint: { x: 18, y: 12 }, arrow: { x: 18, y: 51, angle: 90 }, strokeNum: 1 },
      { d: 'M 18 12 C 48 12, 56 24, 56 36 C 56 48, 48 56, 18 56', startPoint: { x: 18, y: 12 }, arrow: { x: 55, y: 34, angle: 90, type: 'curve_cw' }, strokeNum: 2 }
    ]
  },
  'Q': {
    char: 'Q',
    width: 74,
    strokes: [
      { d: 'M 37 12 C 16 12, 14 36, 14 51 C 14 66, 16 90, 37 90 C 58 90, 60 66, 60 51 C 60 36, 58 12, 37 12 Z', startPoint: { x: 37, y: 12 }, arrow: { x: 14, y: 51, angle: 90, type: 'curve_ccw' }, strokeNum: 1 },
      { d: 'M 44 68 L 66 94', startPoint: { x: 44, y: 68 }, arrow: { x: 55, y: 81, angle: 50 }, strokeNum: 2 }
    ]
  },
  'R': {
    char: 'R',
    width: 65,
    strokes: [
      { d: 'M 18 12 L 18 90', startPoint: { x: 18, y: 12 }, arrow: { x: 18, y: 51, angle: 90 }, strokeNum: 1 },
      { d: 'M 18 12 C 48 12, 56 24, 56 36 C 56 48, 48 54, 18 54', startPoint: { x: 18, y: 12 }, arrow: { x: 55, y: 33, angle: 90, type: 'curve_cw' }, strokeNum: 2 },
      { d: 'M 36 54 L 58 90', startPoint: { x: 36, y: 54 }, arrow: { x: 47, y: 72, angle: 60 }, strokeNum: 3 }
    ]
  },
  'S': {
    char: 'S',
    width: 62,
    strokes: [
      { d: 'M 52 24 C 42 12, 18 14, 18 32 C 18 52, 54 48, 54 70 C 54 90, 24 92, 14 78', startPoint: { x: 52, y: 24 }, arrow: { x: 32, y: 48, angle: 60, type: 'curve_ccw' }, strokeNum: 1 }
    ]
  },
  'T': {
    char: 'T',
    width: 64,
    strokes: [
      { d: 'M 8 12 L 56 12', startPoint: { x: 8, y: 12 }, arrow: { x: 32, y: 12, angle: 0 }, strokeNum: 1 },
      { d: 'M 32 12 L 32 90', startPoint: { x: 32, y: 12 }, arrow: { x: 32, y: 51, angle: 90 }, strokeNum: 2 }
    ]
  },
  'U': {
    char: 'U',
    width: 68,
    strokes: [
      { d: 'M 16 12 L 16 64 C 16 88, 52 88, 52 64 L 52 12', startPoint: { x: 16, y: 12 }, arrow: { x: 16, y: 45, angle: 90 }, strokeNum: 1 }
    ]
  },
  'V': {
    char: 'V',
    width: 68,
    strokes: [
      { d: 'M 12 12 L 34 90 L 56 12', startPoint: { x: 12, y: 12 }, arrow: { x: 23, y: 51, angle: 75 }, strokeNum: 1 }
    ]
  },
  'W': {
    char: 'W',
    width: 86,
    strokes: [
      { d: 'M 10 12 L 26 90 L 43 38 L 60 90 L 76 12', startPoint: { x: 10, y: 12 }, arrow: { x: 18, y: 51, angle: 78 }, strokeNum: 1 }
    ]
  },
  'X': {
    char: 'X',
    width: 66,
    strokes: [
      { d: 'M 14 12 L 52 90', startPoint: { x: 14, y: 12 }, arrow: { x: 33, y: 51, angle: 65 }, strokeNum: 1 },
      { d: 'M 52 12 L 14 90', startPoint: { x: 52, y: 12 }, arrow: { x: 33, y: 51, angle: 115 }, strokeNum: 2 }
    ]
  },
  'Y': {
    char: 'Y',
    width: 66,
    strokes: [
      { d: 'M 14 12 L 33 50 L 52 12', startPoint: { x: 14, y: 12 }, arrow: { x: 24, y: 31, angle: 65 }, strokeNum: 1 },
      { d: 'M 33 50 L 33 90', startPoint: { x: 33, y: 50 }, arrow: { x: 33, y: 70, angle: 90 }, strokeNum: 2 }
    ]
  },
  'Z': {
    char: 'Z',
    width: 62,
    strokes: [
      { d: 'M 14 12 L 50 12 L 14 90 L 50 90', startPoint: { x: 14, y: 12 }, arrow: { x: 32, y: 12, angle: 0 }, strokeNum: 1 }
    ]
  },

  // --- LOWERCASE LETTERS (a-z) ---
  'a': {
    char: 'a',
    width: 54,
    strokes: [
      { d: 'M 42 48 C 36 38, 12 40, 12 64 C 12 88, 36 88, 42 78', startPoint: { x: 42, y: 48 }, arrow: { x: 12, y: 64, angle: 90, type: 'curve_ccw' }, strokeNum: 1 },
      { d: 'M 42 38 L 42 90', startPoint: { x: 42, y: 38 }, arrow: { x: 42, y: 64, angle: 90 }, strokeNum: 2 }
    ]
  },
  'b': {
    char: 'b',
    width: 56,
    strokes: [
      { d: 'M 14 12 L 14 90', startPoint: { x: 14, y: 12 }, arrow: { x: 14, y: 51, angle: 90 }, strokeNum: 1 },
      { d: 'M 14 52 C 34 36, 48 46, 48 64 C 48 82, 34 90, 14 90', startPoint: { x: 14, y: 52 }, arrow: { x: 48, y: 64, angle: 90, type: 'curve_cw' }, strokeNum: 2 }
    ]
  },
  'c': {
    char: 'c',
    width: 48,
    strokes: [
      { d: 'M 40 48 C 30 38, 14 42, 14 64 C 14 86, 32 88, 40 80', startPoint: { x: 40, y: 48 }, arrow: { x: 14, y: 64, angle: 90, type: 'curve_ccw' }, strokeNum: 1 }
    ]
  },
  'd': {
    char: 'd',
    width: 56,
    strokes: [
      { d: 'M 42 48 C 34 38, 14 42, 14 64 C 14 86, 32 88, 42 80', startPoint: { x: 42, y: 48 }, arrow: { x: 14, y: 64, angle: 90, type: 'curve_ccw' }, strokeNum: 1 },
      { d: 'M 42 12 L 42 90', startPoint: { x: 42, y: 12 }, arrow: { x: 42, y: 51, angle: 90 }, strokeNum: 2 }
    ]
  },
  'e': {
    char: 'e',
    width: 52,
    strokes: [
      { d: 'M 14 64 L 44 64 C 44 42, 28 38, 14 54 C 8 68, 18 90, 42 84', startPoint: { x: 14, y: 64 }, arrow: { x: 30, y: 64, angle: 0 }, strokeNum: 1 }
    ]
  },
  'f': {
    char: 'f',
    width: 46,
    strokes: [
      { d: 'M 38 18 C 34 12, 22 12, 22 28 L 22 90', startPoint: { x: 38, y: 18 }, arrow: { x: 22, y: 54, angle: 90 }, strokeNum: 1 },
      { d: 'M 10 44 L 36 44', startPoint: { x: 10, y: 44 }, arrow: { x: 23, y: 44, angle: 0 }, strokeNum: 2 }
    ]
  },
  'g': {
    char: 'g',
    width: 56,
    strokes: [
      { d: 'M 42 48 C 34 38, 14 42, 14 64 C 14 86, 32 88, 42 80', startPoint: { x: 42, y: 48 }, arrow: { x: 14, y: 64, angle: 90, type: 'curve_ccw' }, strokeNum: 1 },
      { d: 'M 42 38 L 42 105 C 42 124, 18 124, 14 110', startPoint: { x: 42, y: 38 }, arrow: { x: 42, y: 80, angle: 90 }, strokeNum: 2 }
    ]
  },
  'h': {
    char: 'h',
    width: 54,
    strokes: [
      { d: 'M 14 12 L 14 90', startPoint: { x: 14, y: 12 }, arrow: { x: 14, y: 51, angle: 90 }, strokeNum: 1 },
      { d: 'M 14 54 C 24 38, 44 38, 44 58 L 44 90', startPoint: { x: 14, y: 54 }, arrow: { x: 44, y: 72, angle: 90 }, strokeNum: 2 }
    ]
  },
  'i': {
    char: 'i',
    width: 34,
    strokes: [
      { d: 'M 17 38 L 17 90', startPoint: { x: 17, y: 38 }, arrow: { x: 17, y: 64, angle: 90 }, strokeNum: 1 },
      { d: 'M 17 20 L 17 24', startPoint: { x: 17, y: 22 }, arrow: { x: 17, y: 22, angle: 0, type: 'dot' }, strokeNum: 2 }
    ]
  },
  'j': {
    char: 'j',
    width: 38,
    strokes: [
      { d: 'M 24 38 L 24 105 C 24 124, 8 124, 6 110', startPoint: { x: 24, y: 38 }, arrow: { x: 24, y: 74, angle: 90 }, strokeNum: 1 },
      { d: 'M 24 20 L 24 24', startPoint: { x: 24, y: 22 }, arrow: { x: 24, y: 22, angle: 0, type: 'dot' }, strokeNum: 2 }
    ]
  },
  'k': {
    char: 'k',
    width: 52,
    strokes: [
      { d: 'M 14 12 L 14 90', startPoint: { x: 14, y: 12 }, arrow: { x: 14, y: 51, angle: 90 }, strokeNum: 1 },
      { d: 'M 42 42 L 14 66', startPoint: { x: 42, y: 42 }, arrow: { x: 28, y: 54, angle: 140 }, strokeNum: 2 },
      { d: 'M 20 60 L 44 90', startPoint: { x: 20, y: 60 }, arrow: { x: 32, y: 75, angle: 50 }, strokeNum: 3 }
    ]
  },
  'l': {
    char: 'l',
    width: 34,
    strokes: [
      { d: 'M 17 12 L 17 84 C 17 88, 22 90, 26 90', startPoint: { x: 17, y: 12 }, arrow: { x: 17, y: 51, angle: 90 }, strokeNum: 1 }
    ]
  },
  'm': {
    char: 'm',
    width: 76,
    strokes: [
      { d: 'M 12 38 L 12 90', startPoint: { x: 12, y: 38 }, arrow: { x: 12, y: 64, angle: 90 }, strokeNum: 1 },
      { d: 'M 12 54 C 20 38, 38 38, 38 56 L 38 90', startPoint: { x: 12, y: 54 }, arrow: { x: 38, y: 72, angle: 90 }, strokeNum: 2 },
      { d: 'M 38 54 C 46 38, 64 38, 64 56 L 64 90', startPoint: { x: 38, y: 54 }, arrow: { x: 64, y: 72, angle: 90 }, strokeNum: 3 }
    ]
  },
  'n': {
    char: 'n',
    width: 54,
    strokes: [
      { d: 'M 14 38 L 14 90', startPoint: { x: 14, y: 38 }, arrow: { x: 14, y: 64, angle: 90 }, strokeNum: 1 },
      { d: 'M 14 54 C 24 38, 44 38, 44 58 L 44 90', startPoint: { x: 14, y: 54 }, arrow: { x: 44, y: 72, angle: 90 }, strokeNum: 2 }
    ]
  },
  'o': {
    char: 'o',
    width: 54,
    strokes: [
      { d: 'M 27 38 C 12 38, 10 54, 10 64 C 10 74, 12 90, 27 90 C 42 90, 44 74, 44 64 C 44 54, 42 38, 27 38 Z', startPoint: { x: 27, y: 38 }, arrow: { x: 10, y: 64, angle: 90, type: 'curve_ccw' }, strokeNum: 1 }
    ]
  },
  'p': {
    char: 'p',
    width: 56,
    strokes: [
      { d: 'M 14 38 L 14 120', startPoint: { x: 14, y: 38 }, arrow: { x: 14, y: 75, angle: 90 }, strokeNum: 1 },
      { d: 'M 14 52 C 34 36, 48 46, 48 64 C 48 82, 34 90, 14 90', startPoint: { x: 14, y: 52 }, arrow: { x: 48, y: 64, angle: 90, type: 'curve_cw' }, strokeNum: 2 }
    ]
  },
  'q': {
    char: 'q',
    width: 56,
    strokes: [
      { d: 'M 42 48 C 34 38, 14 42, 14 64 C 14 86, 32 88, 42 80', startPoint: { x: 42, y: 48 }, arrow: { x: 14, y: 64, angle: 90, type: 'curve_ccw' }, strokeNum: 1 },
      { d: 'M 42 38 L 42 120', startPoint: { x: 42, y: 38 }, arrow: { x: 42, y: 75, angle: 90 }, strokeNum: 2 }
    ]
  },
  'r': {
    char: 'r',
    width: 44,
    strokes: [
      { d: 'M 14 38 L 14 90', startPoint: { x: 14, y: 38 }, arrow: { x: 14, y: 64, angle: 90 }, strokeNum: 1 },
      { d: 'M 14 54 C 22 40, 36 38, 40 44', startPoint: { x: 14, y: 54 }, arrow: { x: 30, y: 42, angle: 25 }, strokeNum: 2 }
    ]
  },
  's': {
    char: 's',
    width: 46,
    strokes: [
      { d: 'M 38 46 C 30 38, 14 40, 14 52 C 14 66, 38 64, 38 78 C 38 90, 18 90, 12 82', startPoint: { x: 38, y: 46 }, arrow: { x: 26, y: 64, angle: 60, type: 'curve_ccw' }, strokeNum: 1 }
    ]
  },
  't': {
    char: 't',
    width: 44,
    strokes: [
      { d: 'M 22 18 L 22 82 C 22 88, 28 90, 34 90', startPoint: { x: 22, y: 18 }, arrow: { x: 22, y: 54, angle: 90 }, strokeNum: 1 },
      { d: 'M 10 40 L 34 40', startPoint: { x: 10, y: 40 }, arrow: { x: 22, y: 40, angle: 0 }, strokeNum: 2 }
    ]
  },
  'u': {
    char: 'u',
    width: 54,
    strokes: [
      { d: 'M 14 38 L 14 74 C 14 88, 42 88, 42 74 L 42 38', startPoint: { x: 14, y: 38 }, arrow: { x: 14, y: 60, angle: 90 }, strokeNum: 1 },
      { d: 'M 42 38 L 42 90', startPoint: { x: 42, y: 38 }, arrow: { x: 42, y: 64, angle: 90 }, strokeNum: 2 }
    ]
  },
  'v': {
    char: 'v',
    width: 52,
    strokes: [
      { d: 'M 10 38 L 26 90 L 42 38', startPoint: { x: 10, y: 38 }, arrow: { x: 18, y: 64, angle: 72 }, strokeNum: 1 }
    ]
  },
  'w': {
    char: 'w',
    width: 72,
    strokes: [
      { d: 'M 8 38 L 20 90 L 36 54 L 52 90 L 64 38', startPoint: { x: 8, y: 38 }, arrow: { x: 14, y: 64, angle: 76 }, strokeNum: 1 }
    ]
  },
  'x': {
    char: 'x',
    width: 50,
    strokes: [
      { d: 'M 12 38 L 38 90', startPoint: { x: 12, y: 38 }, arrow: { x: 25, y: 64, angle: 63 }, strokeNum: 1 },
      { d: 'M 38 38 L 12 90', startPoint: { x: 38, y: 38 }, arrow: { x: 25, y: 64, angle: 117 }, strokeNum: 2 }
    ]
  },
  'y': {
    char: 'y',
    width: 52,
    strokes: [
      { d: 'M 10 38 L 26 74', startPoint: { x: 10, y: 38 }, arrow: { x: 18, y: 56, angle: 65 }, strokeNum: 1 },
      { d: 'M 42 38 L 16 118', startPoint: { x: 42, y: 38 }, arrow: { x: 29, y: 78, angle: 115 }, strokeNum: 2 }
    ]
  },
  'z': {
    char: 'z',
    width: 48,
    strokes: [
      { d: 'M 10 38 L 38 38 L 10 90 L 38 90', startPoint: { x: 10, y: 38 }, arrow: { x: 24, y: 38, angle: 0 }, strokeNum: 1 }
    ]
  },
  // Punctuation & Special
  ' ': {
    char: ' ',
    width: 32,
    strokes: []
  },
  '.': {
    char: '.',
    width: 24,
    strokes: [
      { d: 'M 12 84 L 12 90', startPoint: { x: 12, y: 86 }, arrow: { x: 12, y: 86, angle: 0, type: 'dot' }, strokeNum: 1 }
    ]
  },
  '!': {
    char: '!',
    width: 28,
    strokes: [
      { d: 'M 14 12 L 14 68', startPoint: { x: 14, y: 12 }, arrow: { x: 14, y: 40, angle: 90 }, strokeNum: 1 },
      { d: 'M 14 84 L 14 90', startPoint: { x: 14, y: 86 }, arrow: { x: 14, y: 86, angle: 0, type: 'dot' }, strokeNum: 2 }
    ]
  },
  '?': {
    char: '?',
    width: 48,
    strokes: [
      { d: 'M 14 26 C 14 12, 34 12, 34 26 C 34 44, 24 46, 24 64', startPoint: { x: 14, y: 26 }, arrow: { x: 30, y: 20, angle: 60 }, strokeNum: 1 },
      { d: 'M 24 84 L 24 90', startPoint: { x: 24, y: 86 }, arrow: { x: 24, y: 86, angle: 0, type: 'dot' }, strokeNum: 2 }
    ]
  },
  '-': {
    char: '-',
    width: 34,
    strokes: [
      { d: 'M 8 62 L 26 62', startPoint: { x: 8, y: 62 }, arrow: { x: 17, y: 62, angle: 0 }, strokeNum: 1 }
    ]
  },
  '\'': {
    char: '\'',
    width: 22,
    strokes: [
      { d: 'M 11 12 L 11 26', startPoint: { x: 11, y: 12 }, arrow: { x: 11, y: 19, angle: 90 }, strokeNum: 1 }
    ]
  }
};
