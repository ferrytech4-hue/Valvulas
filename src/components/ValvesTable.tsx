/**
 * Matriz Maestro de Válvulas PGP 2026
 * Búsqueda, filtros técnicos, paginación y acciones QA/QC
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  FileText, 
  Gauge, 
  AlertTriangle, 
  Paperclip, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  FileSpreadsheet,
  UploadCloud
} from 'lucide-react';
import { ValveRecord, QAQCStatus, ValveType } from '../types';
import { useAuth } from '../services/authContext';
import { excelService } from '../services/excelService';
import { dbService } from '../services/storageService';
import { PdfReportService } from '../services/pdfReportService';

interface ValvesTableProps {
  valves: ValveRecord[];
  onSelectValve: (valve: ValveRecord) => void;
  onEditValve: (valve: ValveRecord) => void;
  onDeleteValve: (id: string, tag: string) => void;
  onOpenHydroTest: (valve: ValveRecord) => void;
  onOpenPunchList: (valve: ValveRecord) => void;
  onOpenAttachments: (valve: ValveRecord) => void;
  onOpenNewModal: () => void;
  onOpenImport?: () => void;
  onClearMatrix?: () => void;
}

export const ValvesTable: React.FC<ValvesTableProps> = ({
  valves,
  onSelectValve,
  onEditValve,
  onDeleteValve,
  onOpenHydroTest,
  onOpenPunchList,
  onOpenAttachments,
  onOpenNewModal,
  onOpenImport,
  onClearMatrix
}) => {
  const { user, can } = useAuth();

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [areaFilter, setAreaFilter] = useState<string>('ALL');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Áreas únicas para filtro
  const uniqueAreas = useMemo(() => {
    return Array.from(new Set(valves.map(v => v.area_planta))).filter(Boolean);
  }, [valves]);

  // Clases de presión / Ratings únicos para filtro
  const uniqueRatings = useMemo(() => {
    const defaultRatings = ['150#', '300#', '600#', '900#', '1500#', '2500#', 'PN16', 'PN25', 'PN40', 'PN64', 'PN100'];
    const fromValves = valves.map(v => String(v.clase_rating || '').trim()).filter(Boolean);
    const combined = Array.from(new Set([...fromValves, ...defaultRatings]));
    return combined.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [valves]);

  // Tipos de válvula únicos para filtro
  const uniqueTypes = useMemo(() => {
    const defaultTypes = ['Compuerta', 'Globo', 'Bola', 'Retencion', 'Mariposa', 'Seguridad_PSV', 'Macho_Plug', 'Diafragma', 'Aguja'];
    const fromValves = valves.map(v => String(v.tipo_valvula || '').trim()).filter(Boolean);
    return Array.from(new Set([...fromValves, ...defaultTypes])).sort();
  }, [valves]);

  // Conteo de filtros activos
  const activeFiltersCount = (searchTerm ? 1 : 0) +
    (statusFilter !== 'ALL' ? 1 : 0) +
    (ratingFilter !== 'ALL' ? 1 : 0) +
    (typeFilter !== 'ALL' ? 1 : 0) +
    (areaFilter !== 'ALL' ? 1 : 0);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setRatingFilter('ALL');
    setTypeFilter('ALL');
    setAreaFilter('ALL');
    setCurrentPage(1);
  };

  // Válvulas filtradas
  const filteredValves = useMemo(() => {
    return valves.filter(v => {
      const matchesSearch = 
        v.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.ot.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.sistema.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.ubicacion_fisica.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || v.estado_qaqc === statusFilter;
      const matchesType = typeFilter === 'ALL' || v.tipo_valvula === typeFilter;
      const matchesArea = areaFilter === 'ALL' || v.area_planta === areaFilter;
      const matchesRating = ratingFilter === 'ALL' || v.clase_rating === ratingFilter;

      return matchesSearch && matchesStatus && matchesType && matchesArea && matchesRating;
    });
  }, [valves, searchTerm, statusFilter, typeFilter, areaFilter, ratingFilter]);

  // Cálculos de Paginación
  const totalPages = Math.ceil(filteredValves.length / pageSize) || 1;
  const paginatedValves = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredValves.slice(start, start + pageSize);
  }, [filteredValves, currentPage, pageSize]);

  // Badge visual según Estado QA/QC
  const renderStatusBadge = (status: QAQCStatus) => {
    switch (status) {
      case 'LIBERADA_QAQC':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Liberada QA/QC</span>
          </span>
        );
      case 'APROBADA_ITO':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Aprobada ITO</span>
          </span>
        );
      case 'ENTREGADA_FAENA':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <span>Entregada Faena</span>
          </span>
        );
      case 'PUNCH_LIST_ABIERTO':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Punch List Abierto</span>
          </span>
        );
      case 'EN_PRUEBAS':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Gauge className="w-3.5 h-3.5" />
            <span>En Pruebas</span>
          </span>
        );
      case 'PRUEBA_PENDIENTE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-slate-300 border border-slate-600">
            <Clock className="w-3.5 h-3.5" />
            <span>Prueba Pendiente</span>
          </span>
        );
      case 'NO_CONFORME':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>No Conforme</span>
          </span>
        );
      case 'RECEPCION':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <span>Recepción Taller</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Acciones Superiores */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Matriz Técnica de Válvulas</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
              {filteredValves.length} registros
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition cursor-pointer"
              title="Cargar archivo Excel (.xlsx / .xls / .csv)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Importar Excel</span>
            </button>
          )}

          {can('CREATE_VALVE') && (
            <button
              onClick={onOpenNewModal}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Válvula</span>
            </button>
          )}

          {can('EXPORT_DATA') && valves.length > 0 && (
            <button
              onClick={() => excelService.exportCompleteDatabaseToExcel()}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
              title="Descargar datos en formato Excel .xlsx"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Excel</span>
            </button>
          )}

          {onClearMatrix && valves.length > 0 && can('DELETE_VALVE') && (
            <button
              onClick={onClearMatrix}
              className="flex items-center space-x-1.5 px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-medium transition cursor-pointer"
              title="Vaciar la matriz y dejarla lista para nueva importación"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Limpiar Matriz</span>
            </button>
          )}
        </div>
      </div>

      {/* Si la matriz está vacía: Pantalla 'Lista para Importar' */}
      {valves.length === 0 ? (
        <div className="bg-slate-900 border-2 border-dashed border-emerald-500/30 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-xl animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
            <FileSpreadsheet className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>MATRIZ LISTA PARA IMPORTAR</span>
            </span>
            <h3 className="text-xl font-bold text-white">No hay válvulas registradas en el sistema</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              La matriz se encuentra completamente limpia y lista para recibir sus datos. Suba su archivo Excel (.xlsx, .xls) o CSV de faena para poblar la base de datos automáticamente con verificación de integridad técnica.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onOpenImport && (
              <button
                onClick={onOpenImport}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Cargar Archivo Excel</span>
              </button>
            )}

            <button
              onClick={() => excelService.downloadTemplateExcel()}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Descargar Plantilla Oficial (.xlsx)</span>
            </button>

            {can('CREATE_VALVE') && (
              <button
                onClick={onOpenNewModal}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Ingreso Manual</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
      {/* Barra de Filtrado Avanzado */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3.5 shadow-md">
        {/* Cabecera de la Barra de Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Filtros Avanzados</span>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse">
                    {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro activo' : 'filtros activos'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Filtre por estado de prueba QA/QC, clase de presión (rating), tipo constructivo y área de faena
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 font-mono">
              Mostrando <strong className="text-white">{filteredValves.length}</strong> de <span className="text-slate-500">{valves.length}</span>
            </span>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition shadow-sm"
                title="Restablecer todos los filtros y búsqueda"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Limpiar Filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* Cuadrícula de Selectores y Búsqueda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Búsqueda Global */}
          <div className="relative">
            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              Búsqueda Libre
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="TAG, O/T, marca, sistema..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-7 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filtro 1: Estado de Prueba / QA/QC */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              Estado de Prueba QA/QC
            </label>
            <select
              aria-label="Filtrar por estado de prueba y QA/QC"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="LIBERADA_QAQC">✓ Liberada QA/QC</option>
              <option value="APROBADA_ITO">✓ Aprobada ITO</option>
              <option value="EN_PRUEBAS">⏳ En Pruebas</option>
              <option value="PRUEBA_PENDIENTE">○ Prueba Pendiente</option>
              <option value="PUNCH_LIST_ABIERTO">⚠ Punch List Abierto</option>
              <option value="NO_CONFORME">✕ No Conforme</option>
              <option value="RECEPCION">Recepción Taller</option>
              <option value="ENTREGADA_FAENA">Entregada Faena</option>
            </select>
          </div>

          {/* Filtro 2: Clase de Presión / Rating */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              Clase de Presión (Rating)
            </label>
            <select
              aria-label="Filtrar por clase de presión o rating"
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
            >
              <option value="ALL">Todas las Clases (# / PN)</option>
              {uniqueRatings.map(rating => (
                <option key={rating} value={rating}>Clase {rating}</option>
              ))}
            </select>
          </div>

          {/* Filtro 3: Tipo de Válvula */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              Tipo de Válvula
            </label>
            <select
              aria-label="Filtrar por tipo de válvula"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
            >
              <option value="ALL">Todos los Tipos</option>
              {uniqueTypes.map(t => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro 4: Área de Planta */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              Área de Faena
            </label>
            <select
              aria-label="Filtrar por área de planta"
              value={areaFilter}
              onChange={(e) => {
                setAreaFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
            >
              <option value="ALL">Todas las Áreas</option>
              {uniqueAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Chips de Filtros Activos para remoción rápida */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-[11px] text-slate-400">Filtros aplicados:</span>

            {searchTerm && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-[11px]">
                <span>Búsqueda: "{searchTerm}"</span>
                <button onClick={() => setSearchTerm('')} className="hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {statusFilter !== 'ALL' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px]">
                <span>Estado: {statusFilter.replace(/_/g, ' ')}</span>
                <button onClick={() => setStatusFilter('ALL')} className="hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {ratingFilter !== 'ALL' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px]">
                <span>Clase: {ratingFilter}</span>
                <button onClick={() => setRatingFilter('ALL')} className="hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {typeFilter !== 'ALL' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px]">
                <span>Tipo: {typeFilter.replace(/_/g, ' ')}</span>
                <button onClick={() => setTypeFilter('ALL')} className="hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {areaFilter !== 'ALL' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px]">
                <span>Área: {areaFilter}</span>
                <button onClick={() => setAreaFilter('ALL')} className="hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabla Técnica */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">TAG / Equipo</th>
                <th className="py-3 px-3">O/T</th>
                <th className="py-3 px-3">Tipo & Tamaño</th>
                <th className="py-3 px-3">Rating & Conexión</th>
                <th className="py-3 px-3">Materiales (Cuerpo/Trim)</th>
                <th className="py-3 px-3">Área / Sistema</th>
                <th className="py-3 px-3">Estado QA/QC</th>
                <th className="py-3 px-3">Inspector ITO</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {paginatedValves.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No se encontraron válvulas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedValves.map(valve => (
                  <tr key={valve.id} className="hover:bg-slate-850/60 transition">
                    {/* TAG & P&ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-100 whitespace-nowrap">
                      <div>
                        <span className="text-blue-400 hover:underline cursor-pointer" onClick={() => onSelectValve(valve)}>
                          {valve.tag}
                        </span>
                        {valve.pidNumber && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {valve.pidNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* O/T & Línea */}
                    <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                      <div>{valve.ot}</div>
                      {valve.lineCode && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]" title={valve.lineCode}>
                          {valve.lineCode}
                        </div>
                      )}
                    </td>

                    {/* Tipo y Diámetro */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-200">{valve.tipo_valvula}</div>
                      <div className="text-[11px] text-slate-400">DN: {valve.diametro_nominal}</div>
                    </td>

                    {/* Rating y Conexión */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-200">{valve.clase_rating}</div>
                      <div className="text-[11px] text-slate-400">{valve.tipo_conexion}</div>
                    </td>

                    {/* Materiales */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200 truncate max-w-[160px]" title={valve.material_cuerpo}>
                        {valve.material_cuerpo}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px]" title={`${valve.material_asiento} / ${valve.material_trim}`}>
                        {valve.material_asiento} | {valve.material_trim}
                      </div>
                    </td>

                    {/* Área / Sistema */}
                    <td className="py-3 px-3">
                      <div className="text-slate-200 truncate max-w-[160px]" title={valve.area_planta}>
                        {valve.area_planta}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px]" title={valve.sistema}>
                        {valve.sistema}
                      </div>
                    </td>

                    {/* Estado QA/QC */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {renderStatusBadge(valve.estado_qaqc)}
                    </td>

                    {/* Inspector ITO */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                      {valve.inspector_ito}
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        {/* Ver Ficha Técnica */}
                        <button
                          onClick={() => onSelectValve(valve)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition"
                          title="Ver Ficha Técnica y Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Prueba Hidráulica */}
                        <button
                          onClick={() => onOpenHydroTest(valve)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition"
                          title="Registrar / Ver Ensayos Hidráulicos API 598"
                        >
                          <Gauge className="w-4 h-4" />
                        </button>

                        {/* Punch List */}
                        <button
                          onClick={() => onOpenPunchList(valve)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition"
                          title="Gestionar Punch List / Desviaciones"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>

                        {/* Adjuntos */}
                        <button
                          onClick={() => onOpenAttachments(valve)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-purple-400 transition"
                          title="Ver / Subir Certificados MTR y Fotos"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>

                        {/* Reporte PDF jsPDF */}
                        <button
                          onClick={() => {
                            const test = dbService.getHydroTestsByValveId(valve.id)[0] || null;
                            const punches = dbService.getPunchItemsByValveId(valve.id);
                            PdfReportService.downloadCertificatePdf({
                              valve,
                              hydroTest: test,
                              punchItems: punches,
                              companyName: '[EMPRESA / PROYECTO MAESTRO PGP 2026]',
                              issuedBy: user.nombre
                            });
                          }}
                          className="p-1.5 rounded hover:bg-slate-800 text-sky-400 hover:text-sky-300 transition"
                          title="Descargar Reporte PDF Detallado con jsPDF"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Editar */}
                        {can('EDIT_VALVE') && (
                          <button
                            onClick={() => onEditValve(valve)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-yellow-400 transition"
                            title="Editar Datos de la Válvula"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Eliminar */}
                        {can('DELETE_VALVE') && (
                          <button
                            onClick={() => onDeleteValve(valve.id, valve.tag)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                            title="Eliminar Registro de Matriz"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span>Mostrando {filteredValves.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, filteredValves.length)} de {filteredValves.length} registros</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <span>Filas por página:</span>
              <select
                aria-label="Número de filas por página"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-300">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};
