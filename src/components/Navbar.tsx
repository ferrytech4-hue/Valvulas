/**
 * Barra de Navegación Principal y Cabecera Industrial
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 */

import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  FileSpreadsheet, 
  Gauge, 
  AlertTriangle, 
  Database, 
  BookOpen, 
  UserCheck, 
  Download, 
  CheckCircle2,
  HelpCircle,
  Edit3,
  Table,
  Home,
  Calculator,
  LifeBuoy,
  MessageSquare,
  Sparkles,
  Cloud,
  Info,
  Menu
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { excelService } from '../services/excelService';
import { UserRole } from '../types';

export type ActiveTab = 
  | 'home'
  | 'dashboard' 
  | 'valves' 
  | 'calculator'
  | 'excel_management'
  | 'hydro' 
  | 'punch' 
  | 'import' 
  | 'drive'
  | 'database' 
  | 'documentation'
  | 'software_support'
  | 'about'
  | 'creator_contact'
  | 'support';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openNewValveModal?: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onToggleSidebar 
}) => {
  const { user, switchUser, can } = useAuth();

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMINISTRADOR':
        return 'bg-purple-900/60 text-purple-200 border-purple-500/50';
      case 'REVISOR_QAQC':
        return 'bg-emerald-900/60 text-emerald-200 border-emerald-500/50';
      case 'INSPECTOR_ITO':
        return 'bg-blue-900/60 text-blue-200 border-blue-500/50';
      case 'OPERADOR_TALLER':
        return 'bg-amber-900/60 text-amber-200 border-amber-500/50';
      case 'CONSULTA':
        return 'bg-slate-800 text-slate-300 border-slate-600';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      {/* Barra superior con metadatos y selector de usuario RBAC */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-800/80">
          {/* Botón Menú Lateral Ocultable + Logo e Identidad del Sistema */}
          <div className="flex items-center space-x-2.5">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 transition border border-slate-700/80 flex items-center space-x-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                title="Abrir menú lateral de navegación"
                aria-label="Abrir menú lateral"
              >
                <Menu className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-semibold hidden sm:inline text-slate-200">Menú</span>
              </button>
            )}

            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight text-white font-mono">VALVEMASTER</span>
                  <span className="text-[11px] px-2 py-0.5 rounded font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    UNIVERSAL QA/QC
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Sistema Universal de Control de Calidad & Trazabilidad de Válvulas Industriales
                </p>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas y Selector de Rol RBAC */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Exportar base de datos a Excel */}
            {can('EXPORT_DATA') && (
              <button
                onClick={() => excelService.exportCompleteDatabaseToExcel()}
                className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                title="Exportar base de datos actual a archivo Excel multi-hoja compatible con Excel Web y OneDrive"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-300" />
                <span>Exportar .xlsx</span>
              </button>
            )}

            {/* Selector interactivo de Rol para pruebas de RBAC */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <UserCheck className="w-4 h-4 text-slate-400 hidden sm:block" />
              <div className="flex flex-col text-right">
                <span className="text-xs font-medium text-slate-200 leading-none">{user.nombre}</span>
                <span className="text-[10px] text-slate-400">{user.cargo}</span>
              </div>
              <select
                aria-label="Seleccionar rol de usuario activo"
                value={user.rol}
                onChange={(e) => switchUser(e.target.value as UserRole)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md border cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400 ${getRoleBadgeColor(user.rol)}`}
                title="Cambiar rol activo para probar permisos y restricciones en tiempo real"
              >
                <option value="ADMINISTRADOR">Admin (Todo)</option>
                <option value="REVISOR_QAQC">Revisor QA/QC</option>
                <option value="INSPECTOR_ITO">Inspector ITO</option>
                <option value="OPERADOR_TALLER">Operador Taller</option>
                <option value="CONSULTA">Solo Consulta</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación Principal */}
        <nav className="flex space-x-1 sm:space-x-4 py-2 overflow-x-auto no-scrollbar text-sm font-medium">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'home'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Home className="w-4 h-4 text-blue-400" />
            <span>Inicio & Tutorial</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Dashboard QA/QC</span>
          </button>

          <button
            onClick={() => setActiveTab('valves')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'valves'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Matriz de Válvulas</span>
          </button>

          <button
            onClick={() => setActiveTab('excel_management')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'excel_management'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Carga de Archivos Excel</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold hidden md:inline-block">Multi-hoja</span>
          </button>

          <button
            onClick={() => setActiveTab('hydro')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'hydro'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Pruebas Hidráulicas</span>
          </button>

          <button
            onClick={() => setActiveTab('punch')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'punch'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Punch List</span>
          </button>

          {/* Módulo Prioritario Destacado: Importación de Archivos */}
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap relative ${
              activeTab === 'import'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-emerald-300 hover:text-white hover:bg-emerald-950/50 border border-emerald-500/30'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span className="font-semibold">Importación Excel / CSV</span>
            <span className="bg-emerald-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              Paso a Paso
            </span>
          </button>

          {/* Calculadora Universal de Pruebas & Unidades */}
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span>Calculadora Universal</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-bold hidden lg:inline-block">API/ISO</span>
          </button>

          {/* Google Drive Conectividad & Respaldos */}
          <button
            onClick={() => setActiveTab('drive')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'drive'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cloud className="w-4 h-4 text-blue-400" />
            <span>Google Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'database'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4 text-purple-400" />
            <span>Base de Datos</span>
          </button>

          <button
            onClick={() => setActiveTab('documentation')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'documentation'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Documentación</span>
          </button>

          {/* Módulo Unificado: Soporte Técnico & Contacto */}
          <button
            onClick={() => setActiveTab('software_support')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'software_support' || activeTab === 'creator_contact' || activeTab === 'support'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-emerald-300 hover:text-white hover:bg-emerald-950/40 border border-emerald-500/30'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">Soporte & Contacto</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden sm:inline-block" title="Canal activo" />
          </button>

          {/* Módulo Separado: Acerca del Programa */}
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'about'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Info className="w-4 h-4 text-slate-300" />
            <span>Acerca de</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
