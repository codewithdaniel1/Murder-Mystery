import {describe,it,expect} from 'vitest';
import * as T from 'three';
import {furnishedEstate} from './estate-fixture';
import {freshState} from '../src/state';
import {normalized,landscape} from '../src/visuals';
import {createCharacterMotion,animateCharacter} from '../src/characters';
import {loadModel} from './model-fixture';
import type {Estate} from '../src/world';
import {resolveOverlap,clearAt,clearSegment} from '../src/navigation';
import {STAIR,UPPER_FLOOR} from '../src/upstairs';
import {decodeSave,encodeSave} from '../src/state';
import {ATTIC_FLOOR,ATTIC_STAIR} from '../src/attic';
import {buildShed,SHED,WITNESSES,Yard} from '../src/yard';
import {buildCellar,BULKHEADS,bulkheadGate,CELLAR_FLOOR} from '../src/cellar';

describe('walkable surfaces and physical obstacles',()=>{
 it('keeps the shed entrance walkable and its back and sides solid',()=>{
  const e=furnishedEstate(),s=freshState();buildShed(e);
  e.setPose({x:SHED.x,z:SHED.z+4,yaw:0,pitch:0});
  e.move(0,-8,s);expect(e.pose().z).toBeLessThan(SHED.z-1);
  expect(e.pose().z).toBeGreaterThan(SHED.z-SHED.depth/2);
  e.move(0,3,s);expect(e.pose().z).toBeGreaterThan(SHED.z);
 });
 it('moves both outdoor witnesses and wildlife, and pauses a witness for conversation',async()=>{
  const e=furnishedEstate(),s=freshState();buildShed(e);const yard=new Yard(e);
  e.setPose(s.pose);
  for(const w of yard.witnesses){
   const spec=WITNESSES[w.id],source=await loadModel(w.id==='finch'?'sam':'harper');
   w.root.add(source.scene);w.motion=createCharacterMotion(source.scene,source.animations,new T.Group());
   expect(e.targets.find(t=>t.root===w.root)?.label).toBe(spec.name);
  }
  const homes=yard.witnesses.map(w=>w.root.position.clone());
  const bird=e.scene.getObjectByName('Garden bird')!,origin=bird.position.clone();
  for(let i=0;i<465;i++)yard.update(1/60,s,true,null);
  for(const [i,w] of yard.witnesses.entries())expect(w.root.position.distanceTo(homes[i])).toBeGreaterThan(1.5);
  expect(bird.position.distanceTo(origin)).toBeGreaterThan(2);
  const [finch]=yard.witnesses,location=finch.root.position.clone();
  for(let i=0;i<90;i++)yard.update(1/60,s,true,'finch');
  expect(finch.root.position.distanceTo(location)).toBeLessThan(.001);
  expect(s.evidence).toEqual([]);
 });
 it('walks from the second floor to both attic rooms and back, and restores attic saves',()=>{
  const e=furnishedEstate(),s=freshState(),stair=ATTIC_STAIR;
  e.setPose({x:stair.bottom+.48,z:stair.z,yaw:0,pitch:0,elevation:UPPER_FLOOR});
  e.move(-2,0,s);expect(e.pose().elevation).toBeGreaterThan(UPPER_FLOOR);
  e.move(-6.5,0,s);expect(e.pose().elevation).toBe(ATTIC_FLOOR);
  e.move(0,-.85-e.pose().z,s);
  e.move(-9-e.pose().x,0,s);expect(e.pose().x).toBeCloseTo(-9);
  e.move(9-e.pose().x,0,s);expect(e.pose().x).toBeCloseTo(9);
  const saved=decodeSave(encodeSave(s,e.pose()))!;
  e.setPose(s.pose);e.setPose(saved.pose);expect(e.camera.position.y).toBeCloseTo(ATTIC_FLOOR+1.65);
  e.move(stair.top-1-e.pose().x,0,s);e.move(0,stair.z-e.pose().z,s);
  e.move(9,0,s);expect(e.pose().elevation).toBe(UPPER_FLOOR);
 });
 it('starts all three bulkheads closed, seals their lids, and opens from beneath',()=>{
  const e=furnishedEstate(),s=freshState();buildCellar(e);
  e.ray=new T.Raycaster();e.pointer=new T.Vector2();
  for(const entry of BULKHEADS){
   e.setPose({x:entry.x,z:entry.top-entry.direction,yaw:0,pitch:0});
   e.syncBulkheads(s);expect(e.cellarDoors.get(entry.id)?.amount).toBe(0);
   e.scene.updateMatrixWorld(true);
   const lid=e.targets.find(t=>t.id==='bulkhead:'+entry.id)!.root;
   for(const dx of [-1.62,0,1.62])for(const along of [.015,1.8,3.585]){
    const z=entry.top+entry.direction*along;
    const ray=new T.Raycaster(new T.Vector3(entry.x+dx,1,z),new T.Vector3(0,-1,0),0,1);
    expect(ray.intersectObject(lid,true)).not.toHaveLength(0);
   }
   e.move(0,entry.direction*3,s);
   expect((e.pose().z-entry.top)*entry.direction).toBeLessThan(0);
   const gate=bulkheadGate(entry,true);
   e.setPose({x:entry.x,z:gate.z+entry.direction*.65,elevation:-2,yaw:0,pitch:0});
   e.move(0,-entry.direction*3,s);
   expect((e.pose().z-gate.z)*entry.direction).toBeGreaterThan(0);
   e.setPose(e.pose());e.camera.lookAt(entry.x+.45,.25,gate.z-entry.direction*.25);
   e.scene.updateMatrixWorld(true);e.camera.updateMatrixWorld(true);
   expect(e.targetAt()?.id).toBe('bulkhead:'+entry.id);
   const restored=decodeSave(encodeSave(s,e.pose()))!;
   expect(restored.doors[entry.id]).not.toBe(true);
   expect(e.toggleBulkhead(entry.id,s)).toBe(true);e.syncBulkheads(s);
   e.move(0,-entry.direction*4,s);expect(e.inCellar()).toBe(false);
  }
 });
 it('connects both exterior stairways through the cellar and bunker',()=>{
  const e=furnishedEstate(),s=freshState();landscape(e);buildCellar(e);
  const [corner,garden,hall]=BULKHEADS;
  for(const d of BULKHEADS)s.doors[d.id]=true;
  e.syncBulkheads(s);
  e.setPose({x:corner.x,z:corner.top+1,yaw:0,pitch:0});
  e.move(0,-4,s);
  expect(e.pose().elevation).toBeLessThan(-1);expect(e.pose().elevation).toBeGreaterThan(CELLAR_FLOOR);
  e.move(0,-5.8,s);expect(e.pose().elevation).toBe(CELLAR_FLOOR);
  e.scene.updateMatrixWorld(true);
  for(const y of [.08,1.65,3.65]){
   const ray=new T.Raycaster(new T.Vector3(-12,CELLAR_FLOOR+y,-20.7),new T.Vector3(1,0,0),0,2);
   expect(ray.intersectObjects(e.walls)).not.toHaveLength(0);
  }
  e.move(16,0,s);expect(e.pose().x).toBeCloseTo(-10.5);
  // The west stair leads straight to the wine vault without crossing the hub.
  e.move(3.05,0,s);e.move(0,3.9,s);expect(e.pose().z).toBeCloseTo(-15.4);
  e.move(0,6.4,s);e.move(5.45,0,s);expect(e.pose().x).toBeCloseTo(-2);
  e.move(-5.45,0,s);e.move(0,-6.4,s);
  e.move(0,-3.9,s);e.move(-3.05,0,s);
  e.move(0,2,s);e.move(10.5,0,s);expect(e.pose().x).toBeCloseTo(0);
  e.move(0,-20,s);
  const saved=decodeSave(encodeSave(s,e.pose()))!;
  e.setPose(s.pose);e.setPose(saved.pose);expect(e.inCellar()).toBe(true);
  e.move(0,-12,s);expect(e.pose().z).toBeLessThan(garden.top);expect(e.inCellar()).toBe(false);
  e.move(0,-14.6-e.pose().z,s);e.move(2,0,s);e.move(0,5.6,s);
  expect(e.pose().z).toBeCloseTo(-9);
  e.move(-2,0,s);
  e.move(-6.5,0,s);expect(e.pose().x).toBeLessThan(-6);
  e.move(12.5,0,s);expect(e.pose().x).toBeGreaterThan(5);
  e.setPose({x:hall.x,z:hall.top+1,yaw:0,pitch:0});
  e.scene.updateMatrixWorld(true);
  const shaft=new T.Raycaster(new T.Vector3(hall.x,1,hall.top-1.8),new T.Vector3(0,-1,0),0,1.25);
  expect(shaft.intersectObjects(e.scene.children,true)).toEqual([]);
  e.move(0,-9,s);expect(e.pose().elevation).toBe(CELLAR_FLOOR);
  // From the hall landing, the shelter branches off the approach to the tunnel.
  e.move(-hall.x,0,s);e.move(0,-17.55-e.pose().z,s);
  e.move(4.8,0,s);expect(e.pose().x).toBeGreaterThan(4.5);
  e.move(-4.8+hall.x,0,s);e.move(0,-13.7-e.pose().z,s);
  e.move(0,9,s);expect(e.inCellar()).toBe(false);
 });
 it('connects both storeys through the stair and restores upstairs saves',()=>{
  const e=furnishedEstate(),s=freshState();
  e.setPose({x:STAIR.x,z:STAIR.bottom+.5,yaw:0,pitch:0});
  e.move(0,-2,s);expect(e.pose().elevation).toBeGreaterThan(.8);
  e.move(0,-8,s);expect(e.pose().elevation).toBe(UPPER_FLOOR);
  expect(e.groundHeight(STAIR.x,-7)).toBeCloseTo(.075);
  const saved=decodeSave(encodeSave(s,e.pose()))!;
  e.setPose(s.pose);e.setPose(saved.pose);expect(e.camera.position.y).toBeCloseTo(UPPER_FLOOR+1.65);
  e.move(0,10,s);expect(e.pose().elevation).toBeCloseTo(.075);
 });
 it('opens all four upstairs rooms and keeps the window walls and stair railing solid',()=>{
  const e=furnishedEstate(),s=freshState();
  for(const x of [-1,1])for(const z of [-9.2,6.3]){
   e.setPose({x:0,z,yaw:0,pitch:0,elevation:UPPER_FLOOR});
   e.move(x*8,0,s);expect(e.pose().x*x).toBeGreaterThan(7.5);
  }
  e.setPose({x:0,z:1,yaw:0,pitch:0,elevation:UPPER_FLOOR});
  e.move(-5,0,s);expect(e.pose().x).toBeGreaterThan(-2.55);
  e.setPose({x:0,z:10,yaw:0,pitch:0,elevation:UPPER_FLOOR});
  e.move(0,5,s);expect(e.pose().z).toBeLessThan(11.7);
 });
 it('opens onto a walkable balcony with solid railings and a restorable save',()=>{
  const e=furnishedEstate(),s=freshState();
  e.setPose({x:0,z:10,yaw:0,pitch:0,elevation:UPPER_FLOOR});
  e.move(0,4,s);expect(e.pose().z).toBeLessThan(12);
  s.doors.balcony=true;
  e.doors.get('balcony')!.pivot.rotation.y=-Math.PI/2;
  e.move(0,8,s);expect(e.pose().z).toBeGreaterThan(14);
  expect(e.pose().z).toBeLessThan(14.55);
  e.move(6,0,s);expect(e.pose().x).toBeLessThan(2.9);
  e.setPose(decodeSave(encodeSave(s,e.pose()))!.pose);
  expect(e.camera.position.y).toBeCloseTo(UPPER_FLOOR+1.65);
  e.move(-e.pose().x,0,s);e.move(0,-4,s);expect(e.pose().z).toBeLessThan(11);
 });
 it('uses the actual floor, path and greenhouse slab elevations',()=>{const e=furnishedEstate();landscape(e);expect(e.groundHeight(0,0)).toBe(.075);expect(e.groundHeight(26,-29)).toBe(.075);expect(e.groundHeight(0,-23)).toBe(.01);expect(e.groundHeight(-30,30)).toBe(-.08);expect(e.groundHeight(-16,-40)).toBeCloseTo(.26)});
 it('raises the fountain planting beds without lifting the crossing paths',()=>{const e=furnishedEstate();landscape(e);for(const x of[-12,12])expect(e.groundHeight(x,-29)).toBeCloseTo(.13);expect(e.groundHeight(12,-23)).toBeCloseTo(.01);expect(e.groundHeight(12,-35)).toBeCloseTo(.01);expect(e.groundHeight(-12,-35)).toBeCloseTo(-.08)});
 it('keeps the library service doorway free of shelves',()=>{const e=furnishedEstate();e.scene.updateMatrixWorld(true);const hits=new T.Raycaster(new T.Vector3(9.2,1.7,-8),new T.Vector3(0,0,-1),0,3).intersectObjects(e.scene.children,true);expect(hits).toEqual([]);expect(e.barriers.some(b=>Math.abs(9.2-b.x)<b.w/2&&Math.abs(-9.4-b.z)<b.d/2)).toBe(false)});
 it('has walkable front and back greenhouse entrances with solid side glazing',()=>{const e=furnishedEstate();expect(clearSegment({x:26,z:-23.5},{x:26,z:-34.5},e.barriers,{},.26)).toBe(true);for(const z of[-25,-33])expect(clearSegment({x:22,z:z-1},{x:22,z:z+1},e.barriers,{},.26)).toBe(false);e.scene.updateMatrixWorld(true);const hits=new T.Raycaster(new T.Vector3(26,1.7,-34),new T.Vector3(0,0,1),0,10).intersectObjects(e.scene.children,true);expect(hits).toEqual([])});
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
