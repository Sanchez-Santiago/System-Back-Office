#!/usr/bin/env node
/**
 * Builds the final index.html with:
 * - Stripped shared app header from every scene
 * - Cinematic scene labels instead of app header
 * - Fixed → absolute position fixes
 * - Clean layout containers
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function read(p) { return readFileSync(join(ROOT, p), 'utf-8'); }
function write(p, c) { writeFileSync(join(ROOT, p), c, 'utf-8'); }

// --- Scene configurations ---
const SCENES = [
  {
    id: 'gestion',
    label: 'Gestión Comercial',
    subtitle: 'Gestión de Ventas e Inspecciones',
    tag: 'Gestión',
    start: 4, duration: 22,
    file: 'gestion.html',
  },
  {
    id: 'seguimiento',
    label: 'Seguimiento',
    subtitle: 'Tracking de Operaciones',
    tag: 'Seguimiento',
    start: 26, duration: 18,
    file: 'seguimiento.html',
  },
  {
    id: 'reportes',
    label: 'Reportes & Analytics',
    subtitle: 'Inteligencia de Negocio',
    tag: 'Reportes',
    start: 44, duration: 16,
    file: 'reportes.html',
  },
  {
    id: 'ofertas',
    label: 'Ofertas',
    subtitle: 'Planes y Promociones',
    tag: 'Ofertas',
    start: 60, duration: 14,
    file: 'ofertas.html',
  },
  {
    id: 'aichat',
    label: 'Asistente IA',
    subtitle: 'Inteligencia Artificial Comercial',
    tag: 'AI Chat',
    start: 74, duration: 10,
    file: 'aichat.html',
  },
  {
    id: 'nomina',
    label: 'Nómina',
    subtitle: 'Gestión de Talento',
    tag: 'Nómina',
    start: 84, duration: 10,
    file: 'nomina.html',
  },
];

// Read captured content for each scene
function loadSceneContent(scene) {
  let html = read(`captured-dom/content/${scene.file}`);

  // Fix position:fixed → position:absolute within scene context
  html = html.replace(/\bfixed\b/g, 'absolute');

  // Remove the search/filter toolbar from gestion/aichat/nomina
  // since the tables are duplicated across pages — keep only the unique parts
  if (scene.id === 'aichat') {
    // For AI Chat, keep only the modal (it's the unique content)
    // The KPI + table content is same as gestion
    const modalStart = html.indexOf('<div class="absolute inset-0 z-[100]');
    if (modalStart > 0) {
      html = html.substring(modalStart);
    }
  } else if (scene.id === 'nomina') {
    const modalStart = html.indexOf('<div class="absolute inset-0 z-[110]');
    if (modalStart > 0) {
      html = html.substring(modalStart);
    }
  }

  // Remove empty fixed containers for notifications (now absolute)
  html = html.replace(/<div class="absolute top-\[12vh\] right-\[2vw\] z-\[1000\].*?<\/div>\s*/gs, '');

  return html;
}

// Cinematic scene label HTML
function sceneLabel(scene) {
  return `
    <div class="scene-title-bar" style="position:absolute;top:0;left:0;right:0;z-index:50;padding:1.5vh 2.5vw;background:linear-gradient(180deg,rgba(2,6,23,0.85) 0%,transparent 100%);pointer-events:none;">
      <div style="display:flex;align-items:center;gap:1.2vw;">
        <div style="width:4px;height:4vh;border-radius:2px;background:linear-gradient(180deg,#818cf8,#a855f7);"></div>
        <div>
          <div style="font-size:clamp(0.7rem,1.6vh,1.8rem);font-weight:900;letter-spacing:0.15em;text-transform:uppercase;background:linear-gradient(135deg,#818cf8,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${scene.tag}</div>
          <div style="font-size:clamp(0.9rem,2.2vh,2.8rem);font-weight:900;letter-spacing:-0.02em;color:white;line-height:1.1;">${scene.label}</div>
          <div style="font-size:clamp(0.55rem,1.1vh,1.2rem);font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:rgba(148,163,184,0.8);">${scene.subtitle}</div>
        </div>
      </div>
    </div>`;
}

// --- BUILD HTML ---

