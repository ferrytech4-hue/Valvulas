/**
 * Página de Inicio y Tutorial Completo del Sistema
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  FileSpreadsheet, 
  Gauge, 
  AlertTriangle, 
  Database, 
  BookOpen, 
  Download, 
  CheckCircle2, 
  ArrowRight, 
  Edit3, 
  FileText, 
  Cpu, 
  HardDrive, 
  Lock, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ClipboardList,
  Flame,
  HelpCircle,
  Calculator,
  LifeBuoy,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import { ValveRecord, HydroTestRecord, PunchItemRecord } from '../types';
import { ActiveTab } from './Navbar';
import { excelService } from '../services/excelService';

interface HomeTutorialViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  valves: ValveRecord[];
  hydroTests: HydroTestRecord[];
  punchItems: PunchItemRecord[];
  onOpenImport?: () => void;
}

export const HomeTutorialView: React.FC<HomeTutorialViewProps> = ({
  setActiveTab,
  valves,
  hydroTests,
  punchItems,
  onOpenImport
}) => {
  // Pestaña activa del tutorial guiado
  const [activeModule, setActiveModule] = useState<number>(1);
  // Estado de FAQs desplegadas
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Estadísticas operacionales en vivo
  const totalValves = valves.length;
  const releasedValves = valves.filter(v => v.estado_qaqc === 'LIBERADA_QAQC' || v.estado_qaqc === 'APROBADA_ITO').length;
  const approvedHydro = hydroTests.filter(h => h.resultado_general === 'APROBADO').length;
  const openPunchItems = punchItems.filter(p => p.estado !== 'CERRADA').length;
  const criticalPunchItems = punchItems.filter(p => p.estado !== 'CERRADA' && p.tipo_desviacion === 'TIPO_A_CRITICO').length;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const tutorialModules = [
    {
      id: 1,
      title: 'Gestión e Importación de Archivos Excel (.xlsx, .xls, .csv)',
      badge: 'Multi-hoja & Diagnóstico',
      icon: <FileSpreadsheet className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/30 bg-emerald-500/5',
      summary: 'Sube tus archivos de cubicación de faena, detecta todas las hojas automáticamente y valida inconsistencias antes de importar.',
      steps: [
        'Accede al módulo "Gestión de Archivos Excel" desde la barra superior o arrastra un archivo al área punteada.',
        'El sistema analiza la estructura del libro y detecta todas las hojas disponibles (ej. "Listado Rev.6", "Tabla PH Rev.1").',
        'Visualiza el resumen previo: filas detectadas, celdas vacías, posibles registros duplicados y tipos de datos.',
        'Confirma la importación. Los registros se asocian a identificadores estables sin destruir tus datos locales existentes.'
      ],
      targetTab: 'excel_management' as ActiveTab,
      actionText: 'Ir a Gestión de Archivos Excel'
    },
    {
      id: 2,
      title: 'Matriz Oficial de Válvulas & Filtros Avanzados',
      badge: 'Búsqueda & Modales Técnicos',
      icon: <Layers className="w-5 h-5 text-sky-400" />,
      color: 'border-sky-500/30 bg-sky-500/5',
      summary: 'Administra y audita la base de datos de válvulas mediante filtros avanzados de estado de prueba, clase de presión y tipo constructivo.',
      steps: [
        'Utiliza la barra de filtros avanzados para segmentar por Estado QA/QC (Liberada, Aprobada ITO, En Pruebas, etc.).',
        'Filtra por Clase de Presión / Rating (150#, 300#, 600#, etc.) y Tipo de Válvula con etiquetas dinámicas de filtros aplicados.',
        'Abre la ficha técnica individual con doble clic o botón de inspección para ver o actualizar especificaciones.',
        'Registra nuevas válvulas o edita campos críticos mediante formularios validados con control de roles RBAC.',
        'Exporta la matriz completa o registros filtrados a formato Excel limpio en cualquier momento.'
      ],
      targetTab: 'valves' as ActiveTab,
      actionText: 'Abrir Matriz de Válvulas'
    },
    {
      id: 3,
      title: 'Ensayos Hidráulicos & Normas Técnicas (API 598, ISO 5208, NCh)',
      badge: 'Shell & Seat Tests',
      icon: <CheckCircle2 className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/30 bg-blue-500/5',
      summary: 'Calcula y registra las presiones de prueba hidrostática y neumática conforme a estándares internacionales y normativas chilenas.',
      steps: [
        'Selecciona una válvula desde la Matriz o Pruebas Hidráulicas para abrir su protocolo.',
        'Ensayo de Cuerpo (Shell Test): Calculado a 1.5× la Presión de Diseño (CWP). Tiempos según diámetro nominal.',
        'Ensayo de Asiento de Alta Presión: Calculado a 1.1× CWP con agua desmineralizada inhibida.',
        'Ensayo de Asiento de Baja Presión: Aire comprimido o nitrógeno a 80-100 psi.',
        'Registra manómetros calibrados, lecturas iniciales/finales, fecha de ensayo y firma de inspección.'
      ],
      targetTab: 'hydro' as ActiveTab,
      actionText: 'Ir a Pruebas Hidráulicas'
    },
    {
      id: 4,
      title: 'Generación de Certificados PDF y Dossier Consolidado Mensual',
      badge: 'Reportes Oficiales jsPDF',
      icon: <FileText className="w-5 h-5 text-indigo-400" />,
      color: 'border-indigo-500/30 bg-indigo-500/5',
      summary: 'Descarga con un solo clic certificados técnicos individuales en formato A4 o un dossier mensual consolidado completo para entrega a ITO y mandante.',
      steps: [
        'En la Matriz de Válvulas o en el Detalle, pulsa el botón "PDF Certificado" para generar el informe oficial individual.',
        'El certificado incluye datos de placa, presiones aplicadas, tolerancias de fuga, dictamen y recuadros de firmas (Inspector ITO y Revisor QA/QC).',
        'En la pestaña "Pruebas Hidráulicas", utiliza el panel "Dossier Consolidado Mensual".',
        'Selecciona el mes de interés y pulsa "Descargar Dossier Completo (PDF)" para obtener el compilado técnico con portada ejecutiva y tabla consolidada.'
      ],
      targetTab: 'hydro' as ActiveTab,
      actionText: 'Ver Panel de Dossier Mensual'
    },
    {
      id: 5,
      title: 'Gestión de Punch List y Bloqueo de Liberación QA/QC',
      badge: 'Gating de Calidad Estricto',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/30 bg-amber-500/5',
      summary: 'Control riguroso de observaciones en taller y faena. Las no conformidades críticas impiden la liberación de la válvula hasta su subsanación.',
      steps: [
        'Clasificación por severidad: Tipo A (Crítico - Bloquea Liberación), Tipo B (Mayor) y Tipo C (Menor/Cosmético).',
        'Regla de Calidad: Una válvula con Punch List Tipo A abierto NUNCA puede ser marcada como "Liberada QA/QC".',
        'Registra evidencias fotográficas, fechas de levantamiento y responsable de la corrección.',
        'El Inspector ITO o Revisor QA/QC verifica en terreno y cierra la observación para desbloquear la liberación.'
      ],
      targetTab: 'punch' as ActiveTab,
      actionText: 'Ir a Módulo Punch List'
    },
    {
      id: 6,
      title: 'Persistencia Local Offline (IndexedDB Dexie.js) y Respaldos',
      badge: '100% Offline & Seguro',
      icon: <Database className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/30 bg-purple-500/5',
      summary: 'Tus datos se guardan de forma permanente y segura en tu navegador. Puedes cerrar la ventana o reiniciar el computador sin perder nada.',
      steps: [
        'El motor local utiliza IndexedDB mediante Dexie.js con 8 almacenes tipados de alta velocidad.',
        'Funciona perfectamente sin conexión a internet en faena o talleres remotos.',
        'Genera respaldos completos en formato JSON versionado desde la pestaña "Base de Datos & Respaldos".',
        'Restaura respaldos cuando lo necesites o exporta los datos a Excel para compartirlos en OneDrive o Google Drive.'
      ],
      targetTab: 'database' as ActiveTab,
      actionText: 'Configurar Base de Datos & Respaldos'
    },
    {
      id: 7,
      title: 'Calculadora Universal de Presiones y Tiempos de Ensayo (API 598 / ISO 5208)',
      badge: 'Cálculo & Conversor',
      icon: <Calculator className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/30 bg-cyan-500/5',
      summary: 'Determina en segundos las presiones exactas de cuerpo (1.5× CWP), asiento de alta (1.1× CWP), asiento de baja (aire 80 psi) y los tiempos mínimos de sostenimiento por NPS.',
      steps: [
        'Selecciona el tipo de válvula (Compuerta, Globo, Bola, Mariposa, Retención, Guillotina, etc.) y clase de presión.',
        'El sistema calcula automáticamente la presión de Shell a 1.5× CWP y Asiento a 1.1× CWP.',
        'Obtén los tiempos mínimos de prueba (15s, 60s, 120s, 300s) según el diámetro nominal de la válvula.',
        'Consulta el criterio de aceptación de fugas (Rate A para asientos blandos, Rate B-D para metal-metal).',
        'Utiliza el conversor técnico universal de unidades (bar ⇄ psi ⇄ MPa ⇄ kg/cm² y Cv ⇄ Kv).'
      ],
      targetTab: 'calculator' as ActiveTab,
      actionText: 'Abrir Calculadora Universal'
    },
    {
      id: 8,
      title: 'Soporte Técnico Oficial & Asesoría en Terreno: Jorge Ferrada',
      badge: 'WhatsApp: 933331425',
      icon: <LifeBuoy className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/30 bg-emerald-500/5',
      summary: 'Canal directo de asistencia técnica para paradas de planta, homologación de normas, calibración de bancos de prueba y conformación de dossiers con Jorge Ferrada.',
      steps: [
        'Contacto directo por WhatsApp al número 933331425 (+56 9 3333 1425).',
        'Generador de consultas técnicas con estructura predefinida de faena, empresa y tipo de ensayo.',
        'Asesoría en normas API 598, ASME B16.34, ISO 5208 y Normas Chilenas NCh 700 / NCh 699.',
        'Supervisión y auditoría presencial en talleres y bancos de ensayo a nivel nacional.'
      ],
      targetTab: 'support' as ActiveTab,
      actionText: 'Ir a Soporte & Contactar a Jorge Ferrada'
    }
  ];

  const workflowSteps = [
    {
      number: '01',
      title: 'Recepción en Taller',
      desc: 'Inspección visual y dimensional. Verificación del TAG, placa de características y condición general de fábrica.',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      number: '02',
      title: 'Carga de Matriz Técnica',
      desc: 'Importación del listado Excel o registro directo con el Editor en vivo. Asignación de O/T, sistema y clase de presión.',
      color: 'from-cyan-600 to-teal-600'
    },
    {
      number: '03',
      title: 'Ensayos Hidráulicos API 598',
      desc: 'Pruebas de presión de cuerpo (1.5× CWP) y asiento (1.1× CWP o neumático). Verificación de hermeticidad y estanqueidad.',
      color: 'from-teal-600 to-emerald-600'
    },
    {
      number: '04',
      title: 'Control de Punch List',
      desc: 'Identificación y subsanación de desviaciones. Verificación de cero observaciones críticas Tipo A pendientes.',
      color: 'from-amber-600 to-orange-600'
    },
    {
      number: '05',
      title: 'Liberación QA/QC & Dossier',
      desc: 'Aprobación formal del Revisor QA/QC e Inspector ITO. Emisión de certificados PDF y despacho de la válvula a faena.',
      color: 'from-purple-600 to-indigo-600'
    }
  ];

  const faqs = [
    {
      q: '¿Qué sucede si cierro el navegador o apago el computador?',
      a: 'Todos tus datos se mantienen intactos. La aplicación utiliza almacenamiento persistente local en IndexedDB (mediante Dexie.js). Cada registro de válvula, prueba hidráulica y observación de punch list se conserva en el perfil de tu navegador.'
    },
    {
      q: '¿La aplicación necesita conexión a Internet para funcionar?',
      a: 'No. Una vez cargada en el navegador, la aplicación opera de forma completamente offline y autónoma. Puedes llevar el notebook a talleres de prueba, faenas mineras o túneles sin conexión y continuar registrando datos sin problemas.'
    },
    {
      q: '¿Cómo puedo transferir la información a otro computador o colega?',
      a: 'Puedes ir a la pestaña "Base de Datos & Respaldos" y presionar "Exportar Respaldo Completo (JSON)". Luego envías ese archivo a tu colega, quien solo debe hacer clic en "Restaurar Respaldo". También puedes exportar el Excel multi-hoja oficial para compartirlo por correo o subirlo a Google Drive / OneDrive.'
    },
    {
      q: '¿Qué normas técnicas rigen los cálculos de presión en el sistema?',
      a: 'El sistema implementa los estándares internacionales API 598 (Valve Inspection and Testing), ASME B16.34 (Valves - Flanged, Threaded and Welding End), ISO 5208 (Industrial valves - Pressure testing) y las normas chilenas NCh 700 (válvulas de compuerta) y NCh 699 (válvulas de retención).'
    },
    {
      q: '¿Por qué no puedo liberar una válvula a estado "LIBERADA QA/QC"?',
      a: 'Para mantener la integridad estricta del aseguramiento de calidad, el sistema impide liberar una válvula si: (1) Su prueba hidráulica obligatoria no ha sido aprobada, o (2) Tiene observaciones de Punch List Tipo A (Críticas) pendientes de subsanación.'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* ============================================================== */}
      {/* 1. HERO BANNER INDUSTRIAL */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-300">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>SISTEMA INTEGRAL DE CONTROL DE CALIDAD DE VÁLVULAS · PGP 2026</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Plataforma Integral de Trazabilidad, Pruebas Hidrostáticas y Liberación QA/QC
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            Herramienta industrial especializada para faenas de minería, energía y plantas de proceso.
            Gestiona matrices de válvulas, ejecuta protocolos de presión bajo normas <strong>API 598</strong>, <strong>ASME B16.34</strong> y <strong>Normas Chilenas (NCh 700/699)</strong>, genera dossiers técnicos oficiales en PDF y trabaja 100% offline con persistencia local garantizada.
          </p>

          {/* Botones de Acción Primaria */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('valves')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition shadow-lg shadow-blue-500/25 border border-blue-400/30"
            >
              <Layers className="w-4 h-4" />
              <span>Ver Matriz de Válvulas</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('excel_management')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition shadow-lg shadow-emerald-500/25 border border-emerald-400/30"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Subir Archivo Excel</span>
            </button>

            <button
              onClick={() => setActiveTab('hydro')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-xs sm:text-sm transition border border-slate-700"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Dossier Mensual PDF</span>
            </button>
          </div>
        </div>

        {/* Tira de Estadísticas del Sistema */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 mt-8 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Total Válvulas</span>
            </div>
            <p className="text-2xl font-black text-white font-mono">{totalValves}</p>
            <p className="text-[11px] text-slate-500">Registros en matriz activa</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Liberadas QA/QC</span>
            </div>
            <p className="text-2xl font-black text-emerald-400 font-mono">{releasedValves}</p>
            <p className="text-[11px] text-slate-500">Conforme para faena</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>Pruebas Aprobadas</span>
            </div>
            <p className="text-2xl font-black text-blue-400 font-mono">{approvedHydro}</p>
            <p className="text-[11px] text-slate-500">API 598 / NCh 700</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Punch List Abierto</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-black text-amber-400 font-mono">{openPunchItems}</p>
              {criticalPunchItems > 0 && (
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
                  {criticalPunchItems} Tipo A
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">Observaciones pendientes</p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. TUTORIAL INTERACTIVO: TODO LO QUE HACE LA APLICACIÓN */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Tutorial Interactivo: Todo lo que Hace la Aplicación
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Guía detallada de cada módulo, flujo de trabajo y capacidades industriales del sistema
            </p>
          </div>
        </div>

        {/* Selector de Módulos (Pestañas Horizontales) */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2">
          {tutorialModules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                activeModule === m.id
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800'
              }`}
            >
              <span className="font-mono text-[10px] opacity-75">#{m.id}</span>
              <span>{m.title.split(' ')[0]} {m.title.split(' ')[1]}</span>
            </button>
          ))}
        </div>

        {/* Tarjeta del Módulo Activo */}
        {(() => {
          const mod = tutorialModules.find(m => m.id === activeModule) || tutorialModules[0];
          return (
            <div className={`p-6 sm:p-8 rounded-2xl border ${mod.color} shadow-xl transition-all duration-300 space-y-6 bg-slate-900/90`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    {mod.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-blue-400 uppercase">Módulo 0{mod.id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {mod.badge}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">{mod.title}</h3>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab(mod.targetTab)}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-500/20"
                >
                  <span>{mod.actionText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {mod.summary}
              </p>

              {/* Pasos a seguir */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Pasos Operativos & Funcionalidades Clave:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mod.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ============================================================== */}
      {/* 3. FLUJO OPERACIONAL: CICLO DE VIDA DE LA VÁLVULA EN FAENA */}
      {/* ============================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Flujo Operacional QA/QC: Ciclo de Vida de una Válvula
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Protocolo paso a paso desde el arribo al taller hasta la liberación y entrega a terreno
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {workflowSteps.map((step, idx) => (
            <div key={idx} className="relative p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3 group hover:border-blue-500/50 transition">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black font-mono px-2 py-0.5 rounded bg-gradient-to-r ${step.color} text-white`}>
                  PASO {step.number}
                </span>
                <span className="text-slate-600 group-hover:text-blue-400 transition">
                  <ArrowRight className="w-4 h-4 hidden md:block" />
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{step.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. MATRIZ DE NORMAS TÉCNICAS APLICADAS */}
      {/* ============================================================== */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            Marco Normativo y Criterios de Aceptación Implementados
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          El sistema integra de forma programática las fórmulas, presiones mínimas y tiempos de ensayo según:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              API 598
            </span>
            <h4 className="text-xs font-bold text-white">Valve Inspection and Testing</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ensayos de cuerpo a 1.5× CWP y asiento a 1.1× CWP. Tiempos mínimos de sostenimiento de 15s a 120s según diámetro (NPS).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              ASME B16.34
            </span>
            <h4 className="text-xs font-bold text-white">Valves Flanged, Threaded & Welding End</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Curvas de Presión-Temperatura (P-T ratings) para aceros al carbono (WCB), inoxidables (CF8M) y aleados según clase 150# a 2500#.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              ISO 5208
            </span>
            <h4 className="text-xs font-bold text-white">Industrial Valves Pressure Testing</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tasas de fuga admisibles Rate A (cero burbujas/gotas en asientos resilientes) hasta Rate D para sellos metal-metal.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              NCh 700 / NCh 699
            </span>
            <h4 className="text-xs font-bold text-white">Normas Chilenas Válvulas</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Requisitos de fabricación, espesores, verificación de torque de accionamiento y presiones hidrostáticas para obras civiles y mineras en Chile.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. PREGUNTAS FRECUENTES (FAQ INTERACTIVO) */}
      {/* ============================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Preguntas Frecuentes & Buenas Prácticas</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Respuestas rápidas sobre persistencia, exportaciones, respaldos y reglas de calidad
        </p>

        <div className="space-y-2.5 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-4 py-3.5 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition"
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-blue-400 font-mono">Q{idx + 1}.</span>
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-900/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. CALL TO ACTION INFERIOR */}
      {/* ============================================================== */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/30 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">¿Listo para comenzar a trabajar?</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Ingresa a la matriz de válvulas para filtrar registros o sube una planilla Excel directamente.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('valves')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-500/20"
          >
            Ir a Matriz de Válvulas
          </button>
          <button
            onClick={() => setActiveTab('excel_management')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
          >
            Subir Excel
          </button>
        </div>
      </div>
    </div>
  );
};
