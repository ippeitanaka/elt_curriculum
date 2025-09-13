#!/usr/bin/env node
/*
  Insert common GA4 gtag snippet before </head> in all .html files.
  - Recursively scans project
  - Skips if GA4 already present (script URL or gtag config)
  - Preserves BOM, EOLs, indentation
  - Structured with reusable functions
  - Logs changed and skipped files
*/

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const GA_ID = 'G-3K0XSVMYL7';
const GA_JS_URL = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;

const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'out', '.vercel', 'coverage', 'scripts'
]);

function collectHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    if (ent.name.startsWith('.DS_Store')) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (EXCLUDE_DIRS.has(ent.name)) continue;
      files.push(...collectHtmlFiles(full));
    } else if (ent.isFile() && ent.name.toLowerCase().endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

function detectBOM(buf) {
  return buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
}

function detectEOL(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

function hasGA4(content) {
  const hasJs = content.includes(GA_JS_URL);
  const reConfig = /gtag\(\s*['"]config['"]\s*,\s*['"]G-3K0XSVMYL7['"]\s*\)/i;
  return hasJs || reConfig.test(content);
}

function findHeadCloseIndex(content) {
  const match = content.match(/<\/head\s*>/i);
  return match ? match.index : -1;
}

function getLineStartIndex(text, idx) {
  const prevNL = text.lastIndexOf('\n', idx);
  return prevNL === -1 ? 0 : prevNL + 1;
}

function getIndentAt(text, idx) {
  const lineStart = getLineStartIndex(text, idx);
  let i = lineStart;
  let indent = '';
  while (i < text.length) {
    const ch = text[i];
    if (ch === ' ' || ch === '\t') {
      indent += ch;
      i++;
    } else {
      break;
    }
  }
  return indent;
}

function buildSnippet(eol, indent) {
  const i1 = indent + '  ';
  const lines = [
    `${i1}<!-- Google tag (gtag.js) -->`,
    `${i1}<script async src="${GA_JS_URL}"></script>`,
    `${i1}<script>`,
    `${i1}  window.dataLayer = window.dataLayer || [];`,
    `${i1}  function gtag(){dataLayer.push(arguments);}`,
    `${i1}  gtag('js', new Date());`,
    `${i1}  gtag('config', '${GA_ID}'); // 測定IDは共通でOK`,
    `${i1}</script>`,
  ];
  return lines.join(eol) + eol;
}

function processFile(file) {
  const buf = fs.readFileSync(file);
  const hadBOM = detectBOM(buf);
  const text = hadBOM ? buf.slice(3).toString('utf8') : buf.toString('utf8');
  const eol = detectEOL(text);

  if (hasGA4(text)) return { action: 'skipped-duplicate' };
  const headIdx = findHeadCloseIndex(text);
  if (headIdx === -1) return { action: 'skipped-nohead' };

  const baseIndent = getIndentAt(text, headIdx);
  const snippet = buildSnippet(eol, baseIndent);
  const outText = text.slice(0, headIdx) + snippet + text.slice(headIdx);
  const outBuf = hadBOM
    ? Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(outText, 'utf8')])
    : Buffer.from(outText, 'utf8');

  fs.writeFileSync(file, outBuf);
  return { action: 'changed' };
}

function main() {
  const htmlFiles = collectHtmlFiles(ROOT);
  const changed = [];
  const skippedDup = [];
  const skippedNoHead = [];

  for (const f of htmlFiles) {
    try {
      const res = processFile(f);
      if (res.action === 'changed') changed.push(f);
      else if (res.action === 'skipped-duplicate') skippedDup.push(f);
      else if (res.action === 'skipped-nohead') skippedNoHead.push(f);
    } catch (e) {
      console.error(`Error processing ${f}:`, e.message);
    }
  }

  console.log('GA4 Basic Injection Summary');
  console.log('============================');
  console.log(`Root: ${ROOT}`);
  console.log(`HTML files found: ${htmlFiles.length}`);
  console.log(`Changed: ${changed.length}`);
  if (changed.length) {
    console.log('Changed files:');
    changed.forEach((f) => console.log(' - ' + path.relative(ROOT, f)));
  }
  console.log(`Skipped (duplicate): ${skippedDup.length}`);
  if (skippedDup.length) skippedDup.forEach((f) => console.log(' - ' + path.relative(ROOT, f)));
  console.log(`Skipped (no </head>): ${skippedNoHead.length}`);
  if (skippedNoHead.length) skippedNoHead.forEach((f) => console.log(' - ' + path.relative(ROOT, f)));
}

main();
