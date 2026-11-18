import * as T from 'three';
export function renderPixelRatio(quality:string,width:number,height:number,dpr:number,scale=1){
 const native=Math.max(.1,dpr);
 if(quality==='Auto')return Math.min(native,1.25,Math.sqrt(1600*900/(Math.max(1,width)*Math.max(1,height))))*scale;
 return Math.min(native,quality==='Low'?.85:quality==='High'?1.8:1.25);
}

// Adapt only to sustained load. Separate slow/fast thresholds and a cooldown
// prevent frequent render-target reallocations or alternating sharp/soft frames.
export class AutoResolution {
 scale=1;
 private elapsed=0;
 private frames=0;
 private cooldown=3;
 private fast=0;
 reset(){this.scale=1;this.elapsed=0;this.frames=0;this.cooldown=3;this.fast=0;}
 sample(seconds:number,active:boolean){
  if(!active||seconds<=0||seconds>.25){this.elapsed=0;this.frames=0;this.fast=0;return false;}
  this.cooldown=Math.max(0,this.cooldown-seconds);this.elapsed+=seconds;this.frames++;
  if(this.elapsed<1.5)return false;
  const average=this.elapsed/this.frames;this.fast=average<.0175?this.fast+this.elapsed:0;
  this.elapsed=0;this.frames=0;if(this.cooldown>0)return false;
  const before=this.scale;
  if(average>.024){this.scale=Math.max(.65,Math.round((this.scale-.1)*100)/100);this.fast=0;}
  else if(this.fast>=10){this.scale=Math.min(1,Math.round((this.scale+.05)*100)/100);this.fast=0;}
  if(before===this.scale)return false;
  this.cooldown=5;return true;
 }
}


export async function prepareScene(renderer:Pick<T.WebGLRenderer,'compileAsync'|'initTexture'>,scene:T.Scene,camera:T.Camera){
 const hidden:T.Group[]=[],textures=new Set<T.Texture>();
 scene.traverse(object=>{
  // Preserve intentionally hidden clothing meshes, but include rooms, arrivals,
  // and handheld props that first appear later in the investigation.
  if(object instanceof T.Group&&!object.visible){hidden.push(object);object.visible=true;}
  if(!(object instanceof T.Mesh))return;
  for(const material of Array.isArray(object.material)?object.material:[object.material])
   for(const value of Object.values(material))if(value instanceof T.Texture&&!value.isRenderTargetTexture)textures.add(value);
 });
 try{
  await renderer.compileAsync(scene,camera);
  let count=0;
  for(const texture of textures){renderer.initTexture(texture);if(++count%4===0)await new Promise(resolve=>setTimeout(resolve,0));}
 }finally{for(const group of hidden)group.visible=false;}
}
