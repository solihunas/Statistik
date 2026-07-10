interface StatCardProps {
  label: string;
  value: string;
  tone?: 'default' | 'good' | 'bad';
}

const toneClass: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-white',
  good: 'text-[#0ca30c]',
  bad: 'text-[#e66767]',
};

export default function StatCard({ label, value, tone = 'default' }: StatCardProps) {
  return (
    <div className="border border-[#2c2c2a] bg-[#141412] rounded-md px-3 py-2 min-w-[108px] flex-1">
      <div className="text-[10px] uppercase tracking-wide text-[#898781] whitespace-nowrap">{label}</div>
      <div className={`text-lg font-semibold mt-0.5 ${toneClass[tone]}`}>{value}</div>
    </div>
  );
}
