import * as T from 'three';
import type {Estate} from './world';
import {animateCharacter,type CharacterMotion} from './characters';
import {clearSegment} from './navigation';
import type {GameState,PersonId} from './state';

export const SHED={x:-22,z:-30.5,width:5.6,depth:4.5};
export const WITNESSES={
 finch:{name:'Alfred Finch',role:'Estate handyman',initials:'AF',template:'tomas',coat:0x895f49,hair:0x604b36,
  route:[[-18,-24],[-22,-25.55],[-20.6,-26.05]], question:'What was the crash near the shed?',
  first:'There was an awful crash out west. For a minute I thought somebody was hiding in the shed.',
  reply:'I went back to check. A loose flowerpot had fallen off the shelf. The shed was empty when I got there.'},
 webb:{name:'Nora Webb',role:'Village courier',initials:'NW',template:'mara',coat:0x65716f,hair:0x6c4330,
  route:[[14,-23],[18.5,-23],[15.4,-21.3]],question:'Did you see who crossed the garden?',
  first:'Something dark darted past the flower beds. I thought it might have been someone leaving the house.',
  reply:'I saw it again by the hedge. It was a rabbit. I couldn’t see the house doors from where I stood.'}
} as const;
export type WitnessId=keyof typeof WITNESSES;
type Witness={id:WitnessId;root:T.Group;index:number;wait:number;motion?:CharacterMotion;driver?:Parameters<typeof animateCharacter>[0]};
type Rabbit={root:T.Group;head:T.Group;home:T.Vector2;phase:number;heading:number};
type Bird={root:T.Group;wings:T.Group[];phase:number};

export function buildShed(e:Estate){
 const {x,z,width:w,depth:d}=SHED,wood=e.mats.wood,frame=e.mats.panel;
 e.floor(w,.14,d,x,.01,z,wood);
 e.floor(2.1,.03,2.6,x,-.025,z+d/2+1.3,e.mats.gravel);
 e.wall(w,2.72,.19,x,1.39,z-d/2,wood);
 for(const side of [-1,1]){
  e.wall(.19,2.72,d,x+side*w/2,1.39,z,wood);
  e.wall(1.89,2.72,.19,x+side*1.855,1.39,z+d/2,wood);
 }
 e.box(1.82,.44,.21,x,2.53,z+d/2,wood);
 for(const side of [-1,1])e.box(.14,2.38,.28,x+side*.94,1.19,z+d/2,frame);
 e.box(2.05,.13,.29,x,2.36,z+d/2,frame);
 for(let y=.18;y<2.75;y+=.27){
  for(const side of [-1,1]){
   e.box(.035,.05,d,x+side*(w/2+.095),y,z,frame);
   e.box(1.88,.05,.04,x+side*1.855,y,z+d/2+.11,frame);
  }
 }
 for(const side of [-1,1]){
  const slab=e.box(w/2+.37,.15,d+.48,x+side*w/4,3.07,z,e.mats.slate);
  slab.rotation.z=-side*.24;
  for(const end of [-1,1]){
   const fascia=e.box(w/2+.34,.15,.12,x+side*w/4,3.07,z+end*(d/2+.2),frame);
   fascia.rotation.z=-side*.24;
  }
 }
 // Gables seal the ends above the wall without crossing the doorway.
 for(const end of [-1,1]){
  const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,.67);shape.closePath();
  const gable=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.15,bevelEnabled:false}),wood);
  gable.position.set(x,2.72,z+end*d/2-.075);gable.castShadow=true;gable.receiveShadow=true;e.scene.add(gable);e.walls.push(gable);
 }
 e.table(x-1.38,z-1.25,1.72,.65,.82);
 for(let i=0;i<3;i++){
  const pot=e.mat([0x8a5134,0x985c3e,0x6e4837][i],.96);
  e.cyl(.155,.105,.22,x-1.94+i*.39,1.02,z-1.26,pot);
  e.cyl(.168,.158,.041,x-1.94+i*.39,1.108,z-1.26,pot);
  e.cyl(.123,.123,.012,x-1.94+i*.39,1.114,z-1.26,e.mats.dark);
 }
 e.box(1.35,.47,.63,x+1.59,.32,z-1.26,frame);e.barrier(x+1.59,z-1.26,1.35,.63);
 for(const dx of [1.13,2.01])e.box(.12,.48,.68,x+dx,.32,z-1.26,wood);
 e.box(.035,1.27,.045,x+2.48,.85,z+.2,e.mats.wood).rotation.x=-.15;
 e.box(.025,.23,.18,x+2.48,.26,z+.11,e.mats.dark).rotation.x=-.15;
 const lamp=new T.PointLight(0xfed6a6,21,6,2);lamp.position.set(x,2.45,z-.6);e.scene.add(lamp);
 e.cyl(.025,.025,.22,x,2.65,z-.6,e.mats.dark);
 e.cyl(.11,.23,.14,x,2.53,z-.6,e.mats.cream);
}

