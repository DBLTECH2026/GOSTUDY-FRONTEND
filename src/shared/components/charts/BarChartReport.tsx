'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type BarDatum = {
  label: string;          // eje X (ej. "May")
  value: number;          // altura
  caption?: string;       // texto debajo del valor en tooltip (ej. "S/ 12,500")
};

type Props = {
  data: BarDatum[];
  height?: number;
  /** Texto del tooltip que aparece sobre el valor (ej. "inscripciones", "pagos"). */
  unidad?: string;
  /** Formateador opcional para el valor del tooltip. */
  formatValue?: (v: number) => string;
  /** Resalta la barra con mayor valor en verde (default true). */
  highlightMax?: boolean;
};

const TRILCE_PRIMARY = '#dc4a17';      // naranja Trilce
const TRILCE_PRIMARY_SOFT = '#fde2d4';
const SUCCESS = '#10b981';

export function BarChartReport({
  data,
  height = 280,
  unidad = '',
  formatValue,
  highlightMax = true,
}: Props) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-10">
        No hay datos para graficar todavía.
      </p>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(220, 74, 23, 0.08)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0].payload as BarDatum;
              return (
                <div className="bg-white border border-border rounded-md shadow-md px-3 py-2 text-xs">
                  <div className="font-bold text-text-primary">{item.label}</div>
                  <div className="text-trilce-primary font-semibold mt-0.5">
                    {formatValue ? formatValue(item.value) : item.value} {unidad}
                  </div>
                  {item.caption && (
                    <div className="text-text-muted text-[10px] mt-0.5">{item.caption}</div>
                  )}
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={
                  highlightMax && d.value === maxValue && maxValue > 0
                    ? SUCCESS
                    : d.value === 0
                    ? TRILCE_PRIMARY_SOFT
                    : TRILCE_PRIMARY
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
