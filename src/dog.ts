import * as T from 'three';
import {clearSegment,findPath} from './navigation';
import type {Point,Obstacle} from './navigation';

interface Leg {
 hip:T.Bone;knee:T.Bone;foot:T.Bone;restFoot:T.Vector3;
 upper:T.Vector3;lower:T.Vector3;front:boolean;side:number;
}
export interface DogMotion {
 root:T.Group;body:T.Bone;legs:Leg[];meshes:T.SkinnedMesh[];
 phase:number;weight:number;scale:number;
}

/** Add a lightweight four-legged rig to Pip's existing, unrigged CC0 mesh. */
export function rigDog(source:T.Object3D):DogMotion {
 source.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(source),center=bounds.getCenter(new T.Vector3());
 const scale=.58/bounds.getSize(new T.Vector3()).y;
 const normalize=new T.Matrix4().makeScale(scale,scale,scale).multiply(new T.Matrix4().makeTranslation(-center.x,-bounds.min.y,-center.z));
 const root=new T.Group();root.rotation.y=-Math.PI/2; // Native +X becomes estate +Z.
 const body=new T.Bone();body.name='pip_body';root.add(body);
 const paws:T.Vector3[]=[];
 source.traverse(o=>{if(o.name.startsWith('Rounded_paw')||o.name.startsWith('Rounded paw'))paws.push(o.getWorldPosition(new T.Vector3()).applyMatrix4(normalize))});
 if(paws.length!==4)throw new Error('Pip needs four named paws to bind the gait');
 paws.sort((a,b)=>b.x-a.x||b.z-a.z);
 const legs:Leg[]=paws.map((paw,i)=>{
  const front=i<2,hip=new T.Bone(),knee=new T.Bone(),foot=new T.Bone();
  hip.name='pip_hip_'+i;knee.name='pip_knee_'+i;foot.name='pip_paw_'+i;
  hip.position.set(paw.x+(front?-.045:.035)*scale,.32*scale,paw.z);
  const joint=new T.Vector3(paw.x+(front?-.13:.13)*scale,.16*scale,paw.z);
  knee.position.copy(joint).sub(hip.position);foot.position.copy(paw).sub(joint);
  body.add(hip);hip.add(knee);knee.add(foot);
  return {hip,knee,foot,restFoot:paw,upper:knee.position.clone(),lower:foot.position.clone(),front,side:Math.sign(paw.z)};
 });
 root.updateMatrixWorld(true);
 const bones=[body,...legs.flatMap(l=>[l.hip,l.knee,l.foot])],skeleton=new T.Skeleton(bones);
 const meshes:T.SkinnedMesh[]=[];
 source.traverse(o=>{
  if(!(o instanceof T.Mesh))return;
  const geometry=o.geometry.clone().applyMatrix4(normalize.clone().multiply(o.matrixWorld));
  const positions=geometry.getAttribute('position'),indices:number[]=[],weights:number[]=[];
  const rigidPaw=/Rounded[ _]paw|Toe/.test(o.name),p=new T.Vector3();
  for(let i=0;i<positions.count;i++){
   p.fromBufferAttribute(positions,i);
   let nearest=0,dist=Infinity;
   for(let j=0;j<legs.length;j++){const f=legs[j].restFoot,d=(p.x-f.x)**2+(p.z-f.z)**2;if(d<dist){nearest=j;dist=d}}
   const leg=legs[nearest],hip=leg.hip.position,kneeY=hip.y+leg.upper.y;
   const limb=rigidPaw?1:(1-T.MathUtils.smoothstep(p.y,hip.y-.04*scale,hip.y+.045*scale))*(1-T.MathUtils.smoothstep(Math.abs(p.x-leg.restFoot.x),.08*scale,.18*scale))*T.MathUtils.smoothstep(Math.abs(p.z),.01*scale,.045*scale);
   const pawWeight=rigidPaw?1:1-T.MathUtils.smoothstep(p.y,leg.restFoot.y+.015*scale,leg.restFoot.y+.065*scale);
   const lowerWeight=1-T.MathUtils.smoothstep(p.y,kneeY-.04*scale,kneeY+.04*scale);
   indices.push(0,1+nearest*3,2+nearest*3,3+nearest*3);
   weights.push(1-limb,limb*(1-pawWeight)*(1-lowerWeight),limb*(1-pawWeight)*lowerWeight,limb*pawWeight);
  }
  geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
  const mesh=new T.SkinnedMesh(geometry,o.material);mesh.name=o.name;mesh.castShadow=true;mesh.receiveShadow=true;
  root.add(mesh);mesh.updateMatrixWorld(true);mesh.bind(skeleton);mesh.frustumCulled=false;meshes.push(mesh);
 });
 return {root,body,legs,meshes,phase:0,weight:0,scale};
}

