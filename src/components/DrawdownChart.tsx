import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { EquityPoint } from '../lib/calculations';

interface Props {
  data: EquityPoint[];
}

function TooltipContent({ active, payload }: { active?: boolean; payload?: { payload: EquityPoint }[] }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-[#1a1a19] border border-[#2c2c2a] rounded px-3 py-2 text-xs">
      <div className="text-[#898781]">{p.date}</div>
      <div className="text-[#e66767] font-semibold">{p.drawdownPct.toFixed(2)}%</div>
    </div>
  );
}

export default function DrawdownChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ddFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e66767" stopOpacity={0} />
            <stop offset="100%" stopColor="#e66767" stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#2c2c2a" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#898781', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#383835' }}
          minTickGap={40}
        />
        <YAxis
          tick={{ fill: '#898781', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
          width={45}
        />
        <Tooltip content={<TooltipContent />} cursor={{ stroke: '#383835' }} />
        <Area type="monotone" dataKey="drawdownPct" stroke="#e66767" strokeWidth={1.5} fill="url(#ddFill)" isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
