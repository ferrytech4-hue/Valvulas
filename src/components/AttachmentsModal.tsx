/**
 * Módulo de Gestión de Archivos Adjuntos y Documentos Técnicos
 * Certificados MTR, Calibración de Manómetros, Protocolos y Fotografías
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 */

import React, { useState, useRef } from 'react';
import { 
  Paperclip, 
  FileText, 
  Image, 
  UploadCloud, 
  Trash2, 
  Download, 
  XCircle, 
  ShieldCheck, 
  AlertCircle,
  FileCheck,
  Eye
} from 'lucide-react';
import { AttachmentRecord, ValveRecord } from '../types';
import { dbService } from '../services/storageService';
import { useAuth } from '../services/authContext';

interface AttachmentsModalProps {
  valve: ValveRecord;
  onClose: () => void;
}

export const AttachmentsModal: React.FC<AttachmentsModalProps> = ({
  valve,
  onClose
}) => {
  const { user, can } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [attachments, setAttachments] = useState<AttachmentRecord[]>(() => {
    return dbService.getAttachmentsByEntity('valvula', valve.id);
  });

  const [documentType, setDocumentType] = useState<AttachmentRecord['tipo_documento']>('MTR_CERTIFICADO_MATERIAL');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Cuota de Almacenamiento (Para cumplir con arquitectura de Costo Cero)
  const totalSizeBytes = attachments.reduce((acc, a) => acc + a.tamano_bytes, 0);
  const maxStorageLimitBytes = 50 * 1024 * 1024; // 50 MB límite local gratuito
  const usedStoragePercent = Math.min(100, Math.round((totalSizeBytes / maxStorageLimitBytes) * 100));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    try {
      // Validación de tamaño (Límite 10 MB por archivo)
      const maxFileBytes = 10 * 1024 * 1024;
      if (file.size > maxFileBytes) {
        throw new Error('El archivo supera el límite de 10 MB permitido para adjuntos.');
      }

      // Generar hash SHA-256 simulado para integridad
      const hashSha256 = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Guardar adjunto
      const newAtt = dbService.saveAttachment({
        entidad_tipo: 'valvula',
        entidad_id: valve.id,
        tag: valve.tag,
        nombre_archivo: file.name,
        tipo_documento: documentType,
        tipo_mime: file.type || 'application/octet-stream',
        tamano_bytes: file.size,
        subido_por: user.nombre,
        hash_sha256: hashSha256,
        url_almacenamiento: `/storage/valves/${valve.tag}/${file.name}`
      }, user.nombre, user.rol);

      setAttachments(dbService.getAttachmentsByEntity('valvula', valve.id));
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadError(err.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!can('DELETE_ATTACHMENT')) {
      alert('No cuenta con permisos para eliminar archivos adjuntos.');
      return;
    }
    dbService.deleteAttachment(id, user.nombre, user.rol);
    setAttachments(dbService.getAttachmentsByEntity('valvula', valve.id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Cabecera */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Paperclip className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Documentos Técnicos & Certificados MTR</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                  {valve.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Protocolos firmados, certificados de materiales (MTR 3.1) y registro fotográfico
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

        {/* Contenido */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-200 space-y-5">
          
          {/* Zona de Subida */}
          {can('UPLOAD_ATTACHMENT') && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-300">Tipo de Documento:</span>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200"
                  >
                    <option value="MTR_CERTIFICADO_MATERIAL">Certificado de Materiales (MTR 3.1)</option>
                    <option value="PROTOCOLO_FIRMADO">Protocolo Firmado (PDF)</option>
                    <option value="CERTIFICADO_CALIBRACION">Calibración de Manómetro</option>
                    <option value="FOTOGRAFIA_ENSAYO">Fotografía de Ensayo / Hallazgo</option>
                    <option value="FICHA_TECNICA">Ficha Técnica Fabricante</option>
                    <option value="OTRO">Otro Documento</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Subir Documento</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {uploadError && (
                <p className="text-xs text-rose-400 font-medium">{uploadError}</p>
              )}
            </div>
          )}

          {/* Medidor de Cuota Gratuita */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Almacenamiento Local Seguro del Dispositivo / Google Drive:</span>
              <span className="font-mono text-slate-300">{(totalSizeBytes / (1024 * 1024)).toFixed(2)} MB / 50 MB ({usedStoragePercent}%)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${usedStoragePercent}%` }}
              />
            </div>
          </div>

          {/* Lista de Adjuntos */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Documentos Asociados ({attachments.length})
            </h4>

            {attachments.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-500 text-xs">
                No hay documentos adjuntos para esta válvula.
              </div>
            ) : (
              attachments.map(att => (
                <div key={att.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs hover:border-slate-700 transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-800">
                      {att.tipo_mime.includes('image') ? <Image className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">{att.nombre_archivo}</p>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-purple-300 font-medium">
                          {att.tipo_documento.replace(/_/g, ' ')}
                        </span>
                        <span>•</span>
                        <span>{(att.tamano_bytes / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>Por {att.subido_por}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => alert(`Visualización de documento simulada: ${att.nombre_archivo}\nHash SHA-256: ${att.hash_sha256}`)}
                      className="p-1.5 rounded hover:bg-slate-800 text-blue-400"
                      title="Ver Documento"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {can('DELETE_ATTACHMENT') && (
                      <button
                        type="button"
                        onClick={() => handleDelete(att.id)}
                        className="p-1.5 rounded hover:bg-slate-800 text-rose-400"
                        title="Eliminar Documento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
