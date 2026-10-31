/**
 * IndexedDB Database Layer using Dexie.js
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 * 
 * Almacenamiento local persistente de alta confiabilidad en el navegador.
 * Soporta modo offline completo, transacciones atómicas y migraciones de esquema.
 */

import Dexie, { Table } from 'dexie';
import { 
  ValveRecord, 
  HydroTestRecord, 
  PunchItemRecord, 
  AttachmentRecord, 
  ImportHistoryRecord, 
  AuditLogRecord 
} from '../types';

export interface StoredExcelSheet {
  id: string;
  fileId: string;
  fileName: string;
  sheetName: string;
  totalRows: number;
  totalCols: number;
  headers: string[];
  data: Record<string, any>[];
  uploadedAt: string;
}

export interface AppLocalConfig {
  id: string;
  autoSave: boolean;
  saveIntervalSeconds: number;
  lastBackupAt?: string;
  activeProfile: string;
  organizationName: string;
  storageQuotaBytes?: number;
  usedBytes?: number;
}

export class PgpValvulasDatabase extends Dexie {
  valves!: Table<ValveRecord, string>;
  hydroTests!: Table<HydroTestRecord, string>;
  punchList!: Table<PunchItemRecord, string>;
  attachments!: Table<AttachmentRecord, string>;
  importHistory!: Table<ImportHistoryRecord, string>;
  auditLogs!: Table<AuditLogRecord, string>;
  excelSheets!: Table<StoredExcelSheet, string>;
  appConfig!: Table<AppLocalConfig, string>;

  constructor() {
    super('PGP_Valvulas_2026_IndexedDB');

    // Esquema de versionado para IndexedDB
    this.version(1).stores({
      valves: 'id, tag, ot, estado_qaqc, tipo_valvula, area_planta, updated_at',
      hydroTests: 'id, valvula_id, tag, ot, numero_protocolo, fecha_ensayo, resultado_general',
      punchList: 'id, valvula_id, tag, ot, codigo_item, tipo_desviacion, estado',
      attachments: 'id, tag, entidad_tipo, entidad_id, fecha_subida',
      importHistory: 'id, fecha_importacion, nombre_archivo',
      auditLogs: 'id, timestamp, tag, usuario, entidad, accion',
      excelSheets: 'id, fileId, fileName, sheetName, uploadedAt',
      appConfig: 'id'
    });
  }
}

export const indexedDb = new PgpValvulasDatabase();
