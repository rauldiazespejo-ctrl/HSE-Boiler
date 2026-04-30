import React, { createContext, useState, ReactNode } from 'react';

export interface Anexo {
  id: string;
  nombre: string;
  requerido: boolean;
  base64: string | null;
  tipoMime: string | null;
}

export type TipoPermiso =
  | 'TRABAJO_CALIENTE'
  | 'IZAJE_GRUA'
  | 'MECANIZADO_CNC'
  | 'TORNERIA'
  | 'ESMERILADO'
  | 'TRABAJO_ALTURA'
  | 'TRABAJO_ELECTRICO'
  | 'MANTENIMIENTO'
  | 'GRUA_HORQUILLA'
  | 'ESPACIO_CONFINADO'
  | '';

export const TIPO_LABELS: Record<string, string> = {
  TRABAJO_CALIENTE:  'Trabajo en Caliente',
  IZAJE_GRUA:        'Izaje con Puente Grúa',
  MECANIZADO_CNC:    'Mecanizado CNC / Fresado',
  TORNERIA:          'Tornería',
  ESMERILADO:        'Esmerilado / Desbaste',
  TRABAJO_ALTURA:    'Trabajo en Altura',
  TRABAJO_ELECTRICO: 'Trabajo Eléctrico',
  MANTENIMIENTO:     'Mantención de Equipos',
  GRUA_HORQUILLA:    'Grúa Horquilla',
  ESPACIO_CONFINADO: 'Espacio Confinado',
};

export interface ControlCritico {
  verificado: boolean;
  fotoBase64?: string | null;
}

export interface ChecklistItem {
  id: string;
  descripcion: string;
  estado: 'OK' | 'NO_OK' | 'NA' | null;
  observacion?: string;
}

export interface UbicacionGPS {
  latitud: number;
  longitud: number;
  timestamp: string;
}

export interface PermisoData {
  tipoPermiso: TipoPermiso;
  zona: string;
  descripcionTrabajo: string;
  equipoTrabajo: string[];
  detalles: Record<string, ControlCritico>;
  riesgosSeleccionados: string[];
  checklistHerramientas: ChecklistItem[];
  checklistEquipos: ChecklistItem[];
  anexos: Anexo[];
  firmaLider: string | null;
  ubicacionGPS: UbicacionGPS | null;
}

const initialState: PermisoData = {
  tipoPermiso: '',
  zona: '',
  descripcionTrabajo: '',
  equipoTrabajo: [],
  detalles: {},
  riesgosSeleccionados: [],
  checklistHerramientas: [],
  checklistEquipos: [],
  anexos: [],
  firmaLider: null,
  ubicacionGPS: null,
};

const CHECKLIST_HERRAMIENTAS_BASE: ChecklistItem[] = [
  { id: 'h1', descripcion: 'Herramientas inspeccionadas y en buen estado', estado: null },
  { id: 'h2', descripcion: 'Herramientas eléctricas con cableado íntegro', estado: null },
  { id: 'h3', descripcion: 'Guardas de seguridad instaladas', estado: null },
  { id: 'h4', descripcion: 'Herramientas identificadas con etiqueta de inspección vigente', estado: null },
  { id: 'h5', descripcion: 'Herramientas cortantes con fundas protectoras', estado: null },
  { id: 'h6', descripcion: 'Llaves y destornilladores sin desgaste excesivo', estado: null },
];

const CHECKLIST_HERRAMIENTAS_CALIENTE: ChecklistItem[] = [
  ...CHECKLIST_HERRAMIENTAS_BASE,
  { id: 'h7', descripcion: 'Equipo de soldadura / corte inspeccionado', estado: null },
  { id: 'h8', descripcion: 'Mangueras y conexiones sin fugas visibles', estado: null },
  { id: 'h9', descripcion: 'Porta-electrodo y masa en buen estado', estado: null },
  { id: 'h10', descripcion: 'Pantalla / careta de soldador disponible', estado: null },
];

const CHECKLIST_HERRAMIENTAS_IZAJE: ChecklistItem[] = [
  ...CHECKLIST_HERRAMIENTAS_BASE,
  { id: 'h7', descripcion: 'Eslingas inspeccionadas (sin cortes, deformaciones)', estado: null },
  { id: 'h8', descripcion: 'Grilletes certificados y con seguro', estado: null },
  { id: 'h9', descripcion: 'Cadenas de izaje sin eslabones dañados', estado: null },
  { id: 'h10', descripcion: 'Ganchos con seguro en buen estado', estado: null },
];

