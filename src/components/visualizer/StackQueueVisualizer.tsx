import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StackQueueVisualizerProps {
  data: number[];
  type: 'stack' | 'queue';
  highlightIndex?: number;
  message?: string;
}

export const StackQueueVisualizer: React.FC<StackQueueVisualizerProps> = ({
  data,
  type,
  highlightIndex,
  message,
}) => {
  const isStack = type === 'stack';

  if (isStack) {
    // ===== STACK: Vertical tower, top is last element =====
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">📚 Stack (LIFO — Last In, First Out)</h4>

        <div className="relative flex flex-col items-center">
          {/* Stack container frame */}
          <div className="relative flex flex-col-reverse items-center gap-1 min-h-[200px] max-lg:landscape:min-h-[140px] w-48 max-lg:landscape:w-36 border-l-2 border-r-2 border-b-2 border-slate-600 rounded-b-lg p-2 pt-4 bg-dark-800/50">
            
            {/* Top pointer */}
            {data.length > 0 && (
              <div className="absolute -right-16 top-1 text-xs text-primary-400 font-mono flex items-center gap-1">
                ← TOP
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {data.map((val, idx) => {
                const isTop = idx === data.length - 1;
                const isHighlighted = highlightIndex === idx;

                return (
                  <motion.div
                    key={`stack-${idx}-${val}`}
                    initial={{ opacity: 0, scale: 0.3, y: -40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.3, y: -40 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`
                      w-full h-10 flex items-center justify-center rounded-md
                      font-mono font-bold text-base transition-all duration-300
                      ${isHighlighted
                        ? 'bg-accent-400 text-dark-950 shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                        : isTop
                          ? 'bg-primary-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                          : 'bg-dark-600 text-slate-200 border border-slate-500'
                      }
                    `}
                  >
                    {val}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {data.length === 0 && (
              <div className="text-slate-600 text-xs font-mono italic py-8">Stack Empty</div>
            )}

            {/* Bottom label */}
            <div className="absolute -bottom-6 text-[10px] text-slate-600 font-mono">BOTTOM</div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-xs text-slate-500 mt-4">
          <span>Size: <strong className="text-white">{data.length}</strong></span>
          <span>Top: <strong className="text-primary-400">{data.length > 0 ? data[data.length - 1] : '—'}</strong></span>
        </div>
      </div>
    );
  }

  // ===== QUEUE: Horizontal pipe, front is first element =====
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">📤 Queue (FIFO — First In, First Out)</h4>

      <div className="relative flex items-center">
        {/* Dequeue arrow */}
        <div className="flex flex-col items-center mr-3">
          <span className="text-xs text-danger-400 font-mono mb-1">OUT</span>
          <motion.div animate={{ x: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <span className="text-danger-400 text-lg">◄</span>
          </motion.div>
        </div>

        {/* Queue container */}
        <div className="flex items-center gap-1 min-w-[100px] min-h-[60px] border-t-2 border-b-2 border-slate-600 px-2 py-2 bg-dark-800/50 rounded-md">
          {/* Front label */}
          {data.length > 0 && (
            <div className="absolute -top-5 left-14 text-[10px] text-primary-400 font-mono">FRONT</div>
          )}
          {data.length > 0 && (
            <div className="absolute -top-5 right-14 text-[10px] text-accent-400 font-mono">REAR</div>
          )}

          <AnimatePresence mode="popLayout">
            {data.map((val, idx) => {
              const isFront = idx === 0;
              const isRear = idx === data.length - 1;
              const isHighlighted = highlightIndex === idx;

              return (
                <motion.div
                  key={`queue-${idx}-${val}`}
                  initial={{ opacity: 0, scale: 0.3, x: 40 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.3, x: -40 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`
                    w-14 h-14 max-lg:landscape:w-10 max-lg:landscape:h-10 flex items-center justify-center rounded-lg
                    font-mono font-bold text-base transition-all duration-300
                    ${isHighlighted
                      ? 'bg-accent-400 text-dark-950 shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                      : isFront
                        ? 'bg-primary-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                        : isRear
                          ? 'bg-accent-500/80 text-white'
                          : 'bg-dark-600 text-slate-200 border border-slate-500'
                    }
                  `}
                >
                  {val}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {data.length === 0 && (
            <div className="text-slate-600 text-xs font-mono italic px-6 py-2">Queue Empty</div>
          )}
        </div>

        {/* Enqueue arrow */}
        <div className="flex flex-col items-center ml-3">
          <span className="text-xs text-success-400 font-mono mb-1">IN</span>
          <motion.div animate={{ x: [3, -3, 3] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <span className="text-success-400 text-lg">►</span>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-xs text-slate-500 mt-4">
        <span>Size: <strong className="text-white">{data.length}</strong></span>
        <span>Front: <strong className="text-primary-400">{data.length > 0 ? data[0] : '—'}</strong></span>
        <span>Rear: <strong className="text-accent-400">{data.length > 0 ? data[data.length - 1] : '—'}</strong></span>
      </div>
    </div>
  );
};
