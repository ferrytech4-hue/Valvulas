/**
 * Página Oficial de Soporte, Ayuda y Asesoría Técnica
 * Sistema Universal de Control de Calidad y Gestión de Válvulas
 * 
 * Contacto Oficial: Jorge Ferrada
 * WhatsApp: +56 9 3333 1425
 */

import React, { useState } from 'react';
import { 
  PhoneCall, 
  MessageSquare, 
  Mail, 
  ShieldCheck, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Send, 
  LifeBuoy, 
  FileText, 
  Award, 
  Gauge, 
  Layers, 
  Cpu, 
  ExternalLink,
  Clock,
  MapPin,
  Sparkles,
  BookOpen,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface SupportHelpViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const SupportHelpView: React.FC<SupportHelpViewProps> = ({ setActiveTab }) => {
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Formulario rápido para WhatsApp
  const [consultSubject, setConsultSubject] = useState('Asesoría Técnica en Válvulas');
  const [userName, setUserName] = useState('');
  const [userCompany, setUserCompany] = useState('');
  const [userMessage, setUserMessage] = useState('');

  const contactData = {
    name: 'Jorge Ferrada',
    role: 'Especialista Técnico en Válvulas Industriales & Control QA/QC',
    phone: '+56 9 3333 1425',
    phoneRaw: '56933331425',
    whatsappNumber: '933331425',
    coverage: 'Nacional & Internacional (Minería, Celulosa, Energía, O&G, Sanitarias)',
    hours: 'Lunes a Domingo • 24/7 para emergencias de faena y paradas de planta'
  };

  const handleCopyContact = () => {
    const textToCopy = `Contacto Técnico Válvulas: Jorge Ferrada\nWhatsApp: +56 9 3333 1425 (933331425)\nEspecialista en Inspección, Pruebas API 598/ISO 5208 y Aseguramiento QA/QC.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendWhatsApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const greeting = `Hola Jorge Ferrada, te contacto desde la Aplicación Universal de Válvulas:`;
    const details = [
      greeting,
      userName ? `\n• Nombre: ${userName}` : '',
      userCompany ? `\n• Empresa/Faena: ${userCompany}` : '',
      `\n• Motivo: ${consultSubject}`,
      userMessage ? `\n• Consulta: ${userMessage}` : '\n• Solicito información y asesoría técnica especializada.'
    ].join('');

    const encoded = encodeURIComponent(details);
    const url = `https://wa.me/${contactData.phoneRaw}?text=${encoded}`;
    window.open(url, '_blank');
  };

  const services = [
    {
      title: 'Inspección & Ensayos en Banco (API 598 / ISO 5208)',
      desc: 'Supervisión de pruebas hidrostáticas de cuerpo (Shell 1.5× CWP) y asiento de alta/baja presión. Calibración de procedimientos y certificación de bancos.',
      icon: <Gauge className="w-5 h-5 text-blue-400" />
    },
    {
      title: 'Auditorías QA/QC y Dossier de Calidad',
      desc: 'Revisión técnica de matrices, trazabilidad por colada (MTR), control de tolerancias, punch lists y conformación de dossiers técnicos para mandantes e ITO.',
      icon: <Award className="w-5 h-5 text-emerald-400" />
    },
    {
      title: 'Normas Chilenas (NCh 700 / NCh 699 / NCh 1360)',
      desc: 'Cumplimiento normativo nacional para válvulas de compuerta, retención, mariposa y ventosas en obras hidráulicas, mineras y sanitarias.',
      icon: <BookOpen className="w-5 h-5 text-indigo-400" />
    },
    {
      title: 'Capacitación y Diagnóstico de Fallas en Terreno',
      desc: 'Análisis de causas de falla en asientos, cavitación, flushing, torques de accionamiento neumático/eléctrico y planes de mantenimiento preventivo.',
      icon: <Wrench className="w-5 h-5 text-amber-400" />
    }
  ];

  const faqs = [
    {
      q: '¿Cómo contacto a Jorge Ferrada para una consulta o asesoría urgente?',
      a: 'Puedes hacer clic directamente en el botón verde "Abrir WhatsApp (+56 9 3333 1425)" para iniciar una conversación inmediata, o llamar al +56 9 3333 1425. Jorge responde de forma directa a consultas técnicas de faena y taller.'
    },
    {
      q: '¿La aplicación sirve para cualquier tipo de válvula y cualquier industria?',
      a: 'Sí. El sistema está diseñado como una plataforma universal. Soporta válvulas de compuerta, globo, bola, mariposa, retención (check), seguridad y alivio (PSV), diafragma y macho (plug) en industrias mineras, celulosa, energía, petróleo & gas, sanitarias y químicas.'
    },
    {
      q: '¿Cómo importo mi propia planilla de válvulas a la matriz?',
      a: 'Dirígete a la pestaña "Carga de Archivos Excel". Puedes arrastrar o seleccionar tu archivo .xlsx, .xls o .csv. El sistema detecta las hojas y columnas automáticamente. Luego pulsa "Cargar Registros a Matriz" para incorporarlas con identificadores estables.'
    },
    {
      q: '¿Cómo genero el certificado individual o el dossier mensual en PDF?',
      a: 'En la "Matriz de Válvulas" haz clic en "PDF Certificado" para obtener el documento A4 oficial con recuadros de firma ITO y QA/QC. Para el compilado del mes, ve a "Pruebas Hidráulicas" y pulsa "Descargar Dossier Completo (PDF)".'
    },
    {
      q: '¿Mis datos se borran si no tengo internet?',
      a: 'No. La plataforma opera bajo arquitectura Offline-First con IndexedDB y LocalStorage. Los datos permanecen guardados localmente en tu equipo. Además, puedes generar respaldos JSON en la pestaña "Base de Datos & Respaldos".'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* ============================================================== */}
      {/* 1. HERO BANNER DE CONTACTO Y SOPORTE OFICIAL */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300">
            <LifeBuoy className="w-4 h-4 text-emerald-400" />
            <span>CENTRO OFICIAL DE SOPORTE & ASESORÍA TÉCNICA UNIVERSAL</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Soporte Especializado en Válvulas Industriales & Control de Calidad
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            ¿Necesitas asistencia técnica con la plataforma, interpretación de normas (API 598, ASME B16.34, ISO 5208, NCh 700), configuración de bancos de prueba o consultoría en faena?
            Contacta directamente con <strong>Jorge Ferrada</strong> a través de WhatsApp o llamada telefónica directa.
          </p>

          {/* Tarjeta de Contacto Directo Jorge Ferrada */}
          <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-emerald-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-600/25 border border-emerald-400/40">
                  JF
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-white">{contactData.name}</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                      CONTACTO OFICIAL
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{contactData.role}</p>
                  <p className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{contactData.hours}</span>
                  </p>
                </div>
              </div>

              {/* Botones de Contacto Directo */}
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={`https://wa.me/${contactData.phoneRaw}?text=Hola%20Jorge%20Ferrada%2C%20te%20contacto%20desde%20la%20Aplicaci%C3%B3n%20Universal%20de%20V%C3%A1lvulas.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-600/30 border border-emerald-400/30 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp: {contactData.whatsappNumber}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={`tel:${contactData.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition border border-slate-700"
                >
                  <PhoneCall className="w-4 h-4 text-blue-400" />
                  <span>Llamar: {contactData.phone}</span>
                </a>

                <button
                  onClick={handleCopyContact}
                  className="inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-750 transition cursor-pointer"
                  title="Copiar datos de contacto al portapapeles"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Cobertura:</strong> {contactData.coverage}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Especialidad:</strong> Pruebas Hidrostáticas, API 598, ISO 5208, NCh y Dossiers QA/QC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. FORMULARIO INTERACTIVO: ENVIAR CONSULTA POR WHATSAPP */}
      {/* ============================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulario */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Enviar Consulta Directa a Jorge Ferrada por WhatsApp
              </h2>
              <p className="text-xs text-slate-400">
                Redacta los datos de tu faena o requerimiento para generar un mensaje estructurado instantáneo
              </p>
            </div>
          </div>

          <form onSubmit={handleSendWhatsApp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tu Nombre y Cargo:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Carlos Silva - Inspector QA/QC"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Empresa, Faena o Proyecto:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Minera Centinela / Planta Concentradora"
                  value={userCompany}
                  onChange={(e) => setUserCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Motivo / Asunto de la Consulta:
              </label>
              <select
                aria-label="Motivo de la consulta"
                value={consultSubject}
                onChange={(e) => setConsultSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
              >
                <option value="Asesoría Técnica en Ensayos API 598 / ISO 5208">Asesoría Técnica en Ensayos API 598 / ISO 5208</option>
                <option value="Consulta sobre Normas Chilenas (NCh 700 / NCh 699)">Consulta sobre Normas Chilenas (NCh 700 / NCh 699)</option>
                <option value="Auditoría de Válvulas y Certificados de Calidad">Auditoría de Válvulas y Certificados de Calidad</option>
                <option value="Capacitación de Personal de Taller y Terreno">Capacitación de Personal de Taller y Terreno</option>
                <option value="Configuración de Banco de Pruebas Hidrostáticas">Configuración de Banco de Pruebas Hidrostáticas</option>
                <option value="Soporte y Personalización de la Aplicación">Soporte y Personalización de la Aplicación</option>
                <option value="Otro Requerimiento Industrial">Otro Requerimiento Industrial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Detalles del Requerimiento:
              </label>
              <textarea
                rows={3}
                placeholder="Indica diámetros, clase de presión, tipo de válvula, fluido o la consulta específica que necesitas resolver..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Al presionar el botón se abrirá WhatsApp con el mensaje estructurado listo para enviar a Jorge Ferrada.
              </span>
              <button
                type="submit"
                className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/25 cursor-pointer shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enviar por WhatsApp</span>
              </button>
            </div>
          </form>
        </div>

        {/* Resumen de Canales Directos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Canales de Contacto Directo</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">WhatsApp Oficial:</span>
                <p className="text-base font-bold text-emerald-400 font-mono">+56 9 3333 1425</p>
                <p className="text-[11px] text-slate-400">Respuesta rápida para faena y taller</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Contacto Directo:</span>
                <p className="text-sm font-bold text-white">Jorge Ferrada</p>
                <p className="text-[11px] text-slate-400">Asesor de Calidad e Inspección de Válvulas</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Disponibilidad en Terreno:</span>
                <p className="text-xs text-slate-200">Visitas a talleres, bancos de prueba y faenas a lo largo de Chile</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('valves')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
            >
              Volver a la Matriz de Válvulas
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. SERVICIOS Y ASESORÍAS TÉCNICAS DISPONIBLES */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span>Áreas de Asesoría Técnica Especializada</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Servicios profesionales de consultoría, inspección y aseguramiento de calidad ofrecidos por Jorge Ferrada
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((svc, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-md space-y-2.5"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {svc.icon}
                </div>
                <h3 className="text-sm font-bold text-white">{svc.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-1">
                {svc.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. PREGUNTAS FRECUENTES (FAQ) */}
      {/* ============================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Preguntas Frecuentes de la Plataforma & Soporte</h2>
        </div>
        <p className="text-xs text-slate-400">
          Respuestas inmediatas a las dudas operacionales más comunes
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
      </section>

      {/* ============================================================== */}
      {/* 5. CALL TO ACTION INFERIOR */}
      {/* ============================================================== */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">¿Tienes una duda técnica urgente o una parada de planta?</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Escríbele directamente a Jorge Ferrada al WhatsApp <strong>933331425</strong> (+56 9 3333 1425).
          </p>
        </div>
        <a
          href={`https://wa.me/${contactData.phoneRaw}?text=Hola%20Jorge%2C%20necesito%20soporte%20t%C3%A9cnico%20urgente%20para%20v%C3%A1lvulas.`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/30 shrink-0"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Escribir al WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
