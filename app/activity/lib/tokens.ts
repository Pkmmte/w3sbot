export const colors = {
  desk: { surface: '#8B7355', surfaceDark: '#6B5344', shadow: 'rgba(0,0,0,0.3)' },
  book: { cover: '#8B4513', coverDark: '#6B3410', spine: '#5D2E0C', pages: '#FAF0E6', title: '#FFD700' },
  ui: { primary: '#3B82F6', success: '#22C55E', warning: '#F59E0B', idle: '#6B7280', focus: '#8B5CF6' },
  ambient: { background: '#1a1a2e', glow: 'rgba(59,130,246,0.1)' },
};

export const depth = { background: -100, desk: -50, objects: 0, objectsHover: 20, foreground: 30, ui: 50 };

export const timing = { instant: 0.1, fast: 0.2, normal: 0.3, slow: 0.5, dramatic: 0.8 };

export const springs = {
  snappy: { type: "spring" as const, stiffness: 400, damping: 30 },
  gentle: { type: "spring" as const, stiffness: 200, damping: 20 },
  bouncy: { type: "spring" as const, stiffness: 300, damping: 15 },
};
