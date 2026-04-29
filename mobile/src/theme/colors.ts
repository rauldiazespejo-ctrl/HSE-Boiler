export const colors = {
  background: {
    main: '#07080E',
    paper: '#0D1018',
    elevated: '#141720',
    card: '#181C28',
  },
  primary: {
    main: '#F97316',
    light: '#FB923C',
    dark: '#EA580C',
    gradient: ['#F97316', '#C2410C'] as [string, string],
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
    primary: ['#F97316', '#C2410C'] as [string, string],
    surface: ['rgba(20,23,32,0.85)', 'rgba(13,16,24,0.6)'] as [string, string],
  },
  text: {
    primary:   '#F1F5F9',
    secondary: '#94A3B8',
    disabled:  '#475569',
    inverse:   '#07080E',
    accent:    '#FB923C',
  },
  border: {
    light:  'rgba(255,255,255,0.06)',
    medium: 'rgba(255,255,255,0.11)',
    accent: 'rgba(249,115,22,0.3)',
  },
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
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
