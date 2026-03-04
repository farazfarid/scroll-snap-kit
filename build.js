/**
 * scroll-snap-kit — build script
 * Run: node build.js
 * Generates dist/index.esm.js, dist/index.cjs.js, dist/index.umd.js, dist/index.d.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BANNER_ESM = `/**
 * scroll-snap-kit v2.0.0 (ESM)
 * MIT License — https://github.com/farazfarid/scroll-snap-kit
 */
`;

const BANNER_CJS = `/**
 * scroll-snap-kit v2.0.0 (CommonJS)
 * MIT License — https://github.com/farazfarid/scroll-snap-kit
 */
"use strict";
`;

const BANNER_UMD = `/**
 * scroll-snap-kit v2.0.0 (UMD — use via <script> or CDN)
 * MIT License — https://github.com/farazfarid/scroll-snap-kit
 */`;

const utils = fs.readFileSync(path.join(__dirname, 'src/utils.js'), 'utf8');
const hooks = fs.readFileSync(path.join(__dirname, 'src/hooks.js'), 'utf8');

// ── ESM — keep as-is (already ES modules) ────────────────
const esm = BANNER_ESM + '\n' + utils + '\n\n' +
    hooks.replace(/^import .+from .+$/gm, '').trim();

// ── CJS — strip export/import keywords ───────────────────
const cjs_utils = utils
    .replace(/export function /g, 'function ')
    .replace(/export const /g, 'const ')
    .replace(/export async function /g, 'async function ');

const cjs_hooks = hooks
    .replace(/^import .+\n/gm, '')
    .replace(/export function /g, 'function ');

const exportNames = [...utils.matchAll(/export (?:function|const) ([a-zA-Z_]+)/g)].map(m => m[1]);
const hookNames = [...hooks.matchAll(/export function ([a-zA-Z_]+)/g)].map(m => m[1]);

const cjs =
    BANNER_CJS + '\n' +
    cjs_utils + '\n\n' +
    cjs_hooks + '\n\n' +
    'module.exports = {\n' +
    [...exportNames, ...hookNames].map(n => `  ${n},`).join('\n') +
    '\n};\n';

// ── UMD — for <script> / CDN ──────────────────────────────
const umd = `${BANNER_UMD}
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory(); }
  else if (typeof define === 'function' && define.amd) { define([], factory); }
  else { root.ScrollSnapKit = factory(); }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

${cjs_utils}

  return {
${exportNames.map(n => `    ${n},`).join('\n')}
  };
}));
`;

// ── Write files ───────────────────────────────────────────
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });

fs.writeFileSync(path.join(__dirname, 'dist/index.esm.js'), esm);
fs.writeFileSync(path.join(__dirname, 'dist/index.cjs.js'), cjs);
fs.writeFileSync(path.join(__dirname, 'dist/index.umd.js'), umd);
fs.copyFileSync(
    path.join(__dirname, 'src/index.d.ts'),
    path.join(__dirname, 'dist/index.d.ts')
);

const size = f => (fs.statSync(path.join(__dirname, f)).size / 1024).toFixed(1) + ' KB';
console.log('✓ Built scroll-snap-kit v2.0.0');
console.log('  dist/index.esm.js', size('dist/index.esm.js'));
console.log('  dist/index.cjs.js', size('dist/index.cjs.js'));
console.log('  dist/index.umd.js', size('dist/index.umd.js'));
console.log('  dist/index.d.ts  ', size('dist/index.d.ts'));