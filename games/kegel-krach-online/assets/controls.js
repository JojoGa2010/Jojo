/* Responsive controls and a consistent route to the website home page. */
(() => {
  const config=window.KKOnlineConfig||{};
  const home=config.game||(document.querySelector('#home #bMk')?window.location.pathname:'/spiel/');
  document.querySelectorAll('.custom-logo-link,.site-branding a[rel="home"],a.brand[rel="home"],.site-logo a').forEach(link=>{link.href=home;link.dataset.kkHome='1';});
  document.querySelectorAll('img.custom-logo').forEach(image=>{
    let link=image.closest('a');
    if(!link){link=document.createElement('a');image.replaceWith(link);link.append(image);}
    link.href=home;link.dataset.kkHome='1';link.setAttribute('aria-label','Zur Start-Lobby');
  });
  if(!document.querySelector('#home #bMk'))return;
  let tries=0;
  const ready=setInterval(()=>{
    if(typeof ui!=='function'||typeof act!=='function'||document.documentElement.dataset.kkPlayers!=='6'||!document.querySelector('#game')){if(++tries>600)clearInterval(ready);return;}
    clearInterval(ready);install();
  },300);
  function install(){
    if(document.documentElement.dataset.kkControls)return;
    document.documentElement.dataset.kkControls='1';
    const game=document.querySelector('#game');
    function mark(){const image=document.createElement('img');image.src=(config.assets||'/')+'logo.svg';image.alt='';image.width=32;image.height=32;return image;}
    const brand=document.createElement('a');brand.id='kk-home-logo';brand.href=home;brand.dataset.kkHome='1';brand.append(mark(),document.createTextNode('Kegel-Krach'));brand.setAttribute('aria-label','Zur Start-Lobby');document.body.append(brand);
    for(const heading of document.querySelectorAll('#home h1,#lobby h1')){
      if(heading.closest('a'))continue;
      const link=document.createElement('a');link.href=home;link.dataset.kkHome='1';link.setAttribute('aria-label','Zur Start-Lobby');
      const label=heading.closest('#home')?'Kegel-Krach':'Lobby';
      for(const node of [...heading.childNodes])if(node.nodeType===3)node.remove();
      if(heading.closest('#home'))link.append(mark());
      link.append(document.createTextNode(label));
      heading.prepend(link);
    }
    document.addEventListener('click',async event=>{
      const link=event.target.closest&&event.target.closest('a[data-kk-home]');
      if(!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      event.preventDefault();
      // The online module supplies a clean departure before navigation.
      if(R&&window.KKOnlineLeave)await Promise.race([window.KKOnlineLeave(),new Promise(resolve=>setTimeout(resolve,1200))]);
      window.location.assign(home);
    });
    const clock=document.createElement('small');clock.id='kk-stopwatch';clock.setAttribute('role','timer');clock.setAttribute('aria-live','off');clock.title='Spielzeit';
    const die=document.querySelector('#die');die.setAttribute('role','button');die.setAttribute('aria-label','Würfel antippen');die.tabIndex=0;
    die.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();if(!busy&&!document.querySelector('#dbtn').hidden)die.click();}});
    document.querySelector('#game .hud').append(clock);
    let started=null,ended=null,lastClock='';
    function updateClock(){
      die.setAttribute('aria-disabled',String(busy||document.querySelector('#dbtn').hidden));
      if(!G){started=null;ended=null;}
      if(G&&started===null)started=performance.now();
      if(G&&G.win!=null&&ended===null)ended=performance.now();
      const seconds=started===null?0:Math.max(0,Math.floor(((ended??performance.now())-started)/1000));
      const two=n=>String(n).padStart(2,'0');
      const text=seconds>=3600?Math.floor(seconds/3600)+':'+two(Math.floor(seconds/60)%60)+':'+two(seconds%60):two(Math.floor(seconds/60))+':'+two(seconds%60);
      if(text!==lastClock){clock.textContent=text;clock.setAttribute('aria-label','Spielzeit '+text);lastClock=text;}
    }
    function canvasOffset(){game.style.setProperty('--kk-cv-left',cv.offsetLeft+'px');game.style.setProperty('--kk-cv-top',cv.offsetTop+'px');}
    const originalBegin=beginGame;
    beginGame=function(state){started=performance.now();ended=null;originalBegin(state);canvasOffset();updateClock();};
    // Keep the die prompt; execute a sole legal move after a short clear pause.
    ui=function(){
      if(!G||G.win!=null)return;
      setTurn();hl=[];
      if(!isMine(G.turn))return;
      if(G.phase==='roll'){
        document.querySelector('#dpop').classList.add('on');
        document.querySelector('#dl').textContent=G.pl[G.turn].n+', tippe auf den Würfel!';
        document.querySelector('#dbtn').hidden=false;
        resetDie();document.querySelector('#die').classList.add('ask');
      }else{
        hl=legal(G,G.turn,G.d);
        if(hl.length===1){
          const state=G,connection=R,seat=G.turn,index=hl[0],ticket=++stamp;
          setTimeout(()=>{
            if(ticket!==stamp||G!==state||R!==connection||busy||!G||G.win!=null||G.turn!==seat||G.phase!=='move'||!isMine(seat)||(R&&(R.closed||R.paused)))return;
            const choices=legal(G,seat,G.d);if(choices.length===1&&choices[0]===index){stamp++;act({t:'move',i:index});}
          },650);
        }
      }
    };
    const chat=document.querySelector('#eb');
    const chatToggle=document.createElement('button');chatToggle.id='kk-chat-toggle';chatToggle.className='g';chatToggle.textContent='Chat';chatToggle.type='button';chatToggle.setAttribute('aria-expanded','false');game.append(chatToggle);
    chatToggle.onclick=()=>{
      const open=game.classList.toggle('kk-chat-open');chatToggle.setAttribute('aria-expanded',String(open));
      if(open){const input=chat.querySelector('input');if(input)input.focus();}
    };
    chat.querySelector('input')?.addEventListener('keydown',event=>{
      if(event.key==='Enter'){game.classList.remove('kk-chat-open');chatToggle.setAttribute('aria-expanded','false');event.target.blur();}
    });
    const ticker=setInterval(updateClock,200);
    window.addEventListener('pagehide',()=>clearInterval(ticker),{once:true});
    window.addEventListener('resize',()=>{if(G){fit();canvasOffset();}});
    updateClock();
  }
})();
