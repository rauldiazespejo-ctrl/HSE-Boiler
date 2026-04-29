export const colors = {
  // Fondos principales (Dark theme)
  background: {
    main: '#0B0F19', // Azul muy oscuro, casi negro (Industrial Dark)
    paper: '#1A2235', // Tarjetas y paneles
    elevated: '#252F46', // Modales y elementos superpuestos
  },
  
  // Acentos y estados
  primary: {
    main: '#3B82F6', // Azul brillante moderno
    light: '#60A5FA',
    dark: '#2563EB',
    gradient: ['#3B82F6', '#2563EB'], // Para botones principales
  },
  secondary: {
    main: '#8B5CF6', // Púrpura sutil para acciones secundarias
    gradient: ['#8B5CF6', '#6D28D9'],
  },
  
  // Semánticos HSE
  status: {
    danger: '#EF4444', // Rojo crítico (Hot Work, Riesgos altos)
    warning: '#F59E0B', // Naranja/Amarillo (AST, Riesgos medios)
    success: '#10B981', // Verde (Aprobado, Seguro)
    info: '#3B82F6',    // Azul info
  },

  // Gradientes semánticos
  gradients: {
    danger: ['#EF4444', '#DC2626'],
    warning: ['#F59E0B', '#D97706'],
    success: ['#10B981', '#059669'],
    surface: ['rgba(26, 34, 53, 0.8)', 'rgba(26, 34, 53, 0.4)'], // Glassmorphism
  },
  
  // Texto y tipografía
  text: {
    primary: '#F8FAFC', // Blanco hielo
    secondary: '#94A3B8', // Gris azulado (muted)
    disabled: '#475569',
    inverse: '#0F172A',
  },
  
  // Bordes y divisores
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
  }
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
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
