import { useAppStore } from '../store/useAppStore';

const ALGORITHM_MAP = [
  { id: 'bubble_sort', keywords: ['bubble', 'bubble sort'] },
  { id: 'selection_sort', keywords: ['selection', 'selection sort'] },
  { id: 'insertion_sort', keywords: ['insertion', 'insertion sort'] },
  { id: 'merge_sort', keywords: ['merge', 'merge sort'] },
  { id: 'quick_sort', keywords: ['quick', 'quick sort'] },
  { id: 'heap_sort', keywords: ['heap', 'heap sort'] },
  { id: 'linear_search', keywords: ['linear', 'linear search'] },
  { id: 'binary_search', keywords: ['binary', 'binary search'] },
  { id: 'bfs_graph', keywords: ['bfs', 'breadth first', 'breadth'] },
  { id: 'dfs_graph', keywords: ['dfs', 'depth first', 'depth'] },
  { id: 'dijkstra', keywords: ['dijkstra', 'shortest path'] },
  { id: 'inorder', keywords: ['inorder', 'tree'] },
  { id: 'preorder', keywords: ['preorder', 'tree'] },
  { id: 'postorder', keywords: ['postorder', 'tree'] },
  { id: 'levelorder', keywords: ['levelorder', 'level order', 'bfs tree'] },
  { id: 'stack_ops', keywords: ['stack'] },
  { id: 'queue_ops', keywords: ['queue'] },
  { id: 'counting_sort', keywords: ['counting', 'counting sort'] },
  // Phase 1 Expansion
  { id: 'fibonacci_dp', keywords: ['fibonacci', 'fib', 'dp'] },
  { id: 'knapsack_0_1', keywords: ['knapsack', '0/1 knapsack', '0-1 knapsack'] },
  { id: 'longest_common_subsequence', keywords: ['lcs', 'longest common subsequence'] },
  { id: 'edit_distance', keywords: ['edit distance', 'levenshtein'] },
  { id: 'n_queens', keywords: ['n queens', 'queens', 'n-queens'] },
  { id: 'sudoku_solver', keywords: ['sudoku', 'solver'] },
];

export { ALGORITHM_MAP };

export function parseCommand(command: string) {
  const normalized = command.toLowerCase().trim();
  const store = useAppStore.getState();

  // Detect algorithm
  let detectedAlgo: string | null = null;
  for (const algo of ALGORITHM_MAP) {
    if (algo.keywords.some(k => normalized.includes(k))) {
      detectedAlgo = algo.id;
      break;
    }
  }

  // Explicit mode commands
  if (normalized.includes('start') || normalized.includes('game') || normalized.includes('play')) {
    store.setMode('game');
    if (detectedAlgo) store.setActiveAlgorithm(detectedAlgo);
    return true;
  }

  if (normalized.includes('visualize') || normalized.includes('visualise') || normalized.includes('run') || normalized.includes('show')) {
    store.setMode('visualize');
    if (detectedAlgo) store.setActiveAlgorithm(detectedAlgo);
    return true;
  }

  if (normalized.includes('explain') || normalized.includes('teach') || normalized.includes('how')) {
    store.setMode('explain');
    if (detectedAlgo) store.setActiveAlgorithm(detectedAlgo);
    return true;
  }

  if (normalized.includes('improve') || normalized.includes('analyze') || normalized.includes('check')) {
    store.setMode('game'); // Opens code editor mode
    return true;
  }

  if (normalized.includes('language') || normalized.includes('switch') || normalized.includes('lang')) {
    if (normalized.includes('hindi') || normalized.includes('hi')) store.setLanguage('hi');
    else if (normalized.includes('spanish') || normalized.includes('es') || normalized.includes('español')) store.setLanguage('es');
    else store.setLanguage('en');
    return true;
  }

  // Bare algorithm name → auto visualize
  if (detectedAlgo) {
    store.setMode('visualize');
    store.setActiveAlgorithm(detectedAlgo);
    return true;
  }

  return false;
}
