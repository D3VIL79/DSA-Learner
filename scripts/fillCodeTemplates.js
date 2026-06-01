import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES = {
  inorder: {
    code: `function inorder(node) {
  if (node === null) return;
  inorder(node.left);
  console.log(node.value);
  inorder(node.right);
}`,
    time_complexity: "O(N)",
    space_complexity: "O(H)"
  },
  preorder: {
    code: `function preorder(node) {
  if (node === null) return;
  console.log(node.value);
  preorder(node.left);
  preorder(node.right);
}`,
    time_complexity: "O(N)",
    space_complexity: "O(H)"
  },
  postorder: {
    code: `function postorder(node) {
  if (node === null) return;
  postorder(node.left);
  postorder(node.right);
  console.log(node.value);
}`,
    time_complexity: "O(N)",
    space_complexity: "O(H)"
  },
  levelorder: {
    code: `function levelorder(root) {
  if (!root) return;
  let queue = [root];
  while (queue.length > 0) {
    let curr = queue.shift();
    console.log(curr.value);
    if (curr.left) queue.push(curr.left);
    if (curr.right) queue.push(curr.right);
  }
}`,
    time_complexity: "O(N)",
    space_complexity: "O(W)"
  },
  dijkstra: {
    code: `function dijkstra(graph, start) {
  let dist = {};
  let pq = [{ node: start, dist: 0 }];
  
  for (let node in graph) dist[node] = Infinity;
  dist[start] = 0;
  
  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    let { node, dist: currentDist } = pq.shift();
    
    if (currentDist > dist[node]) continue;
    
    for (let neighbor in graph[node]) {
      let weight = graph[node][neighbor];
      let newDist = dist[node] + weight;
      
      if (newDist < dist[neighbor]) {
        dist[neighbor] = newDist;
        pq.push({ node: neighbor, dist: newDist });
      }
    }
  }
  return dist;
}`,
    time_complexity: "O((V + E) log V)",
    space_complexity: "O(V)"
  },
  counting_sort: {
    code: `function countingSort(arr) {
  if (arr.length === 0) return arr;
  let max = Math.max(...arr);
  let count = new Array(max + 1).fill(0);
  
  for (let i = 0; i < arr.length; i++) {
    count[arr[i]]++;
  }
  
  let sortedIndex = 0;
  for (let i = 0; i <= max; i++) {
    while (count[i] > 0) {
      arr[sortedIndex] = i;
      sortedIndex++;
      count[i]--;
    }
  }
  return arr;
}`,
    time_complexity: "O(N + K)",
    space_complexity: "O(K)"
  }
};

const BASE_DIR = path.join(__dirname, '../src/engine/code_templates');
const LANGUAGES = ['js', 'python', 'java', 'cpp', 'c']; // Applying JS to all for now to prevent crashes

Object.keys(TEMPLATES).forEach(algo => {
  const algoDir = path.join(BASE_DIR, algo);
  if (!fs.existsSync(algoDir)) fs.mkdirSync(algoDir, { recursive: true });

  LANGUAGES.forEach(lang => {
    const filePath = path.join(algoDir, `${lang}.json`);
    const content = {
      language: lang,
      code: TEMPLATES[algo].code,
      time_complexity: TEMPLATES[algo].time_complexity,
      space_complexity: TEMPLATES[algo].space_complexity,
      steps_logic: []
    };
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  });
});
console.log('Code templates filled!');
