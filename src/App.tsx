/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TargetAccount, ScheduledTargetItem, HistoryRecord, 
  TerminalLog, GraphApiConfig 
} from './types';
import { 
  INITIAL_ACCOUNTS, INITIAL_API_CONFIG, 
  getInitialScheduleTargets, DEFAULT_COOKIE_STRING 
} from './services/sampleData';
import { sound } from './services/sound';

import { Header } from './components/Header';
import { TabAccounts } from './components/TabAccounts';
import { TabContent } from './components/TabContent';
import { TabScheduler } from './components/TabScheduler';
import { TabTerminal } from './components/TabTerminal';
import { TabHistory } from './components/TabHistory';

import { LiveRpaModal } from './components/LiveRpaModal';
import { EditRowModal } from './components/EditRowModal';
import { VideoPickerModal } from './components/VideoPickerModal';

import { 
  Users, Layers, Clock, Terminal, CheckCircle2, 
  ChevronRight, AlertCircle
} from 'lucide-react';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'accounts' | 'content' | 'scheduler' | 'terminal' | 'history'>('accounts');

  // Core data states
  const [accounts, setAccounts] = useState<TargetAccount[]>(INITIAL_ACCOUNTS);
  const [targets, setTargets] = useState<ScheduledTargetItem[]>(getInitialScheduleTargets());
  const [deletedStack, setDeletedStack] = useState<ScheduledTargetItem[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [apiConfig, setApiConfig] = useState<GraphApiConfig>(INITIAL_API_CONFIG);

  // Background Engine
  const [engineRunning, setEngineRunning] = useState<boolean>(false);
  const targetsRef = useRef(targets);
  targetsRef.current = targets;

  // Logs state
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: 'SYSTEM READY. Meta Graph API v21.0 & Chromium RPA Engine loaded.'
    },
    {
      id: 'log-2',
      timestamp: new Date().toLocaleTimeString(),
      level: 'SUCCESS',
      message: 'App ID & API Key configured successfully. 4 verified accounts loaded in memory.'
    }
  ]);

  // Modals state
  const [rpaModalTarget, setRpaModalTarget] = useState<ScheduledTargetItem | null>(null);
  const [isRpaModalOpen, setIsRpaModalOpen] = useState<boolean>(false);

  const [editingTarget, setEditingTarget] = useState<ScheduledTargetItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const [videoPickerTargetId, setVideoPickerTargetId] = useState<string | undefined>(undefined);
  const [isVideoPickerOpen, setIsVideoPickerOpen] = useState<boolean>(false);

  // Append Log helper
  const addLog = useCallback((level: TerminalLog['level'], message: string) => {
    const newLog: TerminalLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  // Keyboard shortcut listener for Ctrl+Z / Cmd+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deletedStack]);

  // Undo last delete
  const handleUndo = useCallback(() => {
    if (deletedStack.length === 0) {
      sound.playAlert();
      addLog('WARN', 'Undo buffer is empty.');
      return;
    }

    sound.playClick();
    const lastItem = deletedStack[deletedStack.length - 1];
    setDeletedStack(prev => prev.slice(0, prev.length - 1));
    setTargets(prev => [...prev, lastItem]);
    addLog('INFO', `↩️ Restored deleted row for [${lastItem.profile}].`);
  }, [deletedStack, addLog]);

  // Remove target row (push to deleted stack for undo)
  const handleRemoveTarget = useCallback((id: string) => {
    const targetToDelete = targets.find(t => t.id === id);
    if (targetToDelete) {
      setDeletedStack(prev => [...prev, targetToDelete]);
      setTargets(prev => prev.filter(t => t.id !== id));
      addLog('WARN', `Removed target row [${targetToDelete.profile}] from mapping queue.`);
    }
  }, [targets, addLog]);

  // Clear all targets
  const handleClearTable = useCallback(() => {
    if (targets.length > 0) {
      setDeletedStack(prev => [...prev, ...targets]);
      setTargets([]);
      addLog('WARN', 'Cleared all rows from target assignment mapping table.');
    }
  }, [targets, addLog]);

  // Update single target
  const handleUpdateTarget = useCallback((updated: ScheduledTargetItem) => {
    setTargets(prev => prev.map(t => t.id === updated.id ? updated : t));
    addLog('INFO', `Updated dispatch parameters for target [${updated.profile}].`);
  }, [addLog]);

  // Update all targets
  const handleUpdateAllTargets = useCallback((all: ScheduledTargetItem[]) => {
    setTargets(all);
  }, []);

  // Launch live RPA Modal for target
  const handleLaunchRpa = useCallback((target: ScheduledTargetItem) => {
    setRpaModalTarget(target);
    setIsRpaModalOpen(true);
    addLog('RPA', `👁️ Launching live visual RPA execution window for target: [${target.profile}]...`);
  }, [addLog]);

  // RPA Complete callback: Auto-Cleanup row!
  const handleRpaComplete = useCallback((completedTarget: ScheduledTargetItem) => {
    // 1. Move to history
    const historyItem: HistoryRecord = {
      id: `hist-${Date.now()}`,
      profile: completedTarget.profile,
      type: completedTarget.type,
      video: completedTarget.video,
      caption: completedTarget.caption,
      completedAt: new Date().toLocaleString(),
      postId: `meta_${completedTarget.platform}_${Date.now().toString().slice(-8)}`,
      platform: completedTarget.platform
    };
    setHistory(prev => [historyItem, ...prev]);

    // 2. Auto-cleanup: remove from table!
    setTargets(prev => prev.filter(t => t.id !== completedTarget.id));
    addLog('SUCCESS', `🧹 AUTO-CLEANUP: Order completed successfully for [${completedTarget.profile}]. Row automatically removed from table.`);
  }, [addLog]);

  // Toggle Background Engine
  const handleToggleEngine = useCallback(() => {
    const nextState = !engineRunning;
    setEngineRunning(nextState);
    if (nextState) {
      sound.playArmed();
      addLog('SUCCESS', '🚀 Background Real-Time Scheduler Engine ARMED successfully. Monitoring schedules.');
    } else {
      sound.playAlert();
      addLog('WARN', 'Background Real-Time Scheduler Engine STOPPED by user.');
    }
  }, [engineRunning, addLog]);

  // Background Cron Worker Effect
  useEffect(() => {
    if (!engineRunning) return;

    const interval = setInterval(() => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const currentDateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const currentTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

      const currentQueue = targetsRef.current;
      const matched = currentQueue.find(item => {
        // Match condition: schedule date passed or equals today, and time reached
        return currentDateStr >= item.date && currentTimeStr >= item.time;
      });

      if (matched) {
        addLog('INFO', `⏰ Schedule time matched for [${matched.profile}] (${matched.date} ${matched.time}). Triggering background dispatch order...`);
        // Trigger auto completion and auto cleanup!
        handleRpaComplete(matched);
      }
    }, 5000); // Check every 5 seconds for responsive testing

    return () => clearInterval(interval);
  }, [engineRunning, handleRpaComplete, addLog]);

  // Verify all accounts threaded simulation from Tab 1
  const handleVerifyAllCookies = useCallback((rawCookies: string) => {
    if (!rawCookies.trim()) {
      sound.playAlert();
      addLog('ERROR', 'No cookies entered!');
      return;
    }

    addLog('INFO', '⚡ Starting bulk account & cookie verification...');
    const lines = rawCookies.split('\n').filter(Boolean);

    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      const newTargets: ScheduledTargetItem[] = lines.map((_, idx) => ({
        id: `acc-item-${Date.now()}-${idx}`,
        profile: `Verified_Account_${accounts.length + idx + 1}`,
        type: 'Profile',
        platform: 'facebook',
        video: 'C:/Content/Reels/Viral_AI_Tech_Highlights_01.mp4',
        caption: 'Auto-verified profile queue target #meta2026',
        date: today,
        time: '12:00',
        status: 'queued'
      }));

      setTargets(prev => [...prev, ...newTargets]);
      sound.playSuccess();
      addLog('SUCCESS', `✅ Verified ${lines.length} accounts successfully and added to queue table.`);
      setActiveTab('content');
    }, 1000);
  }, [accounts.length, addLog]);

  // Auto-fetch pages simulation from manual browser login
  const handleFetchPagesSimulated = useCallback((profileNickname: string) => {
    const today = new Date().toISOString().split('T')[0];
    const fetched: ScheduledTargetItem[] = [
      {
        id: `fetched-${Date.now()}-1`,
        profile: `${profileNickname} - Official Page`,
        type: 'Page',
        platform: 'facebook',
        video: 'C:/Content/Reels/Viral_AI_Tech_Highlights_01.mp4',
        caption: '#trending #viral #growth',
        date: today,
        time: '12:00',
        status: 'queued'
      },
      {
        id: `fetched-${Date.now()}-2`,
        profile: `${profileNickname} - Media Hub`,
        type: 'Page',
        platform: 'facebook',
        video: 'C:/Content/Reels/Product_Showcase_Broll_4K.mp4',
        caption: 'Daily reels update 🚀',
        date: today,
        time: '12:15',
        status: 'queued'
      }
    ];

    setTargets(prev => [...prev, ...fetched]);
    setActiveTab('content');
  }, []);

  // Export schedule to JSON
  const handleExportSchedule = useCallback(() => {
    sound.playClick();
    const data = JSON.stringify(targets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metasync_schedule_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('INFO', `Exported ${targets.length} scheduled targets to JSON.`);
  }, [targets, addLog]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Header */}
      <Header
        engineRunning={engineRunning}
        onToggleEngine={handleToggleEngine}
        deletedStackCount={deletedStack.length}
        onUndo={handleUndo}
        activeAccountsCount={accounts.length}
        queuedTasksCount={targets.length}
        completedTasksCount={history.length}
        onExportSchedule={handleExportSchedule}
      />

      {/* Main Tab Navigation */}
      <div className="bg-slate-900/90 border-b border-slate-800 sticky top-[69px] z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
            
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('accounts');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'accounts'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>1. Multi-Account Login & Verification</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('content');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'content'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Inline Media, Bulk Captions & Time Setup</span>
              {targets.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-slate-950/60 rounded text-[10px]">
                  {targets.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('scheduler');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'scheduler'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>3. Advanced Master Scheduler & Live Monitor</span>
              {engineRunning && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('terminal');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'terminal'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>4. 🔴 Live RPA Execution Terminal</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('history');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>5. Dispatched Archive & Reports ({history.length})</span>
            </button>

          </nav>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'accounts' && (
          <TabAccounts
            accounts={accounts}
            onAddAccount={acc => setAccounts(prev => [...prev, acc])}
            onVerifyAllCookies={handleVerifyAllCookies}
            onClearAccounts={() => setAccounts([])}
            apiConfig={apiConfig}
            onUpdateApiConfig={setApiConfig}
            onLog={addLog}
            onFetchPagesSimulated={handleFetchPagesSimulated}
            onAddDirectPage={(pageName, pageUrl) => {
              const today = new Date().toISOString().split('T')[0];
              const newTarget: ScheduledTargetItem = {
                id: `direct-${Date.now()}`,
                profile: pageName,
                type: 'Page',
                platform: 'facebook',
                video: 'Not Assigned',
                caption: '#trending #viral',
                date: today,
                time: '12:00',
                status: 'queued'
              };
              setTargets(prev => [...prev, newTarget]);
              setActiveTab('content');
            }}
          />
        )}

        {activeTab === 'content' && (
          <TabContent
            targets={targets}
            onUpdateTarget={handleUpdateTarget}
            onUpdateAllTargets={handleUpdateAllTargets}
            onRemoveTarget={handleRemoveTarget}
            onClearTable={handleClearTable}
            onUndo={handleUndo}
            canUndo={deletedStack.length > 0}
            onOpenVideoPicker={(id) => {
              setVideoPickerTargetId(id);
              setIsVideoPickerOpen(true);
            }}
            onOpenEditModal={(target) => {
              setEditingTarget(target);
              setIsEditModalOpen(true);
            }}
            onGoToScheduler={() => {
              sound.playClick();
              setActiveTab('scheduler');
              addLog('INFO', 'Synced targets table to Master Scheduler & Inspector.');
            }}
            onLog={addLog}
          />
        )}

        {activeTab === 'scheduler' && (
          <TabScheduler
            targets={targets}
            engineRunning={engineRunning}
            onToggleEngine={handleToggleEngine}
            onRemoveTarget={handleRemoveTarget}
            onUndo={handleUndo}
            canUndo={deletedStack.length > 0}
            onLaunchRpa={handleLaunchRpa}
            onLaunchAllRpa={() => {
              if (targets.length === 0) {
                alert('No targets available in scheduler!');
                return;
              }
              setActiveTab('terminal');
              addLog('INFO', `🚀 Starting batch execution for ALL ${targets.length} pages in table...`);
              handleLaunchRpa(targets[0]);
            }}
            onLog={addLog}
          />
        )}

        {activeTab === 'terminal' && (
          <TabTerminal
            logs={logs}
            onClearLogs={() => setLogs([])}
          />
        )}

        {activeTab === 'history' && (
          <TabHistory
            history={history}
            onClearHistory={() => setHistory([])}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-3 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <span>MetaSync Pro Enterprise v40.4 · Multi-Account Auto-Scheduler & Chromium RPA Engine</span>
          <span>Automatic Table Cleanup & Persistent Profile Manager Enabled</span>
        </div>
      </footer>

      {/* Modals */}
      <LiveRpaModal
        isOpen={isRpaModalOpen}
        target={rpaModalTarget}
        onClose={() => setIsRpaModalOpen(false)}
        onComplete={handleRpaComplete}
        onLog={addLog}
      />

      <EditRowModal
        isOpen={isEditModalOpen}
        item={editingTarget}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTarget(null);
        }}
        onSave={handleUpdateTarget}
      />

      <VideoPickerModal
        isOpen={isVideoPickerOpen}
        targetName={targets.find(t => t.id === videoPickerTargetId)?.profile}
        onClose={() => {
          setIsVideoPickerOpen(false);
          setVideoPickerTargetId(undefined);
        }}
        onSelect={(path, meta) => {
          if (videoPickerTargetId) {
            setTargets(prev => prev.map(t => t.id === videoPickerTargetId ? {
              ...t,
              video: path,
              videoDuration: meta?.duration,
              videoSize: meta?.size
            } : t));
            addLog('INFO', `Assigned video [${path}] to target.`);
          } else {
            // Apply across all
            setTargets(prev => prev.map(t => ({ ...t, video: path })));
            addLog('INFO', `Assigned video [${path}] across all targets.`);
          }
        }}
      />

    </div>
  );
}
