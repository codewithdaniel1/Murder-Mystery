import {describe,it,expect} from 'vitest';
import * as T from 'three';
import {createCharacterMotion,animateCharacter} from '../src/characters';
import {dressCharacter} from '../src/appearance';
import {rigDog,animateDog,DogFollower} from '../src/dog';
import {EstateRoutines} from '../src/routines';
import {Yard} from '../src/yard';
import {furnishedEstate} from './estate-fixture';
import {freshState} from '../src/state';
import {clearSegment} from '../src/navigation';
import {loadModel} from './model-fixture';
import type {Estate} from '../src/world';

async function character(name:string){
 const gltf=await loadModel(name),actor=new T.Group();actor.add(gltf.scene);
 const motion=createCharacterMotion(gltf.scene,gltf.animations,new T.Group());
 const estate={characterMotion:new Map([['june',motion]]),actors:new Map([['june',{root:actor}]]),groundHeight:()=>0} as unknown as Estate;
 const frame=(moving=false,activity:'read'|'tidy'|null='read',paused=false,speed=.9)=>animateCharacter(estate,'june',moving,1/60,paused,activity,0,speed);
 const hand=()=>{actor.updateMatrixWorld(true);return motion.bones.get('hand_r')!.getWorldPosition(new T.Vector3())};
 return {actor,motion,frame,hand};
}

