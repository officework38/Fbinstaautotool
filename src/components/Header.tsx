import React, { useState, useEffect } from 'react';
import { sound } from '../services/sound';
import { 
  Clock, Power, RotateCcw, Volume2, VolumeX, 
  Layers, CheckCircle, Shield, Download, FileText
} from 'lucide-react';

interface HeaderProps {
  engineRunning: boolean;
  onToggleEngine: () => void;
  deletedStackCount: number;
  onUndo: () => void;
  activeAccountsCount: number;
  queuedTasksCount: number;
  completedTasksCount: number;
  onExportSchedule: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  engineRunning,
  onToggleEngine,
  deletedStackCount,
  onUndo,
  activeAccountsCount,
  queuedTasksCount,
  completedTasksCount,
  onExportSchedule
}) => {
  const [currentTime, setCurrentTime] = useState<string>('--:--:--');
  const [currentDate, setCurrentDate] = useState<string>('----/--/--');
  const [isSoundOn, setIsSoundOn] = useState<boolean>(sound.isEnabled());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      setCurrentDate(dateStr);
      setCurrentTime(timeStr);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSoundToggle = () => {
    const newState = sound.toggle();
    setIsSoundOn(newState);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Software Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-blue-400 font-black text-lg">
              M
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                MetaSync Pro Auto-Scheduler
              </h1>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/60">
                v40.4 Pro Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Facebook & Instagram Multi-Account RPA Engine · Graph API v21.0 · Auto-Cleanup
            </p>
          </div>
        </div>

        {/* Live System Clock & Engine Status */}
        <div className="flex items-center gap-4">
          
          {/* Live System Clock widget */}
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg">
            <Clock className="w-4 h-4 text-purple-400" />
            <div className="text-xs font-mono">
              <span className="text-slate-400 mr-1.5">{currentDate}</span>
              <span className="text-emerald-400 font-bold">{currentTime}</span>
            </div>
          </div>

          {/* Background Engine Toggle Button */}
          <button
            onClick={onToggleEngine}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
              engineRunning
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{engineRunning ? 'ENGINE ARMED' : 'ARM ENGINE'}</span>
          </button>

          {/* Undo Action */}
          <button
            onClick={onUndo}
            disabled={deletedStackCount === 0}
            title={deletedStackCount > 0 ? `Undo Delete (${deletedStackCount} in stack)` : 'No actions to undo'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              deletedStackCount > 0
                ? 'bg-purple-950/60 border-purple-800/80 text-purple-300 hover:bg-purple-900/80'
                : 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo {deletedStackCount > 0 && `(${deletedStackCount})`}</span>
          </button>

          {/* Export Schedule button */}
          <button
            onClick={onExportSchedule}
            title="Export Schedule to JSON / CSV"
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 transition"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={handleSoundToggle}
            title={isSoundOn ? 'Sound feedback ON' : 'Sound feedback MUTED'}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 transition"
          >
            {isSoundOn ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

        </div>

      </div>

      {/* Sub-bar Quick Status Line */}
      <div className="bg-slate-950/70 border-t border-slate-800/60 px-4 sm:px-6 py-1.5 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Accounts: <strong className="text-slate-200">{activeAccountsCount}</strong> Active</span>
          </div>
          <span>·</span>
          <div>
            Queue: <strong className="text-blue-400">{queuedTasksCount}</strong> Pending
          </div>
          <span>·</span>
          <div>
            Dispatched: <strong className="text-emerald-400">{completedTasksCount}</strong> Auto-Cleaned
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-slate-500">Auto-Cleanup:</span>
          <span className="text-emerald-400 font-semibold">ON (Instant Table Sync)</span>
        </div>
      </div>
    </header>
  );
};
