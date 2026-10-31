/**
 * Módulo de Carga y Gestión de Archivos Excel (.xlsx, .xls, .csv)
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 * 
 * Permite:
 * - Carga por botón y por arrastrar y soltar (sin tablas de celdas engorrosas)
 * - Detección automática de múltiples hojas con conteo de registros y columnas
 * - Selección e inspección técnica de cada hoja
 * - Diagnóstico de celdas vacías, duplicados y columnas detectadas
 * - Importación directa a la base de datos de la Matriz de Válvulas
 * - Exportación de planillas y descarga de plantilla oficial
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Check, 
  HelpCircle,
  Columns,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { excelService } from '../services/excelService';
import { dbService } from '../services/storageService';
import { StoredExcelSheet } from '../db/indexedDb';
import { useAuth } from '../services/authContext';

interface ExcelManagementViewProps {
  onDataImported?: () => void;
}

export const ExcelManagementView: React.FC<ExcelManagementViewProps> = ({ 
  onDataImported 
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [parsedWorkbook, setParsedWorkbook] = useState<{
    fileName: string;
    fileSizeBytes: number;
    sheetNames: string[];
    sheets: Record<string, any>;
  } | null>(null);

  const [activeSheetName, setActiveSheetName] = useState<string>('');
  const [activeSheetData, setActiveSheetData] = useState<Record<string, any>[]>([]);
  const [activeSheetHeaders, setActiveSheetHeaders] = useState<string[]>([]);
  const [importSummary, setImportSummary] = useState<{
    message: string;
    inserted: number;
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const [storedSheets, setStoredSheets] = useState<StoredExcelSheet[]>([]);

  // Cargar hojas previamente almacenadas en IndexedDB
  useEffect(() => {
    loadStoredSheets();
  }, []);

  const loadStoredSheets = async () => {
    const list = await dbService.getStoredExcelSheets();
    setStoredSheets(list);
  };

  const processFile = async (file: File) => {
    setAnalyzing(true);
    setImportSummary(null);
    setCurrentFile(file);
    try {
      const result = await excelService.parseMultiSheetWorkbook(file);
      setParsedWorkbook(result);
      if (result.sheetNames.length > 0) {
        const firstSheet = result.sheetNames[0];
        setActiveSheetName(firstSheet);
        const sheetObj = result.sheets[firstSheet];
        setActiveSheetHeaders(sheetObj.headers);
        setActiveSheetData(sheetObj.allData);

        // Guardar automáticamente en IndexedDB para disponibilidad permanente
        const storedItem: StoredExcelSheet = {
          id: `sheet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          fileId: `file-${Date.now()}`,
          fileName: file.name,
          sheetName: firstSheet,
          totalRows: sheetObj.totalRows,
          totalCols: sheetObj.totalCols,
          headers: sheetObj.headers,
          data: sheetObj.allData,
          uploadedAt: new Date().toISOString()
        };
        await dbService.saveExcelSheet(storedItem);
        await loadStoredSheets();
      }
    } catch (err: any) {
      alert(`Error al analizar el archivo Excel: ${err?.message || 'Formato no soportado'}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSelectSheet = (name: string) => {
    if (!parsedWorkbook) return;
    setActiveSheetName(name);
    const sheetObj = parsedWorkbook.sheets[name];
    setActiveSheetHeaders(sheetObj.headers);
    setActiveSheetData(sheetObj.allData);
    setImportSummary(null);
  };

  const handleExecuteImportToSystem = () => {
    if (!activeSheetData || activeSheetData.length === 0) {
      alert('La hoja seleccionada no contiene registros para importar.');
      return;
    }

    if (!window.confirm(`¿Confirmar importación de ${activeSheetData.length} registros de la hoja "${activeSheetName}" al sistema PGP 2026? Se validarán TAGs existentes y reglas de calidad.`)) {
      return;
    }

    try {
      const result = dbService.importFromExcelMatrix(
        activeSheetData,
        parsedWorkbook?.fileName || 'importacion.xlsx',
        parsedWorkbook?.fileSizeBytes || 1024,
        user.nombre,
        user.rol
      );

      setImportSummary({
        message: `Importación completada: +${result.inserted} nuevas válvulas, ^${result.updated} actualizadas, ~${result.skipped} omitidas.`,
        inserted: result.inserted,
        updated: result.updated,
        skipped: result.skipped,
        errors: result.errors
      });

      if (onDataImported) onDataImported();
    } catch (err: any) {
      alert(`Error en importación: ${err?.message || 'Ocurrió un error inesperado'}`);
    }
  };

  const handleExportCurrentSheet = () => {
    if (!activeSheetData || activeSheetData.length === 0) {
      alert('No hay datos en la hoja actual para exportar.');
      return;
    }
    excelService.exportCustomRowsToExcel(
      activeSheetData,
      `Export_${activeSheetName}_${new Date().toISOString().split('T')[0]}.xlsx`,
      activeSheetName
    );
  };

  const handleExportAllSheets = () => {
    if (!parsedWorkbook) return;
    const sheetsToExport = parsedWorkbook.sheetNames.map(name => ({
      name,
      data: parsedWorkbook.sheets[name].allData
    }));
    excelService.exportMultiSheetsToExcel(
      sheetsToExport,
      `Libro_Completo_${parsedWorkbook.fileName.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const currentSheetObj = parsedWorkbook?.sheets[activeSheetName];

  return (
    <div className="space-y-6">
      {/* Banner Superior */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                Módulo de Carga Excel
              </span>
              <span className="text-xs text-slate-400">SheetJS • .xlsx / .xls / .csv • IndexedDB</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Carga y Procesamiento de Archivos Excel</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Suba sus planillas técnicas (.xlsx, .xls o .csv) para detectar hojas, validar columnas y cargar los registros directamente a la Matriz de Válvulas del sistema.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => excelService.downloadRecommendedThreeSheetWorkbook()}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Plantilla Oficial (3 Pestañas)</span>
            </button>

            <button
              onClick={() => excelService.downloadTemplateExcel()}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Plantilla Simple (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarjeta Explicativa de la Estructura Recomendada de 3 Pestañas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Estructura Recomendada de la Planilla (3 Pestañas)</h3>
              <p className="text-xs text-slate-400">
                Diseñada para un control profesional y trazabilidad completa de inventario, pruebas y mantenimiento
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            ESTÁNDAR OFICIAL
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400 font-mono block">1. INVENTARIO_VALVULAS</span>
            <p className="text-slate-300 text-[11px]">
              Registro, tag, ubicación y características de cada equipo.
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Tag / Código • Tipo de Válvula • Diámetro • Presión Nominal (Clase/PN) • Ubicación / Línea • Estado Actual • Frecuencia PH (Meses)
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-blue-400 font-mono block">2. PRUEBAS_PH</span>
            <p className="text-slate-300 text-[11px]">
              Registro específico de pruebas hidrostáticas con presiones, tiempos y resultados.
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Código Válvula • Fecha Prueba • Presión Sistema (Kg) • Presión de Prueba (Kg) • Tiempo Sostén (Min) • ¿Pérdidas? • Resultado • Próxima PH
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-purple-400 font-mono block">3. HISTORIAL_MANTENCION</span>
            <p className="text-slate-300 text-[11px]">
              Bitácora de limpiezas, cambios de empaques, calibración de actuadores y observaciones.
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Código Válvula • Fecha Mantención • Tipo de Mantención • Componentes Cambiados • Técnico • Firma / Certificado
            </p>
          </div>
        </div>
      </div>

      {/* Zona de Carga / Drag & Drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
          isDragging 
            ? 'border-blue-500 bg-blue-950/20' 
            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Upload className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">Arrastre y suelte su archivo Excel aquí</h3>
            <p className="text-xs text-slate-400 mt-1">
              Compatible con libros multi-hoja (.xlsx, .xls) y archivos delimitados (.csv)
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={analyzing}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg shadow transition cursor-pointer"
          >
            {analyzing ? 'Analizando estructura...' : 'Seleccionar archivo desde el equipo'}
          </button>
        </div>
      </div>

      {/* Si se cargó un libro Excel: Selector de Hojas y Métricas */}
      {parsedWorkbook && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-sm">{parsedWorkbook.fileName}</span>
                <span className="text-xs text-slate-400">({(parsedWorkbook.fileSizeBytes / 1024).toFixed(1)} KB)</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Se detectaron <strong className="text-white">{parsedWorkbook.sheetNames.length}</strong> hojas de cálculo en el libro.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCurrentSheet}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Exportar Hoja</span>
              </button>

              <button
                onClick={handleExportAllSheets}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Exportar Todas</span>
              </button>

              <button
                onClick={handleExecuteImportToSystem}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow cursor-pointer transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Cargar Registros a Matriz</span>
              </button>
            </div>
          </div>

          {/* Selector de Pestañas de Hojas */}
          <div className="flex flex-wrap gap-2">
            {parsedWorkbook.sheetNames.map(name => {
              const info = parsedWorkbook.sheets[name];
              const isActive = name === activeSheetName;
              return (
                <button
                  key={name}
                  onClick={() => handleSelectSheet(name)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow' 
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {info.totalRows} filas
                  </span>
                </button>
              );
            })}
          </div>

          {/* Diagnóstico de la Hoja Seleccionada */}
          {currentSheetObj && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Total Filas Detectadas:</span>
                <div className="text-base font-bold text-white font-mono">{currentSheetObj.totalRows}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Columnas Detectadas:</span>
                <div className="text-base font-bold text-blue-400 font-mono">{currentSheetObj.totalCols}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Celdas Vacías:</span>
                <div className={`text-base font-bold font-mono ${currentSheetObj.emptyCellsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {currentSheetObj.emptyCellsCount}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">TAGs Duplicados en Hoja:</span>
                <div className={`text-base font-bold font-mono ${currentSheetObj.duplicateTagsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {currentSheetObj.duplicateTagsCount}
                </div>
              </div>
            </div>
          )}

          {/* Resumen de Importación */}
          {importSummary && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{importSummary.message}</span>
              </div>
              {importSummary.errors.length > 0 && (
                <div className="text-rose-400 mt-2 space-y-1">
                  <span className="font-semibold">Observaciones detectadas:</span>
                  <ul className="list-disc list-inside">
                    {importSummary.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Encabezados y Columnas Reconocidas */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                <Columns className="w-4 h-4 text-blue-400" />
                <span>Columnas Detectadas en la Hoja ({activeSheetHeaders.length}):</span>
              </div>
              <span className="text-[11px] text-slate-500">Mapeo automático a campos de válvulas</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {activeSheetHeaders.map((header, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-900 border border-slate-800 text-slate-300"
                >
                  {header}
                </span>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-900 text-xs text-slate-400">
              <span>
                Los registros se sincronizan con identificadores estables sin destruir datos locales existentes.
              </span>
              <button
                onClick={handleExecuteImportToSystem}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer"
              >
                <span>Procesar e Importar {activeSheetData.length} Válvulas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
