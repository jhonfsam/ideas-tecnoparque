import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { SyncLog } from '../types';

interface SyncLogConsoleProps {
  logs: SyncLog[];
  onClear: () => void;
  isOnline: boolean;
  isSyncing: boolean;
  onForceSync: () => void;
  pendingCount: number;
}

export default function SyncLogConsole({
  logs,
  onClear,
  isOnline,
  isSyncing,
  onForceSync,
  pendingCount,
}: SyncLogConsoleProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div id="sync-console-container" className="bg-[#1e1e1e] border-t border-neutral-800 text-neutral-200 font-mono text-xs shadow-2xl rounded-t-xl overflow-hidden flex flex-col h-64 md:h-72">
      {/* Console Header */}
      <div id="sync-console-header" className="bg-[#121212] px-4 py-2.5 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#39A900] animate-pulse" />
          <span className="font-bold tracking-tight text-neutral-100">
            CONSOLA DE SINCRONIZACIÓN AUTOMÁTICA
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400">
            v1.0.0
          </span>
        </div>

        {/* Network & Action controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-900 border border-neutral-800">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#39A900]" />
                <span className="text-[#39A900] font-bold text-[10px]">CONECTADO</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-500" />
                <span className="text-red-500 font-bold text-[10px]">SIN CONEXIÓN</span>
              </>
            )}
          </div>

          {pendingCount > 0 && (
            <button
              id="force-sync-btn"
              onClick={onForceSync}
              disabled={isSyncing || !isOnline}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold text-[10px] uppercase transition-all ${
                isOnline && !isSyncing
                  ? 'bg-[#39A900] hover:bg-[#2e8800] text-white cursor-pointer'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
              title="Forzar sincronización inmediata"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sincronizar ({pendingCount})</span>
            </button>
          )}

          <button
            id="clear-logs-btn"
            onClick={onClear}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Limpiar consola"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Console Log List */}
      <div
        id="sync-logs-list"
        ref={containerRef}
        className="flex-1 p-4 overflow-y-auto space-y-2 select-text selection:bg-[#39A900] selection:text-white"
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-center py-6">
            <Terminal className="w-8 h-8 mb-2 opacity-30 text-neutral-400" />
            <p>Monitoreo listo. Realice cambios, guarde borradores o envíe formularios para ver logs.</p>
            <p className="text-[10px] mt-1 text-neutral-600">
              Sugerencia: Cambie el estado de red a "Fuera de línea" para simular captura de campo remota.
            </p>
          </div>
        ) : (
          logs.map((log) => {
            let colorClass = 'text-neutral-300';
            let prefix = '[INFO]';
            if (log.type === 'success') {
              colorClass = 'text-emerald-400 font-medium';
              prefix = '[✓ OK]';
            } else if (log.type === 'warning') {
              colorClass = 'text-amber-400';
              prefix = '[! WARN]';
            } else if (log.type === 'error') {
              colorClass = 'text-red-400 font-semibold';
              prefix = '[✗ ERR]';
            }

            return (
              <div key={log.id} className="flex gap-2 leading-relaxed break-all font-mono hover:bg-neutral-900/50 p-1 rounded transition-colors">
                <span className="text-neutral-500 shrink-0">[{log.timestamp}]</span>
                <span className={colorClass}>
                  {prefix} {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-[#121212] px-4 py-1.5 flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-800">
        <div>Cola de envío: <span className="font-bold text-neutral-300">{pendingCount} formularios pendientes</span></div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#39A900]' : 'bg-red-500'} animate-ping`} />
          <span>Servicio de Sincronización SENA Activo</span>
        </div>
      </div>
    </div>
  );
}
