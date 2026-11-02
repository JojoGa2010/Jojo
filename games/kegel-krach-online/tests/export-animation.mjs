import{createCanvas,loadImage}from'@napi-rs/canvas';
import gifenc from'gifenc';
const{GIFEncoder,quantize,applyPalette}=gifenc;
import{writeFileSync}from'node:fs';
const directory=process.argv[2],target=process.argv[3];
if(!directory||!target)throw new Error('Specify frame directory and GIF output path.');
const canvas=createCanvas(900,380),ctx=canvas.getContext('2d'),gif=GIFEncoder();
let palette;const order=[...Array(36).keys(),...Array.from({length:34},(_,i)=>34-i)];
for(const i of order){
 const image=await loadImage(directory+'/frame-'+String(i).padStart(2,'0')+'.png');ctx.drawImage(image,0,0);
 const rgba=ctx.getImageData(0,0,900,380).data;if(!palette)palette=quantize(rgba,256);
 gif.writeFrame(applyPalette(rgba,palette),900,380,{palette,delay:83,repeat:0});
}
gif.finish();writeFileSync(target,gif.bytes());console.log('Animated figure preview saved.');
