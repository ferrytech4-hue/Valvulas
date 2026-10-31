/**
 * Módulo de Pruebas Hidráulicas y Ensayos de Calidad
 * Normas: API 598 / ISO 5208 / ASME B16.34
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 */

import React, { useState } from 'react';
import { 
  Gauge, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  FileCheck, 
  UserCheck, 
  Activity,
  Plus,
  Calendar
} from 'lucide-react';
import { ValveRecord, HydroTestRecord, TestStandard, TestResult } from '../types';
import { dbService } from '../services/storageService';
import { useAuth } from '../services/authContext';

interface HydroTestModalProps {
  valve: ValveRecord;
  onClose: () => void;
  onTestSaved: () => void;
}

export const HydroTestModal: React.FC<HydroTestModalProps> = ({
  valve,
  onClose,
  onTestSaved
}) => {
  const { user, can } = useAuth();
  const existingTests = dbService.getHydroTestsByValveId(valve.id);

  // Modo: ver historial o registrar nuevo ensayo
  const [viewMode, setViewMode] = useState<'LIST' | 'NEW'>('LIST');

  // Parámetros calculados según Rating para valores por defecto (ASME B16.34)
  const calculateDefaultPressures = () => {
    let pDesign = valve.presion_diseno_bar || 50;
    if (valve.clase_rating === '150#') pDesign = 19.6;
    else if (valve.clase_rating === '300#') pDesign = 51.0;
    else if (valve.clase_rating === '600#') pDesign = 102.0;
    else if (valve.clase_rating === '900#') pDesign = 153.0;
    else if (valve.clase_rating === '1500#') pDesign = 255.0;

    const pShell = Math.round(pDesign * 1.5 * 10) / 10;
    const pSeat = Math.round(pDesign * 1.1 * 10) / 10;

    return { pShell, pSeat };
  };

  const defaults = calculateDefaultPressures();

  // Formulario de Nuevo Ensayo
  const [formData, setFormData] = useState<Partial<HydroTestRecord>>({
    valvula_id: valve.id,
    tag: valve.tag,
    ot: valve.ot,
    numero_protocolo: `PH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    fecha_ensayo: new Date().toISOString().split('T')[0],
    norma_aplicable: 'API 598',
    fluido_prueba: 'Agua Tratada con Inhibidor de Corrosión',
    temp_fluido_c: 19.5,
    manometro_id: 'MAN-CAL-04 (0-250 bar)',
    manometro_calibracion_vigente: '2026-09-30',
    // Carcasa
    presion_carcasa_requerida_bar: defaults.pShell,
    presion_carcasa_aplicada_bar: defaults.pShell,
    tiempo_carcasa_seg: 180,
    resultado_carcasa: 'APROBADO',
    obs_carcasa: 'Sin exudación, deformación ni caída de presión.',
    // Asiento HP
    presion_asiento_hp_requerida_bar: defaults.pSeat,
    presion_asiento_hp_aplicada_bar: defaults.pSeat,
    tiempo_asiento_hp_seg: 120,
    fuga_admisible_asiento: '0 gotas/min (API 598 Rate A)',
    fuga_medida_asiento: '0 gotas/min',
    resultado_asiento_hp: 'APROBADO',
    // Asiento LP
    presion_asiento_lp_bar: 6.0,
    fuga_medida_lp_burbujas_min: 0,
    resultado_asiento_lp: 'APROBADO',
    // Contrasello
    aplica_contrasello: valve.tipo_valvula === 'Compuerta' || valve.tipo_valvula === 'Globo',
    presion_contrasello_bar: defaults.pSeat,
    resultado_contrasello: (valve.tipo_valvula === 'Compuerta' || valve.tipo_valvula === 'Globo') ? 'APROBADO' : 'NO_APLICA',
    // Veredicto
    resultado_general: 'APROBADO',
    inspector_ejecutor: user.nombre,
    inspector_ito_validador: valve.inspector_ito,
    firma_ito: user.rol === 'INSPECTOR_ITO' || user.rol === 'ADMINISTRADOR',
    observaciones: 'Prueba ejecutada de acuerdo a procedimiento estándar PGP-PR-QA-04.'
  });

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaving(true);

    try {
      if (!formData.numero_protocolo) throw new Error('El número de protocolo es obligatorio');
      if (!formData.presion_carcasa_aplicada_bar || formData.presion_carcasa_aplicada_bar <= 0) {
        throw new Error('La presión de carcasa aplicada debe ser mayor a 0');
      }

      dbService.saveHydroTest(formData as any, user.nombre, user.rol);
      onTestSaved();
      setViewMode('LIST');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error guardando protocolo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Cabecera */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Ensayos Hidráulicos & Presión API 598</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                  {valve.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                OT: {valve.ot} • Tipo: {valve.tipo_valvula} {valve.diametro_nominal} • Clase: {valve.clase_rating}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {can('PERFORM_HYDRO_TEST') && viewMode === 'LIST' && (
              <button
                type="button"
                onClick={() => setViewMode('NEW')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Ensayo</span>
              </button>
            )}

            {viewMode === 'NEW' && (
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Ver Historial ({existingTests.length})
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-200">
          
          {/* VISTA 1: HISTORIAL DE ENSAYOS */}
          {viewMode === 'LIST' && (
            <div className="space-y-4">
              {existingTests.length === 0 ? (
                <div className="p-12 text-center bg-slate-950 rounded-xl border border-slate-800">
                  <Gauge className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-300">No hay protocolos de prueba hidráulica registrados para esta válvula.</p>
                  <p className="text-xs text-slate-500 mt-1">Haga clic en "Nuevo Ensayo" para ingresar las presiones de prueba.</p>
                  {can('PERFORM_HYDRO_TEST') && (
                    <button
                      type="button"
                      onClick={() => setViewMode('NEW')}
                      className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                    >
                      Registrar Primer Ensayo API 598
                    </button>
                  )}
                </div>
              ) : (
                existingTests.map(test => (
                  <div key={test.id} className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-850 gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm text-blue-400">{test.numero_protocolo}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {test.norma_aplicable}
                        </span>
                        <span className="text-xs text-slate-400">Fecha: {test.fecha_ensayo}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          test.resultado_general === 'APROBADO' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {test.resultado_general}
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          test.firma_ito 
                            ? 'bg-blue-500/20 text-blue-300' 
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {test.firma_ito ? '✓ Firmado por ITO' : 'Pendiente Firma ITO'}
                        </span>
                      </div>
                    </div>

                    {/* Resumen de Presiones */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Carcasa */}
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                        <span className="text-slate-400 font-medium">1. Shell Test (Carcasa)</span>
                        <div className="mt-1 flex items-baseline space-x-1.5">
                          <span className="text-lg font-bold font-mono text-white">{test.presion_carcasa_aplicada_bar} bar</span>
                          <span className="text-slate-500">/ {test.tiempo_carcasa_seg}s</span>
                        </div>
                        <div className="text-[11px] text-emerald-400 mt-1">✓ {test.resultado_carcasa}</div>
                      </div>

                      {/* Asiento HP */}
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                        <span className="text-slate-400 font-medium">2. High Pressure Closure</span>
                        <div className="mt-1 flex items-baseline space-x-1.5">
                          <span className="text-lg font-bold font-mono text-white">{test.presion_asiento_hp_aplicada_bar} bar</span>
                          <span className="text-slate-500">/ {test.tiempo_asiento_hp_seg}s</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1">Fuga: {test.fuga_medida_asiento}</div>
                      </div>

                      {/* Asiento LP */}
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                        <span className="text-slate-400 font-medium">3. Low Pressure Air Seat</span>
                        <div className="mt-1 flex items-baseline space-x-1.5">
                          <span className="text-lg font-bold font-mono text-white">{test.presion_asiento_lp_bar} bar</span>
                          <span className="text-slate-500">/ {test.fuga_medida_lp_burbujas_min} burb/min</span>
                        </div>
                        <div className="text-[11px] text-emerald-400 mt-1">✓ {test.resultado_asiento_lp}</div>
                      </div>
                    </div>

                    {/* Firmas y Metadatos */}
                    <div className="pt-2 border-t border-slate-850 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                      <div>
                        <span>Ejecutor: </span>
                        <strong className="text-slate-200">{test.inspector_ejecutor}</strong> • 
                        <span> Validador ITO: </span>
                        <strong className="text-slate-200">{test.inspector_ito_validador}</strong>
                      </div>
                      <div>
                        <span>Manómetro: </span>
                        <span className="font-mono text-slate-300">{test.manometro_id}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* VISTA 2: FORMULARIO DE REGISTRO DE NUEVO ENSAYO */}
          {viewMode === 'NEW' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-xl text-xs text-rose-300">
                  {errorMessage}
                </div>
              )}

              {/* Datos Generales del Ensayo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Número de Protocolo</label>
                  <input
                    type="text"
                    required
                    value={formData.numero_protocolo}
                    onChange={(e) => setFormData({ ...formData, numero_protocolo: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Norma Aplicable</label>
                  <select
                    value={formData.norma_aplicable}
                    onChange={(e) => {
                      const selected = e.target.value as TestStandard;
                      let updatedObs = formData.observaciones || '';
                      if (selected.startsWith('NCh')) {
                        updatedObs = `Ensayo validado según Norma Chilena ${selected} (Carcasa 1.5x PN, Asiento 1.1x PN).`;
                      }
                      setFormData({ ...formData, norma_aplicable: selected, observaciones: updatedObs });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    <optgroup label="Normas Chilenas Oficiales (NCh / INN)">
                      <option value="NCh 700">NCh 700 (Ensayos Hidrostáticos y Estanqueidad)</option>
                      <option value="NCh 1360">NCh 1360 (Pruebas de Presión y Hermeticidad)</option>
                      <option value="NCh 2087">NCh 2087 (Conducción a Presión y Accesorios)</option>
                      <option value="NCh 699">NCh 699 (Clasificación y Criterios Operacionales)</option>
                      <option value="NCh 2369">NCh 2369 (Diseño Sísmico e Instalación Industrial)</option>
                    </optgroup>
                    <optgroup label="Normas Internacionales">
                      <option value="API 598">API 598 (Valve Inspection & Testing Standard)</option>
                      <option value="ISO 5208">ISO 5208 (Industrial Valves - Pressure Testing)</option>
                      <option value="ASME B16.34">ASME B16.34 (Valves Flanged, Threaded & Welding)</option>
                      <option value="MSS-SP-61">MSS-SP-61 (Pressure Testing of Valves)</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Fecha de Ensayo</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_ensayo}
                    onChange={(e) => setFormData({ ...formData, fecha_ensayo: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              {/* Instrumentación */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Manómetro Patrón Calibrado</label>
                  <input
                    type="text"
                    required
                    value={formData.manometro_id}
                    onChange={(e) => setFormData({ ...formData, manometro_id: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Calibración Vigente Hasta</label>
                  <input
                    type="date"
                    required
                    value={formData.manometro_calibracion_vigente}
                    onChange={(e) => setFormData({ ...formData, manometro_calibracion_vigente: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Fluido de Prueba</label>
                  <input
                    type="text"
                    required
                    value={formData.fluido_prueba}
                    onChange={(e) => setFormData({ ...formData, fluido_prueba: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              {/* Banner Informativo Norma Chilena */}
              {formData.norma_aplicable?.startsWith('NCh') && (
                <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl flex items-start space-x-2 text-xs text-blue-200">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-blue-300">Criterio Técnico {formData.norma_aplicable}: </span>
                    {formData.norma_aplicable === 'NCh 700' && 'Ensayos de resistencia y estanqueidad para válvulas: Carcasa a 1.5x PN y Asiento a 1.1x PN. Estanqueidad grado A (gota cero) exigida para sellos de corte.'}
                    {formData.norma_aplicable === 'NCh 1360' && 'Ensayos de presión hidrostática en conducciones a presión: verificación de hermeticidad en banco y taller previo a montaje en terreno.'}
                    {formData.norma_aplicable === 'NCh 2087' && 'Conducción de fluidos a presión: estanqueidad de conjuntos bridados y válvulas operativas.'}
                    {formData.norma_aplicable === 'NCh 699' && 'Clasificación y pruebas de estanqueidad funcional de válvulas industriales.'}
                    {formData.norma_aplicable === 'NCh 2369' && 'Diseño sísmico de instalaciones industriales: anclajes, masa de actuador y soporte de válvulas pesadas.'}
                  </div>
                </div>
              )}

              {/* 1. Prueba de Carcasa */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>1. Prueba Hidrostática de Carcasa (Shell Test 1.5x)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Requerida: {formData.presion_carcasa_requerida_bar} bar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Presión Aplicada (bar)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.presion_carcasa_aplicada_bar}
                      onChange={(e) => setFormData({ ...formData, presion_carcasa_aplicada_bar: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Tiempo de Mantención (seg)</label>
                    <input
                      type="number"
                      required
                      value={formData.tiempo_carcasa_seg}
                      onChange={(e) => setFormData({ ...formData, tiempo_carcasa_seg: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Resultado Carcasa</label>
                    <select
                      value={formData.resultado_carcasa}
                      onChange={(e) => setFormData({ ...formData, resultado_carcasa: e.target.value as TestResult })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      <option value="APROBADO">Aprobado (Estanco)</option>
                      <option value="RECHAZADO">Rechazado (Fuga / Sudoración)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Prueba de Asiento Alta Presión */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>2. Prueba de Cierre / Asiento Alta Presión (1.1x)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Requerida: {formData.presion_asiento_hp_requerida_bar} bar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Presión Aplicada (bar)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.presion_asiento_hp_aplicada_bar}
                      onChange={(e) => setFormData({ ...formData, presion_asiento_hp_aplicada_bar: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Tiempo (seg)</label>
                    <input
                      type="number"
                      required
                      value={formData.tiempo_asiento_hp_seg}
                      onChange={(e) => setFormData({ ...formData, tiempo_asiento_hp_seg: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Fuga Medida</label>
                    <input
                      type="text"
                      required
                      value={formData.fuga_medida_asiento}
                      onChange={(e) => setFormData({ ...formData, fuga_medida_asiento: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Resultado Asiento</label>
                    <select
                      value={formData.resultado_asiento_hp}
                      onChange={(e) => setFormData({ ...formData, resultado_asiento_hp: e.target.value as TestResult })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      <option value="APROBADO">Aprobado</option>
                      <option value="RECHAZADO">Rechazado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Veredicto General y Firma */}
              <div className="p-4 bg-slate-850 border border-slate-750 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white uppercase">Veredicto General del Protocolo:</span>
                    <select
                      value={formData.resultado_general}
                      onChange={(e) => setFormData({ ...formData, resultado_general: e.target.value as TestResult })}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                    >
                      <option value="APROBADO">APROBADO (Apto para Liberación QA/QC)</option>
                      <option value="RECHAZADO">RECHAZADO (Pasa a No Conforme)</option>
                      <option value="EN_OBSERVACION">EN OBSERVACIÓN</option>
                    </select>
                  </div>

                  {can('SIGN_ITO_TEST') && (
                    <label className="flex items-center space-x-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.firma_ito}
                        onChange={(e) => setFormData({ ...formData, firma_ito: e.target.checked })}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0"
                      />
                      <span>Firma de Validación ITO ({user.nombre})</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Observaciones Técnicas del Inspector</label>
                  <textarea
                    rows={2}
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setViewMode('LIST')}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
                >
                  {saving ? 'Guardando...' : 'Guardar y Certificar Ensayo'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
