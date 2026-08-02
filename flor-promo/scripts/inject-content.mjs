import { readFileSync, writeFileSync } from 'fs';

const idx = readFileSync('index.html', 'utf-8');
const cap = (name) => readFileSync(`captured-dom/${name}.html`, 'utf-8');

const replacements = {
  CONTENT_GESTION: cap('gestion'),
  CONTENT_SEGUIMIENTO: cap('seguimiento'),
  CONTENT_REPORTES: cap('reportes'),
  CONTENT_OFERTAS: cap('ofertas'),
  CONTENT_AICHAT: cap('aichat'),
  CONTENT_NOMINA: cap('nomina'),
};

let result = idx;
for (const [placeholder, content] of Object.entries(replacements)) {
  result = result.replace(placeholder, content);
}

writeFileSync('index.html', result);
console.log('index.html written');
console.log(`Size: ${result.length} chars`);

// Check placeholders remaining
const remaining = result.match(/CONTENT_[A-Z_]+/g);
if (remaining) console.log(`Unresolved placeholders: ${remaining}`);
else console.log('All placeholders resolved ✓');