describe('NPC animation stability',()=>{
 it('keeps the cellar lantern in the moving hand and hanging upright',async()=>{
  const {actor,motion,frame,hand}=await character('harper');
  const lantern=new T.Group();motion.lantern=lantern;actor.add(lantern);
  actor.position.set(-5,-4.8,-43);actor.rotation.y=1.4;
  const first=new T.Vector3(),point=new T.Vector3();
  for(let i=0;i<90;i++){
   frame(i<60,null);lantern.getWorldPosition(point);
   const finger=motion.bones.get('index_01_r')!.getWorldPosition(new T.Vector3());
   expect(point.distanceTo(hand())).toBeLessThan(.15);
   expect(point.distanceTo(finger)).toBeLessThan(.065);
   expect(new T.Vector3(0,1,0).applyQuaternion(lantern.getWorldQuaternion(new T.Quaternion())).y).toBeCloseTo(1);
   if(i===0)first.copy(point);
   if(i===35)expect(point.distanceTo(first)).toBeGreaterThan(.005);
  }
 });
 for(const name of ['harper','jordan'])it(name+' keeps hand poses stable over repeated idle cycles and smooth interruptions',async()=>{
  const {motion,frame,hand}=await character(name);
  for(let i=0;i<720;i++)frame();const expected=hand(),pose=motion.bones.get('lowerarm_r')!.quaternion.clone();
  for(let i=0;i<3600;i++)frame();
  expect(hand().distanceTo(expected)).toBeLessThan(.002);
  expect(motion.bones.get('lowerarm_r')!.quaternion.angleTo(pose)).toBeLessThan(.002);
  let before=hand(),largest=0;
  for(let i=0;i<360;i++){frame(i%90<45,i%90<45?null:'tidy');const now=hand();largest=Math.max(largest,now.distanceTo(before));before=now;expect(motion.idle.getEffectiveWeight()).toBeCloseTo(1)}
  expect(largest).toBeLessThan(.07);
  const frozen=hand();for(let i=0;i<30;i++)frame(false,null,true);expect(hand().distanceTo(frozen)).toBe(0);
 });
 it('turns background staff toward their route before taking a step',async()=>{
  const e=furnishedEstate(),state=freshState();e.setPose({x:30,z:20,yaw:0,pitch:0});
  const yard=new Yard(e),staff=yard.witnesses.find(w=>w.id==='finch')!,gltf=await loadModel('sam');
  staff.root.add(gltf.scene);staff.motion=createCharacterMotion(gltf.scene,gltf.animations,new T.Group());staff.wait=0;
  const heading=Math.atan2(-22-staff.root.position.x,-25.55-staff.root.position.z);staff.root.rotation.y=heading+Math.PI;
  const start=staff.root.position.clone();yard.update(.1,state,true,null);
  expect(staff.root.position.distanceTo(start)).toBeLessThan(.001);
  staff.root.rotation.y=heading;yard.update(.1,state,true,null);
  const firstStep=staff.root.position.distanceTo(start);expect(firstStep).toBeGreaterThan(0);expect(firstStep).toBeLessThan(.025);
 });
 it('uses each model’s authored body gait without importing limb translations or scale',async()=>{
  for(const name of ['harper','jordan','sam','maya']){
   const {motion,frame}=await character(name);
   expect(motion.walk).toBeDefined();
   expect(motion.walk!.getClip().tracks.length).toBeGreaterThan(5);
   expect(motion.walk!.getClip().tracks.every(t=>t.name.endsWith('.quaternion')&&!/finger|index|hand|foot|Root/.test(t.name))).toBe(true);
   for(let i=0;i<90;i++)frame(true,null,false,.88);
   expect(motion.walk!.getEffectiveWeight()).toBeGreaterThan(.7);
   expect(motion.walk!.time).toBeCloseTo(motion.stridePhase/(Math.PI*2)*motion.walk!.getClip().duration);
   for(let i=0;i<90;i++)frame(false,null);
   expect(motion.walk!.getEffectiveWeight()).toBeLessThan(.001);
  }
 });
 it('scales gait cadence with actual speed and preserves stride phase across stop/start',async()=>{
  const {motion,frame}=await character('jordan');
  for(let i=0;i<60;i++)frame(true,null,false,.9);
  const before=motion.stridePhase;frame(true,null,false,.9);const fast=(motion.stridePhase-before+Math.PI*2)%(Math.PI*2);
  const next=motion.stridePhase;frame(true,null,false,.45);const slow=(motion.stridePhase-next+Math.PI*2)%(Math.PI*2);
  expect(slow).toBeCloseTo(fast/2);
  const phase=motion.stridePhase;frame(false,null);expect(motion.stridePhase).toBeCloseTo(phase);
  frame(true,null);expect(motion.stridePhase).toBeGreaterThan(phase);
 });
 it('holds each shoe in place while that leg bears weight',async()=>{
  const {actor,motion,frame}=await character('jordan'),speed=.88,dt=1/60;
  for(let i=0;i<90;i++){actor.position.z+=speed*dt;frame(true,null,false,speed)}
  const previous=new Map<'l'|'r',T.Vector3>();let checked=0;
  for(let i=0;i<120;i++){
   actor.position.z+=speed*dt;frame(true,null,false,speed);actor.updateMatrixWorld(true);
   for(const side of ['l','r'] as const){
    const phase=(motion.stridePhase/(Math.PI*2)+(side==='r'?.5:0))%1;
    const foot=motion.bones.get('foot_'+side)!.getWorldPosition(new T.Vector3());
    if(phase>.08&&phase<.55){const prior=previous.get(side);if(prior){expect(Math.hypot(foot.x-prior.x,foot.z-prior.z)).toBeLessThan(.004);checked++}previous.set(side,foot)}else previous.delete(side);
   }
  }
  expect(checked).toBeGreaterThan(30);
 });
 it('keeps knees inside the leg silhouette through a full walking cycle',async()=>{
  for(const name of ['harper','jordan','sam','maya']){
   const {actor,motion,frame}=await character(name);
   for(let i=0;i<240;i++){
    actor.position.z+=.9/60;frame(true,null,false,.9);actor.updateMatrixWorld(true);
    for(const side of ['l','r']){
     const hip=actor.worldToLocal(motion.bones.get('thigh_'+side)!.getWorldPosition(new T.Vector3()));
     const knee=actor.worldToLocal(motion.bones.get('calf_'+side)!.getWorldPosition(new T.Vector3()));
     expect(Math.abs(knee.x-hip.x)).toBeLessThan(.1);
    }
   }
  }
 });
 it('keeps the 1942 skirt seam joined while the thighs move',async()=>{
  for(const [id,name] of [['june','harper'],['ada','maya']] as const){
   const gltf=await loadModel(name),actor=new T.Group();actor.add(gltf.scene);
   const motion=createCharacterMotion(gltf.scene,gltf.animations,new T.Group());
   dressCharacter(id,gltf.scene);
   const skirt=gltf.scene.getObjectByName('1942 tailored skirt') as T.SkinnedMesh;
   expect(skirt).toBeInstanceOf(T.SkinnedMesh);
   const positions=skirt.geometry.getAttribute('position');
   const estate={characterMotion:new Map([[id,motion]]),actors:new Map([[id,{root:actor}]]),groundHeight:()=>0} as unknown as Estate;
   for(let i=0;i<120;i++){
    actor.position.z+=.9/60;animateCharacter(estate,id,true,1/60,false,null,0,.9);actor.updateMatrixWorld(true);
    for(let row=0;row<4;row++){
     const first=row*49,last=first+48;
     const a=skirt.applyBoneTransform(first,new T.Vector3().fromBufferAttribute(positions,first)).applyMatrix4(skirt.matrixWorld);
     const b=skirt.applyBoneTransform(last,new T.Vector3().fromBufferAttribute(positions,last)).applyMatrix4(skirt.matrixWorld);
     expect(a.distanceTo(b)).toBeLessThan(.001);
    }
   }
  }
 });
 it('keeps every dress hem below both knees through a walking cycle',async()=>{
  for(const [id,name] of [['ada','maya'],['june','harper'],['mara','harper'],['beatrice','harper']] as const){
   const gltf=await loadModel(name),actor=new T.Group();actor.add(gltf.scene);
   const motion=createCharacterMotion(gltf.scene,gltf.animations,new T.Group());
   dressCharacter(id,gltf.scene);
   const skirt=gltf.scene.getObjectByName('1942 tailored skirt') as T.SkinnedMesh;
   const positions=skirt.geometry.getAttribute('position');
   const estate={characterMotion:new Map([[id,motion]]),actors:new Map([[id,{root:actor}]]),groundHeight:()=>0} as unknown as Estate;
   for(let frame=0;frame<120;frame++){
    actor.position.z+=.9/60;animateCharacter(estate,id,true,1/60,false,null,frame/60,.9);
    if(frame%6!==0)continue;
    actor.updateMatrixWorld(true);
    const knees=['l','r'].map(side=>motion.bones.get('calf_'+side)!.getWorldPosition(new T.Vector3()).y);
    let highestHem=-Infinity;
    for(let i=positions.count-50;i<positions.count-1;i++){
     const point=skirt.applyBoneTransform(i,new T.Vector3().fromBufferAttribute(positions,i)).applyMatrix4(skirt.matrixWorld);
     highestHem=Math.max(highestHem,point.y);
    }
    expect(highestHem).toBeLessThan(Math.min(...knees)-.035);
   }
  }
 });
 it('keeps reading documents in both hands and puts them away before walking',async()=>{
  for(const [id,name] of [['rook','jordan'],['mara','harper'],['ada','maya'],['beatrice','harper']] as const){
   const gltf=await loadModel(name),actor=new T.Group();actor.add(gltf.scene);
   const book=new T.Group();actor.add(book);
   const motion=createCharacterMotion(gltf.scene,gltf.animations,book);
   const estate={characterMotion:new Map([[id,motion]]),actors:new Map([[id,{root:actor}]]),groundHeight:()=>0} as unknown as Estate;
   for(let i=0;i<90;i++)animateCharacter(estate,id,false,1/60,false,'read',i/60);
   expect(book.visible).toBe(true);
   actor.updateMatrixWorld(true);
   for(const side of ['l','r']){
    const finger=motion.bones.get('index_01_'+side)!.getWorldPosition(new T.Vector3());
    const grip=book.worldToLocal(finger);
    expect(Math.abs(Math.abs(grip.x)-.27)).toBeLessThan(.02);
    expect(grip.y).toBeGreaterThan(.015);
    expect(grip.y).toBeLessThan(.05);
    expect(grip.z).toBeGreaterThan(-.05);
    expect(grip.z).toBeLessThan(.16);
   }
   animateCharacter(estate,id,true,1/60,false,null,2,.9);
   expect(book.visible).toBe(false);
  }
 });
 it('turns before starting to walk in a different direction',()=>{
  const r=new EstateRoutines().update('june',{x:2.6,z:3},.1,[],{},false,undefined,Math.PI);
  expect(r.moving).toBe(false);expect(r.position).toEqual({x:2.6,z:3});expect(Math.abs(r.face)).toBeLessThan(.4);
 });
});