const HEAD = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1920, height=1080" />
  <title>FLOR HUB — Cinematic Experience</title>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <link rel="stylesheet" href="assets/compiled-app.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #020617; color: #f8fafc; }
    .scene { position: absolute; inset: 0; overflow: hidden; }
    .blob-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: -1; }
    .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.15; }
    .gradient-text { background: linear-gradient(135deg, #818cf8, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    /* Fix fixed → absolute positioning inside scenes */
    .scene [class*="absolute"] { position: absolute !important; }
    /* App content container - properly constrained within scene */
    .app-content { position: absolute; top: 8vh; left: 0; right: 0; bottom: 0; overflow: hidden; z-index: 10; }
    /* Override min-h-screen behavior */
    .app-content .min-h-screen { min-height: auto !important; height: 100%; }
    /* Make vh units work predictably in 1080p context */
    .app-content { --vh: 10.8px; }
    /* Hide elements that rely on JS interactivity */
    .app-content .group-hover\\:scale-\\[1\\.02\\] { transform: none !important; }
    /* Fix the recharts chart width */
    .recharts-wrapper { width: 100% !important; }
    /* Ensure scene title is above content */
    .scene-title-bar { z-index: 50; }
    /* Animation overrides for static content */
    .animate-in { opacity: 1 !important; transform: none !important; }
    /* Modal positioning fix within scene */
    .app-content .absolute.inset-0.z-\\[100\\]\\,.app-content .absolute.inset-0.z-\\[110\\] { position: absolute !important; }
  </style>
</head>
<body class="dark overflow-hidden">
<div id="root" data-composition-id="main" data-start="0" data-duration="100" data-width="1920" data-height="1080" data-fps="60">

  <!-- AUDIO TRACK -->
  <audio id="bg-music" src="assets/audio/synthwave-background.mp3" preload="auto" loop data-start="0" data-duration="100" data-volume="0.3" data-track-index="1"></audio>
`;

const INTRO_SCENE = `
  <!-- SCENE 0: INTRO (0 - 4s) -->
  <div id="scene-intro" class="clip scene" data-start="0" data-duration="4" data-track-index="0">
    <div class="blob-bg">
      <div class="blob" style="width:600px;height:600px;background:#4f46e5;top:-10%;left:-5%;"></div>
      <div class="blob" style="width:500px;height:500px;background:#a855f7;bottom:-15%;right:-10%;"></div>
      <div class="blob" style="width:400px;height:400px;background:#ec4899;top:40%;left:60%;"></div>
    </div>
    <div id="three-canvas-container" style="position:absolute;inset:0;z-index:1;"></div>
    <div style="position:relative;z-index:2;text-align:center;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <h1 id="intro-title" class="gradient-text text-[72px] font-black tracking-tighter mb-4 opacity-0">FLOR HUB</h1>
      <p id="intro-subtitle" class="text-[20px] font-light tracking-[0.15em] opacity-0 text-white/60 uppercase">Plataforma Inteligente de Gesti\u00f3n Comercial</p>
    </div>
  </div>
`;

function buildScene(scene) {
  const content = loadSceneContent(scene);
  return `
  <!-- SCENE ${scene.id.toUpperCase()} (${scene.start} - ${scene.start + scene.duration}s) -->
  <div id="scene-${scene.id}" class="clip scene" data-start="${scene.start}" data-duration="${scene.duration}" data-track-index="0">
    <div class="blob-bg">
      <div class="blob" style="width:500px;height:500px;background:#4f46e5;top:-10%;left:-5%;"></div>
      <div class="blob" style="width:400px;height:400px;background:#a855f7;bottom:-15%;right:-10%;"></div>
      <div class="blob" style="width:300px;height:300px;background:#ec4899;top:30%;left:60%;"></div>
    </div>
    ${sceneLabel(scene)}
    <div class="app-content">
      ${content}
    </div>
  </div>`;
}

const OUTRO_SCENE = `
  <!-- SCENE 7: OUTRO (94 - 100s) -->
  <div id="scene-outro" class="clip scene" data-start="94" data-duration="6" data-track-index="0">
    <div class="blob-bg"><div class="blob" style="width:800px;height:800px;background:#4f46e5;top:-20%;left:-10%;"></div><div class="blob" style="width:600px;height:600px;background:#a855f7;bottom:-20%;right:-10%;"></div></div>
    <div style="position:relative;z-index:2;text-align:center;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <div class="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-4xl font-black shadow-[0_0_60px_rgba(99,102,241,0.5)]">F</div>
      <h1 id="outro-title" class="text-[80px] font-black tracking-tighter mb-2 opacity-0">FLOR HUB</h1>
      <p id="outro-subtitle" class="text-[24px] font-light tracking-[0.2em] text-white/60 uppercase opacity-0">Sistema Operativo Comercial</p>
    </div>
  </div>
`;

const GSAP_SCRIPT = `
</div>

<script>
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });

