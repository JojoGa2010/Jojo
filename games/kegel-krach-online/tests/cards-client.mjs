// Integration against the local PHP QA server: start preview-cards.mjs first.
import{readFileSync}from'node:fs';import assert from'node:assert/strict';import{JSDOM}from'jsdom';
const origin=process.argv[2]||'http://127.0.0.1:8768',source=readFileSync(new URL('../assets/cards.js',import.meta.url),'utf8');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label){for(let n=0;n<400;n++){if(fn())return;await pause(20);}throw Error('Timeout: '+label);}
function client(){const dom=new JSDOM('<!doctype html><div id="home"><div id="modes"></div><input id="nm"></div>',{url:origin,runScripts:'outside-only'}),w=dom.window;w.KKOnlineConfig={api:origin+'/api/'};w.AbortController=globalThis.AbortController;const set=w.setInterval.bind(w);w.setInterval=(f,ms)=>set(f,Math.min(ms,20));const timeout=w.setTimeout.bind(w);w.setTimeout=(f,ms)=>timeout(f,ms===1100?80:ms);const data={last:null,ops:[]};w.fetch=async(url,opt)=>{data.ops.push(JSON.parse(opt.body));const r=await fetch(url,opt),value=await r.clone().json();if(r.ok)data.last=value;else console.error(value);return r;};w.eval(source);return{dom,w,d:w.document,data};}
const a=client(),b=client();await until(()=>a.d.querySelector('#fk-launch')&&b.d.querySelector('#fk-launch'),'launchers');
a.d.querySelector('#fk-launch').click();a.d.querySelector('#fk-name').value='Anna';a.d.querySelectorAll('.fk-setup>button')[1].click();await until(()=>a.d.querySelector('.fk-room-code'),'host room');
const code=a.d.querySelector('.fk-room-code').textContent;b.d.querySelector('#fk-launch').click();b.d.querySelector('#fk-name').value='Ben';b.d.querySelector('#fk-code').value=code;b.d.querySelector('.fk-join button').click();await until(()=>b.d.querySelector('.fk-lobby-players')?.textContent.includes('Ben'),'guest lobby');await until(()=>a.d.querySelector('.fk-lobby-players')?.textContent.includes('Ben'),'host sees guest');
const lobbyNode=a.d.querySelector('.fk-room-code');await pause(160);assert.equal(a.d.querySelector('.fk-room-code'),lobbyNode,'unchanged polls retain DOM');
a.d.querySelector('#fk-lobby-bots').value='1';a.d.querySelector('.fk-lobby .fk-primary').click();await until(()=>a.d.querySelector('.fk-hand')&&b.d.querySelector('.fk-hand'),'started both');
assert.equal(a.d.querySelectorAll('.fk-hand .fk-card').length,7);assert.equal(b.d.querySelectorAll('.fk-hand .fk-card').length,7);assert.ok([...b.d.querySelectorAll('.fk-hand button')].every(el=>el.disabled));assert.equal(b.d.querySelector('.fk-deck').disabled,true);assert.notDeepEqual(a.data.last.view.hand,b.data.last.view.hand);
console.log('PASS: two card clients create/join/start one private room; hidden hands differ; guest cannot act out of turn; stable polls keep lobby DOM');
const hostCard=[...a.d.querySelectorAll('.fk-hand button')].find(el=>!el.disabled);
if(hostCard){hostCard.click();if(!a.d.querySelector('#fk-color').hidden)a.d.querySelector('#fk-colors button').click();}else a.d.querySelector('.fk-deck').click();
await until(()=>a.data.ops.some(op=>['play','draw'].includes(op.op)),'host action');await pause(150);
assert.ok(!a.d.querySelector('#fk-error').textContent.includes('Unbekannte'));
a.d.querySelector('#fk-logo').click();await until(()=>a.d.querySelector('#fk-app').hidden,'logo leaves');assert.equal(a.d.querySelector('#home').inert,false);
await until(()=>b.data.last.view.host===b.data.last.uid,'new host');assert.equal(b.data.last.view.players[0].bot,true);
console.log('PASS: direct card action reaches PHP; logo leaves to selection and guest inherits host while old player becomes bot');
b.d.querySelector('#fk-close').click();await until(()=>b.d.querySelector('#fk-app').hidden,'guest leaves');
a.dom.window.close();b.dom.window.close();
