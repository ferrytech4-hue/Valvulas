/**
 * Servicio de Integración con Google Drive API v3
 * Sistema de Control de Calidad PGP 2026
 * 
 * Permite:
 * - Autenticación con OAuth 2.0 (alcance mínimo: https://www.googleapis.com/auth/drive.file)
 * - Crear y localizar la carpeta de respaldos de la aplicación en Google Drive
 * - Subir respaldos completos JSON de la base de datos local
 * - Listar respaldos existentes en Google Drive
 * - Descargar y restaurar un respaldo seleccionado
 * - Desconectar la cuenta y limpiar tokens en memoria
 */

export interface DriveBackupFile {
  id: string;
  name: string;
  createdTime: string;
  size?: string;
  mimeType: string;
}

export interface GoogleDriveStatus {
  isConnected: boolean;
  userEmail?: string;
  userName?: string;
  lastBackupDate?: string;
  backupFolderId?: string;
  error?: string;
}

const STORAGE_KEY_DRIVE_STATUS = 'pgp_valvulas_2026_drive_status';
const BACKUP_FOLDER_NAME = 'PGP_2026_Respaldos_Calidad';

class GoogleDriveService {
  private accessToken: string | null = null;
  private status: GoogleDriveStatus = {
    isConnected: false
  };

  constructor() {
    this.loadStatus();
  }

  private loadStatus() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRIVE_STATUS);
      if (saved) {
        this.status = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error cargando estado de Google Drive:', e);
    }
  }

  private saveStatus() {
    try {
      localStorage.setItem(STORAGE_KEY_DRIVE_STATUS, JSON.stringify(this.status));
    } catch (e) {
      console.warn('Error guardando estado de Google Drive:', e);
    }
  }

  public getStatus(): GoogleDriveStatus {
    return { ...this.status, isConnected: !!this.accessToken || this.status.isConnected };
  }

  public setAccessToken(token: string, userEmail?: string, userName?: string) {
    this.accessToken = token;
    this.status = {
      ...this.status,
      isConnected: true,
      userEmail: userEmail || this.status.userEmail,
      userName: userName || this.status.userName,
      error: undefined
    };
    this.saveStatus();
  }

  public disconnect() {
    this.accessToken = null;
    this.status = {
      isConnected: false
    };
    this.saveStatus();
  }

  /**
   * Obtiene o crea la carpeta de respaldos en Google Drive del usuario
   */
  public async getOrCreateBackupFolder(): Promise<string> {
    if (!this.accessToken) {
      throw new Error('No hay sesión activa en Google Drive. Conecte su cuenta primero.');
    }

    try {
      // 1. Buscar si ya existe la carpeta
      const q = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${BACKUP_FOLDER_NAME}' and trashed=false`);
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      if (!searchRes.ok) {
        if (searchRes.status === 401) {
          this.disconnect();
          throw new Error('La autorización de Google Drive ha expirado. Por favor, vuelva a conectar su cuenta.');
        }
        throw new Error(`Error consultando Google Drive (${searchRes.status})`);
      }

      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const folderId = searchData.files[0].id;
        this.status.backupFolderId = folderId;
        this.saveStatus();
        return folderId;
      }

      // 2. Si no existe, crear la carpeta
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: BACKUP_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
          description: 'Carpeta oficial de respaldos del Sistema de Control de Calidad de Válvulas PGP 2026'
        })
      });

      if (!createRes.ok) {
        throw new Error('No fue posible crear la carpeta de respaldos en Google Drive.');
      }

      const newFolder = await createRes.json();
      this.status.backupFolderId = newFolder.id;
      this.saveStatus();
      return newFolder.id;
    } catch (e: any) {
      this.status.error = e.message;
      this.saveStatus();
      throw e;
    }
  }

  /**
   * Sube un respaldo JSON a la carpeta de Google Drive
   */
  public async uploadBackup(dataJson: string, customName?: string): Promise<DriveBackupFile> {
    if (!this.accessToken) {
      throw new Error('Debe conectar Google Drive antes de subir respaldos.');
    }

    const folderId = await this.getOrCreateBackupFolder();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = customName || `PGP_Respaldo_Calidad_${timestamp}.json`;

    // Metadatos multipart para Drive v3
    const metadata = {
      name: fileName,
      parents: [folderId],
      mimeType: 'application/json',
      description: `Copia de seguridad del Sistema de Calidad PGP 2026 creada el ${new Date().toLocaleString('es-CL')}`
    };

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelim = "\r\n--" + boundary + "--";

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      dataJson +
      closeDelim;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Error al subir respaldo a Google Drive: ${res.status} ${errText}`);
    }

    const file = await res.json();
    this.status.lastBackupDate = new Date().toISOString();
    this.saveStatus();

    return {
      id: file.id,
      name: file.name,
      createdTime: new Date().toISOString(),
      mimeType: 'application/json'
    };
  }

  /**
   * Lista los respaldos guardados en la carpeta de Google Drive
   */
  public async listBackups(): Promise<DriveBackupFile[]> {
    if (!this.accessToken) {
      return [];
    }

    try {
      const folderId = await this.getOrCreateBackupFolder();
      const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,createdTime,size,mimeType)&orderBy=createdTime desc`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      if (!res.ok) {
        throw new Error(`Error listando respaldos (${res.status})`);
      }

      const data = await res.json();
      return data.files || [];
    } catch (e: any) {
      console.warn('Error al consultar lista de respaldos de Google Drive:', e);
      return [];
    }
  }

  /**
   * Descarga el contenido JSON de un archivo de respaldo desde Google Drive
   */
  public async downloadBackupContent(fileId: string): Promise<string> {
    if (!this.accessToken) {
      throw new Error('Debe autenticarse en Google Drive para descargar el archivo.');
    }

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });

    if (!res.ok) {
      throw new Error(`Error descargando contenido del archivo (${res.status})`);
    }

    return await res.text();
  }
}

export const googleDriveService = new GoogleDriveService();
