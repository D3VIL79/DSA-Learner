import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface GraphEdge {
  source: number;
  target: number;
  weight?: number;
  directed?: boolean;
}

interface GraphVisualizerProps {
  numNodes?: number;
  edges?: GraphEdge[];
  activeNode?: number;
  visitedNodes?: number[]; 
  isDirected?: boolean;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  numNodes = 5,
  edges = [
    { source: 0, target: 1 },
    { source: 0, target: 2 },
    { source: 1, target: 3 },
    { source: 2, target: 4 }
  ],
  activeNode = -1,
  visitedNodes = [],
}) => {
  // Pre-calculate node positions in a circle
  const nodes = useMemo(() => {
    const n = numNodes;
    const radius = 100;
    const centerX = 150;
    const centerY = 150;
    
    return Array.from({ length: n }).map((_, i) => {
      const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
      return {
        id: i,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }, [numNodes]);

  return (
    <div className="flex flex-col items-center gap-3 w-full relative">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">🕸️ Graph Visualization</h4>
      
      <div className="relative w-[300px] h-[300px] bg-dark-800/50 rounded-xl border border-slate-700/50">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Arrow marker definition for directed graphs */}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="25" refY="5"
                markerWidth="6" markerHeight="6"
                orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="25" refY="5"
                markerWidth="6" markerHeight="6"
                orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#60a5fa" />
            </marker>
          </defs>

          {edges.map((edge, idx) => {
            const sourceNode = nodes[edge.source];
            const targetNode = nodes[edge.target];
            if (!sourceNode || !targetNode) return null;

            const isActiveEdge = (activeNode === edge.source && visitedNodes.includes(edge.target)) || 
                                 (activeNode === edge.target && visitedNodes.includes(edge.source));
            
            const midX = (sourceNode.x + targetNode.x) / 2;
            const midY = (sourceNode.y + targetNode.y) / 2;

            return (
              <g key={`edge-${idx}`}>
                <motion.line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={isActiveEdge ? '#60a5fa' : '#475569'}
                  strokeWidth={isActiveEdge ? 3 : 2}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                  markerEnd={edge.directed ? (isActiveEdge ? "url(#arrow-active)" : "url(#arrow)") : ""}
                />
                {edge.weight !== undefined && (
                  <text
                    x={midX}
                    y={midY - 8}
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {edge.weight}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {nodes.map((node) => {
          const isActive = activeNode === node.id;
          const isVisited = visitedNodes.includes(node.id);
          
          return (
            <motion.div
              key={`node-${node.id}`}
              className={`absolute flex flex-col items-center justify-center w-10 h-10 -ml-5 -mt-5 rounded-full font-mono font-bold text-sm border-2 transition-all duration-300 z-10
                ${isActive 
                  ? 'bg-accent-400 border-accent-300 text-dark-950 shadow-[0_0_20px_rgba(34,211,238,0.6)] scale-110' 
                  : isVisited
                    ? 'bg-primary-500/80 border-primary-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                    : 'bg-dark-600 border-slate-500 text-slate-300'
                }
              `}
              style={{ left: node.x, top: node.y }}
              initial={{ scale: 0 }}
              animate={{ scale: isActive ? 1.2 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {node.id}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
