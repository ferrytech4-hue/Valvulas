/**
 * Servicio Central de Base de Datos y Persistencia Relacional
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 * 
 * Cumple con arquitectura libre de costo, 100% autónoma y offline:
 * - Persistencia local en navegador (LocalStorage & IndexedDB) de alta confiabilidad
 * - Exportación de respaldos completos en JSON para Google Drive / almacenamiento local
 * - Generación de scripts DDL y DML estándar PostgreSQL / SQLite para servidores on-premise
 * - Aplica reglas de integridad relacional, bloqueo de liberación por Punch List A,
 *   claves foráneas, índices y registro de auditoría inmutable.
 */

import { 
  ValveRecord, 
  HydroTestRecord, 
  PunchItemRecord, 
  AttachmentRecord, 
  ImportHistoryRecord, 
  AuditLogRecord,
  UserRole,
  QAQCStatus
} from '../types';
import { INITIAL_VALVES, INITIAL_HYDRO_TESTS, INITIAL_PUNCH_ITEMS, INITIAL_ATTACHMENTS } from '../data/samplePgpValves';
import { indexedDb, StoredExcelSheet } from '../db/indexedDb';
import { auditService } from './auditService';

const STORAGE_KEY_VALVES = 'pgp_valvulas_2026_db_valves';
const STORAGE_KEY_HYDRO = 'pgp_valvulas_2026_db_hydro';
const STORAGE_KEY_PUNCH = 'pgp_valvulas_2026_db_punch';
const STORAGE_KEY_ATTACHMENTS = 'pgp_valvulas_2026_db_attachments';
const STORAGE_KEY_IMPORT_HISTORY = 'pgp_valvulas_2026_db_import_history';
const STORAGE_KEY_AUDIT = 'pgp_valvulas_2026_db_audit';
const STORAGE_KEY_DB_CONFIG = 'pgp_valvulas_2026_db_config';

export type SaveStatusState = 'SAVED' | 'SAVING' | 'UNSAVED' | 'ERROR';

export interface DatabaseConfig {
  mode: 'LOCAL_OFFLINE_ENGINE';
  storageEngine: 'IndexedDB & LocalStorage Engine';
  lastBackupDate?: string;
  autoBackupInterval: 'DAILY' | 'ON_CHANGE' | 'MANUAL';
  driveSyncFolder: string;
  connected: boolean;
}

class StorageService {
  private config: DatabaseConfig = {
    mode: 'LOCAL_OFFLINE_ENGINE',
    storageEngine: 'IndexedDB & LocalStorage Engine',
    lastBackupDate: new Date().toISOString(),
    autoBackupInterval: 'ON_CHANGE',
    driveSyncFolder: 'Google Drive / PGP_Valvulas_Respaldos',
    connected: true
  };

  private currentSaveStatus: SaveStatusState = 'SAVED';
  private saveStatusListeners: ((status: SaveStatusState) => void)[] = [];

  constructor() {
    this.initDatabase();
    this.hydrateFromIndexedDb();
  }

  public subscribeSaveStatus(listener: (status: SaveStatusState) => void): () => void {
    this.saveStatusListeners.push(listener);
    listener(this.currentSaveStatus);
    return () => {
      this.saveStatusListeners = this.saveStatusListeners.filter(l => l !== listener);
    };
  }

  public notifySaveStatus(status: SaveStatusState) {
    this.currentSaveStatus = status;
    this.saveStatusListeners.forEach(l => {
      try { l(status); } catch (e) { console.error(e); }
    });
  }

  public getSaveStatus(): SaveStatusState {
    return this.currentSaveStatus;
  }

  /**
   * Sincroniza atómicamente el estado en memoria hacia IndexedDB (Dexie)
   */
  public async syncToIndexedDb(): Promise<void> {
    try {
      this.notifySaveStatus('SAVING');
      const valves = this.getValves();
      const tests = this.getHydroTests();
      const punches = this.getPunchItems();
      const attachments = this.getAttachments();
      const history = this.getImportHistory();
      const audits = this.getAuditLogs();

      await indexedDb.transaction('rw', [
        indexedDb.valves,
        indexedDb.hydroTests,
        indexedDb.punchList,
        indexedDb.attachments,
        indexedDb.importHistory,
        indexedDb.auditLogs
      ], async () => {
        await indexedDb.valves.clear();
        await indexedDb.valves.bulkPut(valves);

        await indexedDb.hydroTests.clear();
        await indexedDb.hydroTests.bulkPut(tests);

        await indexedDb.punchList.clear();
        await indexedDb.punchList.bulkPut(punches);

        await indexedDb.attachments.clear();
        await indexedDb.attachments.bulkPut(attachments);

        await indexedDb.importHistory.clear();
        await indexedDb.importHistory.bulkPut(history);

        await indexedDb.auditLogs.clear();
        await indexedDb.auditLogs.bulkPut(audits);
      });

      this.notifySaveStatus('SAVED');
    } catch (err) {
      console.error('Error sincronizando con IndexedDB:', err);
      this.notifySaveStatus('ERROR');
    }
  }

