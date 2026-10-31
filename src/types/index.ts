/**
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 * Tipos y Definiciones de Dominio Técnico Industrial
 */

export type ValveType = 
  | 'Compuerta' 
  | 'Globo' 
  | 'Bola' 
  | 'Retencion' 
  | 'Mariposa' 
  | 'Seguridad_PSV' 
  | 'Macho_Plug' 
  | 'Diafragma' 
  | 'Aguja';

export type ValveRating = 
  | '150#' 
  | '300#' 
  | '600#' 
  | '900#' 
  | '1500#' 
  | '2500#' 
  | '600# x 150#'
  | 'PN16' 
  | 'PN25' 
  | 'PN40' 
  | 'PN100'
  | string;

export type EndConnection = 
  | 'RF (Raised Face)' 
  | 'RTJ (Ring Type Joint)' 
  | 'BW (Butt Weld)' 
  | 'SW (Socket Weld)' 
  | 'NPT' 
  | 'Wafer' 
  | 'Lug';

export type QAQCStatus = 
  | 'RECEPCION' 
  | 'PRUEBA_PENDIENTE' 
  | 'EN_PRUEBAS' 
  | 'NO_CONFORME' 
  | 'PUNCH_LIST_ABIERTO' 
  | 'LIBERADA_QAQC' 
  | 'APROBADA_ITO' 
  | 'ENTREGADA_FAENA';

export type TestStandard = 
  | 'API 598' 
  | 'ISO 5208' 
  | 'ASME B16.34' 
  | 'MSS-SP-61'
  | 'NCh 700'
  | 'NCh 699'
  | 'NCh 1360'
  | 'NCh 2087'
  | 'NCh 2369';

export type TestResult = 'APROBADO' | 'RECHAZADO' | 'EN_OBSERVACION' | 'NO_APLICA';

export type DeviationSeverity = 'TIPO_A_CRITICO' | 'TIPO_B_MAYOR' | 'TIPO_C_MENOR';

export type DeviationStatus = 'ABIERTA' | 'EN_CORRECCION' | 'VERIFICADA_ITO' | 'CERRADA';

export type UserRole = 'ADMINISTRADOR' | 'REVISOR_QAQC' | 'INSPECTOR_ITO' | 'OPERADOR_TALLER' | 'CONSULTA';

export interface UserSession {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  cargo: string;
  organizacion: string;
  firmaDigital: string;
}

export interface ManometerRecord {
  id: string;
  tag: string;
  brand: string;
  serialNumber: string;
  rangeMin: number;
  rangeMax: number;
  unit: string;
  certNumber: string;
  calibrationDate: string;
  expiryDate: string;
  status: 'VIGENTE' | 'POR_VENCER' | 'VENCIDO';
}

