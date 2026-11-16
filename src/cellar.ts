import * as T from 'three';
import type {Estate} from './world';

export const CELLAR_FLOOR=-4.8;
const CEILING=-1.05;
const tunnelHalf=1.65;
export const cellarContains=(x:number,z:number)=>
 (Math.abs(x)<11&&z>-20&&z<-2)||(Math.abs(x)<tunnelHalf&&z>=-40&&z<=-20);
type Travel={x:number;z:number;yaw:number;below:boolean};
export const cellarRoutes:Record<string,Travel>={
 'cellar:hall-down':{x:1.5,z:-12.8,yaw:1.05,below:true},
 'cellar:hall-up':{x:1.5,z:-10.7,yaw:0,below:false},
 'cellar:garden-down':{x:0,z:-37.6,yaw:Math.PI,below:true},
 'cellar:garden-up':{x:0,z:-37.3,yaw:Math.PI,below:false}
};

export function buildCellar(e:Estate){
 e.cellarBarriers=[];
 const existing=new Set(e.scene.children);
 const stone=e.mats.stone,wood=e.mats.wood,iron=e.mat(0x303633,.66,.28),brass=e.mats.gold;
 const concrete=e.mat(0x77756b,.98),canvas=e.mat(0x657058,.98),crate=e.mat(0x8b6842,.91);
 const wall=(w:number,d:number,x:number,z:number,mat=stone)=>{
  e.walls.push(e.box(w,CEILING-CELLAR_FLOOR,d,x,(CEILING+CELLAR_FLOOR)/2,z,mat));
  e.cellarBarriers.push({w,d,x,z});
 };
 const slab=(w:number,d:number,z:number)=>{
  e.box(w,.23,d,0,CELLAR_FLOOR-.115,z,stone);
  e.walls.push(e.box(w,.25,d,0,CEILING+.125,z,stone));
 };
 slab(22.4,18,-11);slab(3.75,20,-30);
 for(const x of [-11,11])wall(.35,18,x,-11);
 wall(22,.35,0,-2);
 const wing=11-tunnelHalf;
 for(const side of [-1,1]){
  wall(wing,.35,side*(tunnelHalf+wing/2),-20,concrete);
  wall(.3,20,side*tunnelHalf,-30);
 }
 wall(3.3,.35,0,-40);
 // A central aisle connects the wine vault, stores, bunker and escape passage.
 for(const x of [-3.1,3.1])for(const [a,b] of [[-15.4,-10.3],[-7.7,-2]]){
  wall(.32,b-a,x,(a+b)/2);
 }
 for(const x of [-3.1,3.1]){
  for(const z of [-10.3,-7.7])e.box(.53,2.58,.22,x,CELLAR_FLOOR+1.29,z,stone);
  e.walls.push(e.box(.53,1.17,2.82,x,CEILING-.585,-9,stone));
 }
 for(const side of [-1,1])wall(9.7,.35,side*6.15,-15.4,concrete);
 e.walls.push(e.box(2.6,1,.44,0,CEILING-.5,-15.4,concrete));
 const item=(w:number,h:number,d:number,x:number,y:number,z:number,mat:T.Material,parent=e.scene)=>
  e.box(w,h,d,x,CELLAR_FLOOR+y,z,mat,parent);
 const solid=(w:number,d:number,x:number,z:number)=>e.cellarBarriers.push({w,d,x,z});

 const bottlePositions:T.Vector3[]=[];
 for(const z of [-14,-3.05]){
  solid(6.4,.7,-7,z);
  item(6.4,2.65,.09,-7,1.325,z+(z<-8?-.34:.34),wood);
  for(let i=0;i<8;i++)item(.07,2.65,.7,-10.2+i*6.4/7,1.325,z,wood);
  for(let shelf=0;shelf<5;shelf++){
   const y=.23+shelf*.51;
   item(6.4,.075,.7,-7,y,z,wood);
   for(let i=0;i<32;i++)if((i+shelf*3)%13!==0)bottlePositions.push(new T.Vector3(-10+i*.19,CELLAR_FLOOR+y+.0375,z));
  }
 }
 // Shared meshes keep hundreds of bottles inexpensive to render.
 const bottleParts=[
  {shape:new T.CylinderGeometry(.057,.06,.228,10),mat:e.mat(0x263c28,.34),y:.114},
  {shape:new T.CylinderGeometry(.024,.057,.05,10),mat:e.mat(0x263c28,.34),y:.253},
  {shape:new T.CylinderGeometry(.022,.024,.065,10),mat:e.mat(0x263c28,.34),y:.31},
  {shape:new T.CylinderGeometry(.025,.025,.041,10),mat:e.mat(0x682e31,.48),y:.33},
  {shape:new T.CylinderGeometry(.061,.061,.087,10),mat:e.mat(0xc7b38e,.92),y:.119}
 ];
 for(const part of bottleParts){
  const bottles=new T.InstancedMesh(part.shape,part.mat,bottlePositions.length),matrix=new T.Matrix4();
  for(const [i,p] of bottlePositions.entries()){
   bottles.setMatrixAt(i,matrix.makeTranslation(p.x,p.y+part.y,p.z));
   if(part===bottleParts[0])bottles.setColorAt(i,new T.Color([0xffffff,0xbec491,0xb9b298][i%3]));
  }
  bottles.receiveShadow=true;bottles.instanceMatrix.needsUpdate=true;e.scene.add(bottles);
 }
 for(const z of [-11.7,-9.7,-7.7]){
  solid(1.14,1.14,-9.7,z);
  e.cyl(.49,.51,1.04,-9.7,CELLAR_FLOOR+.52,z,wood,e.scene,20);
  for(const y of [.13,.52,.91])e.cyl(.518,.518,.07,-9.7,CELLAR_FLOOR+y,z,iron,e.scene,20);
  e.cyl(.055,.055,.023,-9.7,CELLAR_FLOOR+1.052,z,brass);
 }
 for(const [x,z] of [[8.8,-12.6],[9.3,-7],[5.2,-4.2],[8.4,-4.2]]){
  solid(1.45,1.1,x,z);
  for(let i=0;i<2;i++){
   const y=.34+i*.69;
   item(1.42,.67,1.06,x,y,z,crate);
   for(const dx of [-.58,.58])item(.095,.67,1.12,x+dx,y,z,wood);
   item(1.46,.06,1.12,x,y+.33,z,wood);
  }
 }
 // The concrete shelter has canvas cots, a radio desk and supply lockers.
 for(const x of [-8.5,8.5]){
  solid(2.6,1.05,x,-18.2);
  item(2.6,.15,1.04,x,.57,-18.2,iron);
  item(2.47,.14,.94,x,.71,-18.2,canvas);
  item(.55,.12,.8,x-.88,.84,-18.2,e.mats.cream);
  for(const dx of [-1.15,1.15])for(const dz of [-.39,.39])item(.075,.58,.075,x+dx,.29,-18.2+dz,iron);
 }
 solid(2.4,.85,4,-18.9);
 item(2.4,.11,.85,4,.9,-18.9,wood);
 for(const dx of [-1,1])item(.095,.9,.62,4+dx,.45,-18.9,iron);
 item(.89,.52,.43,4,1.21,-19,iron);
 item(.75,.34,.04,4,1.23,-18.76,wood);
 for(const dx of [-.25,.25])e.cyl(.06,.06,.045,4+dx,CELLAR_FLOOR+1.15,-18.724,brass).rotation.x=Math.PI/2;
 item(.62,.075,.32,4.77,.995,-18.76,e.mats.paper);
 for(const x of [-5,-3.9]){
  solid(.88,.61,x,-19.35);item(.88,1.95,.61,x,.975,-19.35,iron);
  item(.045,.22,.05,x+.24,1,-19.02,brass);
  for(const y of [1.51,1.62,1.73])item(.55,.035,.035,x,y,-19.02,e.mats.dark);
 }

 const light=(x:number,z:number,power:number)=>{
  const y=CEILING-.31;
  e.cyl(.065,.065,.22,x,y+.18,z,iron);
  e.cyl(.1,.25,.17,x,y,z,iron);
  const bulb=e.mat(0xffd98e);bulb.emissive.setHex(0xffb65b);bulb.emissiveIntensity=2;
  e.sphere(.092,x,y-.12,z,bulb,e.scene,1,.68,1);
  const lamp=new T.PointLight(0xffd3a0,power,11,2);lamp.position.set(x,y-.38,z);e.scene.add(lamp);
 };
 for(const [x,z,power] of [[0,-5,65],[0,-11,75],[-7,-8,125],[7,-8,105],[-5,-17.6,75],[5,-17.6,75],[0,-19,75],[0,-24,68],[0,-30,70],[0,-36,70]])light(x,z,power);
 for(const z of [-21,-25,-29,-33,-37]){
  for(const side of [-1,1])e.box(.16,3.7,.23,side*(tunnelHalf-.07),CELLAR_FLOOR+1.85,z,stone);
  e.box(3,.23,.23,0,CEILING-.11,z,stone);
 }

 const interior=new T.Group();interior.name='Cellar and garden tunnel';
 for(const object of [...e.scene.children])if(!existing.has(object))interior.add(object);
 interior.visible=false;e.scene.add(interior);e.cellarInterior=interior;
 const hatch=(x:number,y:number,z:number,id:string,label:string,verb:string)=>{
  const g=new T.Group();g.position.set(x,y,z);
  e.box(1.36,.095,1.48,0,0,0,iron,g);
  for(let i=0;i<5;i++)e.box(.218,.055,1.3,(i-2)*.243,.055,0,id.includes('hall')?wood:iron,g);
  for(const zz of [-.56,.56])e.box(1.28,.06,.095,0,.088,zz,brass,g);
  const ring=new T.Mesh(new T.TorusGeometry(.09,.018,8,18),brass);
  ring.rotation.x=-Math.PI/2;ring.position.set(0,.135,.28);g.add(ring);
  e.scene.add(g);e.target(g,id,label,verb);
 };
 hatch(1.5,.105,-12,'cellar:hall-down','Cellar hatch','Climb down');
 hatch(0,.035,-39,'cellar:garden-down','Garden escape hatch','Climb down');
 const ladder=(x:number,z:number,id:string,label:string)=>{
  const g=new T.Group();g.position.set(x,CELLAR_FLOOR,z);
  for(const dx of [-.36,.36])e.box(.09,3.65,.1,dx,1.84,0,iron,g);
  for(let i=0;i<11;i++)e.box(.76,.08,.09,0,.27+i*.31,0,brass,g);
  solid(.85,.16,x,z);interior.add(g);e.target(g,id,label,'Climb up');
 };
 ladder(1.5,-12,'cellar:hall-up','Ladder to the mansion');
 ladder(0,-39.35,'cellar:garden-up','Ladder to the garden');
}
