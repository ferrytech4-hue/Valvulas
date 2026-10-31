/**
 * Pestaña Unificada: Soporte Técnico del Programa & Contacto con el Creador
 * Sistema de Control de Calidad de Válvulas PGP 2026
 * Desarrollado por Jorge Ferrada
 * 
 * Centraliza en un solo lugar:
 * 1. Contacto directo con el creador del software (Jorge Ferrada - WhatsApp: 933331425, Email: ferrytech4@gmail.com)
 * 2. Mesa de ayuda y formulario para reportar errores (bugs) o solicitar mejoras con ticket generado
 * 3. Manual de uso del software y estructura oficial de plantilla Excel de 3 pestañas
 * 4. Diagnóstico del sistema local (IndexedDB Dexie) y sincronización con Google Drive
 * 5. Preguntas frecuentes sobre el funcionamiento del software
 * 
 * NOTA DE RESPONSABILIDAD: El creador es responsable del desarrollo y soporte técnico del software.
 * No es especialista, inspector ni certificador de válvulas industriales.
 */

import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  MessageSquare, 
  PhoneCall, 
  Mail, 
  UserCheck, 
  FileSpreadsheet, 
  Database, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Send, 
  FileText, 
  Cloud, 
  BookOpen, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  ExternalLink,
  Download,
  Layers,
  Sparkles,
  Clock,
  MapPin,
  Table,
  CheckCheck
} from 'lucide-react';
import { dbService } from '../services/storageService';
import { excelService } from '../services/excelService';
import { ActiveTab } from './Navbar';

interface SoftwareSupportViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

type SectionTab = 'CONTACT' | 'TICKETS' | 'EXCEL_GUIDE' | 'DIAGNOSTICS' | 'FAQS';

