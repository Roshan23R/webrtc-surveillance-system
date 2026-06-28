interface NavbarProps {
  onLogout: () => void;
  username: string;
  totalCameras: number;
  activeStreams: number;
  totalAlerts: number;
  criticalIncidents: number;
}

export function Navbar({ 
  onLogout, 
  username,
  totalCameras,
  activeStreams,
  totalAlerts,
  criticalIncidents
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-violet-500/10 bg-gradient-to-br from-zinc-950 via-violet-950/5 to-zinc-950 backdrop-blur-xl">
      <div className="px-6 h-20 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-violet-700 rounded-xl blur-lg opacity-75"></div>
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight leading-none">Surveillance</h1>
            <span className="text-xs font-bold text-violet-400 tracking-widest uppercase">Real-time Surveillance</span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="hidden lg:flex items-center gap-0.5 bg-white/5 border border-violet-500/20 backdrop-blur px-1 py-1 rounded-full">
          <div className="flex items-center gap-2 px-3.5 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500"></div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Cameras</span>
              <span className="text-sm font-black text-white font-mono">{totalCameras}</span>
            </div>
          </div>
          
          <div className="w-px h-5 bg-zinc-700/50"></div>
          
          <div className="flex items-center gap-2 px-3.5 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active</span>
              <span className="text-sm font-black text-white font-mono">{activeStreams}</span>
            </div>
          </div>
          
          <div className="w-px h-5 bg-zinc-700/50"></div>
          
          <div className="flex items-center gap-2 px-3.5 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Alerts</span>
              <span className="text-sm font-black text-white font-mono">{totalAlerts}</span>
            </div>
          </div>
          
          <div className="w-px h-5 bg-zinc-700/50"></div>
          
          <div className="flex items-center gap-2 px-3.5 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Critical</span>
              <span className="text-sm font-black text-white font-mono">{criticalIncidents}</span>
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-white">{username}</span>
            <span className="text-[11px] text-zinc-500 font-medium">Operator</span>
          </div>

          <div className="w-px h-7 bg-zinc-800 hidden sm:block"></div>

          <button
            onClick={onLogout}
            className="group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-zinc-300 hover:text-white bg-zinc-800/50 hover:bg-red-500/20 border border-zinc-700/50 hover:border-red-500/50 shadow-lg hover:shadow-red-500/20 transition-all duration-300 hover:scale-105"
          >
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
