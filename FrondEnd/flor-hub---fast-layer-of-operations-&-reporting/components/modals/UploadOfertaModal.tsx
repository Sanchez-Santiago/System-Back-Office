import React, { useState, useRef, useCallback } from 'react';
import { api } from '../../services/api';

interface UploadOfertaModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUploading?: boolean;
}

interface ProcessResult {
  type: 'PROMOCION' | 'PLAN' | 'EMPRESA' | 'UNKNOWN';
  row: number;
  status: 'success' | 'error' | 'skipped';
  message: string;
  data?: any;
}

export const UploadOfertaModal: React.FC<UploadOfertaModalProps> = ({
  isOpen,
  onClose,
  isUploading = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);
    setResults([]);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    setResults([]);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('El archivo debe ser CSV o Excel (.xlsx, .xls)');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo no debe superar los 10MB');
      return false;
    }
    
    return true;
  };

  const detectType = (headers: string[]): 'PROMOCION' | 'PLAN' | 'EMPRESA' | 'UNKNOWN' => {
    const headerStr = headers.join(' ').toUpperCase();
    
    if (headerStr.includes('NOMBRE_EMPRESA') || headerStr.includes('PAIS')) {
      return 'EMPRESA';
    }
    if (headerStr.includes('GIGABYTE') || headerStr.includes('LLAMADAS') || headerStr.includes('MENSAJES')) {
      return 'PLAN';
    }
    if (headerStr.includes('BENEFICIOS') || headerStr.includes('DESCUENTO')) {
      return 'PROMOCION';
    }
    
    return 'UNKNOWN';
  };

  const processRow = async (row: any, type: string, rowIndex: number): Promise<ProcessResult> => {
    try {
      switch (type) {
        case 'PROMOCION':
          return await processPromocion(row, rowIndex);
        case 'PLAN':
          return await processPlan(row, rowIndex);
        case 'EMPRESA':
          return await processEmpresa(row, rowIndex);
        default:
          return {
            type: 'UNKNOWN',
            row: rowIndex,
            status: 'error',
            message: 'Tipo de registro no identificado'
          };
      }
    } catch (err: any) {
      return {
        type: type as any || 'UNKNOWN',
        row: rowIndex,
        status: 'error',
        message: err.message || 'Error desconocido'
      };
    }
  };

  const processPromocion = async (row: any, rowIndex: number): Promise<ProcessResult> => {
    const nombre = row.nombre || row.NOMBRE || row.Nombre;
    const descuento = parseInt(row.descuento || row.DESCUENTO || row.Descuento) || 0;
    const beneficios = row.beneficios || row.BENEFICIOS || row.Beneficios;
    const empresaId = parseInt(row.empresa_origen_id || row.EMPRESA_ORIGEN_ID || row.empresa_id || row.EMPRESA_ID);

    if (!nombre) {
      return { type: 'PROMOCION', row: rowIndex, status: 'error', message: 'Nombre es requerido' };
    }

    // Buscar si existe
    const existing = await api.get(`/promociones?search=${encodeURIComponent(nombre)}`);
    
    const data = {
      nombre: nombre.toUpperCase(),
      descuento,
      beneficios,
      empresa_origen_id: empresaId
    };

    if (existing.data && existing.data.length > 0) {
      // Actualizar
      const promoId = existing.data[0].promocion_id;
      await api.put(`/promociones/${promoId}`, data);
      return { type: 'PROMOCION', row: rowIndex, status: 'success', message: 'Promoción actualizada', data };
    } else {
      // Crear
      await api.post('/promociones', data);
      return { type: 'PROMOCION', row: rowIndex, status: 'success', message: 'Promoción creada', data };
    }
  };

  const processPlan = async (row: any, rowIndex: number): Promise<ProcessResult> => {
    const nombre = row.nombre || row.NOMBRE || row.Nombre;
    const precio = parseInt(row.precio || row.PRECIO || row.Precio);
    const gigabyte = parseInt(row.gigabyte || row.GIGABYTE || row.Gigabyte);
    const llamadas = row.llamadas || row.LLAMADAS || row.Llamadas;
    const mensajes = row.mensajes || row.MENSAJES || row.Mensajes;
    const empresaId = parseInt(row.empresa_origen_id || row.EMPRESA_ORIGEN_ID || row.empresa_id || row.EMPRESA_ID);

    if (!nombre || !precio || !gigabyte) {
      return { type: 'PLAN', row: rowIndex, status: 'error', message: 'Nombre, precio y gigabytes son requeridos' };
    }

    // Buscar si existe
    const existing = await api.get(`/planes?search=${encodeURIComponent(nombre)}`);
    
    const data = {
      nombre: nombre.toUpperCase(),
      precio,
      gigabyte,
      llamadas: llamadas || 'Ilimitadas',
      mensajes: mensajes || 'Ilimitados',
      beneficios: row.beneficios || row.BENEFICIOS || '',
      whatsapp: row.whatsapp || row.WHATSAPP || 'SI',
      roaming: row.roaming || row.ROAMING || 'Nacional',
      empresa_origen_id: empresaId
    };

    if (existing.data && existing.data.length > 0) {
      // Actualizar
      const planId = existing.data[0].plan_id;
      await api.put(`/planes/${planId}`, data);
      return { type: 'PLAN', row: rowIndex, status: 'success', message: 'Plan actualizado', data };
    } else {
      // Crear
      await api.post('/planes', data);
      return { type: 'PLAN', row: rowIndex, status: 'success', message: 'Plan creado', data };
    }
  };

  const processEmpresa = async (row: any, rowIndex: number): Promise<ProcessResult> => {
    const nombre = row.nombre_empresa || row.NOMBRE_EMPRESA || row.nombre || row.NOMBRE || row.Nombre;
    const pais = row.pais || row.PAIS || row.Pais || 'Argentina';

    if (!nombre) {
      return { type: 'EMPRESA', row: rowIndex, status: 'error', message: 'Nombre de empresa es requerido' };
    }

    // Buscar si existe
    const existing = await api.get(`/empresa-origen?search=${encodeURIComponent(nombre)}`);
    
    const data = {
      nombre_empresa: nombre,
      pais
    };

    if (existing.data && existing.data.length > 0) {
      // Actualizar
      const empresaId = existing.data[0].empresa_origen_id;
      await api.put(`/empresa-origen/${empresaId}`, data);
      return { type: 'EMPRESA', row: rowIndex, status: 'success', message: 'Empresa actualizada', data };
    } else {
      // Crear
      await api.post('/empresa-origen', data);
      return { type: 'EMPRESA', row: rowIndex, status: 'success', message: 'Empresa creada', data };
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    
    try {
      // Parsear CSV
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setError('El archivo está vacío o no tiene datos');
        setIsProcessing(false);
        return;
      }

      // Obtener headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const type = detectType(headers);
      
      if (type === 'UNKNOWN') {
        setError('No se pudo identificar el tipo de datos. Columnas esperadas: nombre_empresa/pais para empresas, gigabyte/llamadas para planes, o beneficios/descuento para promociones');
        setIsProcessing(false);
        return;
      }

      const newResults: ProcessResult[] = [];
      
      // Procesar cada fila
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        const result = await processRow(row, type, i);
        newResults.push(result);
        
        // Actualizar progreso
        setProgress(Math.round((i / (lines.length - 1)) * 100));
      }

      setResults(newResults);
    } catch (err: any) {
      setError('Error al procesar el archivo: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setResults([]);
    setProgress(0);
    setDragActive(false);
    onClose();
  };

  if (!isOpen) return null;

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div className="relative w-full max-w-[800px] max-h-[90vh] bg-white dark:bg-slate-900 rounded-[3vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700 p-[3vh] text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[2vh]">
              <div className="w-[7vh] h-[7vh] rounded-[2vh] bg-white/10 flex items-center justify-center backdrop-blur-md">
                <svg className="w-[3.5vh] h-[3.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-[clamp(1rem,2vh,2.5rem)]">Actualizar Ofertas</h3>
                <p className="font-bold text-amber-200 uppercase text-[clamp(0.7rem,1.2vh,1.5rem)]">Gestión de Promociones, Planes y Empresas</p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="w-[6vh] h-[6vh] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              disabled={isProcessing}
            >
              <svg className="w-[3vh] h-[3vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="p-[3vh] space-y-[2.5vh] overflow-y-auto flex-1">
          {/* Info */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-[2vh] p-[2.5vh] border border-amber-100 dark:border-amber-800">
            <p className="font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest mb-[1.5vh] text-[clamp(0.7rem,1.2vh,1.5rem)]">
              El sistema detecta automáticamente el tipo:
            </p>
            <div className="grid grid-cols-3 gap-[1.5vh]">
              <div className="bg-white dark:bg-slate-800 rounded-[1.5vh] p-[1.5vh] text-center border border-amber-200 dark:border-amber-700">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[clamp(0.6rem,1vh,1.3rem)] block">EMPRESA</span>
                <span className="text-xs text-slate-500">nombre_empresa, pais</span>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-[1.5vh] p-[1.5vh] text-center border border-amber-200 dark:border-amber-700">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[clamp(0.6rem,1vh,1.3rem)] block">PLAN</span>
                <span className="text-xs text-slate-500">nombre, precio, gigabyte...</span>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-[1.5vh] p-[1.5vh] text-center border border-amber-200 dark:border-amber-700">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[clamp(0.6rem,1vh,1.3rem)] block">PROMOCIÓN</span>
                <span className="text-xs text-slate-500">nombre, descuento, beneficios...</span>
              </div>
            </div>
          </div>

          {/* Dropzone */}
          {!results.length && (
            <div
              className={`relative border-2 border-dashed rounded-[2.5vh] p-[4vh] text-center transition-all ${
                dragActive 
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30' 
                  : 'border-slate-300 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-600'
              } ${selectedFile ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isProcessing && inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleChange}
                disabled={isProcessing}
              />
              
              {selectedFile ? (
                <div className="animate-in fade-in zoom-in duration-300">
                <div className="w-[8vh] h-[8vh] rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-[2vh]">
                  <svg className="w-[4vh] h-[4vh] text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                  <p className="font-black text-slate-800 dark:text-white uppercase text-[clamp(0.9rem,1.5vh,2rem)]">{selectedFile.name}</p>
                  <p className="font-bold text-slate-500 dark:text-slate-400 mt-[1vh] text-[clamp(0.7rem,1.1vh,1.4rem)]">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <>
                <div className="w-[10vh] h-[10vh] rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-[2vh]">
                  <svg className="w-[5vh] h-[5vh] text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                </div>
                  <p className="font-black text-slate-700 dark:text-slate-300 uppercase text-[clamp(0.9rem,1.5vh,2rem)]">
                    Arrastra el archivo aquí
                  </p>
                  <p className="font-bold text-slate-500 dark:text-slate-400 mt-[1vh] text-[clamp(0.7rem,1.1vh,1.4rem)]">
                    o haz clic para seleccionar
                  </p>
                  <p className="font-bold text-slate-400 dark:text-slate-500 mt-[1.5vh] text-[clamp(0.6rem,1vh,1.3rem)]">
                    CSV, XLSX o XLS (máx. 10MB)
                  </p>
                </>
              )}
            </div>
          )}

          {/* Progreso */}
          {isProcessing && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-[2vh] p-[2.5vh] border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-[1.5vh]">
                <span className="font-black text-blue-800 dark:text-blue-300 uppercase">Procesando...</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
              </div>
              <div className="w-full h-[1.5vh] bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Resultados */}
          {results.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2vh] p-[2.5vh] border border-slate-200 dark:border-slate-700 max-h-[300px] overflow-y-auto">
              <div className="flex items-center justify-between mb-[2vh]">
                <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-widest">Resultados</h4>
                <div className="flex gap-[2vh]">
                  <span className="px-[1.5vh] py-[0.8vh] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full font-bold text-[clamp(0.7rem,1vh,1.3rem)]">
                    {successCount} Éxitos
                  </span>
                  <span className="px-[1.5vh] py-[0.8vh] bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 rounded-full font-bold text-[clamp(0.7rem,1vh,1.3rem)]">
                    {errorCount} Errores
                  </span>
                </div>
              </div>
              
              <div className="space-y-[1vh]">
                {results.map((result, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-[1.5vh] p-[1.5vh] rounded-[1.5vh] ${
                      result.status === 'success' 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                        : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    <div className={`w-[3vh] h-[3vh] rounded-full flex items-center justify-center flex-shrink-0 ${
                      result.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}>
                      {result.status === 'success' ? (
                        <svg className="w-[2vh] h-[2vh] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      ) : (
                        <svg className="w-[2vh] h-[2vh] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[clamp(0.65rem,0.95vh,1.3rem)]">
                        Fila {result.row} - {result.type}
                      </p>
                      <p className={`text-[clamp(0.6rem,0.9vh,1.2rem)] truncate ${
                        result.status === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {result.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && !isProcessing && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-[2vh] p-[2vh] flex items-center gap-[2vh] animate-in slide-in-from-top-2">
              <svg className="w-[3vh] h-[3vh] text-rose-600 dark:text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <p className="font-bold text-rose-700 dark:text-rose-400 text-[clamp(0.7rem,1.1vh,1.4rem)]">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-[2vh] flex-shrink-0">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1 py-[2vh] rounded-[2vh] font-black uppercase tracking-widest border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 text-[clamp(0.8rem,1.3vh,1.7rem)]"
            >
              {results.length > 0 ? 'Cerrar' : 'Cancelar'}
            </button>
            {!results.length && (
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isProcessing}
                className="flex-1 py-[2vh] rounded-[2vh] font-black uppercase tracking-widest bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:shadow-none text-[clamp(0.8rem,1.3vh,1.7rem)] flex items-center justify-center gap-[1.5vh]"
              >
                {isProcessing ? (
                  <>
                    <svg className="w-[2vh] h-[2vh] animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  'Procesar Archivo'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};