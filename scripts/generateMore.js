import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALGORITHMS = [
  'counting_sort',
  'dijkstra',
  'inorder',
  'preorder',
  'postorder',
  'levelorder',
];

const LANGUAGES = ['c', 'cpp', 'java', 'python', 'js'];

const BASE_DIR = path.join(__dirname, '../src/engine/code_templates');

ALGORITHMS.forEach((algo) => {
  const algoDir = path.join(BASE_DIR, algo);
  if (!fs.existsSync(algoDir)) {
    fs.mkdirSync(algoDir, { recursive: true });
  }

  LANGUAGES.forEach((lang) => {
    const filePath = path.join(algoDir, `${lang}.json`);
    const content = {
      code: `// Implementation of ${algo} in ${lang}\n// Coming soon...`,
      time_complexity: 'O(N)',
      space_complexity: 'O(N)',
      description: `Description for ${algo}`
    };

    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  });
});

console.log('Successfully generated more templates!');
