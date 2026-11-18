import {it,expect,vi} from 'vitest';
import * as T from 'three';
import {AutoResolution,renderPixelRatio,prepareScene} from '../src/render-performance';

it('limits Auto render pixels on Retina and large displays without upscaling ordinary displays',()=>{
 for(const [w,h,dpr]of[[2560,1440,2],[3840,2160,2],[1600,900,2],[800,600,1]]){
  const ratio=renderPixelRatio('Auto',w,h,dpr);
  expect(w*h*ratio*ratio).toBeLessThanOrEqual(1440000.01);expect(ratio).toBeLessThanOrEqual(dpr);
 }
 expect(renderPixelRatio('High',2560,1440,2)).toBe(1.8);
 expect(renderPixelRatio('Low',2560,1440,2)).toBe(.85);
});
it('adapts to sustained slow frames with cooldown and ignores a pause or a single hitch',()=>{
 const auto=new AutoResolution();
 for(let i=0;i<180;i++)expect(auto.sample(1/60,true)).toBe(false);
 expect(auto.sample(.8,true)).toBe(false);expect(auto.scale).toBe(1);
 let changes=0;for(let i=0;i<240;i++)if(auto.sample(1/30,true))changes++;
 expect(changes).toBeGreaterThan(0);expect(changes).toBeLessThanOrEqual(2);expect(auto.scale).toBeLessThan(1);
 const scale=auto.scale;for(let i=0;i<180;i++)auto.sample(1/60,false);expect(auto.scale).toBe(scale);
 for(let i=0;i<2400;i++)auto.sample(1/120,true);expect(auto.scale).toBeGreaterThan(scale);expect(auto.scale).toBeLessThanOrEqual(1);
 auto.reset();expect(auto.scale).toBe(1);
});
it('warms hidden arrivals and shared textures while restoring visibility and preserving hidden clothing',async()=>{
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(),room=new T.Group(),texture=new T.Texture();room.visible=false;scene.add(room);
 const hiddenMesh=new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial({map:texture}));hiddenMesh.visible=false;room.add(hiddenMesh);
 room.add(new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial({map:texture})));
 const renderer={compileAsync:vi.fn(async()=>{expect(room.visible).toBe(true);expect(hiddenMesh.visible).toBe(false)}),initTexture:vi.fn()};
 await prepareScene(renderer,scene,camera);expect(room.visible).toBe(false);expect(renderer.initTexture).toHaveBeenCalledTimes(1);
 renderer.compileAsync.mockRejectedValueOnce(new Error('GPU context lost'));
 await expect(prepareScene(renderer,scene,camera)).rejects.toThrow('GPU context lost');expect(room.visible).toBe(false);
});
