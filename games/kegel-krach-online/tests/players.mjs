import{readFileSync,writeFileSync,mkdirSync}from'node:fs';
import{runInContext}from'node:vm';
import assert from'node:assert/strict';
import{JSDOM}from'jsdom';
import{createCanvas}from'@napi-rs/canvas';
const html=readFileSync(process.argv[2],'utf8'),out=process.argv[3]||'/tmp/kegel-six';mkdirSync(out,{recursive:true});
const dom=new JSDOM(html.replace(/<script>[\s\S]*?<\/script>/,''),{url:'https://example.test/spiel/',runScripts:'outside-only'}),w=dom.window;
w.requestAnimationFrame=()=>0;const surfaces=new WeakMap();
w.HTMLCanvasElement.prototype.getContext=function(){let s=surfaces.get(this);if(!s){s=createCanvas(this.width,this.height);surfaces.set(this,s);}return s.getContext('2d');};
const cv=w.document.querySelector('#cv');cv.width=1100;cv.height=1100;
const run=s=>runInContext(s,dom.getInternalVMContext());run(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
const originalPin=run('pin'),originalMk=run('mk');
run(readFileSync(new URL('../assets/players.js',import.meta.url),'utf8'));
run(readFileSync(new URL('../assets/visuals.js',import.meta.url),'utf8'));
await new Promise(r=>setTimeout(r,280));
assert.equal(run('SKN.length'),10);assert.equal(w.document.querySelectorAll('#sks button').length,10);
for(let skin=0;skin<4;skin++){
 const before=createCanvas(120,160),after=createCanvas(120,160);
 originalPin(before.getContext('2d'),60,130,1.6,'#ff4d6d',skin,{});
 run('pin')(after.getContext('2d'),60,130,1.6,'#ff4d6d',skin,{});
 assert.ok(before.toBuffer('image/png').equals(after.toBuffer('image/png')));
}
console.log('PASS: first four skins pixel-identical; ten selectable skins');
const sheet=createCanvas(1200,500),ctx=sheet.getContext('2d');ctx.fillStyle='#201942';ctx.fillRect(0,0,1200,500);w.sheetContext=ctx;
run(`for(let i=0;i<10;i++){const x=120+(i%5)*240,y=180+Math.floor(i/5)*230;pin(sheetContext,x,y,2,COL[i%6],i,{});sheetContext.fillStyle='#fff';sheetContext.font='700 20px sans-serif';sheetContext.textAlign='center';sheetContext.fillText(SKN[i],x,y+36);}`);
writeFileSync(out+'/skins.png',sheet.toBuffer('image/png'));
run(`G=mk(Array.from({length:6},(_,i)=>({n:'Spieler '+(i+1),skin:i+4,uid:'u'+i})));G.pc=G.pl.map(()=>[0,-1,60,63]);H=cl(G);draw();`);
writeFileSync(out+'/board-six.png',surfaces.get(cv).toBuffer('image/png'));
run('drawSk()');
assert.equal(run('mk([{uid:"a"},{uid:"b"},{uid:"c"},{uid:"d"}]).pl.map(p=>p.s).join()'),originalMk([{uid:'a'},{uid:'b'},{uid:'c'},{uid:'d'}]).pl.map(p=>p.s).join());
run(`H=mk(Array.from({length:6},(_,i)=>({uid:'u'+i,n:'P'+i,skin:i})));H.pc[1][0]=50;H.d=6;`);
const captured=run('doMove(0,0)');assert.equal(captured[0].cap.join(','),'1,0');assert.equal(run('H.pc[1][0]'),-1);
run('H.pc[0]=[0,1,-1,-1];H.d=1');assert.equal(run('legal(H,0,1).includes(0)'),false);
run('H.pc[0]=[60,61,62,59];H.d=4');assert.equal(run('legal(H,0,4).includes(3)'),true);
const won=run('doMove(0,3)');assert.equal(won[1].t,'win');assert.equal(won[1].snap.win,0);
assert.equal(run('legal(H,0,1).includes(3)'),false);
console.log('PASS: six-player capture, own blocking, exact goal and victory; original four-player assignments preserved');
for(let skin=4;skin<10;skin++){
 run(`G=mk(Array.from({length:6},(_,i)=>({uid:'u'+i,n:'P'+i,skin:${skin}})));G.pc[0][0]=0;G.phase='move';G.d=1;hl=[0];busy=false;act=a=>{globalThis.chosen=a};`);
 cv.getBoundingClientRect=()=>({left:0,top:0,width:1100,height:1100});
 const p=run('(()=>{const a=KKBoard.position(0,0,0),p=w2s(a[0],a[1]+14);return[p[0],p[1]-20*p[2]]})()');
 w.chosen=null;cv.dispatchEvent(new w.MouseEvent('pointerdown',{clientX:p[0],clientY:p[1],bubbles:true}));assert.equal(w.chosen.i,0);
}
console.log('PASS: each additional skin can be tapped on six-player board');dom.window.close();
