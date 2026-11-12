import React from 'react';
import { HistoryRecord } from '../types';
import { sound } from '../services/sound';
import { CheckCircle2, Download, Trash2, ExternalLink, Film, Share2 } from 'lucide-react';

interface TabHistoryProps {
  history: HistoryRecord[];
  onClearHistory: () => void;
}

export const TabHistory: React.FC<TabHistoryProps> = ({
  history,
  onClearHistory
}) => {
  const handleExportCsv = () => {
    sound.playClick();
    if (history.length === 0) return;

    const headers = ['Post ID', 'Platform', 'Profile/Page', 'Type', 'Video Path', 'Caption', 'Dispatched At'];
    const rows = history.map(h => [
      `"${h.postId}"`,
      `"${h.platform}"`,
      `"${h.profile}"`,
      `"${h.type}"`,
      `"${h.video}"`,
      `"${h.caption.replace(/"/g, '""')}"`,
      `"${h.completedAt}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metasync_dispatch_history_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Dispatched & Auto-Cleaned History ({history.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit log of tasks completed by the Live RPA Executor and Background Cron Engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={history.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-lg transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onClearHistory();
            }}
            disabled={history.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-xs rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-800 rounded-lg">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Meta Post ID</th>
              <th className="py-3 px-4">Target Profile / Page</th>
              <th className="py-3 px-3 text-center">Type</th>
              <th className="py-3 px-4">Video Asset</th>
              <th className="py-3 px-4">Caption</th>
              <th className="py-3 px-4">Dispatched Timestamp</th>
              <th className="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {history.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 italic">
                  No dispatched posts yet. Arm the background engine or launch live RPA on any queue item!
                </td>
              </tr>
            ) : (
              history.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono text-[11px] text-blue-400 font-semibold">
                    {item.postId}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-200">
                    {item.profile}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 max-w-[200px] truncate" title={item.video}>
                    {item.video}
                  </td>
                  <td className="py-3 px-4 max-w-[240px] truncate text-slate-300" title={item.caption}>
                    {item.caption}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {item.completedAt}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                      SUCCESS
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
