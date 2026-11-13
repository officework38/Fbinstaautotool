import React, { useState } from 'react';
import { ScheduledTargetItem } from '../types';
import { sound } from '../services/sound';
import { 
  Clock, Power, Play, Trash2, RotateCcw, 
  Film, Eye, CheckCircle2, AlertCircle, Sparkles,
  Calendar, Layers, Monitor, ExternalLink
} from 'lucide-react';

interface TabSchedulerProps {
  targets: ScheduledTargetItem[];
  engineRunning: boolean;
  onToggleEngine: () => void;
  onRemoveTarget: (id: string) => void;
  onUndo: () => void;
  canUndo: boolean;
  onLaunchRpa: (target: ScheduledTargetItem) => void;
  onLaunchAllRpa: () => void;
  onLog: (level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'RPA', msg: string) => void;
}

export const TabScheduler: React.FC<TabSchedulerProps> = ({
  targets,
  engineRunning,
  onToggleEngine,
  onRemoveTarget,
  onUndo,
  canUndo,
  onLaunchRpa,
  onLaunchAllRpa,
  onLog
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(targets[0]?.id || null);

  const selectedTarget = targets.find(t => t.id === selectedTargetId) || targets[0] || null;

  const handleLaunchSelected = () => {
    if (!selectedTarget) {
      sound.playAlert();
      alert('Please select a target row from the Master Scheduler table first!');
      return;
    }
    sound.playClick();
    onLaunchRpa(selectedTarget);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Live System Clock & Engine Status Banner */}
      <div className="bg-slate-900 border border-purple-900/40 rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>Live System Clock & Real-Time Background Engine (v41.8)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleEngine}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm ${
                engineRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{engineRunning ? 'Stop Engine' : '🚀 Start Background Auto-Scheduler Engine'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <div className={`font-semibold flex items-center gap-1.5 ${
            engineRunning ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${engineRunning ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
            <span>
              Status: {engineRunning 
                ? 'Background Real-Time Engine is RUNNING...' 
                : 'Status: Background Engine is STOPPED.'}
            </span>
          </div>

          <span className="text-slate-600">|</span>

          <span className="text-slate-400">
            Auto-Cleanup: <strong className="text-emerald-400">Instant Table Deletion on Execution</strong>
          </span>
        </div>
      </div>

      {/* 2. Advanced Target Inspector & Master Table */}
      <div className="bg-slate-900 border border-blue-900/40 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Monitor className="w-4 h-4" />
            <span>Real Task Executor & Inspector</span>
          </div>
          <span className="text-xs text-slate-400">{targets.length} targets currently armed</span>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Real Target / Page Name</th>
                <th className="py-3 px-3 text-center">Type</th>
                <th className="py-3 px-4">Assigned Media File</th>
                <th className="py-3 px-4">Post Text / Caption</th>
                <th className="py-3 px-3 text-center">Scheduled Date</th>
                <th className="py-3 px-3 text-center">Time</th>
                <th className="py-3 px-3 text-center">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {targets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    🎉 Schedule queue is empty! All tasks have been auto-cleaned or no targets added yet.
                  </td>
                </tr>
              ) : (
                targets.map(row => {
                  const isSelected = row.id === selectedTargetId;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedTargetId(row.id)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-indigo-950/40 text-white' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            row.platform === 'facebook' ? 'bg-blue-400' : 'bg-pink-400'
                          }`}></span>
                          <span>{row.profile}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {row.type}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 max-w-[220px] truncate" title={row.video}>
                        {row.video}
                      </td>

                      <td className="py-3 px-4 max-w-[220px] truncate text-slate-300" title={row.caption}>
                        {row.caption}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-slate-300">
                        {row.date}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-emerald-400 font-bold">
                        {row.time}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playClick();
                            onRemoveTarget(row.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                          title="Remove target from scheduler"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Action Row matching v41.8 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLaunchSelected}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-md transition"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>🚀 Execute Real Post Now for Selected Page</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onLaunchAllRpa();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow-md transition"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>🚀 Execute Real Post Now for ALL Pages in Table</span>
            </button>

            <button
              onClick={() => {
                if (selectedTargetId) {
                  sound.playClick();
                  onRemoveTarget(selectedTargetId);
                } else {
                  alert('Please select a target row first!');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>❌ Remove Target</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
