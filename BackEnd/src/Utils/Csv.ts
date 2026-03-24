import { parse } from 'csv-parse/sync';
import * as xlsx from "xlsx";
import { Buffer } from "node:buffer";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export async function parseUploadedFile(file: File | MulterFile) {
  const filename = (file as any).name || (file as any).originalname;
  const ext = filename.split(".").pop()?.toLowerCase();

  if (!ext) {
    throw new Error("No se pudo determinar la extensión del archivo");
  }

  if (ext === "csv") {
    let csvContent: string;
    if ('text' in file && typeof file.text === 'function') {
      csvContent = await (file as File).text();
    } else {
      const multerFile = file as MulterFile;
      csvContent = multerFile.buffer.toString('utf-8');
    }
    return parse(csvContent, { skip_empty_lines: true });
  }

  if (ext === "xlsx" || ext === "xls") {
    let buffer: ArrayBuffer;
    if ('arrayBuffer' in file && typeof file.arrayBuffer === 'function') {
      buffer = await (file as File).arrayBuffer();
    } else {
      const multerFile = file as MulterFile;
      buffer = multerFile.buffer.buffer as ArrayBuffer;
    }
    const workbook = xlsx.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet, { header: 1 });
  }

  throw new Error(`Formato de archivo no soportado: ${ext}`);
}

// Función alternativa con más validaciones y opciones
export async function parseUploadedFileAdvanced(file: File) {
  // Validaciones iniciales
  if (!file.name) {
    throw new Error("El archivo no tiene nombre");
  }

  if (file.size === 0) {
    throw new Error("El archivo está vacío");
  }

  const filename = file.name;
  const ext = filename.split(".").pop()?.toLowerCase();
  const maxSize = 10_000_000; // 10MB

  if (file.size > maxSize) {
    throw new Error(
      `El archivo es demasiado grande. Máximo: ${maxSize / 1_000_000}MB`,
    );
  }

  switch (ext) {
    case "csv": {
      try {
        // Verificar que sea texto válido
        const csvContent = await file.text();

        if (!csvContent.trim()) {
          throw new Error("El archivo CSV está vacío");
        }

        // Opciones más robustas para el parser CSV
        const parsed = parse(csvContent, {
          skip_empty_lines: true
        });

        return {
          type: "csv",
          filename: filename,
          rowCount: parsed.length,
          data: parsed,
        };
      } catch (error) {
        throw new Error(`Error procesando CSV: ${error}`);
      }
    }

    case "xlsx":
    case "xls": {
      try {
        const buffer = await file.arrayBuffer();

        if (buffer.byteLength === 0) {
          throw new Error("El archivo Excel está vacío");
        }

        const workbook = xlsx.read(buffer, {
          type: "array",
          // Opciones adicionales para mejor compatibilidad
          cellDates: true,
          cellNF: false,
          cellText: false,
        });

        if (workbook.SheetNames.length === 0) {
          throw new Error("El archivo Excel no contiene hojas de cálculo");
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Diferentes opciones de parseo
        const jsonData = xlsx.utils.sheet_to_json(sheet, {
          header: 1, // Usar números como headers (fila 0, 1, 2...)
          raw: false, // Convertir fechas y números a strings
          defval: "", // Valor por defecto para celdas vacías
        });

        return {
          type: "excel",
          filename: filename,
          sheetNames: workbook.SheetNames,
          activeSheet: sheetName,
          rowCount: jsonData.length,
          data: jsonData,
        };
      } catch (error) {
        throw new Error(`Error procesando Excel: ${error}`);
      }
    }

    default:
      throw new Error(
        `Formato de archivo no soportado: ${ext}. Formatos permitidos: CSV, XLS, XLSX`,
      );
  }
}

// Función utilitaria para detectar el separador en CSV
export function detectCSVSeparator(csvContent: string): string {
  const separators = [",", ";", "\t", "|"];
  const sampleLines = csvContent.split("\n").slice(0, 5); // Tomar las primeras 5 líneas

  let bestSeparator = ",";
  let maxCount = 0;

  for (const sep of separators) {
    let count = 0;
    for (const line of sampleLines) {
      count += line.split(sep).length - 1;
    }
    if (count > maxCount) {
      maxCount = count;
      bestSeparator = sep;
    }
  }

  return bestSeparator;
}
