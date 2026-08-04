#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const R2_BASE = 'https://ai-html.hacksaw.work/';
const MAX_INLINE_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_INLINE_TOTAL_BYTES = 5 * 1024 * 1024;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
}

function extractSlotImgSrc(html, slot) {
  const re = new RegExp(`slot=["']${slot}["'][^>]*src=["']([^"']+)["']`, 'i');
  const match = html.match(re);
  return match ? match[1] : null;
}

function isDataUrl(src) {
  return /^data:image\//i.test(src);
}

function isR2PublicUrl(src) {
  return src.startsWith(R2_BASE);
}

function decodeDataUrlBytes(dataUrl) {
  const comma = dataUrl.indexOf(',');
  if (comma === -1) return null;
  const meta = dataUrl.slice(0, comma);
  const payload = dataUrl.slice(comma + 1);
  if (/;base64/i.test(meta)) {
    return Buffer.from(payload, 'base64');
  }
  return Buffer.from(decodeURIComponent(payload), 'utf8');
}

function usage() {
  console.error(
    'usage: node scripts/verify-review-delivery.mjs <html-file> [--frontend] [--public-url URL] [--pr-body-file FILE]'
  );
}

function parseArgs(argv) {
  const positional = [];
  const options = { frontend: false, publicUrl: null, prBodyFile: null };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--frontend') {
      options.frontend = true;
    } else if (arg === '--public-url') {
      options.publicUrl = argv[i + 1];
      if (!options.publicUrl) throw new Error('--public-url requires a URL');
      i += 1;
    } else if (arg === '--pr-body-file') {
      options.prBodyFile = argv[i + 1];
      if (!options.prBodyFile) throw new Error('--pr-body-file requires a file path');
      i += 1;
    } else if (arg.startsWith('-')) {
      throw new Error(`unknown option: ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  if (positional.length !== 1) {
    throw new Error('exactly one HTML file path is required');
  }

  return { htmlFile: positional[0], ...options };
}

function readText(filePath) {
  return readFileSync(resolve(filePath), 'utf8');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createRunner() {
  const failures = [];
  let passed = 0;

  function check(label, ok) {
    if (ok) {
      passed += 1;
    } else {
      failures.push(label);
    }
  }

  return { failures, check, passed: () => passed };
}

function validateCore(html, run) {
  run.check('doctype: <!DOCTYPE html>', /^<!DOCTYPE html>/i.test(html.trimStart()));
  run.check('html data-theme attribute', /<html[^>]*\sdata-theme=/i.test(html));
  run.check('daisyUI v5 CDN', /daisyui@5/i.test(html));
  run.check('Tailwind browser v4 CDN', /@tailwindcss\/browser@4/i.test(html));
  run.check('data-content-root', /data-content-root/i.test(html));
  run.check('data-comment-panel', /data-comment-panel/i.test(html));
  run.check('#connector-svg', /id=["']connector-svg["']/i.test(html));
  run.check('#connector-lines', /id=["']connector-lines["']/i.test(html));
  run.check('#copy-all-btn', /id=["']copy-all-btn["']/i.test(html));
  run.check('#copy-feedback', /id=["']copy-feedback["']/i.test(html));
  run.check('#comment-dialog', /id=["']comment-dialog["']/i.test(html));
  run.check('data-action="copy"', /data-action=["']copy["']/i.test(html));
  run.check('data-action="edit"', /data-action=["']edit["']/i.test(html));
  run.check('data-action="delete"', /data-action=["']delete["']/i.test(html));

  const storageOk =
    /comments_\$\{location\.pathname\}/.test(html) ||
    (/STORAGE_PREFIX\s*=\s*['"]comments_['"]/.test(html) &&
      /location\.pathname/.test(html) &&
      /storageKey\s*\(\s*\)/.test(html));
  run.check('localStorage key: comments_${location.pathname}', storageOk);
}

function validateInlineImageCapacity(html, run) {
  const slots = ['first', 'second'];
  let inlineTotalBytes = 0;

  for (const slot of slots) {
    const src = extractSlotImgSrc(html, slot);
    if (!src) continue;

    if (isR2PublicUrl(src)) {
      const objectKey = src.slice(R2_BASE.length).split(/[?#]/)[0];
      console.log(`R2 image (slot="${slot}"): verify offline (no network fetch):`);
      console.log(
        `  npx wrangler@latest r2 object get ai-html/${objectKey} --file=/tmp/${objectKey.replace(/\//g, '_')} --remote`
      );
      console.log('  file --mime-type /tmp/<saved-file>');
      console.log('  wc -c /tmp/<saved-file>  # repository recommended max: 2 MiB per image');
      continue;
    }

    if (!isDataUrl(src)) continue;

    const bytes = decodeDataUrlBytes(src);
    if (!bytes) {
      run.check(`inline image (slot="${slot}"): decodable data URL`, false);
      continue;
    }

    const size = bytes.length;
    inlineTotalBytes += size;
    run.check(
      `inline image (slot="${slot}"): <= 2 MiB (${formatBytes(size)})`,
      size <= MAX_INLINE_IMAGE_BYTES
    );
  }

  run.check(
    `inline images total: <= 5 MiB (${formatBytes(inlineTotalBytes)})`,
    inlineTotalBytes <= MAX_INLINE_TOTAL_BYTES
  );
}

