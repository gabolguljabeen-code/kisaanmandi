import React from 'react';

interface SparklineProps {
  data: number[];
  direction?: 'up' | 'down' | 'flat';
  width?: number;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  direction = 'flat',
  width = 72,
  height = 28,
}) => {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="opacity-20 bg-dust/10 rounded" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const strokeColor =
    direction === 'up'
      ? '#5C8A3C' // leaf
      : direction === 'down'
      ? '#B5532C' // terracotta
      : '#8A7B68'; // dust

  const padding = 2;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * innerWidth;
    const y = height - padding - ((val - min) / range) * innerHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${(padding + innerWidth).toFixed(1)},${height} L ${padding},${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${direction}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#spark-${direction})`} />
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].split(',')[0]}
          cy={points[points.length - 1].split(',')[1]}
          r="2.5"
          fill={strokeColor}
        />
      )}
    </svg>
  );
};
