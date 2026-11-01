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
    return {...months[m],month:m,season,weather:seasons[season],holiday:holidayForDate(date)};
  }
  function easter(year){
    const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),n=h+l-7*m+114;
    return new Date(year,Math.floor(n/31)-1,n%31+1,12);
  }
  function holidayForDate(date){
    const key=(date.getMonth()+1)+'-'+date.getDate(),year=date.getFullYear();
    const fixed={'1-1':['new-year','firework','✦'],'1-6':['epiphany','crown','♛'],'2-14':['valentine','heart','♥'],'5-1':['may-day','flower','❀'],'10-26':['austria','flag','✧'],'10-31':['halloween','pumpkin','✦'],'12-6':['saint-nicholas','gift','★'],'12-24':['christmas-eve','star','★'],'12-25':['christmas','tree','✧'],'12-26':['boxing-day','gift','✦'],'12-31':['new-years-eve','firework','✧']};
    let value=fixed[key];
    for(const [offset,id,kind,glyph] of [[0,'easter','egg','✿'],[1,'easter-monday','bunny','❀'],[49,'pentecost','flower','✧'],[50,'pentecost-monday','star','✦']]){
      const day=easter(year);day.setDate(day.getDate()+offset);
      if(day.getMonth()===date.getMonth()&&day.getDate()===date.getDate())value=[id,kind,glyph];
    }
    return value?{id:value[0],kind:value[1],glyph:value[2],variant:(year+date.getMonth()+date.getDate())%3}:null;
  }
  function ornament(kind,variant){
    const colors=['#ffe0a1','#efd1ea','#b9e8ef'],color=colors[variant];
    const drawings={
      tree:'<path d="M0-23-14 1H-8L-21 19H21L8 1H14Z" fill="#448a64" stroke="#ffe0a1"/><path d="M-3 19H3V27H-3Z" fill="#b88755"/>',
      heart:'<path d="M0 20C-38-3-14-29 0-12C14-29 38-3 0 20Z" fill="#e988a8"/>',
      egg:'<ellipse cy="2" rx="15" ry="23" fill="'+color+'"/><path d="M-14 3H14M-12 10H12" stroke="#d98fb4" stroke-width="4"/>',
      bunny:'<ellipse cx="-7" cy="-17" rx="5" ry="15" fill="'+color+'"/><ellipse cx="7" cy="-17" rx="5" ry="15" fill="'+color+'"/><circle r="15" fill="'+color+'"/><path d="M-6-1H-4M4-1H6" stroke="#4a345b" stroke-width="3"/>',
      gift:'<rect x="-18" y="-10" width="36" height="31" rx="3" fill="#b96070"/><path d="M0-11V21M-18-2H18" stroke="'+color+'" stroke-width="5"/><path d="M0-10C-25-30-15-32 0-10C25-30 15-32 0-10Z" stroke="'+color+'" fill="none" stroke-width="3"/>',
      candle:'<rect x="-7" y="-3" width="14" height="26" rx="2" fill="'+color+'"/><path d="M0-25C-15-10 2-1 6-11C10-17 0-25 0-25Z" fill="#ffd37b"/>',
      flag:'<path d="M-22-16H22V16H-22Z" fill="#d96978"/><path d="M-22-5H22V5H-22Z" fill="#fff1e4"/>',
      crown:'<path d="M-21-14-11-4 0-22 11-4 21-14 16 17H-16Z" fill="'+color+'"/><path d="M-16 9H16" stroke="#b5834e" stroke-width="3"/>',
      pumpkin:'<ellipse cy="3" rx="23" ry="19" fill="#e59d59"/><path d="M0-16 5-26M-10-1-4 1M4 1 10-1M-9 10Q0 17 9 10" stroke="#704738" stroke-width="3" fill="none"/>',
      flower:'<path d="M0-23C15-25 15-10 6-6C30-15 30 7 9 6C25 24 5 31 0 12C-5 31-25 24-9 6C-30 7-30-15-6-6C-15-10-15-25 0-23Z" fill="'+color+'"/><circle r="6" fill="#e2bc62"/>',
      star:'<path d="m0-25 7 17 19 1-15 12 5 19-16-11-16 11 5-19-15-12 19-1Z" fill="'+color+'"/>',
      firework:'<path d="M0-26V-8M0 8V26M-26 0H-8M8 0H26M-18-18-6-6M6 6 18 18M-18 18-6 6M6-6 18-18" stroke="'+color+'" stroke-width="3" stroke-linecap="round"/>'
    };
    return drawings[kind]||drawings.star;
  }
  window.KKSeasonal={themeForDate,holidayForDate,easter};
  if(!document.querySelector('#home #bMk'))return;
  const initialWeather=themeForDate(new Date()).weather;
  document.querySelectorAll('body>.fl').forEach((particle,i)=>{particle.textContent=initialWeather.icons[i%initialWeather.icons.length];});
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
      #kk-month-label{display:none!important}
      #kk-holiday-decoration{position:fixed;inset:0 0 auto;height:64px;pointer-events:none;z-index:100001;opacity:.5}#kk-holiday-decoration svg{width:100%;height:100%}
      html body>.fl{pointer-events:none!important;opacity:.45;z-index:100001;animation-name:kk-weather!important;animation-timing-function:linear!important}
      html body.kk-playing>.fl{opacity:.14}
      @keyframes kk-weather{0%{transform:translate(0,-20px) rotate(0deg)}50%{transform:translate(-25px,55vh) rotate(100deg)}100%{transform:translate(30px,115vh) rotate(230deg)}}
      #kk-kick-notice{border:2px solid var(--kk-accent,#ffd60a)!important}#kk-kick-notice[hidden]{display:none!important}
      @media(prefers-reduced-motion:reduce){html body>.fl{display:none!important}}
    `;document.body.append(css);
    document.querySelector('#kk-month-label')?.remove();
    const decoration=document.createElement('div');decoration.id='kk-holiday-decoration';decoration.setAttribute('aria-hidden','true');document.body.append(decoration);
    let current='',midnight;
    function refresh(){
      const now=new Date(),key=now.getFullYear()+'-'+now.getMonth()+'-'+now.getDate();if(key===current)return;current=key;
      clearTimeout(midnight);const next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);midnight=setTimeout(refresh,Math.max(1,next.getTime()-now.getTime()+20));
      const t=themeForDate(now),palette=TL[t.month],root=document.documentElement;
      root.dataset.kkSeasonal=t.season;root.dataset.kkMonth=String(t.month+1);
      root.style.setProperty('--kk-scene',t.pattern+',linear-gradient(145deg,'+t.base+','+t.light+','+t.base+')');
      root.style.setProperty('--kk-pattern-size',t.size);root.style.setProperty('--kk-scene-base',t.base);
      root.style.setProperty('--kk-panel',t.panel);root.style.setProperty('--kk-accent',t.accent);
      root.style.setProperty('--kk-light',t.light);
      // The existing board reads TH on every frame. Keep player colours fixed.
      Object.assign(TH,{n:t.name,e:t.weather.icons,bg:palette[2],fr:[palette[3],palette[4]],bd:palette[5],cell:palette[6],gr:palette[7]});
      document.title='Kegel-Krach';
      root.dataset.kkHoliday=t.holiday?t.holiday.id:'';
      decoration.hidden=!t.holiday;
      if(t.holiday){
        decoration.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 64">'+Array.from({length:12},(_,i)=>'<g transform="translate('+(45+i*100)+',32) scale(.6) rotate('+((i%2?1:-1)*(t.holiday.variant+1)*6)+')">'+ornament(t.holiday.kind,t.holiday.variant)+'</g>').join('')+'</svg>';
      }else decoration.textContent='';
      document.querySelectorAll('body>.fl').forEach((particle,i)=>{
        particle.textContent=t.holiday&&i%4===0?t.holiday.glyph:t.weather.icons[i%t.weather.icons.length];particle.dataset.season=t.season;
        particle.style.color=t.weather.color;particle.style.fontSize=(t.season==='summer'?12+i%10:16+i%12)+'px';
        particle.style.animationDuration=(12+i%9)+'s';
      });
    }
    refresh();
    const observer=new MutationObserver(()=>document.body.classList.toggle('kk-playing',document.querySelector('#game').classList.contains('on')));
    observer.observe(document.querySelector('#game'),{attributes:true,attributeFilter:['class']});
    const interval=setInterval(refresh,60000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
    window.addEventListener('pagehide',()=>{clearTimeout(midnight);clearInterval(interval);observer.disconnect();},{once:true});
  }
})();
