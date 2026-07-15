import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Layers, 
  Terminal, 
  BookOpen, 
  Eye, 
  Sliders, 
  CheckCircle,
  FileCheck2,
  X,
  Lock,
  Unlock,
  Shield,
  LogOut,
  User,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { FormularioSena, SyncLog, INITIAL_FORM_STATE, SyncStatus } from './types';
import Dashboard from './components/Dashboard';
import SenaForm from './components/SenaForm';
import FormDetail from './components/FormDetail';
import SyncLogConsole from './components/SyncLogConsole';
import { initAuth, googleSignIn, logout } from './googleAuth';
import { findSpreadsheet, createSpreadsheet, syncFormToSheet, syncAllToSheet, GoogleSpreadsheetInfo, syncFormToScript, fetchFormsFromSheet } from './googleSheetsService';

// Seed initial forms for immediate visual satisfaction
const SEED_FORMULARIOS: FormularioSena[] = [
  {
    id: 'f-1',
    createdAt: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    status: 'synced',
    syncAttemptedAt: new Date(Date.now() - 3.4 * 3600000).toISOString(),
    nombresCompletos: 'María Camila Restrepo Vahos',
    tipoDocumento: 'CC',
    numeroDocumento: '1035420119',
    paisExpedicion: 'Colombia',
    fechaExpedicion: '2019-05-12',
    deptoExpedicion: 'Antioquia',
    ciudadExpedicion: 'Medellín',
    fechaNacimiento: '1998-08-25',
    grupoSanguineo: 'O+',
    genero: 'Femenino',
    correo: 'mcamila@correo.com',
    celular: '3124567890',
    estrato: '2',
    grupoPoblacional: 'Campesina',
    nombreEps: 'Sura',
    discapacidad: 'No',
    cabezaFamilia: 'No',
    victimaViolencia: 'No',
    deptoResidencia: 'Antioquia',
    ciudadResidencia: 'Medellín',
    barrio: 'San Javier',
    nombreInstitucion: 'SENA Regional Antioquia',
    gradoEscolaridad: 'Tecnólogo',
    tituloObtenido: 'Tecnólogo en Control Ambiental',
    fechaTerminacion: '2023-11-20',
    ocupacion: 'Estudiante Aprendiz',
    nombreIdea: 'Café Inteligente: Monitoreo IoT del Suelo',
    codigoIdea: 'SENA-TP-2026-1928',
    descripcionIdea: 'Sistema autónomo de sensores alimentados por mini paneles solares que miden la humedad y nutrientes del suelo cafetero. Los datos se envían a través de LoRaWAN para optimizar el riego y fertilización.',
    solucionParecida: 'Sistemas importados costosos que no se adaptan a la topografía de ladera del minifundio colombiano.',
    reemplazaExistente: 'Reemplaza la inspección visual empírica de humedad de la tierra.',
    cuentaPmv: 'Sí',
    pruebasClientes: 'Sí',
    estadoActual: 'Prototipo funcional alfa testeado en finca del suroeste antioqueño.',
    entiendeModelo: true,
    quienUsara: 'Pequeños caficultores de la región andina colombiana.',
    necesidadesClientes: 'Evitar el desperdicio de abono por lavado de lluvias y prevenir plagas por exceso de humedad.',
    problemaClientes: 'Falta de tecnificación accesible en fincas cafeteras tradicionales.',
    requiereEmpaque: 'Carcasa plástica biodegradable impresa en 3D para protección climática de los sensores.',
    estrategiaPrecio: 'Suscripción de soporte técnico y venta única de kit de sensores a bajo costo.',
    recursosPuestaMarcha: 'Taller de electrónica familiar y apoyo de laboratorios de Tecnoparque.',
    generadoVentas: 'No',
    apoyoEscalabilidad: 'Asesoría en diseño de PCB y vinculación con programas del Fondo Emprender.',
    equipoTrabajo: 'María Camila Restrepo (Líder técnica) y Jorge Mario Restrepo (Asesor agrícola).',
    requisitosLegales: 'No',
    descripcionRequisitosLegales: '',
    requierePermisos: 'No',
    descripcionPermisos: '',
    constitucionInteres: 'Persona Natural',
    enlaceVideo: 'https://youtube.com/watch?v=cafe-inteligente-sena',
    estadoPrototipo: 'Prototipo',
    categoriaIdea: 'Agroindustria y Ciencias Agropecuarias',
    vieneConvocatoria: 'Sí',
    descripcionConvocatoria: 'Semillero de Investigación SENNOVA 2026',
    avaladaEntidad: 'Sí',
    nombreEntidadAval: 'SENA Complejo Tecnológico Turístico y Agroindustrial',
    aceptaTratamientoDatos: true
  },
  {
    id: 'f-2',
    createdAt: new Date(Date.now() - 1.2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1.2 * 3600000).toISOString(),
    status: 'pending',
    nombresCompletos: 'Carlos Julio Díaz',
    tipoDocumento: 'CC',
    numeroDocumento: '80234123',
    paisExpedicion: 'Colombia',
    fechaExpedicion: '2005-09-18',
    deptoExpedicion: 'Cundinamarca',
    ciudadExpedicion: 'Bogotá D.C.',
    fechaNacimiento: '1987-03-04',
    grupoSanguineo: 'A+',
    genero: 'Masculino',
    correo: 'carlos.diaz@email.com',
    celular: '3007654321',
    estrato: '3',
    grupoPoblacional: 'Ninguno',
    nombreEps: 'Sanitas',
    discapacidad: 'No',
    cabezaFamilia: 'Sí',
    victimaViolencia: 'No',
    deptoResidencia: 'Bogotá D.C.',
    ciudadResidencia: 'Bogotá D.C.',
    barrio: 'Teusaquillo',
    nombreInstitucion: 'Universidad Distrital',
    gradoEscolaridad: 'Profesional',
    tituloObtenido: 'Ingeniero Forestal',
    fechaTerminacion: '2012-05-15',
    ocupacion: 'Consultor Independiente',
    nombreIdea: 'Amazonas EcoTour: Ruta Verde Autoguiada',
    codigoIdea: 'SENA-TP-2026-4402',
    descripcionIdea: 'Aplicativo móvil offline que utiliza geolocalización GPS para guiar a turistas por senderos ecológicos autorizados del Amazonas, promoviendo el cuidado de especies nativas e integrando comercios locales indígenas.',
    solucionParecida: 'Folletos de papel turísticos que se dañan y guías que no tienen cobertura de red celular en la selva.',
    reemplazaExistente: 'Reemplaza mapas físicos tradicionales y tours desorganizados.',
    cuentaPmv: 'Sí',
    pruebasClientes: 'No',
    estadoActual: 'Diseño de interfaces completado y base de datos local mapeada.',
    entiendeModelo: true,
    quienUsara: 'Turistas nacionales y extranjeros aventureros.',
    necesidadesClientes: 'Información verídica, segura y offline sobre flora y fauna de la selva amazónica.',
    problemaClientes: 'Falta de internet en zonas rurales y desinformación de senderos seguros.',
    requiereEmpaque: 'Ninguno, es un aplicativo de distribución digital (App Store y Play Store).',
    estrategiaPrecio: 'Cobro por descarga de mapas premium sin internet y comisión a hostales ecológicos locales.',
    recursosPuestaMarcha: 'Equipos propios de cómputo y celular de pruebas.',
    generadoVentas: 'No',
    apoyoEscalabilidad: 'Asesoría en desarrollo móvil multiplataforma offline y mentoría de mercadeo.',
    equipoTrabajo: 'Carlos Julio Díaz (Mapeo de rutas) y Laura Sofía Díaz (Programación front-end).',
    requisitosLegales: 'Sí',
    descripcionRequisitosLegales: 'Registro Nacional de Turismo (RNT).',
    requierePermisos: 'Sí',
    descripcionPermisos: 'Permiso de operación en parques nacionales naturales.',
    constitucionInteres: 'Persona Jurídica',
    enlaceVideo: 'https://youtube.com/watch?v=amazonas-ecotour',
    estadoPrototipo: 'Versión Beta',
    categoriaIdea: 'Desarrollo de Software y Apps',
    vieneConvocatoria: 'No',
    descripcionConvocatoria: '',
    avaladaEntidad: 'No',
    nombreEntidadAval: '',
    aceptaTratamientoDatos: true
  }
];

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage warning: Unable to read from localStorage.", e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage warning: Unable to write to localStorage.", e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage warning: Unable to remove from localStorage.", e);
    }
  }
};

