/* Responsive controls and a consistent route to the website home page. */
(() => {
  const config=window.KKOnlineConfig||{};
  const home=config.home||'/';
  document.querySelectorAll('.custom-logo-link,.site-branding a[rel="home"],a.brand[rel="home"],.site-logo a').forEach(link=>{link.href=home;link.dataset.kkHome='1';});
  document.querySelectorAll('img.custom-logo').forEach(image=>{
    let link=image.closest('a');
    if(!link){link=document.createElement('a');image.replaceWith(link);link.append(image);}
    link.href=home;link.dataset.kkHome='1';link.setAttribute('aria-label','Zur Startseite');
  });
  if(!document.querySelector('#home #bMk'))return;
  let tries=0;
  const ready=setInterval(()=>{
    if(typeof ui!=='function'||typeof act!=='function'||!document.querySelector('#game')){if(++tries>600)clearInterval(ready);return;}
    clearInterval(ready);install();
  },300);
  function install(){
    if(document.documentElement.dataset.kkControls)return;
    document.documentElement.dataset.kkControls='1';
    const mobile=()=>window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;
    const game=document.querySelector('#game');
    const brand=document.createElement('a');brand.id='kk-home-logo';brand.href=home;brand.dataset.kkHome='1';brand.textContent='🎳 Kegel-Krach';brand.setAttribute('aria-label','Zur Startseite');document.body.append(brand);
    for(const heading of document.querySelectorAll('#home h1,#lobby h1')){
      if(heading.closest('a'))continue;
      const link=document.createElement('a');link.href=home;link.dataset.kkHome='1';link.setAttribute('aria-label','Zur Startseite');
      for(const node of [...heading.childNodes])if(node.nodeType===3)link.append(node);
      heading.prepend(link);
    }
    document.addEventListener('click',async event=>{
      const link=event.target.closest&&event.target.closest('a[data-kk-home]');
      if(!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||!R)return;
      event.preventDefault();
      // The online module supplies a clean departure before navigation.
      if(window.KKOnlineLeave)await Promise.race([window.KKOnlineLeave(),new Promise(resolve=>setTimeout(resolve,1200))]);
      window.location.assign(home);
    });
    const controls=document.createElement('section');controls.id='kk-touch-controls';controls.setAttribute('aria-label','Spielsteuerung');
    const status=document.createElement('div');status.id='kk-control-status';status.setAttribute('aria-live','polite');
    const roll=document.createElement('button');roll.id='kk-roll';roll.type='button';roll.textContent='🎲 Würfeln';
    const moves=document.createElement('div');moves.id='kk-moves';
    const buttons=Array.from({length:4},(_,i)=>{
      const button=document.createElement('button');button.type='button';button.textContent='Figur '+(i+1);button.setAttribute('aria-label','Figur '+(i+1)+' bewegen');moves.append(button);return button;
    });
    controls.append(status,roll,moves);game.append(controls);
    const chat=document.querySelector('#eb');
    const chatToggle=document.createElement('button');chatToggle.id='kk-chat-toggle';chatToggle.className='g';chatToggle.textContent='💬 Chat';chatToggle.type='button';chatToggle.setAttribute('aria-expanded','false');game.append(chatToggle);
    chatToggle.onclick=()=>{
      const open=game.classList.toggle('kk-chat-open');chatToggle.setAttribute('aria-expanded',String(open));
      if(open){const input=chat.querySelector('input');if(input)input.focus();}
    };
    chat.querySelector('input')?.addEventListener('keydown',event=>{
      if(event.key==='Enter'){game.classList.remove('kk-chat-open');chatToggle.setAttribute('aria-expanded','false');event.target.blur();}
    });
    let pending=false,pendingKey='',lastStatus='';
    const key=()=>G?JSON.stringify([R?R.epoch:0,G.turn,G.phase,G.d,G.pc,G.tries,G.win]):'';
    function send(action){
      if(pending||busy||!G||G.win!=null||!isMine(G.turn))return;
      if(action.t==='move'&&(G.phase!=='move'||!hl.includes(action.i)))return;
      if(action.t==='roll'&&G.phase!=='roll')return;
      pending=true;pendingKey=key();update();act(action);
    }
    roll.onclick=()=>send({t:'roll'});buttons.forEach((button,i)=>button.onclick=()=>send({t:'move',i}));
    const oldUI=ui;
    ui=function(){
      if(!mobile()){oldUI();return;}
      if(!G||G.win!=null)return;
      setTurn();hl=[];
      if(isMine(G.turn)&&G.phase==='move')hl=legal(G,G.turn,G.d);
      // The mobile roll button replaces the blocking "tap the die" prompt.
      document.querySelector('#dpop').classList.remove('on');
      update();
    };
    function update(){
      if(pending&&(key()!==pendingKey||!G||(R&&R.closed)))pending=false;
      const mine=!!G&&G.win==null&&isMine(G.turn);
      const enabled=mine&&!busy&&!pending;
      const selecting=mine&&G.phase==='move';
      roll.hidden=selecting;moves.hidden=!selecting;
      roll.disabled=!enabled||G.phase!=='roll';
      const rollText=pending?'Zug wird gesendet…':busy?'Animation läuft…':'🎲 Würfeln';
      if(roll.textContent!==rollText)roll.textContent=rollText;
      buttons.forEach((button,i)=>{button.disabled=!enabled||G.phase!=='move'||!hl.includes(i);});
      controls.style.setProperty('--kk-player',G?COL[G.pl[G.turn].s]:'#ffd60a');
      const text=!G?'Bereit':G.win!=null?'Partie beendet':!mine?'Warte auf '+G.pl[G.turn].n:pending?'Dein Zug wird übertragen':busy?'Bitte kurz warten':G.phase==='roll'?'Du bist dran – würfle!':'Wähle eine Figur · gewürfelt: '+G.d;
      if(text!==lastStatus){status.textContent=text;lastStatus=text;}
    }
    const ticker=setInterval(()=>{if(!document.documentElement.isConnected){clearInterval(ticker);return;}update();},120);
    let previousMobile=mobile();
    window.addEventListener('resize',()=>{
      if(G&&!busy&&mobile()!==previousMobile){previousMobile=mobile();ui();}
      if(G)fit();
    });
    update();
  }
})();
