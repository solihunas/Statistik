import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Panel({ title, right, children, className = '' }: PanelProps) {
  return (
    <div className={`border border-[#2c2c2a] bg-[#111110] rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold tracking-wide uppercase text-[#c3c2b7]">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}
