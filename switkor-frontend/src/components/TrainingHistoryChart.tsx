"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
} from 'recharts';

interface TrainingHistoryChartProps {
  // Datos ya preparados: último array de { month, count }
  data: { month: string; count: number }[];
}

export default function TrainingHistoryChart({ data }: TrainingHistoryChartProps) {
  return (
    <div className="mt-6 h-56">
      {/* Gráfica de barras para los últimos 6 meses */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, bottom: 20 }}
          barSize={20}            // Barras más estrechas
          barCategoryGap="30%"     // Espacio entre barras
        >

           {/* Eje X con etiquetas sky-900 y líneas de eje más gruesas */}
          <XAxis
            dataKey="month"
            tick={{
              fill: '#0c4a6e',      // text-sky-900
              fontSize: 12,
              fontWeight: 'bold',
            }}
            axisLine={{ stroke: '#0c4a6e', strokeWidth: 2 }}
            tickLine={{ stroke: '#0c4a6e', strokeWidth: 1 }}
            interval={0}
            angle={-30}
            textAnchor="end"
          />

          {/* Eje Y con líneas y ticks sky-900 */}
          <YAxis
            allowDecimals={false}
            axisLine={{ stroke: '#0c4a6e', strokeWidth: 2 }}
            tickLine={{ stroke: '#0c4a6e', strokeWidth: 1 }}
            tick={{ fill: '#0c4a6e', fontSize: 12 }}
          />

          <RechartTooltip formatter={(value: number) => `${value} sesiones`} />

          {/* Barras estándar, color azul intenso */}
          <Bar
            dataKey="count"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}