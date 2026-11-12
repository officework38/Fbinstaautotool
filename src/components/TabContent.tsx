import React, { useState } from 'react';
import { ScheduledTargetItem } from '../types';
import { sound } from '../services/sound';
import { 
  FileText, Clock, Calendar, Upload, Trash2, 
  Edit3, ArrowRight, Film, Sparkles, FolderOpen, 
  RotateCcw, CheckSquare, Square, Layers, Plus
} from 'lucide-react';

interface TabContentProps {
  targets: ScheduledTargetItem[];
  onUpdateTarget: (target: ScheduledTargetItem) => void;
  onUpdateAllTargets: (targets: ScheduledTargetItem[]) => void;
  onRemoveTarget: (id: string) => void;
  onClearTable: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onOpenVideoPicker: (targetId?: string) => void;
  onOpenEditModal: (target: ScheduledTargetItem) => void;
  onGoToScheduler: () => void;
  onLog: (level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'RPA', msg: string) => void;
}

export const TabContent: React.FC<TabContentProps> = ({
  targets,
  onUpdateTarget,
  onUpdateAllTargets,
  onRemoveTarget,
  onClearTable,
  onUndo,
  canUndo,
  onOpenVideoPicker,
  onOpenEditModal,
  onGoToScheduler,
  onLog
}) => {
  // Global Bulk Caption state
  const [bulkCaption, setBulkCaption] = useState<string>(
    '🚀 New video is out! Watch till the end for the top tips. Share your thoughts in the comments 👇 #trending #viral #meta2026'
  );
  const [applyCaptionToAll, setApplyCaptionToAll] = useState<boolean>(true);

  // Global Bulk Time state
  const todayStr = new Date().toISOString().split('T')[0];
  const [bulkDate, setBulkDate] = useState<string>(todayStr);
  const [bulkTime, setBulkTime] = useState<string>('12:00');
  const [applyTimeToAll, setApplyTimeToAll] = useState<boolean>(true);
  const [staggerMinutes, setStaggerMinutes] = useState<number>(0);

  // Selection
  const [selectedRowId, setSelectedRowId] = useState<string | null>(targets[0]?.id || null);

  // Apply Bulk Caption
  const handleApplyBulkCaption = () => {
    if (!bulkCaption.trim()) {
      sound.playAlert();
      onLog('WARN', 'Caption text cannot be blank.');
      return;
    }
    if (targets.length === 0) {
      sound.playAlert();
      onLog('WARN', 'No target rows available in table.');
      return;
    }

    sound.playClick();
    if (applyCaptionToAll) {
      const updated = targets.map(t => ({
        ...t,
        caption: bulkCaption
      }));
      onUpdateAllTargets(updated);
      sound.playSuccess();
      onLog('INFO', `Applied bulk caption across all ${targets.length} target rows.`);
    } else if (selectedRowId) {
      const updated = targets.map(t => t.id === selectedRowId ? { ...t, caption: bulkCaption } : t);
      onUpdateAllTargets(updated);
      sound.playSuccess();
      onLog('INFO', `Applied caption to selected target row [${selectedRowId}].`);
    }
  };

  // Apply Bulk Time
  const handleApplyBulkTime = () => {
    if (!bulkDate || !bulkTime) {
      sound.playAlert();
      onLog('WARN', 'Please enter a valid schedule date and time.');
      return;
    }
    if (targets.length === 0) return;

    sound.playClick();
    if (applyTimeToAll) {
      const [h, m] = bulkTime.split(':').map(Number);
      const updated = targets.map((t, idx) => {
        let targetH = h;
        let targetM = m + (staggerMinutes * idx);
        while (targetM >= 60) {
          targetH = (targetH + 1) % 24;
          targetM -= 60;
        }
        const timeFormatted = `${String(targetH).padStart(2, '0')}:${String(targetM).padStart(2, '0')}`;
        return {
          ...t,
          date: bulkDate,
          time: timeFormatted
        };
      });

      onUpdateAllTargets(updated);
      sound.playSuccess();
      onLog('INFO', `Applied bulk schedule time (${bulkDate} at ${bulkTime}${staggerMinutes > 0 ? ` +${staggerMinutes}m staggering` : ''}) across all ${targets.length} rows.`);
    } else if (selectedRowId) {
      const updated = targets.map(t => t.id === selectedRowId ? { ...t, date: bulkDate, time: bulkTime } : t);
      onUpdateAllTargets(updated);
      sound.playSuccess();
      onLog('INFO', `Applied schedule date & time to selected row.`);
    }
  };

  // Insert tag into caption
  const insertTag = (tag: string) => {
    setBulkCaption(prev => `${prev} ${tag}`);
  };

  // Import video file paths text
  const handleImportVideoTxt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length > 0 && targets.length > 0) {
            const updated = targets.map((t, idx) => ({
              ...t,
              video: lines[idx % lines.length]
            }));
            onUpdateAllTargets(updated);
            sound.playSuccess();
            onLog('SUCCESS', `Successfully mapped ${lines.length} video paths from [${file.name}] across queue targets!`);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const selectedTarget = targets.find(t => t.id === selectedRowId);

  return (
    <div className="space-y-6">
      
      {/* Top 2 Configuration Boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Global Bulk Caption / Comment Injector */}
        <div className="bg-slate-900 border border-emerald-900/40 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <FileText className="w-4 h-4" />
              <span>Global Bulk Caption / Comment Injector</span>
            </div>
            
            {/* Quick Tag Insert Chips */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => insertTag('#viral')}
                className="text-[10px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                +#viral
              </button>
              <button
                type="button"
                onClick={() => insertTag('#fbreels')}
                className="text-[10px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                +#fbreels
              </button>
              <button
                type="button"
                onClick={() => insertTag('#reelsinstagram')}
                className="text-[10px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                +#reelsinstagram
              </button>
            </div>
          </div>

          <textarea
            rows={3}
            value={bulkCaption}
            onChange={e => setBulkCaption(e.target.value)}
            placeholder="Yeh mera default automated bulk caption ya hashtag hai..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed resize-y"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={applyCaptionToAll}
                onChange={e => setApplyCaptionToAll(e.target.checked)}
                className="rounded border-slate-700 text-emerald-600 focus:ring-0 bg-slate-950"
              />
              <span>Apply to ALL Pages in Table</span>
            </label>

            <button
              onClick={handleApplyBulkCaption}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Apply Caption to Table</span>
            </button>
          </div>
        </div>

        {/* 2. Global Bulk Schedule Time & Date Setter */}
        <div className="bg-slate-900 border border-blue-900/40 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>Global Bulk Schedule Time & Date Setter</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date (YYYY-MM-DD):</label>
              <input
                type="date"
                value={bulkDate}
                onChange={e => setBulkDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Time (HH:MM):</label>
              <input
                type="time"
                value={bulkTime}
                onChange={e => setBulkTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2 font-medium text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={applyTimeToAll}
                onChange={e => setApplyTimeToAll(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-950"
              />
              <span>Apply Date/Time to ALL Pages</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span>Interval Stagger:</span>
              <select
                value={staggerMinutes}
                onChange={e => setStaggerMinutes(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300"
              >
                <option value={0}>0 min (Simultaneous)</option>
                <option value={5}>+5 min stagger</option>
                <option value={10}>+10 min stagger</option>
                <option value={15}>+15 min stagger</option>
              </select>
            </div>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              onClick={handleApplyBulkTime}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Apply Date/Time to All</span>
            </button>
          </div>
        </div>

      </div>

      {/* 3. Assigned Targets Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        
        {/* Table Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Assigned Targets Table (Fetched Pages & Profiles)</span>
              <span className="text-xs font-mono font-normal text-slate-400">({targets.length} targets)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any row to select. Double click to open full editor or preview.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer transition shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              <span>Import Video .txt</span>
              <input
                type="file"
                accept=".txt"
                onChange={handleImportVideoTxt}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                sound.playAlert();
                if (window.confirm('Clear all targets from mapping table? (You can Undo with Ctrl+Z)')) {
                  onClearTable();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Table</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Profile / Page Name</th>
                <th className="py-3 px-3 text-center">Type</th>
                <th className="py-3 px-4">Assigned Video Path</th>
                <th className="py-3 px-4">Caption</th>
                <th className="py-3 px-3 text-center">Schedule Date</th>
                <th className="py-3 px-3 text-center">Time</th>
                <th className="py-3 px-3 text-center">Browse</th>
                <th className="py-3 px-3 text-center">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {targets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                    No target pages or profiles in table. Use Tab 1 to verify cookies or auto-fetch pages!
                  </td>
                </tr>
              ) : (
                targets.map(row => {
                  const isSelected = row.id === selectedRowId;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(row.id)}
                      onDoubleClick={() => onOpenEditModal(row)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-blue-950/40 text-white' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-200 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          row.platform === 'facebook' ? 'bg-blue-400' : 'bg-pink-400'
                        }`}></div>
                        <span className="truncate max-w-[180px]">{row.profile}</span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {row.type}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 max-w-[240px] truncate" title={row.video}>
                        <div className="flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{row.video}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-[200px] truncate text-slate-300" title={row.caption}>
                        {row.caption}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-slate-300">
                        {row.date}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-emerald-400 font-medium">
                        {row.time}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenVideoPicker(row.id);
                          }}
                          title="Browse & Assign Video"
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                        >
                          <FolderOpen className="w-4 h-4 text-amber-400" />
                        </button>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playClick();
                            onRemoveTarget(row.id);
                          }}
                          title="Remove Target"
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
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

        {/* Action Toolbar Below Table */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 mt-4">
          <div className="flex flex-wrap items-center gap-2">
            
            <button
              onClick={() => {
                if (selectedTarget) {
                  onOpenVideoPicker(selectedTarget.id);
                } else {
                  sound.playAlert();
                  alert('Please click a row in the table first!');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-lg transition"
            >
              <Film className="w-3.5 h-3.5" />
              <span>✏️ Edit Path</span>
            </button>

            <button
              onClick={() => {
                if (selectedTarget) {
                  onOpenEditModal(selectedTarget);
                } else {
                  sound.playAlert();
                  alert('Please click a row in the table first!');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>✏️ Edit Caption</span>
            </button>

            <button
              onClick={() => {
                if (selectedTarget) {
                  onOpenEditModal(selectedTarget);
                } else {
                  sound.playAlert();
                  alert('Please click a row in the table first!');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>⏰ Edit Date/Time</span>
            </button>

            <button
              onClick={() => {
                if (selectedRowId) {
                  sound.playClick();
                  onRemoveTarget(selectedRowId);
                } else {
                  sound.playAlert();
                  alert('Please select a row first!');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>❌ Remove Selected Row</span>
            </button>

            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs rounded-lg transition ${
                canUndo 
                  ? 'bg-purple-700 hover:bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>↩️ Undo Delete (Ctrl+Z)</span>
            </button>

          </div>

          <div>
            <button
              onClick={onGoToScheduler}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/40 transition transform active:scale-95"
            >
              <span>Proceed to Master Scheduler</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
