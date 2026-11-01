/* Detailed, upright canvas figures; works with the existing game animations. */
(() => {
  let tries = 0;
  const timer = setInterval(() => {
    if (typeof pin !== 'function' || typeof pieces !== 'function') {
      if (++tries > 600) clearInterval(timer);
      return;
    }
    clearInterval(timer);
    if (document.documentElement.dataset.kkVisuals) return;
    document.documentElement.dataset.kkVisuals = '1';

    function tint(hex, amount) {
      const rgb = hex.replace('#', '').match(/../g).map(v => parseInt(v, 16));
      return 'rgb(' + rgb.map(v => Math.round(amount > 0 ? v + (255-v)*amount : v*(1+amount))).join(',') + ')';
    }
    pin = function (ctx, x, y, scale, color, skin, options = {}) {
      const width = [1, 1.24, .88, 1.06][skin] || 1;
      const squash = options.sq || 1;
      ctx.save(); ctx.translate(x,y);
      ctx.rotate((options.rot || 0) + Math.sin(tnow*1.8+(options.ph||0))*.018);
      ctx.scale(scale*(2-squash), scale*squash);
      const silhouette = () => {
        ctx.beginPath(); ctx.moveTo(-13*width,0);
        ctx.bezierCurveTo(-17*width,-15,-8*width,-23,-5.7,-32);
        ctx.bezierCurveTo(-12,-41,-7.5,-54,0,-54);
        ctx.bezierCurveTo(7.5,-54,12,-41,5.7,-32);
        ctx.bezierCurveTo(8*width,-23,17*width,-15,13*width,0); ctx.closePath();
      };
      // Light rim separates every team colour from the board.
      silhouette(); ctx.strokeStyle='#fff9'; ctx.lineWidth=4; ctx.stroke();
      const body=ctx.createLinearGradient(-17*width,0,17*width,0);
      body.addColorStop(0,tint(color,-.48)); body.addColorStop(.27,tint(color,.45));
      body.addColorStop(.49,tint(color,.14)); body.addColorStop(.75,color); body.addColorStop(1,tint(color,-.5));
      ctx.fillStyle=body; ctx.fill(); ctx.strokeStyle='#14213dcc'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.save(); silhouette(); ctx.clip();
      const sheen=ctx.createLinearGradient(-9,0,3,0);
      sheen.addColorStop(0,'#fff0');sheen.addColorStop(.5,'#fff6');sheen.addColorStop(1,'#fff0');
      ctx.fillStyle=sheen;ctx.fillRect(-12,-54,12,55);
      ctx.fillStyle='#ffffffed';ctx.fillRect(-25,-29,50,5);
      ctx.fillStyle='#14213d55';ctx.fillRect(-25,-24,50,1.4);
      ctx.restore();
      // A rounded foot and eye reflections reinforce the lit 3D shape.
      ctx.beginPath();ctx.ellipse(0,-1.5,12.5*width,3.3,0,0,Math.PI*2);
      ctx.fillStyle=tint(color,-.35);ctx.fill();ctx.strokeStyle='#ffffff80';ctx.lineWidth=1;ctx.stroke();
      for (const eye of [-3.7,3.7]) {
        ctx.beginPath();ctx.ellipse(eye,-44.5,3.4,4.1,0,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
        ctx.lineWidth=.8;ctx.strokeStyle='#14213d';ctx.stroke();
        ctx.beginPath();ctx.arc(eye+.45,-44,options.face?2.3:1.85,0,Math.PI*2);ctx.fillStyle='#111c33';ctx.fill();
        ctx.beginPath();ctx.arc(eye-.1,-45,.65,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
      }
      ctx.beginPath();ctx.strokeStyle='#14213d';ctx.lineWidth=1.6;ctx.lineCap='round';
      if(options.face)ctx.arc(0,-36.5,2.5,0,Math.PI*2);else ctx.arc(0,-39,3.3,.25,Math.PI-.25);ctx.stroke();
      if(skin===1) {
        const gold=ctx.createLinearGradient(-7,-63,8,-50);gold.addColorStop(0,'#fff4a4');gold.addColorStop(.5,'#ffd23d');gold.addColorStop(1,'#ad6900');
        ctx.fillStyle=gold;ctx.strokeStyle='#6e4100';ctx.lineWidth=1.2;
        ctx.beginPath();ctx.moveTo(-7,-52);ctx.lineTo(-7,-62);ctx.lineTo(-3.5,-57);ctx.lineTo(0,-65);ctx.lineTo(3.5,-57);ctx.lineTo(7,-62);ctx.lineTo(7,-52);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#e94270';ctx.beginPath();ctx.arc(0,-55.5,1.6,0,7);ctx.fill();
      } else if(skin===2) {
        const hat=ctx.createLinearGradient(-6,-58,7,-57);hat.addColorStop(0,'#ffe8ff');hat.addColorStop(.4,'#fff');hat.addColorStop(1,'#9e57db');
        ctx.fillStyle=hat;ctx.strokeStyle='#6f2aa0';ctx.lineWidth=1.3;
        ctx.beginPath();ctx.moveTo(-7,-52);ctx.lineTo(0,-74);ctx.lineTo(7,-52);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#e850be';ctx.beginPath();ctx.arc(0,-74,2.6,0,7);ctx.fill();
      } else if(skin===3) {
        const hat=ctx.createLinearGradient(-9,0,9,0);hat.addColorStop(0,'#0c1426');hat.addColorStop(.4,'#52637a');hat.addColorStop(1,'#0a101c');
        ctx.fillStyle=hat;ctx.fillRect(-8,-65,16,13);ctx.fillRect(-12,-53,24,3);
        ctx.fillStyle='#e8be4e';ctx.fillRect(-8,-56,16,2);
        ctx.fillStyle='#14213d';ctx.beginPath();ctx.ellipse(0,-38,5,1.7,0,0,7);ctx.fill();
      }
      if(options.number) {
        ctx.beginPath();ctx.arc(0,-14,6.8,0,7);ctx.fillStyle='#fffffff2';ctx.fill();
        ctx.strokeStyle='#14213d';ctx.lineWidth=1;ctx.stroke();
        ctx.fillStyle='#14213d';ctx.font='900 10px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(options.number),0,-13.6);
      }
      ctx.restore();
    };

    // Retain the established board, movement, hit targets and camera transforms.
    const originalBoard=board;
    board=function () {
      originalBoard(); if(!G)return;
      c.save(); c.textAlign='center'; c.textBaseline='middle';
      for(const player of G.pl) {
        const x=OR[player.s][0]*60+120,y=OR[player.s][1]*60+205;
        c.font='800 17px system-ui'; const w=Math.min(194,c.measureText(player.n).width+26);
        c.fillStyle='#14213de8';c.beginPath();c.roundRect(x-w/2,y-14,w,28,12);c.fill();
        c.strokeStyle=COL[player.s];c.lineWidth=2;c.stroke();
        c.fillStyle='#fff';c.fillText(player.n,x,y, w-16);
      }
      c.restore();
    };

    pieces=function () {
      if(!G)return;
      const figures=[];
      G.pl.forEach((player,k)=>G.pc[k].forEach((value,i)=>{
        let q=wp(player.s,value,i),options={ph:i+k,number:i+1};
        for(const animation of [ov,ov2])if(animation&&animation.k===k&&animation.i===i){q=[animation.x,animation.y];options={...animation,number:i+1};}
        figures.push({player,k,i,q,options});
      }));
      if(hl.length&&G.phase==='move') {
        const side=G.pl[G.turn].s;
        for(const i of hl) {
          const value=G.pc[G.turn][i],a=wp(side,value,i),b=wp(side,value<0?0:value+G.d,i);
          c.save();c.setLineDash([7,7]);c.strokeStyle='#14213d99';c.lineWidth=3;
          c.beginPath();c.moveTo(a[0],a[1]+10);c.lineTo(b[0],b[1]);c.stroke();c.setLineDash([]);
          c.beginPath();c.arc(b[0],b[1],29,0,7);c.fillStyle=COL[side]+'44';c.fill();
          c.strokeStyle='#14213d';c.lineWidth=6;c.stroke();c.strokeStyle='#fff';c.lineWidth=3;c.stroke();c.restore();
        }
      }
      figures.sort((a,b)=>a.q[1]-b.q[1]);
      for(const figure of figures) {
        const [x,y]=figure.q,z=figure.options.z||0;
        c.save();
        const shadow=c.createRadialGradient(x,y+13,1,x,y+13,24);
        shadow.addColorStop(0,'#10203d77');shadow.addColorStop(1,'#10203d00');
        c.fillStyle=shadow;c.beginPath();c.ellipse(x,y+13,Math.max(5,23-z/20),9,0,0,7);c.fill();
        if(G.turn===figure.k&&hl.includes(figure.i)) {
          c.beginPath();c.ellipse(x,y+13,23,10,0,0,7);c.strokeStyle='#14213d';c.lineWidth=6;c.stroke();c.strokeStyle='#fff';c.lineWidth=3;c.stroke();
        }
        c.translate(x,y+14);c.scale(1,1/(1-.42*tl));
        pin(c,0,-z,1.02,COL[figure.player.s],figure.player.skin,figure.options);
        c.restore();
      }
    };

    // Extra headroom keeps tall hats visible on the upper edge of the board.
    const drawOriginal=draw,projectOriginal=w2s;
    const framing=700/750;
    draw=function () {
      const zoom=cam.z;cam.z=zoom*framing;
      try { drawOriginal(); } finally { cam.z=zoom; }
    };
    w2s=function(x,y) {
      const zoom=cam.z;cam.z=zoom*framing;
      try { return projectOriginal(x,y); } finally { cam.z=zoom; }
    };
    cv.addEventListener('pointerdown',event=>{
      if(!G||!hl.length)return;
      event.stopImmediatePropagation();
      if(busy)return;
      const rect=cv.getBoundingClientRect(),density=cv.width/rect.width;
      const scale=Math.min(cv.width,cv.height)/750*cam.z;
      const wx=cam.x+((event.clientX-rect.left)*density-cv.width/2)/scale;
      const wy=cam.y+((event.clientY-rect.top)*density-cv.height/2)/(scale*(1-.42*tl));
      let nearest=null,distance=Infinity;
      for(const i of hl) {
        const v=G.pc[G.turn][i],side=G.pl[G.turn].s,a=wp(side,v,i),b=wp(side,v<0?0:v+G.d,i);
        const d=Math.min(Math.hypot(a[0]-wx,a[1]-wy+14),Math.hypot(b[0]-wx,b[1]-wy));
        if(d<distance){distance=d;nearest=i;}
      }
      if(nearest!==null&&distance<45){stamp++;act({t:'move',i:nearest});}
    },true);

    // Use the actual display density for sharp skin and lobby previews as well.
    function preview(canvas, logicalW, logicalH, render) {
      const box=canvas.getBoundingClientRect();
      const density=Math.min(3,window.devicePixelRatio||1);
      const w=Math.max(logicalW,Math.round(box.width*density)),h=Math.max(logicalH,Math.round(box.height*density));
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      const ctx=canvas.getContext('2d');ctx.setTransform(w/logicalW,0,0,h/logicalH,0,0);ctx.clearRect(0,0,logicalW,logicalH);render(ctx);
    }
    drawSk=function () {
      [...sks.children].forEach((button,i)=>{
        button.classList.toggle('sel',i===me.skin);
        preview(button.firstChild,120,140,ctx=>pin(ctx,60,126,1.6,COL[0],i,{ph:i}));
      });
      document.querySelectorAll('.sl canvas').forEach(canvas=>preview(canvas,80,90,ctx=>pin(ctx,40,84,1.05,COL[+canvas.dataset.s],+canvas.dataset.k,{ph:+canvas.dataset.s})));
      document.querySelectorAll('.mc canvas').forEach(canvas=>preview(canvas,360,130,ctx=>canvas.dataset.c.split(',').forEach((v,j,a)=>pin(ctx,360/(a.length+1)*(j+1),122,1.55,COL[v],+v,{ph:j}))));
    };
  },250);
})();
