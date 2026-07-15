import { FormularioSena } from './types';

export interface GoogleSpreadsheetInfo {
  id: string;
  name: string;
  webViewLink?: string;
}

const HEADERS = [
  'ID_SENA',
  'Código de Idea',
  'Fecha de Registro',
  'Nombres Completos',
  'Tipo Doc',
  'Número Doc',
  'Correo',
  'Celular',
  'Departamento Residencia',
  'Ciudad Residencia',
  'Nombre de Idea',
  'Categoría',
  'Descripción de Idea',
  'Cuenta PMV',
  'Pruebas de Clientes',
  'Generado Ventas',
  'Equipo de Trabajo'
];

/**
 * Searches for an existing spreadsheet named "SENA - Registro de Ideas" in Google Drive.
 */
export async function findSpreadsheet(accessToken: string): Promise<GoogleSpreadsheetInfo | null> {
  const query = encodeURIComponent("name = 'SENA - Registro de Ideas' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error buscando hoja de cálculo: ${errText}`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0];
  }
  return null;
}

/**
 * Creates a new spreadsheet named "SENA - Registro de Ideas" and sets up headers.
 */
export async function createSpreadsheet(accessToken: string): Promise<GoogleSpreadsheetInfo> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'SENA - Registro de Ideas',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error al crear la hoja de cálculo: ${errText}`);
  }

  const sheetData = await response.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const webViewLink = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write headers
  await writeHeaders(accessToken, spreadsheetId);

  return {
    id: spreadsheetId,
    name: 'SENA - Registro de Ideas',
    webViewLink,
  };
}

/**
 * Fetches the name of the first sheet (tab) in the spreadsheet.
 * This resolves issues with non-English accounts where the default sheet is named "Hoja 1", "Planilha 1", etc.
 */
export async function getFirstSheetName(accessToken: string, spreadsheetId: string): Promise<string> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.ok) {
      const data = await response.json();
      if (data.sheets && data.sheets.length > 0 && data.sheets[0].properties) {
        return data.sheets[0].properties.title || 'Sheet1';
      }
    }
  } catch (e) {
    console.error("Error getting first sheet name:", e);
  }
  return 'Sheet1';
}

/**
 * Helper to write headers to a newly created spreadsheet
 */
async function writeHeaders(accessToken: string, spreadsheetId: string): Promise<void> {
  const sheetName = await getFirstSheetName(accessToken, spreadsheetId);
  const encodedSheet = encodeURIComponent(sheetName);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheet}!A1:Q1?valueInputOption=RAW`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [HEADERS],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error al escribir cabeceras: ${errText}`);
  }
}

/**
 * Formats a form record into an array of cell values
 */
function formatFormToRow(form: FormularioSena): any[] {
  return [
    form.id,
    form.codigoIdea,
    form.createdAt,
    form.nombresCompletos,
    form.tipoDocumento,
    form.numeroDocumento,
    form.correo,
    form.celular,
    form.deptoResidencia,
    form.ciudadResidencia,
    form.nombreIdea,
    form.categoriaIdea,
    form.descripcionIdea || '',
    form.cuentaPmv,
    form.pruebasClientes || 'No',
    form.generadoVentas,
    form.equipoTrabajo || ''
  ];
}

/**
 * Synchronizes a single FormularioSena record to Google Sheets.
 * If the record ID already exists in the sheet, it updates that row.
 * Otherwise, it appends a new row.
 */
export async function syncFormToSheet(
  accessToken: string,
  spreadsheetId: string,
  form: FormularioSena
): Promise<void> {
  const sheetName = await getFirstSheetName(accessToken, spreadsheetId);
  const encodedSheet = encodeURIComponent(sheetName);

  // 1. Get current values to see if this ID already exists
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheet}!A:A`;
  const getResponse = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!getResponse.ok) {
    const errText = await getResponse.text();
    throw new Error(`Error leyendo registros de la hoja de cálculo: ${errText}`);
  }

  const getData = await getResponse.json();
  const rows = getData.values || [];

  // Check if headers are missing or incorrect in Row 1
  const hasHeaders = rows.length > 0 && rows[0] && rows[0][0] === 'ID_SENA';
  if (!hasHeaders) {
    await writeHeaders(accessToken, spreadsheetId);
  }

  // Find index of existing ID (columns start from row 1)
  let rowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i] && rows[i][0] === form.id) {
      rowIndex = i + 1; // 1-indexed row number
      break;
    }
  }

  const rowValues = formatFormToRow(form);

  if (rowIndex !== -1) {
    // UPDATE existing row
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheet}!A${rowIndex}:Q${rowIndex}?valueInputOption=RAW`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    });

    if (!updateResponse.ok) {
      const errText = await updateResponse.text();
      throw new Error(`Error actualizando fila en la hoja de cálculo: ${errText}`);
    }
  } else {
    // APPEND new row
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheet}!A:Q:append?valueInputOption=RAW`;
    const appendResponse = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    });

    if (!appendResponse.ok) {
      const errText = await appendResponse.text();
      throw new Error(`Error añadiendo registro a la hoja de cálculo: ${errText}`);
    }
  }
}

