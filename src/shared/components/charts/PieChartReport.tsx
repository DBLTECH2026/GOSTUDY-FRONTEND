'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export type PieDatum = {
  label: string;
  value: number;
};

type Props = {
  data: PieDatum[];
  height?: number;
  /** Si true, dibuja como dona (con hueco al centro). Default true. */
  donut?: boolean;
  /** Sufijo opcional del valor en el tooltip (ej. "inscripciones"). */
  unidad?: string;
  formatValue?: (v: number) => string;
};

// Paleta consistente con la identidad Trilce.
const COLORS = [
  '#dc4a17', // trilce-primary (naranja principal)
  '#1f2937', // gris muy oscuro
  '#0ea5e9', // azul
  '#10b981', // verde
  '#f59e0b', // amber
  '#8b5cf6', // violeta
  '#ec4899', // rosa
  '#6366f1', // índigo
];

export function PieChartReport({
  data,
  height = 280,
  donut = true,
  unidad = '',
  formatValue,
}: Props) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-10">
        No hay datos para graficar todavía.
      </p>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-4 items-center">
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={donut ? 55 : 0}
              outerRadius={100}
              paddingAngle={2}
              stroke="#fff"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload as PieDatum;
                const pct = total === 0 ? 0 : Math.round((item.value / total) * 100);
                return (
                  <div className="bg-white border border-border rounded-md shadow-md px-3 py-2 text-xs">
                    <div className="font-bold text-text-primary">{item.label}</div>
                    <div className="text-trilce-primary font-semibold mt-0.5">
                      {formatValue ? formatValue(item.value) : item.value} {unidad}
                    </div>
                    <div className="text-text-muted text-[10px] mt-0.5">{pct}% del total</div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda al lado */}
      <div className="flex flex-col gap-2">
        {data.map((d, i) => {
          const pct = total === 0 ? 0 : Math.round((d.value / total) * 100);
          return (
            <div key={d.label} className="flex items-center gap-2 text-xs">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-text-primary truncate">{d.label}</div>
                <div className="text-text-muted text-[11px]">
                  {formatValue ? formatValue(d.value) : d.value} · {pct}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
