'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicFiles = [
  'README.md',
  'CONTRIBUTING.md',
  'package.json',
  'docs/XORA-PLAN.md',
  'docs/store-upload-walkthrough.md',
  'docs/store-listing.md',
  'docs/store-msix.md',
  'docs/privacy.md',
  'docs/USER-MANUAL.md',
  'docs/store-whatsnew-0.6.1.txt',
  'docs/store-whatsnew-0.6.2.txt',
  'docs/store-whatsnew-0.6.3.txt',
  'docs/store-whatsnew-0.6.4.txt',
  'docs/promo/XORA-release.md',
  'build/store-shots.html',
];

const cjk = /[\u4e00-\u9fff]/u;

for (const relativePath of publicFiles) {
  const absolutePath = path.join(root, relativePath);
  const content = fs.readFileSync(absolutePath, 'utf8');
  assert.ok(
    !cjk.test(content),
    `${relativePath} todavía contiene caracteres CJK en contenido público`,
  );
}

console.log(`✓ contenido público en español: ${publicFiles.length} archivos revisados`);
