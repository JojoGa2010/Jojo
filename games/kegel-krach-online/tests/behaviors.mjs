import{readFileSync,writeFileSync,mkdirSync}from'node:fs';
import{runInContext}from'node:vm';
import assert from'node:assert/strict';
import{JSDOM}from'jsdom';
import{createCanvas}from'@napi-rs/canvas';
const html=readFileSync(process.argv[2],'utf8'),out=process.argv[3]||'/tmp/kegel-kick';mkdirSync(out,{recursive:true});
const dom=new JSDOM(html.replace(/<script>[\s\S]*?<\/script>/,''),{url:'https://example.test/spiel/',runScripts:'outside-only'}),w=dom.window;
const interval=w.setInterval.bind(w),timeout=w.setTimeout.bind(w);w.setInterval=(f,ms)=>interval(f,Math.min(ms,10));w.setTimeout=(f,ms)=>timeout(f,ms===650?80:Math.min(ms,10));
w.requestAnimationFrame=()=>0;w.matchMedia=()=>({matches:false});w.KKOnlineConfig={game:'/spiel/'};
const surfaces=new WeakMap();w.HTMLCanvasElement.prototype.getContext=function(){let s=surfaces.get(this);if(!s){s=createCanvas(this.width,this.height);surfaces.set(this,s);const c=s.getContext('2d'),draw=c.drawImage.bind(c);c.drawImage=(image,...args)=>draw(surfaces.get(image)||image,...args);}return s.getContext('2d');};
const run=s=>runInContext(s,dom.getInternalVMContext()),sleep=ms=>new Promise(r=>setTimeout(r,ms));
run(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
run('botTalk=()=>{}');w.document.documentElement.dataset.kkOnline='1';
for(const file of['players','animation','controls','behaviors'])run(readFileSync(new URL('../assets/'+file+'.js',import.meta.url),'utf8'));
await sleep(80);assert.equal(w.document.documentElement.dataset.kkBehaviors,'1');
run("isHost=true;G=mk([{n:'Anna',uid:'L',skin:0},{n:'Kegel-Karl',uid:'B0',skin:6,bot:1}]);G.pc[0][0]=1;G.pc[1][0]=22;G.phase='move';G.d=1;H=cl(G);show('game');globalThis.event=doMove(0,0)[0]");
const records=[];let clock=0;
Object.defineProperty(w.performance,'now',{value:()=>{clock+=40;return clock;}});
function record(tag){records.push({tag,time:clock,attacker:run('ov&&cl(ov)'),victim:run('ov2&&cl(ov2)'),state:run('cl(G)')});}
w.requestAnimationFrame=f=>w.setTimeout(()=>{run('tnow='+clock/1000);record('frame');f();},0);
w.recordImpact=()=>record('impact');run("burst=(x,y,n)=>{if(n===42)recordImpact()}");
record('start');await run('play(event)');record('end');
const hit=records.findIndex(r=>r.tag==='impact');assert.ok(hit>0);
assert.ok(records.slice(0,hit).every(r=>!r.victim));assert.equal(records[hit].attacker.kick.amount,1);
const foot=w.KKFigureAnimation.deform(0,0,w.KKFigureAnimation.kickPose(records[hit].attacker.kick));
assert.ok(Math.abs(records[hit].attacker.x+foot[0]*.85-150)<11);
assert.ok(records.slice(hit+1).some(r=>r.victim&&r.victim.x>150));
assert.equal(run('JSON.stringify(G)'),run('JSON.stringify(event.snap)'));assert.equal(run('ov'),null);assert.equal(run('ov2'),null);
console.log('PASS: approach stops before victim; lower body reaches contact before launch; captured state and camera cleanup correct');
const preview=createCanvas(900,380),ctx=preview.getContext('2d'),draw=ctx.drawImage.bind(ctx);ctx.drawImage=(image,...args)=>draw(surfaces.get(image)||image,...args);w.kickPreview=ctx;
for(let i=0;i<36;i++){
 const r=records[Math.round(i*(records.length-1)/35)],a=r.attacker||{x:r.state.pc[0][0]===2?150:90,y:270},v=r.victim||{x:r.state.pc[1][0]<0?510:150,y:270};
 run('tnow='+r.time/1000);ctx.fillStyle='#201942';ctx.fillRect(0,0,900,380);ctx.font='700 26px sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText('Kick mit dem Unterkörper',450,40);
 ctx.strokeStyle='#ffffff44';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(90,310);ctx.lineTo(820,310);ctx.stroke();
 w.attacker=a;w.victim=v;
 run("pin(kickPreview,600+(victim.x-150)*4,305+(victim.y-270)*.35-(victim.z||0),4,COL[2],6,victim);pin(kickPreview,600+(attacker.x-150)*4,305+(attacker.y-270)*.35,4,COL[0],0,attacker)");
 ctx.fillStyle='#d9c8ff';ctx.font='700 18px sans-serif';ctx.fillText(r.tag==='end'?'Zurück ins Haus':r.victim?'Treffer!':r.attacker&&r.attacker.kick?'Ausholen und zustoßen':'Anlaufen',450,360);
 writeFileSync(out+'/frame-'+String(i).padStart(2,'0')+'.png',preview.toBuffer('image/png'));
}
// Bot intent responses, one reply at a time, and cancellation on a new round.
run('tnow=0');const bot=run('G.pl[1]'),state=run('G');
assert.ok(w.KKBotChat.replyFor('Wie spielt man?',bot,state).includes('6'));
assert.ok(w.KKBotChat.replyFor('Wer ist dran?',bot,state).includes(state.pl[state.turn].n));
assert.ok(w.KKBotChat.replyFor('Hallo Karl',bot,state).includes('Hallo'));
run("sendChat('Hallo Karl')");await sleep(35);assert.ok(run("bub[1].t.includes('Hallo')"));
const last=run('bub[1].t');run("KKBotChat.respond('L','Wer ist dran?');beginGame(mk([{n:'Anna',uid:'L',skin:0},{n:'Karl',uid:'B0',bot:1,skin:6}]))");await sleep(35);assert.equal(run('bub[1].t'),last);
console.log('PASS: bot replies match greeting/rules/turn, human chat triggers answer, new round cancels pending answer');
// Auto-move never steals a choice and ignores a changed phase.
const actions=[];w.actions=actions;run('act=a=>actions.push(a)');
run("G=mk([{uid:'L',n:'Anna',skin:0},{uid:'b',n:'Ben',skin:0}]);G.phase='move';G.d=1;G.pc[0]=[2,4,-1,-1];ui()");await sleep(110);assert.equal(actions.length,0);
run("G.pc[0]=[-1,-1,-1,2];ui();G.phase='roll'");await sleep(110);assert.equal(actions.length,0);
run("G.phase='move';ui()");await sleep(110);assert.equal(actions.length,1);assert.equal(actions[0].i,3);
console.log('PASS: auto-move only when exactly one legal choice exists; stale phase cancels timer');
dom.window.close();
