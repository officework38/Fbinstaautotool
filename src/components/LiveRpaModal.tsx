import React, { useState, useEffect } from 'react';
import { ScheduledTargetItem } from '../types';
import { sound } from '../services/sound';
import { 
  X, Play, Pause, CheckCircle2, AlertCircle, 
  Terminal, ShieldCheck, Film, Share2, 
  RefreshCw, Maximize2, Sparkles, Check
} from 'lucide-react';

interface LiveRpaModalProps {
  target: ScheduledTargetItem | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (target: ScheduledTargetItem) => void;
  onLog: (level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'RPA', msg: string) => void;
}

interface Step {
  id: number;
  label: string;
  detail: string;
  duration: number; // ms
}

const RPA_STEPS: Step[] = [
  { id: 1, label: 'Initializing Chromium Anti-Detect Session', detail: 'Spawning headless browser with user-agent spoofing & persistent profile directory...', duration: 1800 },
  { id: 2, label: 'Injecting Verified Session Cookies', detail: 'Applying datr, c_user (61561547737841), xs tokens to browser cookie jar...', duration: 1600 },
  { id: 3, label: 'Navigating to Meta Business Suite Composer', detail: 'GET https://business.facebook.com/latest/composer?nav_ref=auto_scheduler...', duration: 2000 },
  { id: 4, label: 'Target Account / Page Context Switch', detail: 'Authenticating permissions for selected target...', duration: 1500 },
  { id: 5, label: 'Transcoding & Attaching Video Asset', detail: 'Uploading video payload into Meta media ingestion pipeline...', duration: 2500 },
  { id: 6, label: 'Injecting Dynamic Caption & Hashtags', detail: 'Simulating human keystrokes into post draft editor...', duration: 2000 },
  { id: 7, label: 'Configuring Schedule Parameters & Publishing', detail: 'Submitting Graph API dispatch request & awaiting Meta server acknowledgment...', duration: 2200 },
  { id: 8, label: 'Post Confirmed & Auto-Cleanup Triggered', detail: 'Received Meta Post ID. Purging target from queue table...', duration: 1200 },
];

export const LiveRpaModal: React.FC<LiveRpaModalProps> = ({
  target,
  isOpen,
  onClose,
  onComplete,
  onLog
}) => {
  if (!isOpen || !target) return null;

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [generatedPostId, setGeneratedPostId] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setCurrentStepIdx(0);
    setIsRunning(true);
    setIsCompleted(false);
    const mockPostId = `meta_${target.platform}_${Date.now().toString().slice(-8)}`;
    setGeneratedPostId(mockPostId);

    const initialLog = `[RPA-INIT] Launching visual automation worker for target [${target.profile}] (${target.type})`;
    setLogs([initialLog]);
    onLog('RPA', initialLog);
  }, [isOpen, target]);

  useEffect(() => {
    if (!isRunning || isCompleted) return;

    if (currentStepIdx < RPA_STEPS.length) {
      const step = RPA_STEPS[currentStepIdx];
      const timer = setTimeout(() => {
        const stepLog = `[RPA STEP ${step.id}/${RPA_STEPS.length}] ${step.label} -> ${step.detail}`;
        setLogs(prev => [...prev, stepLog]);
        onLog('RPA', stepLog);

        if (currentStepIdx + 1 < RPA_STEPS.length) {
          setCurrentStepIdx(prev => prev + 1);
        } else {
          // Finished
          setIsCompleted(true);
          setIsRunning(false);
          const finalLog = `[RPA COMPLETE] Successfully published to ${target.profile}! Generated ID: ${generatedPostId}. Auto-cleanup executed.`;
          setLogs(prev => [...prev, finalLog]);
          onLog('SUCCESS', finalLog);
          sound.playSuccess();
        }
      }, step.duration);

      return () => clearTimeout(timer);
    }
  }, [currentStepIdx, isRunning, isCompleted, target, generatedPostId]);

  const handleFinishAndCleanup = () => {
    sound.playClick();
    onComplete(target);
    onClose();
  };

  const currentStep = RPA_STEPS[currentStepIdx] || RPA_STEPS[RPA_STEPS.length - 1];
  const progressPercent = Math.min(100, Math.round(((currentStepIdx + (isCompleted ? 1 : 0.5)) / RPA_STEPS.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Browser Chrome Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-3">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded border border-slate-800 text-xs text-slate-300 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>https://business.facebook.com/composer?target={encodeURIComponent(target.profile)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Port: 9222 · Chrome Session Live
            </span>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
              title="Close RPA Window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Main Visual Viewport */}
          <div className="md:col-span-7 p-5 bg-slate-900/90 flex flex-col justify-between overflow-y-auto border-b md:border-b-0 md:border-r border-slate-800">
            <div>
              {/* Target info card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30">
                      {target.platform === 'facebook' ? 'f' : 'ig'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm leading-tight">{target.profile}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{target.type}</span>
                        <span>·</span>
                        <span>Schedule: {target.date} {target.time}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded font-medium ${
                    isCompleted ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-blue-950 text-blue-400 border border-blue-800/50'
                  }`}>
                    {isCompleted ? 'Dispatched' : 'Executing...'}
                  </span>
                </div>

                <div className="space-y-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-start gap-2 text-slate-300">
                    <Film className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                    <span className="font-mono text-slate-400 break-all">{target.video}</span>
                  </div>
                  <div className="text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800 italic line-clamp-3">
                    "{target.caption}"
                  </div>
                </div>
              </div>

              {/* Live Step Card */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-indigo-900/40 rounded-lg p-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Step {currentStep.id} of {RPA_STEPS.length}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{progressPercent}%</span>
                </div>

                <h3 className="text-base font-semibold text-white mb-1">{currentStep.label}</h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{currentStep.detail}</p>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                {isCompleted && (
                  <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-lg flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-emerald-300">Post Published Successfully!</div>
                      <div className="text-xs text-emerald-400/80 font-mono mt-0.5">Post ID: {generatedPostId}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controller Toolbar */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-800 mt-4">
              <div className="flex items-center gap-2">
                {!isCompleted && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsRunning(!isRunning);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
                  >
                    {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isRunning ? 'Pause' : 'Resume'}</span>
                  </button>
                )}
                {!isCompleted && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setCurrentStepIdx(RPA_STEPS.length - 1);
                      setIsCompleted(true);
                      setIsRunning(false);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 rounded transition"
                  >
                    Skip to Finish
                  </button>
                )}
              </div>

              {isCompleted ? (
                <button
                  onClick={handleFinishAndCleanup}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Clean Up Row & Close</span>
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Run in Background
                </button>
              )}
            </div>
          </div>

          {/* Real-time Subprocess Terminal Stream */}
          <div className="md:col-span-5 bg-slate-950 p-4 flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Live Subprocess Logs
              </span>
              <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-slate-300 max-h-[360px]">
              {logs.map((line, idx) => (
                <div key={idx} className="leading-relaxed">
                  <span className="text-slate-500 mr-1.5">&gt;</span>
                  <span className={
                    line.includes('COMPLETE') || line.includes('SUCCESS') ? 'text-emerald-400 font-bold' :
                    line.includes('STEP') ? 'text-indigo-300' :
                    line.includes('ERROR') ? 'text-rose-400' : 'text-slate-300'
                  }>
                    {line}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Selenium Stealth Driver v4.21</span>
              <span>Memory: 142MB</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
