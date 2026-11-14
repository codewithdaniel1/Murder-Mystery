import {describe,it,expect} from 'vitest';
import * as T from 'three';
import {furnishedEstate} from './estate-fixture';
import {freshState} from '../src/state';
import {normalized,landscape} from '../src/visuals';
import {createCharacterMotion,animateCharacter} from '../src/characters';
import {loadModel} from './model-fixture';
import type {Estate} from '../src/world';
import {resolveOverlap,clearAt} from '../src/navigation';

describe('walkable surfaces and physical obstacles',()=>{
 it('uses the actual floor, path and greenhouse slab elevations',()=>{const e=furnishedEstate();landscape(e);expect(e.groundHeight(0,0)).toBe(.075);expect(e.groundHeight(26,-29)).toBe(.075);expect(e.groundHeight(0,-23)).toBe(.01);expect(e.groundHeight(-30,30)).toBe(-.08);expect(e.groundHeight(-16,-40)).toBeCloseTo(.26)});
 it('keeps the library service doorway free of shelves',()=>{const e=furnishedEstate();e.scene.updateMatrixWorld(true);const hits=new T.Raycaster(new T.Vector3(9.2,1.7,-8),new T.Vector3(0,0,-1),0,3).intersectObjects(e.scene.children,true);expect(hits).toEqual([]);expect(e.barriers.some(b=>Math.abs(9.2-b.x)<b.w/2&&Math.abs(-9.4-b.z)<b.d/2)).toBe(false)});
 it('blocks movement through a parked car even with a large movement request',()=>{const e=furnishedEstate(),s=freshState();s.arrival='present';e.camera.position.set(4,1.65,19);e.move(0,10,s);expect(e.camera.position.z).toBeLessThan(21.13);e.camera.position.set(7,1.65,24);e.move(-8,0,s);expect(e.camera.position.x).toBeGreaterThan(5.47)});
 it('stops the arriving car before reaching someone, then resumes when clear',()=>{const e=furnishedEstate(),s=freshState();e.dog=new T.Group();e.dog.position.set(13,0,1);e.camera.position.set(4,1.65,45);let progress=0;for(let i=0;i<900;i++)progress=e.advanceArrival(progress,1/60,s);const z=56-32*T.MathUtils.smoothstep(progress,0,1);expect(z).toBeGreaterThan(48);expect(progress).toBeLessThan(1);e.camera.position.x=9;for(let i=0;i<900;i++)progress=e.advanceArrival(progress,1/60,s);expect(progress).toBe(1)});
 it('lets an old save escape a newly solid car or closed door',()=>{const barriers=[{x:4,z:24,w:2.45,d:5.25}];const p=resolveOverlap({x:4,z:24},barriers,{});expect(clearAt(p,barriers,{},.26)).toBe(true);expect(Math.hypot(p.x-4,p.z-24)).toBeLessThan(1.6)});
 it('normalizes imported scenery with nonzero root position and scale without floating',()=>{const source=new T.Group();source.position.set(3,8,-4);source.scale.set(2,3,2);const mesh=new T.Mesh(new T.BoxGeometry(2,4,2));mesh.position.set(0,6,0);source.add(mesh);const model=normalized(source,1.8),bounds=new T.Box3().setFromObject(model);expect(bounds.min.y).toBeCloseTo(0);expect(bounds.max.y).toBeCloseTo(1.8);expect(bounds.getCenter(new T.Vector3()).x).toBeCloseTo(0)});
});

describe('deformed shoe geometry stays above the floor',()=>{
 for(const name of ['harper','jordan','sam','maya'])it(name+' has planted soles throughout a walking cycle and across a raised surface',async()=>{
  const gltf=await loadModel(name),actor=new T.Group();actor.add(gltf.scene);
  const motion=createCharacterMotion(gltf.scene,gltf.animations,new T.Group(),new T.Mesh());expect(motion.soleSamples.length).toBeGreaterThan(0);
  const groundHeight=(_x:number,z:number)=>z<0?.075:.081;
  const e={characterMotion:new Map([['june',motion]]),actors:new Map([['june',{root:actor}]]),groundHeight} as unknown as Estate;
  let worst=Infinity;for(let frame=0;frame<180;frame++){
   actor.position.z=-.8+frame/120;actor.position.y=groundHeight(0,actor.position.z);
   animateCharacter(e,'june',true,1/60,false,null,frame/60,.9);
   if(frame%6)continue;actor.updateMatrixWorld(true);
   if(frame>60){const l=actor.worldToLocal(motion.bones.get('foot_l')!.getWorldPosition(new T.Vector3())),r=actor.worldToLocal(motion.bones.get('foot_r')!.getWorldPosition(new T.Vector3()));expect(Math.abs(l.x-r.x)).toBeLessThan(.25)}
   const meshes=new Set(motion.soleSamples.map(s=>s.mesh));let minimum=Infinity;
   for(const mesh of meshes){const pos=mesh.geometry.getAttribute('position');for(let i=0;i<pos.count;i+=3){const p=mesh.applyBoneTransform(i,new T.Vector3().fromBufferAttribute(pos,i)).applyMatrix4(mesh.matrixWorld);minimum=Math.min(minimum,p.y-groundHeight(p.x,p.z))}}
   worst=Math.min(worst,minimum);expect(minimum).toBeLessThan(.015);
  }
  expect(worst).toBeGreaterThan(-.006);
 });
});