/**
 * Synchronizes multiple forms in bulk (ideal for initial sync or manual sync of all records).
 */
export async function syncAllToSheet(
  accessToken: string,
  spreadsheetId: string,
  forms: FormularioSena[]
): Promise<number> {
  if (forms.length === 0) return 0;

  const sheetName = await getFirstSheetName(accessToken, spreadsheetId);
  const encodedSheet = encodeURIComponent(sheetName);
  
  // 1. Clear Sheet1!A2:Q10000 or Hoja 1!A2:Q10000 to keep layout but wipe old data
  const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheet}!A2:Q10000:clear`;
  const clearResponse = await fetch(clearUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!clearResponse.ok) {
    const errText = await clearResponse.text();
    throw new Error(`Error limpiando planilla antes de sincronización: ${errText}`);
  }

  // 2. Ensure headers are ALWAYS present in Row 1 (A1:Q1)
  await writeHeaders(accessToken, spreadsheetId);

  // 3. Format all forms to rows
  const allRows = forms.map(f => formatFormToRow(f));

  // 4. Write all rows starting from A2
  const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheet}!A2?valueInputOption=RAW`;
  const writeResponse = await fetch(writeUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: allRows,
    }),
  });

  if (!writeResponse.ok) {
    const errText = await writeResponse.text();
    throw new Error(`Error escribiendo planilla masiva: ${errText}`);
  }

  return forms.length;
}

/**
 * Transmite los datos de un formulario directamente a una URL de Macro de Google (Apps Script Web App).
 * Esto evita los problemas de CORS y no requiere tokens de inicio de sesión de Google en cada dispositivo.
 */
export async function syncFormToScript(scriptUrl: string, form: FormularioSena): Promise<void> {
  if (!scriptUrl) {
    throw new Error('La URL del Macro de Google (Apps Script) no está configurada.');
  }

  // Usamos fetch con mode: 'no-cors' para evitar errores de preflight de CORS en múltiples dispositivos.
  // El navegador enviará la petición POST y se ejecutará correctamente en el servidor de Google.
  await fetch(scriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(form)
  });
}

/**
 * Fetches all row records from the Google Sheet and maps them back to FormularioSena objects.
 */
export async function fetchFormsFromSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<FormularioSena[]> {
  const sheetName = await getFirstSheetName(accessToken, spreadsheetId);
  const encodedSheet = encodeURIComponent(sheetName);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheet}!A2:Q10000`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error leyendo registros de la hoja de cálculo: ${errText}`);
  }

  const data = await response.json();
  const rows = data.values || [];

  return rows.map((row: any[]) => {
    const id = row[0] || `import-${Math.random().toString(36).substr(2, 9)}`;
    const code = row[1] || '';
    const date = row[2] || new Date().toISOString();
    return {
      id,
      createdAt: date,
      updatedAt: date,
      status: 'synced' as const,
      nombresCompletos: row[3] || '',
      tipoDocumento: row[4] || '',
      numeroDocumento: row[5] || '',
      paisExpedicion: 'Colombia',
      fechaExpedicion: '',
      deptoExpedicion: '',
      ciudadExpedicion: '',
      fechaNacimiento: '',
      grupoSanguineo: '',
      genero: '',
      correo: row[6] || '',
      celular: row[7] || '',
      estrato: '',
      grupoPoblacional: '',
      nombreEps: '',
      discapacidad: '',
      cabezaFamilia: '',
      victimaViolencia: '',
      deptoResidencia: row[8] || '',
      ciudadResidencia: row[9] || '',
      barrio: '',

      nombreInstitucion: '',
      gradoEscolaridad: '',
      tituloObtenido: '',
      fechaTerminacion: '',
      ocupacion: '',

      nombreIdea: row[10] || '',
      codigoIdea: code,
      descripcionIdea: row[12] || '',
      solucionParecida: '',
      reemplazaExistente: '',
      cuentaPmv: (row[13] === 'Sí' || row[13] === 'No' || row[13] === '') ? row[13] as any : '',
      pruebasClientes: (row[14] === 'Sí' || row[14] === 'No' || row[14] === '') ? row[14] as any : '',
      estadoActual: '',
      entiendeModelo: false,

      quienUsara: '',
      necesidadesClientes: '',
      problemaClientes: '',

      requiereEmpaque: '',
      estrategiaPrecio: '',

      recursosPuestaMarcha: '',
      generadoVentas: (row[15] === 'Sí' || row[15] === 'No' || row[15] === '') ? row[15] as any : '',
      apoyoEscalabilidad: '',

      equipoTrabajo: row[16] || '',
      requisitosLegales: '',
      descripcionRequisitosLegales: '',
      requierePermisos: '',
      descripcionPermisos: '',
      constitucionInteres: '',
      enlaceVideo: '',
      estadoPrototipo: '',

      categoriaIdea: row[11] || '',
      vieneConvocatoria: '',
      descripcionConvocatoria: '',
      avaladaEntidad: '',
      nombreEntidadAval: '',
      aceptaTratamientoDatos: true,
    };
  });
}

