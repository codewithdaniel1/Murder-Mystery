import * as T from 'three';
import type {Estate} from './world';
import {buildCellarRats} from './cellar-rats';
import {bakeCellarLighting,type CellarLamp} from './cellar-lighting';

export const CELLAR_FLOOR=-4.8;
const CEILING=-1.05;
const tunnelHalf=1.65;
export const BULKHEADS=[
 {id:'cellar-mansion',label:'Mansion cellar doors',x:-26.5,top:-10.5,bottom:-18,direction:-1,underpass:false},
 {id:'cellar-garden',label:'Lodge cellar doors',x:0,top:-86,bottom:-80,direction:1,underpass:false},
 {id:'cellar-hall',label:'Hall cellar doors',x:-.65,top:-5.7,bottom:-13.2,direction:-1,underpass:true}
] as const;
export const LODGE_BULKHEAD=BULKHEADS[1];
const tunnelEnd=LODGE_BULKHEAD.bottom,tunnelMouth=-20;
const tunnelLength=tunnelMouth-tunnelEnd,tunnelCenter=(tunnelMouth+tunnelEnd)/2;
const annexes=[
 {kind:'bottling',side:-1,z:-27},
 {kind:'workshop',side:1,z:-35},
 {kind:'archive',side:-1,z:-43},
] as const;
const annexEnd=9,annexHalf=3.5,annexDoor=2.4;
const HALF=1.65, OPEN=3.6;
export function bulkheadGate(s:typeof BULKHEADS[number],below:boolean){
 const distance=below?(s.bottom-s.top)*s.direction*.34:0;
 return {x:s.x,z:s.top+s.direction*distance,w:HALF*2,d:.15};
}
export function poseBulkhead(leaves:T.Group[],amount:number){
 for(const [i,leaf] of leaves.entries())leaf.rotation.z=(i===0?-1:1)*T.MathUtils.lerp(Math.PI/2,-.1,amount);
}
export const cellarStairAt=(x:number,z:number)=>BULKHEADS.find(s=>
 Math.abs(x-s.x)<HALF&&(z-s.top)*s.direction>=0&&(s.bottom-z)*s.direction>=0);
export function cellarStairHeight(s:typeof BULKHEADS[number],z:number){
 return T.MathUtils.lerp(-.08,CELLAR_FLOOR,(z-s.top)/(s.bottom-s.top));
}
export const cellarContains=(x:number,z:number)=>
 (Math.abs(x)<11&&z>-20&&z<-2)||(Math.abs(x)<tunnelHalf&&z>=tunnelEnd&&z<=tunnelMouth)||
 (x>=-28.15&&x<=-11&&z>=-21.3&&z<=-18)||
 annexes.some(room=>x*room.side>=tunnelHalf&&x*room.side<=annexEnd&&Math.abs(z-room.z)<=annexHalf);
export const HALL_BULKHEAD=BULKHEADS[2];
export const cellarOpeningEnd=(s:typeof BULKHEADS[number])=>s.top+s.direction*OPEN;
export function cellarGroundOpenings(){
 return BULKHEADS.map(s=>({left:s.x-HALF,right:s.x+HALF,
  near:Math.min(s.top,cellarOpeningEnd(s)),far:Math.max(s.top,cellarOpeningEnd(s))}));
}

