import * as T from 'three';
import type {Estate} from './world';
import {animateCharacter,type CharacterMotion} from './characters';
import {clearSegment} from './navigation';
import type {GameState,PersonId} from './state';
import {CELLAR_FLOOR} from './cellar';
import {UPPER_FLOOR} from './upstairs';
import {ATTIC_FLOOR} from './attic';

export const SHED={x:-22,z:-30.5,width:5.6,depth:4.5};
export const WITNESSES={
 finch:{name:'Alfred Finch',role:'Estate handyman',initials:'AF',template:'tomas',level:'ground',coat:0x895f49,hair:0x604b36,
  route:[[-18,-24],[-22,-25.55],[-20.6,-26.05]], question:'What was the crash near the shed?',
  first:'There was an awful crash out west. For a minute I thought somebody was hiding in the shed.',
  reply:'I went back to check. A loose flowerpot had fallen off the shelf. The shed was empty when I got there.'},
 webb:{name:'Nora Webb',role:'Village courier',initials:'NW',template:'mara',level:'ground',coat:0x65716f,hair:0x6c4330,
  route:[[14,-23],[18.5,-23],[15.4,-21.3]],question:'Did you see who crossed the garden?',
  first:'Something dark darted past the flower beds. I thought it might have been someone leaving the house.',
  reply:'I saw it again by the hedge. It was a rabbit. I couldn’t see the house doors from where I stood.'},
 hale:{name:'Arthur Hale',role:'Head butler',initials:'AH',template:'rook',level:'ground',coat:0x35343a,hair:0x6b6056,
  route:[[.7,9.4],[-.7,7.1],[-1.3,10.3]],question:'Who has been coming through the hall?',
  first:'Good afternoon, Detective. I have kept the entrance clear for you and the household.',
  reply:'I was laying out the tea service earlier. June knows who was expected today.'},
 price:{name:'Leonard Price',role:'Underbutler',initials:'LP',template:'jonah',level:'ground',coat:0x43474a,hair:0x554031,
  route:[[4.7,-10.6],[4.7,-14.5],[2.9,-14.1]],question:'What are you doing back here?',
  first:'I’m checking the service passage before supper. Someone always leaves a door ajar.',
  reply:'I only came through after June called for help. I can tell you where things are, but not what happened.'},
 green:{name:'Samuel Green',role:'Drive gardener',initials:'SG',template:'tomas',level:'ground',coat:0x6f5136,hair:0x554b42,
  route:[[10.1,29],[10.1,35],[11.1,33]],question:'What are you working on?',
  first:'The verge keeps creeping over the drive. I’m trying to get it tidy before the next car arrives.',
  reply:'I’ve been trimming on this side of the gate. The wall hides most of the house from here.'},
 ward:{name:'Hugh Ward',role:'West garden gardener',initials:'HW',template:'tomas',level:'ground',coat:0x7a7451,hair:0x362f25,
  route:[[-15.5,-26.5],[-15.5,-32.8],[-17,-31.3]],question:'What grows in these beds?',
  first:'We’re making room for more vegetables this year. The flowers can keep the borders.',
  reply:'Watch your step at the back of the beds. The rabbits have been digging there again.'},
 bellamy:{name:'Edith Bellamy',role:'Glasshouse gardener',initials:'EB',template:'ada',level:'ground',coat:0x756746,hair:0x564034,
  route:[[19.9,-27],[19.9,-31.6],[19,-30.3]],question:'Can I go into the glasshouse?',
  first:'Mind the young plants by the glass. Some of them are hard to replace this year.',
  reply:'You can walk through either end. Ask Tomas if you need to disturb anything on his bench.'},
 shaw:{name:'George Shaw',role:'Orchard gardener',initials:'GS',template:'tomas',level:'ground',coat:0x655843,hair:0x8a8178,
  route:[[5,-36.9],[5,-38.4],[1,-37.6]],question:'Have you seen anyone by the far garden?',
  first:'I’m picking dead stems out of the beds. There’s always more work after rain.',
  reply:'I’ve seen birds and rabbits down this end. Ask the lodge keeper if you’re looking for the cellar stairs.'},
 pike:{name:'Walter Ames',role:'Wine steward',initials:'WA',template:'rook',level:'cellar',coat:0x625044,hair:0x685948,
  route:[[-8,-12.4],[-8,-9.1],[-6.1,-10.2]],question:'What are you counting?',
  first:'Bottles, Detective. I’m checking the racks against the cellar book before I lock up.',
  reply:'The wine is all accounted for. I haven’t found anything down here that explains what happened upstairs.'},
 cole:{name:'Nell Cole',role:'Cellar bottler',initials:'NC',template:'ada',level:'cellar',coat:0x715348,hair:0x685244,
  route:[[-5.9,-28.6],[-5.9,-25.4],[-4.3,-26.6]],question:'What are you bottling?',
  first:'Last autumn’s apple cordial. Walter keeps his wine in the vault; I keep these bottles well out of his way.',
  reply:'I label each batch before it goes upstairs. If two bottles look the same, check the dates on the paper tags.'},
 hewitt:{name:'Frank Hewitt',role:'Estate fitter',initials:'FH',template:'tomas',level:'cellar',coat:0x4b5050,hair:0x5c584d,
  route:[[5.9,-36.6],[5.9,-33.4],[4.3,-34.6]],question:'What are you working on?',
  first:'A sticking hinge from the lodge. This bench is the only one in the house that doesn’t wobble.',
  reply:'Metal carries down the tunnel. A tap at this bench can sound like someone knocking two rooms away.'},
 sutton:{name:'Ivy Sutton',role:'Estate records clerk',initials:'IS',template:'june',level:'cellar',coat:0x555b67,hair:0x45362e,
  route:[[-5.9,-44.6],[-5.9,-41.4],[-4.3,-42.6]],question:'What’s kept in these boxes?',
  first:'Old inventories, maintenance lists, and requisition slips. The damp curls the papers if I leave them against the wall.',
  reply:'These are older records. The current restoration papers were moved upstairs to the study.'},
 miller:{name:'Ruth Miller',role:'Second floor maid',initials:'RM',template:'june',level:'upper',coat:0x52606a,hair:0x785a44,
  route:[[9.4,6.4],[9.4,9.55],[13,9.4]],question:'Are the rooms in use?',
  first:'I’m straightening the sitting room and putting away fresh linen.',
  reply:'The bedrooms are quiet just now. I haven’t moved any of the detective’s things.'},
 ellis:{name:'Mabel Ellis',role:'Village postwoman',initials:'ME',template:'mara',level:'ground',coat:0x495765,hair:0x60452e,
  route:[[-6.5,16],[-9.7,17.5],[-7.2,20.3]],question:'Did you make a delivery last night?',
  first:'Afternoon, Detective. I’ve brought the post. Last night I saw someone in a dark coat hurry off with a parcel just before the half-hour bell.',
  reply:'I saw the parcel clearly, but only the back of the coat. I was on the drive. Whoever it was turned toward the potting shed.'},
 clarke:{name:'Peter Clarke',role:'Estate errand boy',initials:'PC',template:'jonah',level:'ground',coat:0x59433a,hair:0x735a3f,
  route:[[6.4,15.7],[10.8,16.8],[7.3,19.7]],question:'Did you carry a parcel yesterday?',
  first:'I’m waiting for Mrs Bell to send me to the village. Last night she sent me to the potting shed.',
  reply:'The parcel was full of seed envelopes. I took it round before the bell. My coat was Father’s; it’s much too big for me.'},
 briggs:{name:'Elsie Briggs',role:'Gatekeeper',initials:'EB',template:'june',level:'ground',coat:0x605649,hair:0x766557,
  route:[[-6.6,43],[-6.6,44.5],[-11,44.5],[-6.6,44.5]],question:'Could anyone have heard the bell from here?',
  first:'I keep a tally of cars on the drive. Foot traffic is another matter, especially after the lamps come down for blackout.',
  reply:'Yes. I heard the half-hour chime from right here. I couldn’t see the tower or who was in it.'},
 mercer:{name:'Agnes Mercer',role:'Lodge keeper',initials:'AM',template:'june',level:'ground',coat:0x655344,hair:0x514a43,
  route:[[-4.7,-61.1],[0,-61.1],[0,-51.5],[-5.6,-51.5],[0,-51.5],[0,-61.1]],question:'Where do the cellar stairs lead?',
  first:'I’m airing the sitting room. It gets cold here before the main house does.',
  reply:'Follow the gravel from the back door, across the woodland path. The hatch is a little way past it. The stairs lead under the garden to the mansion cellar.'},
 hayes:{name:'Albert Hayes',role:'Woodland groundskeeper',initials:'AH',template:'tomas',level:'ground',coat:0x5b6551,hair:0x69594b,
  route:[[-14,-55],[-14,-62.5],[-14,-70],[-16,-70],[-14,-62.5]],question:'Do you often work behind the lodge?',
  first:'Most afternoons. I keep the paths clear and try to leave the rabbits some cover.',
  reply:'I heard the hatch bang yesterday and thought someone was coming up. The wind had caught my empty barrow and tipped it against the stone.'},
 cartwright:{name:'Mabel Cartwright',role:'Estate cook',initials:'MC',template:'mara',level:'ground',coat:0x645653,hair:0x7b6650,
  route:[[-10,-13.35],[-7.1,-13.35],[-9.4,-12.7]],question:'When did you clear supper?',
  first:'Mind the kitchen passage. The last batch of tea went to the lodge, and I’ve yet to get my tray back.',
  reply:'We stacked the supper plates at about quarter past eight, well before the half-hour chime. I remember because the grocer’s van had only just left.'},
 foster:{name:'Lucy Foster',role:'Attic maid',initials:'LF',template:'june',level:'attic',coat:0x69616d,hair:0x4c3b2e,
  route:[[9,-.8],[9,-5.55],[10.5,-5.4]],question:'What’s kept up here?',
  first:'Spare linen and old trunks, mostly. I’ve been airing out the little bedroom.',
  reply:'The storage loft is across the landing. Nothing there has been taken out today.'}
} as const;
export type WitnessId=keyof typeof WITNESSES;
export type StaffLevel=typeof WITNESSES[WitnessId]['level'];
const staffFloor=(e:Estate,level:StaffLevel,x:number,z:number)=>
 level==='ground'?e.groundHeight(x,z):level==='cellar'?CELLAR_FLOOR:level==='upper'?UPPER_FLOOR:ATTIC_FLOOR;