export interface ValveRecord {
  id: string;
  tag: string; // TAG identificador único (e.g. 100-XV-0101)
  ot: string;  // Orden de Trabajo (e.g. OT-2026-0842)
  tipo_valvula: ValveType | string;
  marca: string;
  modelo: string;
  diametro_nominal: string; // NPS o DN (e.g. 6", 4", DN150)
  nominalDiameterMm?: number;
  clase_rating: ValveRating | number;
  tipo_conexion: EndConnection | string;
  material_cuerpo: string;
  material_asiento: string;
  material_trim: string;
  cv?: number;
  peso_kg?: number;
  presion_diseno_bar?: number;
  temp_diseno_c?: number;
  area_planta: string;
  subArea?: string;
  sistema: string;
  ubicacion_fisica: string;
  estado_qaqc: QAQCStatus;
  inspector_ito: string;
  responsable_taller: string;
  fecha_recepcion: string;
  fecha_liberacion?: string | null;
  numero_certificado?: string | null;
  dossierNumber?: string | null;
  pidNumber?: string | null;
  lineCode?: string | null;
  serialNumber?: string | null;
  actuatorType?: string | null;
  actuatorBrand?: string | null;
  actuatorModel?: string | null;
  actuatorSerial?: string | null;
  failPosition?: string | null;
  positionerBrandModel?: string | null;
  solenoidSpec?: string | null;
  fluidService?: string | null;
  revision?: string | number | null;
  observaciones: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface HydroTestRecord {
  id: string;
  valvula_id: string;
  tag: string;
  ot: string;
  numero_protocolo: string;
  fecha_ensayo: string;
  norma_aplicable: TestStandard;
  fluido_prueba: string;
  temp_fluido_c: number;
  manometro_id: string;
  manometro_calibracion_vigente: string;
  // Prueba de Carcasa (Shell Test)
  presion_carcasa_requerida_bar: number;
  presion_carcasa_aplicada_bar: number;
  tiempo_carcasa_seg: number;
  resultado_carcasa: TestResult;
  obs_carcasa?: string;
  // Prueba de Asiento Alta Presión (High Pressure Closure)
  presion_asiento_hp_requerida_bar: number;
  presion_asiento_hp_aplicada_bar: number;
  tiempo_asiento_hp_seg: number;
  fuga_admisible_asiento: string;
  fuga_medida_asiento: string;
  resultado_asiento_hp: TestResult;
  // Prueba de Asiento Baja Presión (Low Pressure Air Seat)
  presion_asiento_lp_bar: number;
  fuga_medida_lp_burbujas_min: number;
  resultado_asiento_lp: TestResult;
  // Prueba de Contrasello (Backseat Test)
  aplica_contrasello: boolean;
  presion_contrasello_bar?: number;
  resultado_contrasello: TestResult;
  // Veredicto General
  resultado_general: TestResult;
  inspector_ejecutor: string;
  inspector_ito_validador: string;
  firma_ito: boolean;
  fecha_firma_ito?: string | null;
  observaciones: string;
  created_at: string;
}

export interface PunchItemRecord {
  id: string;
  valvula_id: string;
  tag: string;
  ot: string;
  codigo_item: string;
  tipo_desviacion: DeviationSeverity;
  categoria: string;
  descripcion: string;
  accion_correctiva: string;
  responsable: string;
  fecha_deteccion: string;
  fecha_limite: string;
  fecha_cierre?: string;
  estado: DeviationStatus;
  verificado_por_ito?: string;
  evidencia_foto_url?: string;
  created_at: string;
}

export interface AttachmentRecord {
  id: string;
  entidad_tipo: 'valvula' | 'prueba_hidraulica' | 'punch_list' | 'ot';
  entidad_id: string;
  tag: string;
  nombre_archivo: string;
  tipo_documento: 'MTR_CERTIFICADO_MATERIAL' | 'PROTOCOLO_FIRMADO' | 'CERTIFICADO_CALIBRACION' | 'FOTOGRAFIA_ENSAYO' | 'FICHA_TECNICA' | 'OTRO';
  tipo_mime: string;
  tamano_bytes: number;
  subido_por: string;
  fecha_subida: string;
  hash_sha256: string;
  url_almacenamiento?: string;
  contenido_base64?: string;
}

export interface ImportHistoryRecord {
  id: string;
  fecha: string;
  nombre_archivo: string;
  tamano_bytes: number;
  total_filas: number;
  filas_insertadas: number;
  filas_actualizadas: number;
  filas_omitidas: number;
  filas_rechazadas: number;
  usuario: string;
  detalles_json: string; // Reporte de errores y advertencias
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  usuario: string;
  rol: UserRole;
  accion: 'INSERT' | 'UPDATE' | 'DELETE' | 'QA_APPROVAL' | 'ITO_SIGN' | 'PUNCH_CLOSE' | 'IMPORT';
  entidad: string;
  entidad_id: string;
  tag: string;
  cambios: string; // JSON diff
}

// Interfaz para Mapeo de Columnas durante Importación de Excel
export interface ColumnMappingDefinition {
  fieldKey: keyof ValveRecord | 'presion_carcasa_requerida_bar' | 'presion_carcasa_aplicada_bar' | 'resultado_carcasa' | 'fuga_medida_asiento' | 'resultado_ensayo_general';
  label: string;
  required: boolean;
  type: 'string' | 'number' | 'enum' | 'date';
  expectedUnits?: string;
  description: string;
  acceptedAliases: string[];
}

export interface SheetAnalysis {
  sheetName: string;
  rowCount: number;
  colCount: number;
  headers: string[];
  sampleRows: Record<string, any>[];
  emptyRowsCount: number;
  duplicateHeaders: string[];
}

export interface ImportValidationItem {
  rowNumber: number;
  data: Record<string, any>;
  parsedRecord?: Partial<ValveRecord>;
  errors: string[];
  warnings: string[];
  status: 'VALID' | 'WARNING' | 'ERROR';
  matchExisting?: ValveRecord;
  duplicateAction: 'INSERT' | 'UPDATE' | 'SKIP';
}
