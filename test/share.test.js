import assert from 'node:assert/strict';
import test from 'node:test';
import { applyTeamShare, decodeTeamShare, emptyAccount, encodeTeamShare, shareGaps } from '../js/logic.js';

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
  const other = {
    id: 'team-wu',
    name: '吳弓',
    notes: '',
    members: [{ generalId: 'luxun', learned: ['taiping', null], bingshu: null }, null, null],
  };
  const onlyShu = decodeTeamShare(encodeTeamShare(team, owned).token);
  const onlyWu = decodeTeamShare(encodeTeamShare(other, { luxun: { red: 2, dynamic: true, awaken: false } }).token);
  assert.equal(JSON.stringify(onlyShu.share).includes('luxun'), false);
  assert.equal(JSON.stringify(onlyWu.share).includes('guanyu'), false);
  assert.equal(onlyWu.share.members.filter(Boolean).length, 1);
});

test('loading a share adds one team and does not replace the rest of the account', () => {
  const account = emptyAccount('acct-a', '主帳');
  account.owned = { luxun: { red: 2, dynamic: true, awaken: false } };
  account.teams = [{ id: 'team-old', name: '舊隊', notes: '', members: [null, null, null] }];
  account.tacticsOwned = { qianli: true };
  const decoded = decodeTeamShare(encodeTeamShare(team, owned).token);
  account.owned.guanyu = { red: 1, dynamic: false, awaken: false };
  const applied = applyTeamShare(account, decoded.share, 'team-new');
  assert.equal(applied.ok, true);
  assert.equal(applied.account.teams.length, 2);
  assert.equal(applied.account.teams[0].id, 'team-old');
  assert.equal(applied.account.teams[1].name, '蜀槍');
  assert.deepEqual(applied.account.owned.luxun, { red: 2, dynamic: true, awaken: false });
  assert.deepEqual(applied.account.owned.guanyu, { red: 5, dynamic: true, awaken: true });
  assert.deepEqual(applied.account.owned.zhangfei, { red: 0, dynamic: false, awaken: false });
  assert.equal(applied.account.tacticsOwned.qianli, true);
  assert.equal(applied.account.tacticsOwned.jifeng, undefined);
  assert.equal(applied.account.teams[1].members[0].learned[1], 'jifeng');
});

test('loading does not lower a higher red or clear dynamic and collection', () => {
  const weaker = {
    id: 'team-low',
    name: '低配',
    notes: '',
    members: [
      { generalId: 'guanyu', learned: ['qianli', null], bingshu: null },
      null,
      null,
    ],
  };
  const account = emptyAccount('acct-a', '主帳');
  account.owned = { guanyu: { red: 5, dynamic: true, awaken: true } };
  account.tacticsOwned = { qianli: true };
  const share = decodeTeamShare(encodeTeamShare(weaker, {
    guanyu: { red: 0, dynamic: false, awaken: false },
  }).token).share;
  const applied = applyTeamShare(account, share, 'team-low');
  assert.equal(applied.ok, true);
  assert.deepEqual(applied.account.owned.guanyu, { red: 5, dynamic: true, awaken: true });
  assert.equal(applied.account.teams.length, 1);
});

test('the missing list contains only tactics and does not block the team', () => {
  const gapped = {
    id: 'team-gap',
    name: '缺卡',
    notes: '',
    members: [
      {
        generalId: 'guanyu',
        learned: ['qianli', 'jifeng'],
        bingshu: { branch: 'xushi', primary: 'houfa', secondary: 'guimou' },
      },
      {
        generalId: 'no-such-general',
        learned: ['no-such-tactic', null],
        bingshu: { branch: 'no-book', primary: null, secondary: null },
      },
      null,
    ],
  };
  const account = emptyAccount('acct-a', '主帳');
  account.tacticsOwned = { qianli: true };
  account.teams = [{ id: 'team-old', name: '舊隊', notes: '', members: [null, null, null] }];
  const share = decodeTeamShare(encodeTeamShare(gapped, {
    guanyu: { red: 1, dynamic: false, awaken: false },
    'no-such-general': { red: 3, dynamic: true, awaken: false },
  }).token).share;
  const gaps = shareGaps(share, account, {
    tacticName: (id) => (id === 'qianli' ? '千里走單騎' : id === 'jifeng' ? '疾風驟雨' : ''),
  });
  assert.deepEqual(gaps.map((gap) => `${gap.kind}:${gap.id}:${gap.reason}`), [
    'tactic:jifeng:未擁有',
    'tactic:no-such-tactic:圖鑑沒有',
  ]);
  const applied = applyTeamShare(account, share, 'team-gap');
  assert.equal(applied.ok, true);
  assert.equal(applied.account.teams[0].name, '舊隊');
  assert.equal(applied.account.teams[1].members[0].learned[1], 'jifeng');
  assert.equal(applied.account.teams[1].members[1].generalId, 'no-such-general');
  assert.equal(applied.account.teams[1].members[1].learned[0], 'no-such-tactic');
  assert.equal(applied.account.teams[1].members[1].bingshu.branch, 'no-book');
  assert.equal(applied.account.tacticsOwned.jifeng, undefined);
  assert.deepEqual(applied.account.owned['no-such-general'], { red: 3, dynamic: true, awaken: false });
  assert.equal(gaps.some((gap) => ['red', 'dynamic', 'awaken'].includes(gap.kind)), false);
});

test('missing red, dynamic, and collection are written and not listed as gaps', () => {
  const account = emptyAccount('acct-a', '主帳');
  account.tacticsOwned = { qianli: true, jifeng: true, jushui: true };
  const share = decodeTeamShare(encodeTeamShare(team, owned).token).share;
  const gaps = shareGaps(share, account, {
    tacticName: (id) => id,
  });
  assert.deepEqual(gaps, []);
  const applied = applyTeamShare(account, share, 'team-quiet');
  assert.equal(applied.ok, true);
  assert.deepEqual(applied.account.owned.guanyu, { red: 5, dynamic: true, awaken: true });
  assert.deepEqual(applied.account.owned.zhangfei, { red: 0, dynamic: false, awaken: false });
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
