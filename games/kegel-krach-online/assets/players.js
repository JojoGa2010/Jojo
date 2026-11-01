/* Six seats, ten classic-style skins; original 2–4-player board is preserved. */
(() => {
  let tries=0;
  const timer=setInterval(()=>{
    if(typeof mk!=='function'||typeof SKN==='undefined'){if(++tries>600)clearInterval(timer);return;}
    clearInterval(timer);install();
  },120);
  function install(){
    if(document.documentElement.dataset.kkPlayers)return;
    document.documentElement.dataset.kkPlayers='6';
    COL.push('#9b6dff','#ff9b35');CN.push('Lila','Orange');
    SKN.push('Pilot','Wikinger','Pirat','Zauberer','Ninja','Astronaut');
    BN.push('Kegel-Klara','Krach-Kurt');
    const oldPin=pin;
    pin=function(ctx,x,y,scale,color,skin,options={}){
      if(skin<4){oldPin(ctx,x,y,scale,color,skin,options);return;}
      oldPin(ctx,x,y,scale,color,0,options);
      const sq=options.sq||1;
      ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(tnow*2.2+(options.ph||0))*.06+(options.rot||0));ctx.scale(scale*(2-sq),scale*sq);
      ctx.lineWidth=1.5;ctx.strokeStyle='#14213d';
      if(skin===4){
        ctx.fillStyle='#69462d';ctx.beginPath();ctx.roundRect(-9,-60,18,12,5);ctx.fill();ctx.stroke();
        ctx.fillStyle='#aee7ff';for(const ex of [-4,4]){ctx.beginPath();ctx.ellipse(ex,-48,4,3,0,0,7);ctx.fill();ctx.stroke();}
      }else if(skin===5){
        ctx.fillStyle='#9eafba';ctx.beginPath();ctx.arc(0,-52,10,Math.PI,0);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#fff4d1';for(const sign of [-1,1]){ctx.beginPath();ctx.moveTo(sign*8,-55);ctx.lineTo(sign*15,-65);ctx.lineTo(sign*13,-52);ctx.closePath();ctx.fill();ctx.stroke();}
      }else if(skin===6){
        ctx.fillStyle='#202031';ctx.beginPath();ctx.moveTo(-13,-50);ctx.quadraticCurveTo(0,-72,13,-50);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#fff';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText('×',0,-55);
        ctx.fillStyle='#111';ctx.beginPath();ctx.arc(-3.3,-44,3.8,0,7);ctx.fill();
      }else if(skin===7){
        ctx.fillStyle='#543594';ctx.beginPath();ctx.moveTo(-10,-51);ctx.lineTo(-2,-77);ctx.lineTo(9,-51);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#ffe17c';ctx.beginPath();ctx.arc(-1,-61,2,0,7);ctx.fill();ctx.fillRect(-12,-52,24,3);
      }else if(skin===8){
        ctx.fillStyle='#232b3e';ctx.beginPath();ctx.ellipse(0,-48,9,5,0,0,7);ctx.fill();
        ctx.fillRect(-8,-41,16,8);ctx.strokeStyle='#e65b69';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(7,-48);ctx.lineTo(17,-44);ctx.lineTo(11,-42);ctx.stroke();
      }else{
        ctx.fillStyle='#e8edf6';ctx.beginPath();ctx.arc(0,-48,12,Math.PI,0);ctx.lineTo(11,-38);ctx.lineTo(-11,-38);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#9fd6ef99';ctx.beginPath();ctx.ellipse(0,-44,9,7,0,0,7);ctx.fill();ctx.stroke();
        ctx.fillStyle='#fff';ctx.fillRect(-6,-56,5,2);
      }
      ctx.restore();
    };
    for(let i=4;i<10;i++){
      const button=document.createElement('button');button.className='sk';
      const canvas=document.createElement('canvas');canvas.width=120;canvas.height=140;
      button.append(canvas,document.createTextNode(SKN[i]));
      button.onclick=()=>{me.skin=i;try{localStorage.setItem('kk_s',i);}catch(_) {}};
      sks.append(button);
    }
    me.skin=Math.max(0,Math.min(9,me.skin));
    for(let i=4;i<=5;i++){const option=document.createElement('option');option.value=i;option.textContent=i+' Bots';document.querySelector('#nb').append(option);}
    const fillCount=document.createElement('select');fillCount.id='kk-fill-count';fillCount.setAttribute('aria-label','Mit Bots auf diese Spielerzahl auffüllen');
    for(let i=2;i<=6;i++){const option=document.createElement('option');option.value=i;option.textContent='Auf '+i+' Spieler auffüllen';option.selected=i===4;fillCount.append(option);}
    document.querySelector('#fl').append(fillCount);
    const style=document.createElement('style');style.textContent='#sks.skins{grid-template-columns:repeat(5,minmax(0,1fr))}#sks .sk{min-width:0;overflow-wrap:anywhere}#kk-fill-count{font-size:16px}';document.body.append(style);
    const description=document.querySelector('[data-m="Fr"] span');if(description)description.textContent='Private Lobby mit Code, 2–6 Spieler';
    drawL=function(){
      const list=document.querySelector('#lp');list.textContent='';
      for(let i=0;i<6;i++){
        const person=L[i],slot=document.createElement('div');slot.className='sl'+(person?'':' em');slot.style.setProperty('--c',COL[i]);
        if(person){
          const canvas=document.createElement('canvas');canvas.width=80;canvas.height=90;canvas.dataset.s=i;canvas.dataset.k=person.skin;
          const name=document.createElement('b');name.textContent=(i===0?'👑 ':'')+person.n;
          const skin=document.createElement('small');skin.textContent=CN[i]+' · '+SKN[person.skin];slot.append(canvas,name,skin);
        }else slot.textContent='Wartet auf Spieler…';
        list.append(slot);
      }
      document.querySelector('#lw2').textContent=L.length+'/6 Spieler';
    };
    const six=()=>!!G&&G.pl.length>4;
    const angle=s=>-Math.PI/2+s*Math.PI/3;
    const circle=(r,a)=>[330+r*Math.cos(a),330+r*Math.sin(a)];
    const bank=s=>circle(177,angle(s)+Math.PI/6);
    function position(s,value,i){
      if(value<0){const b=bank(s);return[b[0]+(i%2?23:-23),b[1]+(i<2?-24:24)];}
      if(value<60)return circle(280,angle(s)+value*Math.PI/30);
      return circle(244-(value-60)*30,angle(s));
    }
    window.KKBoard={position,six,skinHeights:[52,62,76,64,64,67,65,78,56,68],skinWidths:[1,1.3,.8,1.05,1,1,1,1,1,1]};
    const mkOld=mk,legalOld=legal,moveOld=doMove,botOld=botPick,boardOld=board,piecesOld=pieces,bubblesOld=bubbles,playOld=play,diceOld=dice;
    mk=function(players){
      if(players.length<2||players.length>6)throw new Error('Zwei bis sechs Spieler erforderlich.');
      if(players.length<=4)return mkOld(players);
      return{pl:players.map((p,s)=>({...p,s})),pc:players.map(()=>[-1,-1,-1,-1]),turn:0,d:0,phase:'roll',tries:0,win:null};
    };
    document.querySelector('#bBot').onclick=()=>{
      names();isHost=true;if(R&&R.close)R.close();R=null;
      const players=[{n:me.n,skin:me.skin,uid:'L'}];
      for(let i=0;i<Number(document.querySelector('#nb').value);i++)players.push({n:BN[i],skin:rnd(10),bot:1,uid:'B'+i});
      beginGame(mk(players));
    };
    legal=function(state,k,d){
      if(state.pl.length<=4)return legalOld(state,k,d);
      const values=state.pc[k];return values.flatMap((v,i)=>{
        const n=v<0?(d===6?0:-1):v+d;
        return n>=0&&n<=63&&!values.some((u,j)=>i!==j&&u===n)?[i]:[];
      });
    };
    doMove=function(k,i){
      if(H.pl.length<=4)return moveOld(k,i);
      const from=H.pc[k][i],to=from<0?0:from+H.d;let cap=null;
      if(to<60){const absolute=(H.pl[k].s*10+to)%60;H.pl.forEach((p,j)=>{if(j!==k)H.pc[j].forEach((v,n)=>{if(v>=0&&v<60&&(p.s*10+v)%60===absolute)cap=[j,n];});});}
      if(cap)H.pc[cap[0]][cap[1]]=-1;H.pc[k][i]=to;
      const won=H.pc[k].every(v=>v>=60);if(!won&&H.d!==6)H.turn=nextT(H);H.tries=0;H.phase='roll';
      const events=[{t:'move',k,i,from,to,cap,home:H.pc[k].filter(v=>v>=60).length,snap:cl(H)}];
      if(won){H.win=k;events.push({t:'win',k,snap:cl(H)});}return events;
    };
    botPick=function(k){
      if(H.pl.length<=4)return botOld(k);
      const choices=legal(H,k,H.d);
      const score=i=>{
        const v=H.pc[k][i],n=v<0?0:v+H.d;let result=n+(v<0?30:0)+(n>=60?80:0);
        if(n<60)H.pl.forEach((p,j)=>{if(j!==k)H.pc[j].forEach(u=>{if(u>=0&&u<60&&(p.s*10+u)%60===(H.pl[k].s*10+n)%60)result+=100;});});
        return result;
      };
      return choices.sort((a,b)=>score(b)-score(a))[0];
    };
    function cell(x,y,r,color){c.beginPath();c.arc(x+1,y+3,r,0,7);c.fillStyle='#0004';c.fill();c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=color;c.fill();c.strokeStyle='#0003';c.lineWidth=1.5;c.stroke();}
    board=function(){
      if(!six()){boardOld();return;}
      c.save();const frame=c.createLinearGradient(0,0,0,700);frame.addColorStop(0,TH.fr[1]);frame.addColorStop(1,TH.fr[0]);
      c.fillStyle=frame;c.beginPath();c.roundRect(-24,-24,708,708,50);c.fill();
      const surface=c.createRadialGradient(330,330,40,330,330,430);surface.addColorStop(0,TH.bd);surface.addColorStop(1,TH.gr);
      c.fillStyle=surface;c.beginPath();c.roundRect(-6,-6,672,672,34);c.fill();c.strokeStyle='#fff8';c.lineWidth=4;c.stroke();
      for(let s=0;s<6;s++){
        const b=bank(s),used=G.pl.some(p=>p.s===s);c.globalAlpha=used?1:.25;
        c.fillStyle=COL[s]+'77';c.beginPath();c.roundRect(b[0]-55,b[1]-60,110,120,22);c.fill();c.strokeStyle=COL[s];c.lineWidth=2;c.stroke();
        for(let i=0;i<4;i++){const p=position(s,-1,i);cell(p[0],p[1]+6,17,'#ffffff55');}
        for(let i=0;i<4;i++){const p=position(s,60+i,0);cell(...p,12,COL[s]);}
        const person=G.pl.find(p=>p.s===s);if(person){c.font='700 12px system-ui';c.textAlign='center';c.fillStyle='#14213d';c.fillText(person.n,b[0],b[1]+53,100);}
      }
      c.globalAlpha=1;
      for(let i=0;i<60;i++){const p=position(0,i,0);cell(...p,10,i%10===0?COL[i/10]:TH.cell);}
      c.restore();
    };
    pieces=function(){
      if(!six()){piecesOld();return;}
      const figures=[];G.pl.forEach((p,k)=>G.pc[k].forEach((v,i)=>{let q=position(p.s,v,i),o={ph:i+k};for(const a of[ov,ov2])if(a&&a.k===k&&a.i===i){q=[a.x,a.y];o={...a};}figures.push({p,k,i,q,o});}));
      figures.sort((a,b)=>a.q[1]-b.q[1]);
      for(const e of figures){const[x,y]=e.q,z=e.o.z||0;c.save();c.fillStyle='#0004';c.beginPath();c.ellipse(x,y+14,Math.max(2,14-z/25),5,0,0,7);c.fill();
        if(G.turn===e.k&&hl.includes(e.i)){c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.ellipse(x,y+14,18,8,0,0,7);c.stroke();}
        c.translate(x,y+14);c.scale(1,1/(1-.42*tl));pin(c,0,-z,.85,COL[e.p.s],e.p.skin,e.o);c.restore();}
    };
    bubbles=function(){
      if(!six()){bubblesOld();return;}
      c.save();c.font='700 12px system-ui';c.textAlign='center';
      G.pl.forEach((p,k)=>{const item=bub[k];if(!item||item.u<performance.now())return;const b=bank(p.s);c.fillStyle='#fff';c.beginPath();c.roundRect(b[0]-60,b[1]-80,120,24,10);c.fill();c.fillStyle='#14213d';c.fillText(item.t,b[0],b[1]-64,112);});c.restore();
    };
    dice=async function(event,name){
      if(!six()||isMine(event.k))return diceOld(event,name);
      const b=bank(G.pl[event.k].s),p=w2s(...b),ratio=devicePixelRatio||1,mini=document.querySelector('#mini');
      mini.style.left=p[0]/ratio-30+'px';mini.style.top=p[1]/ratio-34+'px';document.querySelector('#ml').textContent=name;mini.hidden=false;
      await rollCube(document.querySelector('#mc'),event);await T(900);mini.hidden=true;
    };
    async function step(k,i,a,b){
      const start=position(G.pl[k].s,a,i),end=position(G.pl[k].s,b,i);
      await tween(a<0?420:240,p=>{ov={k,i,x:start[0]+(end[0]-start[0])*p,y:start[1]+(end[1]-start[1])*p,z:Math.sin(p*Math.PI)*30,sq:1+Math.sin(p*Math.PI*2)*.1};});
    }
    play=async function(event){
      if(!six())return playOld(event);
      const{k,i}=event;
      if(event.t==='roll'){await dice(event,G.pl[k].n);if(event.d===6)say(pk(SIX));if(event.none)say(pk(NO));G=event.snap;setTurn();}
      else if(event.t==='move'){
        hl=[];if(event.from<0)await step(k,i,-1,0);else for(let v=event.from;v<event.to;v++)await step(k,i,v,v+1);
        if(event.cap){const[j,n]=event.cap,start=position(G.pl[j].s,G.pc[j][n],n),end=position(G.pl[j].s,-1,n);say(pk(KICK));
          await tween(1100,p=>{ov2={k:j,i:n,x:start[0]+(end[0]-start[0])*p,y:start[1]+(end[1]-start[1])*p,z:Math.sin(p*Math.PI)*180,rot:p*12,face:1};});}
        ov=ov2=null;G=event.snap;if(event.to>=60&&event.from<60)say(pk(HOME));
      }else if(event.t==='win'){
        G=event.snap;hl=[];const mine=isMine(k),winner=G.pl[k];
        fw=setInterval(()=>burst(Math.random()*cv.width,Math.random()*cv.height*.7,40,260),450);
        pop(mine?'🏆 GEWONNEN!':'🏆 '+winner.n+' gewinnt!',mine?'Du hast alle vier Kegel ins Ziel gebracht!':'Die nächste Runde wartet.');
      }
    };
    // Leave space for the desktop HUD; mobile already reserves a canvas area.
    const oldDraw=draw,oldProject=w2s,framing=()=>six()&&cv.offsetTop===0?.88:1;
    draw=function(){const zoom=cam.z;cam.z*=framing();try{oldDraw();}finally{cam.z=zoom;}};
    w2s=function(x,y){const zoom=cam.z;cam.z*=framing();try{return oldProject(x,y);}finally{cam.z=zoom;}};
  }
})();