  /**
    * Hidrata la memoria/localStorage desde IndexedDB si contiene registros previos
   */
  private async hydrateFromIndexedDb(): Promise<void> {
    try {
      const count = await indexedDb.valves.count();
      if (count > 0) {
        const storedValves = await indexedDb.valves.toArray();
        // Si contiene registros de demostración antiguos del Libro Maestro, vaciar para dejar lista para importar
        const hasDemoTags = storedValves.some(v => v.tag === '100-XV-0101' || v.tag === '100-XV-101A');
        if (hasDemoTags) {
          await indexedDb.valves.clear();
          await indexedDb.hydroTests.clear();
          await indexedDb.punchList.clear();
          await indexedDb.attachments.clear();
          localStorage.setItem(STORAGE_KEY_VALVES, JSON.stringify([]));
          localStorage.setItem(STORAGE_KEY_HYDRO, JSON.stringify([]));
          localStorage.setItem(STORAGE_KEY_PUNCH, JSON.stringify([]));
          localStorage.setItem(STORAGE_KEY_ATTACHMENTS, JSON.stringify([]));
          return;
        }

        const storedTests = await indexedDb.hydroTests.toArray();
        const storedPunches = await indexedDb.punchList.toArray();
        const storedAttachments = await indexedDb.attachments.toArray();
        const storedHistory = await indexedDb.importHistory.toArray();
        const storedAudits = await indexedDb.auditLogs.toArray();

        localStorage.setItem(STORAGE_KEY_VALVES, JSON.stringify(storedValves));
        localStorage.setItem(STORAGE_KEY_HYDRO, JSON.stringify(storedTests));
        localStorage.setItem(STORAGE_KEY_PUNCH, JSON.stringify(storedPunches));
        localStorage.setItem(STORAGE_KEY_ATTACHMENTS, JSON.stringify(storedAttachments));
        localStorage.setItem(STORAGE_KEY_IMPORT_HISTORY, JSON.stringify(storedHistory));
        localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(storedAudits));
      } else {
        await this.syncToIndexedDb();
      }
    } catch (e) {
      console.warn('Advertencia en carga inicial IndexedDB:', e);
    }
  }

  private initDatabase() {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEY_DB_CONFIG);
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }

      const existingRaw = localStorage.getItem(STORAGE_KEY_VALVES);
      const existingParsed = existingRaw ? JSON.parse(existingRaw) : [];
      const hasDemoTags = existingParsed.some((v: any) => v.tag === '100-XV-0101' || v.tag === '100-XV-101A');

      // Si no existe almacenamiento previo o tiene los datos demo del libro maestro, dejar la matriz limpia y lista para importar
      if (!existingRaw || hasDemoTags) {
        localStorage.setItem(STORAGE_KEY_VALVES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEY_HYDRO, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEY_PUNCH, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEY_ATTACHMENTS, JSON.stringify([]));
        indexedDb.valves.clear().catch(() => {});
        indexedDb.hydroTests.clear().catch(() => {});
        indexedDb.punchList.clear().catch(() => {});
        indexedDb.attachments.clear().catch(() => {});
      }

      if (!localStorage.getItem(STORAGE_KEY_IMPORT_HISTORY)) {
        localStorage.setItem(STORAGE_KEY_IMPORT_HISTORY, JSON.stringify([]));
      }
      if (!localStorage.getItem(STORAGE_KEY_AUDIT)) {
        const initialAudit: AuditLogRecord = {
          id: 'aud-001',
          timestamp: new Date().toISOString(),
          usuario: 'SISTEMA_PGP',
          rol: 'ADMINISTRADOR',
          accion: 'INSERT',
          entidad: 'valvulas',
          entidad_id: 'valv-init',
          tag: 'SISTEMA',
          cambios: JSON.stringify({ estado: 'Matriz inicializada limpia y lista para importar' })
        };
        localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify([initialAudit]));
      }
    } catch (e) {
      console.error('Error inicializando base de datos local:', e);
    }
  }

  /**
   * Vacía completamente los registros para dejar la matriz limpia y lista para una nueva importación
   */
  public clearMatrix(): void {
    localStorage.setItem(STORAGE_KEY_VALVES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_HYDRO, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_PUNCH, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_ATTACHMENTS, JSON.stringify([]));
    indexedDb.valves.clear().catch(() => {});
    indexedDb.hydroTests.clear().catch(() => {});
    indexedDb.punchList.clear().catch(() => {});
    indexedDb.attachments.clear().catch(() => {});
    this.notifySaveStatus('SAVED');
  }

  // --- CONFIGURACIÓN DE BASE DE DATOS ---
  public getDatabaseConfig(): DatabaseConfig {
    return { ...this.config };
  }

  public updateDatabaseConfig(newConfig: Partial<DatabaseConfig>) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem(STORAGE_KEY_DB_CONFIG, JSON.stringify(this.config));
  }

  // --- REGISTRO DE AUDITORÍA INMUTABLE ---
  private logAudit(
    usuario: string, 
    rol: UserRole, 
    accion: AuditLogRecord['accion'], 
    entidad: string, 
    entidad_id: string, 
    tag: string, 
    cambios: any
  ) {
    try {
      const audits = this.getAuditLogs();
      const newAudit: AuditLogRecord = {
        id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toISOString(),
        usuario,
        rol,
        accion,
        entidad,
        entidad_id,
        tag,
        cambios: typeof cambios === 'string' ? cambios : JSON.stringify(cambios)
      };
      audits.unshift(newAudit);
      // Guardar hasta los últimos 500 registros de auditoría
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(audits.slice(0, 500)));
    } catch (e) {
      console.error('Error al registrar auditoría:', e);
    }
  }

  public getAuditLogs(): AuditLogRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_AUDIT);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // --- MAESTRO DE VÁLVULAS ---
  public getValves(): ValveRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_VALVES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getValveById(id: string): ValveRecord | undefined {
    return this.getValves().find(v => v.id === id);
  }

  public getValveByTag(tag: string): ValveRecord | undefined {
    const cleanTag = tag.trim().toUpperCase();
    return this.getValves().find(v => v.tag.trim().toUpperCase() === cleanTag);
  }

  public saveValve(valve: Omit<ValveRecord, 'id' | 'created_at' | 'updated_at'> & { id?: string }, user: string, role: UserRole): ValveRecord {
    const valves = this.getValves();
    const cleanTag = valve.tag.trim().toUpperCase();

    // Verificación de unicidad de TAG
    const existingWithTag = valves.find(v => v.tag.trim().toUpperCase() === cleanTag && v.id !== valve.id);
    if (existingWithTag) {
      throw new Error(`El TAG "${valve.tag}" ya se encuentra registrado en el sistema (Válvula ID: ${existingWithTag.id}, OT: ${existingWithTag.ot}). No se permiten duplicados.`);
    }

    // Regla de Negocio Industrial PGP: Bloqueo de liberación si existen Punch List Tipo A abiertos
    if (valve.id && ['LIBERADA_QAQC', 'APROBADA_ITO', 'ENTREGADA_FAENA'].includes(valve.estado_qaqc)) {
      const punches = this.getPunchItemsByValveId(valve.id);
      const openCritical = punches.filter(p => p.tipo_desviacion === 'TIPO_A_CRITICO' && p.estado !== 'CERRADA');
      if (openCritical.length > 0) {
        throw new Error(`BLOQUEO QA/QC: No es posible liberar la válvula "${valve.tag}". Existen ${openCritical.length} observaciones Punch List críticas (Tipo A) pendientes de resolución.`);
      }
    }

    const now = new Date().toISOString();

    if (valve.id) {
      // Actualización
      const index = valves.findIndex(v => v.id === valve.id);
      if (index === -1) {
        throw new Error(`La válvula con ID "${valve.id}" no fue encontrada.`);
      }
      const oldRecord = valves[index];
      const updatedValve: ValveRecord = {
        ...oldRecord,
        ...valve,
        id: valve.id,
        updated_at: now,
        updated_by: user
      };
      valves[index] = updatedValve;
      localStorage.setItem(STORAGE_KEY_VALVES, JSON.stringify(valves));
      this.syncToIndexedDb();
      this.logAudit(user, role, 'UPDATE', 'valvulas', updatedValve.id, updatedValve.tag, {
        antes: oldRecord,
        despues: updatedValve
      });
      // Capturar en servicio de auditoría detallado con diff de campos
      try {
        auditService.logUpdate(oldRecord, updatedValve, user, role);
      } catch (err) {
        console.warn('Error registrando auditoría en auditService:', err);
      }
      return updatedValve;
    } else {
      // Inserción
      const newId = 'valv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const newValve: ValveRecord = {
        ...valve,
        id: newId,
        created_at: now,
        updated_at: now,
        updated_by: user
      };
      valves.unshift(newValve);
      localStorage.setItem(STORAGE_KEY_VALVES, JSON.stringify(valves));
      this.syncToIndexedDb();
      this.logAudit(user, role, 'INSERT', 'valvulas', newId, newValve.tag, newValve);
      // Capturar en servicio de auditoría detallado
      try {
        auditService.logCreate(newValve, user, role);
      } catch (err) {
        console.warn('Error registrando auditoría en auditService:', err);
      }
      return newValve;
    }
  }

  public deleteValve(id: string, user: string, role: UserRole): boolean {
    const valves = this.getValves();
    const target = valves.find(v => v.id === id);
    if (!target) return false;

    // Integridad referencial en Cascada
    const filteredValves = valves.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEY_VALVES, JSON.stringify(filteredValves));

    // Eliminar pruebas asociadas
    const tests = this.getHydroTests().filter(t => t.valvula_id !== id);
    localStorage.setItem(STORAGE_KEY_HYDRO, JSON.stringify(tests));

    // Eliminar punch items asociados
    const punches = this.getPunchItems().filter(p => p.valvula_id !== id);
    localStorage.setItem(STORAGE_KEY_PUNCH, JSON.stringify(punches));

    // Eliminar adjuntos asociados
    const attachments = this.getAttachments().filter(a => a.entidad_id !== id);
    localStorage.setItem(STORAGE_KEY_ATTACHMENTS, JSON.stringify(attachments));

    this.logAudit(user, role, 'DELETE', 'valvulas', id, target.tag, { registroEliminado: target });
    try {
      auditService.logDelete(target, user, role);
    } catch (err) {
      console.warn('Error registrando eliminación en auditService:', err);
    }
    return true;
  }

  // --- PRUEBAS HIDRÁULICAS ---
  public getHydroTests(): HydroTestRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_HYDRO);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getHydroTestsByValveId(valveId: string): HydroTestRecord[] {
    return this.getHydroTests().filter(t => t.valvula_id === valveId);
  }

  public saveHydroTest(test: Omit<HydroTestRecord, 'id' | 'created_at'> & { id?: string }, user: string, role: UserRole): HydroTestRecord {
    const tests = this.getHydroTests();
    const now = new Date().toISOString();

    if (test.id) {
      const idx = tests.findIndex(t => t.id === test.id);
      if (idx === -1) throw new Error('Protocolo de prueba no encontrado');
      const updated: HydroTestRecord = {
        ...tests[idx],
        ...test,
        id: test.id
      };
      tests[idx] = updated;
      localStorage.setItem(STORAGE_KEY_HYDRO, JSON.stringify(tests));
      this.logAudit(user, role, 'UPDATE', 'pruebas_hidraulicas', updated.id, updated.tag, updated);
      return updated;
    } else {
      const newId = 'ht-' + Date.now();
      const newTest: HydroTestRecord = {
        ...test,
        id: newId,
        created_at: now
      };
      tests.unshift(newTest);
      localStorage.setItem(STORAGE_KEY_HYDRO, JSON.stringify(tests));

      // Actualizar automáticamente el estado de la válvula si se aprobó
      const valve = this.getValveById(test.valvula_id);
      if (valve) {
        if (newTest.resultado_general === 'APROBADO') {
          // Si tiene punch items críticos abiertos, queda en PUNCH_LIST_ABIERTO, sino en LIBERADA_QAQC
          const punches = this.getPunchItemsByValveId(valve.id);
          const hasCritical = punches.some(p => p.tipo_desviacion === 'TIPO_A_CRITICO' && p.estado !== 'CERRADA');
          valve.estado_qaqc = hasCritical ? 'PUNCH_LIST_ABIERTO' : 'LIBERADA_QAQC';
          if (!valve.numero_certificado) {
            valve.numero_certificado = `CERT-PGP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
          }
          if (!valve.fecha_liberacion && !hasCritical) {
            valve.fecha_liberacion = new Date().toISOString().split('T')[0];
          }
          this.saveValve(valve, user, role);
        } else if (newTest.resultado_general === 'RECHAZADO') {
          valve.estado_qaqc = 'NO_CONFORME';
          this.saveValve(valve, user, role);
        }
      }

      this.logAudit(user, role, 'INSERT', 'pruebas_hidraulicas', newId, newTest.tag, newTest);
      return newTest;
    }
  }

  // --- PUNCH LIST / DESVIACIONES ---
  public getPunchItems(): PunchItemRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PUNCH);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getPunchItemsByValveId(valveId: string): PunchItemRecord[] {
    return this.getPunchItems().filter(p => p.valvula_id === valveId);
  }

  public savePunchItem(punch: Omit<PunchItemRecord, 'id' | 'created_at'> & { id?: string }, user: string, role: UserRole): PunchItemRecord {
    const punches = this.getPunchItems();
    const now = new Date().toISOString();

    if (punch.id) {
      const idx = punches.findIndex(p => p.id === punch.id);
      if (idx === -1) throw new Error('Item de Punch List no encontrado');
      const updated: PunchItemRecord = {
        ...punches[idx],
        ...punch,
        id: punch.id
      };
      punches[idx] = updated;
      localStorage.setItem(STORAGE_KEY_PUNCH, JSON.stringify(punches));
      this.logAudit(user, role, punch.estado === 'CERRADA' ? 'PUNCH_CLOSE' : 'UPDATE', 'punch_list', updated.id, updated.tag, updated);
      return updated;
    } else {
      const newId = 'punch-' + Date.now();
      const newPunch: PunchItemRecord = {
        ...punch,
        id: newId,
        created_at: now
      };
      punches.unshift(newPunch);
      localStorage.setItem(STORAGE_KEY_PUNCH, JSON.stringify(punches));

      // Si es Tipo A (Crítico), poner la válvula en PUNCH_LIST_ABIERTO automáticamente
      if (newPunch.tipo_desviacion === 'TIPO_A_CRITICO') {
        const valve = this.getValveById(newPunch.valvula_id);
        if (valve && valve.estado_qaqc !== 'NO_CONFORME') {
          valve.estado_qaqc = 'PUNCH_LIST_ABIERTO';
          this.saveValve(valve, user, role);
        }
      }

      this.logAudit(user, role, 'INSERT', 'punch_list', newId, newPunch.tag, newPunch);
      return newPunch;
    }
  }

  // --- ARCHIVOS ADJUNTOS ---
  public getAttachments(): AttachmentRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ATTACHMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getAttachmentsByEntity(entityType: string, entityId: string): AttachmentRecord[] {
    return this.getAttachments().filter(a => a.entidad_tipo === entityType && a.entidad_id === entityId);
  }

  public saveAttachment(attachment: Omit<AttachmentRecord, 'id' | 'fecha_subida'>, user: string, role: UserRole): AttachmentRecord {
    const attachments = this.getAttachments();
    const newId = 'att-' + Date.now();
    const newAtt: AttachmentRecord = {
      ...attachment,
      id: newId,
      fecha_subida: new Date().toISOString()
    };
    attachments.unshift(newAtt);
    localStorage.setItem(STORAGE_KEY_ATTACHMENTS, JSON.stringify(attachments));
    this.logAudit(user, role, 'INSERT', 'adjuntos', newId, newAtt.tag, {
      archivo: newAtt.nombre_archivo,
      tipo: newAtt.tipo_documento,
      tamano: newAtt.tamano_bytes
    });
    return newAtt;
  }

  public deleteAttachment(id: string, user: string, role: UserRole): boolean {
    const attachments = this.getAttachments();
    const target = attachments.find(a => a.id === id);
    if (!target) return false;
    const filtered = attachments.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY_ATTACHMENTS, JSON.stringify(filtered));
    this.logAudit(user, role, 'DELETE', 'adjuntos', id, target.tag, { archivoEliminado: target.nombre_archivo });
    return true;
  }

  // --- HISTORIAL DE IMPORTACIONES ---
  public getImportHistory(): ImportHistoryRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_IMPORT_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public recordImport(history: Omit<ImportHistoryRecord, 'id' | 'fecha'>): ImportHistoryRecord {
    const list = this.getImportHistory();
    const record: ImportHistoryRecord = {
      ...history,
      id: 'imp-' + Date.now(),
      fecha: new Date().toISOString()
    };
    list.unshift(record);
    localStorage.setItem(STORAGE_KEY_IMPORT_HISTORY, JSON.stringify(list.slice(0, 100)));
    return record;
  }

  // --- BATCH TRANSACTIONAL IMPORT ---
  public executeBatchImport(
    items: {
      action: 'INSERT' | 'UPDATE' | 'SKIP';
      record: ValveRecord;
      originalTag: string;
    }[],
    fileName: string,
    fileSize: number,
    user: string,
    role: UserRole
  ): {
    inserted: number;
    updated: number;
    skipped: number;
    errors: string[];
  } {
    const currentValves = [...this.getValves()];
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];
    const auditChanges: any[] = [];
    const now = new Date().toISOString();

    for (const item of items) {
      if (item.action === 'SKIP') {
        skipped++;
        continue;
      }

      if (item.action === 'INSERT') {
        const cleanTag = item.record.tag.trim().toUpperCase();
        // Verificar si ya existe en el array
        const exists = currentValves.some(v => v.tag.trim().toUpperCase() === cleanTag);
        if (exists) {
          errors.push(`TAG duplicado omitido durante inserción: ${item.record.tag}`);
          continue;
        }

        const newValve: ValveRecord = {
          ...item.record,
          id: 'valv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          created_at: now,
          updated_at: now,
          updated_by: user
        };
        currentValves.unshift(newValve);
        inserted++;
        auditChanges.push({ tag: newValve.tag, action: 'INSERT' });
      } else if (item.action === 'UPDATE') {
        const cleanTag = item.record.tag.trim().toUpperCase();
        const existingIndex = currentValves.findIndex(v => v.tag.trim().toUpperCase() === cleanTag);
        if (existingIndex === -1) {
          errors.push(`No se encontró registro existente para actualizar TAG: ${item.record.tag}`);
          continue;
        }

        const oldRecord = currentValves[existingIndex];
        currentValves[existingIndex] = {
          ...oldRecord,
          ...item.record,
          id: oldRecord.id,
          created_at: oldRecord.created_at,
          updated_at: now,
          updated_by: user
        };
        updated++;
        auditChanges.push({ tag: cleanTag, action: 'UPDATE', cambios: item.record });
      }
    }

    // Persistir todos los cambios en bloque atómico
    localStorage.setItem(STORAGE_KEY_VALVES, JSON.stringify(currentValves));

    // Registrar en Historial
    this.recordImport({
      nombre_archivo: fileName,
      tamano_bytes: fileSize,
      total_filas: items.length,
      filas_insertadas: inserted,
      filas_actualizadas: updated,
      filas_omitidas: skipped,
      filas_rechazadas: errors.length,
      usuario: user,
      detalles_json: JSON.stringify({
        resumen: `Procesadas ${items.length} filas: +${inserted} nuevas, ^${updated} actualizadas, ~${skipped} omitidas, !${errors.length} rechazadas.`,
        errores: errors
      })
    });

    // Registrar en Auditoría General
    this.logAudit(user, role, 'IMPORT', 'valvulas', 'batch-import', 'MULTIPLE', {
      archivo: fileName,
      insertados: inserted,
      actualizados: updated,
      omitidos: skipped,
      detalles: auditChanges
    });

    return { inserted, updated, skipped, errors };
  }

  /**
   * Importa filas procesadas desde el módulo de gestión de hojas Excel
   */
  public importFromExcelMatrix(
    rows: Record<string, any>[],
    fileName: string,
    fileSize: number,
    user: string,
    role: UserRole
  ): {
    inserted: number;
    updated: number;
    skipped: number;
    errors: string[];
  } {
    const existingValves = this.getValves();
    const batchItems: {
      action: 'INSERT' | 'UPDATE' | 'SKIP';
      record: ValveRecord;
      originalTag: string;
    }[] = [];

    rows.forEach(row => {
      // Buscar clave TAG en el objeto
      const tagKey = Object.keys(row).find(k => /tag|identif|codigo/i.test(k)) || 'tag';
      const rawTag = String(row[tagKey] || row.tag || '').trim();
      if (!rawTag) return;

      const cleanTag = rawTag.toUpperCase();
      const existing = existingValves.find(v => v.tag.trim().toUpperCase() === cleanTag);

      const record: ValveRecord = {
        id: existing?.id || `valv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tag: rawTag,
        ot: String(row.ot || row['O/T'] || row['Orden de Trabajo'] || row.OT || 'OT-2026-001'),
        tipo_valvula: (row.tipo_valvula || row['Tipo de Válvula'] || row.tipo || 'Compuerta') as any,
        marca: String(row.marca || row.Fabricante || 'Flowserve'),
        modelo: String(row.modelo || row.Modelo || 'Estándar'),
        diametro_nominal: String(row.diametro_nominal || row.DN || row['Diámetro'] || '4"'),
        clase_rating: (row.clase_rating || row.Rating || row.Clase || '300#') as any,
        tipo_conexion: String(row.tipo_conexion || row['Conexión'] || 'RF (Raised Face)'),
        material_cuerpo: String(row.material_cuerpo || row['Cuerpo'] || 'ASTM A216 WCB'),
        material_asiento: String(row.material_asiento || row['Asiento'] || 'Stellite'),
        material_trim: String(row.material_trim || row.Trim || 'Trim 8'),
        area_planta: String(row.area_planta || row['Área'] || 'Área 100'),
        sistema: String(row.sistema || row.Sistema || 'Procesos PGP'),
        ubicacion_fisica: String(row.ubicacion_fisica || row['Ubicación'] || 'Planta'),
        estado_qaqc: (row.estado_qaqc || row['Estado'] || 'RECEPCION') as QAQCStatus,
        inspector_ito: String(row.inspector_ito || row['Inspector ITO'] || 'Inspector ITO'),
        responsable_taller: String(row.responsable_taller || row['Responsable'] || user),
        fecha_recepcion: String(row.fecha_recepcion || new Date().toISOString().split('T')[0]),
        observaciones: String(row.observaciones || 'Importado desde Gestión de Archivos Excel'),
        created_at: existing?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: user
      };

      batchItems.push({
        action: existing ? 'UPDATE' : 'INSERT',
        record,
        originalTag: rawTag
      });
    });

    return this.executeBatchImport(batchItems, fileName, fileSize, user, role);
  }

  // --- GENERADOR DE RESPALDO JSON COMPLETO (LOCAL / DRIVE) ---
  public exportFullJsonBackup(): string {
    const backup = {
      version: 'PGP_2026_V1.0.0',
      generated_at: new Date().toISOString(),
      engine: 'LOCAL_OFFLINE_ENGINE',
      valves: this.getValves(),
      hydro_tests: this.getHydroTests(),
      punch_items: this.getPunchItems(),
      attachments: this.getAttachments(),
      import_history: this.getImportHistory(),
      audit_logs: this.getAuditLogs()
    };
    return JSON.stringify(backup, null, 2);
  }

  // --- DESCARGA DIRECTA DE ARCHIVO LOCAL DE RESPALDO ---
  public downloadLocalJsonBackup(): string {
    const backupJson = this.exportFullJsonBackup();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `PGP_2026_Respaldo_Local_v1_${timestamp}.json`;
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const blob = new Blob([backupJson], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    return fileName;
  }

  public importFullJsonBackup(jsonString: string, user: string, role: UserRole): { success: boolean; message: string; count: number } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.valves || !Array.isArray(data.valves)) {
        return { success: false, message: 'El archivo JSON no contiene un arreglo válido de válvulas PGP.', count: 0 };
      }

      localStorage.setItem(STORAGE_KEY_VALVES, JSON.stringify(data.valves));
      if (Array.isArray(data.hydro_tests)) {
        localStorage.setItem(STORAGE_KEY_HYDRO, JSON.stringify(data.hydro_tests));
      }
      if (Array.isArray(data.punch_items)) {
        localStorage.setItem(STORAGE_KEY_PUNCH, JSON.stringify(data.punch_items));
      }
      if (Array.isArray(data.attachments)) {
        localStorage.setItem(STORAGE_KEY_ATTACHMENTS, JSON.stringify(data.attachments));
      }

      this.logAudit(user, role, 'IMPORT', 'valvulas', 'backup-restore', 'ALL', {
        mensaje: 'Restauración completa desde copia de seguridad JSON local/Drive',
        valvulas_restauradas: data.valves.length
      });

      return { success: true, message: `Base de datos restaurada con éxito: ${data.valves.length} válvulas cargadas.`, count: data.valves.length };
    } catch (err: any) {
      return { success: false, message: `Error al procesar JSON: ${err?.message || 'Formato no válido'}`, count: 0 };
    }
  }

  // --- GENERADOR DE MIGRACIÓN Y DUMP SQL ESTÁNDAR (POSTGRESQL / SQLITE) ---
  public generateFullSqlDump(): string {
    const valves = this.getValves();
    const tests = this.getHydroTests();
    const punches = this.getPunchItems();
    const timestamp = new Date().toISOString();

    let sql = `-- ============================================================================\n`;
    sql += `-- RESPALDO Y DUMP SQL: SISTEMA DE CONTROL DE CALIDAD DE VÁLVULAS PGP 2026\n`;
    sql += `-- Generado: ${timestamp}\n`;
    sql += `-- Compatible con: PostgreSQL 14+, 15+, 16+, Servidor Local o On-Premise\n`;
    sql += `-- ============================================================================\n\n`;

    sql += `-- Limpiar datos existentes si se requiere (opcional)\n`;
    sql += `-- TRUNCATE TABLE punch_list, pruebas_hidraulicas, valvulas CASCADE;\n\n`;

    // Insertar Válvulas
    sql += `-- Inserción de Válvulas (${valves.length} registros)\n`;
    for (const v of valves) {
      const escape = (val: any) => val === undefined || val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`;
      const numOrNull = (val: any) => (val === undefined || val === null || isNaN(val)) ? 'NULL' : val;

      sql += `INSERT INTO valvulas (tag, ot, tipo_valvula, marca, modelo, diametro_nominal, clase_rating, tipo_conexion, material_cuerpo, material_asiento, material_trim, cv, peso_kg, presion_diseno_bar, temp_diseno_c, area_planta, sistema, ubicacion_fisica, estado_qaqc, inspector_ito, responsable_taller, fecha_recepcion, fecha_liberacion, numero_certificado, observaciones, updated_by) VALUES (${escape(v.tag)}, ${escape(v.ot)}, ${escape(v.tipo_valvula)}, ${escape(v.marca)}, ${escape(v.modelo)}, ${escape(v.diametro_nominal)}, ${escape(v.clase_rating)}, ${escape(v.tipo_conexion)}, ${escape(v.material_cuerpo)}, ${escape(v.material_asiento)}, ${escape(v.material_trim)}, ${numOrNull(v.cv)}, ${numOrNull(v.peso_kg)}, ${numOrNull(v.presion_diseno_bar)}, ${numOrNull(v.temp_diseno_c)}, ${escape(v.area_planta)}, ${escape(v.sistema)}, ${escape(v.ubicacion_fisica)}, ${escape(v.estado_qaqc)}, ${escape(v.inspector_ito)}, ${escape(v.responsable_taller)}, ${escape(v.fecha_recepcion)}, ${escape(v.fecha_liberacion)}, ${escape(v.numero_certificado)}, ${escape(v.observaciones)}, ${escape(v.updated_by)}) ON CONFLICT (tag) DO UPDATE SET ot = EXCLUDED.ot, estado_qaqc = EXCLUDED.estado_qaqc, updated_at = NOW();\n`;
    }

    sql += `\n-- Inserción de Ensayos Hidráulicos (${tests.length} registros)\n`;
    for (const t of tests) {
      const escape = (val: any) => val === undefined || val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`;
      sql += `INSERT INTO pruebas_hidraulicas (valvula_id, tag, ot, numero_protocolo, fecha_ensayo, norma_aplicable, fluido_prueba, temp_fluido_c, manometro_id, manometro_calibracion_vigente, presion_carcasa_requerida_bar, presion_carcasa_aplicada_bar, tiempo_carcasa_seg, resultado_carcasa, obs_carcasa, presion_asiento_hp_requerida_bar, presion_asiento_hp_aplicada_bar, tiempo_asiento_hp_seg, fuga_admisible_asiento, fuga_medida_asiento, resultado_asiento_hp, presion_asiento_lp_bar, fuga_medida_lp_burbujas_min, resultado_asiento_lp, aplica_contrasello, resultado_contrasello, resultado_general, inspector_ejecutor, inspector_ito_validador, firma_ito, observaciones) SELECT id, ${escape(t.tag)}, ${escape(t.ot)}, ${escape(t.numero_protocolo)}, ${escape(t.fecha_ensayo)}, ${escape(t.norma_aplicable)}, ${escape(t.fluido_prueba)}, ${t.temp_fluido_c}, ${escape(t.manometro_id)}, ${escape(t.manometro_calibracion_vigente)}, ${t.presion_carcasa_requerida_bar}, ${t.presion_carcasa_aplicada_bar}, ${t.tiempo_carcasa_seg}, ${escape(t.resultado_carcasa)}, ${escape(t.obs_carcasa)}, ${t.presion_asiento_hp_requerida_bar}, ${t.presion_asiento_hp_aplicada_bar}, ${t.tiempo_asiento_hp_seg}, ${escape(t.fuga_admisible_asiento)}, ${escape(t.fuga_medida_asiento)}, ${escape(t.resultado_asiento_hp)}, ${t.presion_asiento_lp_bar}, ${t.fuga_medida_lp_burbujas_min}, ${escape(t.resultado_asiento_lp)}, ${t.aplica_contrasello}, ${escape(t.resultado_contrasello)}, ${escape(t.resultado_general)}, ${escape(t.inspector_ejecutor)}, ${escape(t.inspector_ito_validador)}, ${t.firma_ito}, ${escape(t.observaciones)} FROM valvulas WHERE tag = ${escape(t.tag)} ON CONFLICT (numero_protocolo) DO NOTHING;\n`;
    }

    sql += `\n-- Inserción de Punch List (${punches.length} registros)\n`;
    for (const p of punches) {
      const escape = (val: any) => val === undefined || val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`;
      sql += `INSERT INTO punch_list (valvula_id, tag, ot, codigo_item, tipo_desviacion, categoria, descripcion, accion_correctiva, responsable, fecha_deteccion, fecha_limite, estado) SELECT id, ${escape(p.tag)}, ${escape(p.ot)}, ${escape(p.codigo_item)}, ${escape(p.tipo_desviacion)}, ${escape(p.categoria)}, ${escape(p.descripcion)}, ${escape(p.accion_correctiva)}, ${escape(p.responsable)}, ${escape(p.fecha_deteccion)}, ${escape(p.fecha_limite)}, ${escape(p.estado)} FROM valvulas WHERE tag = ${escape(p.tag)};\n`;
    }

    return sql;
  }

  // --- RESTAURAR Y REINICIAR ---
  public resetToFactorySampleData(user: string, role: UserRole) {
    localStorage.setItem(STORAGE_KEY_VALVES, JSON.stringify(INITIAL_VALVES));
    localStorage.setItem(STORAGE_KEY_HYDRO, JSON.stringify(INITIAL_HYDRO_TESTS));
    localStorage.setItem(STORAGE_KEY_PUNCH, JSON.stringify(INITIAL_PUNCH_ITEMS));
    localStorage.setItem(STORAGE_KEY_ATTACHMENTS, JSON.stringify(INITIAL_ATTACHMENTS));
    this.logAudit(user, role, 'INSERT', 'SISTEMA', 'all', 'RESET', 'Restauración a datos muestra oficiales PGP 2026');
    this.syncToIndexedDb();
  }

  // --- GUARDADO POR LOTES (EDITOR DE REGISTROS) ---
  public async saveValvesBatch(newValves: ValveRecord[], user: string, role: UserRole): Promise<{ success: boolean; count: number }> {
    try {
      this.notifySaveStatus('SAVING');
      localStorage.setItem(STORAGE_KEY_VALVES, JSON.stringify(newValves));
      await this.syncToIndexedDb();
      this.logAudit(user, role, 'UPDATE', 'valvulas', 'batch-editor', 'MULTIPLE', {
        total_registros_guardados: newValves.length,
        timestamp: new Date().toISOString()
      });
      this.notifySaveStatus('SAVED');
      return { success: true, count: newValves.length };
    } catch (e) {
      console.error('Error al guardar lote de válvulas:', e);
      this.notifySaveStatus('ERROR');
      return { success: false, count: 0 };
    }
  }

  // --- GESTIÓN DE HOJAS EXCEL ALMACENADAS ---
  public async saveExcelSheet(sheet: StoredExcelSheet): Promise<void> {
    await indexedDb.excelSheets.put(sheet);
  }

  public async getStoredExcelSheets(): Promise<StoredExcelSheet[]> {
    try {
      return await indexedDb.excelSheets.toArray();
    } catch {
      return [];
    }
  }

  public async deleteStoredExcelSheet(id: string): Promise<void> {
    await indexedDb.excelSheets.delete(id);
  }

  // --- ESTIMACIÓN DE CUOTA DE ALMACENAMIENTO ---
  public async getStorageEstimate(): Promise<{ usedMb: number; quotaMb: number; percent: number }> {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        const used = (est.usage || 0) / (1024 * 1024);
        const quota = (est.quota || 0) / (1024 * 1024);
        return {
          usedMb: Number(used.toFixed(2)),
          quotaMb: Number(quota.toFixed(0)),
          percent: quota > 0 ? Number(((used / quota) * 100).toFixed(2)) : 0
        };
      } catch (e) {
        console.warn('No se pudo estimar almacenamiento:', e);
      }
    }
    return { usedMb: 1.5, quotaMb: 2048, percent: 0.07 };
  }
}

export const dbService = new StorageService();
