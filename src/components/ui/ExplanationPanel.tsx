import React, { useEffect, useRef } from 'react';
import { useVisualizerStore } from '../../store/useVisualizerStore';
import { Terminal, Lightbulb, Clock, Database, FastForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExplanationPanelProps {
  algorithmId: string;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ algorithmId }) => {
  const { history, currentStepIndex, steps } = useVisualizerStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new steps are revealed
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentStepIndex]);

  const visibleHistory = history.slice(0, Math.max(0, currentStepIndex + 1));
  const progressPercent = steps.length > 0 ? Math.round((visibleHistory.length / steps.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-dark-950 border-l border-slate-700 font-sans text-slate-300 shadow-2xl z-20 w-[450px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-dark-900 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-yellow-400" />
          <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase">Analysis Engine</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-dark-800 px-2 py-1 rounded">
          <FastForward size={12} className="text-primary-400" />
          Step {Math.max(0, currentStepIndex + 1)} / {steps.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-dark-800 relative">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stats/Complexity Widget */}
      <div className="flex gap-4 p-4 border-b border-slate-800 bg-dark-900/50">
        <div className="flex-1 bg-dark-800/80 rounded-lg p-3 border border-white/5">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">
            <Clock size={12} /> Time Complexity
          </div>
          <div className="text-lg font-mono font-bold text-accent-300">
            {algorithmId === 'binary_search' ? 'O(log N)' : 
             algorithmId === 'dijkstra' ? 'O((V+E) log V)' : 
             ['bubble_sort', 'selection_sort', 'insertion_sort'].includes(algorithmId) ? 'O(N²)' : 
             ['merge_sort', 'quick_sort', 'heap_sort'].includes(algorithmId) ? 'O(N log N)' : 
             'O(N)'}
          </div>
        </div>
        <div className="flex-1 bg-dark-800/80 rounded-lg p-3 border border-white/5">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">
            <Database size={12} /> Space Complexity
          </div>
          <div className="text-lg font-mono font-bold text-primary-300">
             {algorithmId === 'merge_sort' ? 'O(N)' : 
              algorithmId === 'dijkstra' ? 'O(V)' : 
              ['inorder', 'preorder', 'postorder'].includes(algorithmId) ? 'O(H)' : 
              algorithmId === 'levelorder' ? 'O(W)' :
              'O(1)'}
          </div>
        </div>
      </div>

      {/* Logic History Log */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3 relative" ref={scrollRef}>
        <AnimatePresence>
          {visibleHistory.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
              <Terminal size={32} className="opacity-20" />
              <p className="text-xs font-mono">Awaiting execution trace...</p>
            </motion.div>
          )}

          {visibleHistory.map((snap, idx) => {
            if (!snap.currentMessage) return null;
            
            const isLast = idx === visibleHistory.length - 1;
            // Split "Because" explanations for beautiful rendering
            const msgParts = snap.currentMessage.split('. (Because');
            const mainMsg = msgParts[0];
            const whyMsg = msgParts.length > 1 ? 'Because ' + msgParts[1].replace(')', '') : null;

            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${isLast ? 'opacity-100' : 'opacity-60 grayscale-[50%]'}`}
              >
                <div className="flex flex-col items-center mt-1">
                  <div className={`w-2 h-2 rounded-full ${isLast ? 'bg-accent-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-600'}`} />
                  {idx < visibleHistory.length - 1 && <div className="w-px h-full bg-slate-700/50 mt-2" />}
                </div>
                
                <div className={`flex-1 pb-4 ${isLast ? '' : 'border-b border-slate-800/50'}`}>
                  <div className="text-xs font-mono text-slate-500 mb-1">Cycle {idx}</div>
                  <div className={`text-sm ${isLast ? 'text-white font-medium' : 'text-slate-300'}`}>
                    {mainMsg}
                  </div>
                  {whyMsg && (
                    <div className={`mt-2 p-2 rounded bg-primary-900/20 border border-primary-500/20 text-xs text-primary-200 italic`}>
                      💡 {whyMsg}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
