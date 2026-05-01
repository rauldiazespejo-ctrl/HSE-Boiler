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
  checklistMedioAmbiente: ChecklistItem[];
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
  checklistMedioAmbiente: [],
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
    { id: 'foto_area', nombre: 'Foto del área de trabajo', requerido: false, base64: null, tipoMime: null },
    { id: 'foto_controles', nombre: 'Foto de controles implementados', requerido: false, base64: null, tipoMime: null },
    { id: 'foto_epp', nombre: 'Foto del EPP del equipo de trabajo', requerido: false, base64: null, tipoMime: null },
  ];

  const extra: Record<string, Anexo[]> = {
    TRABAJO_CALIENTE: [
      { id: 'foto_extintor', nombre: 'Foto del extintor en el área', requerido: false, base64: null, tipoMime: null },
      { id: 'foto_zona_caliente', nombre: 'Foto de zona delimitada / biombo', requerido: false, base64: null, tipoMime: null },
    ],
    IZAJE_GRUA: [
      { id: 'foto_eslinga', nombre: 'Foto de eslingas y accesorios', requerido: false, base64: null, tipoMime: null },
      { id: 'foto_carga', nombre: 'Foto de la carga antes del izaje', requerido: false, base64: null, tipoMime: null },
    ],
    TRABAJO_ALTURA: [
      { id: 'foto_arnes', nombre: 'Foto del arnés puesto correctamente', requerido: false, base64: null, tipoMime: null },
      { id: 'foto_linea_vida', nombre: 'Foto del punto de anclaje / línea de vida', requerido: false, base64: null, tipoMime: null },
    ],
    TRABAJO_ELECTRICO: [
      { id: 'foto_loto', nombre: 'Foto del bloqueo LOTO aplicado', requerido: false, base64: null, tipoMime: null },
    ],
    ESPACIO_CONFINADO: [
      { id: 'foto_medicion', nombre: 'Foto del monitor de gases (pantalla)', requerido: false, base64: null, tipoMime: null },
      { id: 'foto_ingreso', nombre: 'Foto del ingreso al espacio confinado', requerido: false, base64: null, tipoMime: null },
    ],
    MECANIZADO_CNC: [
      { id: 'foto_fijacion', nombre: 'Foto de la fijación de la pieza', requerido: false, base64: null, tipoMime: null },
    ],
    TORNERIA: [
      { id: 'foto_chuck', nombre: 'Foto del chuck y guarda instalada', requerido: false, base64: null, tipoMime: null },
    ],
    ESMERILADO: [
      { id: 'foto_disco', nombre: 'Foto del disco esmeril (verificación)', requerido: false, base64: null, tipoMime: null },
    ],
    MANTENIMIENTO: [
      { id: 'foto_equipo_mant', nombre: 'Foto del equipo a mantener', requerido: false, base64: null, tipoMime: null },
    ],
    GRUA_HORQUILLA: [
      { id: 'foto_horquilla', nombre: 'Foto de la horquilla y mástil', requerido: false, base64: null, tipoMime: null },
    ],
  };

  return [...base, ...(extra[tipo] || [])];
}

const CHECKLIST_MA_BASE: ChecklistItem[] = [
  { id: 'ma1', descripcion: 'Residuos generados identificados y clasificados (peligrosos / no peligrosos)', estado: null },
  { id: 'ma2', descripcion: 'Contenedores de residuos correctamente etiquetados y en buen estado', estado: null },
  { id: 'ma3', descripcion: 'No hay derrames de aceite, lubricante o solvente en el área de trabajo', estado: null },
  { id: 'ma4', descripcion: 'Sustancias peligrosas almacenadas con hoja de seguridad (MSDS) disponible', estado: null },
  { id: 'ma5', descripcion: 'Ventilación adecuada para control de emisiones al ambiente (humos, polvos)', estado: null },
  { id: 'ma6', descripcion: 'Área de trabajo delimitada para evitar contaminación de zonas adyacentes', estado: null },
  { id: 'ma7', descripcion: 'Plan de respuesta ante emergencia ambiental conocido (derrame, incendio)', estado: null },
];

const CHECKLIST_MA_CALIENTE: ChecklistItem[] = [
  ...CHECKLIST_MA_BASE,
  { id: 'ma8', descripcion: 'Extracción de humos de soldadura activa o ventilación forzada', estado: null },
  { id: 'ma9', descripcion: 'Escorias y colillas de electrodo segregadas en recipiente adecuado', estado: null },
];

const CHECKLIST_MA_MECANIZADO: ChecklistItem[] = [
  ...CHECKLIST_MA_BASE,
  { id: 'ma8', descripcion: 'Taladrinas / refrigerantes con manejo controlado (sin contacto con drenajes)', estado: null },
  { id: 'ma9', descripcion: 'Viruta metálica segregada en contenedor habilitado para reciclaje', estado: null },
  { id: 'ma10', descripcion: 'Aceites de corte almacenados en bidones herméticos etiquetados', estado: null },
];

const CHECKLIST_MA_ESMERILADO: ChecklistItem[] = [
  ...CHECKLIST_MA_BASE,
  { id: 'ma8', descripcion: 'Polvo metálico controlado con captación o barreras físicas', estado: null },
  { id: 'ma9', descripcion: 'Fragmentos de disco deteriorado dispuestos como residuo peligroso', estado: null },
];

const CHECKLIST_MA_CONFINADO: ChecklistItem[] = [
  ...CHECKLIST_MA_BASE,
  { id: 'ma8', descripcion: 'Contaminantes en el espacio confinado medidos y dentro de límites permisibles', estado: null },
  { id: 'ma9', descripcion: 'Sin introducción de sustancias de limpieza volátiles sin ventilación verificada', estado: null },
];

function getChecklistMedioAmbiente(tipo: TipoPermiso): ChecklistItem[] {
  if (tipo === 'TRABAJO_CALIENTE') return CHECKLIST_MA_CALIENTE;
  if (tipo === 'MECANIZADO_CNC' || tipo === 'TORNERIA') return CHECKLIST_MA_MECANIZADO;
  if (tipo === 'ESMERILADO') return CHECKLIST_MA_ESMERILADO;
  if (tipo === 'ESPACIO_CONFINADO') return CHECKLIST_MA_CONFINADO;
  return CHECKLIST_MA_BASE;
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
      checklistMedioAmbiente: getChecklistMedioAmbiente(tipo),
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
