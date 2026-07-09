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
    <div className="border border-[#2c2c2a] bg-[#141412] rounded-md px-4 py-3 min-w-[130px] flex-1">
      <div className="text-[11px] uppercase tracking-wide text-[#898781] whitespace-nowrap">{label}</div>
      <div className={`text-xl md:text-2xl font-semibold mt-1 ${toneClass[tone]}`}>{value}</div>
    </div>
  );
}
