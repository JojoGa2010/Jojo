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
function status(room) {
  return {epoch:room.epoch,host_uid:room.host,offer:room.offer,old_name:'Anna',public:room.public,L:room.members.map(({token,...p})=>p),state:room.state};
}
async function fetchMock(_, options) {
  const b = JSON.parse(options.body);
  let result;
  if (b.op === 'create') {
    const code = ['ABCD', 'EFGH', 'JKLM', 'NPQR', 'STUV', 'WXYZ'][number++];
    const member = { uid: b.uid, n: b.n, skin: b.skin, token: b.uid + '-secret' };
    rooms.set(code, { members: [member], events: [], public: b.public, started: false,host:b.uid,epoch:1,state:null,offer:null });
    result = { code, token: member.token, seq: 0 };
  } else if (b.op === 'list') {
    result = { rooms: [...rooms].filter(([, r]) => r.public && r.host && !r.started).map(([code, r]) => ({ code, n: r.members[0].n, c: r.members.length })) };
  } else {
    const room = rooms.get(b.code);
    if (!room) return { ok: false, status: 404, json: async () => ({ message: 'Lobby nicht gefunden.' }) };
    if (b.op === 'join') {
      const member = { uid: b.uid, n: b.n, skin: b.skin, token: b.uid + '-secret' };
      room.members.push(member);
      result = { code: b.code, token: member.token, seq: room.events.length };
    } else if (b.op === 'poll') result = { events: room.events.filter(e => e.seq > b.after),status:status(room),removed:!room.members.some(p=>p.token===b.token) };
    else if(b.op==='kick') {
      room.members=room.members.filter(p=>p.uid!==b.uid);
      result={ok:true,status:status(room)};
    }
    else if(b.op==='leave') {
      const member=room.members.find(p=>p.token===b.token);
      room.members=room.members.filter(p=>p!==member);room.epoch++;
      if(room.host===member.uid){room.host=null;room.offer=room.members.length?{uid:room.members[0].uid,expires:Date.now()/1000+20}:null;}
      result={ok:true};
    } else if(b.op==='answer') {
      const member=room.members.find(p=>p.token===b.token);
      if(b.accept){room.host=member.uid;room.epoch++;room.offer=null;}
      result={ok:true,status:status(room)};
    }
    else {
      const member = room.members.find(p => p.token === b.token);
      let type = b.type, data = b.data, uid = member.uid;
      if (type === 'hello' || type === 'lobby') {
        type = 'lobby'; uid = 'server';
        data = { L: room.members.map(({ token, ...p }) => p), pub: room.public };
      }
      if (type === 'game') {room.started = true;room.state=data.G;}
      if(type==='ev')for(const e of data.evs)if(e.snap)room.state=e.snap;
      room.events.push({ seq: room.events.length + 1, type, data, uid,epoch:room.epoch });
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
  const slot=a.window.document.querySelector('#lp .sl');
  await sleep(70);
  assert.equal(a.window.document.querySelector('#lp .sl'),slot);
  assert.equal(b.window.document.querySelector('#lp button'),null);
  assert.equal(a.window.document.querySelectorAll('#lp button').length,1);
  console.log('PASS: unchanged polling preserves lobby DOM; kick button only visible to admin');
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
  const savedBoard=B('JSON.stringify(G.pc)');
  const r=rooms.get(code);const old=r.host;
  r.host=null;r.epoch++;r.members=r.members.filter(p=>p.uid!==old);
  r.offer={uid:r.members[0].uid,expires:Date.now()/1000+20};
  r.state=structuredClone(r.state);r.state.pl[0].bot=1;r.state.pl[0].uid='departed_'+old;
  await until(()=>!b.window.document.querySelector('#kk-admin-dialog').hidden,'handover dialog');
  assert.equal(B('H'),null);assert.equal(B('busy'),true);
  const yes=[...b.window.document.querySelectorAll('#kk-admin-dialog button')].find(e=>e.textContent==='Ja, ich übernehme');
  assert.equal(yes.hidden,false);yes.click();
  await until(()=>B('isHost && H !== null && !busy'),'new admin resumes');
  assert.equal(B('JSON.stringify(G.pc)'),savedBoard);
  assert.equal(B('G.pl[0].bot'),1);
  assert.equal(b.window.document.querySelector('#kk-admin-dialog').hidden,true);
  console.log('PASS: handover pauses, asks consent and resumes from saved board as new admin');
  // Test navigation separately from the ongoing game.
  const nav=client('Navigation');
  try {
    await until(()=>nav.window.document.documentElement.dataset.kkOnline,'navigation adapter');
    for(const pub of [false,true]) {
      await nav.window.eval(`mkLobby(${pub})`);
      const navCode=nav.window.eval('R.code');
      await nav.window.document.querySelector('#kk-lobby-back').onclick();
      assert.equal(nav.window.eval('R'),null);
      assert.equal(nav.window.document.querySelector('#home').classList.contains('on'),true);
      assert.equal(rooms.get(navCode).members.length,0);
    }
    console.log('PASS: back exits private and public lobby, removes membership and returns to menu');
  }finally{nav.window.close();}
  await A('mkLobby(true)');
  const c = client('Clara');
  try {
    await until(() => c.window.document.documentElement.dataset.kkOnline, 'third adapter');
    await c.window.eval('quick()');
    await until(() => c.window.eval('L.length') === 2, 'quick join');
    assert.equal(c.window.eval('R.code'), A('R.code'));
    console.log('PASS: quick play finds and joins a real open room');
    await until(()=>a.window.document.querySelector('#lp button'),'kick button');
    await a.window.document.querySelector('#lp button').onclick();
    assert.equal(A('L.length'),1);
    assert.equal(rooms.get(A('R.code')).members.length,1);
    console.log('PASS: admin kick removes guest from displayed and server lobby');
  } finally { c.window.close(); }
} finally { a.window.close(); b.window.close(); }
