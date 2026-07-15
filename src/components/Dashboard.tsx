import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  FileText, 
  Trash2, 
  Edit3, 
  Eye, 
  Download, 
  CheckCircle, 
  Clock, 
  FileEdit, 
  Layers,
  Database,
  Info,
  ExternalLink,
  LogOut,
  Share2,
  Copy,
  Check,
  Link
} from 'lucide-react';
import { FormularioSena } from '../types';

interface DashboardProps {
  formularios: FormularioSena[];
  isOnline: boolean;
  scriptUrl: string;
  onSetScriptUrl: (url: string) => void;
  onToggleOnline: () => void;
  onNewForm: () => void;
  onEditForm: (form: FormularioSena) => void;
  onViewForm: (form: FormularioSena) => void;
  onDeleteForm: (id: string) => void;
  onForceSync: () => void;
  isSyncing: boolean;
  onExportAllCsv: () => void;
  onExportAllJson: () => void;
}

export default function Dashboard({
  formularios,
  isOnline,
  scriptUrl,
  onSetScriptUrl,
  onToggleOnline,
  onNewForm,
  onEditForm,
  onViewForm,
  onDeleteForm,
  onForceSync,
  isSyncing,
  onExportAllCsv,
  onExportAllJson,
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'synced' | 'pending' | 'draft'>('all');
  const [copied, setCopied] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);
  const [showScriptInstructions, setShowScriptInstructions] = useState(false);
  const [isTestingScript, setIsTestingScript] = useState(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
  const [domainCopied, setDomainCopied] = useState(false);

  const pendingCount = formularios.filter(f => f.status === 'pending').length;
  const syncedCount = formularios.filter(f => f.status === 'synced').length;
  const draftCount = formularios.filter(f => f.status === 'draft').length;

  const filteredFormularios = formularios.filter(form => {
    const matchesSearch = 
      (form.nombreIdea || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (form.nombresCompletos || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (form.codigoIdea || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      form.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate percentage of category counts for visual summary chart
  const categoriesCount: Record<string, number> = {};
  formularios.forEach(f => {
    const cat = f.categoriaIdea || 'Sin Categoría';
    categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
  });

  const categoriesList = Object.entries(categoriesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div id="dashboard-root" className="space-y-6">
      {/* Top Banner with Network State Control */}
      <div className="bg-[#212121] text-white p-5 rounded-2xl shadow-md border-b-4 border-[#39A900] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#39A900] animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#39A900]">
              Sistema de Recopilación Tecnoparque SENA
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Formulación de Ideas & Proyectos Offline-First
          </h1>
          <p className="text-neutral-400 text-xs mt-1 max-w-xl">
            Herramienta móvil de campo diseñada para registrar ideas de negocio de aprendices y ciudadanos en regiones sin conectividad, sincronizándolas de forma automática al detectar red.
          </p>
        </div>

        {/* Network Toggle Simulator */}
        <div className="flex flex-col items-stretch sm:items-end gap-2 bg-neutral-900 p-3 rounded-xl border border-neutral-800 w-full md:w-auto">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Simulador de Conectividad:
            </span>
            <button
              onClick={onToggleOnline}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isOnline
                  ? 'bg-[#39A900]/15 text-[#39A900] border border-[#39A900]/30 hover:bg-[#39A900]/25'
                  : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 animate-bounce" />
                  <span>MODO ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>MODO OFFLINE</span>
                </>
              )}
            </button>
          </div>
          <span className="text-[9px] text-neutral-500 text-left sm:text-right">
            {isOnline 
              ? '✓ Las ideas "Pendientes" se subirán de forma automática' 
              : '⚠ Los registros se guardarán de forma segura en el dispositivo'}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Total */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-neutral-100 text-neutral-700">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Capturado</span>
            <span className="text-2xl font-black text-neutral-800">{formularios.length}</span>
          </div>
        </div>

        {/* KPI: Sincronizados */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-[#39A900]">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Sincronizados</span>
            <span className="text-2xl font-black text-emerald-600">{syncedCount}</span>
          </div>
        </div>

        {/* KPI: Pendientes */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          {pendingCount > 0 && <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/10 rotate-45 translate-x-6 -translate-y-6"></div>}
          <div className={`p-2.5 rounded-lg ${pendingCount > 0 ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-amber-50 text-amber-500'}`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Pendientes Envío</span>
            <span className={`text-2xl font-black ${pendingCount > 0 ? 'text-amber-600' : 'text-neutral-800'}`}>
              {pendingCount}
            </span>
          </div>
        </div>

        {/* KPI: Borradores */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-500">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Borradores Locales</span>
            <span className="text-2xl font-black text-blue-600">{draftCount}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Left list & filters, Right stats summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Form Records list & actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
            
            {/* List Header and Search Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
              <h3 className="font-bold text-neutral-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#39A900]" />
                Registros de Campo Recopilados
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={onNewForm}
                  className="flex items-center gap-1.5 bg-[#39A900] hover:bg-[#2e8800] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Formulario
                </button>
              </div>
            </div>

            {/* Filters and Search Input */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar por idea, persona o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900] transition-all"
                />
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200 overflow-x-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === 'all' ? 'bg-white text-neutral-800 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Todos ({formularios.length})
                </button>
                <button
                  onClick={() => setStatusFilter('synced')}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === 'synced' ? 'bg-white text-emerald-600 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Sincronizados ({syncedCount})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === 'pending' ? 'bg-white text-amber-600 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Pendientes ({pendingCount})
                </button>
                <button
                  onClick={() => setStatusFilter('draft')}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === 'draft' ? 'bg-white text-blue-600 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Borradores ({draftCount})
                </button>
              </div>
            </div>

            {/* Forms Table List */}
            {filteredFormularios.length === 0 ? (
              <div className="py-12 text-center text-neutral-400">
                <FileText className="w-12 h-12 mx-auto opacity-20 text-neutral-500 mb-2" />
                <p className="text-xs font-bold uppercase text-neutral-400">No se encontraron registros</p>
                <p className="text-[10px] mt-1 text-neutral-500">
                  {searchTerm ? 'Pruebe con otros términos de búsqueda.' : 'Presione "Nuevo Formulario" para capturar datos en el campo.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-neutral-100">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
                      <th className="px-4 py-3 uppercase tracking-wider text-[9px]">Código / Idea</th>
                      <th className="px-4 py-3 uppercase tracking-wider text-[9px]">Emprendedor (Usuario)</th>
                      <th className="px-4 py-3 uppercase tracking-wider text-[9px]">Categoría</th>
                      <th className="px-4 py-3 uppercase tracking-wider text-[9px] text-center">Estado</th>
                      <th className="px-4 py-3 uppercase tracking-wider text-[9px] text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredFormularios.map((form) => (
                      <tr key={form.id} className="hover:bg-neutral-50/50 transition-colors group">
                        
                        {/* Column 1: Code and Name */}
                        <td className="px-4 py-3.5">
                          <span className="block font-mono text-[10px] text-neutral-400 mb-0.5">{form.codigoIdea}</span>
                          <span className="font-bold text-neutral-800 block line-clamp-1 group-hover:text-[#39A900] transition-colors">
                            {form.nombreIdea || 'Idea sin nombre'}
                          </span>
                        </td>

                        {/* Column 2: User Nombres */}
                        <td className="px-4 py-3.5">
                          <span className="font-medium text-neutral-700 block">{form.nombresCompletos || 'Anónimo'}</span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">{form.celular || 'Sin celular'}</span>
                        </td>

                        {/* Column 3: Category */}
                        <td className="px-4 py-3.5">
                          <span className="inline-block px-2 py-0.5 bg-neutral-100 rounded text-[10px] font-semibold text-neutral-600">
                            {form.categoriaIdea || 'Por asignar'}
                          </span>
                        </td>

                        {/* Column 4: Sync Status Badge */}
                        <td className="px-4 py-3.5 text-center">
                          {form.status === 'synced' ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] rounded-full font-bold">
                              • Sincronizado
                            </span>
                          ) : form.status === 'pending' ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] rounded-full font-bold animate-pulse">
                              • Pendiente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[9px] rounded-full font-bold">
                              • Borrador
                            </span>
                          )}
                        </td>

                        {/* Column 5: Action buttons */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Details */}
                            <button
                              onClick={() => onViewForm(form)}
                              className="p-1 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-all cursor-pointer"
                              title="Ver formato oficial imprimible (PDF)"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit form */}
                            <button
                              onClick={() => onEditForm(form)}
                              className="p-1 text-neutral-400 hover:text-[#39A900] hover:bg-neutral-100 rounded transition-all cursor-pointer"
                              title="Editar datos de este registro"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete form */}
                            <button
                              onClick={() => onDeleteForm(form.id)}
                              className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50/50 rounded transition-all cursor-pointer"
                              title="Eliminar registro"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Category Summary & Export Suite */}
        <div className="space-y-6">

          {/* Google Sheets Integration Card */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-neutral-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#0F9D58] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
                Sincronización con Google Sheets
              </h4>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                scriptUrl 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200/50'
              }`}>
                {scriptUrl ? 'MACRO ACTIVA' : 'MACRO PENDIENTE'}
              </span>
            </div>

            <div className="space-y-4">
                <p className="text-neutral-500 text-[11px] leading-relaxed">
                  Sincronización directa usando una <strong>Macro de Google (Apps Script Web App)</strong>. No requiere inicio de sesión en celulares ni navegadores externos, eliminando al 100% los errores de dominio o 403.
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black text-neutral-600 uppercase tracking-wider">
                      URL de la Macro de Google (Web App)
                    </label>
                    <button
                      type="button"
                      onClick={() => onSetScriptUrl('https://script.google.com/macros/s/AKfycbyjwyTtUONyKg40nf4hm-8f6jQbFhuJdNAlerSMqKrVoqTCZSrUM1DAwOtE_POi9ZKb/exec')}
                      className="text-[9px] font-black uppercase text-[#39A900] hover:underline cursor-pointer"
                    >
                      Restaurar Predeterminada
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={scriptUrl}
                      onChange={(e) => onSetScriptUrl(e.target.value.trim())}
                      className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all font-mono"
                    />
                  </div>
                  {scriptUrl === 'https://script.google.com/macros/s/AKfycbyjwyTtUONyKg40nf4hm-8f6jQbFhuJdNAlerSMqKrVoqTCZSrUM1DAwOtE_POi9ZKb/exec' ? (
                    <span className="block text-[9px] text-emerald-600 font-bold">
                      ✓ Utilizando la URL predeterminada central de Tecnoparque Colombia.
                    </span>
                  ) : (
                    <span className="block text-[9px] text-neutral-400">
                      ✓ Todos los registros se transmitirán de manera transparente e instantánea a esta URL.
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={!scriptUrl || isTestingScript}
                    onClick={async () => {
                      if (!scriptUrl) return;
                      setIsTestingScript(true);
                      setTestSuccess(null);
                      try {
                        const testForm = {
                          id: 'form-test-' + Date.now(),
                          createdAt: new Date().toISOString(),
                          codigoIdea: 'SENA-TEST-123',
                          nombresCompletos: 'Registro de Prueba de Conexión',
                          tipoDocumento: 'CC',
                          numeroDocumento: '999999',
                          correo: 'tecnoparque@test.com',
                          celular: '3000000000',
                          deptoResidencia: 'SENA',
                          ciudadResidencia: 'SENA',
                          nombreIdea: 'Idea de Prueba de Conexión',
                          categoriaIdea: 'Prueba de Sistema',
                          descripcionIdea: 'Este es un registro generado automáticamente para confirmar el enlace directo con Google Sheets.',
                          cuentaPmv: 'Sí',
                          pruebasClientes: 'Sí',
                          generadoVentas: 'No',
                          equipoTrabajo: 'Robot de Integración'
                        };
                        
                        await fetch(scriptUrl, {
                          method: 'POST',
                          mode: 'no-cors',
                          headers: {
                            'Content-Type': 'text/plain;charset=utf-8'
                          },
                          body: JSON.stringify(testForm)
                        });
                        
                        setTestSuccess(true);
                        setTimeout(() => setTestSuccess(null), 5000);
                      } catch (e) {
                        console.error(e);
                        setTestSuccess(false);
                      } finally {
                        setIsTestingScript(false);
                      }
                    }}
                    className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-black rounded-lg text-[#39A900] bg-[#39A900]/5 hover:bg-[#39A900]/10 border border-[#39A900]/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingScript ? 'animate-spin' : ''}`} />
                    {isTestingScript ? 'Probando...' : 'Probar Conexión'}
                  </button>
                  
                  {testSuccess === true && (
                    <div className="w-full text-center bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold p-2 rounded-lg animate-fade-in">
                      ¡Test enviado con éxito! Verifique la primera fila de su planilla de Google Sheets.
                    </div>
                  )}
                  {testSuccess === false && (
                    <div className="w-full text-center bg-red-50 border border-red-200 text-red-800 text-[10px] font-bold p-2 rounded-lg animate-fade-in">
                      Error al enviar el test. Verifique la URL de su macro y su conexión.
                    </div>
                  )}
                </div>

                {/* Macro Code Accordion */}
                <div className="border border-neutral-200/80 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowScriptInstructions(!showScriptInstructions)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-neutral-50 text-neutral-700 text-[11px] font-bold hover:bg-neutral-100 transition-colors text-left"
                  >
                    <span>⚙️ Ver instrucciones y código para copiar</span>
                    <span className="text-neutral-400 font-mono text-xs">{showScriptInstructions ? '▲' : '▼'}</span>
                  </button>
                  {showScriptInstructions && (
                    <div className="p-4 bg-white border-t border-neutral-100 space-y-3.5 text-xs text-neutral-600 leading-normal">
                      <p className="font-bold text-neutral-800">Siga estos 3 pasos rápidos:</p>
                      <ol className="list-decimal pl-4 space-y-2 text-[11px]">
                        <li>
                          Abra su planilla de Google Sheets. Vaya a <strong>Extensiones &gt; Apps Script</strong>.
                        </li>
                        <li>
                          Borre todo el código que aparezca allí y pegue el siguiente script:
                        </li>
                        <div className="space-y-1.5">
                          <pre className="bg-neutral-900 text-neutral-100 p-3 rounded-lg text-[9px] overflow-x-auto font-mono max-h-40 whitespace-pre">
{`function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var data = JSON.parse(e.postData.contents);
    
    // Si la hoja está vacía, escribimos las cabeceras
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "ID_REGISTRO", "CODIGO_IDEA", "FECHA_CREACION", "NOMBRES_COMPLETOS", 
        "TIPO_DOC", "NUMERO_DOC", "CORREO", "CELULAR", "DEPTO_RESIDENCIA", 
        "CIUDAD_RESIDENCIA", "NOMBRE_IDEA", "CATEGORIA", "DESCRIPCION", 
        "CUENTA_PMV", "PRUEBAS_CLIENTES", "VENTAS", "EQUIPO"
      ]);
    }
    
    var idToFind = data.id || "";
    var foundRowIndex = -1;
    
    if (idToFind !== "") {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        // Obtenemos todos los IDs de la primera columna
        var ids = sheet.getRange(1, 1, lastRow, 1).getValues();
        for (var i = 0; i < ids.length; i++) {
          if (ids[i][0] === idToFind) {
            foundRowIndex = i + 1; // Fila en base 1
            break;
          }
        }
      }
    }
    
    var rowValues = [
      data.id || "",
      data.codigoIdea || "",
      data.createdAt || "",
      data.nombresCompletos || "",
      data.tipoDocumento || "",
      data.numeroDocumento || "",
      data.correo || "",
      data.celular || "",
      data.deptoResidencia || "",
      data.ciudadResidencia || "",
      data.nombreIdea || "",
      data.categoriaIdea || "",
      data.descripcionIdea || "",
      data.cuentaPmv || "",
      data.pruebasClientes || "",
      data.generadoVentas || "",
      data.equipoTrabajo || ""
    ];
    
    if (foundRowIndex !== -1) {
      // Si el ID ya existe, sobreescribimos la fila existente
      sheet.getRange(foundRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      // Si no existe, agregamos una nueva fila
      sheet.appendRow(rowValues);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}
                          </pre>
                          <button
                            type="button"
                            onClick={() => {
                              const code = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var data = JSON.parse(e.postData.contents);
    
    // Si la hoja está vacía, escribimos las cabeceras
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "ID_REGISTRO", "CODIGO_IDEA", "FECHA_CREACION", "NOMBRES_COMPLETOS", 
        "TIPO_DOC", "NUMERO_DOC", "CORREO", "CELULAR", "DEPTO_RESIDENCIA", 
        "CIUDAD_RESIDENCIA", "NOMBRE_IDEA", "CATEGORIA", "DESCRIPCION", 
        "CUENTA_PMV", "PRUEBAS_CLIENTES", "VENTAS", "EQUIPO"
      ]);
    }
    
    var idToFind = data.id || "";
    var foundRowIndex = -1;
    
    if (idToFind !== "") {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        // Obtenemos todos los IDs de la primera columna
        var ids = sheet.getRange(1, 1, lastRow, 1).getValues();
        for (var i = 0; i < ids.length; i++) {
          if (ids[i][0] === idToFind) {
            foundRowIndex = i + 1; // Fila en base 1
            break;
          }
        }
      }
    }
    
    var rowValues = [
      data.id || "",
      data.codigoIdea || "",
      data.createdAt || "",
      data.nombresCompletos || "",
      data.tipoDocumento || "",
      data.numeroDocumento || "",
      data.correo || "",
      data.celular || "",
      data.deptoResidencia || "",
      data.ciudadResidencia || "",
      data.nombreIdea || "",
      data.categoriaIdea || "",
      data.descripcionIdea || "",
      data.cuentaPmv || "",
      data.pruebasClientes || "",
      data.generadoVentas || "",
      data.equipoTrabajo || ""
    ];
    
    if (foundRowIndex !== -1) {
      // Si el ID ya existe, sobreescribimos la fila existente
      sheet.getRange(foundRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      // Si no existe, agregamos una nueva fila
      sheet.appendRow(rowValues);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
                              navigator.clipboard.writeText(code);
                              setScriptCopied(true);
                              setTimeout(() => setScriptCopied(false), 2000);
                            }}
                            className={`w-full py-2 px-3 text-[10px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                              scriptCopied 
                                ? 'bg-emerald-600 border-emerald-600 text-white' 
                                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-300'
                            }`}
                          >
                            {scriptCopied ? '✓ ¡Código Copiado!' : '📋 Copiar Código del Macro'}
                          </button>
                        </div>
                        <li>
                          Haga clic en el botón de guardar (disco), luego presione <strong>Implementar &gt; Nueva implementación</strong>. Seleccione <strong>Aplicación web</strong> (ícono de engranaje).
                        </li>
                        <li>
                          Configure: Ejecutar como: <strong>"Yo"</strong>, Quién tiene acceso: <strong>"Cualquiera"</strong>. Presione <strong>Implementar</strong>.
                        </li>
                        <li>
                          Copie la <strong>URL de la aplicación web</strong> que le da Google y péguela en el campo de texto arriba. ¡Listo!
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>

          {/* Compartir Formulario Card */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <h4 className="font-bold text-neutral-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-[#39A900]" />
              Compartir Formulario con Emprendedores
            </h4>
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Comparta este enlace con los emprendedores y aprendices. Al ingresar, los usuarios verán <strong>únicamente el formulario de registro</strong> de forma limpia y segura, sin acceso al panel administrativo ni a las respuestas de otras personas.
            </p>

            {/* Alerta de Error 403 / Acceso Público */}
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3.5 space-y-1.5 text-xs">
              <span className="font-black flex items-center gap-1.5 text-amber-800">
                <span>⚠️</span> ¿Por qué sale Error 403 en otros navegadores o celulares?
              </span>
              <p className="text-[11px] leading-relaxed text-amber-800">
                La dirección de desarrollo habitual (<code className="bg-amber-100 px-1 rounded font-bold">-dev-</code>) está protegida y es de acceso privado para su cuenta de Google. Para que funcione en cualquier dispositivo móvil o navegador externo sin solicitar permisos, <strong>debe usar el enlace de vista previa pública (<code className="bg-amber-100 px-1 rounded font-bold">-pre-</code>)</strong> que hemos preparado automáticamente abajo.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 bg-neutral-50 border border-[#39A900]/40 rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#39A900] truncate flex items-center select-all bg-emerald-50/20">
                  {typeof window !== 'undefined' 
                    ? window.location.origin.includes('-dev-')
                      ? window.location.origin.replace('-dev-', '-pre-')
                      : window.location.origin
                    : ''}
                </div>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const base = window.location.origin;
                      const publicUrl = base.includes('-dev-') ? base.replace('-dev-', '-pre-') : base;
                      navigator.clipboard.writeText(publicUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    copied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-[#39A900] hover:bg-[#2e8800] text-white shadow-sm'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Enlace Público</span>
                    </>
                  )}
                </button>
              </div>

              {/* Step instructions */}
              <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100 space-y-1.5 text-[10px] text-neutral-600">
                <span className="font-bold text-neutral-800 uppercase block">Instrucciones de Uso:</span>
                <ol className="list-decimal pl-3.5 space-y-1">
                  <li>Haga clic en el botón <strong>"Copiar Enlace Público"</strong> arriba.</li>
                  <li><strong>Envíelo</strong> por WhatsApp, correo o redes sociales a los emprendedores.</li>
                  <li>Los usuarios diligenciarán sus ideas directamente desde sus celulares. El formulario se adaptará perfectamente a pantallas móviles.</li>
                  <li>Usted podrá consultar todas las postulaciones ingresando con el botón <strong>"Acceso Administrador"</strong> arriba a la derecha.</li>
                </ol>
              </div>
            </div>
          </div>
          
          {/* Export Suite Card */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <h4 className="font-bold text-neutral-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#39A900]" />
              Exportar Base de Datos
            </h4>
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Descargue toda la información recopilada en campo. Los formatos son totalmente compatibles con Microsoft Excel, Google Sheets o bases de datos relacionales.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={onExportAllCsv}
                disabled={formularios.length === 0}
                className={`flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border uppercase transition-all ${
                  formularios.length > 0
                    ? 'border-[#39A900] text-[#39A900] bg-white hover:bg-[#39A900]/5 cursor-pointer'
                    : 'border-neutral-200 text-neutral-300 bg-neutral-50 cursor-not-allowed'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                Planilla CSV
              </button>

              <button
                onClick={onExportAllJson}
                disabled={formularios.length === 0}
                className={`flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border uppercase transition-all ${
                  formularios.length > 0
                    ? 'border-neutral-700 text-neutral-700 bg-white hover:bg-neutral-50 cursor-pointer'
                    : 'border-neutral-200 text-neutral-300 bg-neutral-50 cursor-not-allowed'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Respaldar JSON
              </button>
            </div>
          </div>

          {/* Quick Metrics Categories Visualizer (SENA Style Custom SVG) */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <h4 className="font-bold text-neutral-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#39A900]" />
              Distribución por Sectores
            </h4>

            {formularios.length === 0 ? (
              <div className="py-6 text-center text-neutral-400 text-[11px] italic">
                Aún no hay datos para graficar.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Visual horizontal distribution bars */}
                {categoriesList.map(([cat, count]) => {
                  const percentage = Math.round((count / formularios.length) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-neutral-700 truncate max-w-[180px]" title={cat}>
                          {cat}
                        </span>
                        <span className="font-mono text-neutral-400">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#39A900] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}

                {/* Info summary */}
                <div className="bg-[#212121] text-white p-2.5 rounded-lg text-[9px] flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-[#39A900] shrink-0"></div>
                  <span>
                    El sector de mayor innovación reportada es <strong className="text-[#39A900]">{categoriesList[0]?.[0] || 'por asignar'}</strong> con {categoriesList[0]?.[1] || 0} ideas.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Offline Work Advice (SENA Logo Symbol Style Accent card) */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex gap-3">
            <Info className="w-4 h-4 text-[#39A900] shrink-0 mt-0.5" />
            <div className="space-y-1 text-[10px] text-neutral-600">
              <span className="font-bold text-neutral-800 block uppercase">¿Cómo funciona el guardado Offline?</span>
              <p className="leading-tight">
                El sistema detecta automáticamente la presencia de internet. Si está <strong>Fuera de Línea</strong>, la información se almacena localmente de forma encriptada en la base de datos interna. Al regresar a <strong>Modo Online</strong>, los envíos pendientes se transmiten solos.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
