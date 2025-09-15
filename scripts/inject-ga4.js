#!/usr/bin/env node
/*
  Inject GA4 gtag to all .html files before </head>.
  - Skips if GA4 already present
  - Infers app_name from path (apps/<name> or top-level dir)
  - Preserves BOM and line endings
  - Matches indentation to surrounding code
  - Copies nonce from existing <script nonce="..."> if present
  - Logs changed and skipped files
*/

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const GA_ID = 'G-JPXBRWRFWR';
const GA_JS_URL = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;

const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'out', '.vercel', 'coverage', 'scripts'
]);

const NON_APP_TOPS = new Set(['public', 'static', 'assets']);

/** Recursively collect all .html files under dir */
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

function hasDuplicate(content) {
  const hasJs = content.includes(GA_JS_URL);
  const reConfig = /gtag\(\s*['"]config['"]\s*,\s*['"]G-JPXBRWRFWR['"]\s*\)/i;
  return hasJs || reConfig.test(content);
}

function findHeadCloseIndex(content) {
  const match = content.match(/<\/head\s*>/i);
  if (!match) return -1;
  return match.index;
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

function extractNonce(content) {
  const re = /<script\b[^>]*\bnonce=(?:"([^"]+)"|'([^']+)')/i;
  const m = re.exec(content);
  if (m) return m[1] || m[2] || '';
  return '';
}

function inferAppName(absPath) {
  const rel = path.relative(ROOT, absPath).split(path.sep);
  // Remove the filename
  rel.pop();

  let candidate = '';
  const appsIdx = rel.findIndex((s) => s.toLowerCase() === 'apps');
  if (appsIdx !== -1 && appsIdx + 1 < rel.length) {
    candidate = rel[appsIdx + 1];
  } else if (rel.length > 0) {
    candidate = rel[0];
  }

  if (!candidate || NON_APP_TOPS.has(candidate)) {
    return null;
  }

  // Normalize: keep as is but capitalize first char
  const cleaned = candidate.replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function buildSnippet({ eol, baseIndent, nonce, appName, leaveTodo }) {
  const indent1 = baseIndent + '  ';
  const nonceAttr = nonce ? ` nonce="${nonce}"` : '';
  const appNameValue = appName || 'APP_NAME_PLACEHOLDER';
  const todoLine = leaveTodo ? `${indent1}// TODO: set app name${eol}` : '';
  // Provided snippet string
  const lines = [
    `${indent1}<!-- Google tag (gtag.js) -->`,
    `${indent1}<script async src="${GA_JS_URL}"${nonceAttr}></script>`,
    `${indent1}<script${nonceAttr}>`,
    `${indent1}  window.dataLayer = window.dataLayer || [];`,
    `${indent1}  function gtag(){dataLayer.push(arguments);}`,
    `${indent1}  gtag('js', new Date());`,
    `${indent1}  gtag('config', '${GA_ID}');`,
    `${indent1}  // アプリ名をGA4へ送信（必要に応じて書き換え）`,
    `${indent1}  gtag('event', 'app_loaded', { 'app_name': '${appNameValue}' });`,
    `${indent1}</script>`,
  ];
  if (leaveTodo) lines.splice(3, 0, todoLine.trimEnd());
  return lines.join(eol) + eol;
}

async function main() {
  const htmlFiles = collectHtmlFiles(ROOT);
  const changed = [];
  const skippedDuplicate = [];
  const skippedNoHead = [];
  const todoAppName = [];

  for (const file of htmlFiles) {
    try {
      const buf = fs.readFileSync(file);
      const hadBOM = detectBOM(buf);
      const text = hadBOM ? buf.slice(3).toString('utf8') : buf.toString('utf8');
      const eol = detectEOL(text);

      if (hasDuplicate(text)) {
        skippedDuplicate.push(file);
        continue;
      }

      const headIdx = findHeadCloseIndex(text);
      if (headIdx === -1) {
        skippedNoHead.push(file);
        continue;
      }

      const baseIndent = getIndentAt(text, headIdx);
      const nonce = extractNonce(text);
      const appName = inferAppName(file);
      const leaveTodo = !appName;

      const snippet = buildSnippet({ eol, baseIndent, nonce, appName, leaveTodo });

      // Insert before first </head>
      const before = text.slice(0, headIdx);
      const after = text.slice(headIdx);

      const newContent = before + snippet + after;
      const finalBuf = Buffer.concat([
        hadBOM ? Buffer.from([0xef, 0xbb, 0xbf]) : Buffer.alloc(0),
        Buffer.from(newContent, 'utf8'),
      ]);

      fs.writeFileSync(file, finalBuf);
      changed.push(file);
      if (leaveTodo) todoAppName.push(file);
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }

  // Logging summary
  console.log('GA4 Injection Summary');
  console.log('======================');
  console.log(`Root: ${ROOT}`);
  console.log(`HTML files found: ${htmlFiles.length}`);
  console.log(`Changed: ${changed.length}`);
  if (changed.length) {
    console.log('Changed files:');
    changed.forEach((f) => console.log(` - ${path.relative(ROOT, f)}`));
  }
  console.log(`Skipped (duplicate detected): ${skippedDuplicate.length}`);
  if (skippedDuplicate.length) {
    skippedDuplicate.forEach((f) => console.log(` - ${path.relative(ROOT, f)}`));
  }
  console.log(`Skipped (no </head> found): ${skippedNoHead.length}`);
  if (skippedNoHead.length) {
    skippedNoHead.forEach((f) => console.log(` - ${path.relative(ROOT, f)}`));
  }
  console.log(`Needs review (APP_NAME_PLACEHOLDER remains): ${todoAppName.length}`);
  if (todoAppName.length) {
    todoAppName.forEach((f) => console.log(` - ${path.relative(ROOT, f)}`));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
