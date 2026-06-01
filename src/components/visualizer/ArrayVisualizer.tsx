import React from 'react';
import { motion } from 'framer-motion';

export interface ArrayVisualizerProps {
  data: number[];
  activeIndices: number[];
  comparingIndices: number[];
  swappingIndices: number[];
  sortedIndices: number[];
  foundIndex?: number;
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
  data,
  activeIndices,
  comparingIndices,
  swappingIndices,
  sortedIndices,
  foundIndex = -1,
}) => {
  if (!data.length) return null;
  const maxVal = Math.max(...data, 1);
  const barWidth = Math.max(20, Math.min(56, Math.floor(700 / data.length)));

  return (
    <div className="w-full flex flex-col items-center">
      {/* Bars */}
      <div className="flex items-end justify-center gap-[3px] px-4" style={{ height: '260px' }}>
        {data.map((value, idx) => {
          const heightPercent = (value / maxVal) * 100;

          let bgColor = 'bg-primary-500';
          let shadow = '';
          let label = '';

          if (foundIndex === idx) {
            bgColor = 'bg-emerald-400';
            shadow = 'shadow-[0_0_20px_rgba(52,211,153,0.5)]';
            label = '✓ FOUND';
          } else if (sortedIndices.includes(idx)) {
            bgColor = 'bg-emerald-500';
            shadow = 'shadow-[0_0_8px_rgba(74,222,128,0.3)]';
          } else if (swappingIndices.includes(idx)) {
            bgColor = 'bg-red-400';
            shadow = 'shadow-[0_0_18px_rgba(248,113,113,0.5)]';
            label = '⇄';
          } else if (comparingIndices.includes(idx)) {
            bgColor = 'bg-blue-400';
            shadow = 'shadow-[0_0_15px_rgba(96,165,250,0.4)]';
            label = '👁';
          } else if (activeIndices.includes(idx)) {
            bgColor = 'bg-yellow-400';
            shadow = 'shadow-[0_0_15px_rgba(250,204,21,0.4)]';
          }

          return (
            <motion.div
              key={idx}
              className={`relative flex flex-col items-center justify-end rounded-t-md ${bgColor} ${shadow}`}
              style={{ width: `${barWidth}px` }}
              animate={{
                height: `${Math.max(8, heightPercent)}%`,
              }}
              transition={{
                type: 'spring',
                stiffness: 250,
                damping: 22,
                mass: 0.8,
              }}
            >
              {/* Glossy top highlight */}
              <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-white/20 to-transparent rounded-t-md" />

              {/* Label */}
              {label && (
                <span className="absolute -top-5 text-[9px] font-bold text-white/80">{label}</span>
              )}

              {/* Value inside bar */}
              <span className="mb-1 font-mono text-[11px] font-bold text-white drop-shadow-md select-none">
                {value}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Index labels */}
      <div className="flex justify-center gap-[3px] mt-1 px-4">
        {data.map((_, idx) => (
          <div
            key={idx}
            className="text-center text-[9px] text-slate-600 font-mono"
            style={{ width: `${barWidth}px` }}
          >
            {idx}
          </div>
        ))}
      </div>
    </div>
  );
};
