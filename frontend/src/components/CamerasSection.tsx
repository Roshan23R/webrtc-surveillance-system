import type { Camera } from "../types/camera";
import { CameraCard } from "./CameraCard";

interface CamerasSectionProps {
  cameras: Camera[];
  isLoading: boolean;
  error: string;
  cameraStats: Record<string, any>;
  onAddClick: () => void;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onEdit: (camera: Camera) => void;
  onDelete: (id: string) => void;
}

export function CamerasSection({
  cameras,
  isLoading,
  error,
  cameraStats,
  onAddClick,
  onStart,
  onStop,
  onEdit,
  onDelete,
}: CamerasSectionProps) {
  return (
    <div className="lg:col-span-4 space-y-6">
      <div className="flex justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Surveillance Monitors
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Manage and monitor live camera sources in real-time
          </p>
        </div>
        <button
          onClick={onAddClick}
          className="group inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
        >
          <svg
            className="w-5 h-5 transition-transform group-hover:rotate-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Camera
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-sm font-semibold flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-16 text-center flex flex-col items-center justify-center">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-violet-600 rounded-full animate-spin"></div>
            <div className="absolute inset-1 bg-zinc-900 rounded-full"></div>
          </div>
          <p className="text-zinc-400 font-medium">Loading cameras...</p>
        </div>
      ) : cameras.length === 0 ? (
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/50 to-zinc-900/20 p-16 text-center flex flex-col items-center justify-center group hover:border-violet-500/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-zinc-800/50 mb-6 group-hover:bg-violet-500/20 transition-all">
              <svg
                className="w-12 h-12 text-zinc-500 group-hover:text-violet-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h4 className="text-2xl font-black text-white mb-2">
              No cameras yet
            </h4>
            <p className="text-zinc-400 max-w-sm mx-auto mb-8">
              Get started by adding your first surveillance camera endpoint or RTSP feed to begin processing AI-powered object detection.
            </p>
            <button
              onClick={onAddClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Camera
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {cameras.map((camera) => (
            <CameraCard
              key={camera.id}
              camera={camera}
              stats={cameraStats[camera.id]}
              onStart={onStart}
              onStop={onStop}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