export function buildCellar(e:Estate){
 e.cellarBarriers=[];
 e.cellarDoors=new Map();
 const lamps:CellarLamp[]=[];
 const fixedLight=(x:number,y:number,z:number,power:number,range:number)=>{
  lamps.push({x,y,z,power,range});
 };
 const existing=new Set(e.scene.children);
 const stone=e.mats.stone.clone(),wood=e.mats.wood,iron=e.mat(0x303633,.66,.28),brass=e.mats.gold;
 stone.color.multiplyScalar(.55);
 const brickTone=(color:number)=>{
  const material=stone.clone();material.color.setHex(color);material.roughness=.98;return material;
 };
 const bunkerBrick=brickTone(0x77756b),canvas=e.mat(0x657058,.98),crate=e.mat(0x8b6842,.91);
 const wall=(w:number,d:number,x:number,z:number,mat=stone)=>{
  e.walls.push(e.box(w,CEILING-CELLAR_FLOOR,d,x,(CEILING+CELLAR_FLOOR)/2,z,mat));
  e.cellarBarriers.push({w,d,x,z});
 };
 const slab=(w:number,d:number,z:number,x=0,skipCeiling=false)=>{
  e.box(w,.23,d,x,CELLAR_FLOOR-.115,z,stone);
  if(!skipCeiling)e.walls.push(e.box(w,.25,d,x,CEILING+.125,z,stone));
 };
 slab(22.4,18,-11,0,true);
 const hall=HALL_BULKHEAD;
 for(const [x0,x1,z0,z1] of [
  [-11.2,hall.x-HALF,-20,-2],[hall.x+HALF,11.2,-20,-2],
  [hall.x-HALF,hall.x+HALF,-20,hall.bottom],
  [hall.x-HALF,hall.x+HALF,hall.top,-2]
 ])e.walls.push(e.box(x1-x0,.25,z1-z0,(x0+x1)/2,CEILING+.125,(z0+z1)/2,stone));
 slab(3.75,tunnelLength,tunnelCenter);slab(17.5,3.3,-19.65,-19.65);
 wall(.35,18,11,-11);wall(.35,16,-11,-10);
 wall(.3,3.3,-28.15,-19.65);wall(17.3,.28,-19.5,-21.3);
 wall(13.85,.28,-17.925,-18);
 // Close the part of the wider west passage that extends past the cellar wall.
 wall(.35,1.5,-11,-20.65);
 wall(22,.35,0,-2);
 const wing=11-tunnelHalf;
 for(const side of [-1,1]){
  wall(wing,.35,side*(tunnelHalf+wing/2),-20,bunkerBrick);
  let edge:number=tunnelEnd;
  for(const room of annexes.filter(room=>room.side===side).reverse()){
   const start=room.z-annexDoor/2,end=room.z+annexDoor/2;
   wall(.3,start-edge,side*tunnelHalf,(edge+start)/2);
   edge=end;
  }
  wall(.3,tunnelMouth-edge,side*tunnelHalf,(edge+tunnelMouth)/2);
 }

 const item=(w:number,h:number,d:number,x:number,y:number,z:number,mat:T.Material,parent=e.scene)=>
  e.box(w,h,d,x,CELLAR_FLOOR+y,z,mat,parent);
 const solid=(w:number,d:number,x:number,z:number)=>e.cellarBarriers.push({w,d,x,z});

 // The hall stair and west passage both discharge into the open landing.
 // The far arch is on axis with the garden tunnel; rooms branch from the landing.
 const landingStone=brickTone(0x65594b),wineStone=brickTone(0x76614c);
 const storeStone=brickTone(0x6d685b),shelterStone=brickTone(0x59605a);
 item(13.35,.022,3.3,-3.85,.012,-18.2,landingStone);
 item(3,.027,7.15,0,.016,-16.35,landingStone);
 item(6.75,.02,14.25,-7.42,.012,-9.45,wineStone);
 item(6.9,.02,10.55,7.38,.012,-7.65,storeStone);
 item(6.92,.02,6.25,7.39,.012,-16.63,shelterStone);

 // Wine vault: a wide entrance off the west landing and a second door by the hall.
 for(const [a,b] of [[-11,-8.9],[-6,-3.8]])wall(b-a,.34,(a+b)/2,-16.55);
 for(const [a,b] of [[-16.55,-10.25],[-7.75,-2]])wall(.34,b-a,-3.8,(a+b)/2);
 // Stores and shelter have separate entrances off the east side of the main route.
 for(const [a,b] of [[-20,-18.95],[-16.15,-10.25],[-7.75,-2]])
  wall(.34,b-a,3.8,(a+b)/2,a<-12?bunkerBrick:stone);
 wall(7.2,.38,7.4,-13,bunkerBrick);

 // Recessed lintels and masonry voussoirs give each entrance a readable outline.
 const portal=(x:number,z:number,width:number,turn=false,mat=stone)=>{
  const g=new T.Group();g.position.set(x,CELLAR_FLOOR,z);
  if(turn)g.rotation.y=Math.PI/2;e.scene.add(g);
  const rise=2.33,r=width/2;
  for(const side of [-1,1])for(let i=0;i<6;i++)
   e.box(.23,.37,.56,side*(r+.11),.2+i*.38,0,mat,g);
  const outer=r+.19;
  for(let i=0;i<11;i++){
   const angle=(i+.5)*Math.PI/11;
   const block=e.box(.19,Math.PI*(r+.09)/11+.016,.58,
    Math.cos(angle)*(r+.095),rise+Math.sin(angle)*(r+.095),0,mat,g);
   block.rotation.z=angle;
  }
  // The rectangular stone backing closes the space over the decorative arch.
  const crown=rise+outer,headroom=CEILING-CELLAR_FLOOR-crown;
  if(headroom>.02)e.walls.push(e.box(width+.4,headroom,.4,0,crown+headroom/2,0,mat,g));
 };
 portal(-7.45,-16.55,2.9);portal(-3.8,-9,2.5,true);
 portal(3.8,-9,2.5,true);portal(3.8,-17.55,2.8,true,bunkerBrick);
 portal(0,-19.94,3.05,false,bunkerBrick);

 for(const room of annexes){
  const {kind,side,z}=room,depth=annexHalf*2,x=side*(annexEnd+tunnelHalf)/2;
  const floorEdge=3.75/2;
  slab(annexEnd-floorEdge,depth,z,side*(annexEnd+floorEdge)/2);
  for(const end of[-1,1])wall(annexEnd-tunnelHalf,.3,x,z+end*annexHalf);
  wall(.3,depth,side*annexEnd,z);
  portal(side*tunnelHalf,z,annexDoor,true);
  const workX=side*7.55;
  if(kind==='bottling'){
   solid(1.1,4.8,workX,z);
   item(1.14,.12,4.8,workX,.94,z,wood);
   for(const dz of[-2.15,0,2.15])for(const dx of[-.39,.39])item(.13,.9,.14,workX+dx,.45,z+dz,wood);
   for(let i=0;i<9;i++){
    const zz=z-1.8+i*.32;
    e.cyl(.078,.086,.29,workX-.14,CELLAR_FLOOR+1.145,zz,e.mats.dark,e.scene,10);
    e.cyl(.035,.048,.13,workX-.14,CELLAR_FLOOR+1.35,zz,e.mats.dark,e.scene,10);
    e.cyl(.029,.029,.047,workX-.14,CELLAR_FLOOR+1.43,zz,crate,e.scene,10);
   }
   item(.36,.46,.36,workX+.17,1.23,z+1.43,iron);
   item(.55,.085,.6,workX+.16,1.48,z+1.43,wood);
  }else if(kind==='workshop'){
   solid(1.15,4.8,workX,z);
   item(1.15,.16,4.8,workX,.98,z,wood);
   for(const dz of[-2.18,2.18])for(const dx of[-.4,.4])item(.17,.9,.18,workX+dx,.46,z+dz,wood);
   item(.34,.24,.48,workX-.34,1.18,z-1.55,iron);
   e.target(item(.24,.063,.36,workX-.38,1.102,z+.63,wood),'workshop-bench','Hinge on the workbench','Inspect');
   item(.52,.054,.92,workX,1.1,z,canvas);
   for(const dz of[-.6,-.37,-.15,.07])item(.34,.053,.08,workX+.04,1.14,z+dz,brass);
   buildWorkshopRack(e,z);
  }else{
   solid(.84,4.5,workX,z);
   item(.09,2.7,4.5,workX+side*.37,1.35,z,wood);
   for(const dz of[-2.14,0,2.14])item(.83,2.7,.115,workX,1.35,z+dz,wood);
   for(const y of[.3,.95,1.6,2.25]){
    item(.84,.09,4.48,workX,y,z,wood);
    for(const dz of[-1.57,-.8,.55,1.42]){
     item(.62,.38,.57,workX,y+.23,z+dz,crate);
     item(.022,.12,.29,workX-side*.318,y+.25,z+dz,e.mats.paper);
    }
   }
  }
 }

 const bottlePositions:T.Vector3[]=[];
 for(const [x,z,sideWall] of [[-10.4,-11.7,true],[-7,-3.05,false]] as const){
  solid(sideWall?.7:6.4,sideWall?6.4:.7,x,z);
  const rack=new T.Group();rack.position.set(x,CELLAR_FLOOR,z);
  rack.rotation.y=sideWall?Math.PI/2:Math.PI;e.scene.add(rack);
  e.box(6.4,2.65,.09,0,1.325,-.34,wood,rack);
  e.round(6.48,.11,.76,0,2.66,0,e.mats.panel,rack);
  for(let i=0;i<8;i++)e.box(.07,2.65,.7,-3.2+i*6.4/7,1.325,0,wood,rack);
  for(let shelf=0;shelf<5;shelf++){
   const y=.23+shelf*.51;
   e.box(6.4,.075,.7,0,y,0,wood,rack);
   e.round(6.42,.042,.045,0,y+.017,.35,e.mats.panel,rack);
   for(let i=0;i<32;i++)if((i+shelf*3)%13!==0){
    bottlePositions.push(rack.localToWorld(new T.Vector3(-3+i*.19,y+.0375,0)));
   }
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
   const palette=part===bottleParts[4]?[0xf7e9d4,0xdfd1b2,0xe8cba0,0xffffff]:
    part===bottleParts[3]?[0xffffff,0xd18263,0xc7956b,0x9c5b53]:[0xffffff,0xbec491,0xb9b298,0xeeeeaf];
   bottles.setColorAt(i,new T.Color(palette[i%palette.length]));
  }
  bottles.receiveShadow=true;bottles.instanceMatrix.needsUpdate=true;e.scene.add(bottles);
 }
 for(const x of [-9.7,-8.2,-6.7]){
  const z=-5.25;
  solid(1.14,1.14,x,z);
  const barrel=new T.LatheGeometry([new T.Vector2(.435,0),new T.Vector2(.46,.08),new T.Vector2(.51,.32),new T.Vector2(.53,.52),new T.Vector2(.51,.74),new T.Vector2(.46,.96),new T.Vector2(.435,1.04)],30);
  const body=new T.Mesh(barrel,wood);body.position.set(x,CELLAR_FLOOR,z);body.castShadow=true;body.receiveShadow=true;e.scene.add(body);
  for(const [y,r] of [[.115,.47],[.3,.514],[.74,.517],[.925,.471]])e.cyl(r,r,.05,x,CELLAR_FLOOR+y,z,iron,e.scene,30);
  e.cyl(.439,.439,.045,x,CELLAR_FLOOR+1.018,z,e.mats.panel,e.scene,30);
  for(const dx of [-.21,-.07,.07,.21])e.box(.009,.005,.77,x+dx,CELLAR_FLOOR+1.043,z,iron);
  e.cyl(.043,.043,.023,x,CELLAR_FLOOR+1.052,z,brass);
 }
 for(const [x,z] of [[8.8,-11.95],[9.3,-7],[5.2,-4.2],[8.4,-4.2]]){
  solid(1.45,1.1,x,z);
  for(let i=0;i<2;i++){
   const y=.34+i*.69;
   item(1.42,.67,1.06,x,y,z,crate);
   for(const dx of [-.58,.58])item(.095,.67,1.12,x+dx,y,z,wood);
   item(1.46,.06,1.12,x,y+.33,z,wood);
  }
 }
 const claret=new T.Group();claret.position.set(-9.7,CELLAR_FLOOR+1.05,-5.25);e.scene.add(claret);
 for(const [top,bottom,h,y,mat] of [[.069,.073,.25,.125,e.mats.dark],[.031,.069,.072,.286,e.mats.dark],[.029,.03,.087,.362,e.mats.dark],[.073,.073,.09,.136,e.mats.paper]] as const)e.cyl(top,bottom,h,0,y,0,mat,claret,12);
 e.target(claret,'wine-bottle','Cellared claret','Inspect');
 const marked=new T.Group();marked.position.set(9.7,CELLAR_FLOOR+.28,-16);e.scene.add(marked);
 e.box(.96,.56,.64,0,0,0,wood,marked);e.box(1,.052,.68,0,.28,0,crate,marked);
 const mark=e.paper('BW–12',['Blankets','Wireless batteries'],0,.28,0,false,marked);mark.scale.setScalar(.62);
 solid(.96,.64,9.7,-16);e.target(marked,'shelter-crate','Marked supply crate','Inspect');
 // The shelter has canvas cots, a radio desk and supply lockers.
 for(const x of [6.2,9.1]){
  solid(2.6,1.05,x,-18.2);
  item(2.6,.15,1.04,x,.57,-18.2,iron);
  item(2.47,.14,.94,x,.71,-18.2,canvas);
  item(.55,.12,.8,x-.88,.84,-18.2,e.mats.cream);
  for(const dx of [-1.15,1.15])for(const dz of [-.39,.39])item(.075,.58,.075,x+dx,.29,-18.2+dz,iron);
 }
 solid(2.4,.85,9.2,-14.4);
 item(2.4,.11,.85,9.2,.9,-14.4,wood);
 for(const dx of [-1,1])item(.095,.9,.62,9.2+dx,.45,-14.4,iron);
 item(.89,.52,.43,9.2,1.21,-14.5,iron);
 item(.75,.34,.04,9.2,1.23,-14.26,wood);
 for(const dx of [-.25,.25])e.cyl(.06,.06,.045,9.2+dx,CELLAR_FLOOR+1.15,-14.224,brass).rotation.x=Math.PI/2;
 const kettle=e.mat(0xc6c5ac,.42);
 item(.41,.025,.38,8.38,.962,-14.4,iron);
 e.sphere(.16,8.38,CELLAR_FLOOR+1.125,-14.4,kettle,e.scene,1,.82,.92);
 e.cyl(.045,.061,.023,8.38,CELLAR_FLOOR+1.264,-14.4,iron,e.scene,10);
 const handle=new T.Mesh(new T.TorusGeometry(.119,.012,6,15,Math.PI),iron);
 handle.position.set(8.38,CELLAR_FLOOR+1.146,-14.4);e.scene.add(handle);
 e.target(e.paper('SHELTER REGISTER',['All clear noted by June.','Blankets and spare batteries','Return kettle to the shelter.'],9.88,CELLAR_FLOOR+1.043,-14.26,true),'shelter-register','Shelter visitors’ register','Read');
 for(const x of[6.2,9.1])for(let i=0;i<3;i++)item(.6,.09,1,x+.55,.77+i*.074,-18.2,canvas);
 for(const x of [5.1,6.2]){
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
  fixedLight(x,y-.38,z,power*.38,8);
 };
 for(const [x,z,power] of [[0,-5,65],[0,-14.3,100],[-7,-8,110],[7,-8,90],[-9.6,-18.5,110],[-7.45,-15.65,74],[7.6,-16.8,82],[0,-19,115],[-14,-19.6,68],[-20,-19.6,56],[-26,-19.6,66]])light(x,z,power);
 for(let z=-24;z>tunnelEnd;z-=6)light(0,z,z>=-36?70:55);
 for(const room of annexes)light(room.side*5.65,room.z,94);
 const stairBulb=e.mat(0xffd98e);stairBulb.emissive.setHex(0xffb65b);stairBulb.emissiveIntensity=1.6;
 for(const stair of BULKHEADS){
  const z=stair.top+2.9*stair.direction,y=cellarStairHeight(stair,z)+1.05,x=stair.x+HALF-.23;
  for(const [dx,w,h,d,mat] of [[.155,.15,.26,.35,iron],[0,.18,.19,.28,stairBulb]] as const)
   e.box(w,h,d,x+dx,y,z,mat);
  fixedLight(x-.19,y,z,12,4.5);
 }
 for(let z=-21;z>tunnelEnd+1;z-=4){
  for(const side of [-1,1])if(!annexes.some(r=>r.side===side&&Math.abs(r.z-z)<annexDoor/2+.15))
   e.box(.16,3.7,.23,side*(tunnelHalf-.07),CELLAR_FLOOR+1.85,z,stone);
  e.box(3,.23,.23,0,CEILING-.11,z,stone);
 }

 const interior=new T.Group();interior.name='Cellar and garden tunnel';
 for(const object of [...e.scene.children])if(!existing.has(object))interior.add(object);
 e.updateCellarRats=buildCellarRats(interior,CELLAR_FLOOR);
 interior.visible=false;e.scene.add(interior);e.cellarInterior=interior;
 // Each metal leaf hinges along a long edge of the stone stairwell.
 const frame=e.mats.trim,paint=e.mat(0x292421,.73,.2);
 for(const s of BULKHEADS){
  const doors=new T.Group(),leaves:T.Group[]=[];
  doors.position.set(s.x,.29,s.top+s.direction*OPEN/2);
  doors.name=s.label;
  const depth=Math.abs(s.bottom-s.top),count=Math.ceil(depth/.255);
  for(let i=0;i<count;i++){
   const z=s.top+s.direction*(i+.5)*depth/count,y=cellarStairHeight(s,z);
   e.box(HALF*2,.18,depth/count+.003,s.x,y-.09,z,stone);
   e.box(HALF*2,.045,.055,s.x,y-.025,z-s.direction*(depth/count/2-.035),frame);
  }
  for(const side of [-1,1]){
   const edge=s.x+side*HALF;
   if(s.underpass){
    // Leave a walkable cross passage under the upper half of the hall steps.
    for(let i=0;i<count;i++){
     const z=s.top+s.direction*(i+.5)*depth/count,y=cellarStairHeight(s,z);
     e.box(.24,-y,depth/count+.002,edge,y/2,z,stone);
    }
   }else e.box(.24,4.7,depth,edge,-2.41,(s.top+s.bottom)/2,stone);
   e.box(.33,.42,OPEN+.18,edge,.12,s.top+s.direction*OPEN/2,frame);
   const wallTop=s.underpass?s.top+s.direction*4.35:s.top;
   e.cellarBarriers.push({x:edge,z:(wallTop+s.bottom)/2,w:.24,d:Math.abs(s.bottom-wallTop)});
   e.barrier(edge,s.top+s.direction*OPEN/2,.24,OPEN);
   const leaf=new T.Group();leaf.position.x=side*HALF;
   // Both leaves overlap at the center and seat inside the stone rim.
   e.box(.07,HALF+.024,OPEN+.08,-side*.012,(HALF+.024)/2,0,paint,leaf);
   for(const dz of [-1.48,0,1.48])e.box(.1,HALF-.08,.065,0,HALF/2,dz,iron,leaf);
   for(const y of [.035,HALF-.047])e.box(.11,.05,OPEN,0,y,0,iron,leaf);
   for(const face of [-1,1])e.box(.14,.12,.27,face*.068,HALF-.22,-s.direction*.83,brass,leaf);
   doors.add(leaf);leaves.push(leaf);
  }
  poseBulkhead(leaves,0);e.scene.add(doors);e.walls.push(doors);
  e.target(doors,'bulkhead:'+s.id,s.label,'Open / close');
  e.cellarDoors.set(s.id,{leaves,amount:0});
  const back=cellarOpeningEnd(s);
  for(const z of [s.top,back])e.box(3.3,.41,.15,s.x,.115,z,frame);
  e.barrier(s.x,back,3.3,.21);
  // Low roof over the buried part leaves headroom below the ground opening.
  if(!s.underpass)e.box(3.3,.24,depth-OPEN,s.x,-.29,(back+s.bottom)/2,stone);
 }
 e.cellarLighting=bakeCellarLighting(lamps);
 for(const object of e.scene.children)if(!existing.has(object))e.cellarLighting.apply(object);
}


