import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';
import { join } from 'path';

const URL = 'http://localhost:4173';
const OUT = join(import.meta.dirname, '..', 'captured-dom');

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36');

await page.evaluateOnNewDocument(() => {
  localStorage.setItem('theme', 'dark');
  localStorage.setItem('themeStyle', 'modern');
  localStorage.setItem('inspectionMode', 'true');
});

console.log('Loading app...');
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
await page.waitForSelector('header', { timeout: 15000 });
await new Promise(r => setTimeout(r, 4000));

function savePretty(name, html) {
  const pretty = html
    .replace(/>(\s*)</g, '>\n<')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l)
    .join('\n');
  writeFileSync(join(OUT, name), pretty);
  console.log(`  ${name} (${pretty.length} chars)`);
}

async function clickTab(tab) {
  await page.evaluate((t) => {
    const nav = document.querySelector('nav');
    if (!nav) return;
    const btns = nav.querySelectorAll('button');
    for (const btn of btns) {
      if (btn.textContent.trim() === t) { btn.click(); return; }
    }
  }, tab);
  await new Promise(r => setTimeout(r, 3000));
  try { await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 8000 }); } catch {}
  await new Promise(r => setTimeout(r, 1500));
}

async function captureView(name) {
  const html = await page.evaluate(() => document.getElementById('root')?.innerHTML || '');
  savePretty(`${name}.html`, html);
  await page.screenshot({ path: join(OUT, `${name}.png`) });
}

// === HEADER ===
console.log('\n--- Header ---');
const headerHTML = await page.evaluate(() => {
  const h = document.querySelector('header');
  return h ? h.outerHTML : '';
});
savePretty('header.html', headerHTML);

// === GESTIÓN ===
console.log('\n--- GESTIÓN ---');
await clickTab('GESTIÓN');
await captureView('gestion');

// === SEGUIMIENTO ===
console.log('\n--- SEGUIMIENTO ---');
await clickTab('SEGUIMIENTO');
await captureView('seguimiento');

// === REPORTES ===
console.log('\n--- REPORTES ---');
await clickTab('REPORTES');
await captureView('reportes');

// === OFERTAS ===
console.log('\n--- OFERTAS ---');
await clickTab('OFERTAS');
await captureView('ofertas');

// === AI CHAT MODAL (from GESTIÓN) ===
console.log('\n--- AI Chat Modal ---');
await clickTab('GESTIÓN');

// Click the AI Chat FAB (fixed bottom-right button)
await page.evaluate(() => {
  const fab = document.querySelector('[title="Chat con IA"]');
  if (fab) fab.click();
});
await new Promise(r => setTimeout(r, 2000));
await captureView('aichat');

// Close AI Chat
await page.keyboard.press('Escape');
await new Promise(r => setTimeout(r, 500));

// === NOTIFICATION CENTER ===
console.log('\n--- Notification Center ---');
await page.evaluate(() => {
  // Find the bell button by its SVG path
  const btns = document.querySelectorAll('header button');
  for (const btn of btns) {
    const svg = btn.querySelector('svg');
    if (svg && svg.innerHTML.includes('M15 17h5')) {
      btn.click();
      return;
    }
  }
});
await new Promise(r => setTimeout(r, 2000));
await captureView('notifications');

// Close notifications
await page.keyboard.press('Escape');
await new Promise(r => setTimeout(r, 500));

// === NÓMINA MODAL ===
console.log('\n--- Nómina Modal ---');

// Click avatar to open profile menu
await page.evaluate(() => {
  const imgs = document.querySelectorAll('header img[alt="Avatar"]');
  if (imgs.length > 0) {
    imgs[0].parentElement?.parentElement?.click?.();
  } else {
    // Fallback: find the profile button area
    const profileArea = document.querySelector('.cursor-pointer.group .text-right');
    if (profileArea) profileArea.parentElement?.click?.();
  }
});
await new Promise(r => setTimeout(r, 1000));

// Click Nómina in profile menu
const nominaClicked = await page.evaluate(() => {
  const allEls = document.querySelectorAll('*');
  for (const el of allEls) {
    if (el.textContent?.includes('Nómina Vendedores') && el.tagName === 'P') {
      el.parentElement?.click?.();
      return true;
    }
  }
  return false;
});
console.log(`  Nómina clicked: ${nominaClicked}`);
await new Promise(r => setTimeout(r, 2000));
await captureView('nomina');

// Close nomina
await page.keyboard.press('Escape');
await new Promise(r => setTimeout(r, 500));

// === Full page capture in dark mode (GESTIÓN, clean) ===
console.log('\n--- Clean GESTIÓN (dark mode, no inspection badge) ---');
await clickTab('GESTIÓN');
await new Promise(r => setTimeout(r, 1000));

// Hide inspection badge for clean capture
await page.evaluate(() => {
  const allDivs = document.querySelectorAll('div');
  for (const div of allDivs) {
    if (div.textContent?.includes('Modo Inspección')) {
      div.style.display = 'none';
    }
  }
});
await captureView('gestion-clean');

console.log('\n=== DONE ===');
await browser.close();
