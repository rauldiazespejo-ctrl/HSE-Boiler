export const COLORS = {
  // Dark Industrial Theme
  background: '#0F172A', // Slate 900
  surface: '#1E293B',    // Slate 800
  surfaceLight: '#334155', // Slate 700
  
  // Accents
  primary: '#3B82F6',    // Blue 500
  primaryDark: '#2563EB',// Blue 600
  secondary: '#8B5CF6',  // Violet 500
  
  // States & Alerts
  danger: '#EF4444',     // Red 500 (Crítico, Quemaduras)
  warning: '#F59E0B',    // Amber 500 (Hot Work, Medio)
  success: '#10B981',    // Emerald 500 (Aprobado, OK)
  info: '#06B6D4',       // Cyan 500
  
  // Text
  textPrimary: '#F8FAFC',// Slate 50
  textSecondary: '#94A3B8', // Slate 400
  textMuted: '#64748B',  // Slate 500
  
  // Borders & Dividers
  border: '#334155',     // Slate 700
  borderLight: '#475569',// Slate 600
  
  // Special
  glass: 'rgba(30, 41, 59, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  }
};

export default { COLORS, SPACING, TYPOGRAPHY };
