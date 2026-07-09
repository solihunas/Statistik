import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { RBucket } from '../lib/calculations';

interface Props {
  buckets: RBucket[];
}

export default function TradeDistributionChart({ buckets }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={buckets} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#2c2c2a" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#898781', fontSize: 10 }}
          tickLine={false}
          axisLine={{ stroke: '#383835' }}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tick={{ fill: '#898781', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
          width={40}
        />
        <Tooltip
          formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Proporsi trade']}
          contentStyle={{ background: '#1a1a19', border: '1px solid #2c2c2a', borderRadius: 6, fontSize: 12 }}
          labelStyle={{ color: '#c3c2b7' }}
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
        />
        <Bar dataKey="pct" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {buckets.map((b) => (
            <Cell key={b.label} fill={b.label.includes('-') || b.label.startsWith('<') ? '#e66767' : '#3987e5'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
