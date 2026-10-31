/**
 * Contexto de Autenticación y Control de Acceso Basado en Roles (RBAC)
 * Sistema Integral de Control de Calidad de Válvulas PGP 2026
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserSession } from '../types';

export interface AuthContextType {
  user: UserSession;
  allUsers: UserSession[];
  switchUser: (role: UserRole) => void;
  can: (action: PermissionAction) => boolean;
  logout: () => void;
}

export type PermissionAction = 
  | 'VIEW_DASHBOARD'
  | 'VIEW_VALVES'
  | 'CREATE_VALVE'
  | 'EDIT_VALVE'
  | 'DELETE_VALVE'
  | 'PERFORM_HYDRO_TEST'
  | 'SIGN_ITO_TEST'
  | 'APPROVE_QAQC_RELEASE'
  | 'MANAGE_PUNCH_LIST'
  | 'CLOSE_PUNCH_ITEM'
  | 'IMPORT_EXCEL'
  | 'EXPORT_DATA'
  | 'MANAGE_DATABASE_SQL'
  | 'UPLOAD_ATTACHMENT'
  | 'DELETE_ATTACHMENT';

// Usuarios preconfigurados para cada rol técnico (Datos de empresa neutros / en blanco)
const PRESET_USERS: Record<UserRole, UserSession> = {
  ADMINISTRADOR: {
    id: 'usr-admin-01',
    nombre: 'Administrador de Calidad',
    email: 'admin@calidad-valvulas.local',
    rol: 'ADMINISTRADOR',
    cargo: 'Administrador General QA/QC',
    organizacion: '[EMPRESA / PROYECTO]',
    firmaDigital: 'ADM-QAQC-01'
  },
  REVISOR_QAQC: {
    id: 'usr-qa-02',
    nombre: 'Supervisor QA/QC',
    email: 'qaqc@calidad-valvulas.local',
    rol: 'REVISOR_QAQC',
    cargo: 'Supervisión de Calidad & Trazabilidad',
    organizacion: '[EMPRESA / PROYECTO]',
    firmaDigital: 'SUP-QAQC-02'
  },
  INSPECTOR_ITO: {
    id: 'usr-ito-03',
    nombre: 'Inspector Técnico ITO',
    email: 'ito@inspeccion-tecnica.local',
    rol: 'INSPECTOR_ITO',
    cargo: 'Inspección Técnica de Obra (ITO)',
    organizacion: '[INSPECCIÓN TÉCNICA ITO]',
    firmaDigital: 'INSP-ITO-03'
  },
  OPERADOR_TALLER: {
    id: 'usr-op-04',
    nombre: 'Operador Banco de Pruebas',
    email: 'operador@taller-pruebas.local',
    rol: 'OPERADOR_TALLER',
    cargo: 'Técnico de Banco de Pruebas Hidrostáticas',
    organizacion: '[TALLER DE PRUEBAS]',
    firmaDigital: 'TEC-OP-04'
  },
  CONSULTA: {
    id: 'usr-view-05',
    nombre: 'Auditor Técnico / Consulta',
    email: 'auditor@consulta.local',
    rol: 'CONSULTA',
    cargo: 'Auditoría Técnica Externa',
    organizacion: '[AUDITORÍA EXTERNA]',
    firmaDigital: 'AUD-CONSULTA-05'
  }
};

// Matriz Estricta de Permisos por Rol
const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  ADMINISTRADOR: [
    'VIEW_DASHBOARD',
    'VIEW_VALVES',
    'CREATE_VALVE',
    'EDIT_VALVE',
    'DELETE_VALVE',
    'PERFORM_HYDRO_TEST',
    'SIGN_ITO_TEST',
    'APPROVE_QAQC_RELEASE',
    'MANAGE_PUNCH_LIST',
    'CLOSE_PUNCH_ITEM',
    'IMPORT_EXCEL',
    'EXPORT_DATA',
    'MANAGE_DATABASE_SQL',
    'UPLOAD_ATTACHMENT',
    'DELETE_ATTACHMENT'
  ],
  REVISOR_QAQC: [
    'VIEW_DASHBOARD',
    'VIEW_VALVES',
    'CREATE_VALVE',
    'EDIT_VALVE',
    'PERFORM_HYDRO_TEST',
    'APPROVE_QAQC_RELEASE',
    'MANAGE_PUNCH_LIST',
    'CLOSE_PUNCH_ITEM',
    'IMPORT_EXCEL',
    'EXPORT_DATA',
    'UPLOAD_ATTACHMENT'
  ],
  INSPECTOR_ITO: [
    'VIEW_DASHBOARD',
    'VIEW_VALVES',
    'PERFORM_HYDRO_TEST',
    'SIGN_ITO_TEST',
    'MANAGE_PUNCH_LIST',
    'CLOSE_PUNCH_ITEM',
    'EXPORT_DATA',
    'UPLOAD_ATTACHMENT'
  ],
  OPERADOR_TALLER: [
    'VIEW_DASHBOARD',
    'VIEW_VALVES',
    'CREATE_VALVE',
    'EDIT_VALVE',
    'PERFORM_HYDRO_TEST',
    'MANAGE_PUNCH_LIST',
    'UPLOAD_ATTACHMENT'
  ],
  CONSULTA: [
    'VIEW_DASHBOARD',
    'VIEW_VALVES',
    'EXPORT_DATA'
  ]
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    const saved = localStorage.getItem('pgp_valvulas_current_user');
    return saved ? JSON.parse(saved) : PRESET_USERS.ADMINISTRADOR;
  });

  useEffect(() => {
    localStorage.setItem('pgp_valvulas_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const switchUser = (role: UserRole) => {
    setCurrentUser(PRESET_USERS[role]);
  };

  const logout = () => {
    setCurrentUser(PRESET_USERS.CONSULTA);
  };

  const can = (action: PermissionAction): boolean => {
    const allowed = ROLE_PERMISSIONS[currentUser.rol] || [];
    return allowed.includes(action);
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        allUsers: Object.values(PRESET_USERS),
        switchUser,
        can,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
