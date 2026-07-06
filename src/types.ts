export type SyncStatus = 'draft' | 'pending' | 'synced';

export interface FormularioSena {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: SyncStatus;
  syncAttemptedAt?: string;

  // 1. INFORMACIÓN USUARIO
  nombresCompletos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  paisExpedicion: string;
  fechaExpedicion: string;
  deptoExpedicion: string;
  ciudadExpedicion: string;
  fechaNacimiento: string;
  grupoSanguineo: string;
  genero: string;
  correo: string;
  celular: string;
  estrato: string;
  grupoPoblacional: string;
  nombreEps: string;
  discapacidad: 'Sí' | 'No' | '';
  cabezaFamilia: 'Sí' | 'No' | '';
  victimaViolencia: 'Sí' | 'No' | '';
  deptoResidencia: string;
  ciudadResidencia: string;
  barrio: string;

  // 2. ÚLTIMOS ESTUDIOS Y OCUPACIONES
  nombreInstitucion: string;
  gradoEscolaridad: string;
  tituloObtenido: string;
  fechaTerminacion: string;
  ocupacion: string;

  // 3. REGISTRO IDEA
  nombreIdea: string;
  codigoIdea: string;
  descripcionIdea: string;
  solucionParecida: string;
  reemplazaExistente: string;
  cuentaPmv: 'Sí' | 'No' | '';
  pruebasClientes: 'Sí' | 'No' | '';
  estadoActual: string;
  entiendeModelo: boolean;

  // 4. ¿PARA QUIÉN CREAMOS VALOR?
  quienUsara: string;
  necesidadesClientes: string;
  problemaClientes: string;

  // 5. CANALES
  requiereEmpaque: string;
  estrategiaPrecio: string;

  // 6. FUENTES DE INGRESO
  recursosPuestaMarcha: string;
  generadoVentas: 'Sí' | 'No' | '';
  apoyoEscalabilidad: string;

  // 7. OTROS
  equipoTrabajo: string;
  requisitosLegales: 'Sí' | 'No' | '';
  descripcionRequisitosLegales: string;
  requierePermisos: 'Sí' | 'No' | '';
  descripcionPermisos: string;
  constitucionInteres: 'Persona Natural' | 'Persona Jurídica' | 'Ambas' | 'No tengo interés por ahora' | '';
  enlaceVideo: string;
  estadoPrototipo: 'Concepto' | 'Prototipo' | 'Versión Beta' | '';

  // 8. INFORMACIÓN FINAL DE LA IDEA
  categoriaIdea: string;
  vieneConvocatoria: 'Sí' | 'No' | '';
  descripcionConvocatoria: string;
  avaladaEntidad: 'Sí' | 'No' | '';
  nombreEntidadAval: string;
  aceptaTratamientoDatos: boolean;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export const INITIAL_FORM_STATE: Omit<FormularioSena, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
  nombresCompletos: '',
  tipoDocumento: '',
  numeroDocumento: '',
  paisExpedicion: 'Colombia',
  fechaExpedicion: '',
  deptoExpedicion: '',
  ciudadExpedicion: '',
  fechaNacimiento: '',
  grupoSanguineo: '',
  genero: '',
  correo: '',
  celular: '',
  estrato: '',
  grupoPoblacional: '',
  nombreEps: '',
  discapacidad: '',
  cabezaFamilia: '',
  victimaViolencia: '',
  deptoResidencia: '',
  ciudadResidencia: '',
  barrio: '',

  nombreInstitucion: '',
  gradoEscolaridad: '',
  tituloObtenido: '',
  fechaTerminacion: '',
  ocupacion: '',

  nombreIdea: '',
  codigoIdea: '',
  descripcionIdea: '',
  solucionParecida: '',
  reemplazaExistente: '',
  cuentaPmv: '',
  pruebasClientes: '',
  estadoActual: '',
  entiendeModelo: false,

  quienUsara: '',
  necesidadesClientes: '',
  problemaClientes: '',

  requiereEmpaque: '',
  estrategiaPrecio: '',

  recursosPuestaMarcha: '',
  generadoVentas: '',
  apoyoEscalabilidad: '',

  equipoTrabajo: '',
  requisitosLegales: '',
  descripcionRequisitosLegales: '',
  requierePermisos: '',
  descripcionPermisos: '',
  constitucionInteres: '',
  enlaceVideo: '',
  estadoPrototipo: '',

  categoriaIdea: '',
  vieneConvocatoria: '',
  descripcionConvocatoria: '',
  avaladaEntidad: '',
  nombreEntidadAval: '',
  aceptaTratamientoDatos: false,
};