export class Yard {
 witnesses:Witness[]=[];
 private rabbits:Rabbit[]=[];
 private birds:Bird[]=[];
 private time=0;
 constructor(private e:Estate){
  for(const id of Object.keys(WITNESSES) as WitnessId[]){
   const spec=WITNESSES[id],root=new T.Group(),[x,z]=spec.route[0];
   root.position.set(x,e.groundHeight(x,z),z);e.scene.add(root);
   this.witnesses.push({id,root,index:1,wait:3});
   e.target(root,'witness:'+id,spec.name,'Speak to');
  }
  for(const [x,z] of [[-17,-37],[-24,-37],[17,-37]]){
   const root=new T.Group(),head=new T.Group();root.name='Wild rabbit';
   const fur=e.mat(0x89745f,.98),dark=e.mat(0x302723,.97),pale=e.mat(0xc2b4a0,.98);
   e.sphere(.19,0,.18,-.07,fur,root,.81,.82,1.21);
   e.sphere(.105,0,.218,.126,fur,head,.88,.92,1.05);
   e.sphere(.055,0,.179,.196,pale,head,.93,.68,.87);
   e.sphere(.023,0,.197,.235,dark,head,1,.68,.61);
   for(const side of [-1,1]){
    e.sphere(.055,side*.091,.061,-.119,fur,root,1,.68,1.35);
    e.sphere(.04,side*.068,.051,.11,fur,root,1,.58,1.21);
    const ear=e.sphere(.047,side*.047,.358,.088,fur,head,.66,2.45,.57);ear.rotation.z=side*-.2;
    e.sphere(.015,side*.078,.238,.156,dark,head,1,1,1);
   }
   e.sphere(.059,0,.174,-.266,pale,root,.93,.96,1.1);
   root.add(head);root.position.set(x,e.groundHeight(x,z),z);e.scene.add(root);
   this.rabbits.push({root,head,home:new T.Vector2(x,z),phase:0,heading:.35+x*.2});
  }
  for(let i=0;i<4;i++){
   const root=new T.Group(),wings:T.Group[]=[];root.name='Garden bird';
   const feather=e.mat(i%2?0x4f514c:0x64675d,.96),wing=e.mat(0x353b35,.94);
   e.sphere(.105,0,0,0,feather,root,.65,.71,1.55);
   e.sphere(.052,0,.04,.122,feather,root);
   e.sphere(.042,0,-.007,-.15,wing,root,.72,.38,1.65);
   for(const side of [-1,1]){
    const flap=new T.Group();flap.position.x=side*.045;
    const primary=e.sphere(.12,side*.114,0,-.031,wing,flap,1.34,.17,.64);
    primary.rotation.y=side*.29;root.add(flap);wings.push(flap);
   }
   root.position.set(7+Math.cos(i*1.6)*(8+i*1.75),5.5+i*.34,-33+Math.sin(i*1.6)*(8+i*1.75)*.62);
   e.scene.add(root);this.birds.push({root,wings,phase:i*1.6});
  }
 }
 spec(id:WitnessId){return WITNESSES[id]}
 reset(){
  for(const w of this.witnesses){
   const [x,z]=WITNESSES[w.id].route[0];w.root.position.set(x,this.e.groundHeight(x,z),z);w.index=1;w.wait=3;
  }
 }
 update(dt:number,state:GameState,playing:boolean,active:WitnessId|null){
  const e=this.e,player=e.camera.position;
  if(playing)this.time+=dt;
  for(const w of this.witnesses){
   if(!w.motion)continue;
   const route=WITNESSES[w.id].route,[tx,tz]=route[w.index],p=w.root.position;
   const near=e.onGroundLevel()&&Math.hypot(player.x-p.x,player.z-p.z)<2.65;
   let distance=0,angle=w.root.rotation.y;
   if(active===w.id||near)angle=Math.atan2(player.x-p.x,player.z-p.z);
   else if(playing){
    w.wait=Math.max(0,w.wait-dt);
    const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);
    angle=Math.atan2(dx,dz);
    if(w.wait===0&&d<.12){w.index=(w.index+1)%route.length;w.wait=3.8;}
    else if(w.wait===0&&d>.001){
     const hop=Math.min(dt*.8,d),next={x:p.x+dx/d*hop,z:p.z+dz/d*hop};
     const people=[...e.actors.values()].filter(a=>a.root.visible).map(a=>({x:a.root.position.x,z:a.root.position.z,w:.42,d:.42}));
     if(clearSegment(p,next,[...e.barriers,...people],state.doors,.22)){p.x=next.x;p.z=next.z;distance=hop;}
    }
   }
   w.root.rotation.y+=Math.atan2(Math.sin(angle-w.root.rotation.y),Math.cos(angle-w.root.rotation.y))*Math.min(1,dt*5);
   p.y=e.groundHeight(p.x,p.z);
   const template:PersonId=WITNESSES[w.id].template;
   w.driver??={actors:new Map([[template,{root:w.root}]]),characterMotion:new Map([[template,w.motion]]),groundHeight:(x,z)=>e.groundHeight(x,z)};
   animateCharacter(w.driver,template,distance>0,dt,!playing&&active!==w.id,null,this.time,dt>0?distance/dt:0);
  }
  if(!playing)return;
  for(const [i,r] of this.rabbits.entries()){
   const p=r.root.position;
   const threat=Math.hypot(p.x-player.x,p.z-player.z),scared=e.onGroundLevel()&&threat<3.1;
   const range=Math.hypot(p.x-r.home.x,p.z-r.home.y);
   const activity=scared||Math.sin(this.time*.65+i*2)>-.08;
   const heading=range>2.4?Math.atan2(r.home.x-p.x,r.home.y-p.z):
    scared?Math.atan2(p.x-player.x,p.z-player.z):r.heading+dt*.32;
   r.heading+=Math.atan2(Math.sin(heading-r.heading),Math.cos(heading-r.heading))*Math.min(1,dt*6);
   r.root.rotation.y=r.heading;
   if(activity){
    r.phase=(r.phase+dt*(scared?3.4:2.05))%1;
    const leap=Math.sin(r.phase*Math.PI),step=dt*(scared?2.2:.65)*leap;
    const next={x:p.x+Math.sin(r.heading)*step,z:p.z+Math.cos(r.heading)*step};
    if(clearSegment(p,next,e.barriers,state.doors,.14)){p.x=next.x;p.z=next.z;}else r.heading+=.85;
    p.y=e.groundHeight(p.x,p.z)+leap*(scared?.19:.095);
   }else{r.phase=0;p.y=e.groundHeight(p.x,p.z);}
   r.head.rotation.x=activity?-.04:Math.sin(this.time*3+i)*.07;
  }
  for(const [i,b] of this.birds.entries()){
   const t=this.time*.44+b.phase,r=8+i*1.75;
   b.root.position.set(7+Math.cos(t)*r,5.5+i*.34+Math.sin(t*2)*.38,-33+Math.sin(t)*r*.62);
   b.root.rotation.y=Math.atan2(-Math.sin(t),Math.cos(t)*.62);
   b.root.rotation.z=.24;
   for(const [j,wing] of b.wings.entries())wing.rotation.z=(j?1:-1)*Math.sin(this.time*18+i)*.66;
  }
 }
}
