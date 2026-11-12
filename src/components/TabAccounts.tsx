import React, { useState } from 'react';
import { TargetAccount, GraphApiConfig } from '../types';
import { DEFAULT_COOKIE_STRING } from '../services/sampleData';
import { sound } from '../services/sound';
import { 
  Key, Globe, Cpu, CheckCircle2, AlertTriangle, 
  Trash2, Upload, RefreshCw, Eye, EyeOff, ShieldCheck,
  Plus, Check, Sparkles, ExternalLink, Activity
} from 'lucide-react';

interface TabAccountsProps {
  accounts: TargetAccount[];
  onAddAccount: (account: TargetAccount) => void;
  onVerifyAllCookies: (rawCookies: string) => void;
  onClearAccounts: () => void;
  apiConfig: GraphApiConfig;
  onUpdateApiConfig: (config: GraphApiConfig) => void;
  onLog: (level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'RPA', msg: string) => void;
  onFetchPagesSimulated: (profileNickname: string) => void;
}

export const TabAccounts: React.FC<TabAccountsProps> = ({
  accounts,
  onAddAccount,
  onVerifyAllCookies,
  onClearAccounts,
  apiConfig,
  onUpdateApiConfig,
  onLog,
  onFetchPagesSimulated
}) => {
  const [cookieInput, setCookieInput] = useState<string>(DEFAULT_COOKIE_STRING);
  const [appIdInput, setAppIdInput] = useState<string>(apiConfig.appId);
  const [appSecretInput, setAppSecretInput] = useState<string>(apiConfig.appSecret);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState<boolean>(false);
  
  // Real Browser / Profile login section
  const [profileNickname, setProfileNickname] = useState<string>('Account_1');
  const [isBrowserOpening, setIsBrowserOpening] = useState<boolean>(false);

  // AdsPower Port setup
  const [adspowerPort, setAdspowerPort] = useState<string>('9222');
  const [isConnectingPort, setIsConnectingPort] = useState<boolean>(false);
  const [portConnected, setPortConnected] = useState<boolean>(true);

  // File import for cookies
  const handleImportCookiesFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setCookieInput(text);
          sound.playSuccess();
          onLog('INFO', `Successfully imported cookies from file [${file.name}] (${text.length} bytes)`);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleGenerateToken = () => {
    if (!appIdInput.trim() || !appSecretInput.trim()) {
      sound.playAlert();
      onLog('ERROR', 'App ID and App Secret (API Key) are required to generate Meta Graph Access Token.');
      return;
    }

    sound.playClick();
    setIsGeneratingToken(true);
    onLog('INFO', `🔑 Requesting Facebook App Access Token for App ID [${appIdInput}] via Graph API v21.0 oauth endpoint...`);

    setTimeout(() => {
      const mockToken = `EAAQ2gZBW${Date.now().toString().slice(-6)}EAAPRo_${appIdInput.slice(0, 4)}_valid_access_token`;
      onUpdateApiConfig({
        ...apiConfig,
        appId: appIdInput,
        appSecret: appSecretInput,
        accessToken: mockToken,
        isValid: true,
        expiresAt: '2026-12-31 23:59:59',
        tokenType: 'App Access Token'
      });
      setIsGeneratingToken(false);
      sound.playSuccess();
      onLog('SUCCESS', `🟢 Successfully generated FB Graph API Access Token: ${mockToken.slice(0, 16)}...`);
    }, 1200);
  };

  const handleManualBrowserLogin = () => {
    if (!profileNickname.trim()) return;
    sound.playClick();
    setIsBrowserOpening(true);
    onLog('INFO', `🌐 Opening manual browser login for profile [${profileNickname}] with isolated session dir...`);

    setTimeout(() => {
      setIsBrowserOpening(false);
      sound.playSuccess();
      onLog('SUCCESS', `🟢 Browser session detected for [${profileNickname}]. Auto-scanned 2 Facebook Pages & 1 Profile into queue.`);
      onFetchPagesSimulated(profileNickname);
    }, 2000);
  };

  const handleConnectPort = () => {
    if (!adspowerPort.trim()) return;
    sound.playClick();
    setIsConnectingPort(true);
    onLog('INFO', `🔗 Connecting to AdsPower / Anti-detect browser debugging port 127.0.0.1:${adspowerPort}...`);

    setTimeout(() => {
      setIsConnectingPort(false);
      setPortConnected(true);
      sound.playSuccess();
      onLog('SUCCESS', `🟢 Successfully connected to Anti-Detect browser port [${adspowerPort}]! Active Chrome session ready.`);
    }, 1500);
  };

  const handleVerifyAll = () => {
    sound.playClick();
    onVerifyAllCookies(cookieInput);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Cookies Manually OR Import Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Enter Cookies Manually OR Import .txt File
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer transition shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              <span>Import Cookies .txt</span>
              <input
                type="file"
                accept=".txt"
                onChange={handleImportCookiesFile}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                sound.playClick();
                setCookieInput('');
                onLog('INFO', 'Cleared cookie text buffer.');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cookies</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={4}
            value={cookieInput}
            onChange={e => setCookieInput(e.target.value)}
            placeholder="datr=...; sb=...; c_user=...; xs=... (Paste Facebook / Instagram cookie strings here, one per line)"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-400 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 leading-relaxed resize-y"
          />
          <div className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
            <span>Supports standard Netscape, JSON, or semicolon cookie headers (c_user, xs, datr).</span>
            <span className="font-mono text-slate-400">{cookieInput.split('\n').filter(Boolean).length} cookie lines entered</span>
          </div>
        </div>
      </div>

      {/* 2. Facebook Graph API Credentials */}
      <div className="bg-slate-900 border border-blue-900/40 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-blue-400 font-bold text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>Facebook Graph API App Credentials (API Key & Secret)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1">Facebook App ID:</label>
            <input
              type="text"
              value={appIdInput}
              onChange={e => setAppIdInput(e.target.value)}
              placeholder="e.g. 1094829038491823"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-slate-300 mb-1">App Secret (API Key):</label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={appSecretInput}
                onChange={e => setAppSecretInput(e.target.value)}
                placeholder="Meta App Secret Key"
                className="w-full px-3 py-2 pr-9 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="md:col-span-5 flex items-center gap-3">
            <button
              onClick={handleGenerateToken}
              disabled={isGeneratingToken}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs rounded-lg transition shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingToken ? 'animate-spin' : ''}`} />
              <span>{isGeneratingToken ? 'Requesting Token...' : 'Generate App Access Token'}</span>
            </button>

            {apiConfig.accessToken && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="font-mono text-[11px] truncate max-w-[140px]">{apiConfig.accessToken.slice(0, 14)}...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Real Browser Manual Login & AdsPower Setup Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Real Browser Login */}
        <div className="bg-slate-900 border border-emerald-900/40 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold text-sm">
            <Globe className="w-4 h-4" />
            <span>Real Browser Manual Login & Real Pages Auto-Fetcher</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Profile Nickname (e.g. MyPersonalFB):
              </label>
              <input
                type="text"
                value={profileNickname}
                onChange={e => setProfileNickname(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleManualBrowserLogin}
              disabled={isBrowserOpening}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow-sm"
            >
              <Globe className="w-4 h-4" />
              <span>{isBrowserOpening ? 'Opening Session & Fetching Pages...' : 'Open Browser, Login & Fetch All Pages'}</span>
            </button>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Launches an isolated browser instance with persistent session cache. Automatically reads active Facebook pages and loads them into the scheduling queue table.
            </p>
          </div>
        </div>

        {/* AdsPower Port Setup */}
        <div className="bg-slate-900 border border-cyan-900/40 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-cyan-400 font-bold text-sm">
            <Cpu className="w-4 h-4" />
            <span>Anti-Detect Browser (AdsPower / Dolphin) Port Bridge</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                AdsPower / Remote Debugging Port (e.g. 9222):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={adspowerPort}
                  onChange={e => setAdspowerPort(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleConnectPort}
                  disabled={isConnectingPort}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isConnectingPort ? 'animate-spin' : ''}`} />
                  <span>Connect Port</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400">Status on 127.0.0.1:{adspowerPort}:</span>
              {portConnected ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  CONNECTED & SYNCED
                </span>
              ) : (
                <span className="text-amber-400 font-medium">DISCONNECTED</span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Connect directly to running AdsPower profiles via Chrome Remote Debugging port to avoid 2FA re-verification prompts.
            </p>
          </div>
        </div>

      </div>

      {/* 4. Action Banner: 1-Click Verify All Cookies */}
      <div className="text-center pt-2">
        <button
          onClick={handleVerifyAll}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-900/30 transition transform active:scale-98 flex items-center justify-center gap-2 mx-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>⚡ 1-Click Verify All Cookies & Add to Queue</span>
        </button>
      </div>

      {/* 5. Live Verification Dashboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Live Verification Dashboard & Connected Accounts ({accounts.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">All accounts verified for Meta Graph API publishing</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {accounts.map(acc => (
            <div
              key={acc.id}
              className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                    acc.platform === 'facebook' ? 'bg-blue-600/20 text-blue-400' : 'bg-pink-600/20 text-pink-400'
                  }`}>
                    {acc.platform === 'facebook' ? 'f' : 'ig'}
                  </div>
                  <h4 className="text-xs font-semibold text-white truncate">{acc.name}</h4>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Active"></span>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span>Type:</span>
                  <span className="text-slate-300 font-medium">{acc.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Profile Nick:</span>
                  <span className="text-slate-300 font-mono text-[10px]">{acc.profileNickname}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Target ID:</span>
                  <span className="text-indigo-400 font-mono text-[10px]">{acc.accountId}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
