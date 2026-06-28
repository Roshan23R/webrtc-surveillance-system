import { useState, useEffect } from "react";
import type { Camera } from "../types/camera";
import { CameraVideo } from "./CameraVideo";

interface CameraCardProps {
  camera: Camera;
  stats?: { fps: number; dpm: number };
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onEdit: (camera: Camera) => void;
  onDelete: (id: string) => void;
}

export function CameraCard({ camera, stats, onStart, onStop, onEdit, onDelete }: CameraCardProps) {
  const isRunning = camera.status === "running";
  const [streamState, setStreamState] = useState<"connecting" | "live" | "stopped" | "error">(
    isRunning ? "connecting" : "stopped"
  );

  // Sync streamState when parent camera.status changes
  useEffect(() => {
    setStreamState(camera.status === "running" ? "connecting" : "stopped");
  }, [camera.status]);

  const getStateBadge = () => {
    switch (streamState) {
      case "connecting":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Connecting
          </span>
        );
      case "live":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse"></span>
            Live
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            Stopped
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 p-3 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Header Title and status */}
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200 truncate leading-tight">
              {camera.name}
            </h3>
            <div className="flex flex-col text-[10px] text-zinc-400 dark:text-zinc-500 font-medium tracking-wide mt-0.5">
              <span>{camera.location || "Default Location"}</span>
              <span className="font-mono truncate max-w-[220px] opacity-75" title={camera.rtspUrl}>{camera.rtspUrl}</span>
            </div>
          </div>
          <div className="shrink-0">
            {getStateBadge()}
          </div>
        </div>

        {/* Live WebRTC view area / Inactive block */}
        <div className={`relative rounded-xl overflow-hidden aspect-video transition-all duration-300 bg-black ${
          isRunning && stats?.detecting 
            ? "ring-2 ring-red-500 ring-offset-1 dark:ring-offset-zinc-950 shadow-[0_0_20px_rgba(239,68,68,0.5)]" 
            : "border border-zinc-100 dark:border-zinc-900"
        }`}>
          {isRunning ? (
            <>
              <CameraVideo 
                cameraId={camera.id} 
                onStateChange={setStreamState} 
              />
              
              {/* Continuous Detection Overlay */}
              {stats?.detecting && (
                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600/90 text-[10px] font-bold text-white uppercase tracking-wider animate-pulse shadow-lg border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  PERSON DETECTED ({stats.confidence ? stats.confidence.toFixed(2) : '0.00'})
                </div>
              )}

              {/* Glassmorphic Stats Overlay */}
              {stats && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/50 to-transparent px-3 py-2.5 flex items-center justify-between text-[10px] font-bold tracking-wider text-zinc-300 z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                    <span>FPS: <strong className="font-mono text-white text-[11px]">{stats.fps.toFixed(1)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span>DPM: <strong className="font-mono text-white text-[11px]">{stats.dpm}</strong></span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-zinc-50 dark:bg-zinc-900/40 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 p-4 transition-all">
              <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <span className="text-[10px] font-semibold mt-2 uppercase tracking-wider">Stream Inactive</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-2">
        <button
          onClick={() => isRunning ? onStop(camera.id) : onStart(camera.id)}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm ${
            isRunning 
              ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20" 
              : "bg-violet-600 text-white hover:bg-violet-700 shadow-violet-500/10"
          }`}
        >
          {isRunning ? (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Stop Stream
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Stream
            </>
          )}
        </button>

        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(camera)}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
            title="Edit Camera"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={() => onDelete(camera.id)}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer"
            title="Delete Camera"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