const CHECKLIST_HERRAMIENTAS_CNC: ChecklistItem[] = [
  ...CHECKLIST_HERRAMIENTAS_BASE,
  { id: 'h7', descripcion: 'Herramientas de corte afiladas y montadas correctamente', estado: null },
  { id: 'h8', descripcion: 'Portaherramientas sin desgaste en cono', estado: null },
  { id: 'h9', descripcion: 'Calibres y medidores calibrados', estado: null },
];

const CHECKLIST_EQUIPOS_BASE: ChecklistItem[] = [
  { id: 'e1', descripcion: 'Equipo con revisión técnica al día', estado: null },
  { id: 'e2', descripcion: 'Placa de identificación / certificación visible', estado: null },
  { id: 'e3', descripcion: 'Dispositivos de parada de emergencia funcionando', estado: null },
  { id: 'e4', descripcion: 'Protecciones y resguardos instalados', estado: null },
  { id: 'e5', descripcion: 'Sin fugas de aceite / lubricante visibles', estado: null },
];

const CHECKLIST_EQUIPOS_GRUA: ChecklistItem[] = [
  { id: 'e1', descripcion: 'Certificado de operación vigente (SII / SEC)', estado: null },
  { id: 'e2', descripcion: 'Capacidad de carga visible en estructura', estado: null },
  { id: 'e3', descripcion: 'Limitador de carga funcionando', estado: null },
  { id: 'e4', descripcion: 'Frenos verificados antes del izaje', estado: null },
  { id: 'e5', descripcion: 'Rieles y vía del puente en buen estado', estado: null },
  { id: 'e6', descripcion: 'Botonera / control remoto con todos los comandos funcionales', estado: null },
  { id: 'e7', descripcion: 'Alarma acústica / visual operativa', estado: null },
];

const CHECKLIST_EQUIPOS_TORNO: ChecklistItem[] = [
  { id: 'e1', descripcion: 'Chuck (plato) en buen estado y apretado', estado: null },
  { id: 'e2', descripcion: 'Guarda del chuck instalada', estado: null },
  { id: 'e3', descripcion: 'Sistema de freno operativo', estado: null },
  { id: 'e4', descripcion: 'Lubricación de guías verificada', estado: null },
  { id: 'e5', descripcion: 'Velocidades de giro correctamente configuradas', estado: null },
  { id: 'e6', descripcion: 'Punto de referencia (cero pieza) establecido', estado: null },
];

const CHECKLIST_EQUIPOS_CNC: ChecklistItem[] = [
  { id: 'e1', descripcion: 'Programa CNC verificado y aprobado', estado: null },
  { id: 'e2', descripcion: 'Fijación de pieza inspeccionada (mordaza / plato)', estado: null },
  { id: 'e3', descripcion: 'Puerta de la máquina en buen estado (cierre / sensores)', estado: null },
  { id: 'e4', descripcion: 'Sistema refrigerante (taladrina) con nivel correcto', estado: null },
  { id: 'e5', descripcion: 'Alarmas y paradas de emergencia probadas', estado: null },
  { id: 'e6', descripcion: 'Offset de herramienta cargado correctamente', estado: null },
];

function getChecklistHerramientas(tipo: TipoPermiso): ChecklistItem[] {
  if (tipo === 'TRABAJO_CALIENTE' || tipo === 'ESMERILADO') return CHECKLIST_HERRAMIENTAS_CALIENTE;
  if (tipo === 'IZAJE_GRUA') return CHECKLIST_HERRAMIENTAS_IZAJE;
  if (tipo === 'MECANIZADO_CNC') return CHECKLIST_HERRAMIENTAS_CNC;
  return CHECKLIST_HERRAMIENTAS_BASE;
}

function getChecklistEquipos(tipo: TipoPermiso): ChecklistItem[] {
  if (tipo === 'IZAJE_GRUA') return CHECKLIST_EQUIPOS_GRUA;
  if (tipo === 'TORNERIA') return CHECKLIST_EQUIPOS_TORNO;
  if (tipo === 'MECANIZADO_CNC') return CHECKLIST_EQUIPOS_CNC;
  return CHECKLIST_EQUIPOS_BASE;
}

