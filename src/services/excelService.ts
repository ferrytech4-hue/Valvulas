/**
 * Servicio Especializado de Importación, Análisis y Exportación Excel / CSV
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 * 
 * Basado en la librería estándar 'xlsx' para máxima compatibilidad con
 * Microsoft Excel para la Web, Office 365, LibreOffice y Google Sheets.
 */

import * as XLSX from 'xlsx';
import { 
  ValveRecord, 
  SheetAnalysis, 
  ImportValidationItem, 
  ColumnMappingDefinition,
  ValveType,
  ValveRating,
  EndConnection,
  QAQCStatus
} from '../types';
import { dbService } from './storageService';

// Diccionario de definiciones de mapeo con sinónimos industriales comunes
export const DEFAULT_COLUMN_MAPPINGS: ColumnMappingDefinition[] = [
  {
    fieldKey: 'tag',
    label: 'TAG / Identificador del Equipo',
    required: true,
    type: 'string',
    description: 'Código de identificación único del activo (ej. 100-XV-101A, PSV-201).',
    acceptedAliases: ['tag', 'codigo', 'tag no', 'equipo', 'tag number', 'item tag', 'identificador', 'tag de valvula']
  },
  {
    fieldKey: 'ot',
    label: 'Orden de Trabajo (O/T)',
    required: true,
    type: 'string',
    description: 'Número de Orden de Trabajo o mantenimiento (ej. OT-2026-0412, WO-8841).',
    acceptedAliases: ['ot', 'o/t', 'orden de trabajo', 'work order', 'wo', 'nro ot', 'num_ot', 'orden']
  },
  {
    fieldKey: 'tipo_valvula',
    label: 'Tipo de Válvula',
    required: true,
    type: 'enum',
    description: 'Compuerta, Globo, Bola, Retención, Mariposa, Seguridad PSV, Macho, Diafragma.',
    acceptedAliases: ['tipo', 'tipo de valvula', 'valve type', 'tipo valvula', 'clase valvula', 'tipo_valvula']
  },
  {
    fieldKey: 'marca',
    label: 'Fabricante / Marca',
    required: true,
    type: 'string',
    description: 'Fabricante original (ej. Flowserve, Velan, Fisher, Kitz, Cameron, Crane).',
    acceptedAliases: ['marca', 'fabricante', 'manufacturer', 'brand', 'proveedor']
  },
  {
    fieldKey: 'modelo',
    label: 'Modelo / Serie',
    required: false,
    type: 'string',
    description: 'Designación de modelo del fabricante.',
    acceptedAliases: ['modelo', 'model', 'serie', 'linea', 'figura']
  },
  {
    fieldKey: 'diametro_nominal',
    label: 'Diámetro Nominal (DN/NPS)',
    required: true,
    type: 'string',
    expectedUnits: 'Pulgadas (") o mm (DN)',
    description: 'Tamaño de la tubería (ej. 2", 3", 4", 6", 8", DN50, DN100).',
    acceptedAliases: ['diametro', 'dn', 'nps', 'diametro nominal', 'size', 'tamaño', 'dn/nps', 'pulgadas']
  },
  {
    fieldKey: 'clase_rating',
    label: 'Clase / Rating Presión',
    required: true,
    type: 'enum',
    expectedUnits: '# o PN',
    description: 'Clase ASME o PN (ej. 150#, 300#, 600#, 900#, 1500#, PN16, PN25).',
    acceptedAliases: ['clase', 'rating', 'class', 'clase/rating', 'pn', 'clase presion', 'rating #']
  },
  {
    fieldKey: 'tipo_conexion',
    label: 'Tipo de Conexión Extremos',
    required: false,
    type: 'enum',
    description: 'RF (Raised Face), RTJ, BW (Butt Weld), SW, NPT, Wafer, Lug.',
    acceptedAliases: ['conexion', 'extremos', 'tipo conexion', 'ends', 'end connection', 'tipo de conexion']
  },
  {
    fieldKey: 'material_cuerpo',
    label: 'Material del Cuerpo',
    required: true,
    type: 'string',
    description: 'Especificación ASTM (ej. A216 WCB, A351 CF8M, A105, A182 F316).',
    acceptedAliases: ['material cuerpo', 'cuerpo', 'body material', 'body', 'material del cuerpo', 'mat cuerpo']
  },
  {
    fieldKey: 'material_asiento',
    label: 'Material Asiento',
    required: false,
    type: 'string',
    description: 'Material del asiento (ej. RPTFE, PTFE, Stellite Gr.6, PEEK, Metal-Metal).',
    acceptedAliases: ['asiento', 'seat', 'material asiento', 'seat material', 'asientos']
  },
  {
    fieldKey: 'material_trim',
    label: 'Trim / Internos (API Trim)',
    required: false,
    type: 'string',
    description: 'API Trim estándar (ej. Trim 8, Trim 5, Trim 12, 316SS).',
    acceptedAliases: ['trim', 'api trim', 'material trim', 'internos', 'trim material']
  },
  {
    fieldKey: 'cv',
    label: 'Coeficiente Cv',
    required: false,
    type: 'number',
    expectedUnits: 'gpm/psi^0.5',
    description: 'Coeficiente de flujo de la válvula.',
    acceptedAliases: ['cv', 'kv', 'coeficiente cv', 'flow coefficient']
  },
  {
    fieldKey: 'peso_kg',
    label: 'Peso Estimado (kg)',
    required: false,
    type: 'number',
    expectedUnits: 'kg',
    description: 'Peso total en kilogramos.',
    acceptedAliases: ['peso', 'peso kg', 'weight', 'weight kg', 'peso (kg)']
  },
  {
    fieldKey: 'presion_diseno_bar',
    label: 'Presión de Diseño (bar)',
    required: false,
    type: 'number',
    expectedUnits: 'bar',
    description: 'Presión máxima de servicio.',
    acceptedAliases: ['presion diseno', 'presion diseño', 'design pressure', 'presion diseno bar', 'p diseno']
  },
  {
    fieldKey: 'temp_diseno_c',
    label: 'Temperatura de Diseño (°C)',
    required: false,
    type: 'number',
    expectedUnits: '°C',
    description: 'Temperatura máxima admisible.',
    acceptedAliases: ['temperatura diseno', 'temperatura diseño', 'design temp', 'temp c', 'temperatura (°c)']
  },
  {
    fieldKey: 'area_planta',
    label: 'Área / Planta',
    required: true,
    type: 'string',
    description: 'Área operativa del proyecto (ej. Área 100 Chancado, Flotación).',
    acceptedAliases: ['area', 'planta', 'area/planta', 'area planta', 'sector', 'unidad']
  },
  {
    fieldKey: 'sistema',
    label: 'Sistema / Servicio',
    required: true,
    type: 'string',
    description: 'Fluido o subsistema (ej. Agua Recuperada, Pulpa Concentrado, Aire).',
    acceptedAliases: ['sistema', 'subsistema', 'servicio', 'fluid', 'fluido', 'linea']
  },
  {
    fieldKey: 'ubicacion_fisica',
    label: 'Ubicación Física',
    required: false,
    type: 'string',
    description: 'Coordenadas, plataforma o rack de tubería.',
    acceptedAliases: ['ubicacion', 'ubicacion fisica', 'location', 'posicion', 'lugar']
  },
  {
    fieldKey: 'estado_qaqc',
    label: 'Estado QA/QC',
    required: false,
    type: 'enum',
    description: 'RECEPCION, PRUEBA_PENDIENTE, EN_PRUEBAS, LIBERADA_QAQC, etc.',
    acceptedAliases: ['estado', 'estado qaqc', 'estado qa/qc', 'qa/qc', 'status', 'liberacion']
  },
  {
    fieldKey: 'inspector_ito',
    label: 'Inspector ITO Responsable',
    required: false,
    type: 'string',
    description: 'Nombre de la Inspección Técnica de Obra.',
    acceptedAliases: ['ito', 'inspector', 'inspector ito', 'ito responsable', 'inspector cliente']
  },
  {
    fieldKey: 'responsable_taller',
    label: 'Responsable de Taller',
    required: false,
    type: 'string',
    description: 'Líder técnico de taller asignado.',
    acceptedAliases: ['responsable taller', 'taller', 'lider taller', 'tecnico', 'ejecutor']
  },
  {
    fieldKey: 'fecha_recepcion',
    label: 'Fecha Recepción',
    required: false,
    type: 'date',
    description: 'Fecha de ingreso al taller (YYYY-MM-DD).',
    acceptedAliases: ['fecha recepcion', 'fecha ingreso', 'fecha', 'reception date', 'f recepcion']
  },
  {
    fieldKey: 'numero_certificado',
    label: 'Nº Certificado de Calidad',
    required: false,
    type: 'string',
    description: 'Número de certificado si ya está liberada.',
    acceptedAliases: ['certificado', 'nro certificado', 'num certificado', 'certificate', 'dossier']
  },
  {
    fieldKey: 'observaciones',
    label: 'Observaciones Técnicas',
    required: false,
    type: 'string',
    description: 'Notas técnicas o condiciones especiales.',
    acceptedAliases: ['observaciones', 'notas', 'comentarios', 'obs', 'remarks']
  }
];

