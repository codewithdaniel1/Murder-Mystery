import {describe,it,expect} from 'vitest';
import * as T from 'three';
import {createCharacterMotion,animateCharacter} from '../src/characters';
import {rigDog,animateDog,DogFollower} from '../src/dog';
import {EstateRoutines} from '../src/routines';
import {clearSegment} from '../src/navigation';
import {loadModel} from './model-fixture';
import type {Estate} from '../src/world';

async function character(name:string){
 const gltf=await loadModel(name),actor=new T.Group();actor.add(gltf.scene);
 const motion=createCharacterMotion(gltf.scene,gltf.animations,new T.Group(),new T.Mesh());
 const estate={characterMotion:new Map([['june',motion]]),actors:new Map([['june',{root:actor}]])} as unknown as Estate;
 const frame=(moving=false,activity:'read'|'tidy'|null='read',paused=false,speed=.9)=>animateCharacter(estate,'june',moving,1/60,paused,activity,0,speed);
 const hand=()=>{actor.updateMatrixWorld(true);return motion.bones.get('hand_r')!.getWorldPosition(new T.Vector3())};
 return {motion,frame,hand};
}

describe('NPC animation stability',()=>{
 for(const name of ['harper','jordan'])it(name+' keeps hand poses stable over repeated idle cycles and smooth interruptions',async()=>{
  const {motion,frame,hand}=await character(name);
  for(let i=0;i<720;i++)frame();const expected=hand(),pose=motion.bones.get('lowerarm_r')!.quaternion.clone();
  for(let i=0;i<3600;i++)frame();
  expect(hand().distanceTo(expected)).toBeLessThan(.002);
  expect(motion.bones.get('lowerarm_r')!.quaternion.angleTo(pose)).toBeLessThan(.002);
  let before=hand(),largest=0;
  for(let i=0;i<360;i++){frame(i%90<45,i%90<45?null:'tidy');const now=hand();largest=Math.max(largest,now.distanceTo(before));before=now;expect(motion.idle.getEffectiveWeight()+motion.walk.getEffectiveWeight()).toBeCloseTo(1)}
  expect(largest).toBeLessThan(.07);
  const frozen=hand();for(let i=0;i<30;i++)frame(false,null,true);expect(hand().distanceTo(frozen)).toBe(0);
 });
 it('scales gait cadence with actual speed and preserves stride phase across stop/start',async()=>{
  const {motion,frame}=await character('jordan');
  for(let i=0;i<60;i++)frame(true,null,false,.9);const fast=motion.walk.getEffectiveTimeScale();
  frame(true,null,false,.45);expect(motion.walk.getEffectiveTimeScale()).toBeCloseTo(fast/2);
  const phase=motion.walk.time;frame(false,null);expect(motion.walk.time).toBeCloseTo(phase);
  frame(true,null);expect(motion.walk.time).toBeGreaterThan(phase);
 });
 it('turns before starting to walk in a different direction',()=>{
  const r=new EstateRoutines().update('june',{x:2.6,z:3},.1,[],{},false,undefined,Math.PI);
  expect(r.moving).toBe(false);expect(r.position).toEqual({x:2.6,z:3});expect(r.face).toBeCloseTo(0);
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
 it('waits behind a closed door and resumes when it opens',()=>{
  const follower=new DogFollower(),barriers=[{x:0,z:0,w:.2,d:200,door:'rear'}],target={x:3,z:0};let p={x:-3,z:0},heading=Math.PI/2;
  for(let i=0;i<60;i++){const r=follower.update(p,heading,target,1/60,barriers,{},false);p=r.position;heading=r.heading}expect(p.x).toBe(-3);
  for(let i=0;i<400;i++){const r=follower.update(p,heading,target,1/60,barriers,{rear:true},false);p=r.position;heading=r.heading}expect(p.x).toBeGreaterThan(1);
 });
});
