import {buildKitchenGarden} from './kitchen-garden';
import {windowCurtains} from './curtains';
import {groundHomeFront} from './home-front';
import * as T from 'three';
import type {Estate} from './world';
import type {GameState} from './state';
import {UPPER_FLOOR} from './upstairs';
export const VAN={x:-2.2,start:71,parked:47,length:4.55};
export const KITCHEN_RADIO={x:-20.1,z:-11.75};
const PANTRY_DELIVERY={x:-6.05,z:-14.9};
export const deliveryZ=(progress:number)=>T.MathUtils.lerp(VAN.start,VAN.parked,T.MathUtils.smoothstep(progress,0,1));
export function advanceDelivery(progress:number,dt:number,people:{x:number;z:number}[]){
 const next=Math.min(1,progress+dt/14),from=deliveryZ(progress),to=deliveryZ(next);
 return people.some(p=>Math.abs(p.x-VAN.x)<1.48&&p.z>to-2.8&&p.z<from+2.8)?progress:next;
}
export function makeSuitcase(e:Estate){
 const root=new T.Group(),leather=e.mats.leather??e.mats.wood;
 e.round(.62,.38,.24,0,-.24,0,leather,root);
 for(const x of[-.21,.21]){
  e.box(.045,.389,.249,x,-.24,0,e.mats.dark,root);
  e.box(.045,.058,.017,x,-.115,.133,e.mats.gold,root);
 }
 e.box(.2,.036,.04,0,-.007,0,e.mats.dark,root);
 for(const x of[-.087,.087])e.box(.033,.083,.033,x,-.045,0,e.mats.dark,root);
 return root;
}
function radio(e:Estate,x:number,y:number,z:number){
 const root=new T.Group();root.position.set(x,y,z);e.scene.add(root);
 e.round(.65,.37,.29,0,0,0,e.mats.panel,root);
 e.box(.41,.18,.016,-.046,.04,.153,e.mats.cream,root);
 for(let i=0;i<8;i++)e.box(.39,.008,.015,-.046,-.03+i*.019,.164,e.mats.dark,root);
 for(const dx of[-.18,.19])e.cyl(.032,.032,.027,dx,-.108,.162,e.mats.gold,root,10).rotation.x=Math.PI/2;
 return root;
}
function phone(e:Estate,x:number,y:number,z:number){
 const g=new T.Group();g.position.set(x,y,z);e.scene.add(g);
 e.round(.4,.12,.34,0,0,0,e.mats.black,g);
 e.cyl(.115,.115,.031,0,.072,.02,e.mats.gold,g,16);
 e.round(.37,.066,.08,0,.16,-.08,e.mats.black,g);
 for(const x of[-.16,.16])e.sphere(.059,x,.14,-.08,e.mats.black,g);
 return g;
}
function makeVan(e:Estate){
 const van=new T.Group(),paint=e.mat(0x586052,.58,.22),glass=e.mat(0x76887d,.28,.33),black=e.mats.black;
 van.name='Grocer’s van';e.round(1.88,.46,4.45,0,.69,0,paint,van);
 e.round(1.78,1.38,2.53,0,1.47,.82,paint,van);
 e.round(1.61,.85,1.15,0,1.34,-.99,paint,van);
 e.round(1.52,.41,.94,0,1.055,-1.76,paint,van);
 e.box(1.34,.39,.035,0,1.55,-1.58,glass,van);
 for(const x of[-.821,.821])e.box(.035,.32,.64,x,1.53,-.99,glass,van);
 e.box(.79,.35,.03,0,.88,-2.241,black,van);
 for(let i=0;i<8;i++)e.box(.032,.31,.03,-.33+i*.094,.88,-2.259,e.mats.gold,van);
 for(const x of[-.76,.76]){
  e.sphere(.13,x,.94,-2.16,e.mats.cream,van,1,1,.35);
  e.box(.72,.82,.035,x/2,1.4,2.097,e.mats.wood,van);
  const fender=e.box(.29,.1,1.11,x*1.36,.81,-1.41,paint,van);fender.castShadow=false;
  for(const z of[-1.43,1.37]){
   e.cyl(.37,.37,.22,x*1.165,.375,z,black,van,16).rotation.z=Math.PI/2;
   e.cyl(.17,.17,.23,x*1.18,.375,z,paint,van,14).rotation.z=Math.PI/2;
  }
 }
 e.box(1.88,.1,.15,0,.51,-2.21,e.mats.dark,van);
 return van;
}
export class EstateDelivery {
 van:T.Group;
 private t=0;
 private unload=0;
 private crates:T.Group;
 private pantry:T.Group;
 constructor(e:Estate){
  this.van=makeVan(e);this.van.visible=false;e.scene.add(this.van);
  this.crates=new T.Group();this.crates.position.set(-11.8,.18,46.84);
  for(const x of[-.37,.37]){
   e.box(.65,.38,.44,x,0,0,e.mats.wood,this.crates);
   for(const y of[-.13,.13])e.box(.67,.065,.455,x,y,0,e.mats.panel,this.crates);
  }
  this.crates.visible=false;e.scene.add(this.crates);
  this.pantry=new T.Group();this.pantry.position.set(PANTRY_DELIVERY.x,.3,PANTRY_DELIVERY.z);
  e.box(.61,.44,.47,0,0,0,e.mats.wood,this.pantry);
  for(const z of[-.17,.11])e.box(.64,.023,.055,0,.23,z,e.mats.panel,this.pantry);
  this.pantry.visible=false;e.scene.add(this.pantry);
 }
 reset(s:GameState){this.t=s.flags.deliveryParked?1:0;this.unload=0;this.pose(s);}
 private pose(s:GameState){
  this.van.visible=!!s.flags.deliveryRequested;this.van.position.set(VAN.x,-.055,deliveryZ(this.t));
  this.crates.visible=!!s.flags.deliveryParked&&!s.flags.deliveryStocked;
  this.pantry.visible=!!s.flags.deliveryStocked;
 }
 update(dt:number,s:GameState,e:Estate){
  if(s.flags.deliveryRequested&&!s.flags.deliveryParked){
   const player=e.inCellar()||e.staffLevel()!=='ground'?[]:[e.camera.position];
   this.t=advanceDelivery(this.t,dt,[...player,e.dog.position]);
   if(this.t===1)s.flags.deliveryParked=true;
  }else if(s.flags.deliveryParked&&!s.flags.deliveryStocked&&(this.unload+=dt)>=7)s.flags.deliveryStocked=true;
  this.pose(s);
 }
 obstacle(){return this.van.visible?{x:VAN.x,z:this.van.position.z,w:2.12,d:VAN.length}:null;}
 loadObstacles(){
  const boxes=[];
  if(this.crates.visible)boxes.push({x:-11.8,z:46.84,w:1.42,d:.455});
  if(this.pantry.visible)boxes.push({...PANTRY_DELIVERY,w:.64,d:.47});
  return boxes;
 }
}

