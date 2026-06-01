import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TreeVisualizerProps {
  data: number[]; // represents tree
  activeIndices: number[];
  visitedNodes?: number[]; // indices of visited nodes
  treeK?: number; // Branching factor
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ data, activeIndices, visitedNodes = [], treeK = 2 }) => {
  // We render a K-ary tree layout
  // data is a flat array representing the tree level-by-level
  
  const treeDepth = Math.floor(Math.log2(data.length)) + 1;
  const containerWidth = 800; // max width
  
  const nodes = useMemo(() => {
    const items = [];
    const nodeRadius = 24;
    const verticalGap = 80;

    for (let i = 0; i < data.length; i++) {
      if (data[i] === undefined || data[i] === null) continue;

      let level = 0;
      let nodesInLevel = 1;
      let nodesBeforeLevel = 0;
      const k = Math.max(1, treeK);

      if (k === 1) {
        level = i;
        nodesBeforeLevel = i;
        nodesInLevel = 1;
      } else {
        while (i >= nodesBeforeLevel + nodesInLevel) {
          nodesBeforeLevel += nodesInLevel;
          nodesInLevel *= k;
          level++;
        }
      }
      
      const positionInLevel = i - nodesBeforeLevel;
      
      const widthPerNode = containerWidth / nodesInLevel;
      const x = (positionInLevel * widthPerNode) + (widthPerNode / 2);
      const y = level * verticalGap + nodeRadius + 20;

      items.push({
        id: i,
        val: data[i],
        x,
        y,
        level,
        isActive: activeIndices.includes(i),
        isVisited: visitedNodes.includes(i),
      });
    }
    return items;
  }, [data, activeIndices, visitedNodes]);

  const edges = useMemo(() => {
    const lines = [];
    const k = Math.max(1, treeK);

    for (let i = 0; i < data.length; i++) {
      if (data[i] === undefined || data[i] === null) continue;
      
      const parentNode = nodes.find(n => n.id === i);
      if (!parentNode) continue;

      for (let c = 1; c <= k; c++) {
        const childIdx = k * i + c;
        if (childIdx < data.length && data[childIdx] !== undefined) {
          const childNode = nodes.find(n => n.id === childIdx);
          if (childNode) {
            lines.push({
              id: `edge-${i}-${childIdx}`,
              x1: parentNode.x,
              y1: parentNode.y,
              x2: childNode.x,
              y2: childNode.y,
              isActive: activeIndices.includes(i) || activeIndices.includes(childIdx)
            });
          }
        }
      }
    }
    return lines;
  }, [data, nodes, activeIndices, treeK]);

  return (
    <div className="relative w-full max-w-[800px] h-[400px] flex justify-center items-start mt-8">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {edges.map((edge) => (
          <motion.line
            key={edge.id}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke={edge.isActive ? 'var(--color-accent-400)' : 'var(--color-dark-600)'}
            strokeWidth={edge.isActive ? 4 : 2}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={edge.isActive ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : ''}
          />
        ))}
      </svg>
      
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <AnimatePresence>
          {nodes.map((node) => {
            let bgClass = 'bg-primary-600 border-primary-400';
            let shadowClass = '';
            
            if (node.isActive) {
              bgClass = 'bg-accent-400 border-accent-300';
              shadowClass = 'glow-accent scale-125 z-10';
            } else if (node.isVisited) {
              bgClass = 'bg-success-500 border-success-400';
              shadowClass = 'glow-success z-0';
            }

            return (
              <motion.div
                key={`node-${node.id}`}
                layoutId={`node-${node.id}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: node.isActive ? 1.25 : 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`absolute w-12 h-12 rounded-full border-2 flex items-center justify-center text-white font-bold text-sm transition-all duration-300 ${bgClass} ${shadowClass}`}
                style={{
                  left: node.x - 24, // subtract half width to center
                  top: node.y - 24,
                }}
              >
                {node.val}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
