export interface KPI {
  label: string;
  value: number | string;
  accent?: string;
}

export function KPICards({ items }: { items: KPI[] }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="card">
          <p className="text-xs text-slate-500">{item.label}</p>
          <p
            className="text-2xl font-semibold"
            style={{ color: item.accent ?? "#0b0b0b" }}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
