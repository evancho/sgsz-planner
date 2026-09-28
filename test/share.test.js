import assert from 'node:assert/strict';
import test from 'node:test';
import { applyTeamShare, decodeTeamShare, emptyAccount, encodeTeamShare } from '../js/logic.js';

const team = {
  id: 'team-shu',
  name: '蜀槍',
  notes: '這段備註不會進連結',
  members: [
    {
      generalId: 'guanyu',
      learned: ['qianli', 'jifeng'],
      bingshu: { branch: 'xushi', primary: 'houfa', secondary: 'guimou' },
    },
    {
      generalId: 'zhangfei',
      learned: ['jushui', null],
      bingshu: null,
    },
    null,
  ],
};

const owned = {
  guanyu: { red: 5, dynamic: true, awaken: true },
  zhangfei: { red: 0, dynamic: false, awaken: false },
  luxun: { red: 2, dynamic: true, awaken: false },
};

function wrap(value, envelope = '1') {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const body = btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
  return `${envelope}.${body}`;
}

test('team share round-trips generals, tactics, books, and ownership', () => {
  const encoded = encodeTeamShare(team, owned);
  assert.equal(encoded.ok, true);
  assert.match(encoded.token, /^1\.[A-Za-z0-9_-]+$/);
  const decoded = decodeTeamShare(encoded.token);
  assert.equal(decoded.ok, true);
  assert.equal(decoded.share.name, '蜀槍');
  assert.equal(decoded.share.members[0].generalId, 'guanyu');
  assert.deepEqual(decoded.share.members[0].learned, ['qianli', 'jifeng']);
  assert.deepEqual(decoded.share.members[0].bingshu, { branch: 'xushi', primary: 'houfa', secondary: 'guimou' });
  assert.equal(decoded.share.members[0].red, 5);
  assert.equal(decoded.share.members[0].dynamic, true);
  assert.equal(decoded.share.members[0].awaken, true);
  assert.equal(decoded.share.members[1].red, 0);
  assert.equal(decoded.share.members[1].dynamic, false);
  assert.equal(decoded.share.members[1].awaken, false);
  assert.equal(decoded.share.members[1].learned[1], null);
  assert.equal(decoded.share.members[2], null);
  assert.equal(JSON.stringify(decoded.share).includes('備註'), false);
  assert.equal(JSON.stringify(decoded.share).includes('luxun'), false);
});

test('loading a share adds one team and does not replace the rest of the account', () => {
  const account = emptyAccount('acct-a', '主帳');
  account.owned = { luxun: { red: 2, dynamic: true, awaken: false } };
  account.teams = [{ id: 'team-old', name: '舊隊', notes: '', members: [null, null, null] }];
  account.tacticsOwned = { qianli: true };
  const decoded = decodeTeamShare(encodeTeamShare(team, owned).token);
  const applied = applyTeamShare(account, decoded.share, 'team-new', new Set(['qianli', 'jifeng']));
  assert.equal(applied.ok, true);
  assert.equal(applied.account.teams.length, 2);
  assert.equal(applied.account.teams[0].id, 'team-old');
  assert.equal(applied.account.teams[1].name, '蜀槍');
  assert.deepEqual(applied.account.owned.luxun, { red: 2, dynamic: true, awaken: false });
  assert.deepEqual(applied.account.owned.guanyu, { red: 5, dynamic: true, awaken: true });
  assert.deepEqual(applied.account.owned.zhangfei, { red: 0, dynamic: false, awaken: false });
  assert.equal(applied.account.tacticsOwned.jifeng, true);
  assert.equal(applied.account.tacticsOwned['not-a-tactic'], undefined);
  assert.equal(applied.account.teams[1].members[0].learned[1], 'jifeng');
});

test('share tokens reject bad versions, scripts, and overlong text', () => {
  assert.equal(decodeTeamShare('alert(1)').ok, false);
  assert.equal(decodeTeamShare(`1.${'A'.repeat(4000)}`).ok, false);
  assert.equal(decodeTeamShare('2.aaaa').error, '這份分享的版本不相容');
  const hostile = wrap({
    v: 1,
    name: '<img src=x onerror=alert(1)>',
    members: [{ g: 'constructor', r: 9, d: 'yes', a: 0, t: ['ok_id', 'bad id'], b: null }, null, null],
  });
  const decoded = decodeTeamShare(hostile);
  assert.equal(decoded.ok, true);
  assert.equal(decoded.share.name.includes('onerror'), true);
  assert.equal(decoded.share.members[0].generalId, 'constructor');
  assert.equal(decoded.share.members[0].red, 5);
  assert.equal(decoded.share.members[0].dynamic, false);
  assert.equal(decoded.share.members[0].learned[1], null);
  assert.equal(decodeTeamShare(wrap({ v: 2, name: '新', members: [null, null, null] })).error, '這份分享的版本不相容');
  assert.equal(decodeTeamShare(wrap({ v: 1, name: '壞', members: [null, null] })).ok, false);
  const full = emptyAccount('acct-a', '主帳');
  full.teams = Array.from({ length: 40 }, (_, index) => ({
    id: `team-${index}`,
    name: '滿',
    notes: '',
    members: [null, null, null],
  }));
  const share = decodeTeamShare(encodeTeamShare(team, owned).token).share;
  assert.equal(applyTeamShare(full, share, 'team-extra').ok, false);
});
