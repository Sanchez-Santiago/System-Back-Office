import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SRC = join(import.meta.dirname, '..', 'captured-dom');
const OUT = join(import.meta.dirname, '..', 'compositions');

mkdirSync(OUT, { recursive: true });

function read(name) {
  return readFileSync(join(SRC, `${name}.html`), 'utf-8');
}

// Find line index of first occurrence of marker
function findLine(lines, marker, start = 0) {
  for (let i = start; i < lines.length; i++) {
    if (lines[i].includes(marker)) return i;
  }
  return -1;
}

function extractLines(html, startMarker, endTag, startOffset = 0) {
  const lines = html.split('\n');
  const start = findLine(lines, startMarker);
  if (start === -1) { console.error(`  marker '${startMarker}' not found`); return ''; }
  let end = -1;
  if (endTag) {
    let depth = 1;
    for (let i = start + 1; i < lines.length; i++) {
      const openCount = (lines[i].match(/<[^/!]/g) || []).length;
      const closeCount = (lines[i].match(/<\//g) || []).length;
      depth += openCount - closeCount;
      if (depth <= 0) { end = i; break; }
    }
    if (end === -1) { console.error(`  unbalanced endTag '${endTag}'`); return ''; }
  }
  return lines.slice(start + startOffset, end !== -1 ? end + 1 : undefined).join('\n');
}

function makeComposition(name, bodyHTML, start, duration) {
  const extraCSS = `<link rel="stylesheet" href="assets/compiled-app.css">`;
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1920, height=1080">
<title>Flor Hub - ${name}</title>
${extraCSS}
</head>
<body class="dark">
<div id="root" data-composition-id="${name}" data-start="${start}" data-duration="${duration}" data-width="1920" data-height="1080" data-fps="60">
<div class="clip scene" data-start="0" data-duration="${duration}" data-track-index="0" style="position:absolute;inset:0;overflow:hidden;">
${bodyHTML}
</div>
</div>
</body>
</html>`;
}

// =========== Process each capture ===========

// --- HEADER ---
const headerHTML = read('header');
writeFileSync(join(OUT, 'header.html'), makeComposition('header', headerHTML, 0, 0));
console.log('compositions/header.html');

// --- GESTIÓN (full page) ---
const gestionHTML = read('gestion');
writeFileSync(join(OUT, 'gestion.html'), makeComposition('gestion', gestionHTML, 12, 23));
console.log('compositions/gestion.html');

// --- SEGUIMIENTO ---
const segHTML = read('seguimiento');
writeFileSync(join(OUT, 'seguimiento.html'), makeComposition('seguimiento', segHTML, 35, 20));
console.log('compositions/seguimiento.html');

// --- REPORTES ---
const repHTML = read('reportes');
writeFileSync(join(OUT, 'reportes.html'), makeComposition('reportes', repHTML, 55, 20));
console.log('compositions/reportes.html');

// --- OFERTAS ---
const ofeHTML = read('ofertas');
writeFileSync(join(OUT, 'ofertas.html'), makeComposition('ofertas', ofeHTML, 75, 15));
console.log('compositions/ofertas.html');

// --- For modals, extract just the modal overlay from full-page captures ---
function extractModalContent(html) {
  // Find fixed overlay elements that are modals (z-40, z-50 etc.)
  const lines = html.split('\n');
  let result = [];

  // Find all fixed backdrop/modal overlays
  // Look for patterns like: z-40 (backdrop) followed by z-50 (modal)
  let inBackdrop = false;
  let backdropDepth = 0;
  let modalContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Modal backdrop (the overlay that appears behind modals)
    if (line.includes('fixed inset-0 z-40') || line.includes('fixed inset-0 z-[60]')) {
      inBackdrop = true;
      backdropDepth = 0;
      modalContent = [line];
      continue;
    }

    if (inBackdrop) {
      modalContent.push(line);
      const opens = (line.match(/<div[^>]*>/g) || []).length;
      const closes = (line.match(/<\/div>/g) || []).length;
      backdropDepth += opens - closes;

      if (backdropDepth <= 0 && line.includes('</div>')) {
        inBackdrop = false;
        result.push(modalContent.join('\n'));
        modalContent = [];
      }
    }
  }

  return result.join('\n');
}

// --- AI CHAT ---
const aiHTML = read('aichat');
const aiModal = extractModalContent(aiHTML) || aiHTML;
writeFileSync(join(OUT, 'aichat.html'), makeComposition('aichat', aiModal, 90, 15));
console.log('compositions/aichat.html');

// --- NOTIFICATIONS ---
const notifHTML = read('notifications');
const notifModal = extractModalContent(notifHTML) || notifHTML;
writeFileSync(join(OUT, 'notifications.html'), makeComposition('notifications', notifModal, 105, 6));
console.log('compositions/notifications.html');

// --- NÓMINA ---
const nomHTML = read('nomina');
const nomModal = extractModalContent(nomHTML) || nomHTML;
writeFileSync(join(OUT, 'nomina.html'), makeComposition('nomina', nomModal, 111, 14));
console.log('compositions/nomina.html');

// --- Write a header-only snippet for the main index.html ---
// Extract just the header element from the header capture
const headerLines = headerHTML.split('\n');
const headerStart = findLine(headerLines, '<header');
let headerEnd = -1;
let depth = 0;
for (let i = headerStart; i < headerLines.length; i++) {
  const opens = (headerLines[i].match(/<header|<nav|<div[^>]*>/g) || []).length;
  const closes = (headerLines[i].match(/<\/(header|nav|div)>/g) || []).length;
  depth += opens - closes;
  if (depth <= 0 && headerLines[i].includes('</header>')) { headerEnd = i; break; }
}
if (headerStart !== -1 && headerEnd !== -1) {
  const headerOnly = headerLines.slice(headerStart, headerEnd + 1).join('\n');
  writeFileSync(join(OUT, 'header-fragment.html'), headerOnly);
  console.log('compositions/header-fragment.html');
}

console.log('\nDone!');
