import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GridVisualizerProps {
  gridData: (number | string | null)[][];
  activeRow?: number;
  activeCol?: number;
  comparingRow?: number;
  comparingCol?: number;
}

export const GridVisualizer: React.FC<GridVisualizerProps> = ({ 
  gridData, 
  activeRow, 
  activeCol,
  comparingRow,
  comparingCol
}) => {
  if (!gridData || gridData.length === 0) return null;

  const rows = gridData.length;
  const cols = gridData[0].length;

  return (
    <div className="w-full h-full flex items-center justify-center p-4 overflow-auto custom-scrollbar">
      <div className="flex flex-col gap-1">
        {gridData.map((row, rIndex) => (
          <div key={`row-${rIndex}`} className="flex gap-1">
            {row.map((cellValue, cIndex) => {
              const isActive = rIndex === activeRow && cIndex === activeCol;
              const isComparing = rIndex === comparingRow && cIndex === comparingCol;
              
              let bgClass = 'bg-dark-800 border-white/10 text-slate-300';
              if (isActive) {
                bgClass = 'bg-accent-500 border-accent-300 text-white z-10 glow-accent';
              } else if (isComparing) {
                bgClass = 'bg-warning-500 border-warning-300 text-white z-10 glow-warning';
              } else if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                bgClass = 'bg-primary-600 border-primary-400 text-white';
              }

              return (
                <motion.div
                  key={`cell-${rIndex}-${cIndex}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: isActive || isComparing ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`w-12 h-12 flex items-center justify-center border rounded-md font-mono text-sm font-bold transition-colors ${bgClass}`}
                >
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={String(cellValue)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="drop-shadow-md"
                    >
                      {cellValue !== null ? cellValue : ''}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
