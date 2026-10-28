import type { ReactNode } from 'react';

export function Lbl({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-medium text-slate-300 mb-1">{label}</span>
      {children}
    </label>
  );
}

export const ErrorBox = ({ children }: { children: ReactNode }) => (
  <p role="alert" className="text-sm text-red-300 bg-red-500/10 px-4 py-3 rounded-lg">{children}</p>
);

export const NoticeBox = ({ children }: { children: ReactNode }) => (
  <p className="text-sm text-emerald-300 bg-emerald-500/10 px-4 py-3 rounded-lg">{children}</p>
);
