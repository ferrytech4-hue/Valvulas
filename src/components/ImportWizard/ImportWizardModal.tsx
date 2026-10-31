/**
 * Módulo Prioritario: Importación de Archivos y Carga de Datos
 * Flujo Obligatorio de 8 Pasos
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 */

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Layers, 
  Download, 
  RefreshCw, 
  Check, 
  FileText, 
  HelpCircle,
  Eye,
  Columns,
  Table,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { excelService, DEFAULT_COLUMN_MAPPINGS } from '../../services/excelService';
import { dbService } from '../../services/storageService';
import { useAuth } from '../../services/authContext';
import { SheetAnalysis, ImportValidationItem, ValveRecord } from '../../types';

interface ImportWizardModalProps {
  onClose: () => void;
  onImportCompleted: () => void;
}

export const ImportWizardModal: React.FC<ImportWizardModalProps> = ({
  onClose,
  onImportCompleted
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados del Asistente
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Paso 2: Análisis
  const [analyzing, setAnalyzing] = useState(false);
  const [sheets, setSheets] = useState<SheetAnalysis[]>([]);
  const [selectedSheetName, setSelectedSheetName] = useState<string>('');
  const [headerRowIndex, setHeaderRowIndex] = useState<number>(0);
  const [rawWorkbook, setRawWorkbook] = useState<XLSX.WorkBook | null>(null);

  // Paso 3: Mapeo de Columnas
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Paso 4 y 5: Validación Técnica y Vista Previa
  const [validatedItems, setValidatedItems] = useState<ImportValidationItem[]>([]);
  const [filterPreviewStatus, setFilterPreviewStatus] = useState<string>('ALL');

  // Paso 6: Comparación de Diferencias (Diff)
  const [diffModalItem, setDiffModalItem] = useState<ImportValidationItem | null>(null);

  // Paso 8: Resultado
  const [importResult, setImportResult] = useState<{
    inserted: number;
    updated: number;
    skipped: number;
    errors: string[];
    historyId?: string;
  } | null>(null);

  // -------------------------------------------------------------
  // PASO 1: SELECCIÓN Y VALIDACIÓN PREVIA DEL ARCHIVO
  // -------------------------------------------------------------
  const handleFileSelected = (selectedFile: File) => {
    setFileError(null);

    // Validación de extensión
    const validExtensions = ['.xlsx', '.xls', '.csv', '.json'];
    const fileName = selectedFile.name.toLowerCase();
    const isValidExt = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidExt) {
      setFileError('Formato de archivo no admitido. Seleccione un archivo Excel (.xlsx, .xls) o CSV (.csv).');
      return;
    }

    // Validación de tamaño (Límite 25 MB para evitar desbordamiento en memoria gratuita)
    const maxSizeBytes = 25 * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setFileError(`El archivo supera el tamaño máximo permitido de 25 MB (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    setFile(selectedFile);
  };

  const loadSampleMatrix = () => {
    // Generar archivo binario de muestra y cargarlo directamente
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
      'OBSERVACIONES'
    ];

    const sampleRows = [
      ['600-XV-601A', 'OT-2026-1101', 'Bola', 'Flowserve', 'Worcester 51', '6"', '300#', 'RF (Raised Face)', 'ASTM A216 WCB', 'RPTFE', 'API Trim 12 (316SS)', 3600, 115, 51.0, 120, 'Área 600 - Filtrado', 'Concentrado Cobre', 'Batería Filtros Prensa Eje 2', 'PRUEBA_PENDIENTE', 'Ing. Carlos Mendoza (ITO)', 'Marco Antonio Rojas', '2026-03-25', 'Válvula nueva para reposición programada.'],
      ['600-XV-601B', 'OT-2026-1101', 'Bola', 'Flowserve', 'Worcester 51', '6"', '300#', 'RF (Raised Face)', 'ASTM A216 WCB', 'RPTFE', 'API Trim 12 (316SS)', 3600, 115, 51.0, 120, 'Área 600 - Filtrado', 'Concentrado Cobre', 'Batería Filtros Prensa Stand-by', 'PRUEBA_PENDIENTE', 'Ing. Carlos Mendoza (ITO)', 'Marco Antonio Rojas', '2026-03-25', 'Empaque intacto, placa legible.'],
      ['100-XV-101A', 'OT-2026-0412', 'Bola', 'Flowserve', 'Worcester 51/52', '4"', '300#', 'RF (Raised Face)', 'ASTM A216 WCB', 'RPTFE', 'API Trim 12 (316SS)', 1850, 48.5, 51.0, 120, 'Área 100 - Chancado', 'Agua de Proceso', 'Línea Molino SAG', 'LIBERADA_QAQC', 'Ing. Carlos Mendoza (ITO)', 'Marco Antonio Rojas', '2026-03-01', 'Actualización de datos con certificación 2026.'],
      ['700-CV-702', 'OT-2026-1150', 'Retencion', 'Crane', 'Duo-Chek II Dual Plate', '10"', '150#', 'Wafer', 'ASTM A216 WCB', 'Inconel 625', 'API Trim 8 (13Cr)', 2400, 52, 19.6, 60, 'Área 700 - Aguas Ácidas', 'Efluentes Tratados', 'Descarga Planta Neutralizadora', 'RECEPCION', 'Ing. Patricia Soto (ITO)', 'Jorge Valenzuela', '2026-03-26', 'Inspección de resortes y sellos conforme.']
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Matriz_Valvulas_PGP');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const sampleBlob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const sampleFileObj = new File([sampleBlob], 'Matriz_Prueba_PGP_2026.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    setFile(sampleFileObj);
  };

  // -------------------------------------------------------------
  // PASO 2: EJECUTAR ANÁLISIS DEL ARCHIVO
  // -------------------------------------------------------------
  const proceedToStep2 = async () => {
    if (!file) return;
    setAnalyzing(true);
    try {
      const result = await excelService.analyzeWorkbook(file);
      setSheets(result.sheets);
      setSelectedSheetName(result.selectedSheet);
      setRawWorkbook(result.rawWorkbook);

      // Pre-calcular mapeo inicial con auto-detección
      const firstSheet = result.sheets[0];
      if (firstSheet) {
        const autoMap = excelService.autoDetectColumnMappings(firstSheet.headers);
        setColumnMapping(autoMap);
      }

      setCurrentStep(2);
    } catch (err: any) {
      setFileError('Error al leer el archivo Excel: ' + (err.message || 'Estructura no válida o archivo dañado.'));
    } finally {
      setAnalyzing(false);
    }
  };

  // -------------------------------------------------------------
  // PASO 3: CONFIGURAR Y CONFIRMAR ASOCIACIÓN DE COLUMNAS
  // -------------------------------------------------------------
  const proceedToStep3 = () => {
    const currentSheet = sheets.find(s => s.sheetName === selectedSheetName) || sheets[0];
    if (currentSheet) {
      const autoMap = excelService.autoDetectColumnMappings(currentSheet.headers);
      setColumnMapping(prev => ({ ...autoMap, ...prev }));
    }
    setCurrentStep(3);
  };

  // -------------------------------------------------------------
  // PASO 4 Y 5: VALIDACIÓN TÉCNICA Y VISTA PREVIA
  // -------------------------------------------------------------
  const proceedToStep4 = () => {
    if (!rawWorkbook) return;
    const worksheet = rawWorkbook.Sheets[selectedSheetName];
    if (!worksheet) return;

    const existingValves = dbService.getValves();
    const items = excelService.validateAndParseRows(
      worksheet,
      headerRowIndex,
      columnMapping,
      existingValves
    );

    setValidatedItems(items);
    setCurrentStep(4);
  };

  // -------------------------------------------------------------
  // PASO 6: RESOLUCIÓN DE DUPLICADOS
  // -------------------------------------------------------------
  const handleDuplicateActionChange = (index: number, action: 'INSERT' | 'UPDATE' | 'SKIP') => {
    setValidatedItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        duplicateAction: action
      };
      return updated;
    });
  };

  // -------------------------------------------------------------
  // PASO 7 & 8: EJECUCIÓN ATÓMICA DE IMPORTACIÓN
  // -------------------------------------------------------------
  const executeFinalImport = () => {
    const itemsToProcess = validatedItems
      .filter(item => item.status !== 'ERROR' && item.parsedRecord && item.duplicateAction !== 'SKIP')
      .map(item => ({
        action: item.duplicateAction,
        record: item.parsedRecord as ValveRecord,
        originalTag: item.parsedRecord?.tag || ''
      }));

    const result = dbService.executeBatchImport(
      itemsToProcess,
      file?.name || 'importacion.xlsx',
      file?.size || 0,
      user.nombre,
      user.rol
    );

    setImportResult(result);
    setCurrentStep(8);
    onImportCompleted();
  };

  // Métricas del resumen en Paso 7
  const totalRowsInPreview = validatedItems.length;
  const newCount = validatedItems.filter(i => i.status !== 'ERROR' && i.duplicateAction === 'INSERT').length;
  const updateCount = validatedItems.filter(i => i.status !== 'ERROR' && i.duplicateAction === 'UPDATE').length;
  const skipCount = validatedItems.filter(i => i.duplicateAction === 'SKIP').length;
  const errorCount = validatedItems.filter(i => i.status === 'ERROR').length;
  const warningCount = validatedItems.filter(i => i.status === 'WARNING').length;

  // Filtrado de items en vista previa
  const currentSheetData = sheets.find(s => s.sheetName === selectedSheetName);
  const filteredValidatedItems = validatedItems.filter(item => {
    if (filterPreviewStatus === 'ALL') return true;
    if (filterPreviewStatus === 'VALID') return item.status === 'VALID';
    if (filterPreviewStatus === 'WARNING') return item.status === 'WARNING';
    if (filterPreviewStatus === 'ERROR') return item.status === 'ERROR';
    if (filterPreviewStatus === 'DUPLICATE') return !!item.matchExisting;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Cabecera del Asistente */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Importación de Archivos y Carga de Datos</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Paso {currentStep} de 8
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Flujo validado para matrices Excel (.xlsx, .xls) y CSV sin pérdida de datos técnicos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Progreso de 8 Pasos */}
        <div className="bg-slate-900/90 px-6 py-2 border-b border-slate-800 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[700px] text-[11px] font-medium text-slate-400">
            {[
              { num: 1, label: '1. Seleccionar' },
              { num: 2, label: '2. Analizar' },
              { num: 3, label: '3. Asociar' },
              { num: 4, label: '4. Vista Previa' },
              { num: 5, label: '5. Validación' },
              { num: 6, label: '6. Duplicados' },
              { num: 7, label: '7. Confirmar' },
              { num: 8, label: '8. Resultado' }
            ].map(step => (
              <div 
                key={step.num}
                className={`flex items-center space-x-1.5 ${
                  currentStep === step.num 
                    ? 'text-emerald-400 font-bold' 
                    : currentStep > step.num 
                    ? 'text-slate-300' 
                    : 'text-slate-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep === step.num
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : currentStep > step.num
                    ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {currentStep > step.num ? '✓' : step.num}
                </div>
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contenido Dinámico del Paso */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-200">
          
          {/* ========================================================= */}
          {/* PASO 1: SELECCIONAR ARCHIVO */}
          {/* ========================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto py-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">Seleccione la Matriz de Válvulas a Importar</h3>
                <p className="text-xs text-slate-400">
                  Formatos autorizados: Microsoft Excel (.xlsx, .xls) y valores separados por comas (.csv). Límite de seguridad: 25 MB.
                </p>
              </div>

              {/* Zona Drag & Drop */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelected(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                  file 
                    ? 'border-emerald-500/60 bg-emerald-950/20' 
                    : 'border-slate-700 hover:border-blue-500/60 bg-slate-950/50 hover:bg-slate-850/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelected(e.target.files[0]);
                    }
                  }}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />

                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <UploadCloud className="w-8 h-8" />
                </div>

                {file ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-400">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      Tamaño: {(file.size / 1024).toFixed(1)} KB • Última modificación: {new Date(file.lastModified).toLocaleDateString()}
                    </p>
                    <p className="text-[11px] text-emerald-300 font-medium">✓ Archivo validado y listo para inspección</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-200">
                      Arrastre y suelte su archivo Excel aquí, o <span className="text-blue-400 underline">explore su equipo</span>
                    </p>
                    <p className="text-xs text-slate-400">Archivos .xlsx, .xls o .csv estructurados según matriz PGP</p>
                  </div>
                )}
              </div>

              {/* Error si no valida */}
              {fileError && (
                <div className="p-3 bg-rose-950/50 border border-rose-600/50 rounded-xl text-xs text-rose-300 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Opción rápida: Probar con Matriz de Muestra PGP 2026 */}
              <div className="p-4 bg-slate-850 border border-slate-750 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">¿No tiene un archivo a mano?</p>
                    <p className="text-[11px] text-slate-400">Cargue la matriz de prueba PGP 2026 oficial con 1 clic</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={loadSampleMatrix}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition"
                >
                  Cargar Matriz de Prueba
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PASO 2: ANALIZAR EL ARCHIVO */}
          {/* ========================================================= */}
          {currentStep === 2 && currentSheetData && (
            <div className="space-y-5">
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Diagnóstico Estructural del Libro Excel</h3>
                  <p className="text-xs text-slate-400">
                    Archivo: <strong>{file?.name}</strong> • Total de hojas: {sheets.length}
                  </p>
                </div>

                {/* Selector de Hoja si hay múltiples */}
                {sheets.length > 1 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">Seleccionar hoja a importar:</span>
                    <select
                      aria-label="Seleccionar hoja de cálculo a importar"
                      value={selectedSheetName}
                      onChange={(e) => setSelectedSheetName(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200"
                    >
                      {sheets.map(s => (
                        <option key={s.sheetName} value={s.sheetName}>{s.sheetName} ({s.rowCount} filas)</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Métricas de la Hoja Seleccionada */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase">Filas Totales</span>
                  <p className="text-xl font-bold font-mono text-white">{currentSheetData.rowCount}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase">Columnas Detectadas</span>
                  <p className="text-xl font-bold font-mono text-blue-400">{currentSheetData.colCount}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase">Filas Vacías Ignoradas</span>
                  <p className="text-xl font-bold font-mono text-slate-400">{currentSheetData.emptyRowsCount}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase">Encabezados Repetidos</span>
                  <p className={`text-xl font-bold font-mono ${currentSheetData.duplicateHeaders.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {currentSheetData.duplicateHeaders.length}
                  </p>
                </div>
              </div>

              {/* Fila de inicio de encabezados */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-300">Fila de Encabezados Detectada:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Fila:</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={headerRowIndex + 1}
                    onChange={(e) => setHeaderRowIndex(Math.max(0, Number(e.target.value) - 1))}
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-xs text-white"
                  />
                  <span className="text-slate-500">(Normalmente fila 1)</span>
                </div>
              </div>

              {/* Encabezados Detectados */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Encabezados Identificados en la Hoja:
                </h4>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
                  {currentSheetData.headers.map((h, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-slate-850 text-[11px] text-slate-300 border border-slate-750 font-mono">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PASO 3: ASOCIAR COLUMNAS (MAPPING WIZARD) */}
          {/* ========================================================= */}
          {currentStep === 3 && currentSheetData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Asistente de Asociación de Columnas</h3>
                  <p className="text-xs text-slate-400">
                    Relacione las columnas del archivo Excel con los campos oficiales de la base de datos PostgreSQL.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const autoMap = excelService.autoDetectColumnMappings(currentSheetData.headers);
                    setColumnMapping(autoMap);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs font-medium border border-blue-500/40"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-detectar Automáticamente</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto p-1">
                {DEFAULT_COLUMN_MAPPINGS.map(def => {
                  const currentSelected = columnMapping[def.fieldKey] || '';
                  const isMapped = !!currentSelected;

                  return (
                    <div 
                      key={def.fieldKey}
                      className={`p-3 rounded-xl border text-xs transition ${
                        def.required && !isMapped 
                          ? 'bg-rose-950/20 border-rose-500/40' 
                          : isMapped 
                          ? 'bg-slate-950 border-emerald-500/30' 
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-100">{def.label}</span>
                            {def.required && (
                              <span className="text-[10px] text-rose-400 font-bold">* Obligatorio</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{def.description}</p>
                        </div>
                        {isMapped && (
                          <span className="text-emerald-400 font-bold shrink-0">✓ Mapeado</span>
                        )}
                      </div>

                      <select
                        aria-label={`Asociar columna para ${def.label}`}
                        value={currentSelected}
                        onChange={(e) => {
                          const val = e.target.value;
                          setColumnMapping(prev => ({
                            ...prev,
                            [def.fieldKey]: val
                          }));
                        }}
                        className="w-full mt-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-400"
                      >
                        <option value="">-- No asociar (Omitir campo) --</option>
                        {currentSheetData.headers.map((h, i) => (
                          <option key={i} value={h}>
                            Columna: {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PASO 4 & 5: VISTA PREVIA Y VALIDACIÓN TÉCNICA */}
          {/* ========================================================= */}
          {(currentStep === 4 || currentStep === 5) && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {currentStep === 4 ? 'Paso 4: Vista Previa de Datos Interpretados' : 'Paso 5: Validación Técnica Estricta'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Revisión fila por fila antes de autorizar la escritura en base de datos.
                  </p>
                </div>

                {/* Filtro de estado de validación */}
                <div className="flex items-center space-x-2 text-xs">
                  <span>Filtrar filas:</span>
                  <select
                    aria-label="Filtrar filas en vista previa"
                    value={filterPreviewStatus}
                    onChange={(e) => setFilterPreviewStatus(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
                  >
                    <option value="ALL">Todas las Filas ({validatedItems.length})</option>
                    <option value="VALID">Válidas ({validatedItems.filter(i => i.status === 'VALID').length})</option>
                    <option value="WARNING">Con Advertencias ({warningCount})</option>
                    <option value="ERROR">Con Errores Bloqueantes ({errorCount})</option>
                    <option value="DUPLICATE">Existentes en BD ({validatedItems.filter(i => !!i.matchExisting).length})</option>
                  </select>
                </div>
              </div>

              {/* Alerta de Errores Bloqueantes si los hay */}
              {errorCount > 0 && (
                <div className="p-3 bg-rose-950/40 border border-rose-600/40 rounded-xl text-xs text-rose-300 flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Se detectaron {errorCount} filas con errores críticos.</span> Estas filas no podrán ser importadas hasta corregir el archivo o deseleccionarlas (ej. TAG faltante o duplicado).
                  </div>
                </div>
              )}

              {/* Tabla de Vista Previa */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <div className="overflow-x-auto max-h-[46vh]">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-semibold sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Fila</th>
                        <th className="py-2.5 px-3">Estado</th>
                        <th className="py-2.5 px-3">TAG</th>
                        <th className="py-2.5 px-3">O/T</th>
                        <th className="py-2.5 px-3">Tipo & DN</th>
                        <th className="py-2.5 px-3">Rating</th>
                        <th className="py-2.5 px-3">Material Cuerpo</th>
                        <th className="py-2.5 px-3">Área / Sistema</th>
                        <th className="py-2.5 px-3">Acción Duplicado</th>
                        <th className="py-2.5 px-3">Observaciones / Errores</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {filteredValidatedItems.map((item, idx) => (
                        <tr key={idx} className={item.status === 'ERROR' ? 'bg-rose-950/20' : item.matchExisting ? 'bg-amber-950/20' : 'hover:bg-slate-900/50'}>
                          <td className="py-2 px-3 font-mono text-slate-400">{item.rowNumber}</td>
                          
                          <td className="py-2 px-3 whitespace-nowrap">
                            {item.status === 'VALID' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Válido
                              </span>
                            ) : item.status === 'WARNING' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Advertencia
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                Error
                              </span>
                            )}
                          </td>

                          <td className="py-2 px-3 font-mono font-bold text-slate-100">{item.parsedRecord?.tag || '-'}</td>
                          <td className="py-2 px-3 font-mono text-slate-300">{item.parsedRecord?.ot || '-'}</td>
                          <td className="py-2 px-3">{item.parsedRecord?.tipo_valvula} {item.parsedRecord?.diametro_nominal}</td>
                          <td className="py-2 px-3">{item.parsedRecord?.clase_rating}</td>
                          <td className="py-2 px-3">{item.parsedRecord?.material_cuerpo}</td>
                          <td className="py-2 px-3">{item.parsedRecord?.area_planta}</td>
                          
                          {/* Selector de Acción en Duplicado */}
                          <td className="py-2 px-3 whitespace-nowrap">
                            {item.matchExisting ? (
                              <div className="flex items-center space-x-1">
                                <select
                                  aria-label={`Acción de duplicado para fila ${item.rowNumber}`}
                                  value={item.duplicateAction}
                                  onChange={(e) => handleDuplicateActionChange(idx, e.target.value as any)}
                                  className="bg-slate-900 border border-amber-500/40 rounded px-1.5 py-1 text-[11px] text-amber-300"
                                >
                                  <option value="UPDATE">Actualizar Existente</option>
                                  <option value="SKIP">Omitir Fila</option>
                                  <option value="INSERT">Insertar como Nuevo</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => setDiffModalItem(item)}
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400"
                                  title="Ver comparación side-by-side de campos"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-emerald-400">Nuevo Registro</span>
                            )}
                          </td>

                          <td className="py-2 px-3 text-[11px]">
                            {item.errors.length > 0 ? (
                              <span className="text-rose-400 font-medium">{item.errors.join('; ')}</span>
                            ) : item.warnings.length > 0 ? (
                              <span className="text-amber-400">{item.warnings.join('; ')}</span>
                            ) : (
                              <span className="text-slate-400">Conforme</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PASO 6: RESOLUCIÓN DE DUPLICADOS & CONFLICTOS */}
          {/* ========================================================= */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Paso 6: Resolución de Duplicados & Conflictos</h3>
                <p className="text-xs text-slate-400">
                  Defina la política de inserción o actualización para los registros que ya coinciden por TAG con la base de datos oficial.
                </p>
              </div>

              {validatedItems.filter(i => !!i.matchExisting).length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-200">No se detectaron TAGs duplicados en la base de datos</p>
                  <p className="text-xs text-slate-400 mt-1">Todos los registros del archivo corresponden a nuevos activos para ingreso directo.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-850 rounded-xl border border-slate-750 flex items-center justify-between text-xs">
                    <span>Acción masiva para duplicados:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setValidatedItems(prev => prev.map(item => item.matchExisting ? { ...item, duplicateAction: 'UPDATE' } : item));
                        }}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs"
                      >
                        Actualizar Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setValidatedItems(prev => prev.map(item => item.matchExisting ? { ...item, duplicateAction: 'SKIP' } : item));
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                      >
                        Omitir Todos
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[48vh] overflow-y-auto">
                    {validatedItems.filter(i => !!i.matchExisting).map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl flex items-center justify-between gap-4 text-xs">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-amber-300 font-mono">{item.parsedRecord?.tag}</span>
                            <span className="text-slate-400">OT Archivo: {item.parsedRecord?.ot} vs OT BD: {item.matchExisting?.ot}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Estado en BD: {item.matchExisting?.estado_qaqc} • Ubicación: {item.matchExisting?.ubicacion_fisica}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setDiffModalItem(item)}
                            className="px-2 py-1 rounded bg-slate-800 text-blue-400 hover:bg-slate-700 text-[11px]"
                          >
                            Ver Diferencias
                          </button>
                          <select
                            aria-label={`Acción de duplicado para ${item.parsedRecord?.tag}`}
                            value={item.duplicateAction}
                            onChange={(e) => handleDuplicateActionChange(validatedItems.indexOf(item), e.target.value as any)}
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                          >
                            <option value="UPDATE">Actualizar Existente</option>
                            <option value="SKIP">Omitir</option>
                            <option value="INSERT">Insertar como Nuevo</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* PASO 7: CONFIRMAR IMPORTACIÓN */}
          {/* ========================================================= */}
          {currentStep === 7 && (
            <div className="space-y-6 max-w-2xl mx-auto py-4">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white">Paso 7: Confirmación Definitiva de Importación</h3>
                <p className="text-xs text-slate-400">
                  Revise el balance de operaciones antes de aplicar los cambios en la base de datos PostgreSQL.
                </p>
              </div>

              {/* Tarjetas de Balance */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  <span className="text-xs text-slate-400">Total Filas</span>
                  <p className="text-2xl font-bold font-mono text-white mt-1">{totalRowsInPreview}</p>
                </div>
                <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30 text-center">
                  <span className="text-xs text-emerald-400">A Insertar</span>
                  <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">+{newCount}</p>
                </div>
                <div className="bg-blue-950/30 p-4 rounded-xl border border-blue-500/30 text-center">
                  <span className="text-xs text-blue-400">A Actualizar</span>
                  <p className="text-2xl font-bold font-mono text-blue-400 mt-1">^{updateCount}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  <span className="text-xs text-slate-400">Omitidas / Rechazos</span>
                  <p className="text-2xl font-bold font-mono text-slate-400 mt-1">~{skipCount + errorCount}</p>
                </div>
              </div>

              {/* Resumen de Auditoría y Trazabilidad */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span>Usuario responsable de la importación:</span>
                  <strong className="text-white">{user.nombre} ({user.rol})</strong>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span>Archivo de origen:</span>
                  <span className="font-mono text-slate-200">{file?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span>Transaccionalidad:</span>
                  <span className="text-emerald-400 font-semibold">Garantizada (Batch Atómico con Log Inmutable)</span>
                </div>
                <div className="flex justify-between">
                  <span>Protección de fórmulas originales:</span>
                  <span className="text-slate-300">Preservadas en catálogo de metadatos</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-950/40 border border-emerald-600/40 rounded-xl text-xs text-emerald-200">
                Al confirmar, el sistema escribirá los registros oficiales en la base de datos, actualizará los índices de búsqueda y creará un registro en el historial de importaciones.
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PASO 8: RESULTADO Y AUDITORÍA FINAL */}
          {/* ========================================================= */}
          {currentStep === 8 && importResult && (
            <div className="space-y-6 max-w-2xl mx-auto py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">¡Importación Completada Exitosamente!</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Los registros fueron procesados e integrados a la base de datos oficial PGP 2026.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400">Nuevas Válvulas</span>
                  <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">+{importResult.inserted}</p>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400">Actualizadas</span>
                  <p className="text-2xl font-bold font-mono text-blue-400 mt-1">^{importResult.updated}</p>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400">Omitidas</span>
                  <p className="text-2xl font-bold font-mono text-slate-400 mt-1">~{importResult.skipped}</p>
                </div>
              </div>

              {/* Botones de acción posterior */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => excelService.exportCompleteDatabaseToExcel()}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Descargar Informe / Excel Actualizado</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition"
                >
                  Finalizar y Volver a la Matriz
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Barra de Navegación Inferior del Asistente */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div>
            {currentStep > 1 && currentStep < 8 && (
              <button
                type="button"
                onClick={() => setCurrentStep(s => s - 1)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-750 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Paso Anterior</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-medium"
            >
              Cancelar
            </button>

            {/* Botón Siguiente según Paso */}
            {currentStep === 1 && (
              <button
                type="button"
                disabled={!file}
                onClick={proceedToStep2}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow transition"
              >
                <span>Analizar Archivo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                onClick={proceedToStep3}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
              >
                <span>Asociar Columnas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                onClick={proceedToStep4}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
              >
                <span>Generar Vista Previa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 4 && (
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
              >
                <span>Validar Técnicamente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 5 && (
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
              >
                <span>Resolver Duplicados</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 6 && (
              <button
                type="button"
                onClick={() => setCurrentStep(7)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
              >
                <span>Continuar a Confirmación</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 7 && (
              <button
                type="button"
                onClick={executeFinalImport}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
              >
                <span>Confirmar e Importar</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Side-by-Side Diff para Resolución de Duplicados */}
      {diffModalItem && diffModalItem.matchExisting && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Comparación de Campos (Side-by-Side): {diffModalItem.matchExisting.tag}</span>
              </h4>
              <button
                onClick={() => setDiffModalItem(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Revise las discrepancias entre el registro existente en la base de datos y los datos provenientes del archivo Excel antes de autorizar la actualización.
            </p>

            <div className="max-h-[50vh] overflow-y-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Campo Técnico</th>
                    <th className="py-2.5 px-3">Valor Actual en Base de Datos</th>
                    <th className="py-2.5 px-3">Valor en Archivo Excel</th>
                    <th className="py-2.5 px-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {[
                    { label: 'O/T', k: 'ot' },
                    { label: 'Tipo Válvula', k: 'tipo_valvula' },
                    { label: 'Marca', k: 'marca' },
                    { label: 'Modelo', k: 'modelo' },
                    { label: 'DN / Tamaño', k: 'diametro_nominal' },
                    { label: 'Clase / Rating', k: 'clase_rating' },
                    { label: 'Conexión', k: 'tipo_conexion' },
                    { label: 'Material Cuerpo', k: 'material_cuerpo' },
                    { label: 'Material Asiento', k: 'material_asiento' },
                    { label: 'API Trim', k: 'material_trim' },
                    { label: 'Área Planta', k: 'area_planta' },
                    { label: 'Sistema', k: 'sistema' },
                    { label: 'Ubicación Física', k: 'ubicacion_fisica' },
                    { label: 'Estado QA/QC', k: 'estado_qaqc' }
                  ].map(({ label, k }) => {
                    const existingVal = (diffModalItem.matchExisting as any)[k];
                    const incomingVal = (diffModalItem.parsedRecord as any)?.[k];
                    const isDiff = String(existingVal || '').trim() !== String(incomingVal || '').trim();

                    return (
                      <tr key={k} className={isDiff ? 'bg-amber-950/20' : ''}>
                        <td className="py-2 px-3 font-semibold text-slate-300">{label}</td>
                        <td className="py-2 px-3 text-slate-400 font-mono">{String(existingVal ?? '-')}</td>
                        <td className={`py-2 px-3 font-mono ${isDiff ? 'text-amber-300 font-bold' : 'text-slate-300'}`}>
                          {String(incomingVal ?? '-')}
                        </td>
                        <td className="py-2 px-3">
                          {isDiff ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                              Cambia
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Sin cambio</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDiffModalItem(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Cerrar Comparación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
