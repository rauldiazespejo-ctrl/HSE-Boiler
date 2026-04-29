export const colors = {
  // Fondos principales (Dark theme - Zinc style)
  background: {
    main: '#09090B', // Zinc 950 - Casi negro absoluto
    paper: '#18181B', // Zinc 900 - Tarjetas oscuras
    elevated: '#27272A', // Zinc 800 - Modales y superpuestos
  },
  
  // Acentos y estados
  primary: {
    main: '#E11D48', // Rojo intenso moderno (Rose 600) en lugar de #9B1B1B
    light: '#F43F5E',
    dark: '#BE123C',
    gradient: ['#E11D48', '#BE123C'], // Suavizado
  },
  secondary: {
    main: '#8B5CF6', 
    gradient: ['#8B5CF6', '#7C3AED'],
  },
  
  // Semánticos HSE
  status: {
    danger: '#EF4444', 
    warning: '#F59E0B', 
    success: '#10B981', 
    info: '#3B82F6',    
  },

  // Gradientes semánticos
  gradients: {
    danger: ['#EF4444', '#DC2626'],
    warning: ['#F59E0B', '#D97706'],
    success: ['#10B981', '#059669'],
    surface: ['rgba(39, 39, 42, 0.6)', 'rgba(24, 24, 27, 0.4)'], // Glassmorphism Zinc
  },
  
  // Texto y tipografía
  text: {
    primary: '#FAFAFA', // Zinc 50
    secondary: '#A1A1AA', // Zinc 400
    disabled: '#52525B', // Zinc 600
    inverse: '#09090B',
  },
  
  // Bordes y divisores
  border: {
    light: 'rgba(255, 255, 255, 0.06)',
    medium: 'rgba(255, 255, 255, 0.12)',
  }
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  }),
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
