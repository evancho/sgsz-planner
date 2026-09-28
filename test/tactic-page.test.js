import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');

test('the tactics list no longer shows the inventory blurb', () => {
  assert.equal(app.includes('這裡列出可勾選的傳承、事件、賽季商店'), false);
  assert.equal(app.includes('不能再裝第二次'), false);
  assert.equal(app.includes('賽季事件兌換的戰法'), false);
  assert.match(app, /used >= copies \? '已佔用'/);
  assert.match(app, /\.sort\(compareTactics\)/);
});

test('event and inheritance are filters on the same tactics list', () => {
  assert.equal(app.includes('function inheritView'), false);
  assert.equal(app.includes('標記已擁有'), false);
  assert.equal(app.includes('常見來源'), false);
  assert.match(app, /mode === 'inherit' \? '傳承'/);
  assert.match(app, /if \(source && tactic\.source !== source\) return false/);
  assert.match(app, /href="#\/tactics\/event">事件/);
  assert.match(app, /href="#\/tactics\/inherit">戰法傳承/);
  assert.match(app, /<h2>戰法<\/h2>/);
});
