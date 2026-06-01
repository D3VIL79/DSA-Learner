import fs from 'fs';
import path from 'path';

const algorithms = {
  bubble_sort: {
    complexity: { time: "O(n^2)", space: "O(1)" },
    steps: ["Outer loop", "Inner loop", "Compare adjacent", "Swap"],
    codes: {
      python: "def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr",
      cpp: "void bubbleSort(int arr[], int n) {\n    for (int i = 0; i < n - 1; i++) {\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                swap(arr[j], arr[j+1]);\n            }\n        }\n    }\n}",
      java: "class BubbleSort {\n    void bubbleSort(int arr[]) {\n        int n = arr.length;\n        for (int i = 0; i < n-1; i++)\n            for (int j = 0; j < n-i-1; j++)\n                if (arr[j] > arr[j+1]) {\n                    int temp = arr[j];\n                    arr[j] = arr[j+1];\n                    arr[j+1] = temp;\n                }\n    }\n}",
      c: "void bubbleSort(int arr[], int n) {\n    int i, j, temp;\n    for (i = 0; i < n-1; i++) {\n        for (j = 0; j < n-i-1; j++) {\n            if (arr[j] > arr[j+1]) {\n                temp = arr[j];\n                arr[j] = arr[j+1];\n                arr[j+1] = temp;\n            }\n        }\n    }\n}",
      js: "function bubbleSort(arr) {\n    let n = arr.length;\n    for (let i = 0; i < n; i++) {\n        for (let j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n            }\n        }\n    }\n    return arr;\n}"
    }
  },
  merge_sort: {
    complexity: { time: "O(n log n)", space: "O(n)" },
    steps: ["Divide array in half", "Recursively sort halves", "Merge sorted halves"],
    codes: {
      python: "def merge_sort(arr):\n    if len(arr) > 1:\n        mid = len(arr) // 2\n        L = arr[:mid]\n        R = arr[mid:]\n        merge_sort(L)\n        merge_sort(R)\n        # Merge L and R back into arr...",
      cpp: "void mergeSort(int arr[], int l, int r) {\n    if (l >= r) return;\n    int m = l + (r - l) / 2;\n    mergeSort(arr, l, m);\n    mergeSort(arr, m + 1, r);\n    merge(arr, l, m, r);\n}",
      java: "class MergeSort {\n    void sort(int arr[], int l, int r) {\n        if (l < r) {\n            int m = l + (r - l) / 2;\n            sort(arr, l, m);\n            sort(arr, m + 1, r);\n            merge(arr, l, m, r);\n        }\n    }\n}",
      c: "void mergeSort(int arr[], int l, int r) {\n    if (l < r) {\n        int m = l + (r - l) / 2;\n        mergeSort(arr, l, m);\n        mergeSort(arr, m + 1, r);\n        merge(arr, l, m, r);\n    }\n}",
      js: "function mergeSort(arr) {\n    if (arr.length <= 1) return arr;\n    const mid = Math.floor(arr.length / 2);\n    const left = mergeSort(arr.slice(0, mid));\n    const right = mergeSort(arr.slice(mid));\n    return merge(left, right);\n}"
    }
  },
  quick_sort: {
    complexity: { time: "O(n log n)", space: "O(log n)" },
    steps: ["Choose pivot", "Partition array around pivot", "Recursively sort sub-arrays"],
    codes: {
      python: "def quick_sort(arr, low, high):\n    if low < high:\n        pi = partition(arr, low, high)\n        quick_sort(arr, low, pi - 1)\n        quick_sort(arr, pi + 1, high)",
      cpp: "void quickSort(int arr[], int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}",
      java: "class QuickSort {\n    void sort(int arr[], int low, int high) {\n        if (low < high) {\n            int pi = partition(arr, low, high);\n            sort(arr, low, pi-1);\n            sort(arr, pi+1, high);\n        }\n    }\n}",
      c: "void quickSort(int arr[], int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}",
      js: "function quickSort(arr, low = 0, high = arr.length - 1) {\n    if (low < high) {\n        let pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n    return arr;\n}"
    }
  },
  binary_search: {
    complexity: { time: "O(log n)", space: "O(1)" },
    steps: ["Find middle element", "Compare with target", "Narrow search space"],
    codes: {
      python: "def binary_search(arr, x):\n    low = 0\n    high = len(arr) - 1\n    while low <= high:\n        mid = (high + low) // 2\n        if arr[mid] < x:\n            low = mid + 1\n        elif arr[mid] > x:\n            high = mid - 1\n        else:\n            return mid\n    return -1",
      cpp: "int binarySearch(int arr[], int l, int r, int x) {\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (arr[m] == x) return m;\n        if (arr[m] < x) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}",
      java: "class BinarySearch {\n    int binarySearch(int arr[], int x) {\n        int l = 0, r = arr.length - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (arr[m] == x) return m;\n            if (arr[m] < x) l = m + 1;\n            else r = m - 1;\n        }\n        return -1;\n    }\n}",
      c: "int binarySearch(int arr[], int l, int r, int x) {\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (arr[m] == x) return m;\n        if (arr[m] < x) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}",
      js: "function binarySearch(arr, x) {\n    let l = 0, r = arr.length - 1;\n    while (l <= r) {\n        let m = Math.floor((l + r) / 2);\n        if (arr[m] === x) return m;\n        if (arr[m] < x) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}"
    }
  },
  bfs_graph: {
    complexity: { time: "O(V + E)", space: "O(V)" },
    steps: ["Enqueue start node", "Dequeue node", "Process node", "Enqueue unvisited neighbors"],
    codes: {
      python: "def bfs(graph, start):\n    visited = set()\n    queue = [start]\n    visited.add(start)\n    while queue:\n        node = queue.pop(0)\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)",
      cpp: "void BFS(int s, vector<vector<int>>& adj) {\n    vector<bool> visited(adj.size(), false);\n    queue<int> q;\n    visited[s] = true;\n    q.push(s);\n    while (!q.empty()) {\n        int u = q.front();\n        q.pop();\n        for (int v : adj[u]) {\n            if (!visited[v]) {\n                visited[v] = true;\n                q.push(v);\n            }\n        }\n    }\n}",
      java: "void BFS(int s, LinkedList<Integer> adj[]) {\n    boolean visited[] = new boolean[adj.length];\n    LinkedList<Integer> queue = new LinkedList<Integer>();\n    visited[s] = true;\n    queue.add(s);\n    while (queue.size() != 0) {\n        s = queue.poll();\n        Iterator<Integer> i = adj[s].listIterator();\n        while (i.hasNext()) {\n            int n = i.next();\n            if (!visited[n]) {\n                visited[n] = true;\n                queue.add(n);\n            }\n        }\n    }\n}",
      c: "void BFS(int start, int n, int adj[][100]) {\n    int visited[100] = {0};\n    int queue[100], front = 0, rear = 0;\n    visited[start] = 1;\n    queue[rear++] = start;\n    while (front < rear) {\n        int u = queue[front++];\n        for (int v = 0; v < n; v++) {\n            if (adj[u][v] == 1 && !visited[v]) {\n                visited[v] = 1;\n                queue[rear++] = v;\n            }\n        }\n    }\n}",
      js: "function BFS(graph, start) {\n    let visited = new Set();\n    let queue = [start];\n    visited.add(start);\n    while (queue.length > 0) {\n        let node = queue.shift();\n        for (let neighbor of graph[node]) {\n            if (!visited.has(neighbor)) {\n                visited.add(neighbor);\n                queue.push(neighbor);\n            }\n        }\n    }\n}"
    }
  },
  dfs_graph: {
    complexity: { time: "O(V + E)", space: "O(V)" },
    steps: ["Visit current node", "Mark as visited", "Recursively visit unvisited neighbors"],
    codes: {
      python: "def dfs(graph, node, visited=None):\n    if visited is None:\n        visited = set()\n    visited.add(node)\n    for neighbor in graph[node]:\n        if neighbor not in visited:\n            dfs(graph, neighbor, visited)",
      cpp: "void DFSUtil(int v, vector<bool>& visited, vector<vector<int>>& adj) {\n    visited[v] = true;\n    for (int u : adj[v]) {\n        if (!visited[u])\n            DFSUtil(u, visited, adj);\n    }\n}\nvoid DFS(int v, vector<vector<int>>& adj) {\n    vector<bool> visited(adj.size(), false);\n    DFSUtil(v, visited, adj);\n}",
      java: "void DFSUtil(int v, boolean visited[], LinkedList<Integer> adj[]) {\n    visited[v] = true;\n    Iterator<Integer> i = adj[v].listIterator();\n    while (i.hasNext()) {\n        int n = i.next();\n        if (!visited[n])\n            DFSUtil(n, visited, adj);\n    }\n}",
      c: "void DFS(int v, int n, int adj[][100], int visited[]) {\n    visited[v] = 1;\n    for (int u = 0; u < n; u++) {\n        if (adj[v][u] == 1 && !visited[u]) {\n            DFS(u, n, adj, visited);\n        }\n    }\n}",
      js: "function DFS(graph, node, visited = new Set()) {\n    visited.add(node);\n    for (let neighbor of graph[node]) {\n        if (!visited.has(neighbor)) {\n            DFS(graph, neighbor, visited);\n        }\n    }\n}"
    }
  }
};

const baseDir = path.join(process.cwd(), 'src/engine/code_templates');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

Object.keys(algorithms).forEach((algo) => {
  const algoDir = path.join(baseDir, algo);
  if (!fs.existsSync(algoDir)) {
    fs.mkdirSync(algoDir);
  }

  const { complexity, steps, codes } = algorithms[algo];

  Object.keys(codes).forEach((lang) => {
    const filePath = path.join(algoDir, `${lang}.json`);
    const data = {
      language: lang,
      code: codes[lang],
      time_complexity: complexity.time,
      space_complexity: complexity.space,
      steps_logic: steps
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  });
});

console.log('Templates generated successfully!');
