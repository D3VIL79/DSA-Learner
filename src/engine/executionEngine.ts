export interface ExecutionStep {
  type: 'compare' | 'swap' | 'highlight' | 'visit' | 'enqueue' | 'dequeue' | 'set' | 'found' | 'push' | 'pop' | 'grid_update';
  i?: number;
  j?: number;
  index?: number;
  node?: number;
  value?: number;
  message?: string;
  line_number?: number;
  state?: any;
  gridState?: (number | string | null)[][];
  comparingRow?: number;
  comparingCol?: number;
}

export class ExecutionEngine {
  static compileAndRun(_code: string, algorithmType: string, payload: any, target?: number): ExecutionStep[] {
    const inputData = payload?.array || payload || [];
    const graphData = payload?.graph;
    const treeK = payload?.treeK || 2;

    switch (algorithmType) {
      case 'bubble_sort': return this.simulateBubbleSort([...inputData]);
      case 'selection_sort': return this.simulateSelectionSort([...inputData]);
      case 'insertion_sort': return this.simulateInsertionSort([...inputData]);
      case 'merge_sort': return this.simulateMergeSort([...inputData]);
      case 'quick_sort': return this.simulateQuickSort([...inputData]);
      case 'heap_sort': return this.simulateHeapSort([...inputData]);
      case 'counting_sort': return this.simulateCountingSort([...inputData]);
      case 'linear_search': return this.simulateLinearSearch([...inputData], target ?? inputData[Math.floor(Math.random() * inputData.length)]);
      case 'binary_search': return this.simulateBinarySearch([...inputData].sort((a, b) => a - b), target ?? inputData[Math.floor(Math.random() * inputData.length)]);
      case 'bfs_graph': return this.simulateBFS(graphData);
      case 'dfs_graph': return this.simulateDFS(graphData);
      case 'dijkstra': return this.simulateDijkstra(graphData);
      case 'inorder': return this.simulateInorder([...inputData], treeK);
      case 'preorder': return this.simulatePreorder([...inputData], treeK);
      case 'postorder': return this.simulatePostorder([...inputData], treeK);
      case 'levelorder': return this.simulateLevelOrder([...inputData], treeK);
      case 'stack_ops': return this.simulateStack([...inputData]);
      case 'queue_ops': return this.simulateQueue([...inputData]);
      case 'fibonacci_dp': return this.simulateFibonacciDP(10); // Hardcode n=10 for demo
      case 'knapsack_0_1': return this.simulateKnapsack01();
      case 'longest_common_subsequence': return this.simulateLCS();
      case 'edit_distance': return this.simulateEditDistance();
      case 'n_queens': return this.simulateNQueens();
      case 'sudoku_solver': return this.simulateSudoku();
      default:
        return [{ type: 'highlight', message: `No simulation available for "${algorithmType}".` }];
    }
  }

