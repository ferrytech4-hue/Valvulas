/**
 * Catálogo Oficial de Campos de la Matriz PGP 2026
 * Mapeo y Trazabilidad entre Excel Original y Esquema PostgreSQL
 */

export interface FieldCatalogItem {
  nombreOriginal: string;
  hojaOrigen: string;
  columnaOriginal: string;
  tipoDato: 'VARCHAR' | 'NUMERIC' | 'INTEGER' | 'DATE' | 'BOOLEAN' | 'ENUM';
  unidad?: string;
  esObligatorio: boolean;
  validacionAplicable: string;
  tablaDestino: string;
  columnaDestino: string;
  contieneFormula: boolean;
  formulaReferencia?: string;
  observaciones: string;
}

export const PGP_FIELD_CATALOG: FieldCatalogItem[] = [
  {
    nombreOriginal: 'TAG / CÓDIGO',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'A',
    tipoDato: 'VARCHAR',
    esObligatorio: true,
    validacionAplicable: 'Formato alfanumérico no vacío. Único en base de datos. Longitud 3-100.',
    tablaDestino: 'valvulas',
    columnaDestino: 'tag',
    contieneFormula: false,
    observaciones: 'Identificador maestro del activo en terreno.'
  },
  {
    nombreOriginal: 'ORDEN DE TRABAJO (O/T)',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'B',
    tipoDato: 'VARCHAR',
    esObligatorio: true,
    validacionAplicable: 'No nulo. Formato OT-YYYY-XXXX o código SAP.',
    tablaDestino: 'valvulas',
    columnaDestino: 'ot',
    contieneFormula: false,
    observaciones: 'Asociación a orden de mantenimiento o comisionamiento.'
  },
  {
    nombreOriginal: 'TIPO DE VÁLVULA',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'C',
    tipoDato: 'ENUM',
    esObligatorio: true,
    validacionAplicable: 'Debe pertenecer a lista estándar PGP (Compuerta, Globo, Bola, Retencion, Mariposa, Seguridad_PSV, Macho_Plug, Diafragma, Aguja).',
    tablaDestino: 'valvulas',
    columnaDestino: 'tipo_valvula',
    contieneFormula: false,
    observaciones: 'Determina norma de prueba de cierre y tiempo de mantención API 598.'
  },
  {
    nombreOriginal: 'FABRICANTE / MARCA',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'D',
    tipoDato: 'VARCHAR',
    esObligatorio: true,
    validacionAplicable: 'Texto no vacío.',
    tablaDestino: 'valvulas',
    columnaDestino: 'marca',
    contieneFormula: false,
    observaciones: 'Marca del fabricante original homologado.'
  },
  {
    nombreOriginal: 'MODELO / SERIE',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'E',
    tipoDato: 'VARCHAR',
    esObligatorio: true,
    validacionAplicable: 'Texto.',
    tablaDestino: 'valvulas',
    columnaDestino: 'modelo',
    contieneFormula: false,
    observaciones: 'Modelo según catálogo de fabricante.'
  },
  {
    nombreOriginal: 'DIÁMETRO NOMINAL (DN/NPS)',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'F',
    tipoDato: 'VARCHAR',
    unidad: 'Pulgadas (") o DN (mm)',
    esObligatorio: true,
    validacionAplicable: 'NPS estándar 1/2" a 36" o DN 15 a 900.',
    tablaDestino: 'valvulas',
    columnaDestino: 'diametro_nominal',
    contieneFormula: false,
    observaciones: 'Parámetro clave para calcular tiempos de ensayo según API 598 Tabla 4.'
  },
  {
    nombreOriginal: 'CLASE / RATING (ASME/PN)',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'G',
    tipoDato: 'VARCHAR',
    unidad: 'Clase ASME (#) o PN (bar)',
    esObligatorio: true,
    validacionAplicable: '150#, 300#, 600#, 900#, 1500#, 2500#, PN16, PN25, PN40, etc.',
    tablaDestino: 'valvulas',
    columnaDestino: 'clase_rating',
    contieneFormula: false,
    observaciones: 'Determina la presión de prueba hidrostática de carcasa (1.5x rating a 38°C según ASME B16.34).'
  },
  {
    nombreOriginal: 'TIPO DE CONEXIÓN',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'H',
    tipoDato: 'VARCHAR',
    esObligatorio: true,
    validacionAplicable: 'RF, RTJ, BW, SW, NPT, Wafer, Lug.',
    tablaDestino: 'valvulas',
    columnaDestino: 'tipo_conexion',
    contieneFormula: false,
    observaciones: 'Terminación de extremos de la válvula.'
  },
  {
    nombreOriginal: 'MATERIAL DEL CUERPO',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'I',
    tipoDato: 'VARCHAR',
    esObligatorio: true,
    validacionAplicable: 'Norma ASTM válida (e.g. A216 WCB, A351 CF8M, A105, A182 F316).',
    tablaDestino: 'valvulas',
    columnaDestino: 'material_cuerpo',
    contieneFormula: false,
    observaciones: 'Requiere trazabilidad con MTR (Mill Test Report).'
  },
  {
    nombreOriginal: 'MATERIAL DE ASIENTO',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'J',
    tipoDato: 'VARCHAR',
    esObligatorio: true,
    validacionAplicable: 'Material elasto/plástico o metal (PTFE, RPTFE, PEEK, Stellite Gr.6, etc.).',
    tablaDestino: 'valvulas',
    columnaDestino: 'material_asiento',
    contieneFormula: false,
    observaciones: 'Determina si la fuga admisible en asiento es cero (blando) o tasa API 598 (metal).'
  },
  {
    nombreOriginal: 'API TRIM',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'K',
    tipoDato: 'VARCHAR',
    esObligatorio: true,
    validacionAplicable: 'Trim 1 a 18 (e.g. Trim 8, Trim 5, Trim 12) o aleación específica.',
    tablaDestino: 'valvulas',
    columnaDestino: 'material_trim',
    contieneFormula: false,
    observaciones: 'Especificación de componentes internos (vástago, obturador, asiento).'
  },
  {
    nombreOriginal: 'COEFICIENTE CV',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'L',
    tipoDato: 'NUMERIC',
    unidad: 'gpm/psi^0.5',
    esObligatorio: false,
    validacionAplicable: 'Valor numérico mayor a 0 si está informado.',
    tablaDestino: 'valvulas',
    columnaDestino: 'cv',
    contieneFormula: false,
    observaciones: 'Capacidad de caudal nominal.'
  },
  {
    nombreOriginal: 'PESO (KG)',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'M',
    tipoDato: 'NUMERIC',
    unidad: 'kg',
    esObligatorio: false,
    validacionAplicable: 'Valor numérico >= 0.',
    tablaDestino: 'valvulas',
    columnaDestino: 'peso_kg',
    contieneFormula: false,
    observaciones: 'Para planificación de izaje y montaje.'
  },
  {
    nombreOriginal: 'PRESIÓN DE DISEÑO',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'N',
    tipoDato: 'NUMERIC',
    unidad: 'bar (o psi)',
    esObligatorio: false,
    validacionAplicable: 'Numérico positivo.',
    tablaDestino: 'valvulas',
    columnaDestino: 'presion_diseno_bar',
    contieneFormula: false,
    observaciones: 'Presión máxima de operación a temperatura de diseño.'
  },
  {
    nombreOriginal: 'ÁREA / PLANTA',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'O',
    tipoDato: 'VARCHAR',
    esObligatorio: true,
    validacionAplicable: 'Texto no vacío.',
    tablaDestino: 'valvulas',
    columnaDestino: 'area_planta',
    contieneFormula: false,
    observaciones: 'Área geográfica o de proceso en la faena minera / industrial.'
  },
  {
    nombreOriginal: 'SISTEMA / SUBSISTEMA',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'P',
    tipoDato: 'VARCHAR',
    esObligatorio: true,
    validacionAplicable: 'Texto no vacío.',
    tablaDestino: 'valvulas',
    columnaDestino: 'sistema',
    contieneFormula: false,
    observaciones: 'Fluido de proceso o servicio.'
  },
  {
    nombreOriginal: 'UBICACIÓN FÍSICA',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'Q',
    tipoDato: 'VARCHAR',
    esObligatorio: true,
    validacionAplicable: 'Texto no vacío.',
    tablaDestino: 'valvulas',
    columnaDestino: 'ubicacion_fisica',
    contieneFormula: false,
    observaciones: 'Coordenadas, línea de piping o estante de taller.'
  },
  {
    nombreOriginal: 'ESTADO QA/QC',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'R',
    tipoDato: 'ENUM',
    esObligatorio: true,
    validacionAplicable: 'Valores válidos: RECEPCION, PRUEBA_PENDIENTE, EN_PRUEBAS, NO_CONFORME, PUNCH_LIST_ABIERTO, LIBERADA_QAQC, APROBADA_ITO, ENTREGADA_FAENA.',
    tablaDestino: 'valvulas',
    columnaDestino: 'estado_qaqc',
    contieneFormula: true,
    formulaReferencia: '=IF(COUNTIF(Punch_List!A:A, A2)>0, "PUNCH_LIST_ABIERTO", IF(Pruebas!R2="APROBADO", "LIBERADA_QAQC", "PRUEBA_PENDIENTE"))',
    observaciones: 'Estado de calidad formal. Conserva la regla de bloqueo si hay Punch List Tipo A.'
  },
  {
    nombreOriginal: 'INSPECTOR ITO',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'S',
    tipoDato: 'VARCHAR',
    esObligatorio: true,
    validacionAplicable: 'Nombre del inspector ITO acreditado.',
    tablaDestino: 'valvulas',
    columnaDestino: 'inspector_ito',
    contieneFormula: false,
    observaciones: 'Representante de inspección técnica del cliente.'
  },
  {
    nombreOriginal: 'RESPONSABLE TALLER',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'T',
    tipoDato: 'VARCHAR',
    esObligatorio: true,
    validacionAplicable: 'Nombre técnico o jefe de taller ejecutor.',
    tablaDestino: 'valvulas',
    columnaDestino: 'responsable_taller',
    contieneFormula: false,
    observaciones: 'Encargado del armado, mecanizado o prueba.'
  },
  {
    nombreOriginal: 'FECHA RECEPCIÓN',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'U',
    tipoDato: 'DATE',
    esObligatorio: true,
    validacionAplicable: 'Fecha válida en formato YYYY-MM-DD.',
    tablaDestino: 'valvulas',
    columnaDestino: 'fecha_recepcion',
    contieneFormula: false,
    observaciones: 'Ingreso al registro de calidad PGP.'
  },
  {
    nombreOriginal: 'Nº CERTIFICADO CALIDAD',
    hojaOrigen: 'Matriz_Valvulas_PGP',
    columnaOriginal: 'V',
    tipoDato: 'VARCHAR',
    esObligatorio: false,
    validacionAplicable: 'Obligatorio al pasar a estado LIBERADA_QAQC o APROBADA_ITO.',
    tablaDestino: 'valvulas',
    columnaDestino: 'numero_certificado',
    contieneFormula: false,
    observaciones: 'Número único de dossier de calidad.'
  },
  {
    nombreOriginal: 'PRESIÓN PRUEBA CARCASA (BAR)',
    hojaOrigen: 'Pruebas_Hidraulicas',
    columnaOriginal: 'H',
    tipoDato: 'NUMERIC',
    unidad: 'bar',
    esObligatorio: false,
    validacionAplicable: 'Numérico >= 1.5 * Presión Rating ASME B16.34.',
    tablaDestino: 'pruebas_hidraulicas',
    columnaDestino: 'presion_carcasa_requerida_bar',
    contieneFormula: true,
    formulaReferencia: '=Rating_Factor * 1.5',
    observaciones: 'Calculada según norma ASME B16.34 Tabla 2.'
  },
  {
    nombreOriginal: 'RESULTADO ENSAYO GENERAL',
    hojaOrigen: 'Pruebas_Hidraulicas',
    columnaOriginal: 'P',
    tipoDato: 'ENUM',
    esObligatorio: false,
    validacionAplicable: 'APROBADO o RECHAZADO.',
    tablaDestino: 'pruebas_hidraulicas',
    columnaDestino: 'resultado_general',
    contieneFormula: true,
    formulaReferencia: '=IF(AND(K2="APROBADO", N2="APROBADO"), "APROBADO", "RECHAZADO")',
    observaciones: 'Ambas pruebas (carcasa y asiento) deben aprobar para liberar.'
  }
];
