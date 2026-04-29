import React, { createContext, useState, ReactNode } from 'react';

export interface Anexo {
  id: string;
  nombre: string;
  requerido: boolean;
  base64: string | null;
  tipoMime: string | null; // application/pdf o image/jpeg
}

export type TipoPermiso = 'HOT_WORK' | 'ALTURA' | 'PUENTE_GRUA' | '';

export interface PermisoData {
  tipoPermiso: TipoPermiso;
  zona: string;
  detalles: Record<string, boolean>;
  riesgosSeleccionados: string[];
  anexos: Anexo[];
  firmaLider: string | null;
}

const initialState: PermisoData = {
  tipoPermiso: '',
  zona: '',
  detalles: {},
  riesgosSeleccionados: [],
  anexos: [],
  firmaLider: null,
};

interface PermisoContextData {
  data: PermisoData;
  updateData: (updates: Partial<PermisoData>) => void;
  initPermiso: (tipo: TipoPermiso) => void;
  resetData: () => void;
}

export const PermisoContext = createContext<PermisoContextData>({} as PermisoContextData);

export const PermisoProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<PermisoData>(initialState);

  const initPermiso = (tipo: TipoPermiso) => {
    let anexosObligatorios: Anexo[] = [
      { id: 'anexo1', nombre: 'Charla Comunicación', requerido: true, base64: null, tipoMime: null },
      { id: 'anexo2', nombre: 'Hoja Control Riesgos (HCR)', requerido: true, base64: null, tipoMime: null },
      { id: 'anexo3', nombre: 'Análisis Seguro del Trabajo (AST)', requerido: true, base64: null, tipoMime: null },
    ];

    if (tipo === 'HOT_WORK') {
      anexosObligatorios.push({ id: 'anexo4', nombre: 'Lista Verificación Caliente', requerido: true, base64: null, tipoMime: null });
    } else if (tipo === 'ALTURA') {
      anexosObligatorios.push(
        { id: 'anexo4', nombre: 'Lista de Verificación de Trabajos en Altura', requerido: true, base64: null, tipoMime: null },
        { id: 'anexo5', nombre: 'Lista de Verificación de Arnés de Seguridad', requerido: true, base64: null, tipoMime: null }
      );
    } else if (tipo === 'PUENTE_GRUA') {
      anexosObligatorios.push({ id: 'anexo4', nombre: 'Registro Operación Puente Grúa', requerido: true, base64: null, tipoMime: null });
    }

    setData({
      ...initialState,
      tipoPermiso: tipo,
      anexos: anexosObligatorios,
    });
  };

  const updateData = (updates: Partial<PermisoData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const resetData = () => {
    setData(initialState);
  };

  return (
    <PermisoContext.Provider value={{ data, updateData, initPermiso, resetData }}>
      {children}
    </PermisoContext.Provider>
  );
};
