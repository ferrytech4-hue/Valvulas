/**
 * Servicio Central de Auditoría y Trazabilidad de Válvulas
 * Sistema de Control de Calidad PGP 2026
 * 
 * Captura y persiste todas las operaciones de CRUD en válvulas:
 * - Creación (INSERT)
 * - Modificación (UPDATE) con comparación campo a campo (valores anteriores y nuevos)
 * - Eliminación (DELETE)
 * - Importación masiva (IMPORT)
 * - Restauración desde respaldo (RESTORE)
 */

import { ValveRecord } from '../types';

export interface FieldChange {
  campo: string;
  etiqueta: string;
  valorAnterior: any;
  valorNuevo: any;
}

export type AuditActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'RESTORE';

export interface ValveAuditEvent {
  id: string;
  timestamp: string;
  usuario: string;
  rol: string;
  accion: AuditActionType;
  valvulaId: string;
  tag: string;
  ot?: string;
  resumen: string;
  cambiosDetallados: FieldChange[];
  registroPrevio?: Partial<ValveRecord>;
  registroNuevo?: Partial<ValveRecord>;
}

const STORAGE_KEY_VALVE_AUDIT = 'pgp_valvulas_2026_audit_history';

// Mapeo amigable de nombres de campos técnicos para visualización clara
const FIELD_LABELS: Record<string, string> = {
  tag: 'TAG / Identificador',
  ot: 'Orden de Trabajo (OT)',
  sistema: 'Sistema / Área de Planta',
  subsistema: 'Subsistema / Línea',
  tipo_valvula: 'Tipo de Válvula',
  diametro_nominal: 'Diámetro Nominal (DN)',
  clase_rating: 'Clase / Rating Presión',
  tipo_conexion: 'Tipo de Conexión',
  marca: 'Fabricante / Marca',
  modelo: 'Modelo / Serie',
  numero_serie: 'N° de Serie de Fábrica',
  material_cuerpo: 'Material del Cuerpo',
  material_asiento: 'Material del Asiento',
  material_trim: 'Trim / Internos',
  tipo_accionamiento: 'Tipo de Accionamiento',
  presion_diseno: 'Presión de Diseño (CWP)',
  presion_prueba_shell: 'Presión Prueba Shell',
  presion_prueba_asiento: 'Presión Prueba Asiento',
  norma_aplicable: 'Norma Aplicable',
  fluido_servicio: 'Fluido de Servicio',
  estado_qaqc: 'Estado QA/QC',
  resultado_inspeccion: 'Resultado Inspección',
  responsable_taller: 'Responsable de Taller',
  inspector_ito: 'Inspector ITO',
  fecha_inspeccion: 'Fecha de Inspección',
  fecha_calibracion_manometro: 'Fecha Calibración Manómetro',
  observaciones: 'Observaciones / Notas',
  colada_cuerpo: 'N° Colada Cuerpo (MTR)',
  colada_bonete: 'N° Colada Bonete'
};