  // ==================== BUBBLE SORT ====================
  private static simulateBubbleSort(arr: number[]): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const n = arr.length;
    const s = [...arr];
    steps.push({ type: 'highlight', line_number: 0, message: `function bubbleSort(arr) — Starting with [${s.join(', ')}]` });
    steps.push({ type: 'highlight', line_number: 1, message: `n = ${n}` });
    for (let i = 0; i < n; i++) {
      steps.push({ type: 'highlight', line_number: 2, message: `Pass ${i + 1}: bubble largest to end` });
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({ type: 'compare', i: j, j: j + 1, line_number: 3, message: `Compare arr[${j}]=${s[j]} vs arr[${j + 1}]=${s[j + 1]}`, state: [...s] });
        if (s[j] > s[j + 1]) {
          steps.push({ type: 'swap', i: j, j: j + 1, line_number: 4, message: `${s[j]} > ${s[j + 1]} → Swap`, state: [...s] });
          [s[j], s[j + 1]] = [s[j + 1], s[j]];
          steps.push({ type: 'highlight', line_number: 4, message: `After swap: [${s.join(', ')}]`, state: [...s] });
        }
      }
      steps.push({ type: 'highlight', index: n - i - 1, line_number: 2, message: `Pass ${i + 1} complete. ${s[n - i - 1]} in sorted position.` });
    }
    steps.push({ type: 'highlight', line_number: 8, message: `✅ Array sorted: [${s.join(', ')}]` });
    return steps;
  }

  // ==================== SELECTION SORT ====================
  private static simulateSelectionSort(arr: number[]): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const n = arr.length; const s = [...arr];
    steps.push({ type: 'highlight', line_number: 0, message: `Selection Sort on [${s.join(', ')}]` });
    for (let i = 0; i < n - 1; i++) {
      let mi = i;
      steps.push({ type: 'highlight', index: mi, line_number: 2, message: `Find min in [${i}..${n - 1}]`, state: [...s] });
      for (let j = i + 1; j < n; j++) {
        steps.push({ type: 'compare', i: j, j: mi, line_number: 3, message: `Compare arr[${j}]=${s[j]} vs min arr[${mi}]=${s[mi]}`, state: [...s] });
        if (s[j] < s[mi]) { mi = j; steps.push({ type: 'highlight', index: mi, line_number: 4, message: `New min: arr[${mi}]=${s[mi]}`, state: [...s] }); }
      }
      if (mi !== i) {
        steps.push({ type: 'swap', i, j: mi, line_number: 6, message: `Swap arr[${i}]=${s[i]} ↔ arr[${mi}]=${s[mi]}`, state: [...s] });
        [s[i], s[mi]] = [s[mi], s[i]];
        steps.push({ type: 'highlight', line_number: 6, message: `[${s.join(', ')}]`, state: [...s] });
      }
    }
    steps.push({ type: 'highlight', line_number: 8, message: `✅ Array sorted: [${s.join(', ')}]` });
    return steps;
  }

  // ==================== INSERTION SORT ====================
  private static simulateInsertionSort(arr: number[]): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const n = arr.length; const s = [...arr];
    steps.push({ type: 'highlight', line_number: 0, message: `Insertion Sort on [${s.join(', ')}]` });
    for (let i = 1; i < n; i++) {
      const key = s[i];
      steps.push({ type: 'highlight', index: i, line_number: 1, message: `key = arr[${i}] = ${key}`, state: [...s] });
      let j = i - 1;
      while (j >= 0 && s[j] > key) {
        steps.push({ type: 'compare', i: j, j: i, line_number: 3, message: `arr[${j}]=${s[j]} > ${key} → shift right`, state: [...s] });
        s[j + 1] = s[j];
        steps.push({ type: 'set', index: j + 1, value: s[j], line_number: 4, message: `arr[${j + 1}] = ${s[j]}`, state: [...s] });
        j--;
      }
      s[j + 1] = key;
      steps.push({ type: 'set', index: j + 1, value: key, line_number: 5, message: `Insert key=${key} at [${j + 1}]. [${s.join(', ')}]`, state: [...s] });
    }
    steps.push({ type: 'highlight', line_number: 7, message: `✅ Array sorted: [${s.join(', ')}]` });
    return steps;
  }

  // ==================== MERGE SORT ====================
  private static simulateMergeSort(arr: number[]): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const s = [...arr];
    steps.push({ type: 'highlight', line_number: 0, message: `Merge Sort on [${s.join(', ')}]` });
    const merge = (a: number[], l: number, m: number, r: number) => {
      const L = a.slice(l, m + 1), R = a.slice(m + 1, r + 1);
      steps.push({ type: 'highlight', line_number: 3, message: `Merge left=[${L}] right=[${R}]`, state: [...a] });
      let i = 0, j = 0, k = l;
      while (i < L.length && j < R.length) {
        steps.push({ type: 'compare', i: l + i, j: m + 1 + j, line_number: 4, message: `${L[i]} vs ${R[j]}`, state: [...a] });
        if (L[i] <= R[j]) { a[k] = L[i]; i++; } else { a[k] = R[j]; j++; }
        steps.push({ type: 'set', index: k, value: a[k], line_number: 5, message: `Place ${a[k]} at [${k}]`, state: [...a] });
        k++;
      }
      while (i < L.length) { a[k] = L[i]; i++; k++; }
      while (j < R.length) { a[k] = R[j]; j++; k++; }
      steps.push({ type: 'highlight', line_number: 5, message: `Merged [${l}..${r}]: [${a.slice(l, r + 1)}]`, state: [...a] });
    };
    const sort = (a: number[], l: number, r: number) => {
      if (l >= r) return;
      const m = Math.floor((l + r) / 2);
      steps.push({ type: 'highlight', line_number: 1, message: `Divide [${l}..${r}] mid=${m}`, state: [...a] });
      sort(a, l, m); sort(a, m + 1, r); merge(a, l, m, r);
    };
    sort(s, 0, s.length - 1);
    steps.push({ type: 'highlight', line_number: 6, message: `✅ Array sorted: [${s.join(', ')}]` });
    return steps;
  }

  // ==================== QUICK SORT ====================
  private static simulateQuickSort(arr: number[]): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const s = [...arr];
    steps.push({ type: 'highlight', line_number: 0, message: `Quick Sort on [${s.join(', ')}]` });
    const partition = (a: number[], lo: number, hi: number): number => {
      const piv = a[hi];
      steps.push({ type: 'highlight', index: hi, line_number: 1, message: `Pivot = arr[${hi}] = ${piv}`, state: [...a] });
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        steps.push({ type: 'compare', i: j, j: hi, line_number: 2, message: `arr[${j}]=${a[j]} vs pivot=${piv}`, state: [...a] });
        if (a[j] < piv) {
          i++;
          steps.push({ type: 'swap', i, j, line_number: 3, message: `Swap arr[${i}]=${a[i]} ↔ arr[${j}]=${a[j]}`, state: [...a] });
          [a[i], a[j]] = [a[j], a[i]];
        }
      }
      steps.push({ type: 'swap', i: i + 1, j: hi, line_number: 4, message: `Place pivot at ${i + 1}`, state: [...a] });
      [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
      return i + 1;
    };
    const qs = (a: number[], lo: number, hi: number) => {
      if (lo < hi) { const p = partition(a, lo, hi); qs(a, lo, p - 1); qs(a, p + 1, hi); }
    };
    qs(s, 0, s.length - 1);
    steps.push({ type: 'highlight', line_number: 6, message: `✅ Array sorted: [${s.join(', ')}]` });
    return steps;
  }

  // ==================== HEAP SORT ====================
  private static simulateHeapSort(arr: number[]): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const s = [...arr]; const n = s.length;
    steps.push({ type: 'highlight', line_number: 0, message: `Heap Sort on [${s.join(', ')}]` });
    const heapify = (a: number[], sz: number, i: number) => {
      let lg = i; const l = 2 * i + 1, r = 2 * i + 2;
      if (l < sz && a[l] > a[lg]) { steps.push({ type: 'compare', i: l, j: lg, message: `${a[l]} > ${a[lg]}`, state: [...a] }); lg = l; }
      if (r < sz && a[r] > a[lg]) { steps.push({ type: 'compare', i: r, j: lg, message: `${a[r]} > ${a[lg]}`, state: [...a] }); lg = r; }
      if (lg !== i) {
        steps.push({ type: 'swap', i, j: lg, message: `Swap arr[${i}]=${a[i]} ↔ arr[${lg}]=${a[lg]}`, state: [...a] });
        [a[i], a[lg]] = [a[lg], a[i]];
        heapify(a, sz, lg);
      }
    };
    steps.push({ type: 'highlight', line_number: 1, message: `Building max-heap...` });
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(s, n, i);
    steps.push({ type: 'highlight', message: `Max heap: [${s.join(', ')}]`, state: [...s] });
    for (let i = n - 1; i > 0; i--) {
      steps.push({ type: 'swap', i: 0, j: i, message: `Extract max: swap arr[0]=${s[0]} ↔ arr[${i}]=${s[i]}`, state: [...s] });
      [s[0], s[i]] = [s[i], s[0]];
      heapify(s, i, 0);
    }
    steps.push({ type: 'highlight', message: `✅ Array sorted: [${s.join(', ')}]` });
    return steps;
  }

  // ==================== COUNTING SORT ====================
  private static simulateCountingSort(arr: number[]): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const s = [...arr];
    const max = Math.max(...s);
    steps.push({ type: 'highlight', line_number: 0, message: `Counting Sort on [${s.join(', ')}]. Max value = ${max}` });
    const count = new Array(max + 1).fill(0);
    for (let i = 0; i < s.length; i++) {
      count[s[i]]++;
      steps.push({ type: 'highlight', index: i, line_number: 1, message: `Count[${s[i]}]++ → Count = [${count.slice(0, max + 1).join(',')}]`, state: [...s] });
    }
    let idx = 0;
    for (let v = 0; v <= max; v++) {
      while (count[v] > 0) {
        s[idx] = v;
        steps.push({ type: 'set', index: idx, value: v, line_number: 3, message: `Place ${v} at index ${idx}`, state: [...s] });
        idx++; count[v]--;
      }
    }
    steps.push({ type: 'highlight', message: `✅ Array sorted: [${s.join(', ')}]` });
    return steps;
  }

  // ==================== LINEAR SEARCH ====================
  private static simulateLinearSearch(arr: number[], target: number): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    steps.push({ type: 'highlight', line_number: 0, message: `Linear Search for ${target} in [${arr.join(', ')}]` });
    for (let i = 0; i < arr.length; i++) {
      steps.push({ type: 'compare', index: i, line_number: 1, message: `Check [${i}]: ${arr[i]}`, state: [...arr] });
      if (arr[i] === target) {
        steps.push({ type: 'found', index: i, line_number: 2, message: `✅ Found ${target} at index ${i}!`, state: [...arr] });
        return steps;
      }
      steps.push({ type: 'highlight', index: i, line_number: 1, message: `${arr[i]} ≠ ${target}`, state: [...arr] });
    }
    steps.push({ type: 'highlight', line_number: 3, message: `❌ ${target} not found` });
    return steps;
  }

  // ==================== BINARY SEARCH ====================
  private static simulateBinarySearch(arr: number[], target: number): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    steps.push({ type: 'highlight', line_number: 0, message: `Binary Search for ${target} in [${arr.join(', ')}]` });
    let l = 0, r = arr.length - 1;
    while (l <= r) {
      const m = Math.floor((l + r) / 2);
      steps.push({ type: 'compare', index: m, line_number: 3, message: `low=${l} high=${r} mid=${m} → arr[${m}]=${arr[m]}`, state: { l, r, m, arr: [...arr] } });
      if (arr[m] === target) { steps.push({ type: 'found', index: m, line_number: 4, message: `✅ Found ${target} at [${m}]!`, state: { l, r, m, arr: [...arr] } }); return steps; }
      if (arr[m] < target) { steps.push({ type: 'highlight', line_number: 5, message: `${arr[m]} < ${target} → search right` }); l = m + 1; }
      else { steps.push({ type: 'highlight', line_number: 6, message: `${arr[m]} > ${target} → search left` }); r = m - 1; }
    }
    steps.push({ type: 'highlight', line_number: 7, message: `❌ ${target} not found` });
    return steps;
  }

  // ==================== BFS ====================
  private static simulateBFS(graphData: any): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const numNodes = graphData?.nodes || 5;
    const edges = graphData?.edges || [{ source: 0, target: 1 }, { source: 0, target: 2 }, { source: 1, target: 3 }, { source: 2, target: 4 }];
    
    // Build adjacency list
    const graph: number[][] = Array.from({ length: numNodes }, () => []);
    edges.forEach((e: any) => {
      graph[e.source].push(e.target);
      if (!e.directed) graph[e.target].push(e.source); // Assume undirected for standard BFS
    });

    const visited = new Set<number>(); const queue = [0]; visited.add(0);
    steps.push({ type: 'highlight', message: `BFS starting from node 0. Exploring level by level.` });
    steps.push({ type: 'enqueue', node: 0, message: `Enqueue 0. (Because it is the starting node)` });
    while (queue.length) {
      const nd = queue.shift()!;
      steps.push({ type: 'visit', node: nd, message: `Visit node ${nd}. (Because it is at the front of the queue)` });
      for (const nb of (graph[nd] || [])) {
        if (!visited.has(nb)) { 
          visited.add(nb); 
          queue.push(nb); 
          steps.push({ type: 'enqueue', node: nb, message: `Enqueue neighbor ${nb}. (Because it has not been visited yet)` }); 
        }
      }
      steps.push({ type: 'dequeue', node: nd, message: `Dequeue ${nd}. Remaining Queue: [${queue}]. (Node fully processed)` });
    }
    steps.push({ type: 'highlight', message: `✅ BFS complete. All connected nodes visited.` });
    return steps;
  }

  // ==================== DFS ====================
  private static simulateDFS(graphData: any): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const numNodes = graphData?.nodes || 5;
    const edges = graphData?.edges || [{ source: 0, target: 1 }, { source: 0, target: 2 }, { source: 1, target: 3 }, { source: 2, target: 4 }];
    
    // Build adjacency list
    const graph: number[][] = Array.from({ length: numNodes }, () => []);
    edges.forEach((e: any) => {
      graph[e.source].push(e.target);
      if (!e.directed) graph[e.target].push(e.source);
    });

    const visited = new Set<number>();
    steps.push({ type: 'highlight', message: `DFS starting from node 0. Exploring as deep as possible.` });
    const dfs = (n: number) => {
      visited.add(n); steps.push({ type: 'visit', node: n, message: `Visit ${n}. (Marking as visited)` });
      for (const nb of (graph[n] || [])) {
        if (!visited.has(nb)) { 
          steps.push({ type: 'highlight', message: `Explore unvisited neighbor ${nb} from ${n}. (Going deeper)` }); 
          dfs(nb); 
          steps.push({ type: 'highlight', message: `Backtrack to ${n}. (Finished exploring branch ${nb})` }); 
        }
      }
    };
    dfs(0);
    steps.push({ type: 'highlight', message: `✅ DFS complete. All paths exhausted.` });
    return steps;
  }

  // ==================== DIJKSTRA ====================
  private static simulateDijkstra(graphData: any): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const numNodes = graphData?.nodes || 5;
    const edges = graphData?.edges || [
      { source: 0, target: 1, weight: 4 }, { source: 0, target: 2, weight: 1 }, 
      { source: 1, target: 3, weight: 1 }, { source: 2, target: 1, weight: 2 }, { source: 2, target: 3, weight: 5 }
    ];
    
    const graph: { to: number; w: number }[][] = Array.from({ length: numNodes }, () => []);
    edges.forEach((e: any) => {
      graph[e.source].push({ to: e.target, w: e.weight || 1 });
      if (!e.directed) graph[e.target].push({ to: e.source, w: e.weight || 1 });
    });

    const dist = Array(numNodes).fill(Infinity); dist[0] = 0;
    const visited = new Set<number>();
    steps.push({ type: 'highlight', message: `Dijkstra from node 0. Initializing all distances to Infinity.` });

    for (let iter = 0; iter < numNodes; iter++) {
      let u = -1;
      for (let v = 0; v < numNodes; v++) { if (!visited.has(v) && (u === -1 || dist[v] < dist[u])) u = v; }
      if (u === -1 || dist[u] === Infinity) break;
      visited.add(u);
      steps.push({ type: 'visit', node: u, message: `Lock node ${u} (dist=${dist[u]}). (Because it has the minimum known distance)` });
      for (const { to, w } of graph[u]) {
        if (dist[u] + w < dist[to]) {
          dist[to] = dist[u] + w;
          steps.push({ type: 'highlight', node: to, message: `Relax edge ${u}→${to}: dist[${to}] updated to ${dist[to]}. (Because ${dist[u]} + ${w} < previous)` });
        }
      }
    }
    steps.push({ type: 'highlight', message: `✅ Dijkstra done. Shortest paths found.` });
    return steps;
  }

  // ==================== TREE TRAVERSALS ====================
  // Tree stored as array: node i has children at k*i+1 to k*i+k
  private static buildTreeFromArray(arr: number[]): number[] {
    return arr;
  }

  private static simulateInorder(data: any, treeK: number): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const tree = this.buildTreeFromArray(Array.isArray(data) ? data : [50, 30, 70, 20, 40, 60, 80]);
    steps.push({ type: 'highlight', message: `Inorder Traversal (${treeK}-ary Tree)` });
    const inorder = (i: number) => {
      if (i >= tree.length || tree[i] === undefined) return;
      
      const firstChild = treeK * i + 1;
      if (firstChild < tree.length && tree[firstChild] !== undefined) {
        steps.push({ type: 'highlight', message: `Explore child 1 of [${i}]` });
        inorder(firstChild);
      }
      
      steps.push({ type: 'visit', node: i, message: `Visit node [${i}] = ${tree[i]}.` });
      
      for (let c = 2; c <= treeK; c++) {
        const childIdx = treeK * i + c;
        if (childIdx < tree.length && tree[childIdx] !== undefined) {
          steps.push({ type: 'highlight', message: `Explore child ${c} of [${i}]` });
          inorder(childIdx);
        }
      }
    };
    inorder(0);
    steps.push({ type: 'highlight', message: `✅ Inorder traversal complete` });
    return steps;
  }

  private static simulatePreorder(data: any, treeK: number): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const tree = this.buildTreeFromArray(Array.isArray(data) ? data : [50, 30, 70, 20, 40, 60, 80]);
    steps.push({ type: 'highlight', message: `Preorder Traversal (${treeK}-ary Tree)` });
    const preorder = (i: number) => {
      if (i >= tree.length || tree[i] === undefined) return;
      steps.push({ type: 'visit', node: i, message: `Visit node [${i}] = ${tree[i]}. (Root before children)` });
      for (let c = 1; c <= treeK; c++) {
        const childIdx = treeK * i + c;
        if (childIdx < tree.length && tree[childIdx] !== undefined) {
          steps.push({ type: 'highlight', message: `Explore child ${c} of [${i}]` });
          preorder(childIdx);
        }
      }
    };
    preorder(0);
    steps.push({ type: 'highlight', message: `✅ Preorder traversal complete` });
    return steps;
  }

  private static simulatePostorder(data: any, treeK: number): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const tree = this.buildTreeFromArray(Array.isArray(data) ? data : [50, 30, 70, 20, 40, 60, 80]);
    steps.push({ type: 'highlight', message: `Postorder Traversal (${treeK}-ary Tree)` });
    const postorder = (i: number) => {
      if (i >= tree.length || tree[i] === undefined) return;
      for (let c = 1; c <= treeK; c++) {
        const childIdx = treeK * i + c;
        if (childIdx < tree.length && tree[childIdx] !== undefined) {
          steps.push({ type: 'highlight', message: `Explore child ${c} of [${i}]` });
          postorder(childIdx);
        }
      }
      steps.push({ type: 'visit', node: i, message: `Visit node [${i}] = ${tree[i]}. (Children finished)` });
    };
    postorder(0);
    steps.push({ type: 'highlight', message: `✅ Postorder traversal complete` });
    return steps;
  }

  private static simulateLevelOrder(data: any, treeK: number): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const tree = this.buildTreeFromArray(Array.isArray(data) ? data : [50, 30, 70, 20, 40, 60, 80]);
    steps.push({ type: 'highlight', message: `Level-Order BFS (${treeK}-ary Tree)` });
    const queue = [0];
    while (queue.length) {
      const i = queue.shift()!;
      if (i >= tree.length || tree[i] === undefined) continue;
      steps.push({ type: 'visit', node: i, message: `Visit node [${i}] = ${tree[i]}` });
      for (let c = 1; c <= treeK; c++) {
        const childIdx = treeK * i + c;
        if (childIdx < tree.length && tree[childIdx] !== undefined) {
          queue.push(childIdx);
          steps.push({ type: 'enqueue', node: childIdx, message: `Enqueue child ${c} [${childIdx}].` });
        }
      }
    }
    steps.push({ type: 'highlight', message: `✅ Level-order traversal complete` });
    return steps;
  }

  // ==================== STACK ====================
  private static simulateStack(data: number[]): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const stack: number[] = [];
    steps.push({ type: 'highlight', message: `Stack: push [${data.join(', ')}] then pop all` });
    for (const v of data) { stack.push(v); steps.push({ type: 'push', value: v, message: `Push ${v} → [${stack.join(', ')}]`, state: [...stack] }); }
    while (stack.length) { const v = stack.pop()!; steps.push({ type: 'pop', value: v, message: `Pop ${v} → [${stack.join(', ')}]`, state: [...stack] }); }
    steps.push({ type: 'highlight', message: `✅ Stack empty` });
    return steps;
  }

  // ==================== QUEUE ====================
  private static simulateQueue(data: number[]): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const queue: number[] = [];
    steps.push({ type: 'highlight', message: `Queue: enqueue [${data.join(', ')}] then dequeue all` });
    for (const v of data) { queue.push(v); steps.push({ type: 'enqueue', value: v, message: `Enqueue ${v} → [${queue.join(', ')}]`, state: [...queue] }); }
    while (queue.length) { const v = queue.shift()!; steps.push({ type: 'dequeue', value: v, message: `Dequeue ${v} → [${queue.join(', ')}]`, state: [...queue] }); }
    steps.push({ type: 'highlight', message: `✅ Queue empty` });
    return steps;
  }

  // ==================== DP & BACKTRACKING ====================

  private static simulateFibonacciDP(n: number): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const dp: (number|null)[][] = [Array(n + 1).fill(null)];
    steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), message: `Initialize DP array for Fibonacci up to ${n}` });
    dp[0][0] = 0;
    steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), index: 0, secondaryIndex: 0, message: `Base case: fib(0) = 0` });
    if (n > 0) {
      dp[0][1] = 1;
      steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), index: 0, secondaryIndex: 1, message: `Base case: fib(1) = 1` });
    }
    for (let i = 2; i <= n; i++) {
      steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), comparingRow: 0, comparingCol: i-1, message: `Read fib(${i-1})` });
      steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), comparingRow: 0, comparingCol: i-2, message: `Read fib(${i-2})` });
      dp[0][i] = (dp[0][i-1] as number) + (dp[0][i-2] as number);
      steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), index: 0, secondaryIndex: i, message: `fib(${i}) = fib(${i-1}) + fib(${i-2}) = ${dp[0][i]}` });
    }
    steps.push({ type: 'highlight', message: `✅ Fibonacci DP complete. Answer is ${dp[0][n]}` });
    return steps;
  }

  private static simulateKnapsack01(): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const weights = [2, 3, 4, 5];
    const values = [3, 4, 5, 6];
    const W = 5;
    const n = weights.length;
    const dp: (number|string|null)[][] = Array.from({length: n + 1}, () => Array(W + 1).fill(null));
    
    steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), message: `Initialize DP table. Rows=Items, Cols=Capacity (0 to ${W})` });
    for (let i = 0; i <= n; i++) {
      for (let w = 0; w <= W; w++) {
        if (i === 0 || w === 0) {
          dp[i][w] = 0;
          steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), index: i, secondaryIndex: w, message: `Base case: 0 capacity or 0 items = 0 value` });
        } else if (weights[i-1] <= w) {
          const include = (dp[i-1][w - weights[i-1]] as number) + values[i-1];
          const exclude = dp[i-1][w] as number;
          dp[i][w] = Math.max(include, exclude);
          steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), index: i, secondaryIndex: w, message: `Item ${i} (W:${weights[i-1]}, V:${values[i-1]}): max(include ${include}, exclude ${exclude}) = ${dp[i][w]}` });
        } else {
          dp[i][w] = dp[i-1][w];
          steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), index: i, secondaryIndex: w, message: `Item ${i} weight ${weights[i-1]} > capacity ${w}. Cannot include. Value = ${dp[i][w]}` });
        }
      }
    }
    steps.push({ type: 'highlight', message: `✅ 0/1 Knapsack complete. Max value is ${dp[n][W]}` });
    return steps;
  }

  private static simulateLCS(): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const s1 = "AGGTAB";
    const s2 = "GXTXAYB";
    const dp: (number|string|null)[][] = Array.from({length: s1.length + 1}, () => Array(s2.length + 1).fill(null));
    
    steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), message: `Finding LCS for "${s1}" and "${s2}"` });
    
    for (let i = 0; i <= s1.length; i++) {
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0 || j === 0) {
          dp[i][j] = 0;
          steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), index: i, secondaryIndex: j, message: `Base case: 0 length strings` });
        } else if (s1[i-1] === s2[j-1]) {
          dp[i][j] = (dp[i-1][j-1] as number) + 1;
          steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), index: i, secondaryIndex: j, message: `Match '${s1[i-1]}'! 1 + dp[${i-1}][${j-1}] = ${dp[i][j]}` });
        } else {
          dp[i][j] = Math.max(dp[i-1][j] as number, dp[i][j-1] as number);
          steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), index: i, secondaryIndex: j, message: `Mismatch. max(dp[${i-1}][${j}], dp[${i}][${j-1}]) = ${dp[i][j]}` });
        }
      }
    }
    steps.push({ type: 'highlight', message: `✅ LCS complete. Length is ${dp[s1.length][s2.length]}` });
    return steps;
  }

  private static simulateEditDistance(): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const s1 = "cat";
    const s2 = "cut";
    const dp: (number|string|null)[][] = Array.from({length: s1.length + 1}, () => Array(s2.length + 1).fill(null));
    
    steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), message: `Edit Distance between "${s1}" and "${s2}"` });
    
    for (let i = 0; i <= s1.length; i++) {
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          dp[i][j] = j;
          steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), index: i, secondaryIndex: j, message: `Insert all characters` });
        } else if (j === 0) {
          dp[i][j] = i;
          steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), index: i, secondaryIndex: j, message: `Remove all characters` });
        } else if (s1[i-1] === s2[j-1]) {
          dp[i][j] = dp[i-1][j-1];
          steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), index: i, secondaryIndex: j, message: `Match '${s1[i-1]}'. No operation needed.` });
        } else {
          dp[i][j] = 1 + Math.min(dp[i][j-1] as number, dp[i-1][j] as number, dp[i-1][j-1] as number);
          steps.push({ type: 'grid_update', gridState: dp.map(r => [...r]), index: i, secondaryIndex: j, message: `Mismatch. 1 + min(insert, remove, replace) = ${dp[i][j]}` });
        }
      }
    }
    steps.push({ type: 'highlight', message: `✅ Edit Distance is ${dp[s1.length][s2.length]}` });
    return steps;
  }

  private static simulateNQueens(): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const n = 4;
    const board: string[][] = Array.from({length: n}, () => Array(n).fill('.'));
    steps.push({ type: 'grid_update', gridState: board.map(r => [...r]), message: `Solving N-Queens for N=${n}` });

    const isSafe = (row: number, col: number) => {
      for (let i = 0; i < row; i++) if (board[i][col] === 'Q') return false;
      for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) if (board[i][j] === 'Q') return false;
      for (let i = row, j = col; i >= 0 && j < n; i--, j++) if (board[i][j] === 'Q') return false;
      return true;
    };

    let solved = false;
    const solve = (row: number) => {
      if (row >= n) { solved = true; return; }
      for (let col = 0; col < n; col++) {
        steps.push({ type: 'grid_update', gridState: board.map(r => [...r]), comparingRow: row, comparingCol: col, message: `Checking if Queen can be placed at (${row}, ${col})` });
        if (isSafe(row, col)) {
          board[row][col] = 'Q';
          steps.push({ type: 'grid_update', gridState: board.map(r => [...r]), index: row, secondaryIndex: col, message: `Placing Queen at (${row}, ${col})` });
          solve(row + 1);
          if (solved) return;
          board[row][col] = '.';
          steps.push({ type: 'grid_update', gridState: board.map(r => [...r]), index: row, secondaryIndex: col, message: `Backtracking from (${row}, ${col})` });
        }
      }
    };
    
    solve(0);
    steps.push({ type: 'highlight', message: `✅ N-Queens solved for N=${n}` });
    return steps;
  }

  private static simulateSudoku(): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    // 4x4 mini Sudoku for fast animation
    const board: string[][] = [
      ['1', '.', '.', '.'],
      ['.', '2', '.', '.'],
      ['.', '.', '3', '.'],
      ['.', '.', '.', '4']
    ];
    steps.push({ type: 'grid_update', gridState: board.map(r => [...r]), message: `Solving 4x4 Mini-Sudoku` });

    const isSafe = (row: number, col: number, num: string) => {
      for (let x = 0; x < 4; x++) if (board[row][x] === num) return false;
      for (let x = 0; x < 4; x++) if (board[x][col] === num) return false;
      const startRow = row - row % 2;
      const startCol = col - col % 2;
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          if (board[i + startRow][j + startCol] === num) return false;
        }
      }
      return true;
    };

    let solved = false;
    const solve = () => {
      let row = -1, col = -1;
      let isEmpty = true;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (board[i][j] === '.') {
            row = i; col = j; isEmpty = false; break;
          }
        }
        if (!isEmpty) break;
      }
      if (isEmpty) { solved = true; return; }

      for (let num = 1; num <= 4; num++) {
        const char = num.toString();
        steps.push({ type: 'grid_update', gridState: board.map(r => [...r]), comparingRow: row, comparingCol: col, message: `Checking if ${char} is safe at (${row}, ${col})` });
        if (isSafe(row, col, char)) {
          board[row][col] = char;
          steps.push({ type: 'grid_update', gridState: board.map(r => [...r]), index: row, secondaryIndex: col, message: `Placing ${char} at (${row}, ${col})` });
          solve();
          if (solved) return;
          board[row][col] = '.';
          steps.push({ type: 'grid_update', gridState: board.map(r => [...r]), index: row, secondaryIndex: col, message: `Backtracking from (${row}, ${col})` });
        }
      }
    };
    
    solve();
    steps.push({ type: 'highlight', message: `✅ Mini Sudoku Solved` });
    return steps;
  }

}
