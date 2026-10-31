/**
 * Pestaña Independiente: Contacto del Creador (Jorge Ferrada)
 * Sistema de Control de Calidad PGP 2026
 * 
 * Sección dedicada EXCLUSIVAMENTE a los datos de contacto y comunicación directa con el autor del software.
 */

import React, { useState } from 'react';
import { 
  PhoneCall, 
  MessageSquare, 
  Mail, 
  UserCheck, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Code2, 
  ExternalLink,
  Laptop,
  CheckCircle2
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface CreatorContactViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const CreatorContactView: React.FC<CreatorContactViewProps> = ({ setActiveTab }) => {
  const [copied, setCopied] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Formulario interactivo para enviar mensaje a Jorge Ferrada
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [topic, setTopic] = useState('Desarrollo y Soporte de Software');
  const [message, setMessage] = useState('');

  const creator = {
    name: 'Jorge Ferrada',
    title: 'Creador & Desarrollador del Software PGP 2026',
    roleDescription: 'Desarrollo de software a medida, aplicaciones web locales, procesamiento de matrices Excel, automatización e integración con Google Drive.',
    whatsapp: '933331425',
    phoneInternational: '+56 9 3333 1425',
    phoneRaw: '56933331425',
    email: 'ferrytech4@gmail.com',
    location: 'Chile • Soporte remoto y proyectos a nivel nacional',
    schedule: 'Lunes a Viernes 08:30 - 19:30 • Atención por WhatsApp'
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(creator.whatsapp);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(creator.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const details = [
      `*Contacto con el Creador (Jorge Ferrada)*`,
      `• Software: Sistema de Control de Calidad PGP 2026`,
      name ? `• De: ${name}` : '',
      organization ? `• Empresa/Área: ${organization}` : '',
      `• Asunto: ${topic}`,
      message ? `• Mensaje: ${message}` : '• Solicito información y contacto directo.'
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${creator.phoneRaw}?text=${encodeURIComponent(details)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12 max-w-4xl mx-auto">
      
      {/* ============================================================== */}
      {/* 1. HERO BANNER: DATOS OFICIALES DEL CREADOR */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-emerald-950/40 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>PESTAÑA OFICIAL DE CONTACTO DEL CREADOR</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-emerald-600/25 border border-emerald-400/40">
                JF
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {creator.name}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                    AUTOR
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">{creator.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{creator.roleDescription}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://wa.me/${creator.phoneRaw}?text=Hola%20Jorge%20Ferrada%2C%20te%20contacto%20acerca%20del%20Software%20PGP%202026.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-600/30 border border-emerald-400/30 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp: {creator.whatsapp}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={`tel:${creator.phoneInternational.replace(/\s+/g, '')}`}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition border border-slate-700"
              >
                <PhoneCall className="w-4 h-4 text-blue-400" />
                <span>Llamar</span>
              </a>
            </div>
          </div>

          {/* Fila de Canales de Contacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">WhatsApp Oficial:</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">{creator.whatsapp}</span>
                  <span className="text-[11px] text-slate-400 block font-mono">({creator.phoneInternational})</span>
                </div>
              </div>
              <button
                onClick={handleCopyPhone}
                className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 transition text-[11px]"
                title="Copiar número de teléfono"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Correo Electrónico:</span>
                  <span className="font-bold text-white font-mono text-sm">{creator.email}</span>
                  <span className="text-[11px] text-slate-400 block">Canal oficial de soporte</span>
                </div>
              </div>
              <button
                onClick={handleCopyEmail}
                className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 transition text-[11px]"
                title="Copiar correo electrónico"
              >
                {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. FORMULARIO: ENVIAR MENSAJE DIRECTO AL CREADOR */}
      {/* ============================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Escribir Directamente a Jorge Ferrada
            </h2>
            <p className="text-xs text-slate-400">
              Genera un mensaje redactado con tus requerimientos para enviarlo de inmediato por WhatsApp
            </p>
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tu Nombre:</label>
              <input
                type="text"
                placeholder="Ej: Marcelo Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Empresa / Proyecto / Faena:</label>
              <input
                type="text"
                placeholder="Ej: Proyecto Minero / Taller Central"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Motivo del Contacto:</label>
            <select
              aria-label="Motivo del contacto"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Soporte y Consultas sobre el Software PGP 2026">Soporte y Consultas sobre el Software PGP 2026</option>
              <option value="Personalización de Plantillas Excel de 3 Hojas">Personalización de Plantillas Excel de 3 Hojas</option>
              <option value="Nuevas Funciones o Adaptaciones del Programa">Nuevas Funciones o Adaptaciones del Programa</option>
              <option value="Conectividad con Google Drive y Nube">Conectividad con Google Drive y Nube</option>
              <option value="Otros Proyectos de Desarrollo de Software">Otros Proyectos de Desarrollo de Software</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mensaje o Detalle del Requerimiento:</label>
            <textarea
              rows={3}
              placeholder="Indica qué necesitas consultar o coordinar con Jorge Ferrada..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-400">
              Al presionar el botón se abrirá WhatsApp con el mensaje listo para ser enviado a <strong>Jorge Ferrada (933331425)</strong>.
            </span>
            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/25 cursor-pointer shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Enviar por WhatsApp</span>
            </button>
          </div>
        </form>
      </section>

      {/* ============================================================== */}
      {/* 3. CAPACIDADES & ÁREAS DE DESARROLLO DEL AUTOR */}
      {/* ============================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <Laptop className="w-4 h-4" />
            <span>Desarrollo de Software</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Creación de plataformas a medida en React, TypeScript y entornos modernos para control de calidad y gestión industrial.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-blue-400 font-bold">
            <Code2 className="w-4 h-4" />
            <span>Procesamiento Excel & BD</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Automatización de planillas multi-hoja, persistencia local con IndexedDB y reportes PDF de alta precisión.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-purple-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Soporte Informático</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Asistencia continua, mantenimiento, respaldos programados y actualizaciones evolutivas para clientes y proyectos.
          </p>
        </div>
      </section>
    </div>
  );
};