describe('Pip locomotion',()=>{
 it('skins the actual dog and plants stance paws while the opposite pair lifts',async()=>{
  const gltf=await loadModel('pip'),rig=rigDog(gltf.scene);
  expect(rig.legs).toHaveLength(4);expect(rig.meshes.length).toBeGreaterThan(0);
  for(const mesh of rig.meshes){const w=mesh.geometry.getAttribute('skinWeight');for(let i=0;i<w.count;i+=23)expect(w.getX(i)+w.getY(i)+w.getZ(i)+w.getW(i)).toBeCloseTo(1)}
  let maxLift=0,maxStanceError=0;
  for(let i=0;i<240;i++){
   animateDog(rig,.6/120,1/120);
   for(const leg of rig.legs){const offset=(leg.front?leg.side>0:leg.side<0)?0:.5,phase=(rig.phase+offset)%1;
    const paw=rig.root.worldToLocal(leg.foot.getWorldPosition(new T.Vector3()));
    if(phase<.5)maxStanceError=Math.max(maxStanceError,Math.abs(paw.y-leg.restFoot.y));
    else maxLift=Math.max(maxLift,paw.y-leg.restFoot.y);
   }
  }
  expect(maxStanceError).toBeLessThan(.006);expect(maxLift).toBeGreaterThan(.035);
  const phase=rig.phase;for(let i=0;i<180;i++)animateDog(rig,0,1/60);expect(rig.phase).toBe(phase);
  for(const leg of rig.legs){const paw=rig.root.worldToLocal(leg.foot.getWorldPosition(new T.Vector3()));expect(paw.distanceTo(leg.restFoot)).toBeLessThan(.001)}
 });
 it('follows around a wall without teleporting and settles near its companion',()=>{
  const follower=new DogFollower(),barriers=[{x:0,z:0,w:2,d:3}],target={x:4,z:0};let p={x:-4,z:0},heading=0,travel=0;
  for(let i=0;i<1200;i++){const r=follower.update(p,heading,target,1/60,barriers,{},false);expect(clearSegment(p,r.position,barriers,{},.22)).toBe(true);expect(r.distance).toBeLessThanOrEqual(1.65/60+.00001);travel+=r.distance;p=r.position;heading=r.heading}
  expect(travel).toBeGreaterThan(7);expect(Math.hypot(p.x-target.x,p.z-target.z)).toBeLessThan(1.5);
  const frozen=follower.update(p,heading,{x:20,z:20},1,barriers,{},true);expect(frozen.position).toEqual(p);expect(frozen.distance).toBe(0);
 });
 it('keeps pace with a brisk player and catches up on the clear side of a blocked passage',()=>{
  const pip=new DogFollower(),dt=1/60,valid=()=>true;
  let result={position:{x:0,z:1.5},heading:Math.PI,distance:0,recovered:false};
  for(let i=0;i<360;i++){
   const player={x:0,z:-i*dt*4.5};
   result=pip.accompany(result.position,result.heading,player,0,dt,[],{},valid);
   expect(result.recovered).toBe(false);
   expect(Math.abs(result.position.z-player.z)).toBeLessThan(1.9);
  }
  const blockers=[{x:0,z:0,w:1,d:200,door:'rear'}],player={x:3,z:0};
  pip.reset();result={position:{x:-3,z:0},heading:Math.PI/2,distance:0,recovered:false};
  let recovered=false;
  for(let i=0;i<120;i++){
   const previous=result.position;
   result=pip.accompany(previous,result.heading,player,0,dt,blockers,{},valid);
   if(result.recovered){recovered=true;expect(result.distance).toBe(0);}
   else expect(clearSegment(previous,result.position,blockers,{},.22)).toBe(true);
  }
  expect(recovered).toBe(true);
  expect(Math.hypot(result.position.x-player.x,result.position.z-player.z)).toBeLessThan(1.7);
 });
 it('waits behind a closed door and resumes when it opens',()=>{
  const follower=new DogFollower(),barriers=[{x:0,z:0,w:.2,d:200,door:'rear'}],target={x:3,z:0};let p={x:-3,z:0},heading=Math.PI/2;
  for(let i=0;i<60;i++){const r=follower.update(p,heading,target,1/60,barriers,{},false);p=r.position;heading=r.heading}expect(p.x).toBe(-3);
  for(let i=0;i<400;i++){const r=follower.update(p,heading,target,1/60,barriers,{rear:true},false);p=r.position;heading=r.heading}expect(p.x).toBeGreaterThan(1);
 });
});
