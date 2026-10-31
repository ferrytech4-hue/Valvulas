/**
 * Panel de Sincronización y Respaldos en la Nube con Google Drive & Archivos Locales
 * Sistema de Control de Calidad PGP 2026 - Versión 1.0.0
 * 
 * Conexión segura OAuth 2.0 con alcance mínimo: https://www.googleapis.com/auth/drive.file
 * Soporte autónomo para crear y restaurar archivos locales (.json) en el computador.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, 
  UploadCloud, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FolderCheck, 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  HardDrive, 
  Clock, 
  FileJson,
  Upload
} from 'lucide-react';
import { googleDriveService, DriveBackupFile, GoogleDriveStatus } from '../services/googleDriveService';
import { dbService } from '../services/storageService';

interface GoogleDriveSyncPanelProps {
  onDataRestored?: () => void;
  onRequestOAuthConnect?: () => void;
}

export const GoogleDriveSyncPanel: React.FC<GoogleDriveSyncPanelProps> = ({ 
  onDataRestored,
  onRequestOAuthConnect
}) => {
  const [status, setStatus] = useState<GoogleDriveStatus>(googleDriveService.getStatus());
  const [backups, setBackups] = useState<DriveBackupFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const localFileInputRef = useRef<HTMLInputElement>(null);

  const fetchBackups = async () => {
    if (!status.isConnected) return;
    setIsLoading(true);
    try {
      const files = await googleDriveService.listBackups();
      setBackups(files);
    } catch (e: any) {
      setMessage({ text: e.message || 'Error al listar respaldos en Google Drive', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setStatus(googleDriveService.getStatus());
    if (googleDriveService.getStatus().isConnected) {
      fetchBackups();
    }
  }, []);

  // --- CREAR ARCHIVO LOCAL (.json) ---
  const handleCreateLocalBackup = () => {
    try {
      const fileName = dbService.downloadLocalJsonBackup();
      setMessage({ 
        text: `¡Archivo local de respaldo "${fileName}" creado y descargado exitosamente en tu equipo!`, 
        type: 'success' 
      });
    } catch (err: any) {
      setMessage({ 
        text: `Error al crear archivo local de respaldo: ${err.message || 'Fallo desconocido'}`, 
        type: 'error' 
      });
    }
  };

  // --- RESTAURAR DESDE ARCHIVO LOCAL (.json) ---
  const handleRestoreLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`¿Desea restaurar la base de datos desde el archivo local "${file.name}"?\nSe generará automáticamente un respaldo preventivo de seguridad antes de aplicar los cambios.`)) {
      if (localFileInputRef.current) localFileInputRef.current.value = '';
      return;
    }

    // Copia preventiva previa
    const safetyFile = dbService.downloadLocalJsonBackup();

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = dbService.importFullJsonBackup(content, 'Restauración Archivo Local', 'ADMINISTRADOR');
      if (res.success) {
        setMessage({ 
          text: `¡Base de datos restaurada correctamente desde "${file.name}"! (${res.count} válvulas). Se guardó copia preventiva en "${safetyFile}".`, 
          type: 'success' 
        });
        if (onDataRestored) onDataRestored();
      } else {
        setMessage({ 
          text: res.message || 'El archivo seleccionado no tiene la estructura de un respaldo PGP 2026 válido.', 
          type: 'error' 
        });
      }
    };
    reader.readAsText(file);
    if (localFileInputRef.current) localFileInputRef.current.value = '';
  };

  // --- CREAR RESPALDO EN GOOGLE DRIVE ---
  const handleUploadBackup = async () => {
    setIsUploading(true);
    setMessage(null);
    try {
      const dbExport = dbService.exportFullJsonBackup();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `PGP_Respaldo_Calidad_${timestamp}.json`;

      const uploaded = await googleDriveService.uploadBackup(dbExport, fileName);
      setMessage({ 
        text: `¡Copia de seguridad "${uploaded.name}" subida exitosamente a Google Drive!`, 
        type: 'success' 
      });
      fetchBackups();
    } catch (err: any) {
      setMessage({ text: err.message || 'Error al subir el respaldo a Drive', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  // --- RESTAURAR DESDE GOOGLE DRIVE ---
  const handleRestoreBackup = async (file: DriveBackupFile) => {
    const confirmRestore = window.confirm(
      `ADVERTENCIA DE SEGURIDAD:\n¿Está seguro de restaurar el respaldo "${file.name}"?\nEsta acción actualizará su base de datos local. Se creará automáticamente un archivo local preventivo.`
    );
    if (!confirmRestore) return;

    // Crear archivo local de seguridad previo a la restauración
    const safetyFile = dbService.downloadLocalJsonBackup();

    setIsLoading(true);
    setMessage(null);
    try {
      const jsonContent = await googleDriveService.downloadBackupContent(file.id);
      const result = dbService.importFullJsonBackup(jsonContent, 'Usuario Google Drive', 'ADMINISTRADOR');
      if (result.success) {
        setMessage({ 
          text: `¡Base de datos restaurada correctamente desde "${file.name}"! (${result.count} válvulas cargadas). Respaldo preventivo guardado en "${safetyFile}".`, 
          type: 'success' 
        });
        if (onDataRestored) onDataRestored();
      } else {
        setMessage({ text: result.message || 'El archivo descargado no cuenta con el formato válido de respaldo.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Error al descargar y restaurar el respaldo', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('¿Desea desconectar su cuenta de Google Drive? Se limpiarán las credenciales en memoria de esta sesión.')) {
      googleDriveService.disconnect();
      setStatus(googleDriveService.getStatus());
      setBackups([]);
      setMessage({ text: 'Cuenta de Google Drive desconectada.', type: 'info' });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
      
      {/* Input de archivo local oculto */}
      <input 
        type="file" 
        ref={localFileInputRef}
        onChange={handleRestoreLocalFile}
        accept=".json"
        className="hidden" 
      />

      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Sincronización en la Nube con Google Drive & Archivos Locales
              </h2>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                status.isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {status.isConnected ? 'CONECTADO A DRIVE' : 'MODO LOCAL AUTÓNOMO'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Guarda y recupera copias de seguridad del sistema en tu Google Drive o mediante archivos locales en tu disco duro.
            </p>
          </div>
        </div>

        {/* Acciones de Google Drive */}
        <div className="flex flex-wrap items-center gap-2">
          {!status.isConnected ? (
            <button
              onClick={() => {
                if (onRequestOAuthConnect) {
                  onRequestOAuthConnect();
                } else {
                  setMessage({
                    text: 'Iniciando autorización de Google Drive... Selecciona tu cuenta de Google en la ventana emergente para otorgar permiso.',
                    type: 'info'
                  });
                }
              }}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Cloud className="w-4 h-4" />
              <span>Conectar Google Drive</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUploadBackup}
                disabled={isUploading}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isUploading ? 'Subiendo...' : 'Crear Respaldo en Drive'}</span>
              </button>

              <button
                onClick={fetchBackups}
                disabled={isLoading}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                title="Actualizar lista de archivos"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleDisconnect}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-semibold transition"
              >
                Desconectar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alertas y Mensajes */}
      {message && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 border ${
          message.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
            : message.type === 'error'
            ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
            : 'bg-blue-950/40 border-blue-500/30 text-blue-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* SECCIÓN DESTACADA: CREACIÓN DE ARCHIVO LOCAL (.JSON) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-blue-950/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Respaldos Locales Autónomos (Crea tu Archivo Local)</h3>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Genera un archivo local con toda la matriz de válvulas, pruebas hidrostáticas, punch list e historial de auditoría directamente en tu computador sin requerir conexión a internet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleCreateLocalBackup}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-md shadow-purple-600/30 border border-purple-400/30 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Crear Archivo Local (.json)</span>
          </button>

          <button
            onClick={() => localFileInputRef.current?.click()}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Restaurar Archivo Local</span>
          </button>
        </div>
      </div>

      {/* Información de Seguridad y Alcance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-blue-400 font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>Alcance Mínimo (Least Privilege)</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Permiso restringido <code className="text-blue-300">drive.file</code>. La aplicación solo accede a los archivos que ella misma genera en tu unidad.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <FolderCheck className="w-3.5 h-3.5" />
            <span>Carpeta Exclusiva del Sistema</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Los respaldos se almacenan en la carpeta <strong className="text-slate-200">PGP_2026_Respaldos_Calidad</strong> creada en tu propia cuenta Google.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-purple-400 font-bold">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Respaldo Preventivo Automático</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Antes de cualquier restauración de datos, el sistema genera y descarga automáticamente una copia preventiva para proteger tu información.
          </p>
        </div>
      </div>

      {/* Lista de Respaldos en Google Drive */}
      {status.isConnected && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <FolderCheck className="w-4 h-4 text-emerald-400" />
              <span>Copias de Seguridad Disponibles en Google Drive ({backups.length})</span>
            </h3>
            {status.lastBackupDate && (
              <span className="text-[11px] text-slate-400 font-mono">
                Última sincronización: {new Date(status.lastBackupDate).toLocaleString('es-CL')}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-400 mb-2" />
              <span>Consultando respaldos en Google Drive...</span>
            </div>
          ) : backups.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
              <Cloud className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-medium text-slate-300">No hay respaldos todavía en la carpeta de Google Drive.</p>
              <p className="text-[11px] text-slate-500">Presiona "Crear Respaldo en Drive" para subir tu primera copia de seguridad.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden text-xs">
              {backups.map((file) => (
                <div key={file.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/60 transition">
                  <div className="space-y-0.5">
                    <p className="font-mono font-bold text-slate-200">{file.name}</p>
                    <p className="text-[11px] text-slate-400 flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(file.createdTime).toLocaleString('es-CL')}</span>
                      {file.size && <span>• {(Number(file.size) / 1024).toFixed(1)} KB</span>}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRestoreBackup(file)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white font-semibold text-xs transition border border-slate-700 hover:border-emerald-500"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Restaurar Copia</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
