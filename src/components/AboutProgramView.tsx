/**
 * Acerca del Programa & Ficha Oficial del Creador
 * Sistema de Control de Calidad PGP 2026
 * 
 * Desarrollado por: Jorge Ferrada
 */

import React from 'react';
import { 
  ShieldCheck, 
  Code2, 
  Layers, 
  Cpu, 
  FileSpreadsheet, 
  Database, 
  Award, 
  MessageSquare, 
  Mail, 
  PhoneCall, 
  FileText, 
  CheckCircle2, 
  ExternalLink,
  BookOpen,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface AboutProgramViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const AboutProgramView: React.FC<AboutProgramViewProps> = ({ setActiveTab }) => {
  const appData = {
    name: 'Sistema Integral de Control de Calidad de Válvulas PGP 2026',
    brand: 'VALVEMASTER QA/QC',
    version: '1.0.0-release',
    buildDate: '31 de Octubre, 2026',
    architecture: 'Single Page Application (SPA) • Offline-First • IndexedDB & LocalStorage',
    license: 'Licencia de Uso Privado & Faena Industrial',
    developer: {
      name: 'Jorge Ferrada',
      role: 'Creador & Desarrollador de Software',
      whatsapp: '933331425',
      phone: '+56 9 3333 1425',
      phoneRaw: '56933331425',
      email: 'ferrytech4@gmail.com'
    }
  };

  const thirdPartyCredits = [
    { name: 'React 19', role: 'Biblioteca central de interfaces de usuario declarativas y reactivas', license: 'MIT' },
    { name: 'TypeScript', role: 'Tipado estático seguro y verificación de integridad de código', license: 'Apache 2.0' },
    { name: 'Dexie.js', role: 'Capa relacional y tipada sobre IndexedDB para almacenamiento local persistente', license: 'Apache 2.0' },
    { name: 'SheetJS (xlsx)', role: 'Procesamiento, lectura multi-hoja y exportación de archivos Excel en el navegador', license: 'Apache 2.0' },
    { name: 'jsPDF', role: 'Motor de renderizado vectorial para certificados técnicos y dossiers mensuales', license: 'MIT' },
    { name: 'Tailwind CSS', role: 'Sistema de diseño atómico para interfaces industriales responsivas', license: 'MIT' },
    { name: 'Lucide Icons', role: 'Iconografía técnica de alta precisión', license: 'ISC' },
    { name: 'Vite', role: 'Entorno y empaquetador de compilación de ultra alta velocidad', license: 'MIT' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12 max-w-5xl mx-auto">
      
      {/* ============================================================== */}
      {/* 1. HERO BANNER: ACERCA DEL PROGRAMA */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl text-white font-mono">{appData.brand}</span>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {appData.version}
                </span>
              </div>
              <p className="text-xs text-slate-400">{appData.name}</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            Software diseñado para la gestión integral de control de calidad, trazabilidad de componentes, 
            procesamiento de matrices en Excel, registro de protocolos de ensayo y emisión de dossiers de calidad. 
            Opera de manera completamente autónoma sin requerir conectividad permanente a la nube.
          </p>

          {/* Tarjeta del Creador y Desarrollador */}
          <div className="mt-6 p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Desarrollo & Autoría del Software:
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>{appData.developer.name}</span>
                  <span className="text-xs font-normal text-slate-400">({appData.developer.role})</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Contacto directo para desarrollo, soporte informático y adaptación de funcionalidades.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300 font-mono">
                  <span>Email: <strong className="text-white">{appData.developer.email}</strong></span>
                  <span>•</span>
                  <span>WhatsApp: <strong className="text-emerald-400">{appData.developer.whatsapp}</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <a
                  href={`https://wa.me/${appData.developer.phoneRaw}?text=Hola%20Jorge%20Ferrada%2C%20te%20contacto%20acerca%20del%20Software%20PGP%202026.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Creador</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. ESPECIFICACIONES TÉCNICAS DEL PROGRAMA */}
      {/* ============================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>Ficha Técnica de la Aplicación</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">Nombre del Software:</span>
            <p className="font-semibold text-slate-200">{appData.name}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">Versión y Fecha de Compilación:</span>
            <p className="font-semibold text-slate-200">{appData.version} ({appData.buildDate})</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">Arquitectura de Almacenamiento:</span>
            <p className="font-semibold text-slate-200">{appData.architecture}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">Licencia y Términos:</span>
            <p className="font-semibold text-slate-200">{appData.license}</p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. CRÉDITOS DE BIBLIOTECAS Y COMPONENTES OPEN SOURCE */}
      {/* ============================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Créditos de Bibliotecas y Componentes de Terceros</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Componentes de código abierto utilizados en la construcción del software</p>
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
                <th className="py-2.5 px-3">Biblioteca / Paquete</th>
                <th className="py-2.5 px-3">Función dentro del Software</th>
                <th className="py-2.5 px-3 text-right">Licencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
              {thirdPartyCredits.map((lib, idx) => (
                <tr key={idx} className="hover:bg-slate-950/40 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{lib.name}</td>
                  <td className="py-2.5 px-3 text-slate-300">{lib.role}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-400">{lib.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. AVISO LEGAL Y CONDICIONES DE USO */}
      {/* ============================================================== */}
      <section className="p-5 rounded-2xl bg-slate-950 border border-slate-850 space-y-2 text-xs text-slate-400">
        <h4 className="font-bold text-slate-300 flex items-center space-x-1.5 uppercase tracking-wider text-[11px]">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Aviso de Propiedad Intelectual y Privacidad de Datos</span>
        </h4>
        <p className="leading-relaxed">
          Este software fue desarrollado por <strong>Jorge Ferrada</strong> para gestión operativa y control de calidad. 
          Todos los datos ingresados, hojas de cálculo importadas, resultados de ensayos y reportes pertenecen 
          exclusivamente a los usuarios y empresas que operan la plataforma. El programa no transmite información 
          comercial ni técnica a servidores externos no autorizados.
        </p>
      </section>
    </div>
  );
};
