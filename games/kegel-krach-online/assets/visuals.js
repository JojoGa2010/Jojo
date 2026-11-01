/* Original Kegel-Krach drawing retained. Only direct figure hit testing is added. */
(() => {
  let tries=0;
  const timer=setInterval(()=>{
    if(typeof pin!=='function'||typeof pieces!=='function'){if(++tries>600)clearInterval(timer);return;}
    clearInterval(timer);
    if(document.documentElement.dataset.kkVisuals)return;
    document.documentElement.dataset.kkVisuals='1';
    let touch=null,pendingState=null;
    function selectFigure(event){
      if(!G||!hl.length)return;
      if(busy)return;
      if(pendingState===G)return;
      const rect=cv.getBoundingClientRect(),density=cv.width/rect.width;
      const px=(event.clientX-rect.left)*density,py=(event.clientY-rect.top)*density;
      let nearest=null,distance=Infinity;
      for(const i of hl){
        const player=G.pl[G.turn],q=wp(player.s,G.pc[G.turn][i],i);
        const [x,y,scale]=w2s(q[0],q[1]+14);
        const height=[52,62,76,64][player.skin]*.85*scale;
        const width=13*[1,1.3,.8,1.05][player.skin]*.85*scale;
        const pad=event.pointerType==='touch'?7*density:3*density;
        if(Math.abs(px-x)>width+pad||py<y-height-pad||py>y+pad)continue;
        const d=Math.hypot((px-x)/(width+pad),(py-(y-height*.42))/(height*.6+pad));
        if(d<distance){distance=d;nearest=i;}
      }
      if(nearest!==null){stamp++;pendingState=G;act({t:'move',i:nearest});}
    }
    cv.addEventListener('pointerdown',event=>{
      if(!G||!hl.length)return;
      event.stopImmediatePropagation();
      if(event.pointerType==='touch'){
        touch={id:event.pointerId,x:event.clientX,y:event.clientY,stamp};
      }else selectFigure(event);
    },true);
    cv.addEventListener('pointerup',event=>{
      const start=touch;touch=null;
      if(start&&event.pointerId===start.id&&stamp===start.stamp&&Math.hypot(event.clientX-start.x,event.clientY-start.y)<12)selectFigure(event);
    });
    cv.addEventListener('pointercancel',()=>{touch=null;});

  },250);
})();
