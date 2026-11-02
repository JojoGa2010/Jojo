/* Contact-driven captures and lightweight conversational bot responses. */
(() => {
  let attempts=0;
  const ready=setInterval(()=>{
    if(document.documentElement.dataset.kkControls!=='1'||document.documentElement.dataset.kkOnline!=='1'||!window.KKFigureAnimation||!window.KKBotDialogue){if(++attempts>600)clearInterval(ready);return;}
    clearInterval(ready);install();
  },240);
  function install(){
    if(document.documentElement.dataset.kkBehaviors)return;
    document.documentElement.dataset.kkBehaviors='1';
    const coordinate=(side,value,index)=>G.pl.length>4?window.KKBoard.position(side,value,index):wp(side,value,index);
    const oldPlay=play,oldHop=hop;
    let capture=null;
    play=async function(event){capture=event.t==='move'&&event.cap?event:null;try{return await oldPlay(event);}finally{capture=null;}};
    hop=async function(k,i,from,to){
      if(!capture||capture.k!==k||capture.i!==i||capture.to!==to)return oldHop(k,i,from,to);
      const start=coordinate(G.pl[k].s,from,i),end=coordinate(G.pl[k].s,to,i),length=Math.hypot(end[0]-start[0],end[1]-start[1])||1;
      const target=[end[0]-(end[0]-start[0])/length*46,end[1]-(end[1]-start[1])/length*46];
      await tween(280,p=>{ov={k,i,x:start[0]+(target[0]-start[0])*p,y:start[1]+(target[1]-start[1])*p,z:Math.sin(p*Math.PI)*25,sq:1};});
    };
    kick=async function(event){
      const {k,i}=event,[victim,piece]=event.cap,side=G.pl[k].s;
      const target=coordinate(G.pl[victim].s,G.pc[victim][piece],piece),home=coordinate(G.pl[victim].s,-1,piece);
      const previous=coordinate(side,event.from<0?-1:event.to-1,i),length=Math.hypot(target[0]-previous[0],target[1]-previous[1])||1;
      const direction={x:(target[0]-previous[0])/length,y:(target[1]-previous[1])/length};
      const initial={...cam},oldTilt=tl,focus={x:target[0]-direction.x*15,y:target[1]-direction.y*15};
      const pose=(distance,amount)=>{ov={k,i,x:target[0]-direction.x*distance,y:target[1]-direction.y*distance,z:0,sq:1,rot:0,kick:{...direction,amount}};};
      const ease=p=>p*p*(3-2*p);
      say(pk(KICK));botTalk('kick',k,victim);
      try{
        await tween(380,p=>{const q=ease(p);pose(46,-.35*q);cam.x=initial.x+(focus.x-initial.x)*q;cam.y=initial.y+(focus.y-initial.y)*q;cam.z=initial.z+(1.75-initial.z)*q;tl=oldTilt*(1-q);});
        await tween(240,p=>pose(46,-.35-.1*Math.sin(p*Math.PI)));
        await tween(180,p=>{const q=ease(p);pose(46-28*q,-.35+1.35*q);});
        // Only after the lower body reaches the victim does the launch begin.
        const impact=w2s(...target);burst(impact[0],impact[1],42,210,45);big('BÄÄM!');
        const control=[target[0]+direction.x*120,target[1]+direction.y*120];
        await tween(1100,p=>{
          const q=1-Math.pow(1-p,2),r=1-q;
          pose(18*(1-ease(Math.min(1,p*2))),Math.max(0,1-p*2.5));
          ov2={k:victim,i:piece,x:r*r*target[0]+2*r*q*control[0]+q*q*home[0],y:r*r*target[1]+2*r*q*control[1]+q*q*home[1],z:Math.sin(p*Math.PI)*220,rot:p*10*(direction.x<0?-1:1),face:1,sq:1};
          cam.x=focus.x+(initial.x-focus.x)*ease(p);cam.y=focus.y+(initial.y-focus.y)*ease(p);cam.z=1.75+(initial.z-1.75)*ease(p);cam.sh=p<.12?8*(1-p/.12):0;
        });
        const landing=w2s(...home);burst(landing[0],landing[1],20,100,190);
      }finally{ov=ov2=null;cam={...initial,sh:0};tl=oldTilt;}
    };

    const normalize=text=>String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    function replyFor(text,bot,state,uid){
      return window.KKBotDialogue.reply(text,bot,state,uid);
    }
    const history=document.querySelector('#chat');history.setAttribute('role','log');history.setAttribute('aria-live','polite');
    function showReply(uid,message){
      if(!G)return;const index=G.pl.findIndex(p=>p.uid===uid&&p.bot);if(index<0)return;
      bubble(index,message);
      const line=document.createElement('div');line.textContent=G.pl[index].n+': '+message;history.append(line);
      while(history.children.length>2)history.firstChild.remove();setTimeout(()=>line.remove(),9000);
    }
    let round=0,pending=null,sequence=0,lastReply=0;const partners=new Map();
    const oldBegin=beginGame;
    beginGame=function(state){round++;partners.clear();if(pending)clearTimeout(pending);pending=null;lastReply=0;history.textContent='';window.KKBotDialogue.reset();oldBegin(state);};
    function respond(uid,text){
      if(!G||G.win!=null||(R&&!isHost)||pending)return;
      const bots=G.pl.filter(p=>p.bot);if(!bots.length)return;
      const t=normalize(text),addressed=bots.find(p=>normalize(p.n).split(/[-\s]+/).some(part=>part.length>2&&!['kegel','pinn','bowling','strike','krach'].includes(part)&&t.includes(part)));
      const bot=addressed||bots.find(p=>p.uid===partners.get(uid))||bots[sequence++%bots.length],party=round,connection=R;partners.set(uid,bot.uid);
      const delay=Math.max(800,1800-(Date.now()-lastReply));
      pending=setTimeout(()=>{
        pending=null;if(round!==party||R!==connection||!G||G.win!=null||(R&&(!isHost||R.closed||R.paused)))return;
        const index=G.pl.findIndex(p=>p.uid===bot.uid&&p.bot);if(index<0)return;
        const message=replyFor(text,G.pl[index],G,uid).slice(0,160);lastReply=Date.now();showReply(bot.uid,message);
        if(R)R.emit('bot_chat',{u:bot.uid,t:message});
      },delay);
    }
    const oldSend=sendChat;
    sendChat=function(text){const before=lastAt;oldSend(text);if(lastAt!==before&&(!R||isHost))respond(me.uid,text);};
    window.KKBotChat={respond,replyFor,showReply};
  }
})();
