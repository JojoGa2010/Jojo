/* Farben-Krach: private hands stay on the WordPress server. */
(() => {
  'use strict';
  const colors={r:'Rot',y:'Gelb',g:'Grün',b:'Blau',w:'Farbwahl'};
  const symbols={skip:'⊘',reverse:'⇄',draw2:'+2',wild:'✦',draw4:'+4'};
  const names={skip:'Aussetzen',reverse:'Richtungswechsel',draw2:'Zwei ziehen',wild:'Farbe wählen',draw4:'Vier ziehen'};
  let attempts=0;
  const ready=setInterval(()=>{
    if(!window.KKOnlineConfig?.api||!document.querySelector('#home #modes')){if(++attempts>600)clearInterval(ready);return;}
    clearInterval(ready);install();
  },400);
  function install(){
    if(document.querySelector('#fk-app'))return;
    const menu=document.createElement('button');menu.className='mc fk-launch';menu.id='fk-launch';
    menu.innerHTML='<span class="fk-mini-cards" aria-hidden="true"><i>7</i><i>⇄</i><i>+2</i></span><b>Farben-Krach</b><span>Das Kartenspiel mit Farbwechsel · Bots & Freunde</span>';
    document.querySelector('#modes').append(menu);
    const app=document.createElement('section');app.id='fk-app';app.hidden=true;app.setAttribute('aria-label','Farben-Krach Kartenspiel');
    app.innerHTML='<header class="fk-header"><button id="fk-logo" class="fk-brand" aria-label="Zur Spielauswahl"><span class="fk-mark" aria-hidden="true">⇄</span><span>FARBEN<small>KRACH</small></span></button><span class="fk-edition">KARTEN AUF DEN TISCH.</span><span id="fk-time" aria-label="Spielzeit">00:00</span><button id="fk-close" class="fk-quiet">← Spielauswahl</button></header><main id="fk-main"></main><p id="fk-error" role="alert"></p><div id="fk-color" class="fk-shade" hidden><div class="fk-dialog" role="dialog" aria-modal="true" aria-labelledby="fk-color-title"><h2 id="fk-color-title">Deine Wunschfarbe?</h2><p>Mit welcher Farbe geht es weiter?</p><div id="fk-colors"></div><button id="fk-cancel" class="fk-quiet">Abbrechen</button></div></div>';
    document.body.append(app);
    const main=app.querySelector('#fk-main'),error=app.querySelector('#fk-error'),picker=app.querySelector('#fk-color');
    let session=null,view=null,pending=false,polling=false,timer=null,picked=null,lastCall=false,signature='',active=false,errors=0,requests=Promise.resolve();
    const node=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
    function button(text,handler,cls='fk-primary'){const b=node('button',cls,text);b.type='button';b.onclick=handler;return b;}
    function report(text){error.textContent=text;}
    function name(){return (document.querySelector('#fk-name')?.value||localStorage.getItem('fk-name')||document.querySelector('#nm')?.value||'Spieler').trim().slice(0,18)||'Spieler';}
    function save(){try{sessionStorage.setItem('fk-session',JSON.stringify(session));}catch{}}
    function api(body){
      const payload={...session,...body};
      const next=requests.then(()=>request(payload));requests=next.catch(()=>{});return next;
    }
    async function request(body){
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
      try{const r=await fetch(window.KKOnlineConfig.api+'cards',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',signal:controller.signal});const data=await r.json();if(!r.ok){const e=new Error(data.message||'Kartenraum nicht erreichbar.');e.status=r.status;throw e;}return data;}
      catch(e){if(e.name==='AbortError')throw new Error('Die Verbindung dauert zu lange. Bitte erneut versuchen.');throw e;}finally{clearTimeout(timeout);}
    }
    function apply(data){session={code:data.view.code,token:data.token};view=data.view;save();render();}
    async function command(body){
      if(pending)return;pending=true;report('');app.classList.add('fk-busy');
      try{apply(await api(body));errors=0;}
      catch(e){report(e.message);if(session&&e.status===409){try{apply(await api({op:'poll'}));}catch{}}}
      finally{pending=false;app.classList.remove('fk-busy');}
    }
    function schedule(){clearTimeout(timer);if(active&&session)timer=setTimeout(poll,1100);}
    async function poll(){
      if(!active||!session||polling)return;if(pending){schedule();return;}
      polling=true;
      try{apply(await api({op:'poll'}));if(errors)report('Verbindung wieder da.');errors=0;}
      catch(e){errors++;report(e.status===403?'Du bist nicht mehr in diesem Raum. Kehre zur Spielauswahl zurück.':'Verbindung unterbrochen. Ich versuche es weiter …');if(e.status===403){session=null;save();}}
      finally{polling=false;schedule();}
    }
    async function connect(solo){
      if(pending)return;
      const who=name();try{localStorage.setItem('fk-name',who);}catch{}
      const bots=+document.querySelector('#fk-bots').value;
      await command({op:'create',name:who,solo,bots});schedule();
    }
    function setup(){
      signature='';view=null;main.replaceChildren();
      const hero=node('div','fk-intro');hero.innerHTML='<div class="fk-eyebrow">NOCH EINE RUNDE?</div><h1>Eine Farbe.<br>Eine Zahl.<br><em>Dein nächster Zug.</em></h1><p>Lege die passende Karte. Dreh die Richtung um. Und werde als Erster alle Karten los.</p>';
      const art=node('div','fk-hero-art');for(const [c,v]of[['r','7'],['b','reverse'],['y','draw2']])art.append(card({c,v}));hero.append(art);
      const form=node('div','fk-setup');const label=node('label','','Dein Name'),input=node('input');input.id='fk-name';input.maxLength=18;input.value=localStorage.getItem('fk-name')||document.querySelector('#nm')?.value||'';input.placeholder='Wie heißt du?';label.append(input);
      const botlabel=node('label','','Computer-Mitspieler'),select=node('select');select.id='fk-bots';for(let i=1;i<=5;i++){const o=node('option','',i+(i===1?' Bot':' Bots'));o.value=i;o.selected=i===3;select.append(o);}botlabel.append(select);
      form.append(label,botlabel,button('Gegen Bots spielen →',()=>connect(true)),button('Raum für Freunde erstellen',()=>connect(false),'fk-secondary'));
      const join=node('form','fk-join'),code=node('input');code.id='fk-code';code.placeholder='6-stelliger Code';code.maxLength=6;code.setAttribute('aria-label','Kartenraum-Code');code.autocapitalize='characters';
      join.append(code,button('Beitreten',async()=>{const who=name(),roomcode=code.value.trim().toUpperCase();if(!/^[A-Z]{6}$/.test(roomcode)){report('Bitte den sechsstelligen Karten-Code eingeben.');code.focus();return;}await command({op:'join',code:roomcode,name:who});schedule();},'fk-secondary'));join.onsubmit=e=>{e.preventDefault();join.querySelector('button').click();};form.append(join);main.append(hero,form,rules());
    }
    function rules(){const d=node('details','fk-rules');d.innerHTML='<summary>So wird gespielt</summary><p>Sieben Karten pro Person. Lege dieselbe Farbe, Zahl oder dasselbe Symbol. Wer zuerst keine Karten mehr hat, gewinnt die Runde.</p><p><b>⊘ Aussetzen:</b> Der Nächste pausiert. <b>⇄ Richtungswechsel:</b> Die Reihenfolge dreht sich um. Zu zweit bist du erneut dran. <b>+2:</b> Der Nächste zieht zwei und pausiert. <b>✦ Farbwahl:</b> Du wählst die Farbe. <b>+4:</b> Nur erlaubt, wenn du keine Karte der aktuellen Farbe hast; der Nächste zieht vier und pausiert.</p><p>Du darfst eine Karte ziehen. Passt sie, kannst du genau diese Karte legen oder passen. Ziehkarten werden nicht gestapelt.</p><p><b>Unsere Tischregeln:</b> Vor deiner vorletzten Karte „Letzte Karte!“ aktivieren, sonst ziehst du zwei Strafkarten. Die erste offene Karte ist immer eine Zahl. +4 wird automatisch auf Zulässigkeit geprüft; es gibt kein Anfechten. Eine Runde entscheidet, ohne Punktesammlung.</p><p>Mit Freunden: denselben sechsstelligen Code verwenden. Der Gastgeber startet und kann Bots ergänzen. Beim Verlassen oder nach 90 Sekunden ohne Verbindung übernimmt ein Bot; der nächste verbundene Mensch wird Gastgeber.</p>';return d;}
    function card(c,handler){
      const el=node(handler?'button':'div','fk-card fk-'+c.c);if(handler){el.type='button';el.onclick=handler;}
      const symbol=symbols[c.v]||c.v;el.setAttribute('aria-label',colors[c.c]+' '+(names[c.v]||c.v));
      el.append(node('span','fk-card-corner',symbol),node('strong','fk-card-symbol',symbol),node('span','fk-card-color',colors[c.c]),node('span','fk-card-corner fk-bottom',symbol));return el;
    }
    function choose(c){
      if(pending||!view.playable.includes(c.id))return;
      if(c.c==='w'){picked=c;picker.hidden=false;app.querySelector('#fk-colors button').focus();}
      else playCard(c);
    }
    async function playCard(c,color){picker.hidden=true;picked=null;await command({op:'play',card:c.id,color,last:lastCall,rev:view.rev});lastCall=false;signature='';render();}
    function render(){
      if(!view)return;
      const next=JSON.stringify([view.rev,view.code,lastCall]);if(next===signature)return;signature=next;
      const handScroll=main.querySelector('.fk-hand')?.scrollLeft||0,focused=document.activeElement?.dataset?.card;
      main.replaceChildren();
      if(!view.started){
        const box=node('section','fk-lobby');box.append(node('div','fk-eyebrow','DEIN PRIVATER KARTENTISCH'),node('h1','','Alle an Bord?'),node('p','','Schicke diesen Code an deine Freunde. Sie wählen Farben-Krach und „Beitreten“.'));
        const code=node('div','fk-room-code',view.code);box.append(code,button('Code kopieren',async()=>{try{await navigator.clipboard.writeText(view.code);report('Code kopiert!');}catch{report('Dein Code: '+view.code);}},'fk-secondary'));
        const players=node('div','fk-lobby-players');for(const p of view.players)players.append(node('div','fk-person',p.n+(p.uid===view.host?' · Gastgeber':'')));box.append(players);
        if(view.players[view.seat]?.uid===view.host){const label=node('label','','Zusätzliche Bots'),select=node('select');select.id='fk-lobby-bots';for(let i=0;i<=6-view.players.length;i++){const o=node('option','',i+' Bots');o.value=i;select.append(o);}label.append(select);box.append(label,button('Runde starten →',()=>command({op:'start',bots:+select.value})));}
        else box.append(node('p','','Der Gastgeber startet, sobald alle da sind.'));
        main.append(box,rules());return;
      }
      const current=view.players[view.turn],mine=view.turn===view.seat&&view.winner===null;
      const info=node('div','fk-game-info');info.append(node('span','fk-eyebrow',view.winner!==null?'RUNDE BEENDET':mine?'DU BIST DRAN':current.n.toUpperCase()+' IST DRAN'),node('span','fk-direction',view.dir===1?'↻ Im Uhrzeigersinn':'↺ Gegen den Uhrzeigersinn'));main.append(info);
      const opponents=node('div','fk-opponents');for(const [i,p] of view.players.entries()){if(i===view.seat)continue;const seat=node('div','fk-opponent'+(i===view.turn?' fk-active':''));seat.append(node('span','fk-avatar',p.n.slice(0,1).toUpperCase()),node('b','',p.n),node('span','',p.count+' Karten'+(p.bot?' · Bot':'')));if(p.count===1)seat.append(node('small','fk-last','LETZTE KARTE'));opponents.append(seat);}main.append(opponents);
      const table=node('section','fk-table');table.setAttribute('aria-label','Kartentisch');
      const deck=button('',()=>{},'fk-deck');deck.onclick=()=>command({op:'draw',rev:view.rev});deck.disabled=!mine||view.drawn!==null;deck.setAttribute('aria-label','Eine Karte ziehen');deck.append(node('strong','','FK'),node('span','','Karte ziehen'));
      const discard=node('div','fk-discard');discard.append(card(view.top));const active=node('div','fk-active-color fk-'+view.color,colors[view.color]+' ist aktiv');discard.append(active);table.append(deck,discard);main.append(table);
      const message=node('p','fk-message',view.message);message.setAttribute('role','status');main.append(message);
      if(view.winner!==null){const end=node('div','fk-result');end.append(node('h2','',view.winner==='draw'?'Unentschieden!':view.players.find(p=>p.uid===view.winner)?.n+' gewinnt!'));if(view.players[view.seat]?.uid===view.host)end.append(button('Noch eine Runde',()=>command({op:'start',bots:view.players.filter(p=>p.bot).length})));else end.append(node('p','','Der Gastgeber kann eine neue Runde starten.'));main.append(end);}
      const handTitle=node('div','fk-hand-heading');handTitle.append(node('h2','','Deine Karten'),node('span','',view.hand.length+' auf der Hand'));
      const hand=node('div','fk-hand');hand.setAttribute('aria-label','Deine Handkarten');
      for(const c of view.hand){const el=card(c,()=>choose(c));el.dataset.card=c.id;el.disabled=!mine||!view.playable.includes(c.id);if(mine&&view.playable.includes(c.id))el.classList.add('fk-playable');hand.append(el);}
      const controls=node('div','fk-hand-controls');
      if(mine&&view.drawn!==null)controls.append(button('Gezogene Karte behalten · Passen',()=>command({op:'pass',rev:view.rev}),'fk-secondary'));
      if(mine&&view.hand.length===2){const call=button(lastCall?'✓ Letzte Karte angekündigt':'Letzte Karte!',()=>{lastCall=!lastCall;signature='';render();},'fk-call'+(lastCall?' fk-called':''));call.setAttribute('aria-pressed',lastCall);controls.append(call);}
      if(mine)controls.append(node('span','fk-tip',view.drawn!==null?'Lege die gezogene Karte oder passe.':view.playable.length?'Tippe eine leuchtende Karte oder ziehe eine.':'Keine passende Karte? Tippe auf den Ziehstapel.'));
      else if(view.winner===null)controls.append(node('span','fk-tip','Du bist gleich wieder dran.'));
      main.append(handTitle,hand,controls,rules());hand.scrollLeft=handScroll;
      if(mine&&view.drawn!==null){const drawn=hand.querySelector('[data-card="'+view.drawn+'"]');if(drawn)hand.scrollLeft=drawn.offsetLeft-hand.offsetLeft-hand.clientWidth/2+drawn.clientWidth/2;}
      if(focused)hand.querySelector('[data-card="'+focused+'"]')?.focus({preventScroll:true});
      if(picked&&!view.playable.includes(picked.id)){picked=null;picker.hidden=true;}
    }
    const colorButtons=app.querySelector('#fk-colors');for(const [c,label] of Object.entries(colors)){if(c==='w')continue;colorButtons.append(button(label,()=>{if(picked)playCard(picked,c);},'fk-color-choice fk-'+c));}
    function cancel(){picker.hidden=true;const id=picked?.id;picked=null;main.querySelector('[data-card="'+id+'"]')?.focus();}
    app.querySelector('#fk-cancel').onclick=cancel;app.addEventListener('keydown',e=>{if(picker.hidden)return;if(e.key==='Escape'){e.preventDefault();cancel();}if(e.key==='Tab'){const a=[...picker.querySelectorAll('button')],i=a.indexOf(document.activeElement);if(e.shiftKey&&i===0){e.preventDefault();a.at(-1).focus();}else if(!e.shiftKey&&i===a.length-1){e.preventDefault();a[0].focus();}}});
    async function leave(){
      if(pending)return;pending=true;clearTimeout(timer);
      if(session){try{await api({op:'leave'});}catch(e){pending=false;report('Der Raum konnte noch nicht verlassen werden. '+e.message);schedule();return;}}
      session=null;view=null;save();active=false;clearTimeout(timer);pending=false;picker.hidden=true;app.hidden=true;document.body.classList.remove('fk-open');document.querySelector('#home').inert=false;menu.focus();report('');
    }
    app.querySelector('#fk-close').onclick=leave;app.querySelector('#fk-logo').onclick=leave;
    menu.onclick=async()=>{active=true;app.hidden=false;document.body.classList.add('fk-open');document.querySelector('#home').inert=true;report('');setup();try{session=JSON.parse(sessionStorage.getItem('fk-session'));}catch{session=null;}if(session){await poll();}app.querySelector('#fk-logo').focus();};
    setInterval(()=>{if(!active||!view?.started_at){app.querySelector('#fk-time').textContent='00:00';return;}const sec=Math.max(0,Math.floor((view.ended_at||Date.now()/1000)-view.started_at));app.querySelector('#fk-time').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');},1000);
    document.documentElement.dataset.kkCards='1';
  }
})();