type Witness={id:WitnessId;root:T.Group;index:number;wait:number;motion?:CharacterMotion;driver?:Parameters<typeof animateCharacter>[0]};
type Rabbit={root:T.Group;head:T.Group;home:T.Vector2;phase:number;heading:number};
type Bird={root:T.Group;wings:T.Group[];phase:number;x:number;z:number;height:number;radius:number};

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
   root.position.set(x,staffFloor(e,spec.level,x,z),z);e.scene.add(root);
   this.witnesses.push({id,root,index:1,wait:3});
   e.target(root,'witness:'+id,spec.name,'Speak to');
  }
  for(const [x,z] of [[-17,-37],[-24,-37],[17,-37],[-8,-75],[14,-75]]){
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
  for(let i=0;i<6;i++){
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
   const phase=i*1.6,x=i<4?7:-5,z=i<4?-33:-74,height=i<4?5.5+i*.34:8.2+(i-4)*.48,radius=i<4?8+i*1.75:6+(i-4)*2;
   root.position.set(x+Math.cos(phase)*radius,height,z+Math.sin(phase)*radius*.62);
   e.scene.add(root);this.birds.push({root,wings,phase,x,z,height,radius});
  }
 }
 spec(id:WitnessId){return WITNESSES[id]}
 staffObstacles(level:StaffLevel,exclude?:WitnessId){
  return this.witnesses.filter(w=>w.id!==exclude&&WITNESSES[w.id].level===level)
   .map(w=>({x:w.root.position.x,z:w.root.position.z,w:.4,d:.4}));
 }
 reset(){
  for(const w of this.witnesses){
   const spec=WITNESSES[w.id],[x,z]=spec.route[0];w.root.position.set(x,staffFloor(this.e,spec.level,x,z),z);w.index=1;w.wait=3;
  }
 }
 update(dt:number,state:GameState,playing:boolean,active:WitnessId|null){
  const e=this.e,player=e.camera.position;
  if(playing)this.time+=dt;
  const people=[...e.actors.values()].filter(a=>a.root.visible).map(a=>({x:a.root.position.x,z:a.root.position.z,w:.42,d:.42}));
  if(playing)for(const w of this.witnesses){
   const p=w.root.position;
   if(w.id==='mercer'&&Math.abs(p.x)<.7&&Math.abs(p.z+54)<1.7)state.doors['lodge-front']=true;
   if(w.id==='briggs'&&state.flags.deliveryParked&&Math.abs(p.x+9.7)<1.65&&Math.abs(p.z-44.5)<.65)state.doors.gatehouse=true;
  }
  const ground=[...e.collisionBarriers(state),...e.stairBarriers];
  const levels:Record<StaffLevel,readonly {x:number;z:number;w:number;d:number;door?:string}[]>={
   ground:[...ground,...people],cellar:e.cellarBarriers??[],upper:e.collisionBarriers(state,true),attic:e.atticBarriers
  };
  for(const w of this.witnesses){
   if(!w.motion)continue;
   const spec=WITNESSES[w.id];
   const route=w.id==='cartwright'&&state.flags.deliveryParked?[
    [-10,-13.35],[-7.1,-13.35],[-9.4,-12.7],[-12,-13.38],[-17.5,-13.38],[-12,-13.38]
   ]:spec.route;
   const [tx,tz]=route[w.index],p=w.root.position;
   const near=e.staffLevel()===spec.level&&Math.hypot(player.x-p.x,player.z-p.z)<2.65;
   let distance=0,angle=w.root.rotation.y;
   if(active===w.id||near)angle=Math.atan2(player.x-p.x,player.z-p.z);
   else if(playing){
    w.wait=Math.max(0,w.wait-dt);
    const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);
    angle=Math.atan2(dx,dz);
    if(w.wait===0&&d<.12){w.index=(w.index+1)%route.length;w.wait=3.8;}
    else if(w.wait===0&&d>.001){
     const hop=Math.min(dt*.8,d),next={x:p.x+dx/d*hop,z:p.z+dz/d*hop};
     const colleagues=this.staffObstacles(spec.level,w.id);
     if(clearSegment(p,next,[...levels[spec.level],...colleagues],state.doors,.22)){p.x=next.x;p.z=next.z;distance=hop;}
    }
   }
   w.root.rotation.y+=Math.atan2(Math.sin(angle-w.root.rotation.y),Math.cos(angle-w.root.rotation.y))*Math.min(1,dt*5);
   p.y=staffFloor(e,spec.level,p.x,p.z);
   const template:PersonId=WITNESSES[w.id].template;
   w.driver??={actors:new Map([[template,{root:w.root}]]),characterMotion:new Map([[template,w.motion]]),groundHeight:(x,z)=>staffFloor(e,spec.level,x,z)};
   if(active!==w.id&&(Math.abs(p.y+1.65-player.y)>3.1||Math.hypot(p.x-player.x,p.z-player.z)>25))continue;
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
   const t=this.time*.44+b.phase,r=b.radius;
   b.root.position.set(b.x+Math.cos(t)*r,b.height+Math.sin(t*2)*.38,b.z+Math.sin(t)*r*.62);
   b.root.rotation.y=Math.atan2(-Math.sin(t),Math.cos(t)*.62);
   b.root.rotation.z=.24;
   for(const [j,wing] of b.wings.entries())wing.rotation.z=(j?1:-1)*Math.sin(this.time*18+i)*.66;
  }
 }
}