/** Two-segment leg IK keeps each stance paw level while the body moves over it. */
function placePaw(leg:Leg,target:T.Vector3,bodyY:number) {
 const origin=leg.hip.position.clone();origin.y+=bodyY;
 const delta=target.clone().sub(origin),a=leg.upper.length(),b=leg.lower.length();
 const distance=T.MathUtils.clamp(Math.hypot(delta.x,delta.y),Math.abs(a-b)+.0001,a+b-.0001);
 const direction=new T.Vector2(delta.x,delta.y).normalize();
 const along=(a*a-b*b+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,a*a-along*along));
 const bend=leg.front?-1:1;
 const joint=new T.Vector2(direction.x*along-direction.y*height*bend,direction.y*along+direction.x*height*bend);
 const upperAngle=Math.atan2(joint.y,joint.x)-Math.atan2(leg.upper.y,leg.upper.x);
 const lowerAngle=Math.atan2(direction.y*distance-joint.y,direction.x*distance-joint.x)-Math.atan2(leg.lower.y,leg.lower.x);
 leg.hip.rotation.z=upperAngle;leg.knee.rotation.z=lowerAngle-upperAngle;leg.foot.rotation.z=-lowerAngle;
}

export function animateDog(motion:DogMotion,distance:number,dt:number) {
 if(dt<=0)return;
 const moving=distance>1e-5;
 motion.weight=T.MathUtils.damp(motion.weight,moving?1:0,14,dt);
 // Advancing by distance prevents pedalling when an obstacle stops the dog.
 motion.phase=(motion.phase+distance/.6)%1;
 const bob=Math.sin(motion.phase*Math.PI*4)*.004*motion.weight;
 motion.body.position.y=bob;
 for(const leg of motion.legs){
  const offset=(leg.front?leg.side>0:leg.side<0)?0:.5; // Diagonal pairs: a small-dog trot.
  const phase=(motion.phase+offset)%1;
  const stance=phase<.5;
  const x=stance?.15-.6*phase:-.15+.3*((phase-.5)*2);
  const lift=stance?0:Math.sin((phase-.5)*2*Math.PI)*.045;
  const target=leg.restFoot.clone();target.x+=x*motion.weight;target.y+=lift*motion.weight;
  placePaw(leg,target,bob);
 }
 motion.root.updateMatrixWorld(true);for(const mesh of motion.meshes)mesh.skeleton.update();
}

/** Shared follow behavior for walking with the detective and following Mara. */
export class DogFollower {
 private path:Point[]=[];private replan=0;private following=false;private speed=0;
 reset(){this.path=[];this.replan=0;this.following=false;this.speed=0}
 update(position:Point,heading:number,target:Point,dt:number,barriers:Obstacle[],doors:Record<string,boolean>,paused:boolean){
  const still={position:{...position},heading,distance:0};if(paused||dt<=0)return still;
  dt=Math.min(dt,.1);
  const distance=Math.hypot(target.x-position.x,target.z-position.z);
  if(distance>2.1)this.following=true;
  if(distance<1.35){this.following=false;this.speed=0;this.path=[]}
  if(!this.following)return still;
  this.replan-=dt;
  if(this.replan<=0){this.path=findPath(position,target,barriers,doors,.22,false);this.replan=.75}
  while(this.path.length&&Math.hypot(this.path[0].x-position.x,this.path[0].z-position.z)<.12)this.path.shift();
  const next=this.path[0];if(!next){this.speed=0;return still}
  const angle=Math.atan2(next.x-position.x,next.z-position.z),delta=Math.atan2(Math.sin(angle-heading),Math.cos(angle-heading));
  heading+=T.MathUtils.clamp(delta,-dt*4,dt*4);
  const remaining=Math.abs(Math.atan2(Math.sin(angle-heading),Math.cos(angle-heading)));
  this.speed=T.MathUtils.damp(this.speed,remaining>.5?0:Math.min(1.65,Math.max(.4,(distance-1.35)*1.2)),7,dt);
  const travel=Math.min(this.speed*dt,Math.hypot(next.x-position.x,next.z-position.z),Math.max(0,distance-1.35));
  const p={x:position.x+Math.sin(heading)*travel,z:position.z+Math.cos(heading)*travel};
  if(!clearSegment(position,p,barriers,doors,.22)){this.speed=0;this.replan=0;return {...still,heading}}
  return {position:p,heading,distance:travel};
 }
}
