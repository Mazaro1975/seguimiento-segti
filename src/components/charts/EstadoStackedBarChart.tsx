"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ESTADOS } from "@/lib/types";
import { ESTADO_COLORS, ESTADO_LABELS } from "@/lib/labels";
import { CHART_INK } from "@/lib/chartColors";

export interface EstadoStackedDatum {
  name: string;
  [estado: string]: string | number;
}

export function EstadoStackedBarChart({
  title,
  data,
  height = 320,
}: {
  title: string;
  data: EstadoStackedDatum[];
  height?: number;
}) {
  return (
    <div className="card">
      <h3 className="mb-2 text-sm font-semibold text-slate-900">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid stroke={CHART_INK.grid} vertical={false} />
          <XAxis dataKey="name" stroke={CHART_INK.muted} fontSize={11} interval={0} angle={-20} textAnchor="end" height={70} />
          <YAxis allowDecimals={false} stroke={CHART_INK.muted} fontSize={12} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: CHART_INK.grid }} />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => ESTADO_LABELS[value as keyof typeof ESTADO_LABELS] ?? value}
          />
          {ESTADOS.map((estado, i) => (
            <Bar
              key={estado}
              dataKey={estado}
              stackId="estado"
              fill={ESTADO_COLORS[estado]}
              radius={i === ESTADOS.length - 1 ? [4, 4, 0, 0] : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
