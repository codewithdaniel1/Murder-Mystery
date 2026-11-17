import {dressUpperRooms,drapedQuilt} from './room-dressing';
import {upperHomeFront} from './home-front';
import {wovenFabric} from './detail';
import {buildAttic} from './attic';
import * as T from 'three';
import type {Estate} from './world';

export const UPPER_FLOOR=5.05;
export const BALCONY={halfWidth:2.9,front:14.55,doorWidth:1.8};
export const STAIR={x:-3.8,width:2.5,bottom:3.4,top:-5,base:.075};
export const stairHeight=(z:number)=>STAIR.base+(UPPER_FLOOR-STAIR.base)*
 T.MathUtils.clamp((STAIR.bottom-z)/(STAIR.bottom-STAIR.top),0,1);
export function inStair(x:number,z:number){
 return Math.abs(x-STAIR.x)<STAIR.width/2&&z>STAIR.top&&z<STAIR.bottom;
}
export function onUpperDeck(x:number,z:number){
 return (Math.abs(x)<20.7&&z>-15.7&&z<11.7&&!inStair(x,z))||
  (Math.abs(x)<BALCONY.halfWidth&&z>=11.7&&z<BALCONY.front);
}

export function buildUpstairs(e:Estate){
 const {stone,wood,plaster,panel,trim,gold}=e.mats;
 const left=STAIR.x-STAIR.width/2,right=STAIR.x+STAIR.width/2;
 const mid=(a:number,b:number)=>(a+b)/2;
 // One slab serves as the downstairs ceiling and upstairs floor.
 for(const [x0,x1,z0,z1] of [
  [-21,left,-16,12],[right,21,-16,12],
  [left,right,-16,STAIR.top],[left,right,STAIR.bottom,12]
 ]){
  e.box(x1-x0,.25,z1-z0,mid(x0,x1),UPPER_FLOOR-.125,mid(z0,z1),e.mats.floor??wood);
  e.walls.push(e.box(x1-x0,.02,z1-z0,mid(x0,x1),UPPER_FLOOR-.25,mid(z0,z1),plaster));
 }
 const stairDepth=STAIR.bottom-STAIR.top,steps=28,tread=stairDepth/steps;
 for(let i=0;i<steps;i++){
  const z=STAIR.bottom-(i+.5)*tread,y=stairHeight(z);
  e.box(STAIR.width,y,tread+.003,STAIR.x,y/2,z,wood);
  e.box(STAIR.width+.04,.04,.06,STAIR.x,y-.02,z+tread/2-.015,panel);
 }
 e.stairBarriers=[
  ...[left,right].map(x=>({x,z:mid(STAIR.top,STAIR.bottom),w:.12,d:stairDepth})),
  {x:STAIR.x,z:STAIR.top,w:STAIR.width,d:.12}
 ];
 e.upperBarriers=[];
 const rail=(x1:number,z1:number,y1:number,x2:number,z2:number,y2:number)=>{
  const a=new T.Vector3(x1,y1,z1),b=new T.Vector3(x2,y2,z2),axis=b.clone().sub(a);
  const beam=e.box(.13,axis.length(),.14,mid(x1,x2),mid(y1,y2),mid(z1,z2),panel);
  beam.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),axis.normalize());
 };
 for(const x of [left,right]){
  e.upperBarriers.push({x,z:mid(STAIR.top,STAIR.bottom),w:.14,d:stairDepth});
  rail(x,STAIR.top,UPPER_FLOOR+.93,x,STAIR.bottom,UPPER_FLOOR+.93);
  rail(x,STAIR.top,UPPER_FLOOR+.93,x,STAIR.bottom,STAIR.base+.93);
  for(let i=0;i<=14;i++){
   const z=STAIR.bottom-i*stairDepth/14,y=stairHeight(z);
   e.box(.075,.94,.075,x,y+.47,z,panel);
   e.box(.075,.96,.075,x,UPPER_FLOOR+.48,z,panel);
  }
 }
 e.upperBarriers.push({x:STAIR.x,z:STAIR.bottom,w:STAIR.width,d:.14});
 rail(left,STAIR.bottom,UPPER_FLOOR+.94,right,STAIR.bottom,UPPER_FLOOR+.94);
 for(let i=1;i<6;i++)e.box(.075,.96,.075,left+i*STAIR.width/6,UPPER_FLOOR+.48,STAIR.bottom,panel);

 const solid=(w:number,d:number,x:number,z:number)=>e.upperBarriers.push({x,z,w,d});
 const wall=(w:number,d:number,x:number,z:number,mat=stone)=>{
  solid(w,d,x,z);e.walls.push(e.box(w,3.58,d,x,6.84,z,mat));
  e.box(w+.04,.19,d+.04,x,UPPER_FLOOR+.095,z,panel);
 };
 for(const x of [-20.78,20.78])wall(.45,28,x,-2,e.mats.stone);
 // Divide the floor into a central gallery and four rooms off it.
 for(const x of [-6.5,6.5]){
  for(const [a,b] of [[-16,-10.3],[-8.1,5.2],[7.4,12]])wall(.25,b-a,x,mid(a,b));
  for(const z of [-9.2,6.3]){
   for(const end of [-1.1,1.1])e.box(.42,2.65,.14,x,UPPER_FLOOR+1.325,z+end,panel);
   e.box(.42,1.03,2.34,x,8.115,z,stone);
   e.box(.46,.14,2.34,x,7.67,z,panel);
  }
 }
 for(const x of [-13.6,13.6])wall(14.2,.25,x,-2);
 buildAttic(e);
 solid(42,.44,0,-15.85);
 const frontWing=(42-BALCONY.doorWidth)/2;
 for(const side of [-1,1])solid(frontWing,.56,side*(BALCONY.doorWidth+frontWing)/2,12);

 const blue=wovenFabric(e,0x344d5b),green=wovenFabric(e,0x3e554a),linen=wovenFabric(e,0xd8cbb2),rose=wovenFabric(e,0x743d41);
 const item=(w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material)=>e.box(w,h,d,x,UPPER_FLOOR+y,z,m);
 const rug=(x:number,z:number,w:number,d:number,m:T.Material)=>{
  item(w,.025,d,x,.015,z,gold);item(w-.14,.025,d-.14,x,.023,z,m);
 };
 const bookcase=(x:number,z:number)=>{
  solid(3.25,.65,x,z);item(3.25,2.54,.5,x,1.27,z,panel);
  for(let i=0;i<5;i++){
   const y=.22+i*.52;
   item(3.25,.11,.68,x,y,z,wood);
   if(i<4)for(let j=0;j<13;j++){
    const h=.22+(j%4)*.055;
    const bx=x-1.32+j*.21;
    item(.14+(j%3)*.022,h,.23,bx,y+.055+h/2,z+.28,[rose,green,blue,linen][(i+j)%4]);
    for(const mark of [.19,.76])item(.075,.014,.015,bx,y+.055+h*mark,z+.401,gold);
   }
  }
 };
 const chest=(x:number,z:number)=>{
  solid(1.8,.68,x,z);item(1.8,1.05,.68,x,.54,z,panel);
  for(const y of [.24,.54,.84]){
   item(1.66,.23,.06,x,y,z+.36,wood);
   for(const dx of [-.48,.48])item(.13,.07,.07,x+dx,y,z+.41,gold);
  }
 };
 const upholstered=(w:number,h:number,d:number,x:number,y:number,z:number,mat:T.Material)=>
  e.round(w,h,d,x,UPPER_FLOOR+y,z,mat,e.scene);
 const seat=(x:number,z:number,m:T.Material)=>{
  solid(1.5,1,x,z);
  upholstered(1.38,.28,.9,x,.33,z,panel);upholstered(1.26,.19,.78,x,.51,z+.025,m);
  upholstered(1.45,.72,.24,x,.82,z-.39,m).rotation.x=-.08;
  for(const dx of [-.61,.61]){
   upholstered(.24,.31,.86,x+dx,.65,z,m);
   for(const dz of [-.32,.32])item(.105,.23,.11,x+dx,.12,z+dz,panel);
  }
  for(const dx of [-.42,-.14,.14,.42])for(const dy of [.78,.96])
   e.sphere(.023,x+dx,UPPER_FLOOR+dy,z-.255,m);
 };
 for(const x of [-16,14]){
  const z=-12.2;solid(2.24,3.24,x,z);
  if(x<0){
   // Keep the former bedroom's furniture footprint while converting it to linen storage.
   for(const dx of [-1.05,1.05])for(const dz of [-1.46,1.46])item(.1,2.06,.1,x+dx,1.03,z+dz,panel);
   for(const y of [.28,.77,1.26,1.75]){
    item(2.22,.085,3.05,x,y,z,wood);
    for(const dx of [-.44,.44])for(const dz of [-.8,.5])
     upholstered(.71,.12,.79,x+dx,y+.103,z+dz,dz<0?linen:blue);
   }
   chest(x+3.1,-14);rug(x,-9.5,3.2,1.65,blue);
   const tally=e.paper('LINEN COUNT',['Two sheets to mend','Four pillowcases returned','R. Miller'] ,x+3.1,UPPER_FLOOR+1.07,-14);
   tally.scale.set(.7,.7,.7);e.target(tally,'upper-linen','Linen inventory','Read');
   continue;
  }
  item(2.23,.31,3.22,x,.36,z,panel);item(2.2,1.25,.17,x,.67,z-1.54,panel);
  upholstered(2.06,.28,3.03,x,.59,z,linen);
  const quilt=x<0?blue:green;
  drapedQuilt(e,x,UPPER_FLOOR+.84,z+.46,2.24,2.3,quilt);
  upholstered(2.12,.075,.17,x,.84,z-.52,linen);
  for(const dx of [-.51,.51]){
   const pillow=upholstered(.83,.18,.54,x+dx,.82,z-1.04,linen);pillow.rotation.y=dx*.16;
  }
  for(const dx of [-1,1])for(const dz of [-1.42,1.42])item(.13,.31,.13,x+dx,.155,z+dz,panel);
  item(1.95,.72,.045,x,.79,z-1.435,wood);
  for(const dx of [-.94,0,.94])item(.035,.69,.065,x+dx,.79,z-1.4,panel);
  item(2.02,.04,.065,x,1.16,z-1.4,panel);
  for(const side of [-1,1]){
   const bedside=x+side*1.7;solid(.68,.65,bedside,z-.8);
   item(.68,.68,.65,bedside,.35,z-.8,panel);item(.73,.055,.7,bedside,.72,z-.8,wood);
   for(const yy of [.25,.51]){item(.57,.21,.04,bedside,yy,z-.455,wood);item(.09,.045,.035,bedside,yy,z-.42,gold);}
   upholstered(.35,.035,.25,bedside,.766,z-.8,linen);
  }
  chest(x+3.1,-14);rug(x,-9.5,3.2,1.65,x<0?blue:green);
 }
 for(const x of [-17,-12,-8.7])bookcase(x,.1);
 rug(-13,6.9,5.6,4.2,green);seat(-15.5,8.9,green);
 solid(2.2,.94,-13,6.8);item(2.2,.12,.94,-13,.82,6.8,wood);
 for(const dx of [-.94,.94])for(const dz of [-.35,.35])item(.11,.79,.11,-13+dx,.4,6.8+dz,panel);
 const reading=e.paper('LIBRARY LOANS',['A. Ashcombe · orchard notes','E. Vale · repair accounts','Return before Sunday'],-13,UPPER_FLOOR+.91,6.76,true);
 reading.scale.set(.8,.8,.8);e.target(reading,'upper-reading','Library borrowing book','Read');
 rug(13,6.3,5.6,4.65,rose);seat(11,4,rose);seat(15,4,rose);chest(17,9);
 // A folded cloth sits on the cushion, clear of the arms and backrest.
 upholstered(.49,.045,.35,15,.624,4.15,linen);
 upholstered(.47,.026,.31,15,.657,4.15,linen);
 const tag=e.paper('REPAIR',['Loose arm','Awaiting glue'],15,UPPER_FLOOR+.657,4.17);
 tag.scale.set(.29,.36,.29);
 e.target(tag,'chair-repair','Repair tag','Read');
 dressUpperRooms(e,UPPER_FLOOR,solid);
 upperHomeFront(e,UPPER_FLOOR);
 solid(1.35,1.35,13,6.8);e.cyl(.68,.68,.1,13,UPPER_FLOOR+.64,6.8,wood);
 e.cyl(.09,.24,.57,13,UPPER_FLOOR+.31,6.8,panel);
 const invite=e.paper('TEA AT THE LODGE',['Friday · four o’clock','Bring a cup if you have one'],13,UPPER_FLOOR+.685,6.8);
 invite.scale.set(.68,.68,.68);e.target(invite,'upper-invitation','Tea invitation','Read');
 rug(.9,6.8,3.4,6.2,blue);
 for(const [x,z] of [[0,-10],[0,5],[-14,-10],[14,-10],[-14,6],[14,6]]){
  e.cyl(.035,.035,.46,x,8.35,z,gold);
  const shade=e.mat(0xe4cb9c,.85);shade.emissive.setHex(0x977447);
  e.cyl(.17,.35,.23,x,8.08,z,shade);
  const lamp=new T.PointLight(0xffdfb6,65,12,2);lamp.position.set(x,7.7,z);e.scene.add(lamp);
 }
 const stairLight=new T.PointLight(0xffdfb6,55,9,2);
 stairLight.position.set(STAIR.x,4.7,.7);e.scene.add(stairLight);
}
