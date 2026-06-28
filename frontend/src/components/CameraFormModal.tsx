import { FormEvent } from "react";

interface CameraFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  formName: string;
  formRtspUrl: string;
  formLocation: string;
  isLoading?: boolean;
  onNameChange: (value: string) => void;
  onRtspUrlChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}

export function CameraFormModal({
  isOpen,
  isEdit,
  formName,
  formRtspUrl,
  formLocation,
  isLoading,
  onNameChange,
  onRtspUrlChange,
  onLocationChange,
  onSubmit,
  onClose,
}: CameraFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800/80 max-w-md w-full p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div>
          <h3 className="text-2xl font-black text-white">
            {isEdit ? "Edit Camera" : "Add Camera"}
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            {isEdit
              ? "Update camera configuration and settings"
              : "Configure your surveillance camera source"}
          </p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-widest mb-2">
              Camera Name
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 focus:border-violet-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder-zinc-500"
              placeholder="e.g. Front Gate Camera"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-widest mb-2">
              RTSP URL or Stream Source
            </label>
            <input
              type="text"
              required
              value={formRtspUrl}
              onChange={(e) => onRtspUrlChange(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 focus:border-violet-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder-zinc-500"
              placeholder="e.g. rtsp://192.168.1.100:554/h264 or 0"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-widest mb-2">
              Location (Optional)
            </label>
            <input
              type="text"
              value={formLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 focus:border-violet-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder-zinc-500"
              placeholder="e.g. Main Entrance"
            />
          </div>
          
          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50 text-zinc-300 hover:text-white text-sm font-semibold rounded-lg cursor-pointer transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              {isLoading ? "Processing..." : isEdit ? "Save Changes" : "Add Camera"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
