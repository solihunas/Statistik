import { PieChart, Pie, Cell, Tooltip } from 'recharts';

interface Props {
  winCount: number;
  lossCount: number;
  winRatePct: number;
}

const SIZE = 180;

export default function WinLossDonut({ winCount, lossCount, winRatePct }: Props) {
  const data = [
    { name: 'Winning Trades', value: winCount, color: '#0ca30c' },
    { name: 'Losing Trades', value: lossCount, color: '#d03b3b' },
  ];
  return (
    <div className="relative flex items-center justify-center w-[180px] h-[180px] shrink-0">
      <PieChart width={SIZE} height={SIZE}>
        <Pie
          data={data}
          dataKey="value"
          isAnimationActive={false}
          cx={SIZE / 2}
          cy={SIZE / 2}
          innerRadius={55}
          outerRadius={80}
          startAngle={90}
          endAngle={-270}
          stroke="#111110"
          strokeWidth={2}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#1a1a19', border: '1px solid #2c2c2a', borderRadius: 6, fontSize: 12 }}
          itemStyle={{ color: '#fff' }}
        />
      </PieChart>
      <div className="absolute flex flex-col items-center pointer-events-none">
        <div className="text-2xl font-semibold text-white">{winRatePct.toFixed(2)}%</div>
        <div className="text-[10px] text-[#898781] uppercase tracking-wide">Win Rate</div>
      </div>
    </div>
  );
}
