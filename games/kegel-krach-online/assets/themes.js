/* Monthly scene design, independent seasonal weather. Original figures unchanged. */
(() => {
  const months=[
    {name:'Januar',accent:'#9edbff',panel:'#142f50',base:'#10273e',light:'#376b8b',pattern:'radial-gradient(circle at 18% 25%,#d2f2ff33 0 2px,transparent 3px)',size:'42px 42px',motif:'Eiskristalle'},
    {name:'Februar',accent:'#efaccb',panel:'#3d244c',base:'#261d3f',light:'#704568',pattern:'repeating-linear-gradient(135deg,transparent 0 24px,#e9c3e514 24px 26px)',size:'auto',motif:'Winterabend'},
    {name:'März',accent:'#b4deb5',panel:'#1b3a32',base:'#15352c',light:'#496f54',pattern:'radial-gradient(ellipse at 20% 30%,#bde4a922 0 5px,transparent 6px)',size:'64px 74px',motif:'Erstes Grün'},
    {name:'April',accent:'#b7d4f7',panel:'#223b56',base:'#20344b',light:'#567d8e',pattern:'repeating-linear-gradient(115deg,transparent 0 38px,#c8e8ff18 39px 40px)',size:'auto',motif:'Frühlingsregen'},
    {name:'Mai',accent:'#eac1dc',panel:'#294338',base:'#213f35',light:'#6b8860',pattern:'radial-gradient(circle at 20% 30%,#ffd4e52b 0 6px,transparent 7px),radial-gradient(circle at 75% 70%,#fff6ce22 0 4px,transparent 5px)',size:'100px 100px',motif:'Blütenwiese'},
    {name:'Juni',accent:'#b5ece5',panel:'#12434e',base:'#103c4a',light:'#317e85',pattern:'repeating-linear-gradient(0deg,transparent 0 32px,#b9f2ea14 33px 35px)',size:'auto',motif:'Sommer am Wasser'},
    {name:'Juli',accent:'#ffe29b',panel:'#49402a',base:'#3f3924',light:'#a57c36',pattern:'radial-gradient(circle at 83% 16%,#fff3b550,transparent 35%)',size:'cover',motif:'Sonnentage'},
    {name:'August',accent:'#f7c599',panel:'#50312b',base:'#412c26',light:'#a7653b',pattern:'radial-gradient(circle at 20% 30%,#ffd49322 0 8px,transparent 9px)',size:'80px 80px',motif:'Spätsommer'},
    {name:'September',accent:'#dac18c',panel:'#3e3830',base:'#302d28',light:'#777146',pattern:'repeating-linear-gradient(45deg,transparent 0 46px,#dcca9218 46px 48px)',size:'auto',motif:'Erntezeit'},
    {name:'Oktober',accent:'#f6b77e',panel:'#3e2845',base:'#2c203b',light:'#79483e',pattern:'repeating-linear-gradient(135deg,#ffa16c0d 0 34px,transparent 34px 68px)',size:'auto',motif:'Goldener Herbst'},
    {name:'November',accent:'#ddb999',panel:'#403028',base:'#302723',light:'#77604c',pattern:'radial-gradient(ellipse at 20% 10%,#dfc8ad22,transparent 60%)',size:'cover',motif:'Nebel und Kupfer'},
    {name:'Dezember',accent:'#e9cf94',panel:'#173d35',base:'#15362d',light:'#62353e',pattern:'repeating-linear-gradient(135deg,transparent 0 56px,#e9cf941c 56px 58px)',size:'auto',motif:'Festlicher Winter'}
  ];
  const seasons={
    winter:{name:'Winter',icons:['❄','❅','✧'],color:'#e7f6ff'},
    spring:{name:'Frühling',icons:['❀','✿','❁'],color:'#f6d9e8'},
    summer:{name:'Sommer',icons:['✦','·','✧'],color:'#fff0a9'},
    autumn:{name:'Herbst',icons:['🍂','🍁','🍂'],color:'#e4aa6e'}
  };
  function themeForDate(date){
    const m=date.getMonth(),season=m===11||m<2?'winter':m<5?'spring':m<8?'summer':'autumn';
    return {...months[m],month:m,season,weather:seasons[season]};
  }
  window.KKSeasonal={themeForDate};
  if(!document.querySelector('#home #bMk'))return;
  let tries=0;
  const ready=setInterval(()=>{
    if(typeof TH==='undefined'||typeof TL==='undefined'){if(++tries>600)clearInterval(ready);return;}
    clearInterval(ready);install();
  },250);
  function install(){
    if(document.documentElement.dataset.kkSeasonal)return;
    const css=document.createElement('style');css.textContent=`
      html body #home.scr,html body #lobby.scr,html body #game.scr{background-image:var(--kk-scene)!important;background-size:var(--kk-pattern-size),cover!important;background-color:var(--kk-scene-base)!important}
      html body #home .card,html body #lobby .card,html body #game .box,html body #kk-admin-dialog>div{background:var(--kk-panel)!important;border-color:var(--kk-accent)!important;color:#fff}
      html body #kk-home-logo,html body #turn,html body #kk-stopwatch,html body #kk-chat-toggle{background:var(--kk-panel)!important}
      html body #kk-home-logo{border:1px solid var(--kk-accent)}
      html body #home h1>a{color:var(--kk-accent)!important}
      html body #home .mc{border:1px solid var(--kk-accent);background:linear-gradient(#0003,#0003),linear-gradient(125deg,var(--kk-panel),var(--kk-light))!important}
      html body #home .mc:nth-of-type(2){background:linear-gradient(#0003,#0003),linear-gradient(125deg,var(--kk-scene-base),var(--kk-panel))!important}
      html body #home .mc:nth-of-type(3){background:linear-gradient(#0003,#0003),linear-gradient(125deg,var(--kk-light),var(--kk-scene-base))!important}
      #kk-month-label{color:var(--kk-accent);font:700 13px system-ui;text-align:center;letter-spacing:.04em;padding:6px 10px;border:1px solid var(--kk-accent);border-radius:99px;justify-self:center;background:var(--kk-panel)}
      html body>.fl{pointer-events:none!important;opacity:.45;z-index:100001;animation-name:kk-weather!important;animation-timing-function:linear!important}
      html body.kk-playing>.fl{opacity:.14}
      @keyframes kk-weather{0%{transform:translate(0,-20px) rotate(0deg)}50%{transform:translate(-25px,55vh) rotate(100deg)}100%{transform:translate(30px,115vh) rotate(230deg)}}
      #kk-kick-notice{border:2px solid var(--kk-accent,#ffd60a)!important}#kk-kick-notice[hidden]{display:none!important}
      @media(prefers-reduced-motion:reduce){html body>.fl{display:none!important}}
    `;document.body.append(css);
    const badge=document.createElement('div');badge.id='kk-month-label';
    document.querySelector('#home h1').after(badge);
    let current='';
    function refresh(){
      const now=new Date(),key=now.getFullYear()+'-'+now.getMonth();if(key===current)return;current=key;
      const t=themeForDate(now),palette=TL[t.month],root=document.documentElement;
      root.dataset.kkSeasonal=t.season;root.dataset.kkMonth=String(t.month+1);
      root.style.setProperty('--kk-scene',t.pattern+',linear-gradient(145deg,'+t.base+','+t.light+','+t.base+')');
      root.style.setProperty('--kk-pattern-size',t.size);root.style.setProperty('--kk-scene-base',t.base);
      root.style.setProperty('--kk-panel',t.panel);root.style.setProperty('--kk-accent',t.accent);
      root.style.setProperty('--kk-light',t.light);
      // The existing board reads TH on every frame. Keep player colours fixed.
      Object.assign(TH,{n:t.name,e:t.weather.icons,bg:palette[2],fr:[palette[3],palette[4]],bd:palette[5],cell:palette[6],gr:palette[7]});
      document.title='Kegel-Krach · '+t.name+'-Edition';badge.textContent=t.name+' · '+t.motif+' · '+t.weather.name;
      document.querySelectorAll('body>.fl').forEach((particle,i)=>{
        particle.textContent=t.weather.icons[i%t.weather.icons.length];particle.dataset.season=t.season;
        particle.style.color=t.weather.color;particle.style.fontSize=(t.season==='summer'?12+i%10:16+i%12)+'px';
        particle.style.animationDuration=(12+i%9)+'s';
      });
    }
    refresh();
    const observer=new MutationObserver(()=>document.body.classList.toggle('kk-playing',document.querySelector('#game').classList.contains('on')));
    observer.observe(document.querySelector('#game'),{attributes:true,attributeFilter:['class']});
    const interval=setInterval(refresh,60000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
    window.addEventListener('pagehide',()=>{clearInterval(interval);observer.disconnect();},{once:true});
  }
})();
