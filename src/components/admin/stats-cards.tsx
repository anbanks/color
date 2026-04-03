interface StatsCardsProps {
  pending: number;
  approved: number;
  published: number;
  rejected: number;
}

export function StatsCards({ pending, approved, published, rejected }: StatsCardsProps) {
  const stats = [
    { label: "Pending", value: pending, color: "text-yellow-600 bg-yellow-50" },
    { label: "Approved", value: approved, color: "text-blue-600 bg-blue-50" },
    { label: "Published", value: published, color: "text-green-600 bg-green-50" },
    { label: "Rejected", value: rejected, color: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
          <p className="text-2xl font-semibold">{s.value}</p>
          <p className="text-sm opacity-80">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
