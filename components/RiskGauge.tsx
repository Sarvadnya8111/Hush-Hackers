import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface RiskGaugeProps {
  score: number;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ score }) => {
  const data = [
    { name: 'Risk', value: score },
    { name: 'Safety', value: 100 - score },
  ];

  let color = '#10b981'; // Green (Low - Safe)
  if (score > 30) color = '#f59e0b'; // Amber (Medium)
  if (score > 55) color = '#f97316'; // Orange (High)
  if (score > 80) color = '#ef4444'; // Red (Critical)

  const COLORS = [color, '#1e293b'];

  return (
    <div className="relative w-full h-40 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Absolute positioning to place text at the bottom center of the arc */}
      <div className="absolute bottom-0 flex flex-col items-center pb-2">
        <span className="text-5xl font-bold font-mono tracking-tighter" style={{ color: color }}>
          {score}
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Risk Score</span>
      </div>
    </div>
  );
};

export default RiskGauge;