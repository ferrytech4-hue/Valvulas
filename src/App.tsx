/**
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 * Componente Principal de la Aplicación
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './services/authContext';
import { dbService } from './services/storageService';
import { Navbar, ActiveTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ValvesTable } from './components/ValvesTable';
import { ValveDetailModal } from './components/ValveDetailModal';
import { ValveFormModal } from './components/ValveFormModal';
import { HydroTestModal } from './components/HydroTestModal';
import { PunchListModal } from './components/PunchListModal';
import { AttachmentsModal } from './components/AttachmentsModal';
import { ImportWizardModal } from './components/ImportWizard/ImportWizardModal';
import { DatabaseSettingsModal } from './components/DatabaseSettingsModal';
import { SystemDocumentationModal } from './components/SystemDocumentationModal';
import { ExcelManagementView } from './components/ExcelManagementView';
import { MonthlyDossierPanel } from './components/MonthlyDossierPanel';
import { HomeTutorialView } from './components/HomeTutorialView';
import { SoftwareSupportView } from './components/SoftwareSupportView';
import { AboutProgramView } from './components/AboutProgramView';
import { GoogleDriveSyncPanel } from './components/GoogleDriveSyncPanel';
import { UniversalCalculatorView } from './components/UniversalCalculatorView';
import { SidebarDrawer } from './components/SidebarDrawer';
import { ValveRecord, HydroTestRecord, PunchItemRecord } from './types';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, can } = useAuth();

  // Estados de datos sincronizados con dbService
  const [valves, setValves] = useState<ValveRecord[]>([]);
  const [hydroTests, setHydroTests] = useState<HydroTestRecord[]>([]);
  const [punchItems, setPunchItems] = useState<PunchItemRecord[]>([]);

  // Pestaña Activa (Inicio & Tutorial por defecto)
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Modales
  const [detailValve, setDetailValve] = useState<ValveRecord | null>(null);
  const [editValve, setEditValve] = useState<ValveRecord | null>(null);
  const [isNewValveOpen, setIsNewValveOpen] = useState(false);
  const [hydroValve, setHydroValve] = useState<ValveRecord | null>(null);
  const [punchValve, setPunchValve] = useState<ValveRecord | null>(null);
  const [attachmentValve, setAttachmentValve] = useState<ValveRecord | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Notificaciones Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Cargar datos
  const refreshData = () => {
    setValves(dbService.getValves());
    setHydroTests(dbService.getHydroTests());
    setPunchItems(dbService.getPunchItems());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Manejador de Eliminación de Válvula con confirmación y control de permisos
  const handleDeleteValve = (id: string, tag: string) => {
    if (!can('DELETE_VALVE')) {
      showToast('No tiene permisos para eliminar registros de válvulas.', 'error');
      return;
    }

    if (window.confirm(`¿Está seguro de eliminar definitivamente la válvula "${tag}" de la matriz? Esta acción eliminará también en cascada sus pruebas hidrostáticas, punch list y adjuntos.`)) {
      const ok = dbService.deleteValve(id, user.nombre, user.rol);
      if (ok) {
        showToast(`Válvula "${tag}" eliminada correctamente.`);
        refreshData();
      } else {
        showToast('Error al eliminar válvula.', 'error');
      }
    }
  };

  // Manejador para vaciar la matriz y dejarla lista para importar
  const handleClearMatrix = () => {
    if (window.confirm('¿Está seguro de que desea limpiar todos los registros de la matriz de válvulas? La matriz quedará vacía y lista para una nueva importación limpia.')) {
      dbService.clearMatrix();
      refreshData();
      showToast('Matriz vaciada correctamente. Lista para importar archivo Excel.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Menú Ocultable Lateral (Sidebar Drawer) */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'import') {
            setIsImportOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        openNewValveModal={() => setIsNewValveOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
      />

      {/* Barra de Navegación Principal */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          if (tab === 'import') {
            setIsImportOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        openNewValveModal={() => setIsNewValveOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* Notificación Toast flotante */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-in slide-in-from-bottom-2 duration-200 bg-slate-900 border-slate-700 text-white">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* PESTAÑA: INICIO & TUTORIAL COMPLETO */}
        {activeTab === 'home' && (
          <HomeTutorialView
            valves={valves}
            hydroTests={hydroTests}
            punchItems={punchItems}
            setActiveTab={(tab) => {
              if (tab === 'import') setIsImportOpen(true);
              else setActiveTab(tab);
            }}
            onOpenImport={() => setIsImportOpen(true)}
          />
        )}

        {/* PESTAÑA: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <Dashboard
            valves={valves}
            hydroTests={hydroTests}
            punchItems={punchItems}
            setActiveTab={(tab) => {
              if (tab === 'import') setIsImportOpen(true);
              else setActiveTab(tab);
            }}
            openNewValveModal={() => setIsNewValveOpen(true)}
          />
        )}

        {/* PESTAÑA: MATRIZ DE VÁLVULAS */}
        {activeTab === 'valves' && (
          <ValvesTable
            valves={valves}
            onSelectValve={(v) => setDetailValve(v)}
            onEditValve={(v) => setEditValve(v)}
            onDeleteValve={handleDeleteValve}
            onOpenHydroTest={(v) => setHydroValve(v)}
            onOpenPunchList={(v) => setPunchValve(v)}
            onOpenAttachments={(v) => setAttachmentValve(v)}
            onOpenNewModal={() => setIsNewValveOpen(true)}
            onOpenImport={() => setIsImportOpen(true)}
            onClearMatrix={handleClearMatrix}
          />
        )}

        {/* PESTAÑA: CARGA Y GESTIÓN DE ARCHIVOS EXCEL */}
        {activeTab === 'excel_management' && (
          <ExcelManagementView
            onDataImported={refreshData}
          />
        )}

        {/* PESTAÑA: PRUEBAS HIDRÁULICAS */}
        {activeTab === 'hydro' && (
          <div className="space-y-5">
            <MonthlyDossierPanel
              hydroTests={hydroTests}
              valves={valves}
            />

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">Listado de Válvulas y Protocolos Individuales (API 598 / ISO 5208)</h2>
                <p className="text-xs text-slate-400">
                  Seleccione una válvula de la lista para registrar, consultar o descargar certificados individuales.
                </p>
              </div>
            </div>

            <ValvesTable
              valves={valves}
              onSelectValve={(v) => setDetailValve(v)}
              onEditValve={(v) => setEditValve(v)}
              onDeleteValve={handleDeleteValve}
              onOpenHydroTest={(v) => setHydroValve(v)}
              onOpenPunchList={(v) => setPunchValve(v)}
              onOpenAttachments={(v) => setAttachmentValve(v)}
              onOpenNewModal={() => setIsNewValveOpen(true)}
            />
          </div>
        )}

        {/* PESTAÑA: PUNCH LIST */}
        {activeTab === 'punch' && (
          <div className="space-y-4">
            <PunchListModal
              valve={null}
              onClose={() => setActiveTab('dashboard')}
              onPunchUpdated={() => {
                refreshData();
                showToast('Punch List actualizado correctamente');
              }}
            />
          </div>
        )}

        {/* PESTAÑA: BASE DE DATOS LOCAL & RESPALDOS */}
        {activeTab === 'database' && (
          <DatabaseSettingsModal />
        )}

        {/* PESTAÑA: DOCUMENTACIÓN & ENTREGABLES */}
        {activeTab === 'documentation' && (
          <SystemDocumentationModal />
        )}

        {/* PESTAÑA: CALCULADORA UNIVERSAL DE INGENIERÍA */}
        {activeTab === 'calculator' && (
          <UniversalCalculatorView
            setActiveTab={setActiveTab}
            openNewValveModal={() => setIsNewValveOpen(true)}
          />
        )}

        {/* PESTAÑA: CONECTIVIDAD & RESPALDOS CON GOOGLE DRIVE */}
        {activeTab === 'drive' && (
          <GoogleDriveSyncPanel
            onDataRestored={refreshData}
          />
        )}

        {/* PESTAÑA UNIFICADA: SOPORTE TÉCNICO & CONTACTO CON EL CREADOR (JORGE FERRADA) */}
        {(activeTab === 'software_support' || activeTab === 'support' || activeTab === 'creator_contact') && (
          <SoftwareSupportView
            setActiveTab={setActiveTab}
          />
        )}

        {/* PESTAÑA: ACERCA DEL PROGRAMA */}
        {activeTab === 'about' && (
          <AboutProgramView
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* ========================================================== */}
      {/* MODALES TÉCNICOS */}
      {/* ========================================================== */}

      {/* Modal Ficha Técnica y Certificado */}
      {detailValve && (
        <ValveDetailModal
          valve={detailValve}
          onClose={() => setDetailValve(null)}
          onOpenHydroTest={() => {
            setHydroValve(detailValve);
            setDetailValve(null);
          }}
          onOpenPunchList={() => {
            setPunchValve(detailValve);
            setDetailValve(null);
          }}
          onOpenAttachments={() => {
            setAttachmentValve(detailValve);
            setDetailValve(null);
          }}
          onEditValve={() => {
            setEditValve(detailValve);
            setDetailValve(null);
          }}
        />
      )}

      {/* Modal Crear / Editar Válvula */}
      {(isNewValveOpen || editValve) && (
        <ValveFormModal
          initialValve={editValve}
          onClose={() => {
            setIsNewValveOpen(false);
            setEditValve(null);
          }}
          onSaved={() => {
            refreshData();
            showToast(editValve ? 'Válvula actualizada correctamente' : 'Nueva válvula registrada en matriz');
          }}
        />
      )}

      {/* Modal Ensayos Hidráulicos */}
      {hydroValve && (
        <HydroTestModal
          valve={hydroValve}
          onClose={() => setHydroValve(null)}
          onTestSaved={() => {
            refreshData();
            showToast('Protocolo de ensayo guardado exitosamente');
          }}
        />
      )}

      {/* Modal Punch List para Válvula Específica */}
      {punchValve && (
        <PunchListModal
          valve={punchValve}
          onClose={() => setPunchValve(null)}
          onPunchUpdated={() => {
            refreshData();
            showToast('Observación de Punch List actualizada');
          }}
        />
      )}

      {/* Modal Adjuntos Técnicos */}
      {attachmentValve && (
        <AttachmentsModal
          valve={attachmentValve}
          onClose={() => setAttachmentValve(null)}
        />
      )}

      {/* Modal Asistente de Importación en 8 Pasos */}
      {isImportOpen && (
        <ImportWizardModal
          onClose={() => setIsImportOpen(false)}
          onImportCompleted={() => {
            refreshData();
            showToast('Importación de matriz completada con éxito');
          }}
        />
      )}

      {/* Pie de Página Industrial */}
      <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-500 py-4 px-6 text-xs text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sistema Integral de Control de Calidad de Válvulas PGP 2026 • QA/QC Industrial</span>
          <span>Arquitectura Costo Cero: Motor Local Autónomo (Offline-First) + Google Drive / PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