function validateFrontend(html, run) {
  run.check('img-comparison-slider CSS CDN', /img-comparison-slider@8\/dist\/styles\.css/i.test(html));
  run.check('img-comparison-slider JS CDN', /img-comparison-slider@8\/dist\/index\.js/i.test(html));
  run.check('img slot="first"', /slot=["']first["']/i.test(html));
  run.check('img slot="second"', /slot=["']second["']/i.test(html));
  run.check('first image width="100%"', /slot=["']first["'][^>]*width=["']100%["']/i.test(html));
  run.check('second image width="100%"', /slot=["']second["'][^>]*width=["']100%["']/i.test(html));

  const firstSrc = extractSlotImgSrc(html, 'first');
  const secondSrc = extractSlotImgSrc(html, 'second');
  run.check(
    'before image src (slot="first"): data URL or R2 public URL',
    Boolean(firstSrc && (isDataUrl(firstSrc) || isR2PublicUrl(firstSrc)))
  );
  run.check(
    'after image src (slot="second"): data URL or R2 public URL',
    Boolean(secondSrc && (isDataUrl(secondSrc) || isR2PublicUrl(secondSrc)))
  );

  validateInlineImageCapacity(html, run);

  const viewportOk =
    /1280\s*[×x]\s*800/i.test(html) ||
    (/ビューポート/i.test(html) && /\d{3,4}\s*[×x]\s*\d{3,4}/i.test(html));
  run.check('capture viewport (1280×800 or viewport notation)', viewportOk);
  run.check('capture branch', /branch\s*:/i.test(html));

  const urlMention =
    /https?:\/\//i.test(html) ||
    /\.html/i.test(html) ||
    /file:\/\//i.test(html) ||
    /URL\s*:/i.test(html);
  run.check('capture URL', urlMention);
}

function validatePublicUrl(publicUrl, run) {
  run.check(`public URL must start with ${R2_BASE}`, publicUrl.startsWith(R2_BASE));

  const objectKey = publicUrl.slice(R2_BASE.length).split(/[?#]/)[0];
  run.check('public URL object key must contain _vN.html', /_v\d+\.html$/i.test(objectKey));
}

function validatePrBody(body, publicUrl, run) {
  run.check('PR body: ## レビュー用資料 heading', /^##\s+レビュー用資料/m.test(body));

  const versionMatch = publicUrl.match(/_v(\d+)\.html/i);
  if (!versionMatch) {
    run.check('public URL version label vN', false);
    return;
  }

  const versionLabel = `v${versionMatch[1]}`;
  const linkPattern = new RegExp(`\\[${versionLabel}\\]\\(${escapeRegExp(publicUrl)}\\)`);
  run.check(`PR body: [${versionLabel}](${publicUrl}) link`, linkPattern.test(body));
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    usage();
    console.error(err.message);
    process.exit(1);
  }

  const run = createRunner();

  let html;
  try {
    html = readText(args.htmlFile);
  } catch (err) {
    console.error(`failed to read HTML file: ${err.message}`);
    process.exit(1);
  }

  validateCore(html, run);

  if (args.frontend) {
    validateFrontend(html, run);
  }

  if (args.publicUrl) {
    validatePublicUrl(args.publicUrl, run);
  }

  if (args.prBodyFile) {
    if (!args.publicUrl) {
      run.check('--pr-body-file requires --public-url', false);
    } else {
      let body;
      try {
        body = readText(args.prBodyFile);
      } catch (err) {
        run.check(`PR body file unreadable: ${err.message}`, false);
        body = null;
      }
      if (body) {
        validatePrBody(body, args.publicUrl, run);
      }
    }
  }

  if (run.failures.length > 0) {
    console.error('verify-review-delivery: FAILED');
    for (const item of run.failures) {
      console.error(`  - ${item}`);
    }
    process.exit(1);
  }

  console.log(`verify-review-delivery: PASSED (${run.passed()} checks)`);
}

main();
