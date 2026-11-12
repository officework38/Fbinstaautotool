import React, { useState } from 'react';
import { SAMPLE_VIDEOS, LibraryVideo } from '../services/sampleData';
import { sound } from '../services/sound';
import { X, Upload, Film, Check, HardDrive, Play } from 'lucide-react';

interface VideoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (videoPath: string, metadata?: { duration?: string; size?: string }) => void;
  targetName?: string;
}

export const VideoPickerModal: React.FC<VideoPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  targetName
}) => {
  if (!isOpen) return null;

  const [customPath, setCustomPath] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SAMPLE_VIDEOS[0].id);

  const handleSelectPreset = (video: LibraryVideo) => {
    sound.playClick();
    onSelect(video.path, { duration: video.duration, size: video.size });
    onClose();
  };

  const handleCustomPathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPath.trim()) return;
    sound.playClick();
    onSelect(customPath.trim(), { duration: '00:45', size: '20.0 MB' });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sound.playClick();
      const localPath = `C:/Uploads/${file.name}`;
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      onSelect(localPath, { duration: '00:30', size: sizeMb });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Select Video Asset</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Assign media to {targetName ? <span className="text-blue-400 font-medium">"{targetName}"</span> : 'selected targets'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* File Upload Trigger */}
          <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/70 rounded-xl p-5 text-center bg-slate-950/40 hover:bg-slate-950/80 transition group relative cursor-pointer">
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-sm font-medium text-slate-200">
              Click to browse video file from this computer
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Supports MP4, MOV, MKV (Standard 9:16 vertical or 16:9 reel)
            </div>
          </div>

          {/* Preset Library */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Built-in Asset Vault
              </span>
              <span className="text-xs text-slate-500">Ready to dispatch</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAMPLE_VIDEOS.map(video => (
                <div
                  key={video.id}
                  onClick={() => handleSelectPreset(video)}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-lg cursor-pointer transition flex items-start gap-3 group"
                >
                  <div className={`w-12 h-16 rounded bg-gradient-to-br ${video.thumbnailColor} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition`}>
                    <Play className="w-5 h-5 text-white/80 fill-white/80" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-semibold text-slate-200 truncate group-hover:text-blue-400">
                      {video.name}
                    </h5>
                    <div className="text-[11px] text-slate-400 mt-1">
                      <span>{video.duration}</span> · <span>{video.size}</span>
                    </div>
                    <div className="text-[10px] text-indigo-400 mt-1 font-mono">
                      {video.resolution}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Path Entry */}
          <form onSubmit={handleCustomPathSubmit} className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span>Or specify exact local OS path:</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customPath}
                onChange={e => setCustomPath(e.target.value)}
                placeholder="e.g. C:/Users/Admin/Videos/Reels/reel_01.mp4"
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
              >
                Assign Path
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
