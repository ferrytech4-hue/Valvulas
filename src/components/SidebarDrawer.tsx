/**
 * Menú Ocultable Lateral (Sidebar / Drawer Deslizable)
 * Sistema de Control de Calidad de Válvulas PGP 2026
 * Desarrollado por Jorge Ferrada
 */

import React, { useEffect } from 'react';
import { 
  ShieldCheck, 
  Home, 
  Gauge, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Calculator, 
  FileSpreadsheet, 
  Cloud, 
  Database, 
  BookOpen, 
  LifeBuoy, 
  Info, 
  X, 
  ChevronRight, 
  Download, 
  Plus, 
  MessageSquare, 
  UserCheck,
  Activity,
  HardDrive
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { useAuth } from '../services/authContext';
import { excelService } from '../services/excelService';
import { dbService } from '../services/storageService';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openNewValveModal?: () => void;
  onOpenImport?: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  openNewValveModal,
  onOpenImport
}) => {
  const { user, can } = useAuth();

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevenir scroll en body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSelectTab = (tab: ActiveTab) => {
    if (tab === 'import' && onOpenImport) {
      onOpenImport();
    } else {
      setActiveTab(tab);
    }
    onClose();
  };

  const navSections = [
    {
      title: 'MÓDULOS OPERATIVOS QA/QC',
      items: [
        {
          id: 'home' as ActiveTab,
          label: 'Inicio & Tutorial Guiado',
          icon: <Home className="w-4 h-4 text-blue-400" />,
          badge: 'Guía'
        },
        {
          id: 'dashboard' as ActiveTab,
          label: 'Dashboard General QA/QC',
          icon: <Gauge className="w-4 h-4 text-emerald-400" />
        },
        {
          id: 'valves' as ActiveTab,
          label: 'Matriz Maestra de Válvulas',
          icon: <Layers className="w-4 h-4 text-sky-400" />
        },
        {
          id: 'hydro' as ActiveTab,
          label: 'Pruebas Hidráulicas (PH)',
          icon: <CheckCircle2 className="w-4 h-4 text-teal-400" />,
          badge: 'API 598'
        },
        {
          id: 'punch' as ActiveTab,
          label: 'Punch List & Desviaciones',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />
        },
        {
          id: 'calculator' as ActiveTab,
          label: 'Calculadora Universal',
          icon: <Calculator className="w-4 h-4 text-cyan-400" />,
          badge: 'Normas'
        }
      ]
    },
    {
      title: 'GESTIÓN EXCEL & SINCRONIZACIÓN',
      items: [
        {
          id: 'excel_management' as ActiveTab,
          label: 'Carga y Edición de Excel',
          icon: <FileSpreadsheet className="w-4 h-4 text-emerald-400" />,
          badge: 'Multi-hoja'
        },
        {
          id: 'import' as ActiveTab,
          label: 'Asistente de Importación',
          icon: <FileSpreadsheet className="w-4 h-4 text-emerald-300" />,
          badge: 'Paso a Paso'
        },
        {
          id: 'drive' as ActiveTab,
          label: 'Google Drive (Nube)',
          icon: <Cloud className="w-4 h-4 text-blue-400" />,
          badge: 'OAuth 2.0'
        },
        {
          id: 'database' as ActiveTab,
          label: 'Base de Datos & Respaldos',
          icon: <Database className="w-4 h-4 text-purple-400" />,
          badge: 'IndexedDB'
        }
      ]
    },
    {
      title: 'SOPORTE, NORMAS & INFORMACIÓN',
      items: [
        {
          id: 'software_support' as ActiveTab,
          label: 'Soporte & Contacto Jorge Ferrada',
          icon: <LifeBuoy className="w-4 h-4 text-emerald-400" />,
          badge: 'WhatsApp'
        },
        {
          id: 'documentation' as ActiveTab,
          label: 'Normativa & Documentación',
          icon: <BookOpen className="w-4 h-4 text-indigo-400" />
        },
        {
          id: 'about' as ActiveTab,
          label: 'Acerca del Programa PGP 2026',
          icon: <Info className="w-4 h-4 text-slate-400" />,
          badge: 'v1.0.0'
        }
      ]
    }
  ];

  return (
    <>
      {/* Telón de fondo (Backdrop) oscurecido con animación */}
      <div 
        className={`fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Panel Lateral Deslizable (Sidebar Drawer) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-80 sm:w-88 bg-slate-900 border-r border-slate-800 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menú de Navegación Lateral"
      >
        {/* Cabecera del Menú Lateral */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-white font-mono tracking-tight">VALVEMASTER</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PGP 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Control de Calidad & QA/QC</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition border border-slate-800 cursor-pointer"
            aria-label="Cerrar menú lateral"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Estado de Usuario Activo y Rol */}
        <div className="p-3.5 mx-3 mt-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Usuario Activo:</span>
              <span className="font-semibold text-slate-200">{user.nombre}</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30">
            {user.rol}
          </span>
        </div>

        {/* Botones de Acción Rápida (Crear Válvula / Exportar Excel / Respaldo Local) */}
        <div className="px-3 pt-3 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            {can('CREATE_VALVE') && openNewValveModal && (
              <button
                onClick={() => {
                  onClose();
                  openNewValveModal();
                }}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Válvula</span>
              </button>
            )}

            {can('EXPORT_DATA') && (
              <button
                onClick={() => excelService.exportCompleteDatabaseToExcel()}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition cursor-pointer"
                title="Descargar base de datos en formato Excel .xlsx"
              >
                <Download className="w-3.5 h-3.5 text-slate-300" />
                <span>Exportar .xlsx</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              const fname = dbService.downloadLocalJsonBackup();
              alert(`¡Archivo local de respaldo "${fname}" descargado en tu computador!`);
            }}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-500/30 transition font-medium cursor-pointer"
            title="Crear y descargar archivo de copia de seguridad local en JSON"
          >
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            <span>Crear Respaldo Local (.json)</span>
          </button>
        </div>

        {/* Lista de Navegación con Scroll */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5 text-xs">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1.5">
              <span className="px-2 text-[10px] font-bold tracking-wider text-slate-500 font-mono block">
                {sec.title}
              </span>

              <div className="space-y-1">
                {sec.items.map((item) => {
                  const isActive = 
                    activeTab === item.id || 
                    (item.id === 'software_support' && (activeTab === 'support' || activeTab === 'creator_contact'));

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {item.badge && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Pie del Menú Lateral: Contacto Jorge Ferrada & Estado Offline */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 space-y-2.5">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                JF
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Soporte Informático:</span>
                <span className="text-xs font-bold text-white">Jorge Ferrada</span>
              </div>
            </div>
            <a
              href="https://wa.me/56933331425?text=Hola%20Jorge%20Ferrada%2C%20solicito%20asistencia%20t%C3%A9cnica%20para%20el%20Software%20PGP%202026."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition shadow-sm"
              title="Contactar al desarrollador por WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WSP</span>
            </a>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
            <span>Offline-First (Dexie)</span>
            <span>Versión 1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