export function buildWartimeEstate(e:Estate){
 const {stone,trim,wood,panel,slate,glass,cream,dark,gold}=e.mats;
 const iron=e.mat(0x393d3b,.74,.28),enamel=e.mat(0xb3b8a1,.44),soil=e.mat(0x49412e,.98);
 // The gatehouse is offset from the carriage lane; the pedestrian gap leads to its side door.
 const gx=-12.5,gz=44.5,floor=.075;
 e.floor(5.6,.16,4.8,gx,-.005,gz,e.mats.floor??wood);
 e.floor(2.3,.04,1.9,-8.55,-.065,gz,e.mats.gravel);
 e.wall(5.6,2.8,.28,gx,1.4,gz-2.4,stone);
 for(const side of[-1,1])e.wall(2,2.8,.28,gx+side*1.8,1.4,gz+2.4,stone);
 e.wall(1.6,1.25,.28,gx,.625,gz+2.4,stone);
 e.wall(1.6,.61,.28,gx,2.495,gz+2.4,stone);
 e.wall(1.6,.94,.034,gx,1.72,gz+2.4,glass);
 e.wall(.28,2.8,4.8,gx-2.8,1.4,gz,stone);
 for(const side of[-1,1])e.wall(.28,2.8,1.45,gx+2.8,1.4,gz+side*1.675,stone);
 e.wall(.28,.57,1.9,gx+2.8,2.515,gz,stone);
 e.addDoor('gatehouse',gx+2.8,gz-.9,-Math.PI/2,true,floor,1.8,2.15,'Gatehouse door');
 for(const x of[-.83,0,.83])e.box(.065,1.06,.07,gx+x,1.72,gz+2.6,panel);
 for(const y of[1.21,1.72,2.24])e.box(1.74,.067,.08,gx,y,gz+2.6,panel);
 windowCurtains(e,gx,1.72,gz+2.26,1.6,.94,Math.PI,1.08,0x696b59);
 const roofPitch=.27,roofCenterY=3.05,roofOffset=1.28;
 for(const side of[-1,1])
  e.box(5.95,.14,2.87,gx,roofCenterY,gz+side*roofOffset,slate).rotation.x=side*roofPitch;
 const ridgeY=roofCenterY+roofOffset*Math.tan(roofPitch);
 e.box(5.98,.09,.24,gx,ridgeY+.09,gz,slate);
 // Close each triangular end between the brick wall and the underside of the slate.
 const profile=new T.Shape();
 profile.moveTo(-2.4,0);profile.lineTo(2.4,0);profile.lineTo(0,ridgeY-2.75);profile.closePath();
 const gableGeometry=new T.ExtrudeGeometry(profile,{depth:.28,bevelEnabled:false}).translate(0,0,-.14);
 const uv=gableGeometry.getAttribute('uv'),positions=gableGeometry.getAttribute('position');
 for(let i=0;i<uv.count;i++)uv.setXY(i,(gz+positions.getX(i))/2,(2.75+positions.getY(i))/2);
 for(const side of[-1,1]){
  const gable=new T.Mesh(gableGeometry,stone);
  gable.position.set(gx+side*2.8,2.75,gz);gable.rotation.y=-Math.PI/2;
  gable.castShadow=true;gable.receiveShadow=true;e.scene.add(gable);e.walls.push(gable);
 }
 // Seat the chimney above the slate instead of projecting into the room.
 e.box(.61,.78,.63,gx-1.6,3.67,gz-.86,stone);
 e.box(.71,.09,.73,gx-1.6,4.07,gz-.86,trim);
 e.box(.69,.045,.71,gx-1.6,3.305,gz-.86,iron);
 e.table(gx-1.65,gz,1.23,1.9);
 e.target(phone(e,gx-1.64,1.12,gz-.62),'gate-phone','Gatehouse telephone','Use');
 e.target(e.paper('VEHICLE LOG',['Yesterday · 8.12 pm','Grocer’s van · BW–12','Pantry entry crossed out'],gx-1.52,1.041,gz+.5,true),'vehicle-log','Gatehouse vehicle log','Read');

 // The scullery is off the passage, with the kitchen around the corner.
 // Build the partition to the underside of the upstairs slab.
 const wallX=-13.4,doorZ=-13.38;
 const ceiling=UPPER_FLOOR-.25;
 const partition=(z0:number,z1:number,y0=0,y1=ceiling)=>
  e.wall(.26,y1-y0,z1-z0,wallX,(y0+y1)/2,(z0+z1)/2,stone);
 const doorNear=doorZ-.97,doorFar=doorZ+.97,hatchNear=-12.25,hatchFar=-11.27;
 partition(-16,doorNear);
 partition(doorNear,doorFar,2.47);
 partition(doorFar,hatchNear);
 partition(hatchNear,hatchFar,0,.99);
 partition(hatchNear,hatchFar,1.92);
 partition(hatchFar,-10);
 e.box(.5,.11,1.98,wallX,2.445,doorZ,panel);
 e.box(.47,.12,hatchFar-hatchNear+.12,wallX,.99,(hatchNear+hatchFar)/2,wood);
 const rangeX=-14.95,rangeZ=-15.02;
 e.box(2.22,.92,.94,rangeX,.54,rangeZ,iron);e.barrier(rangeX,rangeZ,2.22,.94);
 for(const x of[-.62,.02,.61]){
  e.cyl(.252,.252,.037,rangeX+x,1.018,rangeZ, dark,e.scene,18);
  e.box(.45,.37,.067,rangeX+x,.63,rangeZ+.497,dark);
  e.box(.23,.047,.073,rangeX+x,.72,rangeZ+.543,gold);
 }
 e.box(.19,2,.22,rangeX-.79,1.9,rangeZ-.21,iron);
 e.cyl(.18,.19,.24,rangeX+.61,1.15,rangeZ,enamel);
 // Keep the counter outside the round corner tower's footprint.
 e.table(-19.15,-11.7,2.62,.84);
 const wireless=radio(e,KITCHEN_RADIO.x,1.185,KITCHEN_RADIO.z);wireless.rotation.y=Math.PI;
 e.target(wireless,'kitchen-wireless','Kitchen wireless','Tune');
 e.target(e.paper('RATION BOOK',['SUGAR · TEA · BUTTER','Household coupons'],-19.25,1.04,-11.7,true),'ration-book','Household ration book','Read');
 const tray=new T.Group();tray.name='Tea for Lady Beatrice';tray.position.set(wallX,1.064,(hatchNear+hatchFar)/2);tray.visible=false;e.scene.add(tray);e.arrivalTea=tray;
 e.box(.42,.027,.38,0,0,0,panel,tray);
 for(const x of [-.1,.11]){
  e.cyl(.07,.07,.016,x,.024,.105,cream,tray,12);
  e.cyl(.047,.034,.068,x,.064,.105,cream,tray,12);
  e.cyl(.039,.039,.008,x,.1,.105,iron,tray,12);
 }
 e.sphere(.094,-.025,.1,-.079,enamel,tray,1,.88,1);
 e.cyl(.044,.06,.022,-.025,.185,-.079,enamel,tray,12);
 const flour=e.mat(0xd7cbb3,.98);
 for(let i=0;i<8;i++)e.sphere(.023+(i%3)*.009,-19.6+i*.027,1.031,-11.43+Math.sin(i*2)*.04,flour,e.scene,1,.1,1);
 const mending=new T.Group();mending.position.set(-18.38,1.031,-11.69);e.scene.add(mending);
 const cloth=e.mat(0x777d58,.96),patch=e.mat(0x62694d,.98);
 e.round(.39,.05,.32,0,.018,0,cloth,mending);
 e.box(.14,.007,.097,-.056,.046,.045,patch,mending);
 for(let i=0;i<6;i++)e.box(.012,.005,.006,-.117+i*.025,.051,.087,cream,mending);
 e.cyl(.035,.035,.07,.23,.046,-.077,wood,mending,9).rotation.z=Math.PI/2;
 e.target(mending,'mended-clothes','Mended work shirt','Inspect');
 const sinkX=-10.75;
 e.box(2.5,.82,.79,sinkX,.48,-15.24,wood);e.barrier(sinkX,-15.24,2.5,.79);
 e.box(1.22,.19,.72,sinkX,.955,-15.21,enamel);
 e.box(.98,.034,.49,sinkX,1.054,-15.2,iron);
 e.cyl(.026,.041,.26,sinkX,1.13,-15.48,gold);
 e.box(.047,.045,.19,sinkX,1.253,-15.4,gold);
 for(const x of[-8.62,-7.78,-6.94]){
  e.box(.8,2.16,.64,x,1.16,-15.3,panel);e.barrier(x,-15.3,.8,.64);
  e.box(.64,1.9,.06,x,1.18,-14.95,wood);
  e.sphere(.046,x+.2,1.14,-14.9,gold);
 }
 for(let i=0;i<5;i++){
  const x=sinkX-.96+i*.48;
  e.box(.32,.09,.11,x,2.19,-15.69,wood);
  e.cyl(.07,.137,.15,x,2.05,-15.56,gold,e.scene,12);
 }
 for(const x of[-19.9,-19.15,-18.4])e.box(.64,1.24,.028,x,2.82,-10.19,dark);

 groundHomeFront(e);
 // Productive garden beneath the lodge windows, with the fountain visible beyond.
 buildKitchenGarden(e);
 e.table(-16.5,-52.7,1.75,.85,.88);
 for(const dx of[-.49,0,.46])e.cyl(.18,.126,.28,-16.5+dx,1.08,-52.7,soil,e.scene,12);
 e.box(2.45,.13,.65,-18.45,.45,-50.9,panel);
 e.box(2.45,.53,.132,-18.45,.76,-51.2,wood);
 for(const dx of[-.94,.94])e.box(.15,.46,.55,-18.45+dx,.22,-50.9,iron);
 e.barrier(-18.45,-50.9,2.45,.69);
 const tools=new T.Group();tools.position.set(-17.28,.38,-53.3);e.scene.add(tools);
 const shaft=e.cyl(.027,.028,1.06,0,.2,0,wood,tools,8);shaft.rotation.z=.24;
 e.box(.23,.27,.045,.12,-.28,0,iron,tools);
 e.target(tools,'garden-tools','Mended garden spade','Inspect');
 e.table(-6.65,-50.65,1.24,.59,.67);
 e.box(.52,.034,.3,-6.65,.786,-50.65,panel);
 for(const x of[-6.81,-6.55]){
  e.cyl(.049,.038,.076,x,.84,-50.64,enamel,e.scene,10);
  e.cyl(.064,.064,.01,x,.81,-50.64,cream,e.scene,12);
 }
}
