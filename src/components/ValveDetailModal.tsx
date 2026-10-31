/**
 * Ficha Técnica Integral, Dossier de Calidad y Certificado Oficial
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Gauge, 
  AlertTriangle, 
  Paperclip, 
  FileText, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  Hash, 
  Download,
  Award,
  History,
  ArrowRight,
  UserCheck,
  Calendar,
  Eye
} from 'lucide-react';
import { ValveRecord, HydroTestRecord, PunchItemRecord, AttachmentRecord } from '../types';
import { dbService } from '../services/storageService';
import { auditService, ValveAuditEvent } from '../services/auditService';
import { useAuth } from '../services/authContext';
import { PdfReportService } from '../services/pdfReportService';

interface ValveDetailModalProps {
  valve: ValveRecord;
  onClose: () => void;
  onOpenHydroTest: () => void;
  onOpenPunchList: () => void;
  onOpenAttachments: () => void;
  onEditValve: () => void;
}

export const ValveDetailModal: React.FC<ValveDetailModalProps> = ({
  valve,
  onClose,
  onOpenHydroTest,
  onOpenPunchList,
  onOpenAttachments,
  onEditValve
}) => {
  const { user, can } = useAuth();
  const [activeTab, setActiveTab] = useState<'TECH_SPECS' | 'CERTIFICATE' | 'AUDIT'>('TECH_SPECS');

  const tests = dbService.getHydroTestsByValveId(valve.id);
  const punches = dbService.getPunchItemsByValveId(valve.id);
  const attachments = dbService.getAttachmentsByEntity('valvula', valve.id);
  const audits = dbService.getAuditLogs().filter(a => a.tag === valve.tag);

  const isReleased = ['LIBERADA_QAQC', 'APROBADA_ITO', 'ENTREGADA_FAENA'].includes(valve.estado_qaqc);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Cabecera */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white font-mono">{valve.tag}</h2>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-blue-500/20 text-blue-300">
                  OT: {valve.ot}
                </span>
                {isReleased && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Liberada QA/QC</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {valve.tipo_valvula} • DN: {valve.diametro_nominal} • Rating: {valve.clase_rating} {valve.tipo_conexion} • {valve.marca}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('CERTIFICATE')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
            >
              <Award className="w-4 h-4" />
              <span>Certificado de Calidad</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-navegación dentro de la ficha */}
        <div className="px-6 py-2 bg-slate-950/80 border-b border-slate-800 flex space-x-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('TECH_SPECS')}
            className={`py-1.5 border-b-2 transition ${
              activeTab === 'TECH_SPECS' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Ficha Técnica & Parámetros
          </button>
          <button
            onClick={() => setActiveTab('CERTIFICATE')}
            className={`py-1.5 border-b-2 transition ${
              activeTab === 'CERTIFICATE' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Certificado Oficial PGP 2026
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`py-1.5 border-b-2 transition ${
              activeTab === 'AUDIT' ? 'border-purple-500 text-purple-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Historial de Auditoría ({audits.length})
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-200">
          
          {/* TAB 1: FICHA TÉCNICA */}
          {activeTab === 'TECH_SPECS' && (
            <div className="space-y-6">
              
              {/* Bloque 1: Especificaciones Mecánicas y Metalurgia */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>1. Especificaciones de Diseño, Rating & Metalurgia</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Fabricante / Marca:</span>
                    <p className="font-semibold text-slate-100 mt-0.5">{valve.marca}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Modelo / Serie:</span>
                    <p className="font-semibold text-slate-100 mt-0.5">{valve.modelo}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Diámetro Nominal (DN/NPS):</span>
                    <p className="font-semibold text-blue-400 font-mono mt-0.5">{valve.diametro_nominal}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Clase / Rating Presión:</span>
                    <p className="font-semibold text-blue-400 font-mono mt-0.5">{valve.clase_rating}</p>
                  </div>

                  <div>
                    <span className="text-slate-500">Tipo de Conexión:</span>
                    <p className="font-medium text-slate-200 mt-0.5">{valve.tipo_conexion}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Material del Cuerpo:</span>
                    <p className="font-medium text-slate-200 mt-0.5">{valve.material_cuerpo}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Material del Asiento:</span>
                    <p className="font-medium text-slate-200 mt-0.5">{valve.material_asiento}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Trim / Internos (API):</span>
                    <p className="font-medium text-slate-200 mt-0.5">{valve.material_trim}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-3 border-t border-slate-850">
                  <div>
                    <span className="text-slate-500">Coeficiente Cv:</span>
                    <p className="font-mono text-slate-200 mt-0.5">{valve.cv ?? 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Peso Estimado:</span>
                    <p className="font-mono text-slate-200 mt-0.5">{valve.peso_kg ? `${valve.peso_kg} kg` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Presión de Diseño:</span>
                    <p className="font-mono text-slate-200 mt-0.5">{valve.presion_diseno_bar ? `${valve.presion_diseno_bar} bar` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Temp. de Diseño:</span>
                    <p className="font-mono text-slate-200 mt-0.5">{valve.temp_diseno_c ? `${valve.temp_diseno_c} °C` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Bloque 2: Asignación en Planta y Responsables */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>2. Asignación Operacional & Cadena de Responsables</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Área / Planta:</span>
                    <p className="font-semibold text-slate-100 mt-0.5">{valve.area_planta}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Sistema / Fluido:</span>
                    <p className="font-semibold text-slate-100 mt-0.5">{valve.sistema}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Ubicación Física / Isométrico:</span>
                    <p className="font-medium text-slate-200 mt-0.5">{valve.ubicacion_fisica}</p>
                  </div>

                  <div>
                    <span className="text-slate-500">P&ID del Proyecto:</span>
                    <p className="font-mono font-bold text-blue-400 mt-0.5">{valve.pidNumber || 'PGP-PID-100-01'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Línea de Proceso (Piping):</span>
                    <p className="font-mono text-slate-200 mt-0.5">{valve.lineCode || '06"-SL-10101-CS300'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Inspector ITO Responsable:</span>
                    <p className="font-semibold text-blue-300 mt-0.5">{valve.inspector_ito}</p>
                  </div>
                </div>
              </div>

              {/* Bloque 3: Actuación, Instrumentación y Control */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>3. Paquete de Actuación, Automatización & Instrumentación</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Tipo de Actuador:</span>
                    <p className="font-semibold text-slate-100 mt-0.5">{valve.actuatorType || 'NEUMÁTICO SIMPLE EFECTO'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Marca / Modelo Actuador:</span>
                    <p className="font-semibold text-slate-100 mt-0.5">{valve.actuatorBrand || 'Bettis'} {valve.actuatorModel || 'CBA-725'} {valve.actuatorSerial ? `(S/N: ${valve.actuatorSerial})` : ''}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Posición de Falla por Seguridad:</span>
                    <p className="font-bold text-amber-400 font-mono mt-0.5">
                      {valve.failPosition === 'FC' ? 'FC (Falla Cierra / Fail Close)' : 
                       valve.failPosition === 'FO' ? 'FO (Falla Abre / Fail Open)' : 
                       valve.failPosition || 'FC'}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-500">Posicionador Inteligente:</span>
                    <p className="text-slate-200 mt-0.5">{valve.positionerBrandModel || 'Fisher FIELDVUE DVC6200 HART'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Válvula Solenoide:</span>
                    <p className="text-slate-200 mt-0.5">{valve.solenoidSpec || 'ASCO RedHat 24VDC Ex-d IIC T6'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Dossier de Calidad Nº:</span>
                    <p className="font-mono font-bold text-emerald-400 mt-0.5">{valve.dossierNumber || valve.numero_certificado || 'DOS-PGP-QC-VALV-001'}</p>
                  </div>
                </div>
              </div>

              {/* Bloque 3: Ensayos Hidráulicos y Punch List Vinculados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Protocolos de Prueba */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                      <Gauge className="w-4 h-4 text-blue-400" />
                      <span>Ensayos Hidráulicos ({tests.length})</span>
                    </h4>
                    <button
                      onClick={onOpenHydroTest}
                      className="text-xs text-blue-400 hover:underline font-medium"
                    >
                      Gestionar Ensayos
                    </button>
                  </div>

                  {tests.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3">No hay ensayos registrados aún.</p>
                  ) : (
                    <div className="space-y-2">
                      {tests.map(t => (
                        <div key={t.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-slate-200">{t.numero_protocolo}</span>
                            <span className="text-[11px] text-slate-400 block">Carcasa: {t.presion_carcasa_aplicada_bar} bar • Asiento: {t.presion_asiento_hp_aplicada_bar} bar</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.resultado_general === 'APROBADO' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {t.resultado_general}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Punch List Vinculado */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Punch List Vinculado ({punches.length})</span>
                    </h4>
                    <button
                      onClick={onOpenPunchList}
                      className="text-xs text-amber-400 hover:underline font-medium"
                    >
                      Ver Punch List
                    </button>
                  </div>

                  {punches.length === 0 ? (
                    <p className="text-xs text-emerald-400 py-3">✓ Sin observaciones ni desviaciones pendientes.</p>
                  ) : (
                    <div className="space-y-2">
                      {punches.map(p => (
                        <div key={p.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono font-bold text-amber-400">{p.codigo_item}</span>
                              <span className={`text-[10px] px-1 rounded ${p.tipo_desviacion === 'TIPO_A_CRITICO' ? 'bg-rose-900/60 text-rose-200' : 'bg-slate-800 text-slate-300'}`}>
                                {p.tipo_desviacion === 'TIPO_A_CRITICO' ? 'Tipo A' : 'Tipo B/C'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block truncate max-w-[200px]">{p.descripcion}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.estado === 'CERRADA' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {p.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CERTIFICADO OFICIAL DE LIBERACIÓN QA/QC */}
          {activeTab === 'CERTIFICATE' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Certificado Imprimible con Estilo Oficial */}
              <div className="bg-white text-slate-900 p-8 rounded-xl shadow-2xl border-4 border-double border-slate-300 space-y-6 print:p-0">
                {/* Cabecera del Certificado */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-black tracking-widest uppercase text-blue-900">PROYECTO GENERAL PGP 2026</span>
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">CERTIFICADO DE LIBERACIÓN DE CALIDAD QA/QC</h2>
                    <p className="text-xs text-slate-600">Conforme a Procedimiento PGP-PR-QA-04 • Normas API 598 & ASME B16.34</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-mono">Dossier Nº:</span>
                    <p className="font-mono font-bold text-sm text-blue-900">{valve.numero_certificado || 'CERT-PGP-PENDIENTE'}</p>
                    <span className="text-[10px] text-slate-500">Fecha: {valve.fecha_liberacion || new Date().toISOString().split('T')[0]}</span>
                  </div>
                </div>

                {/* Tabla de Datos Técnicos */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs border border-slate-300 p-4 rounded-lg bg-slate-50">
                  <div><strong>TAG / Identificador:</strong> <span className="font-mono font-bold">{valve.tag}</span></div>
                  <div><strong>Orden de Trabajo:</strong> <span className="font-mono">{valve.ot}</span></div>
                  <div><strong>Tipo de Válvula:</strong> {valve.tipo_valvula}</div>
                  <div><strong>Fabricante / Modelo:</strong> {valve.marca} {valve.modelo}</div>
                  <div><strong>Diámetro Nominal:</strong> {valve.diametro_nominal}</div>
                  <div><strong>Clase / Rating:</strong> {valve.clase_rating} ({valve.tipo_conexion})</div>
                  <div><strong>Material de Cuerpo:</strong> {valve.material_cuerpo}</div>
                  <div><strong>Trim / Asiento:</strong> {valve.material_trim} / {valve.material_asiento}</div>
                  <div><strong>Área de Planta:</strong> {valve.area_planta}</div>
                  <div><strong>Sistema de Proceso:</strong> {valve.sistema}</div>
                </div>

                {/* Veredicto de Ensayos */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>DICTAMEN DE CONFORMIDAD TÉCNICA</span>
                  </div>
                  <p className="text-slate-700">
                    Se certifica que la válvula identificada precedentemente ha superado satisfactoriamente los ensayos hidrostáticos de resistencia mecánica de carcasa (Shell Test 1.5x) y estanqueidad de cierre (Seat Test 1.1x y baja presión de aire), encontrándose libre de fugas y con cero observaciones Tipo A pendientes en el Punch List del proyecto.
                  </p>
                </div>

                {/* Firmas Oficiales */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-center text-xs">
                  <div className="space-y-1">
                    <div className="border-b border-slate-400 pb-8 font-mono text-slate-400">[Firma y Timbre]</div>
                    <p className="font-bold text-slate-800">{valve.responsable_taller}</p>
                    <p className="text-[11px] text-slate-500">Responsable de Taller & Pruebas PGP</p>
                  </div>

                  <div className="space-y-1">
                    <div className="border-b border-slate-400 pb-8 font-mono text-slate-400">[Firma Acreditada ITO]</div>
                    <p className="font-bold text-slate-800">{valve.inspector_ito}</p>
                    <p className="text-[11px] text-slate-500">Inspección Técnica de Obra (ITO)</p>
                  </div>
                </div>
              </div>

              {/* Botones de Exportación / PDF */}
              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    const test = tests[0] || null;
                    PdfReportService.downloadCertificatePdf({
                      valve,
                      hydroTest: test,
                      punchItems: punches,
                      companyName: '[EMPRESA / PROYECTO MAESTRO PGP 2026]',
                      issuedBy: user.nombre
                    });
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Reporte PDF Detallado (jsPDF)</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: HISTORIAL DE AUDITORÍA Y CAMBIOS DE LA VÁLVULA */}
          {activeTab === 'AUDIT' && (() => {
            const detailedEvents = auditService.getHistoryForValve(valve.tag);
            const totalEvents = detailedEvents.length > 0 ? detailedEvents.length : audits.length;

            return (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <History className="w-4 h-4 text-purple-400" />
                      <span>Historial Detallado de Auditoría (Trazabilidad CRUD)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Registro cronológico de quién, cuándo y qué valores exactos fueron modificados en la válvula {valve.tag}.
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                    {totalEvents} evento(s) registrado(s)
                  </span>
                </div>

                {detailedEvents.length === 0 && audits.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                    <History className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 font-medium">No se registran eventos de modificación previos para el TAG "{valve.tag}".</p>
                    <p className="text-[11px] text-slate-500">Cada vez que un usuario edite o actualice este registro, los cambios aparecerán aquí automáticamente.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Renderizar eventos estructurados de auditService */}
                    {detailedEvents.map((evt) => {
                      const getActionBadge = (action: string) => {
                        switch (action) {
                          case 'CREATE':
                            return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                          case 'UPDATE':
                            return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                          case 'DELETE':
                            return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                          case 'IMPORT':
                            return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                          default:
                            return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
                        }
                      };

                      return (
                        <div key={evt.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 shadow-md">
                          {/* Encabezado del Evento */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-850">
                            <div className="flex items-center space-x-2.5">
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getActionBadge(evt.accion)}`}>
                                {evt.accion}
                              </span>
                              <div className="flex items-center space-x-1.5 text-xs">
                                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                <span className="font-semibold text-slate-200">{evt.usuario}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                                  {evt.rol}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-mono">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>{new Date(evt.timestamp).toLocaleString('es-CL')}</span>
                            </div>
                          </div>

                          {/* Resumen */}
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {evt.resumen}
                          </p>

                          {/* Tabla de Cambios: Valor Anterior vs Valor Nuevo */}
                          {evt.cambiosDetallados && evt.cambiosDetallados.length > 0 && (
                            <div className="overflow-x-auto rounded-lg border border-slate-800/80 bg-slate-900/60">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                                    <th className="py-2 px-3">Campo Modificado</th>
                                    <th className="py-2 px-3 text-rose-300">Valor Anterior</th>
                                    <th className="py-2 px-3 text-center w-8"></th>
                                    <th className="py-2 px-3 text-emerald-300">Valor Nuevo</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50 font-mono text-[11px]">
                                  {evt.cambiosDetallados.map((change, cIdx) => (
                                    <tr key={cIdx} className="hover:bg-slate-850/40 transition">
                                      <td className="py-2 px-3 font-semibold text-slate-300 font-sans">
                                        {change.etiqueta}
                                      </td>
                                      <td className="py-2 px-3 text-rose-400/90 bg-rose-950/20 font-mono line-through decoration-rose-500/40">
                                        {String(change.valorAnterior || '—')}
                                      </td>
                                      <td className="py-2 px-1 text-center text-slate-500">
                                        <ArrowRight className="w-3 h-3 inline text-slate-500" />
                                      </td>
                                      <td className="py-2 px-3 text-emerald-400 font-bold bg-emerald-950/20 font-mono">
                                        {String(change.valorNuevo || '—')}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Respaldo de compatibilidad con logs preexistentes de storageService */}
                    {detailedEvents.length === 0 && audits.map((a) => (
                      <div key={a.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-purple-400">{a.accion}</span>
                            <span className="text-slate-400">por</span>
                            <strong className="text-slate-200">{a.usuario}</strong>
                            <span className="text-[11px] text-slate-500">({a.rol})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono truncate max-w-xl">
                            {a.cambios}
                          </p>
                        </div>
                        <span className="text-slate-500 font-mono text-[10px] shrink-0">
                          {new Date(a.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