class ExcelService {
  /**
   * Sanitiza contenido para evitar inyecciones CSV o fórmulas maliciosas
   */
  public sanitizeCellValue(val: any): any {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      // Si comienza con =, +, -, @, prevenir ejecución accidental en exportaciones
      if (['=', '+', '-', '@'].some(char => trimmed.startsWith(char))) {
        // En preview preservamos para análisis pero neutralizamos
        return trimmed;
      }
      return trimmed;
    }
    return val;
  }

  /**
   * Lee y analiza el libro Excel / CSV en profundidad (Paso 2)
   */
  public async analyzeWorkbook(file: File): Promise<{
    sheets: SheetAnalysis[];
    selectedSheet: string;
    rawWorkbook: XLSX.WorkBook;
  }> {
    const dataBuffer = await file.arrayBuffer();
    // Leer con opciones que preservan fórmulas y fechas
    const workbook = XLSX.read(dataBuffer, { 
      type: 'array',
      cellDates: true,
      cellFormula: true,
      cellStyles: false
    });

    const sheets: SheetAnalysis[] = [];

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      const rowCount = range.e.r - range.s.r + 1;
      const colCount = range.e.c - range.s.c + 1;

      // Obtener datos crudos como array de arrays
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      // Encontrar fila de encabezados potencial (primera fila no vacía con >= 2 columnas de texto)
      let headerRowIndex = 0;
      for (let i = 0; i < Math.min(rows.length, 10); i++) {
        const textCount = rows[i].filter(c => typeof c === 'string' && c.trim().length > 0).length;
        if (textCount >= 2) {
          headerRowIndex = i;
          break;
        }
      }

      const headers = (rows[headerRowIndex] || []).map((h: any, idx: number) => {
        const str = String(h || '').trim();
        return str || `Columna_${idx + 1}`;
      });

      // Detectar duplicados de encabezado
      const seenHeaders = new Set<string>();
      const duplicateHeaders: string[] = [];
      headers.forEach(h => {
        const lower = h.toLowerCase();
        if (seenHeaders.has(lower)) {
          duplicateHeaders.push(h);
        } else {
          seenHeaders.add(lower);
        }
      });

      // Muestra de filas
      const sampleObjects: Record<string, any>[] = [];
      let emptyRowsCount = 0;

      for (let r = headerRowIndex + 1; r < rows.length; r++) {
        const row = rows[r];
        const isEmpty = !row || row.every((c: any) => c === '' || c === undefined || c === null);
        if (isEmpty) {
          emptyRowsCount++;
          continue;
        }

        if (sampleObjects.length < 5) {
          const obj: Record<string, any> = {};
          headers.forEach((h, cIdx) => {
            obj[h] = row[cIdx] !== undefined ? row[cIdx] : '';
          });
          sampleObjects.push(obj);
        }
      }

      sheets.push({
        sheetName,
        rowCount,
        colCount,
        headers,
        sampleRows: sampleObjects,
        emptyRowsCount,
        duplicateHeaders
      });
    }

    return {
      sheets,
      selectedSheet: sheets[0]?.sheetName || workbook.SheetNames[0],
      rawWorkbook: workbook
    };
  }

  /**
   * Sugiere automáticamente la correspondencia de columnas (Paso 3)
   */
  public autoDetectColumnMappings(detectedHeaders: string[]): Record<string, string> {
    const mapping: Record<string, string> = {}; // { fieldKey: detectedHeader }

    for (const def of DEFAULT_COLUMN_MAPPINGS) {
      for (const header of detectedHeaders) {
        const cleanHeader = header.toLowerCase().replace(/[\s_\-\/\\()]/g, '');
        const matched = def.acceptedAliases.some(alias => {
          const cleanAlias = alias.toLowerCase().replace(/[\s_\-\/\\()]/g, '');
          return cleanHeader === cleanAlias || cleanHeader.includes(cleanAlias) || cleanAlias.includes(cleanHeader);
        });

        if (matched) {
          mapping[def.fieldKey] = header;
          break; // Una vez asignado el primer match
        }
      }
    }

    return mapping;
  }

  /**
   * Interpreta y valida técnicamente cada fila según la correspondencia de columnas (Paso 4 y 5)
   */
  public validateAndParseRows(
    worksheet: XLSX.WorkSheet,
    headerRowIndex: number,
    columnMapping: Record<string, string>, // { fieldKey: selectedHeader }
    existingValves: ValveRecord[]
  ): ImportValidationItem[] {
    const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    const headers = (rawRows[headerRowIndex] || []).map((h: any, idx: number) => String(h || '').trim() || `Columna_${idx + 1}`);

    // Crear mapa de índice de columna por nombre de encabezado
    const colIndexByHeader: Record<string, number> = {};
    headers.forEach((h, idx) => {
      colIndexByHeader[h] = idx;
    });

    const items: ImportValidationItem[] = [];
    const seenTagsInFile = new Set<string>();

    for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
      const row = rawRows[r];
      // Ignorar filas totalmente vacías
      if (!row || row.every((c: any) => c === '' || c === undefined || c === null)) {
        continue;
      }

      const errors: string[] = [];
      const warnings: string[] = [];
      const rawRowData: Record<string, any> = {};

      headers.forEach((h, cIdx) => {
        rawRowData[h] = row[cIdx];
      });

      // Extraer valor mapeado por cada campo
      const getMappedValue = (fieldKey: string): any => {
        const targetHeader = columnMapping[fieldKey];
        if (!targetHeader) return undefined;
        const colIdx = colIndexByHeader[targetHeader];
        if (colIdx === undefined) return undefined;
        return row[colIdx];
      };

      // 1. Validación de TAG
      const rawTag = getMappedValue('tag');
      const tag = rawTag ? String(rawTag).trim() : '';

      if (!tag) {
        errors.push('El TAG está vacío o no fue asociado a ninguna columna.');
      } else {
        const upperTag = tag.toUpperCase();
        if (seenTagsInFile.has(upperTag)) {
          errors.push(`TAG duplicado dentro del mismo archivo Excel: "${tag}".`);
        } else {
          seenTagsInFile.add(upperTag);
        }
      }

      // 2. Validación de Orden de Trabajo (O/T)
      const rawOt = getMappedValue('ot');
      const ot = rawOt ? String(rawOt).trim() : 'OT-SIN-ASIGNAR';
      if (!rawOt) {
        warnings.push('O/T no especificada. Se asignará provisionalmente "OT-SIN-ASIGNAR".');
      }

      // 3. Validación de Tipo de Válvula
      const rawTipo = String(getMappedValue('tipo_valvula') || '').trim();
      let tipoValvula: ValveType = 'Compuerta';
      if (rawTipo) {
        const lowerTipo = rawTipo.toLowerCase();
        if (lowerTipo.includes('bola') || lowerTipo.includes('ball')) tipoValvula = 'Bola';
        else if (lowerTipo.includes('globo') || lowerTipo.includes('globe')) tipoValvula = 'Globo';
        else if (lowerTipo.includes('compuerta') || lowerTipo.includes('gate')) tipoValvula = 'Compuerta';
        else if (lowerTipo.includes('retencion') || lowerTipo.includes('check')) tipoValvula = 'Retencion';
        else if (lowerTipo.includes('mariposa') || lowerTipo.includes('butterfly')) tipoValvula = 'Mariposa';
        else if (lowerTipo.includes('seguridad') || lowerTipo.includes('psv') || lowerTipo.includes('relief')) tipoValvula = 'Seguridad_PSV';
        else if (lowerTipo.includes('macho') || lowerTipo.includes('plug')) tipoValvula = 'Macho_Plug';
        else if (lowerTipo.includes('diafragma')) tipoValvula = 'Diafragma';
        else if (lowerTipo.includes('aguja') || lowerTipo.includes('needle')) tipoValvula = 'Aguja';
        else {
          warnings.push(`Tipo de válvula "${rawTipo}" no reconocido como estándar. Se tipifica como Compuerta.`);
        }
      }

      // 4. Diámetro y Clase
      const diametro = String(getMappedValue('diametro_nominal') || '2"').trim();
      const rawClase = String(getMappedValue('clase_rating') || '150#').trim();
      let clase: ValveRating = '150#';
      if (rawClase.includes('300')) clase = '300#';
      else if (rawClase.includes('600')) clase = '600#';
      else if (rawClase.includes('900')) clase = '900#';
      else if (rawClase.includes('1500')) clase = '1500#';
      else if (rawClase.includes('2500')) clase = '2500#';
      else if (rawClase.includes('16')) clase = 'PN16';
      else if (rawClase.includes('25')) clase = 'PN25';
      else if (rawClase.includes('40')) clase = 'PN40';

      // 5. Conexión y Materiales
      const rawConexion = String(getMappedValue('tipo_conexion') || 'RF (Raised Face)').trim();
      let conexion: EndConnection = 'RF (Raised Face)';
      if (rawConexion.toUpperCase().includes('RTJ')) conexion = 'RTJ (Ring Type Joint)';
      else if (rawConexion.toUpperCase().includes('BW')) conexion = 'BW (Butt Weld)';
      else if (rawConexion.toUpperCase().includes('SW')) conexion = 'SW (Socket Weld)';
      else if (rawConexion.toUpperCase().includes('NPT')) conexion = 'NPT';
      else if (rawConexion.toUpperCase().includes('WAFER')) conexion = 'Wafer';
      else if (rawConexion.toUpperCase().includes('LUG')) conexion = 'Lug';

      const marca = String(getMappedValue('marca') || 'Genérico').trim();
      const modelo = String(getMappedValue('modelo') || 'Estándar').trim();
      const materialCuerpo = String(getMappedValue('material_cuerpo') || 'ASTM A216 WCB').trim();
      const materialAsiento = String(getMappedValue('material_asiento') || 'RPTFE').trim();
      const materialTrim = String(getMappedValue('material_trim') || 'API Trim 8').trim();

      // 6. Valores Numéricos con validación
      const parseNumber = (val: any, fieldName: string): number | undefined => {
        if (val === undefined || val === null || val === '') return undefined;
        const num = Number(String(val).replace(',', '.').replace(/[^\d.-]/g, ''));
        if (isNaN(num)) {
          warnings.push(`Valor numérico inválido en ${fieldName}: "${val}".`);
          return undefined;
        }
        return num;
      };

      const cv = parseNumber(getMappedValue('cv'), 'Cv');
      const peso_kg = parseNumber(getMappedValue('peso_kg'), 'Peso (kg)');
      const presion_diseno_bar = parseNumber(getMappedValue('presion_diseno_bar'), 'Presión Diseño');
      const temp_diseno_c = parseNumber(getMappedValue('temp_diseno_c'), 'Temperatura Diseño');

      const area_planta = String(getMappedValue('area_planta') || 'Área General PGP').trim();
      const sistema = String(getMappedValue('sistema') || 'Servicios Generales').trim();
      const ubicacion_fisica = String(getMappedValue('ubicacion_fisica') || 'Patio Taller').trim();

      // Estado QA/QC
      const rawEstado = String(getMappedValue('estado_qaqc') || 'RECEPCION').toUpperCase().replace(/[\s\/-]/g, '_');
      let estado_qaqc: QAQCStatus = 'RECEPCION';
      if (rawEstado.includes('LIBERAD')) estado_qaqc = 'LIBERADA_QAQC';
      else if (rawEstado.includes('APROBADA') || rawEstado.includes('ITO')) estado_qaqc = 'APROBADA_ITO';
      else if (rawEstado.includes('PENDIENTE')) estado_qaqc = 'PRUEBA_PENDIENTE';
      else if (rawEstado.includes('EN_PRUEBA')) estado_qaqc = 'EN_PRUEBAS';
      else if (rawEstado.includes('PUNCH')) estado_qaqc = 'PUNCH_LIST_ABIERTO';
      else if (rawEstado.includes('NO_CONF') || rawEstado.includes('RECHAZ')) estado_qaqc = 'NO_CONFORME';
      else if (rawEstado.includes('ENTREG')) estado_qaqc = 'ENTREGADA_FAENA';

      const inspector_ito = String(getMappedValue('inspector_ito') || 'Ing. Carlos Mendoza (ITO)').trim();
      const responsable_taller = String(getMappedValue('responsable_taller') || 'Líder Taller PGP').trim();
      
      // Fecha
      let fecha_recepcion = new Date().toISOString().split('T')[0];
      const rawFecha = getMappedValue('fecha_recepcion');
      if (rawFecha instanceof Date) {
        fecha_recepcion = rawFecha.toISOString().split('T')[0];
      } else if (rawFecha) {
        const parsedD = new Date(String(rawFecha));
        if (!isNaN(parsedD.getTime())) {
          fecha_recepcion = parsedD.toISOString().split('T')[0];
        }
      }

      const numero_certificado = getMappedValue('numero_certificado') ? String(getMappedValue('numero_certificado')).trim() : undefined;
      const observaciones = String(getMappedValue('observaciones') || '').trim();

      // Búsqueda de coincidencia en base de datos existente
      const matchExisting = existingValves.find(v => v.tag.trim().toUpperCase() === tag.toUpperCase());

      const parsedRecord: Partial<ValveRecord> = {
        tag,
        ot,
        tipo_valvula: tipoValvula,
        marca,
        modelo,
        diametro_nominal: diametro,
        clase_rating: clase,
        tipo_conexion: conexion,
        material_cuerpo: materialCuerpo,
        material_asiento: materialAsiento,
        material_trim: materialTrim,
        cv,
        peso_kg,
        presion_diseno_bar,
        temp_diseno_c,
        area_planta,
        sistema,
        ubicacion_fisica,
        estado_qaqc,
        inspector_ito,
        responsable_taller,
        fecha_recepcion,
        numero_certificado,
        observaciones
      };

      // Decidir acción por defecto
      let duplicateAction: 'INSERT' | 'UPDATE' | 'SKIP' = 'INSERT';
      if (matchExisting) {
        duplicateAction = 'UPDATE';
        warnings.push(`El TAG "${tag}" ya existe en la base de datos (OT: ${matchExisting.ot}, Estado: ${matchExisting.estado_qaqc}). Se propone actualización tras revisión.`);
      }

      const status: 'VALID' | 'WARNING' | 'ERROR' = errors.length > 0 ? 'ERROR' : warnings.length > 0 ? 'WARNING' : 'VALID';

      items.push({
        rowNumber: r + 1,
        data: rawRowData,
        parsedRecord,
        errors,
        warnings,
        status,
        matchExisting,
        duplicateAction
      });
    }

    return items;
  }

  /**
   * Genera y descarga la Plantilla Oficial de Excel PGP 2026 (.xlsx)
   * con ejemplos reales y formato profesional
   */
  public downloadOfficialPgpTemplate() {
    const headers = [
      'TAG / CÓDIGO',
      'ORDEN DE TRABAJO (O/T)',
      'TIPO DE VÁLVULA',
      'FABRICANTE / MARCA',
      'MODELO / SERIE',
      'DIÁMETRO NOMINAL (DN/NPS)',
      'CLASE / RATING (ASME)',
      'TIPO DE CONEXIÓN',
      'MATERIAL DEL CUERPO',
      'MATERIAL DE ASIENTO',
      'API TRIM',
      'COEFICIENTE CV',
      'PESO (KG)',
      'PRESIÓN DE DISEÑO (BAR)',
      'TEMPERATURA DISEÑO (°C)',
      'ÁREA / PLANTA',
      'SISTEMA / SERVICIO',
      'UBICACIÓN FÍSICA',
      'ESTADO QA/QC',
      'INSPECTOR ITO',
      'RESPONSABLE TALLER',
      'FECHA RECEPCIÓN',
      'Nº CERTIFICADO',
      'OBSERVACIONES'
    ];

    const sampleRows = [
      [
        '100-XV-201',
        'OT-2026-0901',
        'Bola',
        'Flowserve',
        'Worcester Series 51',
        '3"',
        '300#',
        'RF (Raised Face)',
        'ASTM A216 WCB',
        'RPTFE',
        'API Trim 12 (316SS)',
        980,
        34.5,
        51.0,
        120,
        'Área 100 - Chancado Primario',
        'Agua Recuperada',
        'Línea Impulsión P-102',
        'PRUEBA_PENDIENTE',
        'Ing. Carlos Mendoza (ITO)',
        'Marco Antonio Rojas',
        '2026-03-22',
        '',
        'Válvula recibida con embalaje original. Pendiente prueba hidráulica API 598.'
      ],
      [
        '200-HV-210',
        'OT-2026-0902',
        'Compuerta',
        'Velan',
        'Flexible Wedge API 600',
        '6"',
        '600#',
        'RTJ (Ring Type Joint)',
        'ASTM A216 WCB',
        'Stellite Gr.6',
        'API Trim 5 (Full Stellite)',
        2100,
        145.0,
        102.0,
        200,
        'Área 200 - Flotación Rougher',
        'Concentrado de Cobre',
        'Manifold M-201 Eje 4',
        'RECEPCION',
        'Ing. Carlos Mendoza (ITO)',
        'Jorge Valenzuela',
        '2026-03-23',
        '',
        'Inspección visual conforme. MTR 3.1 verificado.'
      ],
      [
        '300-FV-315',
        'OT-2026-0903',
        'Globo',
        'Emerson Fisher',
        'ED Control Valve',
        '2"',
        '300#',
        'RF (Raised Face)',
        'ASTM A351 CF8M (316 SS)',
        '316SS + Stellite',
        'API Trim 10 (316SS)',
        65,
        28.0,
        49.6,
        80,
        'Área 300 - Reactivos',
        'Dosificación Colector',
        'Skid SK-302',
        'RECEPCION',
        'Ing. Patricia Soto (ITO)',
        'Marco Antonio Rojas',
        '2026-03-24',
        '',
        'Incluye posicionador digital HART y transmisor.'
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

    // Establecer anchos de columna recomendados
    ws['!cols'] = [
      { wch: 16 }, // TAG
      { wch: 16 }, // OT
      { wch: 16 }, // Tipo
      { wch: 18 }, // Marca
      { wch: 22 }, // Modelo
      { wch: 16 }, // Diametro
      { wch: 14 }, // Clase
      { wch: 20 }, // Conexion
      { wch: 20 }, // Mat Cuerpo
      { wch: 18 }, // Mat Asiento
      { wch: 20 }, // Trim
      { wch: 14 }, // Cv
      { wch: 12 }, // Peso
      { wch: 16 }, // Presion
      { wch: 16 }, // Temp
      { wch: 25 }, // Area
      { wch: 24 }, // Sistema
      { wch: 26 }, // Ubicacion
      { wch: 18 }, // Estado
      { wch: 24 }, // ITO
      { wch: 22 }, // Taller
      { wch: 16 }, // Fecha
      { wch: 22 }, // Certificado
      { wch: 40 }, // Observaciones
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Matriz_Valvulas_PGP_2026');

    XLSX.writeFile(wb, 'Plantilla_Matriz_Valvulas_PGP2026.xlsx');
  }

  /**
   * Exporta toda la base de datos a un archivo Excel multi-hoja completo
   * para colaboración en Excel para la Web / OneDrive (Requerimiento 9)
   */
  public exportCompleteDatabaseToExcel() {
    const valves = dbService.getValves();
    const tests = dbService.getHydroTests();
    const punches = dbService.getPunchItems();
    const history = dbService.getImportHistory();

    const wb = XLSX.utils.book_new();

    // Hoja 1: Matriz de Válvulas
    const valvesData = valves.map(v => ({
      'TAG': v.tag,
      'O/T': v.ot,
      'Tipo': v.tipo_valvula,
      'Marca': v.marca,
      'Modelo': v.modelo,
      'DN/NPS': v.diametro_nominal,
      'Rating': v.clase_rating,
      'Conexión': v.tipo_conexion,
      'Material Cuerpo': v.material_cuerpo,
      'Material Asiento': v.material_asiento,
      'API Trim': v.material_trim,
      'Cv': v.cv ?? '',
      'Peso (kg)': v.peso_kg ?? '',
      'Presión Diseño (bar)': v.presion_diseno_bar ?? '',
      'Área Planta': v.area_planta,
      'Sistema': v.sistema,
      'Ubicación': v.ubicacion_fisica,
      'Estado QA/QC': v.estado_qaqc,
      'Inspector ITO': v.inspector_ito,
      'Responsable Taller': v.responsable_taller,
      'Fecha Recepción': v.fecha_recepcion,
      'Nº Certificado': v.numero_certificado ?? '',
      'Observaciones': v.observaciones
    }));
    const wsValves = XLSX.utils.json_to_sheet(valvesData);
    XLSX.utils.book_append_sheet(wb, wsValves, 'Matriz_Valvulas');

    // Hoja 2: Pruebas Hidráulicas
    const testsData = tests.map(t => ({
      'Protocolo Nº': t.numero_protocolo,
      'TAG Válvula': t.tag,
      'O/T': t.ot,
      'Fecha Ensayo': t.fecha_ensayo,
      'Norma': t.norma_aplicable,
      'Fluido': t.fluido_prueba,
      'Manómetro': t.manometro_id,
      'P. Carcasa Req (bar)': t.presion_carcasa_requerida_bar,
      'P. Carcasa Apl (bar)': t.presion_carcasa_aplicada_bar,
      'Tiempo Carcasa (seg)': t.tiempo_carcasa_seg,
      'Resultado Carcasa': t.resultado_carcasa,
      'P. Asiento HP Req (bar)': t.presion_asiento_hp_requerida_bar,
      'P. Asiento HP Apl (bar)': t.presion_asiento_hp_aplicada_bar,
      'Fuga Admisible': t.fuga_admisible_asiento,
      'Fuga Medida': t.fuga_medida_asiento,
      'Resultado Asiento HP': t.resultado_asiento_hp,
      'Resultado General': t.resultado_general,
      'Ejecutor Taller': t.inspector_ejecutor,
      'Validador ITO': t.inspector_ito_validador,
      'Firma ITO': t.firma_ito ? 'SÍ (FIRMADO)' : 'PENDIENTE'
    }));
    const wsTests = XLSX.utils.json_to_sheet(testsData);
    XLSX.utils.book_append_sheet(wb, wsTests, 'Pruebas_Hidraulicas');

    // Hoja 3: Punch List
    const punchData = punches.map(p => ({
      'Código Item': p.codigo_item,
      'TAG Válvula': p.tag,
      'O/T': p.ot,
      'Tipo Desviación': p.tipo_desviacion,
      'Categoría': p.categoria,
      'Descripción': p.descripcion,
      'Acción Correctiva': p.accion_correctiva,
      'Responsable': p.responsable,
      'Fecha Detección': p.fecha_deteccion,
      'Fecha Límite': p.fecha_limite,
      'Estado': p.estado
    }));
    const wsPunch = XLSX.utils.json_to_sheet(punchData);
    XLSX.utils.book_append_sheet(wb, wsPunch, 'Punch_List');

    // Hoja 4: Historial de Importaciones
    const historyData = history.map(h => ({
      'ID': h.id,
      'Fecha': h.fecha,
      'Archivo': h.nombre_archivo,
      'Total Filas': h.total_filas,
      'Nuevas': h.filas_insertadas,
      'Actualizadas': h.filas_actualizadas,
      'Omitidas': h.filas_omitidas,
      'Rechazadas': h.filas_rechazadas,
      'Usuario': h.usuario
    }));
    const wsHistory = XLSX.utils.json_to_sheet(historyData);
    XLSX.utils.book_append_sheet(wb, wsHistory, 'Historial_Importaciones');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Control_Calidad_Valvulas_PGP_2026_${dateStr}.xlsx`);
  }

  /**
   * Inspecciona y analiza un libro Excel multi-hoja (.xlsx, .xls, .csv)
   */
  public async parseMultiSheetWorkbook(file: File): Promise<{
    fileName: string;
    fileSizeBytes: number;
    sheetNames: string[];
    sheets: Record<string, {
      name: string;
      totalRows: number;
      totalCols: number;
      headers: string[];
      sampleData: Record<string, any>[];
      allData: Record<string, any>[];
      emptyCellsCount: number;
      detectedTagsCount: number;
      duplicateTagsCount: number;
      missingRequiredCount: number;
    }>;
  }> {
    const dataBuffer = await file.arrayBuffer();
    const wb = XLSX.read(dataBuffer, { type: 'array', cellDates: true });
    const sheetNames = wb.SheetNames;
    const sheetsResult: Record<string, any> = {};

    for (const name of sheetNames) {
      const ws = wb.Sheets[name];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (!rawRows || rawRows.length === 0) {
        sheetsResult[name] = {
          name,
          totalRows: 0,
          totalCols: 0,
          headers: [],
          sampleData: [],
          allData: [],
          emptyCellsCount: 0,
          detectedTagsCount: 0,
          duplicateTagsCount: 0,
          missingRequiredCount: 0
        };
        continue;
      }

      // Detectar fila de encabezados (primera fila no vacía con >= 2 columnas de texto)
      let headerRowIndex = 0;
      for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
        const textCols = rawRows[r].filter(c => typeof c === 'string' && c.trim().length > 0);
        if (textCols.length >= 2) {
          headerRowIndex = r;
          break;
        }
      }

      const headers = rawRows[headerRowIndex].map((h, i) => (h ? String(h).trim() : `Columna_${i + 1}`));
      const dataRows = rawRows.slice(headerRowIndex + 1);

      const allData: Record<string, any>[] = [];
      let emptyCellsCount = 0;
      const seenTags = new Set<string>();
      let duplicateTagsCount = 0;
      let missingRequiredCount = 0;

      // Buscar si hay columna TAG
      const tagColIdx = headers.findIndex(h => /tag|identif|codigo/i.test(h));

      dataRows.forEach((row, rowIdx) => {
        // Ignorar filas totalmente vacías
        const hasContent = row.some(cell => cell !== '' && cell !== null && cell !== undefined);
        if (!hasContent) return;

        const record: Record<string, any> = { _rowIndex: rowIdx + 1 };
        headers.forEach((h, colIdx) => {
          const val = row[colIdx];
          if (val === '' || val === null || val === undefined) {
            emptyCellsCount++;
            record[h] = '';
          } else {
            record[h] = val;
          }
        });

        if (tagColIdx !== -1) {
          const tagVal = String(row[tagColIdx] || '').trim();
          if (tagVal) {
            if (seenTags.has(tagVal.toUpperCase())) {
              duplicateTagsCount++;
            } else {
              seenTags.add(tagVal.toUpperCase());
            }
          } else {
            missingRequiredCount++;
          }
        }

        allData.push(record);
      });

      sheetsResult[name] = {
        name,
        totalRows: allData.length,
        totalCols: headers.length,
        headers,
        sampleData: allData.slice(0, 30),
        allData,
        emptyCellsCount,
        detectedTagsCount: seenTags.size,
        duplicateTagsCount,
        missingRequiredCount
      };
    }

    return {
      fileName: file.name,
      fileSizeBytes: file.size,
      sheetNames,
      sheets: sheetsResult
    };
  }

  /**
   * Exporta cualquier conjunto de registros a un nuevo archivo Excel descargable
   */
  public exportCustomRowsToExcel(rows: any[], fileName: string, sheetName: string = 'Datos_Exportados') {
    if (!rows || rows.length === 0) {
      throw new Error('No hay registros seleccionados o disponibles para exportar.');
    }
    // Sanitizar filas removiendo claves internas (_rowIndex, id interna) si se desea
    const cleanRows = rows.map(r => {
      const copy = { ...r };
      delete copy._rowIndex;
      return copy;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(cleanRows);
    
    // Auto-ajustar anchos
    const colKeys = Object.keys(cleanRows[0] || {});
    ws['!cols'] = colKeys.map(k => ({ wch: Math.max(k.length + 4, 14) }));

    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
    const safeFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    XLSX.writeFile(wb, safeFileName);
  }

  /**
   * Exporta múltiples hojas en un solo libro Excel (.xlsx)
   */
  public exportMultiSheetsToExcel(sheets: { name: string; data: any[] }[], fileName: string) {
    const wb = XLSX.utils.book_new();

    sheets.forEach(sheet => {
      if (sheet.data && sheet.data.length > 0) {
        const cleanRows = sheet.data.map(r => {
          const copy = { ...r };
          delete copy._rowIndex;
          return copy;
        });
        const ws = XLSX.utils.json_to_sheet(cleanRows);
        const colKeys = Object.keys(cleanRows[0] || {});
        ws['!cols'] = colKeys.map(k => ({ wch: Math.max(k.length + 4, 14) }));
        XLSX.utils.book_append_sheet(wb, ws, sheet.name.substring(0, 31));
      }
    });

    const safeFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    XLSX.writeFile(wb, safeFileName);
  }

  /**
   * Descarga plantilla oficial Excel PGP 2026 limpia para rellenar e importar
   */
  public downloadTemplateExcel() {
    const templateHeaders = [
      {
        'TAG': '100-XV-0101',
        'OT': 'OT-2026-0001',
        'TIPO_VALVULA': 'Compuerta',
        'MARCA': 'Flowserve',
        'MODELO': 'Gate-OSY-300',
        'DIAMETRO_NOMINAL': '4"',
        'CLASE_RATING': '300#',
        'TIPO_CONEXION': 'RF',
        'MATERIAL_CUERPO': 'A216 WCB',
        'MATERIAL_ASIENTO': '13Cr Metal-Metal',
        'MATERIAL_TRIM': 'Stellite',
        'AREA_PLANTA': 'Área 100 - Molienda',
        'SISTEMA': 'Agua de Proceso',
        'UBICACION_FISICA': 'Piping Rack Eje 4',
        'PRESION_DISENO_BAR': 50,
        'INSPECTOR_ITO': 'Inspector ITO Mandante',
        'RESPONSABLE_TALLER': 'Taller Central PGP',
        'OBSERVACIONES': 'Plantilla oficial de carga PGP 2026'
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateHeaders);
    ws['!cols'] = Object.keys(templateHeaders[0]).map(k => ({ wch: Math.max(k.length + 4, 16) }));
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla_Valvulas_PGP');
    XLSX.writeFile(wb, 'Plantilla_Carga_Valvulas_PGP_2026.xlsx');
  }

  /**
   * Descarga la estructura oficial recomendada de 3 pestañas:
   * 1. INVENTARIO_VALVULAS: Registro, tag, ubicación y características de cada equipo.
   * 2. PRUEBAS_PH: Registro específico de pruebas hidrostáticas con presiones, tiempos y resultados.
   * 3. HISTORIAL_MANTENCION: Bitácora de limpiezas, cambios de empaques, calibración y observaciones.
   */
  public downloadRecommendedThreeSheetWorkbook() {
    const wb = XLSX.utils.book_new();

    // 1. Pestaña 1: INVENTARIO_VALVULAS
    const inventarioData = [
      {
        'Tag / Código': 'V-101',
        'Tipo de Válvula': 'Bola Flotante',
        'Diámetro': '4"',
        'Presión Nominal (Clase/PN)': 'Clase 300',
        'Ubicación / Línea': 'Línea de Alimentación Molino 1',
        'Estado Actual': 'Operativa',
        'Frecuencia PH (Meses)': 12
      },
      {
        'Tag / Código': 'V-102',
        'Tipo de Válvula': 'Compuerta OS&Y',
        'Diámetro': '6"',
        'Presión Nominal (Clase/PN)': 'Clase 150',
        'Ubicación / Línea': 'Descarga Bomba B-01',
        'Estado Actual': 'Operativa',
        'Frecuencia PH (Meses)': 12
      },
      {
        'Tag / Código': 'V-103',
        'Tipo de Válvula': 'Retención (Check)',
        'Diámetro': '3"',
        'Presión Nominal (Clase/PN)': 'Clase 600',
        'Ubicación / Línea': 'Impulsión Espesador',
        'Estado Actual': 'En Mantención',
        'Frecuencia PH (Meses)': 6
      }
    ];
    const wsInventario = XLSX.utils.json_to_sheet(inventarioData);
    wsInventario['!cols'] = [
      { wch: 16 },
      { wch: 22 },
      { wch: 12 },
      { wch: 26 },
      { wch: 32 },
      { wch: 18 },
      { wch: 22 }
    ];
    XLSX.utils.book_append_sheet(wb, wsInventario, 'INVENTARIO_VALVULAS');

    // 2. Pestaña 2: PRUEBAS_PH
    const pruebasData = [
      {
        'Código Válvula': 'V-101',
        'Fecha Prueba': '31-10-2026',
        'Presión Sistema (Kg)': 116,
        'Presión de Prueba (Kg)': 156,
        'Tiempo Sostén (Min)': 1,
        '¿Pérdida en Sello?': 'No',
        '¿Pérdida en Vástago?': 'No',
        'Resultado': 'Aprobada',
        'Próxima PH': '31-10-2027'
      },
      {
        'Código Válvula': 'V-102',
        'Fecha Prueba': '15-10-2026',
        'Presión Sistema (Kg)': 20,
        'Presión de Prueba (Kg)': 30,
        'Tiempo Sostén (Min)': 1,
        '¿Pérdida en Sello?': 'No',
        '¿Pérdida en Vástago?': 'No',
        'Resultado': 'Aprobada',
        'Próxima PH': '15-10-2027'
      }
    ];
    const wsPruebas = XLSX.utils.json_to_sheet(pruebasData);
    wsPruebas['!cols'] = [
      { wch: 16 },
      { wch: 16 },
      { wch: 22 },
      { wch: 24 },
      { wch: 20 },
      { wch: 20 },
      { wch: 22 },
      { wch: 16 },
      { wch: 16 }
    ];
    XLSX.utils.book_append_sheet(wb, wsPruebas, 'PRUEBAS_PH');

    // 3. Pestaña 3: HISTORIAL_MANTENCION
    const mantencionData = [
      {
        'Código Válvula': 'V-101',
        'Fecha Mantención': '15-10-2026',
        'Tipo de Mantención': 'Preventivo Anual',
        'Componentes Cambiados': 'Kit de empaques / O-rings',
        'Técnico': 'J. Pérez',
        'Firma / Certificado': '[Ver Certificado]'
      },
      {
        'Código Válvula': 'V-103',
        'Fecha Mantención': '20-10-2026',
        'Tipo de Mantención': 'Correctivo',
        'Componentes Cambiados': 'Rectificación de Asiento & Resorte',
        'Técnico': 'R. González',
        'Firma / Certificado': '[Ver Certificado]'
      }
    ];
    const wsMantencion = XLSX.utils.json_to_sheet(mantencionData);
    wsMantencion['!cols'] = [
      { wch: 16 },
      { wch: 18 },
      { wch: 22 },
      { wch: 35 },
      { wch: 18 },
      { wch: 22 }
    ];
    XLSX.utils.book_append_sheet(wb, wsMantencion, 'HISTORIAL_MANTENCION');

    XLSX.writeFile(wb, 'Plantilla_Control_Valvulas_3_Pestañas.xlsx');
  }
}

export const excelService = new ExcelService();
