"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_INK, SERIES_1 } from "@/lib/chartColors";

export interface SimpleBarDatum {
  name: string;
  value: number;
}

export function SimpleBarChart({
  title,
  data,
  horizontal = false,
  height = 260,
}: {
  title: string;
  data: SimpleBarDatum[];
  horizontal?: boolean;
  height?: number;
}) {
  return (
    <div className="card">
      <h3 className="mb-2 text-sm font-semibold text-slate-900">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 4, right: 12, left: horizontal ? 24 : 0, bottom: 4 }}
        >
          <CartesianGrid stroke={CHART_INK.grid} vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" allowDecimals={false} stroke={CHART_INK.muted} fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                stroke={CHART_INK.muted}
                fontSize={12}
              />
            </>
          ) : (
            <>
              <XAxis dataKey="name" stroke={CHART_INK.muted} fontSize={12} />
              <YAxis allowDecimals={false} stroke={CHART_INK.muted} fontSize={12} />
            </>
          )}
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: CHART_INK.grid }}
          />
          <Bar dataKey="value" fill={SERIES_1} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
