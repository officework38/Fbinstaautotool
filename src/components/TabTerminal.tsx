import React, { useState, useEffect, useRef } from 'react';
import { TerminalLog, LogLevel } from '../types';
import { sound } from '../services/sound';
import { 
  Terminal, Trash2, ExternalLink, Download, 
  Search, Shield, CheckCircle2, AlertTriangle, 
  X, Filter
} from 'lucide-react';

interface TabTerminalProps {
  logs: TerminalLog[];
  onClearLogs: () => void;
}

export const TabTerminal: React.FC<TabTerminalProps> = ({
  logs,
  onClearLogs
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isPopOutOpen, setIsPopOutOpen] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(log => {
    if (filterLevel !== 'ALL' && log.level !== filterLevel) return false;
    if (searchQuery.trim() && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleDownloadLogs = () => {
    sound.playClick();
    const content = logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metasync_rpa_logs_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      
      {/* Terminal Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            🔴 Live RPA Execution Terminal & Subprocess Stream
          </h2>
          <span className="text-xs font-mono text-slate-500">({logs.length} events logged)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Download Logs */}
          <button
            onClick={handleDownloadLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
            title="Download Logs as .txt"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Log</span>
          </button>

          {/* Pop Out Window */}
          <button
            onClick={() => {
              sound.playClick();
              setIsPopOutOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>🗔 Pop Out Window</span>
          </button>

          {/* Clear Logs */}
          <button
            onClick={() => {
              sound.playClick();
              onClearLogs();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>🧹 Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>
          <div className="flex items-center gap-1">
            {['ALL', 'INFO', 'SUCCESS', 'WARN', 'ERROR', 'RPA'].map(level => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition ${
                  filterLevel === level
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-48 font-mono"
            />
          </div>

          <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={e => setAutoScroll(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
            />
            <span>Auto-Scroll</span>
          </label>
        </div>
      </div>

      {/* Monospace Terminal Viewport */}
      <div 
        ref={scrollRef}
        className="bg-[#121316] border border-slate-800 rounded-xl p-4 font-mono text-xs text-[#00ff77] h-[480px] overflow-y-auto leading-relaxed shadow-inner space-y-1 selection:bg-emerald-950 selection:text-white"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 py-12 text-center italic">
            No terminal log entries matching current criteria.
          </div>
        ) : (
          filteredLogs.map(log => {
            let color = 'text-[#00ff77]';
            if (log.level === 'SUCCESS') color = 'text-emerald-400 font-semibold';
            if (log.level === 'WARN') color = 'text-amber-400';
            if (log.level === 'ERROR') color = 'text-rose-400 font-bold';
            if (log.level === 'RPA') color = 'text-cyan-400';

            return (
              <div key={log.id} className="hover:bg-slate-900/60 px-1 py-0.5 rounded transition">
                <span className="text-slate-500 mr-2">[{log.timestamp}]</span>
                <span className={`mr-2 font-bold text-[10px] px-1 rounded ${
                  log.level === 'SUCCESS' ? 'bg-emerald-950 text-emerald-300' :
                  log.level === 'ERROR' ? 'bg-rose-950 text-rose-300' :
                  log.level === 'WARN' ? 'bg-amber-950 text-amber-300' :
                  log.level === 'RPA' ? 'bg-cyan-950 text-cyan-300' : 'bg-slate-800 text-slate-300'
                }`}>
                  {log.level}
                </span>
                <span className={color}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Pop Out Terminal Modal */}
      {isPopOutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Live RPA Multi-Window Inspector</h3>
              </div>
              <button
                onClick={() => setIsPopOutOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-[#121316] p-4 font-mono text-xs text-[#00ff77] overflow-y-auto space-y-1">
              {logs.map(log => (
                <div key={log.id}>
                  <span className="text-slate-500 mr-2">[{log.timestamp}]</span>
                  <span className="text-slate-400 mr-2">[{log.level}]</span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