export default function App() {
  // Role selection: 'public' (default, only registers ideas) | 'admin' (can access dashboard & sync logs)
  const [role, setRole] = useState<'public' | 'admin'>(() => {
    const saved = safeStorage.getItem('sena_user_role');
    return (saved as 'public' | 'admin') || 'public';
  });

  // Hidden admin access logic (5 clicks on logo)
  const [logoClickCount, setLogoClickCount] = useState(0);
  const logoResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    if (logoResetTimeoutRef.current) {
      clearTimeout(logoResetTimeoutRef.current);
    }
    setLogoClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setLoginError('');
        setAdminPassword('');
        setShowAdminLogin(true);
        return 0;
      }
      return next;
    });
    logoResetTimeoutRef.current = setTimeout(() => {
      setLogoClickCount(0);
    }, 3000);
  };

  // Check URL query parameters for admin access
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('login') === 'true' || params.get('admin') === '1') {
      setLoginError('');
      setAdminPassword('');
      setShowAdminLogin(true);
    }
  }, []);

  // Navigation states: 'dashboard' | 'form' | 'detail'
  const [currentView, setCurrentView] = useState<'dashboard' | 'form' | 'detail'>(() => {
    const savedRole = safeStorage.getItem('sena_user_role');
    return savedRole === 'admin' ? 'dashboard' : 'form';
  });

  // Admin Access Modal State
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Delete confirmation modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Public submission success state
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [lastSubmittedCode, setLastSubmittedCode] = useState('');
  const [formKey, setFormKey] = useState(0);
  
  // Data State
  const [formularios, setFormularios] = useState<FormularioSena[]>(() => {
    const saved = safeStorage.getItem('sena_formularios');
    return saved ? JSON.parse(saved) : SEED_FORMULARIOS;
  });

  const [selectedForm, setSelectedForm] = useState<FormularioSena | null>(null);

  // Connection Simulation State
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    const saved = safeStorage.getItem('sena_is_online');
    return saved !== 'false'; // default to true
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const syncInProgress = useRef(false);
  const [showConsole, setShowConsole] = useState(true);

  // Google Sheets Integration State
  const [syncMethod, setSyncMethod] = useState<'oauth' | 'script'>('script');
  const [scriptUrl, setScriptUrl] = useState<string>(() => {
    const saved = safeStorage.getItem('sena_script_url');
    if (saved && saved.trim() !== '') {
      return saved;
    }
    return (import.meta as any).env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyjwyTtUONyKg40nf4hm-8f6jQbFhuJdNAlerSMqKrVoqTCZSrUM1DAwOtE_POi9ZKb/exec';
  });

  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [spreadsheetInfo, setSpreadsheetInfo] = useState<GoogleSpreadsheetInfo | null>(() => {
    const saved = safeStorage.getItem('sena_google_spreadsheet_info');
    return saved ? JSON.parse(saved) : null;
  });
  const [isGConnecting, setIsGConnecting] = useState(false);
  const [isGSyncing, setIsGSyncing] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);

  // Logs State
  const [logs, setLogs] = useState<SyncLog[]>(() => {
    const saved = safeStorage.getItem('sena_sync_logs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 4 * 3600000).toLocaleTimeString(),
        type: 'info',
        message: 'Base de datos offline local de Tecnoparque inicializada correctamente.'
      },
      {
        id: 'log-2',
        timestamp: new Date(Date.now() - 3.4 * 3600000).toLocaleTimeString(),
        type: 'success',
        message: 'Formulario de campo #SENA-TP-2026-1928 cargado y sincronizado automáticamente.'
      }
    ];
  });

  // Log adding helper
  const addLog = useCallback((type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const newLog: SyncLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  // Save changes to localStorage helper
  useEffect(() => {
    safeStorage.setItem('sena_formularios', JSON.stringify(formularios));
  }, [formularios]);

  useEffect(() => {
    safeStorage.setItem('sena_sync_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    safeStorage.setItem('sena_is_online', String(isOnline));
  }, [isOnline]);

  useEffect(() => {
    safeStorage.setItem('sena_user_role', role);
  }, [role]);

  useEffect(() => {
    safeStorage.setItem('sena_sync_method', syncMethod);
  }, [syncMethod]);

  useEffect(() => {
    safeStorage.setItem('sena_script_url', scriptUrl);
  }, [scriptUrl]);

  // Initialize Google Workspace Authentication on mount (only if oauth method is selected to avoid Firebase errors)
  useEffect(() => {
    if (syncMethod !== 'oauth') {
      return;
    }
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        addLog('success', `[GOOGLE] Sesión de Google activa para: ${user.email}`);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, [syncMethod, addLog]);

  const handleConnectGoogleSheets = async () => {
    setIsGConnecting(true);
    setGoogleAuthError(null);
    addLog('info', 'Iniciando conexión con Google Drive y Google Sheets...');
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        addLog('success', `[GOOGLE] Conectado exitosamente con Google: ${result.user.email}`);

        // Automatically search or create the spreadsheet
        addLog('info', 'Buscando planilla "SENA - Registro de Ideas" en Google Drive...');
        let sheet = await findSpreadsheet(result.accessToken);
        if (!sheet) {
          addLog('info', 'No se encontró la planilla. Creando una nueva en Google Drive...');
          sheet = await createSpreadsheet(result.accessToken);
          addLog('success', 'Planilla "SENA - Registro de Ideas" creada con éxito.');
        } else {
          addLog('success', 'Planilla "SENA - Registro de Ideas" encontrada y conectada.');
        }

        setSpreadsheetInfo(sheet);
        safeStorage.setItem('sena_google_spreadsheet_info', JSON.stringify(sheet));
      }
    } catch (error: any) {
      console.error('Error al conectar Google Sheets:', error);
      const errCode = error.code || '';
      setGoogleAuthError(errCode || error.message || String(error));
      addLog('error', `[GOOGLE] Fallo al conectar con Google: ${error.message || error}`);
    } finally {
      setIsGConnecting(false);
    }
  };

  const handleDisconnectGoogleSheets = async () => {
    const confirmed = window.confirm('¿Está seguro de desconectar la cuenta de Google Sheets? El guardado automático en Drive se detendrá.');
    if (!confirmed) return;

    try {
      await logout();
      setGoogleUser(null);
      setGoogleToken(null);
      setSpreadsheetInfo(null);
      safeStorage.removeItem('sena_google_spreadsheet_info');
      addLog('warning', '[GOOGLE] Sesión de Google Sheets cerrada.');
    } catch (error: any) {
      addLog('error', `Error al cerrar sesión de Google: ${error.message}`);
    }
  };

  const handleSyncAllToGoogleSheets = async () => {
    if (!googleToken || !spreadsheetInfo) {
      addLog('error', 'Por favor, conecte su cuenta de Google Sheets primero.');
      return;
    }

    setIsGSyncing(true);
    addLog('info', 'Iniciando sincronización bidireccional con Google Sheets...');
    try {
      // 1. Obtener registros actuales de Google Sheets
      const sheetForms = await fetchFormsFromSheet(googleToken, spreadsheetInfo.id);
      addLog('info', `[EXCEL] Descargados ${sheetForms.length} registros desde la hoja de cálculo de Google.`);

      // 2. Realizar combinación de registros
      const localForms = [...formularios];
      const mergedForms: FormularioSena[] = [...localForms];

      let importedCount = 0;
      let updatedLocalCount = 0;
      let uploadedCount = 0;

      // Un conjunto de IDs que existen en el Google Sheet para saber si están presentes
      const sheetIdSet = new Set(sheetForms.map(f => f.id));
      const sheetCodeSet = new Set(sheetForms.map(f => f.codigoIdea).filter(Boolean));

      // Paso A: Importar y actualizar desde Google Sheets a local
      for (const sheetForm of sheetForms) {
        const localIndex = mergedForms.findIndex(f => f.id === sheetForm.id || (f.codigoIdea && f.codigoIdea === sheetForm.codigoIdea));
        if (localIndex === -1) {
          // No existe localmente, se importa
          mergedForms.push(sheetForm);
          importedCount++;
        } else {
          // Existe localmente, actualizamos si no es un borrador local activo o pendiente
          const localForm = mergedForms[localIndex];
          if (localForm.status !== 'draft') {
            mergedForms[localIndex] = {
              ...localForm,
              ...sheetForm,
              status: 'synced'
            };
            updatedLocalCount++;
          }
        }
      }

      // Paso B: Subir registros locales que no estén en Google Sheets o estén pendientes
      // Registros que necesitan subirse:
      // - Cualquier registro con estado 'pending'
      // - Cualquier registro con estado 'synced' que no exista en la hoja de cálculo (por si fue borrado en la hoja o es una nueva hoja)
      const formsToUpload = mergedForms.filter(f => 
        f.status === 'pending' || 
        (f.status === 'synced' && !sheetIdSet.has(f.id) && !sheetCodeSet.has(f.codigoIdea))
      );

      if (formsToUpload.length > 0) {
        addLog('info', `[EXCEL] Subiendo ${formsToUpload.length} registros locales faltantes a Google Sheets...`);
        for (const fToUpload of formsToUpload) {
          const now = new Date().toISOString();
          const syncedForm = {
            ...fToUpload,
            status: 'synced' as const,
            syncAttemptedAt: now
          };
          
          await syncFormToSheet(googleToken, spreadsheetInfo.id, syncedForm);
          
          const idx = mergedForms.findIndex(f => f.id === fToUpload.id);
          if (idx !== -1) {
            mergedForms[idx] = syncedForm;
          }
          uploadedCount++;
        }
      }

      // 3. Ordenar cronológicamente (más recientes primero)
      mergedForms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // 4. Actualizar estados locales y localStorage
      setFormularios(mergedForms);
      safeStorage.setItem('sena_formularios', JSON.stringify(mergedForms));

      addLog('success', `[SINCRO] Sincronización bidireccional completada con éxito.`);
      if (importedCount > 0) addLog('success', `  - ${importedCount} registros nuevos importados al dispositivo.`);
      if (updatedLocalCount > 0) addLog('info', `  - ${updatedLocalCount} registros actualizados con la versión de Google Sheets.`);
      if (uploadedCount > 0) addLog('success', `  - ${uploadedCount} registros locales sincronizados en Google Sheets.`);
      if (importedCount === 0 && updatedLocalCount === 0 && uploadedCount === 0) {
        addLog('success', '  - ¡Todos los registros de este dispositivo y Google Sheets coinciden perfectamente!');
      }

    } catch (error: any) {
      console.error(error);
      addLog('error', `Error durante la sincronización bidireccional: ${error.message || error}`);
    } finally {
      setIsGSyncing(false);
    }
  };

  // AUTOMATIC SYNC ALGORITHM FOR GOOGLE SHEETS
  const startSyncProcess = useCallback(async () => {
    if (!isOnline || syncInProgress.current) return;

    const pendingForms = formularios.filter(f => f.status === 'pending');
    if (pendingForms.length === 0) return;

    if (syncMethod === 'script') {
      if (!scriptUrl) {
        return;
      }
    } else {
      // If Google Sheets is not connected, we wait for user authentication
      if (!googleToken || !spreadsheetInfo) {
        return;
      }
    }

    syncInProgress.current = true;
    setIsSyncing(true);
    addLog('info', `[SINCRO] Detectados ${pendingForms.length} formularios pendientes. Iniciando transmisión directa a Google Sheets...`);

    try {
      for (const formToSync of pendingForms) {
        addLog('info', `[CONEXIÓN] Transfiriendo #${formToSync.codigoIdea} a Google Sheets...`);
        
        const now = new Date().toISOString();
        const syncedForm = {
          ...formToSync,
          status: 'synced' as const,
          syncAttemptedAt: now
        };

        if (syncMethod === 'script') {
          // Sync via Google Apps Script Macro
          await syncFormToScript(scriptUrl, syncedForm);
        } else {
          // Sync via Google Sheets OAuth API
          await syncFormToSheet(googleToken!, spreadsheetInfo!.id, syncedForm);
        }
        addLog('success', `[EXCEL] Sincronizado #${formToSync.codigoIdea} en Google Sheets.`);

        // Update local state to synced
        setFormularios(prev => prev.map(f => f.id === formToSync.id ? syncedForm : f));

        // Stagger for visual progression
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      addLog('success', '[SINCRO] Sincronización automática a Google Sheets finalizada con éxito.');
    } catch (error: any) {
      console.error(error);
      addLog('error', `[FALLO] Error durante la sincronización a Google Sheets: ${error.message || error}`);
    } finally {
      syncInProgress.current = false;
      setIsSyncing(false);
    }
  }, [isOnline, formularios, syncMethod, scriptUrl, googleToken, spreadsheetInfo, addLog]);

  // Alert when forms are pending but Google Sheets is not connected yet
  useEffect(() => {
    if (isOnline && syncMethod === 'oauth' && !googleToken) {
      const pendingCount = formularios.filter(f => f.status === 'pending').length;
      if (pendingCount > 0) {
        addLog('warning', `[GOOGLE] Hay ${pendingCount} formularios pendientes. Conecte su cuenta de Google Sheets para iniciar la transmisión automática.`);
      }
    } else if (isOnline && syncMethod === 'script' && !scriptUrl) {
      const pendingCount = formularios.filter(f => f.status === 'pending').length;
      if (pendingCount > 0) {
        addLog('warning', `[MACRO] Hay ${pendingCount} formularios pendientes. Ingrese la URL de su Macro de Google (Apps Script) para iniciar la transmisión automática.`);
      }
    }
  }, [isOnline, syncMethod, googleToken, scriptUrl, formularios, addLog]);

  // AUTOMATIC SYNC ALGORITHM
  // Triggers whenever there's a change to the connection status or whenever new forms enter pending queue
  useEffect(() => {
    startSyncProcess();
  }, [isOnline, formularios, startSyncProcess]);

  const toggleConnection = () => {
    const newState = !isOnline;
    setIsOnline(newState);
    if (newState) {
      addLog('success', 'Conectividad reestablecida. Buscando cambios pendientes de subir...');
    } else {
      addLog('warning', 'Sin conexión a internet. Los nuevos registros quedarán encolados de manera segura offline.');
    }
  };

  const handleCreateOrUpdateForm = (formData: Partial<FormularioSena>, finalStatus: SyncStatus, isAutosave?: boolean) => {
    const now = new Date().toISOString();
    let savedForm: FormularioSena;

    if (selectedForm && formularios.some(f => f.id === selectedForm.id)) {
      // EDIT EXISTING RECORD
      const updatedForm = {
        ...selectedForm,
        ...formData,
        status: finalStatus,
        updatedAt: now,
      } as FormularioSena;

      savedForm = updatedForm;

      if (isOnline && finalStatus === 'pending' && ((syncMethod === 'script' && scriptUrl) || (syncMethod === 'oauth' && googleToken && spreadsheetInfo))) {
        // Guardar directamente en Google Sheets como synced
        const syncedForm = {
          ...updatedForm,
          status: 'synced' as const,
          syncAttemptedAt: now
        };
        savedForm = syncedForm;
        setFormularios(prev => prev.map(f => f.id === updatedForm.id ? syncedForm : f));
        addLog('info', `[EXCEL] Sincronizando #${updatedForm.codigoIdea} en Google Sheets...`);
        
        const syncPromise = syncMethod === 'script'
          ? syncFormToScript(scriptUrl, syncedForm)
          : syncFormToSheet(googleToken!, spreadsheetInfo!.id, syncedForm);

        syncPromise
        .then(() => {
          addLog('success', `[ÉXITO] Formulario #${updatedForm.codigoIdea} sincronizado automáticamente en Google Sheets.`);
        })
        .catch(err => {
          addLog('error', `[EXCEL] Error de auto-sincronización directa: ${err.message}`);
          // Fallback to local state with original pending status so it tries again in background
          setFormularios(prev => prev.map(f => f.id === updatedForm.id ? updatedForm : f));
        });
      } else {
        setFormularios(prev => prev.map(f => f.id === updatedForm.id ? updatedForm : f));
        if (!isAutosave) {
          const isTransitionToPending = selectedForm.status === 'draft' && finalStatus === 'pending';
          const logMsg = isTransitionToPending 
            ? `Formulario #${updatedForm.codigoIdea} enviado a cola de sincronización de Google Sheets.` 
            : `Borrador #${updatedForm.codigoIdea} actualizado localmente.`;
          addLog(isTransitionToPending ? 'info' : 'success', logMsg);
        }
      }
    } else {
      // NEW RECORD CREATION
      const newForm: FormularioSena = {
        ...formData,
        id: `form-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        status: finalStatus,
      } as FormularioSena;

      savedForm = newForm;

      if (isOnline && finalStatus === 'pending' && ((syncMethod === 'script' && scriptUrl) || (syncMethod === 'oauth' && googleToken && spreadsheetInfo))) {
        // Guardar directamente en Google Sheets como synced
        const syncedForm = {
          ...newForm,
          status: 'synced' as const,
          syncAttemptedAt: now
        };
        savedForm = syncedForm;
        setFormularios(prev => [syncedForm, ...prev]);
        addLog('info', `[EXCEL] Sincronizando #${newForm.codigoIdea} en Google Sheets...`);
        
        const syncPromise = syncMethod === 'script'
          ? syncFormToScript(scriptUrl, syncedForm)
          : syncFormToSheet(googleToken!, spreadsheetInfo!.id, syncedForm);

        syncPromise
        .then(() => {
          addLog('success', `[ÉXITO] Nuevo formulario #${newForm.codigoIdea} sincronizado automáticamente en Google Sheets.`);
        })
        .catch(err => {
          addLog('error', `[EXCEL] Error de auto-sincronización directa: ${err.message}`);
          // Fallback to local state with original pending status so it can sync in background
          setFormularios(prev => [newForm, ...prev]);
        });
      } else {
        setFormularios(prev => [newForm, ...prev]);
        if (!isAutosave) {
          if (finalStatus === 'pending') {
            addLog('info', `Nuevo formulario de campo registrado (#${newForm.codigoIdea}). Encolado para sincronización en Google Sheets.`);
          } else {
            addLog('success', `Borrador guardado localmente de forma segura (#${newForm.codigoIdea}).`);
          }
        }
      }
    }

    if (isAutosave) {
      setSelectedForm(savedForm);
    } else {
      if (role === 'admin') {
        setCurrentView('dashboard');
        setSelectedForm(null);
      } else {
        setLastSubmittedCode(savedForm.codigoIdea || 'SENA-TP');
        setShowSuccessScreen(true);
        setCurrentView('form');
        setSelectedForm(null);
      }
    }
  };

  const handleEditTrigger = (form: FormularioSena) => {
    setSelectedForm(form);
    setCurrentView('form');
  };

  const handleViewTrigger = (form: FormularioSena) => {
    setSelectedForm(form);
    setCurrentView('detail');
  };

  const handleDeleteTrigger = (id: string) => {
    const formToDelete = formularios.find(f => f.id === id);
    if (!formToDelete) return;
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    const formToDelete = formularios.find(f => f.id === id);
    if (formToDelete) {
      setFormularios(prev => prev.filter(f => f.id !== id));
      addLog('warning', `Eliminado formulario #${formToDelete.codigoIdea} del almacén local.`);

      if (selectedForm?.id === id) {
        setSelectedForm(null);
        setCurrentView('dashboard');
      }
    }
    setDeleteConfirmId(null);
  };

  const handleAdminLogout = () => {
    setRole('public');
    setCurrentView('form');
    setSelectedForm(null);
    setShowConsole(false);
    addLog('info', 'Sesión de administración cerrada correctamente.');
  };

  const triggerManualSync = () => {
    if (!isOnline) {
      addLog('error', 'No es posible sincronizar. Por favor, active la simulación de internet (ONLINE) primero.');
      return;
    }
    startSyncProcess();
  };

  // EXPORTERS
  const exportAllToCsv = () => {
    const headers = [
      'ID_SENA',
      'Codigo_Idea',
      'Estado_Sincronizacion',
      'Nombres_Completos',
      'Tipo_Doc',
      'Numero_Doc',
      'Fecha_Nacimiento',
      'Correo',
      'Celular',
      'Departamento_Residencia',
      'Ciudad_Residencia',
      'Nombre_Idea',
      'Categoria',
      'Descripcion_Idea',
      'Cuenta_PMV',
      'Generado_Ventas',
      'Fecha_Recopilacion'
    ];

    const rows = formularios.map(f => [
      f.id,
      f.codigoIdea,
      f.status,
      `"${(f.nombresCompletos || '').replace(/"/g, '""')}"`,
      f.tipoDocumento,
      f.numeroDocumento,
      f.fechaNacimiento,
      f.correo,
      f.celular,
      f.deptoResidencia,
      `"${(f.ciudadResidencia || '').replace(/"/g, '""')}"`,
      `"${(f.nombreIdea || '').replace(/"/g, '""')}"`,
      `"${(f.categoriaIdea || '').replace(/"/g, '""')}"`,
      `"${(f.descripcionIdea || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`,
      f.cuentaPmv,
      f.generadoVentas,
      f.createdAt
    ]);

    // Use BOM for Excel compatibility with Spanish accents (UTF-8 with BOM)
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SENA_REGISTRO_CAMPO_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addLog('success', 'Planilla completa exportada como CSV para Excel.');
  };

  const exportAllToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formularios, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.setAttribute('download', `SENA_BACKUP_CAMPO_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('success', 'Copia de seguridad en crudo JSON descargada.');
  };

  const exportSingleToJson = (form: FormularioSena) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(form, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.setAttribute('download', `FORMULACION_SENA_${form.codigoIdea}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('success', `Exportado JSON individual para la idea #${form.codigoIdea}`);
  };

  return (
    <div id="main-app-container" className="min-h-screen bg-[#f4f6f8] text-neutral-800 font-sans flex flex-col selection:bg-[#39A900] selection:text-white">
      
      {/* Top Main Navigation Header (Always Visible except when printing) */}
      <header id="main-header" className="bg-[#212121] border-b-4 border-[#39A900] text-white py-3 px-4 md:px-8 shadow-md flex items-center justify-between sticky top-0 z-50 print:hidden select-none">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick} title="Doble clic o 5 clics para ingresar como administrador">
          <div className="bg-white p-1 rounded-lg flex items-center justify-center w-10 h-10 select-none shadow-sm">
            <svg viewBox="0 0 100 100" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Head */}
              <circle cx="50" cy="14" r="8.5" fill="#39A900" />
              
              {/* SENA Text */}
              <text 
                x="50" 
                y="36" 
                textAnchor="middle" 
                fill="#39A900" 
                fontSize="18" 
                fontWeight="900" 
                fontFamily='"Inter", "Arial Black", sans-serif' 
                letterSpacing="0.05em"
              >
                SENA
              </text>
              
              {/* Body - shoulders */}
              <rect x="10" y="42" width="80" height="7" fill="#39A900" />
              
              {/* Body - outer legs */}
              <path d="M50 49 L50 55 L15 90 L25 90 L50 65 L75 90 L85 90 Z" fill="#39A900" />
              
              {/* Body - inner chevron */}
              <path d="M50 70 L30 90 L38 90 L50 78 L62 90 L70 90 Z" fill="#39A900" />
            </svg>
          </div>
          <div className="border-l border-neutral-700 pl-3">
            <span className="text-[10px] font-black tracking-widest text-[#39A900] block flex items-center gap-1.5">
              TECNOPARQUE COLOMBIA
              {role === 'admin' && (
                <span className="bg-[#39A900]/20 text-[#39A900] text-[8px] font-bold px-1.5 py-0.5 rounded border border-[#39A900]/40 uppercase tracking-normal">
                  ADMINISTRADOR
                </span>
              )}
            </span>
            <span className="text-xs text-neutral-300 font-bold block leading-tight">Formulación y Registro de la Idea</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-neutral-400 bg-neutral-900 px-2 sm:px-3 py-1.5 rounded-lg border border-neutral-800">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#39A900]" />
                <span className="font-bold">CONEXIÓN CENTRAL ACTIVA</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span className="font-bold">MODO LOCAL SIN COBERTURA</span>
              </>
            )}
          </div>

          {role === 'admin' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedForm(null);
                  setCurrentView('dashboard');
                }}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                  currentView === 'dashboard' ? 'bg-[#39A900] text-white' : 'hover:bg-neutral-800 text-neutral-200'
                }`}
              >
                Tablero
              </button>
              <button
                onClick={() => {
                  setSelectedForm(null);
                  setCurrentView('form');
                  setShowSuccessScreen(false);
                }}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                  currentView === 'form' && !selectedForm ? 'bg-[#39A900] text-white' : 'hover:bg-neutral-800 text-neutral-200'
                }`}
              >
                Formulario
              </button>
              <button
                onClick={handleAdminLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-950/40 hover:text-red-300 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-900/40"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setLoginError('');
                setAdminPassword('');
                setShowAdminLogin(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-neutral-900 text-neutral-200 hover:bg-[#39A900] hover:text-white rounded-lg transition-colors border border-neutral-800 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Acceso Administrador</span>
            </button>
          )}
        </div>
      </header>

      {/* Primary Application Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Dynamic Screen Mounting */}
        {currentView === 'dashboard' && role === 'admin' && (
          <Dashboard
            formularios={formularios}
            isOnline={isOnline}
            scriptUrl={scriptUrl}
            onSetScriptUrl={setScriptUrl}
            onToggleOnline={toggleConnection}
            onNewForm={() => {
              setSelectedForm(null);
              setCurrentView('form');
            }}
            onEditForm={handleEditTrigger}
            onViewForm={handleViewTrigger}
            onDeleteForm={handleDeleteTrigger}
            onForceSync={triggerManualSync}
            isSyncing={isSyncing}
            onExportAllCsv={exportAllToCsv}
            onExportAllJson={exportAllToJson}
          />
        )}

        {/* Success Screen for Public users */}
        {role === 'public' && showSuccessScreen && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center max-w-2xl mx-auto border border-neutral-100 animate-fade-in my-8">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
              <CheckCircle className="w-12 h-12 text-[#39A900]" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight mb-3">
              ¡Idea Registrada con Éxito!
            </h2>
            
            <p className="text-neutral-600 mb-8 max-w-md mx-auto leading-relaxed">
              Tu postulación ha sido guardada de forma segura en nuestro sistema local de Tecnoparque.
            </p>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 mb-8 text-left max-w-md mx-auto">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Código Único de Registro (Idea)
              </span>
              <span className="text-xl font-black text-[#39A900] tracking-wide font-mono block">
                {lastSubmittedCode}
              </span>
              <div className="h-px bg-neutral-200 my-3"></div>
              <p className="text-xs text-neutral-500 leading-normal">
                Guarda este código para tus registros. Cuando el sistema detecte cobertura de internet, tus datos se sincronizarán directamente con el servidor central de Google Sheets de Tecnoparque Colombia.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <button
                onClick={() => {
                  setShowSuccessScreen(false);
                  setFormKey(prev => prev + 1); // remount empty form
                }}
                className="flex-1 bg-[#39A900] hover:bg-[#2e8800] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-900/10 cursor-pointer active:scale-95"
              >
                Registrar Otra Idea de Negocio
              </button>
            </div>
          </div>
        )}

        {currentView === 'form' && (role === 'admin' || !showSuccessScreen) && (
          <div key={formKey} className="w-full">
            <SenaForm
              initialData={selectedForm}
              onSave={handleCreateOrUpdateForm}
              onCancel={() => {
                if (role === 'admin') {
                  setSelectedForm(null);
                  setCurrentView('dashboard');
                } else {
                  if (window.confirm('¿Desea limpiar el formulario para comenzar de nuevo?')) {
                    setFormKey(prev => prev + 1);
                  }
                }
              }}
              isOnline={isOnline}
            />
          </div>
        )}

        {currentView === 'detail' && role === 'admin' && selectedForm && (
          <FormDetail
            formulario={selectedForm}
            onBack={() => {
              setSelectedForm(null);
              setCurrentView('dashboard');
            }}
            onExportSingleJson={exportSingleToJson}
          />
        )}

      </main>

      {/* Admin PIN Verification Modal Dialog */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-100 max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-[#212121] border-b-4 border-[#39A900] text-white px-6 py-4 flex justify-between items-center select-none">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#39A900]" />
                <span className="font-bold tracking-tight text-sm">Acceso Administrativo</span>
              </div>
              <button 
                onClick={() => setShowAdminLogin(false)}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const normalized = adminPassword.trim().toLowerCase();
                if (normalized === 'admin' || normalized === '1234' || normalized === 'tecnoparque') {
                  setRole('admin');
                  setCurrentView('dashboard');
                  setShowAdminLogin(false);
                  setAdminPassword('');
                  setLoginError('');
                  addLog('success', 'Sesión de administración iniciada con éxito.');
                } else {
                  setLoginError('PIN de seguridad incorrecto. Intente de nuevo.');
                }
              }} 
              className="p-6 space-y-4"
            >
              <p className="text-xs text-neutral-500 leading-relaxed">
                Ingrese el PIN de seguridad asignado para ingresar a la gestión de datos de ideas, configuración de Google Sheets y exportaciones.
              </p>

              <div>
                <label className="block text-xs font-black text-neutral-600 uppercase tracking-wider mb-1.5">
                  PIN de Seguridad
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="Ingrese PIN de acceso"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (loginError) setLoginError('');
                    }}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                {loginError && (
                  <p className="text-red-600 text-xs font-semibold mt-2 flex items-center gap-1">
                    <span>⚠️</span> {loginError}
                  </p>
                )}
                <p className="text-[10px] text-neutral-400 mt-2 font-mono">
                  PIN de demostración: <span className="font-bold">admin</span> o <span className="font-bold">1234</span>
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="flex-1 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#39A900] hover:bg-[#2e8800] text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-md shadow-emerald-900/10 cursor-pointer"
                >
                  Confirmar PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmId && (() => {
        const formToDelete = formularios.find(f => f.id === deleteConfirmId);
        if (!formToDelete) return null;
        return (
          <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-neutral-100 max-w-md w-full overflow-hidden transform scale-100 transition-all">
              {/* Header */}
              <div className="bg-red-600 border-b-4 border-red-800 text-white px-6 py-4 flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-extrabold tracking-tight text-sm uppercase">Confirmar Eliminación</span>
                </div>
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="text-red-200 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-100 flex items-start gap-3">
                  <Trash2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1 text-left">
                    <p className="font-bold">¿Está completamente seguro de eliminar esta idea de negocio?</p>
                    <p className="text-red-700/80">Esta acción no se puede deshacer y el registro se eliminará permanentemente del almacenamiento local de este dispositivo.</p>
                  </div>
                </div>

                <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 space-y-2 text-left">
                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    <span className="text-neutral-400 font-bold uppercase">Código:</span>
                    <span className="col-span-2 text-neutral-800 font-mono font-bold">{formToDelete.codigoIdea}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    <span className="text-neutral-400 font-bold uppercase">Idea/Proyecto:</span>
                    <span className="col-span-2 text-neutral-800 font-bold">{formToDelete.nombreIdea || 'Sin nombre'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    <span className="text-neutral-400 font-bold uppercase">Emprendedor:</span>
                    <span className="col-span-2 text-neutral-600 font-medium">{formToDelete.nombresCompletos || 'Anónimo'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-md shadow-red-900/10 cursor-pointer text-center"
                >
                  Eliminar Registro
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Floating Log Console Control Button (Hidden when printing) */}
      {role === 'admin' && (
        <div className="fixed bottom-4 right-4 z-50 print:hidden flex items-center gap-2">
          <button
            onClick={() => setShowConsole(prev => !prev)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl text-xs font-black transition-all cursor-pointer ${
              showConsole 
                ? 'bg-[#39A900] hover:bg-[#2e8800] text-white' 
                : 'bg-[#1e1e1e] hover:bg-neutral-800 text-neutral-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>{showConsole ? 'Ocultar Consola' : 'Ver Consola Sincro'}</span>
            {formularios.filter(f => f.status === 'pending').length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>
        </div>
      )}

      {/* Sync Real-Time Console Drawer (Hidden when printing) */}
      {role === 'admin' && showConsole && (
        <div className="print:hidden sticky bottom-0 z-40 w-full">
          <SyncLogConsole
            logs={logs}
            onClear={() => setLogs([])}
            isOnline={isOnline}
            isSyncing={isSyncing}
            onForceSync={triggerManualSync}
            pendingCount={formularios.filter(f => f.status === 'pending').length}
          />
        </div>
      )}

      {/* Tiny clean footer */}
      <footer className="bg-neutral-100 border-t border-neutral-200 py-3.5 text-center text-[10px] text-neutral-400 font-mono tracking-tight print:hidden select-none">
        <div>© 2026 Servicio Nacional de Aprendizaje SENA - Tecnoparque Colombia</div>
        <div className="text-[9px] text-neutral-300 mt-0.5">Recopilador Móvil de Campo v1.0.0 (Offline-First Ready)</div>
      </footer>
    </div>
  );
}
