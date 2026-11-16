import * as T from 'three';
import type {Estate} from './world';
import {wovenFabric} from './detail';

export const ATTIC_FLOOR=8.8;
export const ATTIC_STAIR={bottom:5.55,top:-1.45,z:-4,width:2.2,base:5.05};
const S=ATTIC_STAIR,near=S.z-S.width/2,far=S.z+S.width/2;
const mid=(a:number,b:number)=>(a+b)/2;
export const inAtticStair=(x:number,z:number)=>x>S.top&&x<S.bottom&&z>near&&z<far;
export const atticStairHeight=(x:number)=>T.MathUtils.lerp(S.base,ATTIC_FLOOR,
 T.MathUtils.clamp((S.bottom-x)/(S.bottom-S.top),0,1));
export const onAtticDeck=(x:number,z:number)=>Math.abs(x)<16.3&&z>-8.2&&z<4.55&&!inAtticStair(x,z);

export function buildAttic(e:Estate){
 const {stone,wood,panel,plaster,gold}=e.mats;
 e.atticBarriers=[];
 for(const [x0,x1,z0,z1] of [
  [-21,21,-16,near],[-21,21,far,12],
  [-21,S.top,near,far],[S.bottom,21,near,far]
 ]){
  e.box(x1-x0,.21,z1-z0,mid(x0,x1),ATTIC_FLOOR-.105,mid(z0,z1),stone);
  e.walls.push(e.box(x1-x0,.02,z1-z0,mid(x0,x1),ATTIC_FLOOR-.22,mid(z0,z1),plaster));
 }
 const length=S.bottom-S.top,tread=length/23;
 for(let i=0;i<23;i++){
  const x=S.bottom-(i+.5)*tread,y=atticStairHeight(x);
  e.box(tread+.002,y-S.base,S.width,x,mid(y,S.base),S.z,wood);
  e.box(.064,.045,S.width+.025,x+tread/2-.028,y-.022,S.z,panel);
 }
 const rail=(x1:number,y1:number,z1:number,x2:number,y2:number,z2:number)=>{
  const axis=new T.Vector3(x2-x1,y2-y1,z2-z1);
  const mesh=e.box(.13,axis.length(),.13,mid(x1,x2),mid(y1,y2),mid(z1,z2),panel);
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),axis.normalize());
 };
 for(const z of [near,far]){
  const edge={x:mid(S.top,S.bottom),z,w:length,d:.12};
  e.upperBarriers.push(edge);e.atticBarriers.push(edge);
  rail(S.top,ATTIC_FLOOR+.93,z,S.bottom,S.base+.93,z);
  rail(S.top,ATTIC_FLOOR+.93,z,S.bottom,ATTIC_FLOOR+.93,z);
  for(let i=0;i<=16;i++){
   const x=S.top+i*length/16,y=atticStairHeight(x);
   e.box(.075,.94,.075,x,y+.47,z,panel);
   e.box(.075,.94,.075,x,ATTIC_FLOOR+.47,z,panel);
  }
 }
 e.upperBarriers.push({x:S.top,z:S.z,w:.12,d:S.width});
 e.atticBarriers.push({x:S.bottom,z:S.z,w:.12,d:S.width});
 rail(S.bottom,ATTIC_FLOOR+.93,near,S.bottom,ATTIC_FLOOR+.93,far);
 for(let i=0;i<6;i++)e.box(.075,.96,.075,S.bottom,ATTIC_FLOOR+.48,near+.18+i*.37,panel);

 const solid=(w:number,d:number,x:number,z:number)=>e.atticBarriers.push({w,d,x,z});
 for(const x of [-13,13])solid(1.8,1.2,x,-3);
 const item=(w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material)=>
  e.box(w,h,d,x,ATTIC_FLOOR+y,z,m);
 const partition=(w:number,d:number,x:number,z:number)=>{
  solid(w,d,x,z);e.walls.push(item(w,2.38,d,x,1.19,z,stone));
  item(w+.035,.15,d+.035,x,.075,z,panel);
 };
 for(const x of [-16.35,16.35])partition(.28,13,x,-1.825);
 for(const z of [-8.2,4.55])partition(32.7,.28,0,z);
 for(const x of [-6,7.15]){
  for(const [a,b] of [[-8.2,-2.05],[.35,4.55]])partition(.26,b-a,x,mid(a,b));
  item(.34,.16,2.4,x,2.3,-.85,stone);
  for(const z of [-2.05,.35])item(.39,2.28,.13,x,1.14,z,panel);
  item(.42,.17,2.56,x,2.23,-.85,panel);
 }
 // Enclose the usable roof space and give the rafters a visible timber finish.
 item(32.7,.15,12.75,0,2.42,-1.825,plaster);
 for(let x=-15.2;x<16;x+=3.8){
  item(.15,.18,12.75,x,2.31,-1.825,panel);
  for(const z of [-7.99,4.34])item(.19,2.36,.19,x,1.18,z,wood);
 }
 const cloth=wovenFabric(e,0x536355),linen=wovenFabric(e,0xd8c9ad),brickRed=wovenFabric(e,0x633f36);
 const crate=(x:number,z:number,w:number,d:number,h:number)=>{
  solid(w,d,x,z);item(w,h,d,x,h/2,z,wood);
  for(const dx of [-w*.36,w*.36])item(.1,h,.06,x+dx,h/2,z+d/2,panel);
  item(w+.04,.08,d+.04,x,h,z,panel);
 };
 // The west room holds estate trunks, crates and a work shelf.
 for(const [x,z,w,d,h] of [[-13.6,-5.3,1.25,.86,.69],[-11.8,-5.45,1.38,.88,.88],[-14.1,2.5,2.2,1,.72],[-9,2.7,1.25,.94,.81]])crate(x,z,w,d,h);
 for(const x of [-13.4,-9.75]){
  solid(2.8,.65,x,-7.55);item(2.8,2.2,.11,x,1.1,-7.81,panel);
  for(const side of [-1,1])item(.1,2.2,.64,x+side*1.34,1.1,-7.55,wood);
  for(const y of [.43,1.03,1.62,2.13])item(2.8,.08,.65,x,y,-7.55,wood);
  for(let i=0;i<4;i++)item(.4,.34,.41,x-1.02+i*.62,.64,-7.53,i%2?panel:wood);
 }
 // The east room is a spare staff bedroom with a writing desk.
 solid(1.55,2.76,12.7,-5.85);
 item(1.55,.27,2.76,12.7,.33,-5.85,panel);
 item(1.56,1.18,.16,12.7,.62,-7.16,wood);
 e.round(1.45,.26,2.65,12.7,ATTIC_FLOOR+.56,-5.85,linen,e.scene);
 e.round(1.51,.13,1.9,12.7,ATTIC_FLOOR+.75,-5.52,cloth,e.scene);
 e.round(1.06,.16,.47,12.7,ATTIC_FLOOR+.76,-6.72,linen,e.scene);
 solid(2,.85,11.8,3.45);item(2,.14,.85,11.8,.86,3.45,panel);
 for(const dx of [-.82,.82])for(const dz of [-.31,.31])item(.095,.81,.095,11.8+dx,.405,3.45+dz,wood);
 item(.51,.032,.37,11.65,.949,3.4,linen);
 item(2.9,.016,1.5,12.3,.012,-2.9,brickRed);
 // Fixtures light the landing, store and bedroom without adding shadow lights.
 const bulb=e.mat(0xffdeae);bulb.emissive.setHex(0xc38e50);bulb.emissiveIntensity=.9;
 for(const [x,z] of [[-2,-.7],[4,-.7],[-11,-1],[11,-.6]]){
  e.cyl(.025,.025,.14,x,ATTIC_FLOOR+2.29,z,gold);
  e.cyl(.14,.32,.17,x,ATTIC_FLOOR+2.16,z,bulb);
  const l=new T.PointLight(0xffd7aa,65,12,2);l.position.set(x,ATTIC_FLOOR+1.99,z);e.scene.add(l);
 }
}
