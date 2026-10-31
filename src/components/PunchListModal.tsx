/**
 * Módulo de Punch List y Gestión de Desviaciones Técnicas
 * Bloqueo de Liberación QA/QC para Items Críticos Tipo A
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Plus, 
  ShieldAlert, 
  UserCheck, 
  Calendar,
  AlertOctagon,
  Check
} from 'lucide-react';
import { ValveRecord, PunchItemRecord, DeviationSeverity, DeviationStatus } from '../types';
import { dbService } from '../services/storageService';
import { useAuth } from '../services/authContext';

interface PunchListModalProps {
  valve?: ValveRecord | null;
  onClose: () => void;
  onPunchUpdated: () => void;
}

export const PunchListModal: React.FC<PunchListModalProps> = ({
  valve,
  onClose,
  onPunchUpdated
}) => {
  const { user, can } = useAuth();
  
  // Si se pasa una válvula específica, filtramos por ella; sino mostramos todo el punch list del proyecto
  const allPunches = valve 
    ? dbService.getPunchItemsByValveId(valve.id)
    : dbService.getPunchItems();

  const [viewMode, setViewMode] = useState<'LIST' | 'NEW'>('LIST');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Formulario de nuevo item
  const [formData, setFormData] = useState<Partial<PunchItemRecord>>({
    valvula_id: valve?.id || '',
    tag: valve?.tag || '',
    ot: valve?.ot || '',
    codigo_item: `PL-${Math.floor(100 + Math.random() * 900)}`,
    tipo_desviacion: 'TIPO_A_CRITICO',
    categoria: 'Daño en Brida / Rayaduras',
    descripcion: '',
    accion_correctiva: '',
    responsable: 'Taller Central PGP',
    fecha_deteccion: new Date().toISOString().split('T')[0],
    fecha_limite: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    estado: 'ABIERTA'
  });

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtrado de Punch Items
  const filteredPunches = allPunches.filter(p => {
    const matchSev = filterSeverity === 'ALL' || p.tipo_desviacion === filterSeverity;
    const matchStat = filterStatus === 'ALL' || p.estado === filterStatus;
    return matchSev && matchStat;
  });

  const handleCreatePunch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaving(true);

    try {
      if (!formData.tag) throw new Error('El TAG de la válvula es obligatorio');
      if (!formData.descripcion) throw new Error('La descripción técnica de la desviación es obligatoria');
      if (!formData.accion_correctiva) throw new Error('La acción correctiva es obligatoria');

      // Buscar válvula si no fue provista directamente
      let targetValveId = formData.valvula_id;
      if (!targetValveId) {
        const found = dbService.getValveByTag(formData.tag);
        if (!found) throw new Error(`No se encontró ninguna válvula con el TAG "${formData.tag}"`);
        targetValveId = found.id;
      }

      dbService.savePunchItem({
        ...formData,
        valvula_id: targetValveId
      } as any, user.nombre, user.rol);

      onPunchUpdated();
      setViewMode('LIST');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error guardando item de Punch List');
    } finally {
      setSaving(false);
    }
  };

  const handleClosePunch = (item: PunchItemRecord) => {
    if (!can('CLOSE_PUNCH_ITEM')) {
      alert('Solo los roles con permisos de ITO o Revisor QA/QC pueden cerrar observaciones.');
      return;
    }

    try {
      dbService.savePunchItem({
        ...item,
        estado: 'CERRADA',
        fecha_cierre: new Date().toISOString().split('T')[0],
        verificado_por_ito: user.nombre
      }, user.nombre, user.rol);
      onPunchUpdated();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Cabecera */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Punch List & Control de Desviaciones</h3>
                {valve && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                    TAG: {valve.tag}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Gestión de no conformidades con clasificación de criticidad Tipo A (Crítico Bloqueante), B y C
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {can('MANAGE_PUNCH_LIST') && viewMode === 'LIST' && (
              <button
                type="button"
                onClick={() => setViewMode('NEW')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span>Levantar Desviación</span>
              </button>
            )}

            {viewMode === 'NEW' && (
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Ver Lista
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

        {/* Contenido */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-200">
          
          {/* VISTA 1: LISTA DE DESVIACIONES */}
          {viewMode === 'LIST' && (
            <div className="space-y-4">
              {/* Filtros */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Filtrar por Criticidad:</span>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  >
                    <option value="ALL">Todas las Criticidades</option>
                    <option value="TIPO_A_CRITICO">Tipo A (Crítico Bloqueante)</option>
                    <option value="TIPO_B_MAYOR">Tipo B (Mayor)</option>
                    <option value="TIPO_C_MENOR">Tipo C (Menor)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Estado:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  >
                    <option value="ALL">Todos los Estados</option>
                    <option value="ABIERTA">Abierta</option>
                    <option value="EN_CORRECCION">En Corrección</option>
                    <option value="VERIFICADA_ITO">Verificada ITO</option>
                    <option value="CERRADA">Cerrada</option>
                  </select>
                </div>
              </div>

              {filteredPunches.length === 0 ? (
                <div className="p-10 text-center bg-slate-950 rounded-xl border border-slate-800">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-200">No hay observaciones registradas en el Punch List</p>
                  <p className="text-xs text-slate-400 mt-1">La válvula o matriz se encuentra conforme con las especificaciones.</p>
                </div>
              ) : (
                filteredPunches.map(item => (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-xl border space-y-3 transition ${
                      item.estado === 'CERRADA' 
                        ? 'bg-slate-950/60 border-slate-800 opacity-80' 
                        : item.tipo_desviacion === 'TIPO_A_CRITICO'
                        ? 'bg-rose-950/20 border-rose-500/40 shadow-sm'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-850">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm text-amber-400">{item.codigo_item}</span>
                        <span className="font-mono text-xs text-slate-300 font-bold bg-slate-800 px-2 py-0.5 rounded">
                          TAG: {item.tag}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">({item.categoria})</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Badge Criticidad */}
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.tipo_desviacion === 'TIPO_A_CRITICO'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : item.tipo_desviacion === 'TIPO_B_MAYOR'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {item.tipo_desviacion === 'TIPO_A_CRITICO' ? 'Tipo A (Bloqueante)' :
                           item.tipo_desviacion === 'TIPO_B_MAYOR' ? 'Tipo B (Mayor)' : 'Tipo C (Menor)'}
                        </span>

                        {/* Badge Estado */}
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.estado === 'CERRADA'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : item.estado === 'EN_CORRECCION'
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {item.estado}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1.5">
                      <div>
                        <span className="text-slate-400 font-medium">Descripción de la Desviación: </span>
                        <span className="text-slate-200">{item.descripcion}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Acción Correctiva Requerida: </span>
                        <span className="text-amber-200">{item.accion_correctiva}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-850 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                      <div>
                        <span>Responsable: </span>
                        <strong className="text-slate-300">{item.responsable}</strong> • 
                        <span> Plazo límite: </span>
                        <span className="text-slate-300 font-mono">{item.fecha_limite}</span>
                      </div>

                      {item.estado !== 'CERRADA' && can('CLOSE_PUNCH_ITEM') && (
                        <button
                          type="button"
                          onClick={() => handleClosePunch(item)}
                          className="flex items-center space-x-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Verificar & Cerrar Item</span>
                        </button>
                      )}

                      {item.estado === 'CERRADA' && (
                        <span className="text-[11px] text-emerald-400 font-medium">
                          ✓ Cerrado por {item.verificado_por_ito} el {item.fecha_cierre}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* VISTA 2: FORMULARIO NUEVA DESVIACIÓN */}
          {viewMode === 'NEW' && (
            <form onSubmit={handleCreatePunch} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-xl text-xs text-rose-300">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">TAG de la Válvula</label>
                  <input
                    type="text"
                    required
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Criticidad / Tipo</label>
                  <select
                    value={formData.tipo_desviacion}
                    onChange={(e) => setFormData({ ...formData, tipo_desviacion: e.target.value as DeviationSeverity })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    <option value="TIPO_A_CRITICO">Tipo A (Crítico - Bloquea Liberación QA/QC)</option>
                    <option value="TIPO_B_MAYOR">Tipo B (Mayor - Requiere Corrección Taller)</option>
                    <option value="TIPO_C_MENOR">Tipo C (Menor / Cosmético)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    <option value="Daño en Brida / Rayaduras">Daño en Brida / Rayaduras</option>
                    <option value="Fuga en Empaquetadura">Fuga en Empaquetadura</option>
                    <option value="Fuga en Asiento">Fuga en Asiento</option>
                    <option value="Pintura y Recubrimiento">Pintura y Recubrimiento</option>
                    <option value="Torque / Pernos">Torque / Pernos</option>
                    <option value="Volante / Reductor">Volante / Reductor</option>
                    <option value="Falta MTR / Placa TAG">Falta MTR / Placa TAG</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Descripción Técnica de la No Conformidad</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalle la condición no conforme observada en la inspección..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Acción Correctiva Comprometida</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Procedimiento de reparación, mecanizado o ajuste requerido..."
                  value={formData.accion_correctiva}
                  onChange={(e) => setFormData({ ...formData, accion_correctiva: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Responsable de Ejecución</label>
                  <input
                    type="text"
                    required
                    value={formData.responsable}
                    onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Fecha Límite de Cierre</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_limite}
                    onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
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
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition"
                >
                  {saving ? 'Guardando...' : 'Registrar en Punch List'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
