import React from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export function StatsCard({ label, value, icon, color }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-900/60 py-2.5 px-4 flex items-center justify-between shadow-sm transition-all duration-200 hover:border-zinc-200 dark:hover:border-zinc-800">
      <div>
        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{label}</p>
        <h4 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5 tracking-tight">{value}</h4>
      </div>
      {icon && (
        <div className={`w-7 h-7 rounded-lg ${color || 'bg-zinc-50 text-zinc-600'} flex items-center justify-center scale-90`}>
          {icon}
        </div>
      )}
    </div>
  );
}
