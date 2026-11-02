import{readFileSync,writeFileSync,mkdirSync}from'node:fs';
import{runInContext}from'node:vm';
import assert from'node:assert/strict';
import{JSDOM}from'jsdom';
import{createCanvas}from'@napi-rs/canvas';
const html=readFileSync(process.argv[2],'utf8'),out=process.argv[3]||'/tmp/kegel-animation';mkdirSync(out,{recursive:true});
const dom=new JSDOM(html.replace(/<script>[\s\S]*?<\/script>/,''),{url:'https://example.test/spiel/',runScripts:'outside-only'}),w=dom.window;
const motion={matches:false};w.matchMedia=()=>motion;w.requestAnimationFrame=()=>0;
const surfaces=new WeakMap();w.HTMLCanvasElement.prototype.getContext=function(){
 let canvas=surfaces.get(this);if(!canvas){canvas=createCanvas(this.width,this.height);surfaces.set(this,canvas);const ctx=canvas.getContext('2d'),draw=ctx.drawImage.bind(ctx);ctx.drawImage=(image,...args)=>draw(surfaces.get(image)||image,...args);}
 return canvas.getContext('2d');
};
const run=s=>runInContext(s,dom.getInternalVMContext());run(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
run(readFileSync(new URL('../assets/players.js',import.meta.url),'utf8'));
await new Promise(r=>setTimeout(r,150));const basePin=run('pin');
run(readFileSync(new URL('../assets/visuals.js',import.meta.url),'utf8'));
run(readFileSync(new URL('../assets/animation.js',import.meta.url),'utf8'));await new Promise(r=>setTimeout(r,310));
assert.equal(w.document.documentElement.dataset.kkAnimation,'1');
const rig=w.KKFigureAnimation;
for(let t=0;t<8;t+=.13){
 const pose=rig.poseAt(t,1),foot=rig.deform(0,0,pose);assert.ok(Math.hypot(...foot)<1e-9);
 for(let y=-84;y<4;y+=2){
  const a=rig.deform(-24,y,pose),b=rig.deform(24,y,pose),c=rig.deform(-24,y+1,pose);
  assert.ok((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])>0,'no folded mesh');
 }
 assert.notEqual(pose.head,pose.upper);assert.notEqual(pose.upper,pose.lower);
}
console.log('PASS: head, upper and lower body move independently; foot fixed; no folded mesh');
for(let direction=0;direction<8;direction++){
 const x=Math.cos(direction*Math.PI/4),y=Math.sin(direction*Math.PI/4),p=rig.kickPose({x,y,amount:1}),foot=rig.deform(0,0,p);
 assert.ok(foot[0]*x+foot[1]*y>6,'lower body kicks toward target');
}
console.log('PASS: lower-body kick points toward the victim in eight directions');
const before=createCanvas(120,160),after=createCanvas(120,160);run('tnow=.6');
basePin(before.getContext('2d'),60,130,1.6,'#ff4d6d',0,{});run('pin')(after.getContext('2d'),60,130,1.6,'#ff4d6d',0,{});
assert.ok(before.toBuffer('image/png').equals(after.toBuffer('image/png')));
run("G=mk([{n:'Du',uid:me.uid,skin:0},{n:'Bot',uid:'other',skin:29}]);show('game')");
const state=run('JSON.stringify(G)'),montage=createCanvas(900,380),ctx=montage.getContext('2d');
const drawImage=ctx.drawImage.bind(ctx);ctx.drawImage=(image,...args)=>drawImage(surfaces.get(image)||image,...args);w.previewContext=ctx;
const frames=[];
for(let frame=0;frame<36;frame++){
 const t=frame/12;run('tnow='+t);ctx.fillStyle='#201942';ctx.fillRect(0,0,900,380);
 ctx.font='700 24px sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText('Kopf · Oberkörper · Unterkörper',450,42);
 run("[0,7,23,29].forEach((skin,i)=>pin(previewContext,120+i*220,295,2.5,COL[i],skin,{ph:i}))");
 if(frame===0||frame===12||frame===24)writeFileSync(out+'/pose-'+frame+'.png',montage.toBuffer('image/png'));
 writeFileSync(out+'/frame-'+String(frame).padStart(2,'0')+'.png',montage.toBuffer('image/png'));
 frames.push(Buffer.from(ctx.getImageData(0,0,900,380).data));
}
assert.ok(!frames[0].equals(frames[12]));
const all=createCanvas(1200,1430),allCtx=all.getContext('2d'),allDraw=allCtx.drawImage.bind(allCtx);allCtx.drawImage=(image,...args)=>allDraw(surfaces.get(image)||image,...args);w.allContext=allCtx;
allCtx.fillStyle='#201942';allCtx.fillRect(0,0,1200,1430);
run("for(let i=0;i<30;i++){pin(allContext,120+i%5*240,180+Math.floor(i/5)*230,2,COL[i%6],i,{ph:i});}");
writeFileSync(out+'/all-animated.png',all.toBuffer('image/png'));
assert.equal(run('JSON.stringify(G)'),state);assert.ok(rig.cacheSize()<=128);
motion.matches=true;const still=[];
for(const t of[0,1,2]){run('tnow='+t);const image=createCanvas(160,200),c=image.getContext('2d');run('pin')(c,80,170,2,'#ff4d6d',12,{ph:1});still.push(image.toBuffer('image/png'));}
assert.ok(still[0].equals(still[1])&&still[1].equals(still[2]));
motion.matches=false;
const gameCanvas=w.document.querySelector('#cv');gameCanvas.width=1100;gameCanvas.height=1100;gameCanvas.getBoundingClientRect=()=>({left:0,top:0,width:1100,height:1100});
for(const count of[2,6])for(let skin=0;skin<30;skin++)for(const time of[0,.8,1.6]){
 run(`G=mk(Array.from({length:${count}},(_,i)=>({n:'P'+i,uid:'u'+i,skin:i===0?${skin}:0})));G.pc[0][0]=0;G.phase='move';G.d=1;hl=[0];busy=false;tnow=${time};act=a=>{globalThis.tap=a};`);
 const target=run(`(()=>{const q=G.pl.length>4?KKBoard.position(0,0,0):wp(0,0,0),base=w2s(q[0],q[1]+14),body=KKFigureAnimation.deform(0,-20,KKFigureAnimation.poseAt(tnow,${skin}*.41));return[base[0]+body[0]*.85*base[2],base[1]+body[1]*.85*base[2]]})()`);
 w.tap=null;gameCanvas.dispatchEvent(new w.MouseEvent('pointerdown',{clientX:target[0],clientY:target[1],bubbles:true}));assert.equal(w.tap.i,0);
}
console.log('PASS: all 30 skins animate, previews unchanged, state unchanged, cache bounded; reduced-motion stays still');
console.log('PASS: moving bodies remain tappable for all 30 skins on original and six-player boards');
dom.window.close();
