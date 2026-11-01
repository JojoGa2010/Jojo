import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { runInContext } from 'node:vm';
import { JSDOM } from 'jsdom';

const originalPath = process.argv[2];
if (!originalPath) throw new Error('Pass the original Kegel-Krach.html path as argument.');
const html = readFileSync(originalPath, 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const adapter = readFileSync(new URL('../assets/online.js', import.meta.url), 'utf8');
const rooms = new Map();
let number = 0;
async function fetchMock(_, options) {
  const b = JSON.parse(options.body);
  let result;
  if (b.op === 'create') {
    const code = ['ABCD', 'EFGH', 'JKLM'][number++];
    const member = { uid: b.uid, n: b.n, skin: b.skin, token: b.uid + '-secret' };
    rooms.set(code, { members: [member], events: [], public: b.public, started: false });
    result = { code, token: member.token, seq: 0 };
  } else if (b.op === 'list') {
    result = { rooms: [...rooms].filter(([, r]) => r.public && !r.started).map(([code, r]) => ({ code, n: r.members[0].n, c: r.members.length })) };
  } else {
    const room = rooms.get(b.code);
    if (!room) return { ok: false, status: 404, json: async () => ({ message: 'Lobby nicht gefunden.' }) };
    if (b.op === 'join') {
      const member = { uid: b.uid, n: b.n, skin: b.skin, token: b.uid + '-secret' };
      room.members.push(member);
      result = { code: b.code, token: member.token, seq: room.events.length };
    } else if (b.op === 'poll') result = { events: room.events.filter(e => e.seq > b.after) };
    else {
      const member = room.members.find(p => p.token === b.token);
      let type = b.type, data = b.data, uid = member.uid;
      if (type === 'hello' || type === 'lobby') {
        type = 'lobby'; uid = 'server';
        data = { L: room.members.map(({ token, ...p }) => p), pub: room.public };
      }
      if (type === 'game') room.started = true;
      room.events.push({ seq: room.events.length + 1, type, data, uid });
      result = { ok: true };
    }
  }
  return { ok: true, status: 200, json: async () => structuredClone(result) };
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(check, label) {
  for (let i = 0; i < 300; i++) { if (check()) return; await sleep(10); }
  throw new Error('Timeout: ' + label);
}
function client(name) {
  const dom = new JSDOM(html.replace(/<script>[\s\S]*?<\/script>/, ''), { url: 'https://example.test/spiel/', runScripts: 'outside-only' });
  const w = dom.window;
  w.eval = code => runInContext(code, dom.getInternalVMContext());
  const interval = w.setInterval.bind(w), timeout = w.setTimeout.bind(w);
  w.setInterval = (f, ms) => interval(f, Math.min(ms, 10));
  w.setTimeout = (f, ms) => timeout(f, Math.min(ms, 10));
  w.requestAnimationFrame = () => 0;
  w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: (_, key) => key === 'measureText' ? () => ({ width: 50 }) : () => {} });
  w.fetch = fetchMock;
  w.AbortController = AbortController;
  w.KKOnlineConfig = { api: '/wp-json/kegel-krach/v1/' };
  w.eval(source);
  w.eval("dice=async()=>{};ride=async()=>{};hop=async()=>{};kick=async()=>{};homeCam=async()=>{};");
  w.eval(adapter);
  w.document.querySelector('#nm').value = name;
  w.document.querySelector('#fill').checked = false;
  return dom;
}
const a = client('Anna'), b = client('Ben');
const A = expression => a.window.eval(expression), B = expression => b.window.eval(expression);
try {
  await until(() => a.window.document.documentElement.dataset.kkOnline && b.window.document.documentElement.dataset.kkOnline, 'adapter installation');
  await A('mkLobby(false)');
  const code = A('R.code');
  await B(`joinCode(${JSON.stringify(code)})`);
  await until(() => A('L.length') === 2 && B('L.length') === 2, 'shared lobby');
  assert.equal(A('L[1].n'), 'Ben');
  console.log('PASS: two original game clients share private lobby and names');
  await A("document.querySelector('#bSt').onclick()");
  await until(() => B('G !== null'), 'guest game start');
  assert.equal(A('JSON.stringify(G)'), B('JSON.stringify(G)'));
  console.log('PASS: both clients start with identical game state');
  a.window.Math.random = () => .95;
  A("act({t:'roll'})");
  await until(() => A("!busy && G.phase==='move'") && B("G.phase==='move'"), 'host roll');
  A("act({t:'move',i:0})");
  await until(() => A('!busy && G.pc[0][0]===0') && B('G.pc[0][0]===0'), 'host piece enters board');
  a.window.Math.random = () => 0;
  A("act({t:'roll'})");
  await until(() => A("!busy && G.phase==='move'") && B("G.phase==='move'"), 'second host roll');
  A("act({t:'move',i:0})");
  await until(() => A('!busy && G.turn===1') && B('G.turn===1'), 'guest turn');
  a.window.Math.random = () => .95;
  B("act({t:'roll'})");
  await until(() => A("!busy && G.phase==='move'") && B("G.phase==='move'"), 'guest roll relayed through host');
  B("act({t:'move',i:0})");
  await until(() => A('!busy && G.pc[1][0]===0') && B('G.pc[1][0]===0'), 'guest piece enters board');
  assert.equal(A('JSON.stringify(G)'), B('JSON.stringify(G)'));
  console.log('PASS: host and guest roll and move; both game states remain identical');
  B("sendChat('Hallo Anna')");
  await until(() => A("bub[1] && bub[1].t==='Hallo Anna'"), 'chat');
  console.log('PASS: chat reaches the other client');
  await A('mkLobby(true)');
  const c = client('Clara');
  try {
    await until(() => c.window.document.documentElement.dataset.kkOnline, 'third adapter');
    await c.window.eval('quick()');
    await until(() => c.window.eval('L.length') === 2, 'quick join');
    assert.equal(c.window.eval('R.code'), A('R.code'));
    console.log('PASS: quick play finds and joins a real open room');
  } finally { c.window.close(); }
} finally { a.window.close(); b.window.close(); }
