#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const keywords = [
  'API_KEY',
  'process.env',
  'dangerouslySetInnerHTML',
  'eval(',
  'crypto.',
  'localStorage',
];

const results = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'landingbuilder-ai') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!fullPath.endsWith('.ts') && !fullPath.endsWith('.tsx') && !fullPath.endsWith('.js') && !fullPath.endsWith('.jsx')) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    keywords.forEach((keyword) => {
      if (content.includes(keyword)) {
        results.push({ file: path.relative(root, fullPath), keyword });
      }
    });
  }
}

walk(root);

console.log('Segurança audit scan:\n');
if (!results.length) {
  console.log('Nenhuma ocorrência suspeita detectada.');
  process.exit(0);
}
results.forEach((item) => {
  console.log(`- ${item.file}: contém "${item.keyword}" (avalie se é seguro).`);
});
process.exit(0);
