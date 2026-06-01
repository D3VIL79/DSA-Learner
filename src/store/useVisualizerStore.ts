import { create } from 'zustand';
import { ExecutionStep, ExecutionEngine } from '../engine/executionEngine';

export interface GraphData {
  nodes: number;
  edges: { source: number; target: number; weight?: number; directed?: boolean }[];
}

interface VisualizerSnapshot {
  data: number[];
  activeIndices: number[];
  comparingIndices: number[];
  swappingIndices: number[];
  sortedIndices: number[];
  foundIndex: number;
  activeLine: number;
  currentMessage: string;
  structureData: number[];
  graphData: GraphData | null;
  gridData: (number | string | null)[][] | null;
}

interface VisualizerState {
  data: number[];
  originalData: number[];
  steps: ExecutionStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;

  activeIndices: number[];
  comparingIndices: number[];
  swappingIndices: number[];
  sortedIndices: number[];
  foundIndex: number;
  activeLine: number;
  currentMessage: string;
  structureData: number[];
  graphData: GraphData | null;
  treeK: number;
  gridData: (number | string | null)[][] | null;

  // Time-travel history
  history: VisualizerSnapshot[];

  initializeData: (size?: number, customData?: number[], customGraph?: GraphData, customTreeK?: number) => void;
  runAlgorithm: (algorithmId: string, target?: number) => void;
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  goToStep: (index: number) => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
}

function makeSnapshot(state: VisualizerState): VisualizerSnapshot {
  return {
    data: [...state.data],
    activeIndices: [...state.activeIndices],
    comparingIndices: [...state.comparingIndices],
    swappingIndices: [...state.swappingIndices],
    sortedIndices: [...state.sortedIndices],
    foundIndex: state.foundIndex,
    activeLine: state.activeLine,
    currentMessage: state.currentMessage,
    structureData: [...state.structureData],
    graphData: state.graphData ? { nodes: state.graphData.nodes, edges: [...state.graphData.edges] } : null,
    gridData: state.gridData ? state.gridData.map(row => [...row]) : null,
  };
}

const BLANK: Omit<VisualizerSnapshot, 'data' | 'graphData'> = {
  activeIndices: [],
  comparingIndices: [],
  swappingIndices: [],
  sortedIndices: [],
  foundIndex: -1,
  activeLine: -1,
  currentMessage: '',
  structureData: [],
  gridData: null,
};

function applyStep(
  step: ExecutionStep,
  prevData: number[],
  prevSorted: number[],
  prevFound: number,
  prevStruct: number[],
  prevGridData: (number | string | null)[][] | null
): VisualizerSnapshot {
  let active: number[] = [];
  let comparing: number[] = [];
  let swapping: number[] = [];
  let sorted = [...prevSorted];
  let found = prevFound;
  let newData = [...prevData];
  let structData = [...prevStruct];
  let newGraphData = step.state?.graphData ? { nodes: step.state.graphData.nodes, edges: [...step.state.graphData.edges] } : null;
  let newGridData = prevGridData ? prevGridData.map(r => [...r]) : null;
  const line = step.line_number ?? -1;
  const msg = step.message ?? '';

  // Update data from state snapshot
  if (step.state) {
    if (Array.isArray(step.state)) {
      newData = [...step.state];
    } else if (step.state.arr && Array.isArray(step.state.arr)) {
      newData = [...step.state.arr];
    }
  }

  switch (step.type) {
    case 'compare':
      if (step.i !== undefined && step.j !== undefined) comparing = [step.i, step.j];
      else if (step.index !== undefined) comparing = [step.index];
      break;
    case 'swap':
      if (step.i !== undefined && step.j !== undefined) swapping = [step.i, step.j];
      break;
    case 'set':
      if (step.index !== undefined) active = [step.index];
      break;
    case 'found':
      if (step.index !== undefined) { found = step.index; active = [step.index]; }
      break;
    case 'highlight':
      if (step.index !== undefined && step.index >= 0) active = [step.index];
      if ((msg.includes('sorted position') || (msg.includes('Pass') && msg.includes('complete')))) {
        if (step.index !== undefined && step.index >= 0 && !sorted.includes(step.index)) sorted = [...sorted, step.index];
      }
      break;
    case 'visit':
      if (step.node !== undefined) {
        active = [step.node];
        if (!sorted.includes(step.node)) sorted = [...sorted, step.node];
      }
      break;
    case 'enqueue':
      if (step.value !== undefined) structData = [...structData, step.value];
      else if (step.node !== undefined) active = [step.node];
      break;
    case 'dequeue':
      if (step.value !== undefined) structData = structData.slice(1);
      else if (step.node !== undefined) active = [step.node];
      break;
    case 'push':
      if (step.value !== undefined) structData = [...structData, step.value];
      break;
    case 'pop':
      if (step.value !== undefined) structData = structData.slice(0, -1);
      break;
    case 'grid_update':
      if (step.gridState) newGridData = step.gridState.map(r => [...r]);
      if (step.index !== undefined && step.secondaryIndex !== undefined) active = [step.index, step.secondaryIndex];
      if (step.comparingRow !== undefined && step.comparingCol !== undefined) comparing = [step.comparingRow, step.comparingCol];
      break;
  }

  if (msg.includes('fully sorted') || msg.includes('Array sorted')) {
    sorted = newData.map((_, i) => i);
  }

  return { data: newData, activeIndices: active, comparingIndices: comparing, swappingIndices: swapping, sortedIndices: sorted, foundIndex: found, activeLine: line, currentMessage: msg, structureData: structData, graphData: newGraphData, gridData: newGridData };
}

