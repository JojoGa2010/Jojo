/* A continuous three-bone deformation of the existing skins, anchored at the foot. */
(() => {
  let attempts=0;
  const ready=setInterval(()=>{
    if(typeof pin!=='function'||document.documentElement.dataset.kkPlayers!=='6'){if(++attempts>600)clearInterval(ready);return;}
    clearInterval(ready);install();
  },180);
  function poseAt(time,phase=0,moving=false){
    const gain=moving?1.25:1;
    return{
      lower:Math.sin(time*1.7+phase)*.025*gain,
      upper:Math.sin(time*2.1+phase+.8)*.055*gain,
      head:Math.sin(time*1.35+phase*1.3)*.105*gain,
      nod:Math.sin(time*2.6+phase+1)*1.05*gain,
      breath:1+Math.sin(time*1.8+phase)*.018,
      yaw:1-Math.pow(Math.sin(time*.9+phase),2)*.055
    };
  }
  function kickPose(kick){return{lower:0,upper:-kick.x*kick.amount*.14,head:kick.x*kick.amount*.06,nod:0,breath:1,yaw:1,kick};}
  const turn=(point,angle,pivot)=>{
    const x=point[0],y=point[1]-pivot,c=Math.cos(angle),s=Math.sin(angle);
    return[x*c-y*s,x*s+y*c+pivot];
  };
  function deform(x,y,p){
    const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
    const headWeight=1-smooth(-37,-28,y),lowerWeight=smooth(-23,-12,y),upperWeight=1-headWeight-lowerWeight;
    const lower=p.kick?turn([x,y],-p.kick.x*.95*p.kick.amount,-17):turn([x,y],p.lower,0);
    if(p.kick)lower[1]+=p.kick.y*12*p.kick.amount*(y+17)/17;
    const upperMap=point=>turn(turn([point[0],-16+(point[1]+16)*p.breath],p.upper,-16),p.lower,0);
    const upper=upperMap([x,y]);
    const head=upperMap(turn([x*p.yaw,y+p.nod],p.head,-33));
    return[lower[0]*lowerWeight+upper[0]*upperWeight+head[0]*headWeight,lower[1]*lowerWeight+upper[1]*upperWeight+head[1]*headWeight];
  }
  function install(){
    if(document.documentElement.dataset.kkAnimation)return;
    document.documentElement.dataset.kkAnimation='1';
    const basePin=pin,cache=new Map(),ratio=3,left=-24,top=-84,width=48,height=88;
    const bands=[];
    for(const [start,end,step] of [[-84,-37,47],[-37,-28,1.8],[-28,-23,5],[-23,-12,2.2],[-12,4,16]]){
      for(let y=start;y<end-.00001;y+=step)bands.push([y,Math.min(step,end-y)]);
    }
    const reduced=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
    function sprite(color,skin,face){
      const key=color+'|'+skin+'|'+(face?1:0);
      if(cache.has(key))return cache.get(key);
      const canvas=document.createElement('canvas');canvas.width=width*ratio;canvas.height=height*ratio;
      const ctx=canvas.getContext('2d');
      // Cancel the old whole-figure idle wobble only when preparing the texture.
      basePin(ctx,-left*ratio,-top*ratio,ratio,color,skin,{ph:-tnow*2.2,face:face?1:0});
      cache.set(key,canvas);if(cache.size>128)cache.delete(cache.keys().next().value);
      return canvas;
    }
    function triangle(ctx,texture,points,matrix,row){
      const area=(points[1][0]-points[0][0])*(points[2][1]-points[0][1])-(points[1][1]-points[0][1])*(points[2][0]-points[0][0]),sign=Math.sign(area);
      const expanded=points.map((p,i)=>{
        const previous=points[(i+2)%3],next=points[(i+1)%3],a=[p[0]-previous[0],p[1]-previous[1]],b=[next[0]-p[0],next[1]-p[1]],al=Math.hypot(...a),bl=Math.hypot(...b);
        const n1=[sign*a[1]/al,-sign*a[0]/al],n2=[sign*b[1]/bl,-sign*b[0]/bl],factor=.18/Math.max(.002,1+n1[0]*n2[0]+n1[1]*n2[1]);
        return[p[0]+(n1[0]+n2[0])*factor,p[1]+(n1[1]+n2[1])*factor];
      });
      ctx.save();ctx.beginPath();ctx.moveTo(...expanded[0]);ctx.lineTo(...expanded[1]);ctx.lineTo(...expanded[2]);ctx.closePath();ctx.clip();
      ctx.transform(...matrix);ctx.drawImage(texture,0,-row,width,height);ctx.restore();
    }
    pin=function(ctx,x,y,scale,color,skin,options={}){
      if(!G||!document.querySelector('#game').classList.contains('on')){basePin(ctx,x,y,scale,color,skin,options);return;}
      if(reduced.matches){basePin(ctx,x,y,scale,color,skin,{...options,ph:-tnow*2.2});return;}
      const moving=(options.z||0)>3||Math.abs((options.sq||1)-1)>.025||Math.abs(options.rot||0)>.1;
      const p=options.kick?kickPose(options.kick):poseAt(tnow,(options.ph||0)+skin*.41,moving),texture=sprite(color,skin,options.face),sq=options.sq||1;
      ctx.save();ctx.translate(x,y);ctx.rotate(options.rot||0);ctx.scale(scale*(2-sq),scale*sq);
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      // Matched triangle corners prevent cracks where neighbouring bones bend.
      for(const [y,dy] of bands){
        const row=y-top,a=deform(left,y,p),b=deform(left+width,y,p),c=deform(left,y+dy,p),d=deform(left+width,y+dy,p);
        triangle(ctx,texture,[a,b,c],[(b[0]-a[0])/width,(b[1]-a[1])/width,(c[0]-a[0])/dy,(c[1]-a[1])/dy,a[0],a[1]],row);
        const ax=(d[0]-c[0])/width,ay=(d[1]-c[1])/width,bx=(d[0]-b[0])/dy,by=(d[1]-b[1])/dy;
        triangle(ctx,texture,[c,d,b],[ax,ay,bx,by,c[0]-bx*dy,c[1]-by*dy],row);
      }
      ctx.restore();
    };
    window.KKFigureAnimation={poseAt,kickPose,deform,cacheSize:()=>cache.size};
  }
})();
