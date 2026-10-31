/**
 * Panel y Generador de Dossier Técnico Consolidado Mensual en PDF (jsPDF)
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 * 
 * Permite:
 * - Seleccionar cualquier mes con registros de ensayos ejecutados
 * - Previsualizar KPIs mensuales (Total pruebas, aprobadas, tasa de conformidad, manómetros)
 * - Descargar el Dossier Técnico Consolidado en PDF multi-página con normas, matriz y firmas
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Gauge,
  Sparkles
} from 'lucide-react';
import { HydroTestRecord, ValveRecord } from '../types';
import { PdfReportService } from '../services/pdfReportService';
import { useAuth } from '../services/authContext';

interface MonthlyDossierPanelProps {
  hydroTests: HydroTestRecord[];
  valves: ValveRecord[];
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MonthlyDossierPanel: React.FC<MonthlyDossierPanelProps> = ({
  hydroTests,
  valves
}) => {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);

  // Obtener todos los meses únicos disponibles con formato YYYY-MM
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();

    hydroTests.forEach(t => {
      if (t.fecha_ensayo && t.fecha_ensayo.length >= 7) {
        monthSet.add(t.fecha_ensayo.substring(0, 7));
      }
    });

    // Agregar mes actual por defecto si no estuviera
    const currentMonthKey = new Date().toISOString().substring(0, 7);
    monthSet.add(currentMonthKey);

    return Array.from(monthSet).sort().reverse();
  }, [hydroTests]);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return availableMonths[0] || new Date().toISOString().substring(0, 7);
  });

  // Filtrar pruebas del mes seleccionado
  const monthTests = useMemo(() => {
    return hydroTests.filter(t => t.fecha_ensayo && t.fecha_ensayo.startsWith(selectedMonth));
  }, [hydroTests, selectedMonth]);

  // Formatear etiqueta legible: '2026-10' -> 'Octubre 2026'
  const monthLabel = useMemo(() => {
    const [year, monthNum] = selectedMonth.split('-');
    const monthIndex = parseInt(monthNum, 10) - 1;
    const name = MONTH_NAMES[monthIndex] || 'Mes';
    return `${name} ${year}`;
  }, [selectedMonth]);

  // Métricas del mes
  const approvedCount = monthTests.filter(t => t.resultado_general === 'APROBADO').length;
  const rejectedCount = monthTests.filter(t => t.resultado_general === 'RECHAZADO').length;
  const observationCount = monthTests.length - approvedCount - rejectedCount;
  const passRate = monthTests.length > 0 ? Math.round((approvedCount / monthTests.length) * 100) : 0;
  const distinctManometers = Array.from(new Set(monthTests.map(t => t.manometro_id).filter(Boolean)));

  const handleDownloadDossier = () => {
    if (monthTests.length === 0) {
      alert(`No se registran pruebas hidráulicas ejecutadas en ${monthLabel}.`);
      return;
    }

    setDownloading(true);
    try {
      PdfReportService.downloadMonthlyDossierPdf({
        month: selectedMonth,
        monthLabel,
        hydroTests: monthTests,
        valves,
        companyName: '[EMPRESA / PROYECTO MAESTRO PGP 2026]',
        projectName: 'SISTEMA INTEGRAL DE CONTROL DE CALIDAD DE VÁLVULAS PGP 2026',
        issuedBy: user.nombre
      });
    } catch (e: any) {
      alert(`Error al generar dossier PDF: ${e?.message || 'Error desconocido'}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Entregable Oficial QA/QC
            </span>
            <span className="text-xs text-slate-400">jsPDF • Formato A4 • Multisede & Multiusuario</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <span>Dossier Técnico Consolidado de Pruebas Hidráulicas</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
            Genere y descargue en un solo archivo PDF el compilado mensual oficial con portada institucional, indicadores KPI, matriz consolidada de protocolos API 598 / ISO 5208, trazabilidad de manómetros y firmas técnicas de cierre de mes.
          </p>
        </div>

        {/* Selector de Mes y Botón de Descarga */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              {availableMonths.map(m => {
                const [y, num] = m.split('-');
                const name = MONTH_NAMES[parseInt(num, 10) - 1] || 'Mes';
                const count = hydroTests.filter(t => t.fecha_ensayo && t.fecha_ensayo.startsWith(m)).length;
                return (
                  <option key={m} value={m} className="bg-slate-900 text-slate-200">
                    {name} {y} ({count} protocolos)
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={handleDownloadDossier}
            disabled={downloading || monthTests.length === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold shadow-lg transition ${
              monthTests.length > 0 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Compilando Dossier...' : `Descargar Dossier Mensual (${monthLabel})`}</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas del Mes Seleccionado */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs pt-3 border-t border-slate-800">
        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[11px]">Ensayos en {monthLabel}:</span>
          <div className="text-base font-bold text-white font-mono mt-0.5">{monthTests.length}</div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[11px]">Aprobados:</span>
          <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">{approvedCount}</div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[11px]">No Conformes:</span>
          <div className="text-base font-bold text-rose-400 font-mono mt-0.5">{rejectedCount}</div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[11px]">Conformidad Mensual:</span>
          <div className="text-base font-bold text-blue-400 font-mono mt-0.5">{passRate}%</div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-slate-400 text-[11px]">Manómetros Patrón:</span>
          <div className="text-xs font-bold text-slate-200 font-mono mt-1 truncate" title={distinctManometers.join(', ')}>
            {distinctManometers.length > 0 ? distinctManometers.join(', ') : 'Ninguno'}
          </div>
        </div>
      </div>
    </div>
  );
};