export const useVisualizerStore = create<VisualizerState>((set, get) => ({
  data: [],
  originalData: [],
  steps: [],
  currentStepIndex: -1,
  isPlaying: false,
  speed: 500,
  ...BLANK,
  graphData: null,
  treeK: 2,
  history: [],

  initializeData: (size = 10, customData?: number[], customGraph?: GraphData, customTreeK?: number) => {
    const arr = customData ?? Array.from({ length: size }, () => Math.floor(Math.random() * 80) + 10);
    const k = customTreeK ?? 2;
    
    let graphData = customGraph || null;
    if (!graphData) {
      const edges = [];
      for (let i = 0; i < size; i++) {
        // spanning tree to ensure connectivity
        if (i > 0) {
          edges.push({ source: i, target: Math.floor(Math.random() * i), weight: Math.floor(Math.random() * 9) + 1 });
        }
        // random edges
        if (Math.random() > 0.5) {
          const t = Math.floor(Math.random() * size);
          if (t !== i) edges.push({ source: i, target: t, weight: Math.floor(Math.random() * 9) + 1 });
        }
      }
      graphData = { nodes: size, edges };
    }

    set({
      data: [...arr], originalData: [...arr], steps: [], currentStepIndex: -1, isPlaying: false, history: [],
      ...BLANK,
      graphData,
      treeK: k,
    });
  },

  runAlgorithm: (algorithmId: string, target?: number) => {
    const state = get();
    const payload = { array: state.data, graph: state.graphData, treeK: state.treeK };
    const steps = ExecutionEngine.compileAndRun('simulate', algorithmId, payload, target);

    const history: VisualizerSnapshot[] = [];
    let prevData = [...state.originalData];
    let prevSorted: number[] = [];
    let prevFound = -1;
    let prevStruct: number[] = [];
    let prevGraphData = state.graphData;
    let prevGridData = state.gridData;

    for (const step of steps) {
      const snap = applyStep(step, prevData, prevSorted, prevFound, prevStruct, prevGridData);
      if (!snap.graphData && prevGraphData) snap.graphData = prevGraphData;
      history.push(snap);
      prevData = snap.data;
      prevSorted = snap.sortedIndices;
      prevFound = snap.foundIndex;
      prevStruct = snap.structureData;
      if (snap.graphData) prevGraphData = snap.graphData;
      prevGridData = snap.gridData;
    }

    set({ data: [...state.originalData], steps, currentStepIndex: -1, history, ...BLANK, graphData: state.graphData, gridData: state.gridData });
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),

  stepForward: () => {
    const { currentStepIndex, history } = get();
    if (currentStepIndex >= history.length - 1) {
      set({ isPlaying: false });
      return;
    }
    const nextIndex = currentStepIndex + 1;
    const snap = history[nextIndex];
    set({ currentStepIndex: nextIndex, ...snap });
  },

  stepBackward: () => {
    const { currentStepIndex, history, originalData, graphData } = get();
    if (currentStepIndex <= 0) {
      set({ currentStepIndex: -1, data: [...originalData], ...BLANK, graphData });
      return;
    }
    const prevIndex = currentStepIndex - 1;
    const snap = history[prevIndex];
    set({ currentStepIndex: prevIndex, ...snap });
  },

  goToStep: (index: number) => {
    const { history, originalData, graphData } = get();
    if (index < 0) {
      set({ currentStepIndex: -1, data: [...originalData], ...BLANK, graphData });
      return;
    }
    if (index >= history.length) return;
    const snap = history[index];
    set({ currentStepIndex: index, isPlaying: false, ...snap });
  },

  reset: () => {
    const { originalData, graphData } = get();
    set({ data: [...originalData], currentStepIndex: -1, isPlaying: false, ...BLANK, graphData });
  },

  setSpeed: (speed) => set({ speed }),
}));