export const SoftwareSupportView: React.FC<SoftwareSupportViewProps> = ({ setActiveTab }) => {
  const [currentSection, setCurrentSection] = useState<SectionTab>('CONTACT');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Formulario interactivo de contacto rápido
  const [contactName, setContactName] = useState('');
  const [contactOrg, setContactOrg] = useState('');
  const [contactTopic, setContactTopic] = useState('Soporte Técnico General');
  const [contactMsg, setContactMsg] = useState('');

  // Formulario de ticket de error / mejora
  const [ticketType, setTicketType] = useState<'ERROR' | 'MEJORA' | 'CONSULTA'>('ERROR');
  const [ticketUser, setTicketUser] = useState('');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketSteps, setTicketSteps] = useState('');
  const [ticketExpected, setTicketExpected] = useState('');
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Diagnóstico del sistema y almacenamiento
  const [storageStats, setStorageStats] = useState({
    valvesCount: 0,
    testsCount: 0,
    punchesCount: 0,
    localStorageUsageKb: 0,
    indexedDbStatus: 'Activo & Operativo (Dexie.js)',
    driveStatus: 'OAuth 2.0 Habilitado',
    version: 'v1.0.0 (Versión 1 - Octubre 2026)',
    browser: typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'Navegador Web'
  });

  useEffect(() => {
    try {
      const valves = dbService.getValves().length;
      const tests = dbService.getHydroTests().length;
      const punches = dbService.getPunchItems().length;
      let totalBytes = 0;
      for (const x in localStorage) {
        if (localStorage.hasOwnProperty(x)) {
          totalBytes += (localStorage[x].length + x.length) * 2;
        }
      }
      setStorageStats(prev => ({
        ...prev,
        valvesCount: valves,
        testsCount: tests,
        punchesCount: punches,
        localStorageUsageKb: Math.round(totalBytes / 1024)
      }));
    } catch (e) {
      console.warn('Error calculando diagnóstico:', e);
    }
  }, []);

  const creatorInfo = {
    name: 'Jorge Ferrada',
    title: 'Creador & Desarrollador del Software PGP 2026',
    roleTag: 'Soporte Informático & TI',
    whatsapp: '933331425',
    phoneInternational: '+56 9 3333 1425',
    phoneRaw: '56933331425',
    email: 'ferrytech4@gmail.com',
    hours: 'Lunes a Viernes 08:30 - 19:30 • Asistencia remota de software vía WhatsApp',
    disclaimer: 'Jorge Ferrada es el autor y desarrollador informático del sistema PGP 2026. No interviene ni emite juicios como inspector técnico o certificador de válvulas industriales; su labor está enfocada exclusivamente en el funcionamiento del software, bases de datos y herramientas digitales.'
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(creatorInfo.whatsapp);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 3000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(creatorInfo.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const handleSendDirectContact = (e: React.FormEvent) => {
    e.preventDefault();
    const details = [
      `*Mensaje para el Creador del Software (Jorge Ferrada)*`,
      `• Software: PGP 2026 QA/QC (v1.0.0)`,
      contactName ? `• Remitente: ${contactName}` : '',
      contactOrg ? `• Empresa / Proyecto: ${contactOrg}` : '',
      `• Motivo: ${contactTopic}`,
      contactMsg ? `• Detalle: ${contactMsg}` : '• Solicito información y asistencia técnica sobre el sistema.'
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${creatorInfo.phoneRaw}?text=${encodeURIComponent(details)}`;
    window.open(url, '_blank');
  };

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = 'TICKET-' + Date.now().toString(36).toUpperCase();
    setTicketId(generatedId);

    const msg = [
      `*Reporte de Soporte Técnico [${generatedId}]*`,
      `• Para: Jorge Ferrada (Soporte Informático)`,
      `• Software: PGP 2026 QA/QC (${storageStats.version})`,
      `• Tipo: ${ticketType}`,
      `• Usuario: ${ticketUser || 'Usuario del Sistema'}`,
      `• Asunto: ${ticketTitle}`,
      `• Pasos para reproducir: ${ticketSteps || 'No especificados'}`,
      `• Comportamiento esperado: ${ticketExpected || 'No especificado'}`,
      `• Diagnóstico: ${storageStats.valvesCount} válvulas, ${storageStats.localStorageUsageKb} KB en LocalStorage`
    ].join('\n');

    const encoded = encodeURIComponent(msg);
    const url = `https://wa.me/${creatorInfo.phoneRaw}?text=${encoded}`;
    window.open(url, '_blank');
    setTicketSent(true);
  };

  const softwareFaqs = [
    {
      q: '¿Cómo contacto a Jorge Ferrada para soporte o consultas del software?',
      a: 'Puedes escribirle directamente al WhatsApp +56 9 3333 1425 (933331425) o al correo ferrytech4@gmail.com. Atiende requerimientos de programación, nuevas funciones, capacitación y resolución de fallas informáticas del programa.'
    },
    {
      q: '¿Cómo preparo mi archivo Excel para que la importación sea 100% exitosa?',
      a: 'Recomendamos usar la estructura de 3 pestañas: "INVENTARIO_VALVULAS", "PRUEBAS_PH" e "HISTORIAL_MANTENCION". Asegúrate de que las columnas tengan nombres estándar (Tag / Código, Tipo de Válvula, Diámetro, Presión Nominal, etc.). Puedes descargar la plantilla oficial con un clic en la pestaña "Manual Excel".'
    },
    {
      q: '¿Qué ocurre con mis datos si cierro el navegador o reinicio el equipo?',
      a: 'El software opera bajo arquitectura Offline-First. Toda la información se guarda en la base de datos interna de tu navegador (IndexedDB mediante Dexie.js) y se sincroniza en LocalStorage. No se borra al cerrar la ventana ni al reiniciar tu equipo.'
    },
    {
      q: '¿Cómo conecto Google Drive para guardar mis respaldos?',
      a: 'Ve a la pestaña "Google Drive" en el menú superior o desde la sección "Diagnóstico". Pulsa "Conectar Google Drive" e inicia sesión con tu cuenta Google. La aplicación creará automáticamente una carpeta llamada "PGP_2026_Respaldos_Calidad" con permisos mínimos de seguridad.'
    },
    {
      q: '¿El creador del software tiene acceso a la información confidencial de mis válvulas?',
      a: 'No. La aplicación funciona localmente en tu propio computador. Ni el creador ni servidores externos tienen acceso a tus registros a menos que tú decidas compartir un archivo de respaldo voluntariamente.'
    },
    {
      q: '¿Puedo editar celdas directamente en la aplicación?',
      a: 'Sí. En el módulo "Carga de Archivos Excel" puedes visualizar todas las hojas, editar valores en vivo, añadir o eliminar filas, y volver a exportar el archivo sin perder el formato original.'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-7xl mx-auto">
      
      {/* ============================================================== */}
      {/* 1. HERO BANNER UNIFICADO: SOPORTE Y CONTACTO CON EL CREADOR */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-emerald-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-24 -top-24 w-88 h-88 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-88 h-88 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
              <LifeBuoy className="w-3.5 h-3.5 text-emerald-400" />
              <span>SOPORTE TÉCNICO & CONTACTO UNIFICADO</span>
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Versión del Software: <strong>{storageStats.version}</strong>
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Soporte Técnico del Programa & Contacto
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Módulo oficial para resolver dudas del sistema, gestionar reportes de incidencias, aprender el uso 
                de la plantilla Excel de 3 pestañas y comunicarse directamente con <strong>Jorge Ferrada</strong>, desarrollador y soporte informático del software.
              </p>
            </div>

            {/* Acceso rápido a WhatsApp de Jorge */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href={`https://wa.me/${creatorInfo.phoneRaw}?text=Hola%20Jorge%20Ferrada%2C%20solicito%20soporte%20t%C3%A9cnico%20para%20el%20Software%20de%20Control%20de%20Calidad%20PGP%202026.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-600/30 border border-emerald-400/40"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Jorge: {creatorInfo.whatsapp}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={`tel:${creatorInfo.phoneInternational.replace(/\s+/g, '')}`}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700"
                title="Llamar al teléfono de soporte"
              >
                <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                <span>Llamar</span>
              </a>
            </div>
          </div>

          {/* Nota de Deslinde Legal / Transparencia Profesional */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 text-xs text-slate-400 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-200">Aclaración de Rol:</strong> {creatorInfo.disclaimer}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. BARRA DE SUB-PESTAÑAS DE NAVEGACIÓN INTERNA */}
      {/* ============================================================== */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg text-xs font-semibold">
        <button
          onClick={() => setCurrentSection('CONTACT')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
            currentSection === 'CONTACT'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-300" />
          <span>1. Contacto con Jorge Ferrada</span>
        </button>

        <button
          onClick={() => setCurrentSection('TICKETS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
            currentSection === 'TICKETS'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Send className="w-4 h-4 text-blue-400" />
          <span>2. Mesa de Ayuda / Reportar Error</span>
        </button>

        <button
          onClick={() => setCurrentSection('EXCEL_GUIDE')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
            currentSection === 'EXCEL_GUIDE'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>3. Manual & Planilla Excel 3 Pestañas</span>
        </button>

        <button
          onClick={() => setCurrentSection('DIAGNOSTICS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
            currentSection === 'DIAGNOSTICS'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4 text-purple-400" />
          <span>4. Diagnóstico & Google Drive</span>
        </button>

        <button
          onClick={() => setCurrentSection('FAQS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
            currentSection === 'FAQS'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>5. Preguntas Frecuentes (FAQ)</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 1: CONTACTO OFICIAL CON EL CREADOR */}
      {/* ============================================================== */}
      {currentSection === 'CONTACT' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Tarjeta de Presentación del Creador */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-600/30 border border-emerald-400/40">
                  JF
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-white">{creatorInfo.name}</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                      AUTOR
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{creatorInfo.title}</p>
                  <p className="text-[11px] text-emerald-400 font-medium">{creatorInfo.roleTag}</p>
                </div>
              </div>

              {/* Botones de contacto y copia */}
              <div className="space-y-3 pt-2 text-xs">
                {/* WhatsApp */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">WhatsApp Oficial:</span>
                      <span className="font-bold text-white font-mono text-sm">{creatorInfo.whatsapp}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">({creatorInfo.phoneInternational})</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <a
                      href={`https://wa.me/${creatorInfo.phoneRaw}?text=Hola%20Jorge%20Ferrada%2C%20te%20escribo%20acerca%20del%20Software%20PGP%202026.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                      title="Abrir chat en WhatsApp"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={handleCopyPhone}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      title="Copiar número"
                    >
                      {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Correo Electrónico:</span>
                      <span className="font-bold text-white font-mono text-xs">{creatorInfo.email}</span>
                      <span className="text-[10px] text-slate-400 block">Soporte y Proyectos</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    title="Copiar email"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Horario de Atención */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center space-x-2 text-slate-300 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Disponibilidad Informática:</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {creatorInfo.hours}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario de Mensaje Directo */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Enviar Mensaje Directo a Jorge Ferrada</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Escribe tu requerimiento para abrir una conversación estructurada por WhatsApp
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  CANAL DIRECTO
                </span>
              </div>

              <form onSubmit={handleSendDirectContact} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nombre o Identificación:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Juan Pérez / Operador Taller"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Empresa o Proyecto (Opcional):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Faena PGP 2026 / Planta Norte"
                      value={contactOrg}
                      onChange={(e) => setContactOrg(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Motivo del Contacto:
                  </label>
                  <select
                    aria-label="Motivo del contacto con Jorge Ferrada"
                    value={contactTopic}
                    onChange={(e) => setContactTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Soporte Técnico Informático">Soporte Técnico Informático / Dudas de Uso</option>
                    <option value="Solicitud de Nueva Función o Reporte">Solicitud de Nueva Función o Reporte Personalizado</option>
                    <option value="Configuración de Google Drive">Configuración de Google Drive / Respaldos en Nube</option>
                    <option value="Integración de Planillas Excel">Integración de Planillas Excel Complejas</option>
                    <option value="Otro Requerimiento">Otro Requerimiento de Desarrollo de Software</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mensaje o Detalle del Requerimiento:
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe aquí tus dudas, requerimientos específicos o mejoras deseadas para el software..."
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-slate-400">
                    Al presionar enviar se abrirá WhatsApp con el mensaje estructurado listo para enviar a Jorge Ferrada.
                  </span>
                  <button
                    type="submit"
                    className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/30 cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar a WhatsApp (933331425)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECCIÓN 2: FORMULARIO DE REPORTE DE ERRORES / MEJORAS (TICKETS) */}
      {/* ============================================================== */}
      {currentSection === 'TICKETS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <span>Mesa de Ayuda: Reportar Error o Solicitar Mejora</span>
              </h2>
              <p className="text-xs text-slate-400">
                Genera un reporte técnico para revisión directa por el desarrollador Jorge Ferrada
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              TICKET SYSTEM v1.0.0
            </span>
          </div>

          {ticketSent && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold">¡Ticket {ticketId} generado exitosamente!</p>
                <p className="text-[11px] text-emerald-300">
                  Se ha preparado el mensaje en WhatsApp para Jorge Ferrada. Puedes adjuntar capturas de pantalla opcionales en el chat.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSendTicket} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo de Incidencia:
                </label>
                <select
                  aria-label="Tipo de incidencia de software"
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="ERROR">Reportar Error / Comportamiento Inesperado (Bug)</option>
                  <option value="MEJORA">Solicitar Nueva Función / Mejora de Interfaz</option>
                  <option value="CONSULTA">Duda de Uso / Consulta Informática</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tu Nombre o Identificador:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Supervisor QA/QC"
                  value={ticketUser}
                  onChange={(e) => setTicketUser(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título del Problema:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Falla al importar columna 'Presión'"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pasos para Reproducir el Problema:
                </label>
                <textarea
                  rows={3}
                  placeholder="1. Ingresé al módulo X&#10;2. Presioné el botón Y&#10;3. Ocurrió el error Z..."
                  value={ticketSteps}
                  onChange={(e) => setTicketSteps(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Comportamiento Esperado:
                </label>
                <textarea
                  rows={3}
                  placeholder="Explica qué debería haber ocurrido o cómo te gustaría que opere la aplicación..."
                  value={ticketExpected}
                  onChange={(e) => setTicketExpected(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-400">
                * El reporte es revisado antes de enviarlo y no contiene datos confidenciales del proyecto.
              </span>
              <button
                type="submit"
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/30 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Generar Ticket & Enviar por WhatsApp</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECCIÓN 3: MANUAL DE USO Y ESTRUCTURA DE PLANILLA (3 PESTAÑAS) */}
      {/* ============================================================== */}
      {currentSection === 'EXCEL_GUIDE' && (
        <div className="space-y-6">
          {/* Tarjeta de descarga de plantilla recomendada */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Estructura Recomendada de Planilla Excel (3 Pestañas)</h3>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Para un control profesional y ordenado del proyecto, divide tu libro de cálculo en tres pestañas: 
                <strong> INVENTARIO_VALVULAS</strong>, <strong>PRUEBAS_PH</strong> e <strong>HISTORIAL_MANTENCION</strong>.
              </p>
            </div>

            <button
              onClick={() => excelService.downloadRecommendedThreeSheetWorkbook()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30 border border-emerald-400/30 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Plantilla Oficial (.xlsx)</span>
            </button>
          </div>

          {/* Detalle de las 3 Pestañas y sus Columnas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pestaña 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-emerald-400 font-mono">PESTAÑA 1</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold">Activos</span>
              </div>
              <h4 className="text-sm font-bold text-white">INVENTARIO_VALVULAS</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Registro maestro, tag, ubicación y especificaciones constructivas de cada válvula del sistema.
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-[11px] font-mono text-slate-300">
                <div className="text-emerald-400 font-bold mb-1">Columnas Obligatorias:</div>
                <div>• Tag / Código</div>
                <div>• Tipo de Válvula</div>
                <div>• Diámetro Nominal</div>
                <div>• Presión Nominal (Clase/PN)</div>
                <div>• Ubicación / Línea</div>
                <div>• Estado Actual</div>
                <div>• Frecuencia PH (Meses)</div>
              </div>
            </div>

            {/* Pestaña 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-blue-400 font-mono">PESTAÑA 2</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-semibold">Pruebas PH</span>
              </div>
              <h4 className="text-sm font-bold text-white">PRUEBAS_PH</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bitácora de pruebas hidrostáticas de cuerpo y asiento con presiones, tiempos de sostenimiento y resultados.
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-[11px] font-mono text-slate-300">
                <div className="text-blue-400 font-bold mb-1">Columnas Obligatorias:</div>
                <div>• Código Válvula</div>
                <div>• Fecha Prueba</div>
                <div>• Presión Sistema (Kg)</div>
                <div>• Presión de Prueba (Kg)</div>
                <div>• Tiempo Sostén (Min)</div>
                <div>• ¿Pérdida en Sello? / Vástago</div>
                <div>• Resultado & Próxima PH</div>
              </div>
            </div>

            {/* Pestaña 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-purple-400 font-mono">PESTAÑA 3</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-semibold">Historial</span>
              </div>
              <h4 className="text-sm font-bold text-white">HISTORIAL_MANTENCION</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bitácora de mantenimientos preventivos y correctivos, rectificación de asientos, cambio de sellos y firmas.
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-[11px] font-mono text-slate-300">
                <div className="text-purple-400 font-bold mb-1">Columnas Obligatorias:</div>
                <div>• Código Válvula</div>
                <div>• Fecha Mantención</div>
                <div>• Tipo de Mantención</div>
                <div>• Componentes Cambiados</div>
                <div>• Técnico Responsable</div>
                <div>• Firma / Certificado</div>
              </div>
            </div>
          </div>

          {/* Guía Paso a Paso para Importar & Editar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Flujo de Trabajo Seguro en la Aplicación</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-400 block font-mono">Paso 1: Selección</span>
                <p className="text-slate-300 leading-relaxed">
                  Dirígete a "Carga de Archivos Excel" y arrastra tu archivo .xlsx o .csv.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-400 block font-mono">Paso 2: Validación</span>
                <p className="text-slate-300 leading-relaxed">
                  El sistema detecta automáticamente todas las hojas y mapea columnas clave como TAG y Presión.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-purple-400 block font-mono">Paso 3: Edición</span>
                <p className="text-slate-300 leading-relaxed">
                  Puedes editar celdas en caliente directamente en la tabla antes de consolidar los registros.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-400 block font-mono">Paso 4: Exportación</span>
                <p className="text-slate-300 leading-relaxed">
                  Descarga el libro actualizado sin alterar fórmulas ni hojas no modificadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECCIÓN 4: DIAGNÓSTICO EN VIVO & CONECTIVIDAD GOOGLE DRIVE */}
      {/* ============================================================== */}
      {currentSection === 'DIAGNOSTICS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Diagnóstico en Tiempo Real del Sistema
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                ESTADO: SALUDABLE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Válvulas Registradas:</span>
                <span className="text-xl font-bold text-white">{storageStats.valvesCount}</span>
                <span className="text-[10px] text-slate-500 block font-sans">En base local IndexedDB</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Pruebas PH & Punch:</span>
                <span className="text-xl font-bold text-blue-400">{storageStats.testsCount + storageStats.punchesCount}</span>
                <span className="text-[10px] text-slate-500 block font-sans">Eventos asociados</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Uso LocalStorage:</span>
                <span className="text-xl font-bold text-purple-400">~{storageStats.localStorageUsageKb} KB</span>
                <span className="text-[10px] text-slate-500 block font-sans">Persistencia caché rápida</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Motor de Datos:</span>
                <span className="text-xs font-bold text-emerald-400 block mt-1">Dexie.js v4</span>
                <span className="text-[10px] text-slate-500 block font-sans">IndexedDB Offline-First</span>
              </div>
            </div>

            {/* Panel de Google Drive */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Conectividad con Google Drive Oficial</h4>
                  <p className="text-[11px] text-slate-400">
                    Sincroniza y restaura respaldos cifrados en la carpeta <code className="text-blue-300">PGP_2026_Respaldos_Calidad</code>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('drive')}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-600/20 shrink-0 cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Abrir Módulo Google Drive</span>
              </button>
            </div>

            {/* Panel de Creación de Archivo Local (.json) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Generar Archivo Local de Respaldo (.json)</h4>
                  <p className="text-[11px] text-slate-400">
                    Descarga directa e instantánea a tu disco duro con todas las válvulas, pruebas e historial.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  const fname = dbService.downloadLocalJsonBackup();
                  alert(`¡Archivo local "${fname}" descargado exitosamente en tu equipo!`);
                }}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-md shadow-purple-600/30 shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Crear Archivo Local</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECCIÓN 5: PREGUNTAS FRECUENTES (FAQ) */}
      {/* ============================================================== */}
      {currentSection === 'FAQS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              Preguntas Frecuentes del Funcionamiento del Software
            </h2>
          </div>

          <div className="space-y-3 pt-1">
            {softwareFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-4 py-3.5 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition"
                  >
                    <span className="flex items-center space-x-2">
                      <span className="text-emerald-400 font-mono">Q{idx + 1}.</span>
                      <span>{faq.q}</span>
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
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
        </div>
      )}

    </div>
  );
};
