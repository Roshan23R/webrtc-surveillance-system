import { useState } from "react";
import { useAlerts } from "../hooks/useAlerts";
import type { Camera } from "../types/camera";

interface AlertTableProps {
  cameras: Camera[];
}

export function AlertTable({ cameras }: AlertTableProps) {
  const [cameraId, setCameraId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  // Retrieve filtered & paginated alerts from hook
  const alerts = useAlerts({
    cameraId: cameraId || undefined,
    startDate: startDate ? new Date(startDate).toISOString() : undefined,
    endDate: endDate ? new Date(endDate).toISOString() : undefined,
    page,
    limit,
  });

  const formatConfidence = (confStr: string) => {
    const num = parseFloat(confStr);
    if (isNaN(num)) return confStr;
    return `${(num * 100).toFixed(0)}%`;
  };

  const getConfidenceBadge = (confStr: string) => {
    const num = parseFloat(confStr);
    if (isNaN(num)) return "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30";
    if (num >= 0.8) {
      return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
    }
    if (num >= 0.5) {
      return "bg-amber-500/20 text-amber-300 border border-amber-500/40";
    }
    return "bg-rose-500/20 text-rose-300 border border-rose-500/40";
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  // Helper to map cameraId to camera name
  const getCameraName = (cid: string) => {
    const cam = cameras.find((c) => c.id === cid);
    return cam ? cam.name : "Unknown Camera";
  };

  const handleResetFilters = () => {
    setCameraId("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950 rounded-xl border border-zinc-800/60 shadow-2xl overflow-hidden transition-all duration-300 space-y-0 flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-zinc-800/40 bg-gradient-to-r from-zinc-900/50 to-transparent flex justify-between items-center sticky top-0 z-10">
        <div>
          <h3 className="text-base font-black text-white">Recent Alerts</h3>
          <p className="text-xs text-zinc-400 mt-1">Live real-time monitoring</p>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-rose-500/20 to-rose-600/10 text-rose-300 border border-rose-500/30">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          Live
        </span>
      </div>

      {/* Filters */}
      <div className="px-6 py-5 space-y-4 border-b border-zinc-800/40">
        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-widest mb-2">Camera</label>
          <select
            value={cameraId}
            onChange={(e) => {
              setCameraId(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 focus:border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm transition-all placeholder-zinc-500"
          >
            <option value="">All Cameras</option>
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-widest mb-2">Start</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 focus:border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm transition-all placeholder-zinc-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-widest mb-2">End</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 focus:border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm transition-all placeholder-zinc-500"
            />
          </div>
        </div>
        <button
          onClick={handleResetFilters}
          className="w-full text-xs font-bold text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 rounded-lg py-2 uppercase tracking-wider transition-all"
        >
          Reset Filters
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800/40">
            <tr className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              <th className="px-6 py-3">Event / Camera</th>
              <th className="px-6 py-3 text-center">Confidence</th>
              <th className="px-6 py-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/20">
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-300">No alerts yet</p>
                      <p className="text-xs text-zinc-500 mt-1">Alerts will appear here in real-time</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              alerts.map((alert) => (
                <tr 
                  key={alert.id} 
                  className="hover:bg-zinc-800/40 transition-colors duration-150 border-l-4 border-l-violet-500/0 hover:border-l-violet-500 group"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white text-sm">{alert.eventType.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-zinc-400 mt-1">{getCameraName(alert.cameraId)}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getConfidenceBadge(alert.confidence)}`}>
                      {formatConfidence(alert.confidence)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-400 font-mono text-xs">
                    {formatTime(alert.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-zinc-800/40 bg-zinc-950/50 flex justify-between items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="px-4 py-2 border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50 text-xs font-bold rounded-lg text-zinc-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          ← Prev
        </button>
        <span className="text-xs text-zinc-400 font-semibold">
          Page <span className="text-white font-black">{page}</span>
        </span>
        <button
          disabled={alerts.length < limit}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50 text-xs font-bold rounded-lg text-zinc-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next →
        </button>
      </div>
    </div>
  );
}