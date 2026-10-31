/**
 * Tablero de Control y Métricas QA/QC en Tiempo Real
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 */

import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  Layers, 
  Clock, 
  FileSpreadsheet, 
  ArrowUpRight, 
  Activity,
  FileCheck,
  AlertOctagon,
  Database,
  HelpCircle
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ValveRecord, HydroTestRecord, PunchItemRecord } from '../types';
import { dbService } from '../services/storageService';
import { ActiveTab } from './Navbar';

interface DashboardProps {
  valves: ValveRecord[];
  hydroTests: HydroTestRecord[];
  punchItems: PunchItemRecord[];
  setActiveTab: (tab: ActiveTab) => void;
  openNewValveModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  valves,
  hydroTests,
  punchItems,
  setActiveTab,
  openNewValveModal
}) => {
  const auditLogs = dbService.getAuditLogs().slice(0, 6);

  // Cálculos estadísticos
  const totalValves = valves.length;
  const releasedValves = valves.filter(v => ['LIBERADA_QAQC', 'APROBADA_ITO', 'ENTREGADA_FAENA'].includes(v.estado_qaqc)).length;
  const releaseRate = totalValves > 0 ? Math.round((releasedValves / totalValves) * 100) : 0;

  const pendingTests = valves.filter(v => ['RECEPCION', 'PRUEBA_PENDIENTE'].includes(v.estado_qaqc)).length;
  const nonConforming = valves.filter(v => v.estado_qaqc === 'NO_CONFORME').length;

  // Punch list breakdown
  const openPunches = punchItems.filter(p => p.estado !== 'CERRADA');
  const criticalPunches = openPunches.filter(p => p.tipo_desviacion === 'TIPO_A_CRITICO').length;
  const majorPunches = openPunches.filter(p => p.tipo_desviacion === 'TIPO_B_MAYOR').length;
  const minorPunches = openPunches.filter(p => p.tipo_desviacion === 'TIPO_C_MENOR').length;

  // Hydro tests stats
  const totalHydro = hydroTests.length;
  const approvedHydro = hydroTests.filter(t => t.resultado_general === 'APROBADO').length;

  // Agrupación por tipo
  const typeCounts: Record<string, number> = {};
  valves.forEach(v => {
    typeCounts[v.tipo_valvula] = (typeCounts[v.tipo_valvula] || 0) + 1;
  });

  // Agrupación por Área
  const areaCounts: Record<string, number> = {};
  valves.forEach(v => {
    areaCounts[v.area_planta] = (areaCounts[v.area_planta] || 0) + 1;
  });

  // Datos para gráfico de dona Recharts: Liberadas vs. Pendientes vs. Rechazadas
  const countLiberadas = valves.filter(v => ['LIBERADA_QAQC', 'APROBADA_ITO', 'ENTREGADA_FAENA'].includes(v.estado_qaqc)).length;
  const countEnPruebas = valves.filter(v => v.estado_qaqc === 'EN_PRUEBAS').length;
  const countPendientes = valves.filter(v => ['RECEPCION', 'PRUEBA_PENDIENTE'].includes(v.estado_qaqc)).length;
  const countPunchList = valves.filter(v => v.estado_qaqc === 'PUNCH_LIST_ABIERTO').length;
  const countRechazadas = valves.filter(v => v.estado_qaqc === 'NO_CONFORME').length;

  const qaqcChartData = [
    { 
      name: 'Liberadas / Aprobadas ITO', 
      value: countLiberadas, 
      color: '#10b981', 
      subtext: 'Protocolo aprobado y validado por ITO'
    },
    { 
      name: 'En Banco de Pruebas', 
      value: countEnPruebas, 
      color: '#6366f1', 
      subtext: 'En ejecución de protocolo de presión'
    },
    { 
      name: 'Prueba Pendiente', 
      value: countPendientes, 
      color: '#0ea5e9', 
      subtext: 'Recepcionadas en taller sin prueba'
    },
    { 
      name: 'Punch List Abierto', 
      value: countPunchList, 
      color: '#f59e0b', 
      subtext: 'Observaciones pendientes de subsanar'
    },
    { 
      name: 'No Conforme / Rechazadas', 
      value: countRechazadas, 
      color: '#f43f5e', 
      subtext: 'Falla de estanqueidad o estructural'
    }
  ];

  // Tooltip personalizado para Recharts
  const CustomDonutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = totalValves > 0 ? Math.round((data.value / totalValves) * 100) : 0;
      return (
        <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }}></span>
            <span className="font-bold text-white">{data.name}</span>
          </div>
          <div className="flex items-baseline space-x-2 pt-1">
            <span className="text-xl font-bold font-mono" style={{ color: data.color }}>{data.value}</span>
            <span className="text-slate-400">válvulas ({pct}%)</span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-[200px] leading-relaxed">{data.subtext}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida y Estatus Operacional */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                Base de Datos Activa: PostgreSQL Ready
              </span>
              <span className="text-xs text-blue-300 font-medium">
                Normas: API 598 • ISO 5208 • ASME B16.34 • NCh 700 • NCh 1360
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1.5">Control de Calidad & Trazabilidad de Válvulas</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Monitoreo integral de inspección técnica en taller, protocolos de presión hidrostática de carcasa y asiento, liberación QA/QC y punch list con integridad referencial.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('import')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-md shadow-emerald-700/30 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Importar Matriz</span>
            </button>
            <button
              onClick={openNewValveModal}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-md shadow-blue-700/30 transition"
            >
              <Layers className="w-4 h-4" />
              <span>Nueva Válvula</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI de Estado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Válvulas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Válvulas en Matriz</span>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white font-mono">{totalValves}</span>
            <span className="text-xs text-slate-400">equipos registrados</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs flex justify-between text-slate-400">
            <span>Pendientes de Ensayo:</span>
            <span className="font-semibold text-amber-400">{pendingTests}</span>
          </div>
        </div>

        {/* Liberadas QA/QC */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Liberadas / Aprobadas</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-emerald-400 font-mono">{releasedValves}</span>
            <span className="text-sm font-semibold text-emerald-500">({releaseRate}%)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs flex justify-between text-slate-400">
            <span>Rechazadas / No Conformes:</span>
            <span className="font-semibold text-rose-400">{nonConforming}</span>
          </div>
        </div>

        {/* Pruebas Hidráulicas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ensayos Hidráulicos</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white font-mono">{approvedHydro}</span>
            <span className="text-xs text-slate-400">de {totalHydro} protocolos</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs flex justify-between text-slate-400">
            <span>Tasa de Aprobación API 598:</span>
            <span className="font-semibold text-indigo-400">
              {totalHydro > 0 ? `${Math.round((approvedHydro / totalHydro) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Punch List / Desviaciones */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Punch List Abierto</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              criticalPunches > 0 
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' 
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-3xl font-bold font-mono ${criticalPunches > 0 ? 'text-rose-400' : 'text-amber-400'}`}>
              {openPunches.length}
            </span>
            <span className="text-xs text-slate-400">pendientes</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs flex justify-between text-slate-400">
            <span className="text-rose-400 font-medium">Tipo A (Crítico Bloqueante):</span>
            <span className="font-bold text-rose-400">{criticalPunches}</span>
          </div>
        </div>
      </div>

      {/* Alerta si existen Punch List Tipo A Críticos */}
      {criticalPunches > 0 && (
        <div className="bg-rose-950/40 border border-rose-600/40 rounded-xl p-4 flex items-start space-x-3 text-rose-200">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-sm flex-1">
            <span className="font-bold text-rose-300">Atención QA/QC:</span> Hay <strong>{criticalPunches} observación(es) Tipo A Crítica(s)</strong> pendientes. Por regla de negocio PGP 2026, ninguna válvula asociada podrá ser liberada para despacho hasta que la ITO verifique y cierre formalmente el ítem.
          </div>
          <button
            onClick={() => setActiveTab('punch')}
            className="text-xs px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium shrink-0"
          >
            Ver Punch List
          </button>
        </div>
      )}

      {/* Panel de Estado de Liberación QA/QC (Visualización Gráfica Recharts) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">Estado de Liberación QA/QC de Válvulas</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold border border-emerald-500/30">
                Gráfico Recharts
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Distribución gráfica en tiempo real: Liberadas vs. En Banco vs. Pendientes vs. Punch List vs. Rechazadas (API 598 / NCh 700 / NCh 1360).
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('valves')}
              className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-slate-800 transition"
            >
              <span>Ver Listado en Matriz</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Gráfico Donut de Recharts */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[260px]">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomDonutTooltip />} />
                  <Pie
                    data={qaqcChartData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={98}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {qaqcChartData.filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Núcleo Central del Donut con Métricas Clave */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-extrabold text-white font-mono tracking-tight">{releaseRate}%</span>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Liberadas</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">{releasedValves} de {totalValves} equipos</span>
            </div>
          </div>

          {/* Tarjetas Desglosadas con Indicadores de Estado */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {qaqcChartData.map(item => {
              const pct = totalValves > 0 ? Math.round((item.value / totalValves) * 100) : 0;
              return (
                <div 
                  key={item.name}
                  onClick={() => setActiveTab('valves')}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex flex-col justify-between group shadow-sm"
                  title="Haga clic para filtrar válvulas en la matriz"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white transition">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold shrink-0" style={{ color: item.color }}>
                      {pct}%
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono text-white">{item.value}</span>
                    <span className="text-[11px] text-slate-500">válvulas registradas</span>
                  </div>

                  <div className="w-full bg-slate-850 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className="h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">{item.subtext}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gráficos de Distribución Técnica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Tipo de Válvula */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Distribución por Tipo de Válvula</span>
            </h2>
            <span className="text-xs text-slate-400">{Object.keys(typeCounts).length} tipos detectados</span>
          </div>

          <div className="space-y-3">
            {Object.entries(typeCounts).map(([type, count]) => {
              const pct = totalValves > 0 ? Math.round((count / totalValves) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                    <span>{type}</span>
                    <span className="text-slate-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribución por Área Operativa / Planta */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Válvulas por Área de Planta PGP</span>
            </h2>
            <span className="text-xs text-slate-400">{Object.keys(areaCounts).length} áreas activas</span>
          </div>

          <div className="space-y-3">
            {Object.entries(areaCounts).map(([area, count]) => {
              const pct = totalValves > 0 ? Math.round((count / totalValves) * 100) : 0;
              return (
                <div key={area}>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                    <span className="truncate max-w-[280px]" title={area}>{area}</span>
                    <span className="text-slate-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Registro de Auditoría Reciente y Acciones Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trazabilidad y Auditoría en Tiempo Real */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Registro Inmutable de Auditoría & Trazabilidad</span>
            </h2>
            <button
              onClick={() => setActiveTab('database')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>Ver Base de Datos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No hay registros de auditoría aún.</p>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="py-2.5 flex items-start justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.accion === 'INSERT' ? 'bg-emerald-500/20 text-emerald-300' :
                        log.accion === 'UPDATE' ? 'bg-blue-500/20 text-blue-300' :
                        log.accion === 'DELETE' ? 'bg-rose-500/20 text-rose-300' :
                        'bg-purple-500/20 text-purple-300'
                      }`}>
                        {log.accion}
                      </span>
                      <span className="font-semibold text-slate-200 font-mono">{log.tag}</span>
                      <span className="text-slate-400">({log.entidad})</span>
                    </div>
                    <p className="text-slate-400">
                      Por <strong className="text-slate-300">{log.usuario}</strong> ({log.rol})
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Acceso Rápido y Guía de Operación */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 pb-2 border-b border-slate-800 flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-400" />
            <span>Accesos Rápidos</span>
          </h2>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('valves')}
              className="w-full text-left p-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 transition flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-200">Matriz de Válvulas & Filtros Avanzados</p>
                <p className="text-[11px] text-slate-400">Filtrado por estado QA/QC, rating de presión y certificados PDF</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={() => setActiveTab('excel_management')}
              className="w-full text-left p-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 transition flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-200">Gestión de Archivos Excel (.xlsx/.xls/.csv)</p>
                <p className="text-[11px] text-slate-400">Detección de hojas múltiples, diagnóstico y edición previa</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={() => setActiveTab('hydro')}
              className="w-full text-left p-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 transition flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-200">Protocolos de Presión & Dossier Mensual</p>
                <p className="text-[11px] text-slate-400">Descargar Dossier Consolidado en PDF y Ensayos API 598</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-sky-400" />
            </button>

            <button
              onClick={() => setActiveTab('punch')}
              className="w-full text-left p-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 transition flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-200">Control de Punch List</p>
                <p className="text-[11px] text-slate-400">{criticalPunches} no conformidades críticas</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className="w-full text-left p-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 transition flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-200">Base de Datos Local & Google Drive</p>
                <p className="text-[11px] text-slate-400">Respaldos JSON, Dump SQL y Sincronización</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
