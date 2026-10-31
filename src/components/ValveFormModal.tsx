/**
 * Formulario de Creación y Edición de Válvulas
 * Validación Técnica y Control de Duplicados
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 */

import React, { useState } from 'react';
import { 
  XCircle, 
  Layers, 
  Save, 
  AlertTriangle 
} from 'lucide-react';
import { 
  ValveRecord, 
  ValveType, 
  ValveRating, 
  EndConnection, 
  QAQCStatus 
} from '../types';
import { dbService } from '../services/storageService';
import { useAuth } from '../services/authContext';

interface ValveFormModalProps {
  initialValve?: ValveRecord | null;
  onClose: () => void;
  onSaved: () => void;
}

export const ValveFormModal: React.FC<ValveFormModalProps> = ({
  initialValve,
  onClose,
  onSaved
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState<Partial<ValveRecord>>(
    initialValve || {
      tag: '',
      ot: 'OT-2026-',
      tipo_valvula: 'Bola',
      marca: 'Flowserve',
      modelo: 'Worcester Series 51',
      diametro_nominal: '4"',
      clase_rating: '300#',
      tipo_conexion: 'RF (Raised Face)',
      material_cuerpo: 'ASTM A216 WCB',
      material_asiento: 'RPTFE',
      material_trim: 'API Trim 12 (316SS)',
      cv: 1200,
      peso_kg: 45.0,
      presion_diseno_bar: 51.0,
      temp_diseno_c: 120.0,
      area_planta: 'Área 100 - Chancado y Molienda',
      sistema: 'Agua de Proceso / Recuperada',
      ubicacion_fisica: 'Línea Impulsión Principal',
      estado_qaqc: 'RECEPCION',
      inspector_ito: 'Ing. Carlos Mendoza (ITO)',
      responsable_taller: 'Marco Antonio Rojas (Líder Taller)',
      fecha_recepcion: new Date().toISOString().split('T')[0],
      observaciones: ''
    }
  );

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaving(true);

    try {
      if (!formData.tag?.trim()) throw new Error('El TAG de la válvula es obligatorio.');
      if (!formData.ot?.trim()) throw new Error('La Orden de Trabajo (O/T) es obligatoria.');

      dbService.saveValve(formData as any, user.nombre, user.rol);
      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error guardando datos de la válvula');
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
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialValve ? `Editar Válvula: ${initialValve.tag}` : 'Registrar Nueva Válvula en Matriz PGP'}
              </h3>
              <p className="text-xs text-slate-400">
                Los datos se validarán y persistirán en la base de datos oficial.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 text-slate-200 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Bloque 1: Identificación y Clasificación */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
              1. Identificación y Clasificación de Activo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  TAG / Código Identificador <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. 100-XV-101A"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono font-bold text-white uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Orden de Trabajo (O/T) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. OT-2026-0412"
                  value={formData.ot}
                  onChange={(e) => setFormData({ ...formData, ot: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Válvula</label>
                <select
                  value={formData.tipo_valvula}
                  onChange={(e) => setFormData({ ...formData, tipo_valvula: e.target.value as ValveType })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="Compuerta">Compuerta (Gate)</option>
                  <option value="Globo">Globo (Globe)</option>
                  <option value="Bola">Bola (Ball)</option>
                  <option value="Retencion">Retención (Check)</option>
                  <option value="Mariposa">Mariposa (Butterfly)</option>
                  <option value="Seguridad_PSV">Seguridad (PSV / Relief)</option>
                  <option value="Macho_Plug">Macho (Plug)</option>
                  <option value="Diafragma">Diafragma</option>
                  <option value="Aguja">Aguja</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Fabricante / Marca</label>
                <input
                  type="text"
                  required
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Modelo / Serie</label>
                <input
                  type="text"
                  required
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Bloque 2: Dimensiones, Rating y Metalurgia */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
              2. Dimensiones, Rating ASME y Metalurgia
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Diámetro Nominal (DN/NPS)</label>
                <input
                  type="text"
                  required
                  placeholder='ej. 4" o DN100'
                  value={formData.diametro_nominal}
                  onChange={(e) => setFormData({ ...formData, diametro_nominal: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Clase / Rating</label>
                <select
                  value={formData.clase_rating}
                  onChange={(e) => setFormData({ ...formData, clase_rating: e.target.value as ValveRating })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white"
                >
                  <option value="150#">150#</option>
                  <option value="300#">300#</option>
                  <option value="600#">600#</option>
                  <option value="900#">900#</option>
                  <option value="1500#">1500#</option>
                  <option value="2500#">2500#</option>
                  <option value="PN16">PN16</option>
                  <option value="PN25">PN25</option>
                  <option value="PN40">PN40</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Conexión Extremos</label>
                <select
                  value={formData.tipo_conexion}
                  onChange={(e) => setFormData({ ...formData, tipo_conexion: e.target.value as EndConnection })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="RF (Raised Face)">RF (Raised Face)</option>
                  <option value="RTJ (Ring Type Joint)">RTJ (Ring Type Joint)</option>
                  <option value="BW (Butt Weld)">BW (Butt Weld)</option>
                  <option value="SW (Socket Weld)">SW (Socket Weld)</option>
                  <option value="NPT">NPT</option>
                  <option value="Wafer">Wafer</option>
                  <option value="Lug">Lug</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Material del Cuerpo</label>
                <input
                  type="text"
                  required
                  placeholder="ej. ASTM A216 WCB"
                  value={formData.material_cuerpo}
                  onChange={(e) => setFormData({ ...formData, material_cuerpo: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Material del Asiento</label>
                <input
                  type="text"
                  required
                  placeholder="ej. RPTFE / Stellite Gr.6"
                  value={formData.material_asiento}
                  onChange={(e) => setFormData({ ...formData, material_asiento: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Trim / Internos (API)</label>
                <input
                  type="text"
                  required
                  placeholder="ej. API Trim 8 / Trim 12"
                  value={formData.material_trim}
                  onChange={(e) => setFormData({ ...formData, material_trim: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Bloque 3: Ubicación y Proceso */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
              3. Ubicación en Planta y Proceso Operacional
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Área / Planta</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Área 100 - Chancado"
                  value={formData.area_planta}
                  onChange={(e) => setFormData({ ...formData, area_planta: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Sistema / Fluido</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Agua Recuperada"
                  value={formData.sistema}
                  onChange={(e) => setFormData({ ...formData, sistema: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Ubicación Física</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Línea Eje C-4"
                  value={formData.ubicacion_fisica}
                  onChange={(e) => setFormData({ ...formData, ubicacion_fisica: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Bloque 4: Estado QA/QC y Responsables */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
              4. Control QA/QC & Responsables
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Estado QA/QC</label>
                <select
                  value={formData.estado_qaqc}
                  onChange={(e) => setFormData({ ...formData, estado_qaqc: e.target.value as QAQCStatus })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="RECEPCION">Recepción Taller</option>
                  <option value="PRUEBA_PENDIENTE">Prueba Pendiente</option>
                  <option value="EN_PRUEBAS">En Pruebas</option>
                  <option value="PUNCH_LIST_ABIERTO">Punch List Abierto</option>
                  <option value="LIBERADA_QAQC">Liberada QA/QC</option>
                  <option value="APROBADA_ITO">Aprobada ITO</option>
                  <option value="ENTREGADA_FAENA">Entregada Faena</option>
                  <option value="NO_CONFORME">No Conforme</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Inspector ITO</label>
                <input
                  type="text"
                  required
                  value={formData.inspector_ito}
                  onChange={(e) => setFormData({ ...formData, inspector_ito: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Responsable de Taller</label>
                <input
                  type="text"
                  required
                  value={formData.responsable_taller}
                  onChange={(e) => setFormData({ ...formData, responsable_taller: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Observaciones Técnicas</label>
              <textarea
                rows={2}
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Válvula'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