function getAnexos(tipo: TipoPermiso): Anexo[] {
  const base: Anexo[] = [
    { id: 'ast', nombre: 'AST — Análisis Seguro del Trabajo', requerido: true, base64: null, tipoMime: null },
    { id: 'charla', nombre: 'Registro Charla de Seguridad', requerido: true, base64: null, tipoMime: null },
  ];

  const extra: Record<string, Anexo[]> = {
    TRABAJO_CALIENTE: [
      { id: 'permiso_caliente', nombre: 'Permiso de Trabajo en Caliente', requerido: true, base64: null, tipoMime: null },
      { id: 'extintor', nombre: 'Check Extintor (foto)', requerido: true, base64: null, tipoMime: null },
    ],
    IZAJE_GRUA: [
      { id: 'permiso_izaje', nombre: 'Permiso de Izaje', requerido: true, base64: null, tipoMime: null },
      { id: 'cert_grua', nombre: 'Certificado Puente Grúa vigente', requerido: true, base64: null, tipoMime: null },
      { id: 'plan_izaje', nombre: 'Plan / Croquis de Izaje', requerido: false, base64: null, tipoMime: null },
    ],
    TRABAJO_ALTURA: [
      { id: 'permiso_altura', nombre: 'Permiso de Trabajo en Altura', requerido: true, base64: null, tipoMime: null },
      { id: 'cert_arnes', nombre: 'Certificado de Arnés de Seguridad', requerido: true, base64: null, tipoMime: null },
      { id: 'insp_andamio', nombre: 'Inspección de Andamio / Escalera', requerido: false, base64: null, tipoMime: null },
    ],
    TRABAJO_ELECTRICO: [
      { id: 'permiso_electrico', nombre: 'Permiso de Trabajo Eléctrico', requerido: true, base64: null, tipoMime: null },
      { id: 'bloqueo_tag', nombre: 'Procedimiento LOTO (Bloqueo/Etiquetado)', requerido: true, base64: null, tipoMime: null },
    ],
    ESPACIO_CONFINADO: [
      { id: 'permiso_confinado', nombre: 'Permiso Entrada Espacio Confinado', requerido: true, base64: null, tipoMime: null },
      { id: 'medicion_gas', nombre: 'Registro Medición Gases', requerido: true, base64: null, tipoMime: null },
      { id: 'rescate', nombre: 'Plan de Rescate', requerido: true, base64: null, tipoMime: null },
    ],
    MECANIZADO_CNC: [
      { id: 'programa_cnc', nombre: 'Programa CNC aprobado', requerido: false, base64: null, tipoMime: null },
      { id: 'orden_trabajo', nombre: 'Orden de Trabajo / Plano pieza', requerido: true, base64: null, tipoMime: null },
    ],
    TORNERIA: [
      { id: 'orden_trabajo', nombre: 'Orden de Trabajo / Plano pieza', requerido: true, base64: null, tipoMime: null },
    ],
    ESMERILADO: [
      { id: 'insp_disco', nombre: 'Inspección de Disco Esmeril (foto)', requerido: true, base64: null, tipoMime: null },
    ],
    MANTENIMIENTO: [
      { id: 'orden_mant', nombre: 'Orden de Mantención', requerido: true, base64: null, tipoMime: null },
      { id: 'bloqueo_tag', nombre: 'Registro LOTO si aplica', requerido: false, base64: null, tipoMime: null },
    ],
    GRUA_HORQUILLA: [
      { id: 'check_horquilla', nombre: 'Check Diario Grúa Horquilla', requerido: true, base64: null, tipoMime: null },
      { id: 'lic_operador', nombre: 'Licencia Operador vigente', requerido: true, base64: null, tipoMime: null },
    ],
  };

  return [...base, ...(extra[tipo] || [])];
}

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
    setData({
      ...initialState,
      tipoPermiso: tipo,
      checklistHerramientas: getChecklistHerramientas(tipo),
      checklistEquipos: getChecklistEquipos(tipo),
      anexos: getAnexos(tipo),
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
