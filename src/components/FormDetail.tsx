import React from 'react';
import { ArrowLeft, Printer, FileDown, Download, BadgeAlert, CheckCircle, X } from 'lucide-react';
import { FormularioSena } from '../types';

interface FormDetailProps {
  formulario: FormularioSena;
  onBack: () => void;
  onExportSingleJson: (form: FormularioSena) => void;
}

export default function FormDetail({ formulario, onBack, onExportSingleJson }: FormDetailProps) {
  const [showPrintHelp, setShowPrintHelp] = React.useState(false);

  const handlePrint = () => {
    try {
      const isIframe = window.self !== window.top;
      if (isIframe) {
        setShowPrintHelp(true);
        return;
      }
      window.print();
    } catch (e) {
      console.error("No se pudo iniciar la impresión directamente:", e);
      setShowPrintHelp(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">
            <CheckCircle className="w-3.5 h-3.5" /> Sincronizado en Servidor
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">
            <BadgeAlert className="w-3.5 h-3.5" /> Pendiente de Sincronizar
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-bold">
            Borrador Local
          </span>
        );
    }
  };

  return (
    <div id="form-detail-root" className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Action Bar (Hidden during printing) */}
      <div id="detail-actions" className="flex flex-wrap items-center justify-between gap-4 print:hidden bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-600 hover:text-[#39A900] font-medium text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Tablero
        </button>

        <div className="flex items-center gap-2">
          {getStatusBadge(formulario.status)}

          <button
            onClick={() => onExportSingleJson(formulario)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            title="Exportar datos del formulario como archivo JSON"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar JSON
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#39A900] hover:bg-[#2e8800] text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir Formato (PDF)
          </button>
        </div>
      </div>

      {/* Official SENA Document Format (GCDTP-F-013) */}
      <div id="sena-document-printable" className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-neutral-200 print:border-none print:shadow-none print:p-0 select-text">
        {/* Document Header Table */}
        <div className="border-2 border-neutral-800 text-center text-xs font-bold">
          <div className="grid grid-cols-12 border-b-2 border-neutral-800">
            {/* Logo SENA Column */}
            <div className="col-span-3 flex flex-col items-center justify-center p-2.5 border-r-2 border-neutral-800 bg-white">
              <svg viewBox="0 0 100 100" className="w-14 h-14" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            {/* Document Title Column */}
            <div className="col-span-6 flex flex-col justify-center p-2 border-r-2 border-neutral-800">
              <span className="text-[9px] uppercase tracking-wider text-neutral-500">PROCESO</span>
              <div className="font-extrabold uppercase text-[10px] text-neutral-800">
                GESTIÓN DE LA COMPETITIVIDAD Y EL DESARROLLO TECNOLÓGICO PRODUCTIVO
              </div>
            </div>
            {/* Version Metadata Column */}
            <div className="col-span-3 text-left p-2 flex flex-col justify-between text-[10px] bg-[#fafafa]">
              <div><span className="font-bold text-neutral-500">Versión:</span> 01</div>
              <div className="border-t border-neutral-300 pt-1 mt-1">
                <span className="font-bold text-neutral-500">Código:</span> GCDTP-F-013
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 text-white py-2 text-center uppercase tracking-wider text-[11px] font-black">
            FORMULACIÓN Y REGISTRO DE LA IDEA
          </div>

          {/* Classification Banner */}
          <div className="grid grid-cols-12 bg-[#fafafa] border-t-2 border-neutral-800 py-1.5 px-2 text-[10px]">
            <div className="col-span-4 flex items-center justify-center gap-2">
              <span>Clasificación de la Información:</span>
            </div>
            <div className="col-span-8 flex justify-around items-center">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={true} readOnly className="accent-[#39A900]" />
                <span>Pública</span>
              </label>
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={false} readOnly className="accent-[#39A900]" />
                <span>Pública Clasificada</span>
              </label>
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={false} readOnly className="accent-[#39A900]" />
                <span>Pública Reservada</span>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 1: INFORMACIÓN USUARIO */}
        <div className="mt-6">
          <div className="bg-[#39A900] text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wide border-2 border-b-0 border-neutral-800">
            1. INFORMACIÓN USUARIO
          </div>
          <div className="border-2 border-neutral-800 text-xs divide-y divide-neutral-800">
            {/* Line 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-neutral-800">
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Nombres Completos</span>
                <span className="text-neutral-900 font-medium">{formulario.nombresCompletos || '-'}</span>
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Tipo y Número de Identificación</span>
                <span className="text-neutral-900 font-medium">
                  {formulario.tipoDocumento} - {formulario.numeroDocumento || '-'}
                </span>
              </div>
            </div>

            {/* Line 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-neutral-800">
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">País de Expedición</span>
                <span className="text-neutral-900 font-medium">{formulario.paisExpedicion || '-'}</span>
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Fecha de Expedición</span>
                <span className="text-neutral-900 font-medium">{formulario.fechaExpedicion || '-'}</span>
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Lugar de Expedición</span>
                <span className="text-neutral-900 font-medium">
                  {formulario.ciudadExpedicion ? `${formulario.ciudadExpedicion} (${formulario.deptoExpedicion})` : '-'}
                </span>
              </div>
            </div>

            {/* Line 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-neutral-800">
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Fecha de Nacimiento</span>
                <span className="text-neutral-900 font-medium">{formulario.fechaNacimiento || '-'}</span>
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Grupo Sanguíneo</span>
                <span className="text-neutral-900 font-medium">{formulario.grupoSanguineo || '-'}</span>
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Género</span>
                <span className="text-neutral-900 font-medium">{formulario.genero || '-'}</span>
              </div>
            </div>

            {/* Line 4 */}
            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-neutral-800">
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Correo Electrónico</span>
                <span className="text-neutral-900 font-medium">{formulario.correo || '-'}</span>
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Número Celular</span>
                <span className="text-neutral-900 font-medium">{formulario.celular || '-'}</span>
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Estrato Socioeconómico</span>
                <span className="text-neutral-900 font-medium">Estrato {formulario.estrato || '-'}</span>
              </div>
            </div>

            {/* Line 5 */}
            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-neutral-800">
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Grupo Poblacional</span>
                <span className="text-neutral-900 font-medium">{formulario.grupoPoblacional || '-'}</span>
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">EPS Afiliada</span>
                <span className="text-neutral-900 font-medium">{formulario.nombreEps || '-'}</span>
              </div>
              <div className="p-2.5 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-neutral-500 uppercase text-[9px]">¿Discapacidad?</span>
                  <span className="font-medium text-neutral-900">{formulario.discapacidad || '-'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-neutral-500 uppercase text-[9px]">¿Cabeza de Familia?</span>
                  <span className="font-medium text-neutral-900">{formulario.cabezaFamilia || '-'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-neutral-500 uppercase text-[9px]">¿Víctima de Violencia?</span>
                  <span className="font-medium text-neutral-900">{formulario.victimaViolencia || '-'}</span>
                </div>
              </div>
            </div>

            {/* Line 6 */}
            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-neutral-800">
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Departamento Residencia</span>
                <span className="text-neutral-900 font-medium">{formulario.deptoResidencia || '-'}</span>
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Ciudad Residencia</span>
                <span className="text-neutral-900 font-medium">{formulario.ciudadResidencia || '-'}</span>
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Barrio</span>
                <span className="text-neutral-900 font-medium">{formulario.barrio || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ÚLTIMOS ESTUDIOS Y OCUPACIONES */}
        <div className="mt-6">
          <div className="bg-[#39A900] text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wide border-2 border-b-0 border-neutral-800">
            2. ÚLTIMOS ESTUDIOS Y OCUPACIONES
          </div>
          <div className="border-2 border-neutral-800 text-xs divide-y divide-neutral-800">
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-neutral-800">
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Nombre Institución Educativa</span>
                <span className="text-neutral-900 font-medium">{formulario.nombreInstitucion || '-'}</span>
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Grado de Escolaridad / Nivel</span>
                <span className="text-neutral-900 font-medium">{formulario.gradoEscolaridad || '-'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-neutral-800">
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Título Obtenido</span>
                <span className="text-neutral-900 font-medium">{formulario.tituloObtenido || '-'}</span>
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Fecha de Terminación</span>
                <span className="text-neutral-900 font-medium">{formulario.fechaTerminacion || '-'}</span>
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Ocupación Actual</span>
                <span className="text-neutral-900 font-medium">{formulario.ocupacion || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: REGISTRO IDEA */}
        <div className="mt-6">
          <div className="bg-[#39A900] text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wide border-2 border-b-0 border-neutral-800">
            3. REGISTRO IDEA
          </div>
          <div className="border-2 border-neutral-800 text-xs divide-y divide-neutral-800">
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-neutral-800">
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Nombre de la Idea</span>
                <span className="text-neutral-900 font-bold text-sm text-[#39A900]">{formulario.nombreIdea || '-'}</span>
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Código de la Idea</span>
                <span className="text-neutral-900 font-mono font-bold">{formulario.codigoIdea || '-'}</span>
              </div>
            </div>

            <div className="p-2.5">
              <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-1">
                Describa de forma concisa y clara de qué trata su idea, ¿qué productos o servicios va a ofertar?
              </span>
              <div className="text-neutral-900 whitespace-pre-wrap leading-relaxed min-h-[60px] bg-neutral-50 p-2 rounded border border-neutral-100">
                {formulario.descripcionIdea || '-'}
              </div>
            </div>

            <div className="p-2.5">
              <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-1">
                ¿Conoce una solución, producto, servicio o desarrollo parecido que actualmente esté disponible en el país o su región?
              </span>
              <div className="text-neutral-900 whitespace-pre-wrap leading-relaxed bg-neutral-50 p-2 rounded border border-neutral-100">
                {formulario.solucionParecida || '-'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-neutral-800">
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-1">
                  ¿La solución, producto, servicio reemplaza a algún otro existente?
                </span>
                <span className="text-neutral-900 font-medium">{formulario.reemplazaExistente || '-'}</span>
              </div>
              <div className="p-2.5">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-neutral-500 uppercase text-[9px]">¿Cuenta con Producto Mínimo Viable (PMV)?</span>
                  <span className="font-bold text-neutral-900">{formulario.cuentaPmv || '-'}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-bold text-neutral-500 uppercase text-[9px]">¿Pruebas realizadas con posibles clientes?</span>
                  <span className="font-bold text-neutral-900">{formulario.pruebasClientes || '-'}</span>
                </div>
              </div>
            </div>

            <div className="p-2.5">
              <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-1">Estado actual de la solución y/o idea de negocio</span>
              <div className="text-neutral-900 bg-neutral-50 p-2 rounded border border-neutral-100">{formulario.estadoActual || '-'}</div>
            </div>

            <div className="p-2.5 bg-neutral-50/50 flex items-start gap-2.5">
              <input type="checkbox" checked={formulario.entiendeModelo} readOnly className="mt-0.5 accent-[#39A900]" />
              <div>
                <span className="font-bold text-neutral-700 text-[10px] uppercase block">Declaración de Entendimiento de Modelo de Negocio</span>
                <p className="text-neutral-500 text-[9px] leading-tight">
                  Entiendo que el modelo de negocio es una estructura lógica conformado por: i) problema; ii) solución; iii) métricas claves; iv) propuesta de valor única; v) canales; vi) segmento de clientes; vii) estructura de costes; viii) flujo de ingresos; y, ix) ventaja especial; en la cual se logra identify aspectos claves de la idea.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: ¿PARA QUIÉN CREAMOS VALOR? */}
        <div className="mt-6">
          <div className="bg-[#39A900] text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wide border-2 border-b-0 border-neutral-800">
            4. ¿PARA QUIÉN CREAMOS VALOR?
          </div>
          <div className="border-2 border-neutral-800 text-xs divide-y divide-neutral-800">
            <div className="p-2.5">
              <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-1">¿Quién usará la solución, producto o servicio?</span>
              <div className="text-neutral-900 bg-neutral-50 p-2 rounded border border-neutral-100">{formulario.quienUsara || '-'}</div>
            </div>

            <div className="p-2.5">
              <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-1">¿Qué necesidades de los clientes satisfacemos?</span>
              <div className="text-neutral-900 bg-neutral-50 p-2 rounded border border-neutral-100">{formulario.necesidadesClientes || '-'}</div>
            </div>

            <div className="p-2.5">
              <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-1">
                ¿Qué problema de nuestros clientes (internos o externos) ayudamos a solucionar?
              </span>
              <div className="text-neutral-900 bg-neutral-50 p-2 rounded border border-neutral-100">{formulario.problemaClientes || '-'}</div>
            </div>
          </div>
        </div>

        {/* SECTION 5: CANALES */}
        <div className="mt-6">
          <div className="bg-[#39A900] text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wide border-2 border-b-0 border-neutral-800">
            5. CANALES
          </div>
          <div className="border-2 border-neutral-800 text-xs divide-y divide-neutral-800">
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-neutral-800">
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-1">
                  ¿El producto o servicio requiere algún tipo de empaque, embalaje o envase?
                </span>
                <span className="text-neutral-900 bg-neutral-50/50 p-1.5 block rounded">{formulario.requiereEmpaque || '-'}</span>
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-1">
                  ¿Cuenta con una estrategia para fijar el precio de su producto o servicio?
                </span>
                <span className="text-neutral-900 bg-neutral-50/50 p-1.5 block rounded">{formulario.estrategiaPrecio || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: FUENTES DE INGRESO */}
        <div className="mt-6">
          <div className="bg-[#39A900] text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wide border-2 border-b-0 border-neutral-800">
            6. FUENTES DE INGRESO
          </div>
          <div className="border-2 border-neutral-800 text-xs divide-y divide-neutral-800">
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-neutral-800">
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-1">
                  ¿Cuenta con los recursos para la puesta en marcha del producto o servicio?
                </span>
                <span className="text-neutral-900 bg-neutral-50/50 p-1.5 block rounded">{formulario.recursosPuestaMarcha || '-'}</span>
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-1">
                  ¿Su producto o servicio ha generado ventas?
                </span>
                <span className="text-neutral-900 font-bold text-xs uppercase">{formulario.generadoVentas || '-'}</span>
              </div>
            </div>
            <div className="p-2.5">
              <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-1">
                ¿Ha identificado algún tipo de recurso y/o apoyo requerido para la escalabilidad de la idea?
              </span>
              <div className="text-neutral-900 bg-neutral-50 p-2 rounded border border-neutral-100">{formulario.apoyoEscalabilidad || '-'}</div>
            </div>
          </div>
        </div>

        {/* SECTION 7: OTROS */}
        <div className="mt-6">
          <div className="bg-[#39A900] text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wide border-2 border-b-0 border-neutral-800">
            7. OTROS
          </div>
          <div className="border-2 border-neutral-800 text-xs divide-y divide-neutral-800">
            <div className="p-2.5">
              <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-1">¿Cómo está conformado su equipo de trabajo?</span>
              <div className="text-neutral-900 bg-neutral-50 p-2 rounded border border-neutral-100">{formulario.equipoTrabajo || '-'}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-neutral-800">
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">¿Hay requisitos legales a considerar en los países de venta?</span>
                <span className="text-neutral-900 font-bold block mb-1">{formulario.requisitosLegales || '-'}</span>
                {formulario.requisitosLegales === 'Sí' && (
                  <div className="text-neutral-600 bg-neutral-50 p-1.5 rounded text-[11px] border border-neutral-100">
                    {formulario.descripcionRequisitosLegales || 'Sin descripción.'}
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">¿Requiere certificaciones o permisos especiales?</span>
                <span className="text-neutral-900 font-bold block mb-1">{formulario.requierePermisos || '-'}</span>
                {formulario.requierePermisos === 'Sí' && (
                  <div className="text-neutral-600 bg-neutral-50 p-1.5 rounded text-[11px] border border-neutral-100">
                    {formulario.descripcionPermisos || 'Sin descripción.'}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-neutral-800">
              <div className="p-2.5 col-span-1">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">¿Interés en constituirse legalmente?</span>
                <span className="text-neutral-900 font-medium">{formulario.constitucionInteres || '-'}</span>
              </div>
              <div className="p-2.5 col-span-1">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Estado de la idea</span>
                <span className="text-neutral-900 font-medium">{formulario.estadoPrototipo || '-'}</span>
              </div>
              <div className="p-2.5 col-span-1">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">Enlace de Video Presentación (Elevator Pitch)</span>
                {formulario.enlaceVideo ? (
                  <a
                    href={formulario.enlaceVideo}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#39A900] hover:underline font-semibold break-all text-[11px]"
                  >
                    {formulario.enlaceVideo}
                  </a>
                ) : (
                  <span className="text-neutral-400 font-medium italic">No registrado</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 8: INFORMACIÓN FINAL DE LA IDEA */}
        <div className="mt-6">
          <div className="bg-[#39A900] text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wide border-2 border-b-0 border-neutral-800">
            8. INFORMACIÓN FINAL DE LA IDEA
          </div>
          <div className="border-2 border-neutral-800 text-xs divide-y divide-neutral-800">
            <div className="p-2.5">
              <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-1">¿En qué categoría se clasifica su idea?</span>
              <span className="text-neutral-900 font-medium">{formulario.categoriaIdea || '-'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-neutral-800">
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">¿Viene de una convocatoria?</span>
                <span className="text-neutral-900 font-bold block mb-1">{formulario.vieneConvocatoria || '-'}</span>
                {formulario.vieneConvocatoria === 'Sí' && (
                  <div className="text-neutral-600 bg-neutral-50 p-1.5 rounded text-[11px] border border-neutral-100">
                    <span className="font-bold text-[9px] block uppercase text-neutral-400">Detalle Convocatoria</span>
                    {formulario.descripcionConvocatoria || '-'}
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <span className="block font-bold text-neutral-500 uppercase text-[9px] mb-0.5">¿La idea está avalada por una entidad?</span>
                <span className="text-neutral-900 font-bold block mb-1">{formulario.avaladaEntidad || '-'}</span>
                {formulario.avaladaEntidad === 'Sí' && (
                  <div className="text-neutral-600 bg-neutral-50 p-1.5 rounded text-[11px] border border-neutral-100">
                    <span className="font-bold text-[9px] block uppercase text-neutral-400">Entidad Avaladora</span>
                    {formulario.nombreEntidadAval || '-'}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-neutral-50 flex items-start gap-2">
              <input type="checkbox" checked={formulario.aceptaTratamientoDatos} readOnly className="mt-0.5 accent-[#39A900]" />
              <div className="text-[9px] text-neutral-500 leading-tight">
                <span className="font-bold uppercase text-neutral-700 block text-[10px] mb-0.5">AUTORIZACIÓN TRATAMIENTO DE DATOS PERSONALES (SENA)</span>
                Aceptado de conformidad con lo establecido en la política de protección de datos del Servicio Nacional de Aprendizaje SENA, la finalidad y tratamiento de los datos personales requeridos a través de este canal de atención es la gestión, prestación y personalización de nuestros servicios.
              </div>
            </div>
          </div>
        </div>

        {/* Footer info (Metadata of form submission) */}
        <div className="mt-8 pt-4 border-t border-neutral-300 grid grid-cols-2 text-[9px] text-neutral-400 font-mono">
          <div>
            <div>ID Único: {formulario.id}</div>
            <div>Fecha Creación: {new Date(formulario.createdAt).toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div>Tecnoparque Nodo Socorro - SENA</div>
            <div>Estado Sincronización: {formulario.status.toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* Modal de Ayuda para Impresión */}
      {showPrintHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button 
              onClick={() => setShowPrintHelp(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 p-1 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3.5 mt-2">
              <div className="bg-[#39A900]/10 text-[#39A900] p-2.5 rounded-full flex-shrink-0">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 leading-snug">
                  Imprimir Formato en AI Studio
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-normal">
                  Debido a políticas de seguridad del navegador para contenidos incrustados (iframes), la impresión directa está bloqueada en esta vista previa.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
              <div className="flex gap-2.5 text-xs text-neutral-700 text-left">
                <span className="flex-shrink-0 w-5 h-5 bg-[#39A900] text-white rounded-full flex items-center justify-center font-bold text-[10px]">1</span>
                <div>
                  <span className="font-semibold text-neutral-900">Abra la aplicación en pestaña nueva:</span>
                  <p className="text-neutral-500 mt-0.5 text-[11px]">Haga clic en el botón de flecha diagonal externa <span className="font-semibold">"Open in a new tab"</span> en la barra superior de AI Studio.</p>
                </div>
              </div>
              <div className="flex gap-2.5 text-xs text-neutral-700 text-left">
                <span className="flex-shrink-0 w-5 h-5 bg-[#39A900] text-white rounded-full flex items-center justify-center font-bold text-[10px]">2</span>
                <div>
                  <span className="font-semibold text-neutral-900">Haga clic en Imprimir Formato (PDF):</span>
                  <p className="text-neutral-500 mt-0.5 text-[11px]">En la nueva pestaña, presione este botón de nuevo. La ventana de impresión nativa se abrirá perfectamente para guardar como PDF o imprimir.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-end">
              <button
                onClick={() => setShowPrintHelp(false)}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
              >
                Cerrar Ayuda
              </button>
              <button
                onClick={() => {
                  window.open(window.location.href, '_blank');
                  setShowPrintHelp(false);
                }}
                className="px-4 py-2 bg-[#39A900] hover:bg-[#2e8800] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                Abrir en pestaña nueva ↗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