class AuditService {
  private events: ValveAuditEvent[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_VALVE_AUDIT);
      if (raw) {
        this.events = JSON.parse(raw);
      } else {
        this.events = [];
      }
    } catch (e) {
      console.error('Error cargando historial de auditoría de válvulas:', e);
      this.events = [];
    }
  }

  private saveToStorage() {
    try {
      // Guardar hasta los últimos 1000 eventos para optimizar rendimiento de memoria
      const trimmed = this.events.slice(0, 1000);
      localStorage.setItem(STORAGE_KEY_VALVE_AUDIT, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Error persistiendo historial de auditoría:', e);
    }
  }

  /**
   * Compara dos registros de válvulas y extrae la lista de cambios de campos
   */
  public diffValves(oldValve: ValveRecord, newValve: ValveRecord): FieldChange[] {
    const changes: FieldChange[] = [];
    const ignoredFields = new Set(['updated_at', 'updated_by', 'created_at']);

    const allKeys = Array.from(new Set([...Object.keys(oldValve), ...Object.keys(newValve)]));

    for (const key of allKeys) {
      if (ignoredFields.has(key)) continue;

      const oldVal = (oldValve as any)[key];
      const newVal = (newValve as any)[key];

      // Normalizar valores para comparación
      const strOld = oldVal === undefined || oldVal === null ? '' : String(oldVal).trim();
      const strNew = newVal === undefined || newVal === null ? '' : String(newVal).trim();

      if (strOld !== strNew) {
        changes.push({
          campo: key,
          etiqueta: FIELD_LABELS[key] || key.replace(/_/g, ' ').toUpperCase(),
          valorAnterior: oldVal ?? '—',
          valorNuevo: newVal ?? '—'
        });
      }
    }

    return changes;
  }

  /**
   * Registra la creación de una nueva válvula
   */
  public logCreate(valve: ValveRecord, usuario: string, rol: string): ValveAuditEvent {
    const event: ValveAuditEvent = {
      id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      usuario,
      rol,
      accion: 'CREATE',
      valvulaId: valve.id,
      tag: valve.tag,
      ot: valve.ot,
      resumen: `Creación inicial de la válvula "${valve.tag}" (OT: ${valve.ot || 'S/N'}, DN: ${valve.diametro_nominal || 'N/A'}, Rating: ${valve.clase_rating || 'N/A'})`,
      cambiosDetallados: Object.entries(valve)
        .filter(([k, v]) => v !== undefined && v !== null && v !== '' && !['id', 'created_at', 'updated_at'].includes(k))
        .map(([k, v]) => ({
          campo: k,
          etiqueta: FIELD_LABELS[k] || k,
          valorAnterior: '— (Registro nuevo)',
          valorNuevo: v
        })),
      registroNuevo: valve
    };

    this.events.unshift(event);
    this.saveToStorage();
    return event;
  }

  /**
   * Registra la actualización de una válvula existente comparando campo por campo
   */
  public logUpdate(oldValve: ValveRecord, newValve: ValveRecord, usuario: string, rol: string): ValveAuditEvent {
    const changes = this.diffValves(oldValve, newValve);
    const summaryParts = changes.map(c => `${c.etiqueta}: "${c.valorAnterior}" → "${c.valorNuevo}"`);
    const resumen = changes.length > 0
      ? `Modificación de ${changes.length} campo(s): ${summaryParts.slice(0, 3).join(', ')}${changes.length > 3 ? ` y ${changes.length - 3} más` : ''}`
      : `Actualización general sin cambios de especificación`;

    const event: ValveAuditEvent = {
      id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      usuario,
      rol,
      accion: 'UPDATE',
      valvulaId: newValve.id,
      tag: newValve.tag,
      ot: newValve.ot,
      resumen,
      cambiosDetallados: changes,
      registroPrevio: oldValve,
      registroNuevo: newValve
    };

    this.events.unshift(event);
    this.saveToStorage();
    return event;
  }

  /**
   * Registra la eliminación de una válvula
   */
  public logDelete(valve: ValveRecord, usuario: string, rol: string): ValveAuditEvent {
    const event: ValveAuditEvent = {
      id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      usuario,
      rol,
      accion: 'DELETE',
      valvulaId: valve.id,
      tag: valve.tag,
      ot: valve.ot,
      resumen: `Eliminación definitiva de la válvula "${valve.tag}" (OT: ${valve.ot || 'S/N'}) y sus registros asociados`,
      cambiosDetallados: [
        {
          campo: 'estado',
          etiqueta: 'Estado de Registro',
          valorAnterior: valve.estado_qaqc,
          valorNuevo: 'ELIMINADO'
        }
      ],
      registroPrevio: valve
    };

    this.events.unshift(event);
    this.saveToStorage();
    return event;
  }

  /**
   * Registra una importación masiva de válvulas desde Excel / CSV
   */
  public logImport(valves: ValveRecord[], fileName: string, usuario: string, rol: string): ValveAuditEvent {
    const event: ValveAuditEvent = {
      id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      usuario,
      rol,
      accion: 'IMPORT',
      valvulaId: 'batch-import',
      tag: `${valves.length} Válvulas`,
      resumen: `Importación masiva de ${valves.length} registros desde el archivo "${fileName}"`,
      cambiosDetallados: valves.slice(0, 10).map(v => ({
        campo: 'tag',
        etiqueta: v.tag,
        valorAnterior: '—',
        valorNuevo: `${v.tipo_valvula} ${v.diametro_nominal} ${v.clase_rating} (OT: ${v.ot})`
      }))
    };

    this.events.unshift(event);
    this.saveToStorage();
    return event;
  }

  /**
   * Obtiene el historial de auditoría filtrado para una válvula por ID o TAG
   */
  public getHistoryForValve(valveIdOrTag: string): ValveAuditEvent[] {
    const clean = valveIdOrTag.trim().toUpperCase();
    return this.events.filter(e => 
      e.valvulaId === valveIdOrTag || 
      e.tag.trim().toUpperCase() === clean
    );
  }

  /**
   * Obtiene todos los eventos de auditoría del sistema
   */
  public getAllHistory(): ValveAuditEvent[] {
    return [...this.events];
  }

  /**
   * Limpia el historial de auditoría (para mantenimiento administrativo)
   */
  public clearHistory(): void {
    this.events = [];
    localStorage.removeItem(STORAGE_KEY_VALVE_AUDIT);
  }
}

export const auditService = new AuditService();