export function buildWorkshopRack(e:Estate,z:number){
 const rack=new T.Group();rack.name='Cellar carpenter’s tool rack';rack.position.set(8.82,CELLAR_FLOOR,z);e.scene.add(rack);
 const painted=e.mat(0xb7baa0,.95),edge=e.mat(0x95754d,.94),handles=e.mat(0xba8652,.88);
 const steel=e.mat(0xa5aba4,.48,.55),forged=e.mat(0x626e6c,.65,.35),brass=e.mat(0xc5a36b,.6,.35);
 // Separate painted boards and a narrow timber frame break up the dark rectangle.
 for(let i=0;i<6;i++)e.box(.095,1.48,.58,0,1.84,-1.5+i*.6,painted,rack);
 for(const y of[1.08,2.6])e.box(.15,.07,3.75,-.025,y,0,edge,rack);
 for(const dz of[-1.84,1.84])e.box(.15,1.58,.065,-.025,1.84,dz,edge,rack);
 for(const dz of[-1.3,-.65,0,.65,1.3]){
  e.cyl(.015,.015,.10,-.105,2.12,dz,brass,rack,8).rotation.z=Math.PI/2;
  e.sphere(.023,-.16,2.12,dz,brass,rack);
 }
 // Two hammers: shaped steel heads with clearly contrasting wooden shafts.
 for(const dz of[-1.3,-.65]){
  e.cyl(.025,.032,.51,-.18,1.82,dz,handles,rack,10);
  e.round(.14,.12,.32,-.18,2.065,dz,steel,rack);
  e.box(.16,.135,.035,-.18,2.065,dz-.17,forged,rack);
 }
 // Open-ended spanner and a wood-handled screwdriver, rather than identical silhouettes.
 e.round(.055,.43,.06,-.18,1.84,0,steel,rack);
 e.box(.07,.05,.19,-.18,2.055,0,steel,rack);
 for(const dz of[-.079,.079])e.box(.07,.095,.036,-.18,2.105,dz,steel,rack);
 e.cyl(.035,.03,.20,-.18,1.65,.65,handles,rack,10);
 e.box(.018,.27,.018,-.18,1.88,.65,steel,rack);
 e.box(.018,.07,.037,-.18,2.045,.65,steel,rack);
 // Small hand saw with a toothed steel blade and an open wooden handle.
 const shape=new T.Shape();shape.moveTo(0,.34);shape.lineTo(.28,.27);shape.lineTo(.28,0);
 for(let i=7;i>=0;i--){shape.lineTo(i*.035,.025);shape.lineTo(i*.035-.017,0);}shape.lineTo(0,.34);
 const blade=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.013,bevelEnabled:false}),steel);blade.rotation.y=-Math.PI/2;blade.position.set(-.18,1.47,1.13);rack.add(blade);
 for(const dz of[1.16,1.38])e.round(.055,.23,.045,-.18,1.94,dz,handles,rack);
 for(const y of[1.84,2.04])e.round(.055,.045,.26,-.18,y,1.27,handles,rack);
 for(const dz of[-1.72,1.72])for(const y of[1.22,2.45])e.sphere(.019,-.06,y,dz,forged,rack);
 return rack;
}
