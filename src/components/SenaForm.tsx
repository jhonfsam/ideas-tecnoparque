import React, { useState, useEffect } from 'react';
import { Save, ChevronRight, ChevronLeft, Send, CheckCircle2, AlertTriangle, Info, FileText } from 'lucide-react';
import { FormularioSena, INITIAL_FORM_STATE, SyncStatus } from '../types';

interface SenaFormProps {
  initialData?: FormularioSena | null;
  onSave: (data: Partial<FormularioSena>, status: SyncStatus, isAutosave?: boolean) => void;
  onCancel: () => void;
  isOnline: boolean;
}

const DEPARTAMENTOS = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare',
  'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira',
  'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
  'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada', 'Bogotá D.C.'
];

const CATEGORIAS_SENA = [
  'Biotecnología y Nanotecnología',
  'Ingeniería y Diseño',
  'Electrónica y Telecomunicaciones',
  'Tecnologías de la Información y Comunicación (TIC)',
  'Desarrollo de Software y Apps',
  'Sostenibilidad y Medio Ambiente',
  'Agroindustria y Ciencias Agropecuarias',
  'Industrias Creativas y Economía Naranja',
  'Salud y Tecnologías Médicas',
  'Otra Categoría'
];

export default function SenaForm({ initialData, onSave, onCancel, isOnline }: SenaFormProps) {
  const [formData, setFormData] = useState<Omit<FormularioSena, 'id' | 'createdAt' | 'updatedAt' | 'status'>>(
    initialData ? { ...INITIAL_FORM_STATE, ...initialData } : { ...INITIAL_FORM_STATE }
  );

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAutoSaveMsg, setShowAutoSaveMsg] = useState(false);

  // Generate a mock code for the idea if it doesn't exist
  useEffect(() => {
    if (!formData.codigoIdea) {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setFormData(prev => ({
        ...prev,
        codigoIdea: `SENA-TP-${year}-${randomNum}`
      }));
    }
  }, []);

  // Autosave draft helper
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step > 1 || formData.nombresCompletos || formData.nombreIdea) {
        onSave(formData, 'draft', true);
        setShowAutoSaveMsg(true);
        setTimeout(() => setShowAutoSaveMsg(false), 2000);
      }
    }, 15000); // Autosave every 15s if user has inputted basic info
    return () => clearTimeout(timer);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.nombresCompletos.trim()) stepErrors.nombresCompletos = 'Nombres completos requeridos';
      if (!formData.tipoDocumento) stepErrors.tipoDocumento = 'Seleccione tipo de documento';
      if (!formData.numeroDocumento.trim()) stepErrors.numeroDocumento = 'Número de documento requerido';
      if (!formData.correo.trim()) {
        stepErrors.correo = 'Correo requerido';
      } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
        stepErrors.correo = 'Correo inválido';
      }
      if (!formData.celular.trim()) stepErrors.celular = 'Celular requerido';
    }

    if (currentStep === 3) {
      if (!formData.nombreIdea.trim()) stepErrors.nombreIdea = 'Nombre de la idea requerido';
      if (!formData.descripcionIdea.trim()) stepErrors.descripcionIdea = 'Descripción requerida';
    }

    if (currentStep === 8) {
      if (!formData.categoriaIdea) stepErrors.categoriaIdea = 'Seleccione una categoría';
      if (!formData.aceptaTratamientoDatos) stepErrors.aceptaTratamientoDatos = 'Debe aceptar los términos de datos personales del SENA';
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 8));
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSaveDraft = () => {
    // Drafts do not require complete validation, allowing field workers to save quick progressive work
    onSave(formData, 'draft');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 8) {
      handleNext();
      return;
    }
    if (validateStep(8)) {
      // Complete form goes to pending queue to be synced automatically
      onSave(formData, 'pending');
    } else {
      // Highlight error step
      setStep(8);
    }
  };

  const stepTitles = [
    'Información Usuario',
    'Estudios y Ocupación',
    'Registro de Idea',
    'Creación de Valor',
    'Canales',
    'Fuentes de Ingreso',
    'Otros Datos',
    'Información Final'
  ];

  return (
    <div id="sena-form-root" className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden max-w-4xl mx-auto">
      {/* Form Header */}
      <div className="bg-[#212121] text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#39A900]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#39A900] text-white text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded">
              SENA COLOFLINE
            </span>
            <span className="text-neutral-400 text-xs">Formato: GCDTP-F-013</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase">
            {initialData ? 'Editar Formulación de Idea' : 'Nueva Formulación y Registro de Idea'}
          </h2>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {showAutoSaveMsg && (
            <span className="text-[10px] text-emerald-400 font-mono animate-pulse flex items-center gap-1 bg-emerald-950/40 px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39A900]"></span>
              Autoguardado borrador...
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
            title="Guardar borrador local en IndexedDB"
          >
            <Save className="w-3.5 h-3.5 text-[#39A900]" />
            Guardar Borrador
          </button>
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100 overflow-x-auto scrollbar-none select-none">
        <div className="flex items-center justify-between min-w-[760px] md:min-w-0 px-2">
          {stepTitles.map((title, i) => {
            const stepNum = i + 1;
            const isCurrent = step === stepNum;
            const isCompleted = step > stepNum;
            return (
              <React.Fragment key={title}>
                <button
                  type="button"
                  onClick={() => {
                    // Let user click through steps if validated or saving draft
                    if (validateStep(step) || stepNum < step) {
                      setStep(stepNum);
                    }
                  }}
                  className="flex flex-col items-center flex-1 group focus:outline-none cursor-pointer"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCurrent
                        ? 'bg-[#39A900] text-white ring-4 ring-[#39A900]/15 scale-110'
                        : isCompleted
                        ? 'bg-neutral-800 text-white'
                        : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'
                    }`}
                  >
                    {isCompleted ? '✓' : stepNum}
                  </div>
                  <span
                    className={`text-[9px] mt-1.5 font-bold uppercase tracking-tight text-center max-w-[80px] leading-tight transition-colors ${
                      isCurrent ? 'text-[#39A900]' : 'text-neutral-500 group-hover:text-neutral-700'
                    }`}
                  >
                    {title}
                  </span>
                </button>
                {stepNum < 8 && <div className={`flex-1 h-0.5 mx-2 ${step > stepNum ? 'bg-neutral-800' : 'bg-neutral-200'}`} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        {/* Step Indicator for Mobile */}
        <div className="md:hidden flex items-center justify-between text-xs bg-[#39A900]/10 p-2.5 rounded-lg text-neutral-700 border border-[#39A900]/25">
          <span className="font-bold">PASO {step} de 8:</span>
          <span className="font-extrabold uppercase text-[#39A900]">{stepTitles[step - 1]}</span>
        </div>

        {/* STEP 1: INFORMACIÓN USUARIO */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#39A900]"></span>
              1. Información Personal del Usuario
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Nombres Completos *</label>
                <input
                  type="text"
                  name="nombresCompletos"
                  value={formData.nombresCompletos}
                  onChange={handleChange}
                  className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.nombresCompletos ? 'border-red-500 focus:ring-red-200' : 'border-neutral-300 focus:ring-[#39A900]/20 focus:border-[#39A900]'
                  }`}
                  placeholder="Ej. Juan Carlos Pérez Gómez"
                />
                {errors.nombresCompletos && <p className="text-[10px] text-red-500 mt-0.5">{errors.nombresCompletos}</p>}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Tipo Doc *</label>
                  <select
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleChange}
                    className="w-full text-xs px-2 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900] bg-white"
                  >
                    <option value="">Seleccione</option>
                    <option value="CC">C.C.</option>
                    <option value="TI">T.I.</option>
                    <option value="CE">C.E.</option>
                    <option value="PEP">P.E.P.</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                  {errors.tipoDocumento && <p className="text-[10px] text-red-500 mt-0.5">Requerido</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Número Documento *</label>
                  <input
                    type="text"
                    name="numeroDocumento"
                    value={formData.numeroDocumento}
                    onChange={handleChange}
                    className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.numeroDocumento ? 'border-red-500 focus:ring-red-200' : 'border-neutral-300 focus:ring-[#39A900]/20 focus:border-[#39A900]'
                    }`}
                    placeholder="Ej. 1024395400"
                  />
                  {errors.numeroDocumento && <p className="text-[10px] text-red-500 mt-0.5">{errors.numeroDocumento}</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">País Expedición Doc</label>
                <input
                  type="text"
                  name="paisExpedicion"
                  value={formData.paisExpedicion}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Fecha Expedición</label>
                <input
                  type="date"
                  name="fechaExpedicion"
                  value={formData.fechaExpedicion}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Municipio Expedición</label>
                <input
                  type="text"
                  name="ciudadExpedicion"
                  value={formData.ciudadExpedicion}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                  placeholder="Ej. Medellín"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Fecha Nacimiento</label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">RH / Grupo Sanguíneo</label>
                <select
                  name="grupoSanguineo"
                  value={formData.grupoSanguineo}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900] bg-white"
                >
                  <option value="">Seleccione</option>
                  <option value="O+">O Positivo (O+)</option>
                  <option value="O-">O Negativo (O-)</option>
                  <option value="A+">A Positivo (A+)</option>
                  <option value="A-">A Negativo (A-)</option>
                  <option value="B+">B Positivo (B+)</option>
                  <option value="B-">B Negativo (B-)</option>
                  <option value="AB+">AB Positivo (AB+)</option>
                  <option value="AB-">AB Negativo (AB-)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Género</label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900] bg-white"
                >
                  <option value="">Seleccione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.correo ? 'border-red-500 focus:ring-red-200' : 'border-neutral-300 focus:ring-[#39A900]/20 focus:border-[#39A900]'
                  }`}
                  placeholder="ejemplo@sena.edu.co"
                />
                {errors.correo && <p className="text-[10px] text-red-500 mt-0.5">{errors.correo}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Celular de Contacto *</label>
                <input
                  type="text"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.celular ? 'border-red-500 focus:ring-red-200' : 'border-neutral-300 focus:ring-[#39A900]/20 focus:border-[#39A900]'
                  }`}
                  placeholder="Ej. 3123456789"
                />
                {errors.celular && <p className="text-[10px] text-red-500 mt-0.5">{errors.celular}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Estrato Social</label>
                <select
                  name="estrato"
                  value={formData.estrato}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900] bg-white"
                >
                  <option value="">Seleccione</option>
                  <option value="1">Estrato 1</option>
                  <option value="2">Estrato 2</option>
                  <option value="3">Estrato 3</option>
                  <option value="4">Estrato 4</option>
                  <option value="5">Estrato 5</option>
                  <option value="6">Estrato 6</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Grupo Poblacional / Etnia</label>
                <input
                  type="text"
                  name="grupoPoblacional"
                  value={formData.grupoPoblacional}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                  placeholder="Ej. Afrodescendiente, Campesino, Ninguno"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">EPS Afiliada</label>
                <input
                  type="text"
                  name="nombreEps"
                  value={formData.nombreEps}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                  placeholder="Ej. Sura, Sanitas"
                />
              </div>
              <div className="grid grid-cols-3 gap-1 bg-neutral-50 p-2 rounded-lg border border-neutral-200">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-bold text-neutral-500 uppercase leading-tight text-center">¿Discapacidad?</span>
                  <div className="flex gap-2 mt-1">
                    <label className="text-[9px] flex items-center gap-0.5">
                      <input type="radio" name="discapacidad" value="Sí" checked={formData.discapacidad === 'Sí'} onChange={handleChange} className="accent-[#39A900]" /> SÍ
                    </label>
                    <label className="text-[9px] flex items-center gap-0.5">
                      <input type="radio" name="discapacidad" value="No" checked={formData.discapacidad === 'No'} onChange={handleChange} className="accent-[#39A900]" /> NO
                    </label>
                  </div>
                </div>
                <div className="flex flex-col items-center border-x border-neutral-200">
                  <span className="text-[8px] font-bold text-neutral-500 uppercase leading-tight text-center">¿Cabeza Fam.?</span>
                  <div className="flex gap-2 mt-1">
                    <label className="text-[9px] flex items-center gap-0.5">
                      <input type="radio" name="cabezaFamilia" value="Sí" checked={formData.cabezaFamilia === 'Sí'} onChange={handleChange} className="accent-[#39A900]" /> SÍ
                    </label>
                    <label className="text-[9px] flex items-center gap-0.5">
                      <input type="radio" name="cabezaFamilia" value="No" checked={formData.cabezaFamilia === 'No'} onChange={handleChange} className="accent-[#39A900]" /> NO
                    </label>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-bold text-neutral-500 uppercase leading-tight text-center">¿Víctima Viol.?</span>
                  <div className="flex gap-2 mt-1">
                    <label className="text-[9px] flex items-center gap-0.5">
                      <input type="radio" name="victimaViolencia" value="Sí" checked={formData.victimaViolencia === 'Sí'} onChange={handleChange} className="accent-[#39A900]" /> SÍ
                    </label>
                    <label className="text-[9px] flex items-center gap-0.5">
                      <input type="radio" name="victimaViolencia" value="No" checked={formData.victimaViolencia === 'No'} onChange={handleChange} className="accent-[#39A900]" /> NO
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Dpto Residencia</label>
                <select
                  name="deptoResidencia"
                  value={formData.deptoResidencia}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900] bg-white"
                >
                  <option value="">Seleccione Departamento</option>
                  {DEPARTAMENTOS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Ciudad Residencia</label>
                <input
                  type="text"
                  name="ciudadResidencia"
                  value={formData.ciudadResidencia}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                  placeholder="Ej. Bucaramanga"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Barrio / Comuna</label>
                <input
                  type="text"
                  name="barrio"
                  value={formData.barrio}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                  placeholder="Ej. El Poblado"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ÚLTIMOS ESTUDIOS Y OCUPACIONES */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#39A900]"></span>
              2. Últimos Estudios y Ocupaciones
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Nombre Institución</label>
                <input
                  type="text"
                  name="nombreInstitucion"
                  value={formData.nombreInstitucion}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                  placeholder="Ej. Universidad Nacional o Colegio Técnico"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Grado de Escolaridad</label>
                <select
                  name="gradoEscolaridad"
                  value={formData.gradoEscolaridad}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900] bg-white"
                >
                  <option value="">Seleccione Nivel</option>
                  <option value="Bachiller">Bachiller</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Tecnólogo">Tecnólogo</option>
                  <option value="Profesional">Profesional / Universitario</option>
                  <option value="Especialización">Especialización</option>
                  <option value="Maestría">Maestría</option>
                  <option value="Doctorado">Doctorado</option>
                  <option value="Ninguno">Ninguno</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Título Obtenido</label>
                <input
                  type="text"
                  name="tituloObtenido"
                  value={formData.tituloObtenido}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                  placeholder="Ej. Ingeniero de Sistemas, Bachiller Técnico"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Fecha Terminación / Grado</label>
                <input
                  type="date"
                  name="fechaTerminacion"
                  value={formData.fechaTerminacion}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Ocupación Actual</label>
                <input
                  type="text"
                  name="ocupacion"
                  value={formData.ocupacion}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                  placeholder="Ej. Aprendiz, Desempleado, Empleado, Independiente"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: REGISTRO IDEA */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#39A900]"></span>
              3. Registro General de la Idea
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Nombre de la Idea *</label>
                <input
                  type="text"
                  name="nombreIdea"
                  value={formData.nombreIdea}
                  onChange={handleChange}
                  className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.nombreIdea ? 'border-red-500 focus:ring-red-200' : 'border-neutral-300 focus:ring-[#39A900]/20 focus:border-[#39A900]'
                  }`}
                  placeholder="Ej. Sistema de riego automatizado con IoT para aguacates"
                />
                {errors.nombreIdea && <p className="text-[10px] text-red-500 mt-0.5">{errors.nombreIdea}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Código de Idea (Asignado)</label>
                <input
                  type="text"
                  name="codigoIdea"
                  value={formData.codigoIdea}
                  readOnly
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-500 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Descripción Concisa e Idea de Negocio (¿qué oferta?) *
              </label>
              <textarea
                name="descripcionIdea"
                value={formData.descripcionIdea}
                onChange={handleChange}
                rows={4}
                className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.descripcionIdea ? 'border-red-500 focus:ring-red-200' : 'border-neutral-300 focus:ring-[#39A900]/20 focus:border-[#39A900]'
                }`}
                placeholder="Describa de forma concisa y clara de qué trata su idea, qué productos o servicios va a ofertar, tecnología usada, etc."
              />
              {errors.descripcionIdea && <p className="text-[10px] text-red-500 mt-0.5">{errors.descripcionIdea}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                ¿Existe alguna solución o desarrollo similar en el país o región?
              </label>
              <textarea
                name="solucionParecida"
                value={formData.solucionParecida}
                onChange={handleChange}
                rows={2}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                placeholder="Identifique competidores o soluciones existentes en su territorio..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">¿Reemplaza otra solución?</label>
                <input
                  type="text"
                  name="reemplazaExistente"
                  value={formData.reemplazaExistente}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                  placeholder="Ej. Reemplaza el riego manual tradicional"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">¿Tiene PMV (Producto Mínimo Viable)?</label>
                <select
                  name="cuentaPmv"
                  value={formData.cuentaPmv}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900] bg-white"
                >
                  <option value="">Seleccione</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">¿Realizó pruebas con clientes?</label>
                <select
                  name="pruebasClientes"
                  value={formData.pruebasClientes}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900] bg-white"
                >
                  <option value="">Seleccione</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Estado Actual de la Solución</label>
              <input
                type="text"
                name="estadoActual"
                value={formData.estadoActual}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                placeholder="Ej. Maqueta conceptual, Pruebas de laboratorio, Prototipo funcional básico"
              />
            </div>

            <div className="flex items-start gap-2 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              <input
                type="checkbox"
                name="entiendeModelo"
                id="entiendeModelo"
                checked={formData.entiendeModelo}
                onChange={handleChange}
                className="mt-1 h-4 w-4 accent-[#39A900]"
              />
              <label htmlFor="entiendeModelo" className="text-[10px] text-neutral-600 leading-normal font-medium cursor-pointer">
                <strong>Declaro que comprendo los conceptos del Modelo de Negocio del SENA:</strong> entiendo la estructura conformada por problema, solución, métricas clave, propuesta de valor única, canales, segmento de clientes, costes, flujos de ingresos y ventajas especiales.
              </label>
            </div>
          </div>
        )}

        {/* STEP 4: ¿PARA QUIÉN CREAMOS VALOR? */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#39A900]"></span>
              4. Segmento de Clientes (Propuesta de Valor)
            </h3>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                ¿Quién usará la solución, producto o servicio? (Segmento)
              </label>
              <textarea
                name="quienUsara"
                value={formData.quienUsara}
                onChange={handleChange}
                rows={3}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                placeholder="Defina con claridad los usuarios finales, clientes o beneficiarios directos..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                ¿Qué necesidades o dolores de los clientes satisfacemos?
              </label>
              <textarea
                name="necesidadesClientes"
                value={formData.necesidadesClientes}
                onChange={handleChange}
                rows={3}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                placeholder="Explique las necesidades que se resuelven o los deseos del cliente que se satisfacen con su idea..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                ¿Qué problemas de nuestros clientes ayudamos a solucionar?
              </label>
              <textarea
                name="problemaClientes"
                value={formData.problemaClientes}
                onChange={handleChange}
                rows={3}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                placeholder="Describa el problema crítico de raíz que padece su público objetivo y cómo su proyecto lo alivia..."
              />
            </div>
          </div>
        )}

        {/* STEP 5: CANALES */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#39A900]"></span>
              5. Canales de Distribución y Entrega
            </h3>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                ¿El producto/servicio requiere algún tipo de empaque, embalaje o envase especial?
              </label>
              <textarea
                name="requiereEmpaque"
                value={formData.requiereEmpaque}
                onChange={handleChange}
                rows={3}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                placeholder="Indique si requiere plásticos biodegradables, botellas especiales, cadenas de frío, cajas térmicas, etc."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                ¿Cuenta con una estrategia clara para fijar el precio de venta?
              </label>
              <textarea
                name="estrategiaPrecio"
                value={formData.estrategiaPrecio}
                onChange={handleChange}
                rows={3}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                placeholder="Explique cómo calculará el precio: margen por encima del costo, precio de competidores, suscripción mensual, etc."
              />
            </div>
          </div>
        )}

        {/* STEP 6: FUENTES DE INGRESO */}
        {step === 6 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#39A900]"></span>
              6. Viabilidad y Fuentes de Ingreso
            </h3>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                ¿Cuenta con recursos iniciales para la puesta en marcha de la idea?
              </label>
              <textarea
                name="recursosPuestaMarcha"
                value={formData.recursosPuestaMarcha}
                onChange={handleChange}
                rows={3}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                placeholder="Indique si tiene capital propio, soporte familiar, herramientas de cómputo, o si está en ceros..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                ¿Su producto o servicio ha generado ventas actualmente?
              </label>
              <select
                name="generadoVentas"
                value={formData.generadoVentas}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900] bg-white max-w-xs"
              >
                <option value="">Seleccione</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                ¿Qué tipo de recursos, alianzas o apoyos requiere para la escalabilidad de la idea?
              </label>
              <textarea
                name="apoyoEscalabilidad"
                value={formData.apoyoEscalabilidad}
                onChange={handleChange}
                rows={3}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                placeholder="Ej. Asesoría técnica en desarrollo IoT de Tecnoparque, financiación del Fondo Emprender, etc."
              />
            </div>
          </div>
        )}

        {/* STEP 7: OTROS */}
        {step === 7 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#39A900]"></span>
              7. Equipo y Aspectos Legales / Operativos
            </h3>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                ¿Cómo está conformado su equipo de trabajo? (Roles y Nombres)
              </label>
              <textarea
                name="equipoTrabajo"
                value={formData.equipoTrabajo}
                onChange={handleChange}
                rows={2}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                placeholder="Nombre de cofundadores, aprendices SENA implicados, asesores o desarrolladores..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 border p-3 rounded-lg bg-neutral-50/50">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-neutral-700 uppercase">¿Hay requisitos legales?</label>
                  <select
                    name="requisitosLegales"
                    value={formData.requisitosLegales}
                    onChange={handleChange}
                    className="text-xs px-2 py-1 border border-neutral-300 rounded bg-white"
                  >
                    <option value="">Seleccione</option>
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
                {formData.requisitosLegales === 'Sí' && (
                  <textarea
                    name="descripcionRequisitosLegales"
                    value={formData.descripcionRequisitosLegales}
                    onChange={handleChange}
                    rows={2}
                    className="w-full text-xs px-2 py-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-[#39A900]"
                    placeholder="Especifique requisitos legales (RUT, Cámara de comercio, etc.)"
                  />
                )}
              </div>

              <div className="space-y-2 border p-3 rounded-lg bg-neutral-50/50">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-neutral-700 uppercase">¿Requiere permisos/certificados?</label>
                  <select
                    name="requierePermisos"
                    value={formData.requierePermisos}
                    onChange={handleChange}
                    className="text-xs px-2 py-1 border border-neutral-300 rounded bg-white"
                  >
                    <option value="">Seleccione</option>
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
                {formData.requierePermisos === 'Sí' && (
                  <textarea
                    name="descripcionPermisos"
                    value={formData.descripcionPermisos}
                    onChange={handleChange}
                    rows={2}
                    className="w-full text-xs px-2 py-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-[#39A900]"
                    placeholder="Ej. Registro Invima, Certificaciones de Calidad ISO, etc."
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">¿Interés de Constitución Legal?</label>
                <select
                  name="constitucionInteres"
                  value={formData.constitucionInteres}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900] bg-white"
                >
                  <option value="">Seleccione</option>
                  <option value="Persona Natural">Persona Natural (SAS o RUT)</option>
                  <option value="Persona Jurídica">Persona Jurídica (Empresa LTDA, SAS)</option>
                  <option value="Ambas">Ambas opciones en análisis</option>
                  <option value="No tengo interés por ahora">No tengo interés por ahora</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Estado del Prototipo</label>
                <select
                  name="estadoPrototipo"
                  value={formData.estadoPrototipo}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900] bg-white"
                >
                  <option value="">Seleccione estado</option>
                  <option value="Concepto">En Concepto (Idea teórica)</option>
                  <option value="Prototipo">Prototipo Funcional (Alfa)</option>
                  <option value="Versión Beta">Versión Beta (Listo para testeo de campo)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Enlace a Video Presentación (Elevator Pitch)
              </label>
              <input
                type="url"
                name="enlaceVideo"
                value={formData.enlaceVideo}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
                placeholder="Ej. https://youtube.com/... o enlace de Drive con video explicativo"
              />
              <span className="text-[10px] text-neutral-400">Si dispone de un video que explique su idea innovadora, registre el enlace aquí.</span>
            </div>
          </div>
        )}

        {/* STEP 8: INFORMACIÓN FINAL DE LA IDEA */}
        {step === 8 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#39A900]"></span>
              8. Categorización Final de la Idea
            </h3>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">¿En qué categoría se clasifica su idea? *</label>
              <select
                name="categoriaIdea"
                value={formData.categoriaIdea || ''}
                onChange={handleChange}
                className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.categoriaIdea ? 'border-red-500 focus:ring-red-200' : 'border-neutral-300 focus:ring-[#39A900]/20 focus:border-[#39A900]'
                } bg-white`}
              >
                <option value="">Seleccione Categoría</option>
                {CATEGORIAS_SENA.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.categoriaIdea && <p className="text-[10px] text-red-500 mt-0.5">{errors.categoriaIdea}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 border p-3 rounded-lg bg-neutral-50/50">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-neutral-700 uppercase">¿Viene de una convocatoria?</label>
                  <select
                    name="vieneConvocatoria"
                    value={formData.vieneConvocatoria || ''}
                    onChange={handleChange}
                    className="text-xs px-2 py-1 border border-neutral-300 rounded bg-white"
                  >
                    <option value="">Seleccione</option>
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
                {formData.vieneConvocatoria === 'Sí' && (
                  <input
                    type="text"
                    name="descripcionConvocatoria"
                    value={formData.descripcionConvocatoria || ''}
                    onChange={handleChange}
                    className="w-full text-xs px-2 py-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-[#39A900]"
                    placeholder="Escriba el nombre de la convocatoria"
                  />
                )}
              </div>

              <div className="space-y-2 border p-3 rounded-lg bg-neutral-50/50">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-neutral-700 uppercase">¿Idea avalada por una entidad?</label>
                  <select
                    name="avaladaEntidad"
                    value={formData.avaladaEntidad || ''}
                    onChange={handleChange}
                    className="text-xs px-2 py-1 border border-neutral-300 rounded bg-white"
                  >
                    <option value="">Seleccione</option>
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
                {formData.avaladaEntidad === 'Sí' && (
                  <input
                    type="text"
                    name="nombreEntidadAval"
                    value={formData.nombreEntidadAval || ''}
                    onChange={handleChange}
                    className="w-full text-xs px-2 py-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-[#39A900]"
                    placeholder="Nombre de la institución que avala"
                  />
                )}
              </div>
            </div>

            {/* Official Data Treatment Consent */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="aceptaTratamientoDatos"
                  id="aceptaTratamientoDatos"
                  checked={!!formData.aceptaTratamientoDatos}
                  onChange={handleChange}
                  className={`mt-1 h-4 w-4 rounded text-[#39A900] accent-[#39A900] ${
                    errors.aceptaTratamientoDatos ? 'ring-2 ring-red-500' : ''
                  }`}
                />
                <div className="text-[10px] leading-tight text-neutral-600">
                  <label htmlFor="aceptaTratamientoDatos" className="font-extrabold text-neutral-800 block mb-1 cursor-pointer uppercase">
                    Autorización de Protección y Tratamiento de Datos Personales del SENA *
                  </label>
                  Apreciado (usuario, empresario, aprendiz, ciudadano, etc.), de conformidad con lo establecido en la ley de protección de datos personales del Servicio Nacional de Aprendizaje (SENA), autorizo que la finalidad y tratamiento de los datos personales requeridos a través de este formulario offline es exclusivamente para la gestión, prestación y personalización de los servicios de asesoría de Tecnoparque Colombia.
                </div>
              </div>
              {errors.aceptaTratamientoDatos && (
                <p className="text-[10px] text-red-500 font-bold">{errors.aceptaTratamientoDatos}</p>
              )}
            </div>
          </div>
        )}

        {/* Form Footer Action Buttons */}
        <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-2 border border-neutral-300 text-neutral-600 hover:text-neutral-800 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="w-full sm:w-auto flex items-center justify-center gap-1 px-5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Atrás
              </button>
            )}

            {step < 8 ? (
              <button
                key="btn-next"
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto flex items-center justify-center gap-1 px-6 py-2 bg-[#212121] hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Siguiente
                <ChevronRight className="w-3.5 h-3.5 text-[#39A900]" />
              </button>
            ) : (
              <button
                key="btn-submit"
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-[#39A900] hover:bg-[#2e8800] text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Enviar Registro
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
