export const colors = {
  background: {
    main: '#080608',
    paper: '#0F0A0C',
    elevated: '#180F12',
    card: '#1E1318',
  },
  primary: {
    main: '#C41230',
    light: '#E01A3C',
    dark: '#8B0000',
    gradient: ['#C41230', '#7A0000'] as [string, string],
  },
  secondary: {
    main: '#38BDF8',
    gradient: ['#38BDF8', '#0EA5E9'] as [string, string],
  },
  status: {
    danger:  '#EF4444',
    warning: '#F59E0B',
    success: '#22C55E',
    info:    '#38BDF8',
  },
  gradients: {
    danger:  ['#EF4444', '#DC2626'] as [string, string],
    warning: ['#F59E0B', '#D97706'] as [string, string],
    success: ['#22C55E', '#16A34A'] as [string, string],
    primary: ['#C41230', '#7A0000'] as [string, string],
    surface: ['rgba(24,15,18,0.9)', 'rgba(15,10,12,0.7)'] as [string, string],
  },
  text: {
    primary:   '#F1F5F9',
    secondary: '#94A3B8',
    disabled:  '#4B5563',
    inverse:   '#080608',
    accent:    '#E01A3C',
  },
  border: {
    light:  'rgba(255,255,255,0.07)',
    medium: 'rgba(255,255,255,0.12)',
    accent: 'rgba(196,18,48,0.35)',
  },
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  }),
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
};