// SCENE 1: INTRO
tl.fromTo("#intro-title", {opacity:0, y:50, filter:"blur(10px)"}, {opacity:1, y:0, filter:"blur(0px)", duration:1.5, ease:"power4.out"}, 0.5);
tl.fromTo("#intro-subtitle", {opacity:0, y:30, letterSpacing:"0em"}, {opacity:1, y:0, letterSpacing:"0.2em", duration:1.5, ease:"power3.out"}, 1.5);

// SCENE 1: GESTI\u00d3N
tl.fromTo("#scene-gestion", {opacity:0, scale:0.95}, {opacity:1, scale:1, duration:1, ease:"power3.out"}, 4);

// SCENE 2: SEGUIMIENTO
tl.fromTo("#scene-gestion", {opacity:1}, {opacity:0, duration:1}, 25);
tl.fromTo("#scene-seguimiento", {opacity:0, x:80}, {opacity:1, x:0, duration:1, ease:"power3.out"}, 26);

// SCENE 3: REPORTES
tl.fromTo("#scene-seguimiento", {opacity:1}, {opacity:0, duration:1}, 43);
tl.fromTo("#scene-reportes", {opacity:0, y:50}, {opacity:1, y:0, duration:1, ease:"power3.out"}, 44);

// SCENE 4: OFERTAS
tl.fromTo("#scene-reportes", {opacity:1}, {opacity:0, duration:1}, 59);
tl.fromTo("#scene-ofertas", {opacity:0, scale:1.05}, {opacity:1, scale:1, duration:1, ease:"power3.out"}, 60);

// SCENE 5: AI CHAT
tl.fromTo("#scene-ofertas", {opacity:1}, {opacity:0, duration:1}, 73);
tl.fromTo("#scene-aichat", {opacity:0, x:-50}, {opacity:1, x:0, duration:1, ease:"power3.out"}, 74);

// SCENE 6: NOMINA + NOTIF
tl.fromTo("#scene-aichat", {opacity:1}, {opacity:0, duration:1}, 83);
tl.fromTo("#scene-nomina", {opacity:0, scale:0.9}, {opacity:1, scale:1, duration:1, ease:"power3.out"}, 84);

// SCENE 7: OUTRO
tl.fromTo("#scene-nomina", {opacity:1}, {opacity:0, duration:1}, 93);
tl.fromTo("#scene-outro", {opacity:0}, {opacity:1, duration:1.5}, 94);
tl.fromTo("#outro-title", {opacity:0, y:40, scale:0.8, filter:"blur(10px)"}, {opacity:1, y:0, scale:1, filter:"blur(0px)", duration:2, ease:"power4.out"}, 95);
tl.fromTo("#outro-subtitle", {opacity:0, y:20}, {opacity:1, y:0, duration:1.5, ease:"power3.out"}, 96.5);

window.__timelines["main"] = tl;

// THREE.JS
(function initThreeJs() {
  const root = document.getElementById('root');
  const container = document.getElementById('three-canvas-container');
  if(!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1920/1080, 1, 20);
  camera.position.z = 8;
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(1920, 1080);
  container.appendChild(renderer.domElement);

  function mulberry32(a) { return function() { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; } }
  const rng = mulberry32(42);
  const bgGeo = new THREE.BufferGeometry();
  const bgCount = 500;
  const positions = new Float32Array(bgCount * 3);
  for (let i = 0; i < bgCount * 3; i++) { positions[i] = (rng() - 0.5) * 20; }
  bgGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const bgMat = new THREE.PointsMaterial({ color: 0x818cf8, size: 0.05, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
  const bgParticles = new THREE.Points(bgGeo, bgMat);
  scene.add(bgParticles);

  root.addEventListener('hf-seek', function(e) {
    const time = e.detail.time;
    bgParticles.rotation.y = time * 0.05;
    bgParticles.rotation.x = Math.sin(time * 0.02) * 0.1;
    renderer.render(scene, camera);
  });
})();
<\/script>
<\/body>
<\/html>`;

// --- Assemble ---
const scenes = SCENES.map(s => buildScene(s)).join('\n');

const fullHtml = HEAD + '\n' + INTRO_SCENE + '\n' + scenes + '\n' + OUTRO_SCENE + '\n' + GSAP_SCRIPT;

write('index.html', fullHtml);

// Stats
const lineCount = fullHtml.split('\n').length;
const sizeKb = (Buffer.byteLength(fullHtml, 'utf-8') / 1024).toFixed(1);
console.log(`✅ index.html rebuilt: ${lineCount} lines, ${sizeKb} KB`);
console.log(`   Scenes: intro + ${SCENES.length} app scenes + outro`);
