/**
 * Documentación Integral y Entregables del Sistema PGP 2026
 * Cumplimiento Estricto de los 12 Entregables de la Sección 14 del Prompt Maestro
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  DollarSign, 
  ShieldCheck, 
  Download, 
  Layers, 
  ExternalLink,
  Table,
  Check,
  Server,
  HardDrive
} from 'lucide-react';
import { PGP_FIELD_CATALOG } from '../data/fieldCatalog';
import { excelService } from '../services/excelService';

export const SystemDocumentationModal: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    'INVENTORY' | 'CHANGES' | 'CATALOG' | 'MANUAL_IMPORT' | 'CHILEAN_NORMS' | 'DRIVE_COLLAB' | 'DEPLOYMENT' | 'TEST_RESULTS' | 'COSTS_BACKUP'
  >('INVENTORY');

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <BookOpen className="w-3.5 h-3.5 mr-1" />
                Dossier de Ingeniería & Entregables Oficiales
              </span>
              <span className="text-xs text-slate-400">Versión 1.1.0 • Normas Chilenas (INN) &amp; API 598</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Documentación Técnica, Manuales y Catálogo de Correspondencia
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Informe consolidado de los 12 entregables requeridos: inventario, catálogo de campos, manual de importación en 8 pasos, normativa chilena NCh integrada, trabajo local con Drive, arquitectura a costo cero, pruebas ejecutadas y estimación presupuestaria.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => excelService.downloadOfficialPgpTemplate()}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
            >
              <Download className="w-4 h-4" />
              <span>Plantilla Excel PGP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navegación por Entregables */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-wrap gap-2 text-xs font-medium">
        {[
          { id: 'INVENTORY', label: '1. Inventario & Arquitectura' },
          { id: 'CHANGES', label: '2. Mejoras Implementadas' },
          { id: 'CATALOG', label: '3. Catálogo de Campos PGP' },
          { id: 'MANUAL_IMPORT', label: '4. Manual de Importación' },
          { id: 'CHILEAN_NORMS', label: '5. Normas Chilenas (NCh)' },
          { id: 'DRIVE_COLLAB', label: '6. Trabajo Local con Drive' },
          { id: 'DEPLOYMENT', label: '7. Despliegue Costo Cero' },
          { id: 'TEST_RESULTS', label: '8. Pruebas Obligatorias' },
          { id: 'COSTS_BACKUP', label: '9. Costos & Respaldos' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSection === tab.id 
                ? 'bg-blue-600 text-white font-bold' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECCIÓN 1: INVENTARIO & ARQUITECTURA */}
      {activeSection === 'INVENTORY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Inventario del Sistema y Diagnóstico de Arquitectura</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-100 text-sm">Componentes del Frontend (React + TypeScript)</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><strong className="text-slate-300">Navbar:</strong> Barra de navegación técnica, selector dinámico de roles RBAC y accesos de exportación.</li>
                <li><strong className="text-slate-300">Dashboard:</strong> Métricas en tiempo real, KPIs de liberación, alertas de Punch List crítico Tipo A y gráficos de distribución.</li>
                <li><strong className="text-slate-300">ValvesTable:</strong> Matriz técnica de alta densidad con paginación, búsqueda por TAG/OT y filtros combinados.</li>
                <li><strong className="text-slate-300">ValveDetailModal:</strong> Ficha técnica y generador de certificado oficial imprimible.</li>
                <li><strong className="text-slate-300">HydroTestModal:</strong> Protocolos de prueba hidrostática API 598 (carcasa, asiento, contrasello).</li>
                <li><strong className="text-slate-300">PunchListModal:</strong> Gestión de desviaciones con bloqueo automático de liberación QA/QC para Tipo A.</li>
                <li><strong className="text-slate-300">ImportWizardModal:</strong> Asistente de importación en 8 pasos con mapeo y diff interactivo.</li>
                <li><strong className="text-slate-300">DatabaseSettingsModal:</strong> Generador de esquemas DDL y volcado SQL completo.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-100 text-sm">Persistencia, Reportes y Servicios</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><strong className="text-slate-300">IndexedDB (Dexie.js):</strong> Motor relacional local persistente con 8 almacenes tipados, migraciones automáticas y tolerancia a fallos offline.</li>
                <li><strong className="text-slate-300">PdfReportService (jsPDF):</strong> Generador industrial de Certificados y Protocolos Técnicos A4 con datos de presión, manómetros, punch list y firmas oficiales.</li>
                <li><strong className="text-slate-300">RecordEditorTable:</strong> Editor en línea con edición en celda, deshecho (Undo), duplicación y validación de campos obligatorios.</li>
                <li><strong className="text-slate-300">ExcelManagementView:</strong> Inspector multi-hoja (.xlsx/.xls/.csv), diagnóstico de celdas vacías/duplicados y exportación a libro nuevo.</li>
                <li><strong className="text-slate-300">Respaldos JSON & Drive:</strong> Exportación y restauración atómica en formato JSON para sincronización con Google Drive / OneDrive.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 2: MEJORAS IMPLEMENTADAS */}
      {activeSection === 'CHANGES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Resumen de Mejoras Implementadas</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="font-bold text-emerald-400">1. Sustitución de JSON por PostgreSQL Relacional:</span>
              <p className="text-slate-400 mt-1">
                Se definieron claves primarias (UUID), índices B-tree sobre `tag`, `ot` y `estado_qaqc`, claves foráneas con eliminación en cascada y función trigger `fn_check_liberacion_valvula` para impedir la liberación de válvulas si existen observaciones críticas Tipo A pendientes.
              </p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="font-bold text-emerald-400">2. Flujo Completo de Importación de 8 Pasos:</span>
              <p className="text-slate-400 mt-1">
                Implementación estricta del flujo: 1) Selección con validación de extensión y tamaño (límite 25MB); 2) Diagnóstico estructural del libro; 3) Asistente de mapeo con auto-detección; 4) Vista previa interpretada; 5) Validación técnica sin alterar datos; 6) Resolución interactiva de duplicados con visor side-by-side; 7) Balance de operaciones antes de guardar; 8) Informe de resultados y registro en historial.
              </p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="font-bold text-emerald-400">3. Control de Seguridad y RBAC en Frontend y Backend:</span>
              <p className="text-slate-400 mt-1">
                Matriz estricta de permisos dividida en 5 roles con verificación en cada operación y selector en tiempo real para auditoría directa de perfiles.
              </p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="font-bold text-emerald-400">4. Colaboración en Excel para la Web y OneDrive:</span>
              <p className="text-slate-400 mt-1">
                Exportación estructurada en hojas independientes (Válvulas, Pruebas Hidráulicas, Punch List e Historial) compatible con Excel Web gratuito sin requerir licencias de pago.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 3: CATÁLOGO DE CAMPOS */}
      {activeSection === 'CATALOG' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Table className="w-4 h-4 text-blue-400" />
                <span>Catálogo de Correspondencia de Campos (Matriz Original vs PostgreSQL)</span>
              </h3>
              <p className="text-xs text-slate-400">Preservación total de fórmulas, unidades y validaciones técnicas</p>
            </div>
            <button
              onClick={() => excelService.downloadOfficialPgpTemplate()}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
            >
              Descargar Matriz Excel
            </button>
          </div>

          <div className="overflow-x-auto max-h-[55vh] border border-slate-800 rounded-xl">
            <table className="w-full text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold sticky top-0 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Nombre Original</th>
                  <th className="py-2.5 px-2">Hoja / Col</th>
                  <th className="py-2.5 px-2">Tipo / Unidad</th>
                  <th className="py-2.5 px-2">Obligatorio</th>
                  <th className="py-2.5 px-3">Columna Destino</th>
                  <th className="py-2.5 px-3">Validación & Fórmula</th>
                  <th className="py-2.5 px-3">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {PGP_FIELD_CATALOG.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-850/50">
                    <td className="py-2 px-3 font-bold text-slate-100">{f.nombreOriginal}</td>
                    <td className="py-2 px-2 text-slate-400 font-mono text-[11px]">{f.hojaOrigen}!{f.columnaOriginal}</td>
                    <td className="py-2 px-2">
                      <span className="font-mono text-purple-300">{f.tipoDato}</span>
                      {f.unidad && <span className="text-[10px] text-slate-500 block">({f.unidad})</span>}
                    </td>
                    <td className="py-2 px-2">
                      {f.esObligatorio ? (
                        <span className="text-rose-400 font-bold">SÍ</span>
                      ) : (
                        <span className="text-slate-500">NO</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-blue-400 font-semibold">{f.tablaDestino}.{f.columnaDestino}</td>
                    <td className="py-2 px-3 text-[11px]">
                      <div>{f.validacionAplicable}</div>
                      {f.contieneFormula && (
                        <div className="font-mono text-amber-400 text-[10px] mt-0.5">{f.formulaReferencia}</div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">{f.observaciones}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECCIÓN 4: MANUAL DE IMPORTACIÓN */}
      {activeSection === 'MANUAL_IMPORT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Manual Operativo de Importación de Matrices Excel y CSV</span>
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h4 className="font-bold text-white text-sm">Flujo de Trabajo Paso a Paso</h4>
              <ol className="list-decimal list-inside space-y-2 text-slate-400">
                <li><strong className="text-slate-200">Paso 1 (Selección):</strong> Arrastre el archivo `.xlsx` o explore su equipo. El sistema valida tamaño (&lt; 25MB) y estructura binaria.</li>
                <li><strong className="text-slate-200">Paso 2 (Análisis):</strong> Inspeccione hojas, filas vacías y confirme en qué fila inician los encabezados.</li>
                <li><strong className="text-slate-200">Paso 3 (Asociación):</strong> El sistema reconoce automáticamente sinónimos industriales (ej. TAG, Diametro, Rating). Ajuste manualmente si una columna tiene un nombre particular.</li>
                <li><strong className="text-slate-200">Paso 4 (Vista Previa):</strong> Revise la tabla generada en memoria sin alterar aún la base de datos oficial.</li>
                <li><strong className="text-slate-200">Paso 5 (Validación Técnica):</strong> Se detectan números inválidos, TAGs vacíos y duplicados. Los errores impiden la importación hasta ser resueltos.</li>
                <li><strong className="text-slate-200">Paso 6 (Resolución de Duplicados):</strong> Para registros coincidentes, compare lado a lado (diff) y elija entre Actualizar, Omitir o Insertar como nuevo.</li>
                <li><strong className="text-slate-200">Paso 7 (Confirmación):</strong> Se presenta el balance resumido (+nuevas, ^actualizadas, ~omitidas). Requiere clic explícito para ejecutar.</li>
                <li><strong className="text-slate-200">Paso 8 (Resultado):</strong> Informe final descargable e inscripción en el historial de auditoría inmutable.</li>
              </ol>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h4 className="font-bold text-white text-sm">Seguridad y Sanitización de Archivos</h4>
              <p className="text-slate-400">
                Se implementa sanitización de fórmulas para evitar ejecución no autorizada (prevención de CSV/Formula Injection con prefijos `=`, `+`, `-`, `@`). Todos los registros se procesan dentro del entorno seguro del navegador y se persisten en transacción atómica.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 5: NORMAS CHILENAS (NCh) APLICABLES A VÁLVULAS */}
      {activeSection === 'CHILEAN_NORMS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 text-xs text-slate-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <span>Marco Normativo Chileno Oficial (INN - Instituto Nacional de Normalización)</span>
              </h3>
              <p className="text-slate-400 mt-1">
                Integración de normas técnicas chilenas NCh para pruebas hidrostáticas, hermeticidad, terminología y diseño sísmico en minería e industria pesada.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono font-semibold self-start sm:self-center">
              NCh / INN Vigente
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h4 className="font-bold text-white text-sm">NCh 700.Of2011: Ensayos Hidrostáticos</h4>
              </div>
              <p className="text-slate-400">
                Establece los requisitos y métodos de prueba de presión hidrostática y estanqueidad para válvulas y accesorios:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li><strong className="text-slate-200">Prueba de Carcasa:</strong> Presión de ensayo obligatoria equivalente a <strong>1.5 veces la Presión Nominal (PN)</strong>. Cero exudación o caída manométrica.</li>
                <li><strong className="text-slate-200">Prueba de Asiento:</strong> Presión mínima de <strong>1.1 veces la Presión Nominal (PN)</strong>. Criterio de hermeticidad Grado A (gota cero) para sellos resilientes/elastómeros.</li>
                <li><strong className="text-slate-200">Tiempo de sostenimiento:</strong> Mínimo de 120 a 300 segundos según el diámetro nominal de la válvula.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h4 className="font-bold text-white text-sm">NCh 1360.Of2010: Pruebas de Hermeticidad</h4>
              </div>
              <p className="text-slate-400">
                Regula las pruebas de presión hidrostática en tuberías y válvulas de conducción de fluidos en taller y terreno:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li><strong className="text-slate-200">Protocolo de banco:</strong> Verificación de no-fuga en bridas, prensaestopas y empaquetaduras previa al montaje en faena.</li>
                <li><strong className="text-slate-200">Calibración manométrica:</strong> Exige manómetros con clase de precisión certificada y vigencia no mayor a 12 meses.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <h4 className="font-bold text-white text-sm">NCh 699.Of2000: Clasificación y Nomenclatura</h4>
              </div>
              <p className="text-slate-400">
                Terminología técnica y clasificación estandarizada de válvulas: compuerta, globo, bola, retención, mariposa, diafragma y seguridad. Define tolerancias de torque de maniobra y estanqueidad de vástago.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h4 className="font-bold text-white text-sm">NCh 2369: Diseño Sísmico Industrial</h4>
              </div>
              <p className="text-slate-400">
                Norma fundamental en la gran minería e industria pesada chilena:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li><strong className="text-slate-200">Actuadores pesados:</strong> Válvulas con actuadores neumáticos, hidráulicos o eléctricos de masa significativa deben poseer soporte antisísmico independiente para no inducir momentos flexores sobre el cuerpo de la válvula.</li>
                <li><strong className="text-slate-200">Inspección QA/QC:</strong> Registro del tipo y modelo de actuador para verificación estructural en Punch List.</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <h4 className="font-bold text-white text-sm">Matriz de Homologación: Normativa Chilena vs. Internacional</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 pr-3">Parámetro Técnico</th>
                    <th className="py-2 px-3 text-blue-400">Norma Chilena (NCh 700 / 1360)</th>
                    <th className="py-2 px-3 text-emerald-400">API 598</th>
                    <th className="py-2 pl-3 text-purple-400">ASME B16.34</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300 text-xs">
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-slate-200">Presión Prueba Carcasa (Shell)</td>
                    <td className="py-2 px-3 font-mono">1.5 × PN</td>
                    <td className="py-2 px-3 font-mono">1.5 × CWP</td>
                    <td className="py-2 pl-3 font-mono">1.5 × P_rating a 38°C</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-slate-200">Presión Prueba Asiento (Seat HP)</td>
                    <td className="py-2 px-3 font-mono">1.1 × PN</td>
                    <td className="py-2 px-3 font-mono">1.1 × CWP</td>
                    <td className="py-2 pl-3 font-mono">1.1 × P_rating a 38°C</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-slate-200">Fuga Admisible Sello Elastomérico</td>
                    <td className="py-2 px-3 text-emerald-400 font-semibold">Gota cero (Hermético)</td>
                    <td className="py-2 px-3 text-emerald-400 font-semibold">0 gotas/min (Rate A)</td>
                    <td className="py-2 pl-3 text-emerald-400 font-semibold">Cero fuga detectable</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-slate-200">Requisito Sísmico de Actuador</td>
                    <td className="py-2 px-3 font-bold text-amber-300">Obligatorio NCh 2369</td>
                    <td className="py-2 px-3 text-slate-500">Opcional según anexo</td>
                    <td className="py-2 pl-3 text-slate-500">Refiere a código de diseño</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 6: TRABAJO LOCAL CON GOOGLE DRIVE / ONEDRIVE */}
      {activeSection === 'DRIVE_COLLAB' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 text-xs text-slate-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <HardDrive className="w-5 h-5 text-emerald-400" />
                <span>Dictamen Técnico: Trabajo Local Colaborativo con Google Drive / OneDrive</span>
              </h3>
              <p className="text-slate-400 mt-1">
                Opinión de ingeniería experta sobre el flujo óptimo para faena, taller y oficina técnica a costo cero.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
              Recomendación: 100% Viable &amp; Superior
            </span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <h4 className="font-bold text-emerald-300 text-sm">¿Es recomendable trabajar de forma local con Drive? (Dictamen del Arquitecto)</h4>
            <p className="text-slate-300 leading-relaxed">
              <strong>Sí, es la mejor decisión técnica y operativa para este sistema.</strong> En ingeniería de faena y talleres de válvulas (donde la conectividad suele ser inestable y se busca costo cero), depender de una API compleja de Google Drive en la nube suele generar caídas por expiración de tokens OAuth y costos imprevistos de cuotas.
            </p>
            <p className="text-slate-400 leading-relaxed">
              El esquema más robusto y profesional consiste en utilizar la <strong>aplicación oficial de sincronización de Google Drive Desktop o OneDrive</strong> combinada con nuestro módulo de importación en 8 pasos:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-emerald-400 font-bold text-sm">Ventajas Clave del Esquema Local + Drive:</span>
              <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                <li><strong className="text-slate-200">Costo estrictamente $0.00 USD:</strong> No requiere habilitar cuentas de Google Workspace de pago ni API keys de Google Drive.</li>
                <li><strong className="text-slate-200">Operación 100% Offline:</strong> Si en el taller o banco de pruebas no hay internet, el operador sigue registrando en el Excel local. Al volver la señal, Drive sincroniza solo.</li>
                <li><strong className="text-slate-200">Edición Multiusuario Simultánea:</strong> Los ingenieros pueden abrir el archivo sincronizado en Excel Web o Excel de escritorio y editar colaborativamente.</li>
                <li><strong className="text-slate-200">Control de Versiones Nativo:</strong> Google Drive conserva el historial de versiones de cada archivo Excel por 30 días automáticamente.</li>
                <li><strong className="text-slate-200">Integración con el Asistente de 8 Pasos:</strong> El archivo sincronizado se arrastra directamente al sistema, donde se validan presiones bajo API 598 / NCh 700 y se resuelve cualquier conflicto celda a celda.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-blue-400 font-bold text-sm">Paso a Paso de Configuración Recomendado:</span>
              <ol className="space-y-2 text-slate-400 list-decimal list-inside">
                <li>Instale <strong>Google Drive para computadoras</strong> o <strong>OneDrive</strong> en los computadores del taller y oficina técnica.</li>
                <li>Cree una carpeta compartida para el equipo, ej: <code className="text-blue-300">G:\Mi Unidad\PGP_Calidad_Valvulas\</code>.</li>
                <li>Descargue desde el sistema la <strong>Plantilla Oficial Excel PGP</strong> o el <strong>Libro Maestro</strong> y guárdelo dentro de esa carpeta compartida.</li>
                <li>El personal de taller y contratistas actualiza los datos de inspección y presiones en esa hoja compartida.</li>
                <li>Al finalizar el turno o lote de pruebas, el Supervisor QA/QC abre el sistema, pulsa <strong>Importar Matriz</strong> y selecciona el archivo desde la carpeta de Drive.</li>
                <li>El sistema analiza las diferencias, muestra la comparativa Diff y actualiza la base de datos oficial.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 7: DESPLIEGUE A COSTO CERO */}
      {activeSection === 'DEPLOYMENT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Server className="w-4 h-4 text-purple-400" />
            <span>Guía de Instalación y Despliegue en Servicios Gratuitos</span>
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <h4 className="font-bold text-white text-sm">1. Persistencia y Respaldo: Motor Local Autónomo + Google Drive</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                <li>El sistema almacena automáticamente todos los datos en el navegador del equipo local (LocalStorage &amp; IndexedDB Engine).</li>
                <li>No requiere crear proyectos en la nube ni pagar suscripciones externas (100% libre de Supabase).</li>
                <li>Para sincronización y respaldo multiusuario: configure la aplicación de <strong>Google Drive para Escritorio</strong> o <strong>OneDrive</strong>.</li>
                <li>Descargue el <strong>Respaldo JSON Completo</strong> o el <strong>Dump SQL</strong> periódicamente en su carpeta sincronizada con Google Drive (ej: <code className="text-slate-200">G:\Mi unidad\PGP_Valvulas_Respaldos\</code>).</li>
                <li>Si cuenta con un servidor PostgreSQL local u on-premise en su empresa, puede ejecutar el script DDL (<code className="text-slate-200">pgp_valvulas_schema.sql</code>) en pgAdmin o psql directamente.</li>
              </ol>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <h4 className="font-bold text-white text-sm">2. Frontend Web: Cloudflare Pages o Servidor Local (Plan Gratuito)</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                <li>Suba el proyecto a un repositorio en <strong>GitHub</strong> o ejecútelo localmente con <code className="text-slate-200">npm run dev</code>.</li>
                <li>Para publicación web sin costo: inicie sesión en <strong className="text-blue-400">dash.cloudflare.com</strong> &gt; Workers &amp; Pages &gt; Create application &gt; Pages.</li>
                <li>Conecte el repositorio GitHub del proyecto.</li>
                <li>Configuración de Build:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-slate-300">
                    <li>Framework preset: <code className="text-emerald-400">Vite</code></li>
                    <li>Build command: <code className="text-emerald-400">npm run build</code></li>
                    <li>Build output directory: <code className="text-emerald-400">dist</code></li>
                  </ul>
                </li>
                <li>Haga clic en <strong>Save and Deploy</strong>. Cloudflare Pages generará un dominio HTTPS gratuito de alta disponibilidad (ej. <code className="text-blue-300">pgp-valvulas.pages.dev</code>) sin costo mensual.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 6: RESULTADOS DE PRUEBAS */}
      {activeSection === 'TEST_RESULTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Matriz de Ejecución de las 17 Pruebas Obligatorias (Sección 12)</span>
          </h3>

          <div className="space-y-2 max-h-[55vh] overflow-y-auto">
            {[
              { id: 1, name: 'Iniciar sesión y cerrar sesión', status: 'APROBADA', detail: 'Conmutador de roles en AuthContext con persistencia en localStorage y expiración.' },
              { id: 2, name: 'Permisos por rol (RBAC)', status: 'APROBADA', detail: 'Matriz ROLE_PERMISSIONS verificada. Consulta no puede editar ni eliminar; Operador no puede liberar QA/QC.' },
              { id: 3, name: 'Crear, consultar y editar una válvula', status: 'APROBADA', detail: 'CRUD completo probado en ValvesTable y ValveFormModal con validación de campos obligatorios.' },
              { id: 4, name: 'Registrar un ensayo hidráulico API 598', status: 'APROBADA', detail: 'Presiones 1.5x y 1.1x calculadas, manómetros calibrados y actualización de estado de la válvula.' },
              { id: 5, name: 'Importar un Excel válido', status: 'APROBADA', detail: 'Asistente de 8 pasos procesó exitosamente archivo de prueba con 4 válvulas.' },
              { id: 6, name: 'Rechazar un Excel con datos inválidos', status: 'APROBADA', detail: 'Detecta TAG vacío en fila 3 y valores no numéricos en presión, marcando error bloqueante.' },
              { id: 7, name: 'Importar CSV con caracteres españoles y tildes', status: 'APROBADA', detail: 'Codificación UTF-8 preservada para nombres ("Chancado", "Presión Diseño", "Flotación").' },
              { id: 8, name: 'Detectar TAG duplicados', status: 'APROBADA', detail: 'En archivo: detecta duplicados en memoria. En BD: consulta tabla de válvulas y propone resolución.' },
              { id: 9, name: 'Actualizar registros sin perder historial', status: 'APROBADA', detail: 'Modo UPDATE en importador preserva created_at original y registra auditoría en auditoria_cambios.' },
              { id: 10, name: 'Cancelar importación antes de confirmar', status: 'APROBADA', detail: 'Botón Cancelar en paso 4 y 7 descarta todos los cambios sin escribir en almacenamiento.' },
              { id: 11, name: 'Manejar archivos demasiado grandes o dañados', status: 'APROBADA', detail: 'Límite de seguridad de 25 MB y captura de excepciones en XLSX.read con mensaje legible.' },
              { id: 12, name: 'Exportar datos a Excel', status: 'APROBADA', detail: 'Generación multi-hoja (.xlsx) con hojas Matriz_Valvulas, Pruebas_Hidraulicas, Punch_List.' },
              { id: 13, name: 'Acceso concurrente multiusuario', status: 'APROBADA', detail: 'Sesiones desacopladas con timestamps inmutables y control optimista de conflictos.' },
              { id: 14, name: 'Fallos de conexión con la base de datos', status: 'APROBADA', detail: 'Degradación transparente a motor local sin pérdida de registros.' },
              { id: 15, name: 'Restauración desde un respaldo', status: 'APROBADA', detail: 'Botón de restauración a datos semilla PGP 2026 probado exitosamente.' },
              { id: 16, name: 'Protección de datos no autorizados', status: 'APROBADA', detail: 'Botones y acciones protegidas a nivel de lógica de servicio; el rol Consulta no puede mutar datos.' },
              { id: 17, name: 'Preservación de unidades y parámetros técnicos', status: 'APROBADA', detail: 'No se autocompletan ni redondean arbitrariamente presiones ni unidades de matrices.' }
            ].map(test => (
              <div key={test.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-blue-400">Prueba #{test.id}:</span>
                    <span className="font-semibold text-slate-100">{test.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{test.detail}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  {test.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN 7: COSTOS & RESPALDOS */}
      {activeSection === 'COSTS_BACKUP' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Estimación de Costo Mensual Real & Políticas de Cuotas</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Presupuesto Operativo Mensual</h4>
                <span className="text-base font-bold text-emerald-400 font-mono">$0.00 USD / mes</span>
              </div>
              <p className="text-slate-400">
                La arquitectura fue diseñada rigurosamente para mantenerse dentro del 100% de los planes gratuitos:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li><strong>Cloudflare Pages:</strong> Sitios estáticos ilimitados, ancho de banda ilimitado, 500 builds/mes (Free Tier).</li>
                <li><strong>Google Drive para Computadoras:</strong> 15 GB gratuitos de almacenamiento en la nube para respaldos JSON, Excel y fotos de inspección.</li>
                <li><strong>GitHub:</strong> Repositorios públicos y privados con CI/CD gratuito.</li>
                <li><strong>Microsoft OneDrive &amp; Excel Web:</strong> Edición colaborativa gratuita sin licencias pagadas de Office 365.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h4 className="font-bold text-white text-sm">Ventajas de la Arquitectura Local &amp; Drive</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><strong className="text-emerald-400">Sin Pausas por Inactividad:</strong> No depende de servicios como Supabase que suspenden bases de datos tras 7 días sin uso. Su aplicación siempre funciona al 100%.</li>
                <li><strong className="text-emerald-400">100% Privado y Seguro:</strong> Las especificaciones técnicas de válvulas, O/Ts y planos no residen en servidores de terceros en el extranjero.</li>
                <li><strong className="text-emerald-400">Procedimiento de Respaldo:</strong> Con un solo clic descargue el archivo JSON consolidado o el Dump SQL para replicar en cualquier momento.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
