#!/usr/bin/env node
/*
  Insert Google Search Console site verification meta tag into all .html files.
  - Scans recursively
  - Inserts before first </head>
  - Skips if a google-site-verification meta already exists
  - Preserves BOM, line endings, indentation
  - Allows per-app content mapping; falls back to DEFAULT_TOKEN
  - Logs changed/skipped files and TODOs

  Usage: npm run inject:gsc
*/

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

// Default verification token (can be overridden per app below)
const DEFAULT_TOKEN = 'qObQsnGEBkczrciecDvtAZ7BJlfRxhGicVmM0lVG0eA';

// Map app keys to their unique Search Console verification tokens
// Key resolution: prefers apps/<key>/..., else top-level dir name
// Example: { app1: 'xxxxxxxx', marketing: 'yyyyyyyy' }
const APP_TOKENS = {
  // Add mappings here, e.g.:
  // app1: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  // portal: 'yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
};

const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'out', '.vercel', 'coverage'
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

function findHeadCloseIndex(content) {
  const m = content.match(/<\/head\s*>/i);
  return m ? m.index : -1;
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

function hasVerificationMeta(content) {
  // Detect any existing meta with name="google-site-verification"
  const re = /<meta\b[^>]*\bname=["']google-site-verification["'][^>]*>/i;
  return re.test(content);
}

function inferAppKey(absPath) {
  const rel = path.relative(ROOT, absPath).split(path.sep);
  // remove filename
  rel.pop();
  let key = '';
  const appsIdx = rel.findIndex((s) => s.toLowerCase() === 'apps');
  if (appsIdx !== -1 && appsIdx + 1 < rel.length) key = rel[appsIdx + 1];
  else if (rel.length > 0) key = rel[0];
  key = (key || '').trim();
  if (!key) return null;
  return key.toLowerCase();
}

function resolveToken(absPath) {
  const appKey = inferAppKey(absPath);
  if (appKey && APP_TOKENS[appKey]) {
    return { token: APP_TOKENS[appKey], appKey, isDefault: false };
  }
  return { token: DEFAULT_TOKEN, appKey: appKey || null, isDefault: true };
}

function buildMeta({ indent, eol, token, isDefault }) {
  const todo = isDefault
    ? `${indent}<!-- TODO: set correct Search Console token per app -->${eol}`
    : '';
  const meta = `${indent}<meta name="google-site-verification" content="${token}" />${eol}`;
  return todo + meta;
}

function insertBeforeHead(content, snippet, headIdx) {
  const before = content.slice(0, headIdx);
  const after = content.slice(headIdx);
  return before + snippet + after;
}

function processFile(file) {
  const buf = fs.readFileSync(file);
  const hadBOM = detectBOM(buf);
  const text = hadBOM ? buf.slice(3).toString('utf8') : buf.toString('utf8');
  const eol = detectEOL(text);

  if (hasVerificationMeta(text)) {
    return { action: 'skipped-duplicate' };
  }

  const headIdx = findHeadCloseIndex(text);
  if (headIdx === -1) {
    return { action: 'skipped-nohead' };
  }

  const baseIndent = getIndentAt(text, headIdx);
  const indent = baseIndent + '  ';
  const { token, appKey, isDefault } = resolveToken(file);
  const snippet = buildMeta({ indent, eol, token, isDefault });
  const newContent = insertBeforeHead(text, snippet, headIdx);
  const out = hadBOM
    ? Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(newContent, 'utf8')])
    : Buffer.from(newContent, 'utf8');
  fs.writeFileSync(file, out);
  return { action: 'changed', isDefault, appKey, token };
}

function main() {
  const htmlFiles = collectHtmlFiles(ROOT);
  const changed = [];
  const skippedDuplicate = [];
  const skippedNoHead = [];
  const todoDefault = [];

  for (const file of htmlFiles) {
    try {
      const res = processFile(file);
      if (res.action === 'changed') {
        changed.push(file);
        if (res.isDefault) todoDefault.push(file);
      } else if (res.action === 'skipped-duplicate') {
        skippedDuplicate.push(file);
      } else if (res.action === 'skipped-nohead') {
        skippedNoHead.push(file);
      }
    } catch (e) {
      console.error(`Error processing ${file}:`, e.message);
    }
  }

  console.log('GSC Meta Injection Summary');
  console.log('===========================');
  console.log(`Root: ${ROOT}`);
  console.log(`HTML files found: ${htmlFiles.length}`);
  console.log(`Changed: ${changed.length}`);
  if (changed.length) {
    console.log('Changed files:');
    changed.forEach((f) => console.log(` - ${path.relative(ROOT, f)}`));
  }
  console.log(`Skipped (duplicate meta present): ${skippedDuplicate.length}`);
  if (skippedDuplicate.length) {
    skippedDuplicate.forEach((f) => console.log(` - ${path.relative(ROOT, f)}`));
  }
  console.log(`Skipped (no </head>): ${skippedNoHead.length}`);
  if (skippedNoHead.length) {
    skippedNoHead.forEach((f) => console.log(` - ${path.relative(ROOT, f)}`));
  }
  console.log(`Needs token mapping (DEFAULT used): ${todoDefault.length}`);
  if (todoDefault.length) {
    todoDefault.forEach((f) => console.log(` - ${path.relative(ROOT, f)}`));
  }
}

main();
