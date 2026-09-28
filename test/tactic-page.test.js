import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');

test('the tactics list no longer shows the inventory blurb', () => {
  assert.equal(app.includes('這裡列出可勾選的傳承、事件、賽季商店'), false);
  assert.equal(app.includes('不能再裝第二次'), false);
  assert.match(app, /used >= copies \? '已佔用'/);
  assert.match(app, /\.sort\(compareTactics\)/);
});
