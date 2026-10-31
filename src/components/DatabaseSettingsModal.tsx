/**
 * Módulo de Base de Datos Local & Respaldos Autónomos
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 * 100% Autónomo, Offline y Libre de Dependencias Externas (Sin Supabase)
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  Server, 
  ShieldCheck, 
  AlertTriangle,
  Code2,
  FolderSync,
  Upload,
  HardDrive,
  FileJson,
  CheckCircle2,
  Info
} from 'lucide-react';
import { dbService, DatabaseConfig } from '../services/storageService';
import { useAuth } from '../services/authContext';

export const DatabaseSettingsModal: React.FC = () => {
  const { user, can } = useAuth();
  const [config, setConfig] = useState<DatabaseConfig>(() => dbService.getDatabaseConfig());
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'SCHEMA_SQL' | 'DUMP_SQL' | 'DRIVE_BACKUP' | 'AUDIT'>('DRIVE_BACKUP');
  const [restoreMessage, setRestoreMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [storageQuota, setStorageQuota] = useState<{ usedMb: number; quotaMb: number; percent: number }>({ usedMb: 1.5, quotaMb: 2048, percent: 0.07 });

  useEffect(() => {
    dbService.getStorageEstimate().then(q => setStorageQuota(q));
  }, []);

  const fullSqlDump = dbService.generateFullSqlDump();
  const fullJsonBackup = dbService.exportFullJsonBackup();
  const auditLogs = dbService.getAuditLogs();
  const totalValves = dbService.getValves().length;
  const totalTests = dbService.getHydroTests().length;
  const totalPunches = dbService.getPunchItems().length;

  const handleCopySql = () => {
    navigator.clipboard.writeText(fullSqlDump);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([fullSqlDump], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PGP_2026_PostgreSQL_Dump_${new Date().toISOString().split('T')[0]}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([fullJsonBackup], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PGP_2026_Respaldo_Completo_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = dbService.importFullJsonBackup(content, user.nombre, user.rol);
      if (res.success) {
        setRestoreMessage({ type: 'success', text: `${res.message} Recargue la vista para ver los cambios.` });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setRestoreMessage({ type: 'error', text: res.message });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetFactory = () => {
    if (!window.confirm('¿Está seguro de reiniciar los datos a la muestra oficial PGP 2026? Se preservará la estructura pero se reiniciarán los registros.')) {
      return;
    }
    dbService.resetToFactorySampleData(user.nombre, user.rol);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Banner de Estado del Motor de Persistencia Local */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <HardDrive className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Motor Local Autónomo (Offline-First)
              </span>
              <span className="text-xs text-slate-400">100% Privado • Sin Supabase • Sin Dependencias de Terceros</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Gestor de Base de Datos Local & Sincronización</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Almacenamiento persistente de alta velocidad con integridad referencial, respaldo integral descargable en JSON para Google Drive / OneDrive y exportación DDL/DML estándar para servidores PostgreSQL o SQLite.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadJson}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition"
              title="Descargar snapshot completo con todas las tablas"
            >
              <FileJson className="w-4 h-4" />
              <span>Respaldo JSON Completo</span>
            </button>

            <button
              onClick={handleDownloadSql}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="Descargar script SQL para cualquier servidor PostgreSQL local"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Dump SQL</span>
            </button>

            {can('MANAGE_DATABASE_SQL') && (
              <button
                onClick={handleResetFactory}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-medium border border-slate-700 transition"
                title="Restaurar registros semilla originales PGP 2026"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Restaurar Muestra</span>
              </button>
            )}
          </div>
        </div>

        {/* Métricas rápidas de la base de datos local */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Total Válvulas:</span>
            <div className="text-base font-bold text-white font-mono">{totalValves}</div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Protocolos Ensayo:</span>
            <div className="text-base font-bold text-blue-400 font-mono">{totalTests}</div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Items Punch List:</span>
            <div className="text-base font-bold text-amber-400 font-mono">{totalPunches}</div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Auditorías Registradas:</span>
            <div className="text-base font-bold text-emerald-400 font-mono">{auditLogs.length}</div>
          </div>
        </div>

        {/* Medidor de Cuota IndexedDB */}
        <div className="mt-3 p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-1">
          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>Uso de Disco Local (IndexedDB & LocalStorage):</span>
            <span className="font-mono text-slate-200">
              {storageQuota.usedMb} MB utilizados / {storageQuota.quotaMb} MB disponibles ({storageQuota.percent}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(storageQuota.percent, 0.5)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-wrap gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('DRIVE_BACKUP')}
          className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
            activeTab === 'DRIVE_BACKUP' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderSync className="w-3.5 h-3.5" />
          <span>Sincronización Local & Google Drive</span>
        </button>
        <button
          onClick={() => setActiveTab('SCHEMA_SQL')}
          className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
            activeTab === 'SCHEMA_SQL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Esquema DDL & Tablas</span>
        </button>
        <button
          onClick={() => setActiveTab('DUMP_SQL')}
          className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
            activeTab === 'DUMP_SQL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Dump SQL para Servidor On-Premise</span>
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
            activeTab === 'AUDIT' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Trazabilidad & Auditoría ({auditLogs.length})</span>
        </button>
      </div>

      {/* CONTENIDO TAB: SINCRONIZACIÓN LOCAL Y GOOGLE DRIVE */}
      {activeTab === 'DRIVE_BACKUP' && (
        <div className="space-y-4">
          {restoreMessage && (
            <div className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${
              restoreMessage.type === 'success' 
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' 
                : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}>
              {restoreMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{restoreMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Panel Izquierdo: Generar y Restaurar Copias */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <FileJson className="w-4 h-4 text-blue-400" />
                  <span>Respaldo y Restauración Rápida</span>
                </h3>
                <p className="text-slate-400 mt-1">
                  Guarde copias instantáneas con todas las válvulas, ensayos, punch lists y auditoría en su equipo o carpeta de red.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <span className="font-semibold text-slate-200">1. Descargar Respaldo Actual</span>
                  <p className="text-[11px] text-slate-400">
                    Genera un archivo JSON consolidado con el estado completo de la base de datos local.
                  </p>
                  <button
                    onClick={handleDownloadJson}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Respaldo JSON ({totalValves} Válvulas)</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <span className="font-semibold text-slate-200">2. Restaurar desde Archivo JSON</span>
                  <p className="text-[11px] text-slate-400">
                    Cargue una copia de seguridad previamente guardada (útil para migrar entre computadores o recuperar datos).
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleFileRestore}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold"
                  >
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Seleccionar Archivo JSON para Restaurar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Panel Derecho: Estrategia de Trabajo Local con Google Drive */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <FolderSync className="w-4 h-4 text-emerald-400" />
                  <span>Flujo de Trabajo Recomendado con Google Drive</span>
                </h3>
                <p className="text-slate-400 mt-1">
                  Máxima seguridad, costo cero y sin riesgo de corte por inactividad de servidores en la nube.
                </p>
              </div>

              <div className="space-y-2.5 text-slate-300">
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                  <p>
                    <strong>Instale Google Drive para Computadoras:</strong> Le asignará una unidad local (ej: <code className="text-amber-300 font-mono">G:\Mi unidad\</code> o <code className="text-amber-300 font-mono">C:\Users\...\Google Drive\</code>).
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                  <p>
                    <strong>Cree una carpeta de proyecto:</strong> Ejemplo: <code className="text-slate-200 font-mono">PGP_2026_Control_Calidad/</code>.
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                  <p>
                    <strong>Guarde aquí sus Excel y Respaldos JSON:</strong> Al descargar el respaldo JSON o los archivos Excel modificados, guárdelos en esa carpeta. Google Drive sincronizará los cambios automáticamente en segundo plano.
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-[10px]">4</span>
                  <p>
                    <strong>Acceso en Taller y Oficina:</strong> Cualquier miembro del equipo que tenga acceso a la carpeta compartida en Drive puede cargar la última copia o ver los certificados generados.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-lg text-blue-300 text-[11px] flex items-start space-x-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                <span>
                  <strong>Ventaja sobre Supabase:</strong> No hay cobros ocultos, los datos nunca están expuestos en servidores extranjeros de terceros y no sufre pausas tras 7 días de inactividad durante recesos de planta.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO TAB: ESQUEMA DDL */}
      {activeTab === 'SCHEMA_SQL' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Estructura Relacional Estándar (pgp_valvulas_schema.sql)</h3>
              <p className="text-xs text-slate-400">7 tablas relacionales con restricciones de unicidad e integridad referencial</p>
            </div>
            <button
              onClick={handleCopySql}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado al Portapapeles' : 'Copiar SQL'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="font-bold text-purple-400 font-mono">valvulas</span>
              <p className="text-[11px] text-slate-400 mt-1">Maestro técnico con 26 campos, índice único en TAG y OT.</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="font-bold text-blue-400 font-mono">pruebas_hidraulicas</span>
              <p className="text-[11px] text-slate-400 mt-1">Protocolos API 598, presiones de carcasa y asiento, manómetros.</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="font-bold text-amber-400 font-mono">punch_list</span>
              <p className="text-[11px] text-slate-400 mt-1">No conformidades con criticidad A/B/C y bloqueo de liberación.</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="font-bold text-emerald-400 font-mono">adjuntos</span>
              <p className="text-[11px] text-slate-400 mt-1">Metadata de archivos, MTRs y hashes de integridad SHA-256.</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="font-bold text-slate-300 font-mono">usuarios</span>
              <p className="text-[11px] text-slate-400 mt-1">Control de acceso RBAC con 5 roles técnicos predefinidos.</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="font-bold text-slate-300 font-mono">auditoria_cambios</span>
              <p className="text-[11px] text-slate-400 mt-1">Registro inmutable de cada transacción e inserción.</p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-[40vh] font-mono text-xs text-slate-300">
            <pre>{fullSqlDump.slice(0, 2500) + '\n\n-- [... Continuación en descarga de dump completo ...]'}</pre>
          </div>
        </div>
      )}

      {/* CONTENIDO TAB: DUMP SQL */}
      {activeTab === 'DUMP_SQL' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Respaldo y Volcado SQL Estándar</h3>
              <p className="text-xs text-slate-400">Sentencias INSERT con ON CONFLICT DO UPDATE listas para replicar en PostgreSQL local</p>
            </div>
            <button
              onClick={handleDownloadSql}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .sql</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-[50vh] font-mono text-xs text-slate-300">
            <pre>{fullSqlDump}</pre>
          </div>
        </div>
      )}

      {/* CONTENIDO TAB: AUDITORÍA */}
      {activeTab === 'AUDIT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Historial Inmutable de Auditoría</h3>
            <p className="text-xs text-slate-400">Registro cronológico de todas las modificaciones y transacciones</p>
          </div>

          <div className="divide-y divide-slate-800 max-h-[50vh] overflow-y-auto">
            {auditLogs.map(a => (
              <div key={a.id} className="py-2.5 flex items-start justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-purple-400">{a.accion}</span>
                    <span className="text-slate-300 font-semibold">{a.entidad}</span>
                    <span className="text-blue-400 font-mono font-bold">{a.tag}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Operador: <strong className="text-slate-300">{a.usuario}</strong> ({a.rol})
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-2xl">{typeof a.cambios === 'string' ? a.cambios : JSON.stringify(a.cambios)}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(a.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
