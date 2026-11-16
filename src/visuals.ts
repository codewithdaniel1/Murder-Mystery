import {wallSocket} from './detail';
import {GROUNDS} from './grounds';
import {cellarGroundOpenings,HALL_BULKHEAD} from './cellar';
import * as T from 'three';
import {BALCONY,buildUpstairs,STAIR,UPPER_FLOOR} from './upstairs';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {Estate} from './world';
const base=import.meta.env.BASE_URL;
const lodge={front:-54,back:-69,halfWidth:12,loop:-78};
const seeded=(()=>{let a=9102;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}})();

export function materials(e:Estate):Promise<unknown>[] {
 const pending:Promise<unknown>[]=[];
 const texture=(name:string,color=false)=>{let finish:()=>void=()=>{};pending.push(new Promise<void>(r=>finish=r));const tex=new T.TextureLoader().load(base+'materials/'+name,finish,undefined,()=>{console.warn('Material unavailable:',name);finish()});tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.anisotropy=Math.min(8,e.renderer.capabilities.getMaxAnisotropy());if(color)tex.colorSpace=T.SRGBColorSpace;return tex;};
 const pbr=(name:string,tint:number,normal=.5)=>new T.MeshStandardMaterial({map:texture(name+'-color.jpg',true),normalMap:texture(name+'-normal.jpg'),roughnessMap:texture(name+'-roughness.jpg'),normalScale:new T.Vector2(normal,normal),color:tint,roughness:1});
 e.mats.stone=pbr('ashlar',0xd7cfbb,.52);e.mats.stone.userData.masonryUV=true;e.mats.ashlar=pbr('ashlar',0xe3ded2,.38);e.mats.trim=e.mats.ashlar;
 e.mats.wood=pbr('oak',0x817365,.3);e.mats.panel=pbr('oak',0x8a7156,.16);e.mats.grass=pbr('lawn',0x91b879,.16);
 e.mats.gravel=pbr('gravel',0xc1bbac,.7);e.mats.slate=pbr('slate',0x8b9395,.65);e.mats.plaster=new T.MeshStandardMaterial({color:0xc9c5ad,roughness:.95,normalMap:texture('plaster-normal.jpg'),normalScale:new T.Vector2(.035,.035)});
 e.mats.leather=pbr('leather',0x483026,.3);e.mats.dark.color.setHex(0x242c28);e.mats.gold.color.setHex(0x9f8253);e.mats.gold.roughness=.45;
 e.mats.glass=new T.MeshPhysicalMaterial({color:0xc5d5d5,metalness:.1,roughness:.08,transparent:true,opacity:.18,side:T.DoubleSide,depthWrite:false,envMapIntensity:1.3});
 pending.push(new RGBELoader().loadAsync(base+'materials/estate-sky.hdr').then(hdr=>{hdr.mapping=T.EquirectangularReflectionMapping;e.scene.background=hdr;e.scene.backgroundIntensity=.75;e.scene.backgroundRotation.y=.5;const pm=new T.PMREMGenerator(e.renderer);const env=pm.fromEquirectangular(hdr);e.scene.environment=env.texture;e.scene.environmentIntensity=.42;pm.dispose();}).catch(err=>console.warn('Sky unavailable',err)));
 return pending;
}
function mesh(e:Estate,geo:T.BufferGeometry,mat:T.Material,x:number,y:number,z:number,parent:T.Object3D=e.scene){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function mould(e:Estate,w:number,h:number,d:number,x:number,y:number,z:number){for(const [a,b,c]of[[0,0,0],[.12,.07,.08],[.21,.16,.15]])e.box(w+a,h+b,d+c,x,y+b,z,e.mats.trim);}
function arch(e:Estate,x:number,y:number,z:number,r:number,depth:number,mat:T.Material,parent:T.Object3D=e.scene){const shape=new T.Shape();shape.absarc(0,0,r+.23,0,Math.PI,false);shape.lineTo(-r,0);shape.absarc(0,0,r,Math.PI,0,true);shape.closePath();return mesh(e,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.02,bevelThickness:.02,curveSegments:20}),mat,x,y,z,parent);}
function roof(e:Estate,x:number,y:number,z:number,w:number,d:number,h:number){
 const pts=[-w/2,0,-d/2, w/2,0,-d/2, w/2-3,h,0, -w/2+3,h,0, -w/2,0,d/2,w/2,0,d/2];
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.setIndex([0,3,2,0,2,1,4,5,2,4,2,3,0,4,3,1,2,5]);const uv=[0,0,w/2,0,w/2-1.5,h/2,1.5,h/2,0,0,w/2,0];g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();const m=mesh(e,g,e.mats.slate,x,y,z);m.material=e.mats.slate.clone();(m.material as T.MeshStandardMaterial).side=T.DoubleSide;
 e.box(w-5,.16,.2,x,y+h,z,e.mats.dark);
}
function windowDetail(e:Estate,x:number,y:number,z:number,w=1.8,h=2.4,solid:boolean|null=false,parent:T.Object3D=e.scene){
 const trim=e.mats.trim,dark=e.mats.dark;const box=(a:number,b:number,c:number,xx:number,yy:number,zz:number,mat:T.Material)=>e.box(a,b,c,xx,yy,zz,mat,parent);
 if(solid)box(w,h,.055,x,y,z-.04,e.mat(0x172b2b,.25,.15));
 for(const side of[-1,1]){box(.19,h+.28,.3,x+side*(w/2+.09),y,z,trim);box(.055,h,.09,x+side*(w/2-.03),y,z+.08,dark);}
 box(w+.55,.14,.55,x,y-h/2-.07,z+.06,trim);box(w+.4,.18,.35,x,y+h/2+.08,z,trim);
 box(.065,h,.08,x,y,z+.08,dark);for(const off of[-h/6,h/6])box(w,.045,.08,x,y+off,z+.08,dark);
 if(solid===false)box(w,h,.03,x,y,z,e.mats.glass);
 for(const side of[-1,1])box(.045,h,.07,x+side*w/4,y,z+.085,dark);
}
export function landscape(e:Estate){
 const holes=cellarGroundOpenings();
 const edgeOfTerrain=GROUNDS.terrainEdge;
 const xs=[-edgeOfTerrain,...holes.flatMap(h=>[h.left,h.right]).sort((a,b)=>a-b),edgeOfTerrain];
 for(let i=0;i<xs.length-1;i++){
  const a=xs[i],b=xs[i+1],x=(a+b)/2;
  let edge=-edgeOfTerrain;
  for(const hole of holes.filter(h=>x>h.left&&x<h.right).sort((a,b)=>a.near-b.near)){
   if(hole.near>edge)e.box(b-a,.2,hole.near-edge,x,-.18,(edge+hole.near)/2,e.mats.grass,e.scene,false);
   edge=Math.max(edge,hole.far);
  }
  e.box(b-a,.2,edgeOfTerrain-edge,x,-.18,(edge+edgeOfTerrain)/2,e.mats.grass,e.scene,false);
 }
 // A compacted-earth approach keeps the entrance court from reading as a bed
 // of coarse stone. Fine, low-contrast grain breaks up the surface at a distance.
 const earthCanvas=document.createElement('canvas');earthCanvas.width=earthCanvas.height=512;
 const earthContext=earthCanvas.getContext('2d')!;earthContext.fillStyle='#87775e';earthContext.fillRect(0,0,512,512);
 for(let i=0;i<18000;i++){const shade=seeded()<.5?'#60513f':'#b1a083';earthContext.globalAlpha=.035+seeded()*.075;earthContext.fillStyle=shade;const r=.4+seeded()*1.6;earthContext.beginPath();earthContext.ellipse(seeded()*512,seeded()*512,r,r*(.4+seeded()),seeded()*Math.PI,0,Math.PI*2);earthContext.fill();}
 earthContext.globalAlpha=1;const earthTexture=new T.CanvasTexture(earthCanvas);earthTexture.wrapS=earthTexture.wrapT=T.RepeatWrapping;earthTexture.colorSpace=T.SRGBColorSpace;earthTexture.anisotropy=Math.min(4,e.renderer.capabilities.getMaxAnisotropy());
 const drive=new T.MeshStandardMaterial({map:earthTexture,color:0xe4d9c5,roughness:.98});
 // Stop the approach at the outside face of the mansion. The previous road
 // slab extended through the doorway and covered part of the interior floor.
 e.floor(8,.025,72.5,0,-.055,48.25,drive);e.floor(48,.025,8,0,-.05,17,drive);
 // A walk beyond the gate branches around both sides of the house and garden.
 const path=e.mats.gravel;
 e.floor(3.4,.02,11.9,0,-.085,90.45,path);
 for(const x of[-66,66])e.floor(3.4,.02,94.3-lodge.loop+3.4,x,-.085,(94.3+lodge.loop)/2,path);
 for(const z of[lodge.loop,94.3])e.floor(128.6,.02,3.4,0,-.085,z,path);
 for(const x of[-4.2,4.2])e.box(.19,.09,60,x,-.01,45,e.mats.trim);
 for(const z of[12.8,21.2])for(const x of[-14,14])e.box(19,.09,.18,x,-.01,z,e.mats.trim);
 // Fine iron boundary railings with stone gate piers.
 for(const x of[-8.8,8.8]){e.barrier(x,40,.09,32);for(let z=24;z<56;z+=.55){e.cyl(.018,.018,1.12,x,.56,z,e.mats.dark,e.scene,6);mesh(e,new T.ConeGeometry(.045,.12,5),e.mats.dark,x,1.17,z);}for(const y of[.3,.91])e.box(.045,.045,32,x,y,40,e.mats.dark);}
 for(const x of[-5.7,5.7]){e.barrier(x,49,.95,.95);e.box(.95,2.1,.95,x,1.05,49,e.mats.stone);mould(e,1,.08,1,x,2.15,49);e.cyl(.17,.3,.45,x,2.46,49,e.mats.trim,e.scene,24);e.sphere(.18,x,2.77,49,e.mats.trim);}
 // Defined planting beds anchor foliage to the landscape, instead of random blades.
 const soil=e.mat(0x463e2d);for(const side of[-1,1]){
 e.floor(17,.06,4,side*14,-.07,24,soil);
 for(const z of[21.9,26.1])e.box(17.2,.13,.12,side*14,-.015,z,e.mats.trim);
 for(const x of[side*14-8.6,side*14+8.6])e.box(.12,.13,4.3,x,-.015,24,e.mats.trim);
 // Keep the fountain beds above the lawn while leaving both cross paths clear.
 e.floor(2,.22,8.2,side*12,.02,-29,soil);
 for(const x of[side*12-1.04,side*12+1.04])e.box(.12,.25,8.2,x,.04,-29,e.mats.trim);
 for(const z of[-33.1,-24.9])e.box(2.2,.25,.12,side*12,.04,z,e.mats.trim);
 }

}

function woodland(){
 // Give the detailed models space, with clearings between clusters.
 let seed=89173;
 const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const trees:PlantPose[]=[],scrub:PlantPose[]=[];
 for(let z=-174;z<=183;z+=21)for(let x=-177;x<=177;x+=21){
  const xx=x+(rand()-.5)*12,zz=z+(rand()-.5)*12;
  if(Math.abs(xx)<51&&zz>-53&&zz<61)continue;
  if(Math.abs(xx)<6&&zz>=55&&zz<98)continue;
  if(Math.abs(Math.abs(xx)-66)<4&&zz>lodge.loop-5&&zz<99)continue;
  if((Math.abs(zz-lodge.loop)<4||Math.abs(zz-94.3)<4)&&Math.abs(xx)<70)continue;
  if(Math.abs(xx)<lodge.halfWidth+6&&zz>lodge.loop-3&&zz<lodge.front+6)continue;
  if(Math.hypot(xx-98,zz-48)<21||Math.hypot(xx+99,zz+75)<23||rand()<.29)continue;
  trees.push([xx,zz,.73+rand()*.52,rand()*Math.PI*2]);
  if(rand()>.25)scrub.push([xx+(rand()-.5)*1.6,zz+(rand()-.5)*1.6,.75+rand()*.5,rand()*Math.PI*2]);
 }
 return {trees,scrub};
}
export function buildGardenLodge(e:Estate){
 const {front,back,halfWidth,loop}=lodge,mid=(front+back)/2,depth=front-back;
 const {stone,trim,wood,panel,slate,gravel,gold}=e.mats;
 // Garden paths meet at the front door, well clear of the flower beds.
 for(const x of[-7,5]){
  e.floor(1.8,.04,17,x,-.032,-43.5,gravel);
  e.floor(Math.abs(x),.04,3,x/2,-.032,-52,gravel);
 }
 e.floor(5.35,.04,3,-5.175,-.032,-35,gravel);
 const hatch=cellarGroundOpenings()[1],courtBack=hatch.near-.6,courtFront=hatch.far+.55;
 for(const x of[-3.1,3.1])e.floor(1.65,.04,back-courtBack,x,-.043,(back+courtBack)/2,gravel);
 e.floor(4.55,.04,back-courtFront,0,-.043,(back+courtFront)/2,gravel);
 e.floor(4.55,.04,courtBack-loop-1.7,0,-.043,(courtBack+loop+1.7)/2,gravel);
 e.floor(24,.16,depth,0,-.005,mid,wood);
 const h=4.1,opening=3,doorH=2.8;
 for(const [z,id,yaw] of [[front,'lodge-front',Math.PI],[back,'lodge-rear',0]] as const){
  for(const side of[-1,1]){
   const wy=2.08,ww=1.32,wh=1.95,low=wy-wh/2,high=wy+wh/2;
   let edge=opening/2;
   for(const center of[5.4,9.3]){
    const left=center-ww/2,right=center+ww/2,wx=side*center;
    e.wall(left-edge,h,.48,side*(edge+left)/2,h/2,z,stone);
    e.wall(ww,low,.48,wx,low/2,z,stone);
    e.wall(ww,h-high,.48,wx,(h+high)/2,z,stone);
    e.wall(ww,wh,.04,wx,wy,z,e.mats.glass);
    for(const face of[-1,1]){
     const frame=new T.Group();frame.position.set(wx,wy,z+face*.245);frame.rotation.y=face>0?0:Math.PI;e.scene.add(frame);
     windowDetail(e,0,0,0,ww,wh,null,frame);
    }
    edge=right;
   }
   e.wall(halfWidth-edge,h,.48,side*(edge+halfWidth)/2,h/2,z,stone);
   e.box(.29,h,.17,side*1.62,h/2,z+(z===front?.27:-.27),trim);
  }
  e.wall(opening,h-doorH,.48,0,(h+doorH)/2,z,stone);
  const hinge=yaw===0?-opening/2:opening/2;
  e.addDoor(id,hinge,z,yaw,false,.075,opening,doorH-.075,z===front?'Garden lodge entrance':'Garden lodge rear door');
  mould(e,3.65,.13,.69,0,doorH+.13,z);
 }
 for(const x of[-halfWidth,halfWidth])e.wall(.48,h,depth,x,h/2,mid,stone);
 const eaves=4.15;
 roof(e,0,eaves,mid,25,depth+1.1,2.5);
 e.box(24,.18,depth,0,4.01,mid,e.mats.plaster);
 for(const z of[front,back])e.box(24.8,.22,.7,0,4.13,z,trim);
 for(const x of[-7.7,7.7]){
  e.box(.94,2.3,.86,x,5.65,mid,stone);
  mould(e,1,.13,1,x,6.81,mid);
  // Interior partitions leave a wide opening from the central hall to each room.
  const divider=Math.sign(x)*3.3;
  for(const dz of[-5,5])e.wall(.24,3.9,5,divider,2,mid+dz,e.mats.plaster);
  e.wall(.24,1.1,5,divider,3.5,mid,e.mats.plaster);
  if(x<0){
   e.table(x,mid,1.7,1,.54);e.lamp(x,.64,mid);
   const fabric=e.mats.leather??e.mats.red;
   for(const z of[mid-2.6,mid+2.6]){
    const g=new T.Group(),side=Math.sign(z-mid);e.scene.add(g);
    e.round(2.65,.18,.79,x,.48,z,fabric,g);
    e.round(2.65,.64,.22,x,.79,z+side*.31,fabric,g);
    for(const dx of[-1.23,1.23]){
     e.round(.21,.25,.77,x+dx,.64,z,fabric,g);
     e.box(.15,.32,.57,x+dx,.24,z,wood,g);
    }
    e.barrier(x,z,2.65,.83);
   }
  }else{
   e.table(x,mid,2.8,1.3);
   for(const dx of[-.73,.73])for(const dz of[-1.27,1.27]){
    e.box(.48,.1,.47,x+dx,.49,mid+dz,wood);
    e.box(.48,.53,.1,x+dx,.76,mid+dz+Math.sign(dz)*.2,panel);
    for(const ax of[-.17,.17])for(const az of[-.17,.17])e.box(.065,.47,.065,x+dx+ax,.235,mid+dz+az,wood);
    e.barrier(x+dx,mid+dz,.48,.49);
   }
  }
  for(const z of[front-2,back+2]){
   e.box(3,.15,.65,x,.47,z,panel);
   e.box(3,.54,.16,x,.79,z+Math.sign(z-mid)*.26,wood);
   for(const dx of[-1.15,1.15])e.box(.16,.45,.53,x+dx,.26,z,wood);
   e.barrier(x,z,3,.65);
  }
  if(x>0)e.box(2.45,.015,.31,x,1.035,mid,slate);
 }
 const light=new T.PointLight(0xffdb9e,26,12);light.position.set(0,3.35,mid);e.scene.add(light);
 e.cyl(.028,.028,.42,0,3.73,mid,gold);
 e.cyl(.12,.37,.17,0,3.47,mid,gold);
 e.sphere(.115,0,3.36,mid,e.mats.cream);
}
export function castle(e:Estate){
 const {stone,trim}=e.mats;
 const hallHole=cellarGroundOpenings()[2];
 for(const [x0,x1,z0,z1] of [
  [-21,hallHole.left,-16,12],[hallHole.right,21,-16,12],
  [hallHole.left,hallHole.right,-16,hallHole.near],
  [hallHole.left,hallHole.right,HALL_BULKHEAD.top,12]
 ])e.floor(x1-x0,.15,z1-z0,(x0+x1)/2,0,(z0+z1)/2,stone);
 e.wall(19.2,1,.6,-11.4,.5,12);e.wall(19.2,1,.6,11.4,.5,12);e.wall(42,1,.65,0,4.35,12);e.wall(3.6,1.4,.65,0,4.1,12);
 const cuts=[-21,-18,-16,-12,-10,-1.8,1.8,10,12,16,18,21];for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1],mid=(a+b)/2;if(Math.abs(mid)<1.81||[-17,-11,11,17].some(x=>Math.abs(mid-x)<.1))continue;e.wall(b-a,2.85,.6,mid,2.425,12);}
 for(const x of[-17,-11,11,17])windowDetail(e,x,2.45,12.12,2,2.7);
 e.wall(.6,4.8,28,-21,2.4,-2);e.wall(.6,4.8,28,21,2.4,-2);e.wall(19.2,4.8,.6,-11.4,2.4,-16);e.wall(19.2,4.8,.6,11.4,2.4,-16);e.wall(3.6,1.4,.6,0,4.1,-16);
 for(const x of[-7,7]){e.wall(.32,4.8,13,x,2.4,-3.5,stone);e.wall(.32,4.8,5.5,x,2.4,9.25,stone);e.wall(.34,1.6,3.5,x,4,4.75,stone);e.addDoor(x<0?'study':'library',x,6.3,Math.PI/2);for(const z of[3.1,6.4])e.wall(.46,3.3,.2,x,1.65,z,e.mats.panel);}
 // Rear room connections are two deliberately framed 2.4m doorways.
 for(const [x,w]of[[-15.7,10.6],[0,16],[15.7,10.6]])e.wall(w,4.8,.35,x,2.4,-10,stone);
 for(const x of[-9.2,9.2]){e.wall(2.4,1.6,.35,x,4,-10,stone);for(const dx of[-1.2,1.2])e.box(.14,3.25,.48,x+dx,1.625,-10,e.mats.panel);e.box(2.55,.16,.48,x,3.24,-10,e.mats.panel);}
 e.addDoor('front',-1.55,12,0,true);e.addDoor('rear',-1.55,-16,0,true);
 for(const z of[12,-16]){for(const x of[-1.675,1.675])e.wall(.25,3.4,.72,x,1.7,z,trim);e.wall(3.6,.18,.72,0,3.32,z,trim);}

 buildUpstairs(e);roof(e,0,8.72,-2,43.2,29.2,4.8);
 const bays=[-17,-11,-5,0,5,11,17],glass=e.mat(0xbacbd1,.2);
 glass.transparent=true;glass.opacity=.29;glass.depthWrite=false;glass.side=T.DoubleSide;
 for(const z of [12,-16]){
  if(z>0){
   const wing=(42-BALCONY.doorWidth)/2;
   for(const side of [-1,1])e.wall(wing,.525,.6,side*(BALCONY.doorWidth+wing)/2,5.3125,z,stone);
  }else e.wall(42,.525,.6,0,5.3125,z,stone);
  e.wall(42,.995,.6,0,8.2225,z,stone);
  let edge=-21;
  for(const x of bays){
   const balconyDoor=z>0&&x===0,half=balconyDoor?BALCONY.doorWidth/2:.725;
   const next=x-half;e.wall(next-edge,2.15,.6,(edge+next)/2,6.65,z,stone);edge=x+half;
   if(balconyDoor){
    e.addDoor('balcony',half,z,Math.PI,false,UPPER_FLOOR,BALCONY.doorWidth,2.66);
    continue;
   }
   const group=new T.Group();group.position.set(x,6.65,z+Math.sign(z)*.4);
   if(z<0)group.rotation.y=Math.PI;e.scene.add(group);
   windowDetail(e,0,0,.02,1.45,2.15,null,group);
   const pane=e.box(1.45,2.15,.035,x,6.65,z,glass,e.scene,false);e.walls.push(pane);
  }
  e.wall(21-edge,2.15,.6,(21+edge)/2,6.65,z,stone);
  const trimZ=z+Math.sign(z)*.4;
  // Keep the base trim on either side of the doorway.
  for(const x of [-11.4,11.4])mould(e,18.99,.09,.22,x,.23,trimZ);
  for(const y of [4.72,8.52])mould(e,42,.09,.22,0,y,trimZ);
 }
 // Stone quoins alternate at the corners, rather than oversized battlements.
 for(const x of[-20.9,20.9])for(const z of[-16.1,12.1])for(let i=0;i<18;i++)e.box(i%2?.7:1.1,.38,i%2?1.1:.7,x,.25+i*.46,z,trim);
 for(const x of[-21,21])for(const z of[-16,12]){
 e.cyl(2.8,2.92,11.5,x,5.75,z,stone,e.scene,40);e.barrier(x,z,5.7,5.7);
 for(const y of[.3,4.8,8.7,11.4])e.cyl(2.98,2.98,.18,x,y,z,trim,e.scene,40);
 const cone=mesh(e,new T.ConeGeometry(3.2,5.2,40),e.mats.slate,x,14.12,z);const uv=cone.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*7,uv.getY(i)*3);
 e.cyl(.055,.12,1,x,17.1,z,e.mats.dark,e.scene,10);e.sphere(.1,x,17.65,z,e.mats.gold);
 for(const yy of[2.5,6.7,10])for(const angle of[0,Math.PI/2,Math.PI,Math.PI*1.5]){const g=new T.Group();g.position.set(x+Math.sin(angle)*2.82,yy,z+Math.cos(angle)*2.82);g.rotation.y=angle;e.scene.add(g);windowDetail(e,0,0,0,.7,1.65,true,g);}
 }
 // Projecting portico, arched entrance and a small stone balcony.
 for(const x of[-2.7,2.7]){e.box(.7,.24,.7,x,.15,14.2,trim);e.cyl(.22,.27,3.25,x,1.9,14.2,trim,e.scene,24);for(const y of[.48,3.48])e.cyl(.34,.34,.18,x,y,14.2,trim,e.scene,24);e.barrier(x,14.2,.55,.55);}
 arch(e,0,1.7,14.1,2.35,.36,trim);e.box(6.2,.35,3.25,0,4.18,13.1,trim);mould(e,6.35,.12,3.4,0,4.4,13.1);
 const depth=BALCONY.front+.15-12,center=12+depth/2;
 e.walls.push(e.box(6.2,.6,depth,0,UPPER_FLOOR-.3,center,trim));
 const railY=UPPER_FLOOR+.93;
 for(const x of [-BALCONY.halfWidth,BALCONY.halfWidth]){
  e.box(.3,1.04,.3,x,UPPER_FLOOR+.52,BALCONY.front,trim);
  e.box(.22,.15,depth,x,railY,center,trim);
  for(let z=12.5;z<BALCONY.front-.15;z+=.42)e.cyl(.055,.08,.88,x,UPPER_FLOOR+.44,z,trim,e.scene,12);
  e.upperBarriers.push({x,z:center,w:.22,d:depth});
 }
 e.box(6,.15,.22,0,railY,BALCONY.front,trim);
 for(let x=-2.5;x<2.6;x+=.45)e.cyl(.055,.08,.88,x,UPPER_FLOOR+.44,BALCONY.front,trim,e.scene,12);
 e.upperBarriers.push({x:0,z:BALCONY.front,w:6,d:.22});

 // Chimney stacks, roof dormers and guttering.
 for(const x of[-13,13]){e.box(1.8,5.2,1.2,x,11.4,-3,stone);mould(e,2,.1,1.4,x,14,-3);for(const dx of[-.48,.48])e.cyl(.2,.22,.65,x+dx,14.45,-3,e.mat(0x6e4935),e.scene,16);}
 for(const x of[-13,-6,6,13]){e.box(1.85,1.6,.7,x,10,8.3,stone);windowDetail(e,x,10,8.72,1.1,1.25,true);roof(e,x,10.8,8.25,2.2,1.8,.85);}
 for(const z of[-16.7,12.7])e.cyl(.065,.065,42,0,8.6,z,e.mats.dark,e.scene,12).rotation.z=Math.PI/2;
 for(const x of[-18.8,18.8])e.cyl(.055,.055,8.5,x,4.25,12.52,e.mats.dark,e.scene,10);

}
function tube(e:Estate,points:T.Vector3[],r:number,mat:T.Material,parent:T.Object3D){return mesh(e,new T.TubeGeometry(new T.CatmullRomCurve3(points),20,r,7,false),mat,0,0,0,parent);}
export function interiorDetail(e:Estate){
 // Walnut trim and picture rails frame the exposed brick.
 const panel=e.mats.panel,paint=e.mat(0xd7d0bd,.9);
 for(const side of [-1,1])for(const z of [-6.1,.8,8.1])wallSocket(e,side*6.795,.46,z,-side*Math.PI/2);
 for(const x of[-20.64,-7.22,-6.78,6.78,7.22,20.64])for(let z=-8.8;z<11;z+=1.5){if(Math.abs(x)<8&&z>2.2&&z<7.1)continue;const toward=x<0?1:-1;const face=x+toward*.035;
 for(const zz of[-.64,.64])e.box(.05,1.4,.045,face+toward*.03,.8,z+zz,panel);for(const y of[.14,1.43,1.55,3.68,4.57])e.box(.12,y===1.55?.1:.06,1.5,face,y,z,y>3?paint:panel);
 }
 for(const x of[-14,0,14])for(let z=-7;z<=10;z+=5.5){
  if(x===0&&z>STAIR.top&&z<STAIR.bottom){
   const left=STAIR.x-STAIR.width/2,right=STAIR.x+STAIR.width/2;
   for(const [a,b] of [[-6.8,left],[right,6.8]])e.box(b-a,.14,.15,(a+b)/2,4.69,z,paint);
  }else e.box(13.6,.14,.15,x,4.69,z,paint);
  for(const dx of[-4.5,0,4.5])if(!(x===0&&dx===-4.5&&z>STAIR.top&&z-5.5<STAIR.bottom))e.box(.13,.14,5.5,x+dx,4.69,z-2.75,paint);
 }
 for(const z of[0,8]){
 const g=new T.Group();g.position.set(0,3.8,z);e.scene.add(g);e.cyl(.025,.025,1,0,.55,0,e.mats.gold,g,12);e.sphere(.11,0,0,0,e.mats.gold,g);
 for(let i=0;i<6;i++){const a=i*Math.PI/3,dx=Math.cos(a),dz=Math.sin(a);tube(e,[new T.Vector3(0,0,0),new T.Vector3(dx*.4,-.25,dz*.4),new T.Vector3(dx*.7,-.1,dz*.7),new T.Vector3(dx*.7,.12,dz*.7)],.018,e.mats.gold,g);e.cyl(.065,.065,.25,dx*.7,.23,dz*.7,e.mats.cream,g,12);const glow=new T.MeshStandardMaterial({color:0xffe3ac,emissive:0xffbd6e,emissiveIntensity:2});e.sphere(.045,dx*.7,.38,dz*.7,glow,g,.7,1.5,.7);}
 const lamp=new T.PointLight(0xffd9a0,45,14,2);lamp.position.copy(g.position);e.scene.add(lamp);
 }
 // Book spines, brass hardware, curtain rods, linen curtains and tiebacks.
 const linen=e.mat(0xa79579,.95);for(const x of[-17,-11,11,17]){e.cyl(.025,.025,3.1,x,3.98,11.48,e.mats.gold).rotation.z=Math.PI/2;for(const side of[-1,1])for(let i=0;i<7;i++){const xx=x+side*(1.12+i*.045);e.cyl(.06,.085,2.82,xx,2.45,11.45+Math.sin(i)*.035,linen,e.scene,9);}e.box(3,.22,.2,x,4.05,11.42,panel);}
 // Detailed fireplace mantel and hearth.
 e.box(.8,.1,3.4,-20.2,.16,4.5,e.mats.slate);for(const z of[3.12,5.88]){e.box(.9,1.9,.25,-20.15,1.12,z,paint);for(const y of[.3,1.9])e.box(1,.12,.38,-20.1,y,z,paint);}
 e.box(1.1,.18,3.7,-20.1,2.17,4.5,e.mats.panel);
 // Persian-style woven rugs are geometric textiles, with a clear border and medallion.
 const cv=document.createElement('canvas');cv.width=512;cv.height=1024;const c=cv.getContext('2d')!;c.fillStyle='#422526';c.fillRect(0,0,512,1024);for(let i=0;i<5;i++){c.strokeStyle=i%2?'#97805c':'#2a3833';c.lineWidth=5;c.strokeRect(12+i*9,12+i*9,488-i*18,1000-i*18);}for(let y=80;y<970;y+=72)for(let x=80;x<470;x+=72){c.save();c.translate(x,y);c.rotate(Math.PI/4);c.strokeStyle='#9b8969';c.lineWidth=2;c.strokeRect(-12,-12,24,24);c.strokeStyle='#6a785d';c.strokeRect(-7,-7,14,14);c.restore();}c.save();c.translate(256,512);c.rotate(Math.PI/4);c.fillStyle='#273d38';c.fillRect(-95,-95,190,190);c.strokeStyle='#bca573';c.lineWidth=9;c.strokeRect(-95,-95,190,190);c.restore();
 const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;const rug=new T.MeshStandardMaterial({map:tex,roughness:1});for(const [x,z,w,h]of[[0,1.95,3,15.1],[-15,3.5,4.2,5.4],[15,4,4,5]]){const m=mesh(e,new T.PlaneGeometry(w,h),rug,x,.081,z);e.surfaces.push({x,z,w,d:h,y:.081});m.rotation.x=-Math.PI/2;m.castShadow=false;}
}

export function normalized(source:T.Object3D,height:number,centerHorizontal=true){
 const content=source.clone(true);content.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(content,true),center=bounds.getCenter(new T.Vector3()),scale=height/bounds.getSize(new T.Vector3()).y;
 // Preserve the imported scene transform. Position the wrapper, not the GLTF root.
 const anchor=new T.Group();anchor.add(content);anchor.scale.setScalar(scale);anchor.position.set(centerHorizontal?-center.x*scale:0,-bounds.min.y*scale,centerHorizontal?-center.z*scale:0);const root=new T.Group();root.add(anchor);return root;
}
type PlantPose=[number,number,number,number];
function plantVariants(e:Estate,source:T.Object3D,positions:PlantPose[],height:number,rootDepth:number){
 // These GLBs contain a row of separate variants, not one continuous plant.
 // Seat each variant on the soil at its own location.
 source.children.forEach((variant,index)=>{
  const group=new T.Group();group.add(variant.clone(true));
  staticBatch(e,group,positions.filter((_,i)=>i%source.children.length===index),height,rootDepth);
 });
}
export function staticBatch(e:Estate,source:T.Object3D,positions:PlantPose[],height:number,rootDepth=.03,woodland=false){
 const openings=cellarGroundOpenings();
 positions=positions.filter(([x,z])=>!openings.some(h=>x>h.left-2&&x<h.right+2&&z>h.near-2&&z<h.far+2));
 if(!positions.length)return;
 const tiles=new Map<string,PlantPose[]>();
 for(const pose of positions){
  const [x,z]=pose,key=woodland?`${Math.floor(x/42)},${Math.floor(z/42)}`:'garden';
  if(!tiles.has(key))tiles.set(key,[]);
  tiles.get(key)!.push(pose);
 }
 // Share geometry across tiles so the renderer can skip offscreen stands.
 const model=normalized(source,height,height<=5);model.updateMatrixWorld(true);model.traverse(obj=>{if(!(obj instanceof T.Mesh))return;const geo=obj.geometry.clone();geo.applyMatrix4(obj.matrixWorld);const material=Array.isArray(obj.material)?obj.material.map(m=>m.clone()):obj.material.clone();for(const m of(Array.isArray(material)?material:[material])){if(m instanceof T.MeshStandardMaterial){m.envMapIntensity=.8;if(m.alphaTest>0){m.alphaTest=.25;m.alphaToCoverage=true;m.side=T.DoubleSide;}if(m.map)m.map.anisotropy=4;}}
 const matrix=new T.Matrix4(),q=new T.Quaternion();
 for(const tile of tiles.values()){
  const inst=new T.InstancedMesh(geo,material,tile.length);
  tile.forEach(([x,z,s,angle],i)=>{q.setFromAxisAngle(new T.Vector3(0,1,0),angle);matrix.compose(new T.Vector3(x,e.groundHeight(x,z)-rootDepth*s,z),q,new T.Vector3(s,s,s));inst.setMatrixAt(i,matrix);if(height>5)inst.setColorAt(i,new T.Color().setHSL(.16+(i%4)*.024,.15+(i%3)*.032,.72+(i%5)*.051))});
  inst.name='Grounded planting';inst.castShadow=!woodland;inst.receiveShadow=true;e.scene.add(inst);
 }
 });}
export async function sceneryAssets(e:Estate){const loader=new GLTFLoader(),outer=woodland();
 const load=async(name:string)=>{try{return (await loader.loadAsync(base+'models/'+name+'.glb')).scene}catch(err){console.warn('Scenery asset unavailable:',name,err);return null}};
 const shrub=await load('shrub');if(shrub){const positions:[number,number,number,number][]=[];for(const x of[-12,12])for(let z=-32.6;z<=-25.5;z+=1.15)positions.push([x,z,.65+seeded()*.2,seeded()*6.28]);for(const x of[-25.5,25.5])for(let z=-16;z<=12;z+=2.2)positions.push([x,z,1+seeded()*.4,seeded()*6.28]);for(const side of[-1,1])for(let i=0;i<35;i++)positions.push([side*(31+seeded()*25),-45+seeded()*100,1+seeded()*1.3,seeded()*6.28]);plantVariants(e,shrub,positions,1.2,.15);}
 const flower=await load('shrub-flowering');if(flower){const poses:[number,number,number,number][]=[];for(const side of[-1,1])for(let i=0;i<16;i++)poses.push([side*(7+seeded()*14),22+seeded()*4,.55+seeded()*.3,seeded()*6]);for(let x=-17;x<19;x+=2)poses.push([x,-40,.6,seeded()*6]);plantVariants(e,flower,poses,1.7,.12);}
 const fern=await load('fern');if(fern){const poses:PlantPose[]=[...outer.scrub];for(let i=0;i<35;i++)poses.push([(i%2?1:-1)*(25+seeded()*9),-20+seeded()*60,.6+seeded()*.5,seeded()*6]);plantVariants(e,fern,poses,.55,.075);}
 const tree=await load('garden-tree');if(tree){const poses:[number,number,number,number][]=[];
 for(const side of[-1,1])for(let z=-43;z<51;z+=10.5){const x=side*(33+(Math.round(z)%2?3:0));poses.push([x,z,.85+seeded()*.3,seeded()*6]);e.barrier(x,z,.7,.7);}
 for(let x=-42;x<=42;x+=9)poses.push([x,-49,.95+seeded()*.3,seeded()*6]);staticBatch(e,tree,poses,10);
 staticBatch(e,tree,outer.trees,10,.045,true);
 for(const [x,z,scale] of outer.trees)if(Math.abs(x)<GROUNDS.halfWidth&&z>GROUNDS.back&&z<GROUNDS.front)e.woodlandTrunks.push({x,z,w:.54*scale,d:.54*scale});
 }

 const chair=await load('armchair');if(chair)for(const [x,z,r]of[[-18,4,1.2],[12,7,-.5],[18,7,.5]]){const root=normalized(chair,1.1);root.position.set(x,.1,z);root.rotation.y=r;root.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true}});e.scene.add(root);e.barrier(x,z,.9,.9);}
}

// Merge opaque static detail by material, preserving all interactive objects and wall occluders.
export function batchDetail(e:Estate){const excluded=new Set<T.Object3D>(e.walls);for(const t of e.targets)t.root.traverse(o=>excluded.add(o));for(const a of e.actors.values())a.root.traverse(o=>excluded.add(o));e.car.traverse(o=>excluded.add(o));e.dog.traverse(o=>excluded.add(o));const groups=new Map<T.Material,T.Mesh[]>();
 e.scene.updateMatrixWorld(true);for(const child of [...e.scene.children]){if(!(child instanceof T.Mesh)||child instanceof T.InstancedMesh||excluded.has(child)||Array.isArray(child.material)||child.material.transparent)continue;const list=groups.get(child.material)??[];list.push(child);groups.set(child.material,list);}
 for(const [mat,meshes]of groups){if(meshes.length<8)continue;const geos=meshes.map(m=>{const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrixWorld);g.deleteAttribute('uv1');g.deleteAttribute('tangent');return g;});try{const combined=mergeGeometries(geos,false);if(combined){const m=new T.Mesh(combined,mat);m.castShadow=true;m.receiveShadow=true;e.scene.add(m);meshes.forEach(n=>e.scene.remove(n));}}finally{geos.forEach(g=>g.dispose())}}
}

export function grandfatherClock(e:Estate,x:number,z:number){
 const g=new T.Group();g.name='Bramblewick longcase clock';g.position.set(x,.075,z);e.scene.add(g);e.barrier(x,z,1.08,.7);
 const wood=e.mats.panel,gold=e.mats.gold,dark=e.mats.dark;
 const box=(w:number,h:number,d:number,xx:number,y:number,zz:number,m:T.Material)=>e.box(w,h,d,xx,y,zz,m,g);
 box(.82,1.73,.4,0,1.04,0,wood);box(1,.2,.62,0,.14,0,wood);
 for(const y of[.055,.25,1.86,2.63]){box(y>1.8?1.04:.94,.065,.58,0,y,.015,wood);box(y>1.8?1.07:.97,.025,.6,0,y+.035,.015,gold)}
 box(.56,1.27,.035,0,1.01,.224,dark);
 for(const xx of[-.325,.325])box(.035,1.4,.055,xx,1.02,.25,wood);
 const pendulum=new T.Group();pendulum.position.set(0,1.64,.27);g.add(pendulum);e.clockPendulum=pendulum;
 e.cyl(.012,.012,.98,0,-.49,0,gold,pendulum,12);const bob=e.cyl(.115,.115,.035,0,-1.02,0,gold,pendulum,32);bob.rotation.x=Math.PI/2;
 for(const xx of[-.16,.16]){e.cyl(.006,.006,.65,xx,1.23,.27,gold,g,8);e.cyl(.045,.045,.24,xx,.81,.27,gold,g,20)}
 const glass=new T.MeshPhysicalMaterial({color:0xb9d0c7,roughness:.12,transparent:true,opacity:.12,depthWrite:false});box(.55,1.26,.018,0,1.01,.32,glass);
 box(.91,.77,.47,0,2.23,0,wood);for(const side of[-1,1]){e.cyl(.035,.055,.72,side*.43,2.23,.29,gold,g,20);for(const y of[1.91,2.56])e.cyl(.065,.065,.04,side*.43,y,.29,gold,g,20)}
 const crown=new T.Shape();crown.moveTo(-.52,0);crown.lineTo(-.52,.07);crown.quadraticCurveTo(-.3,.1,0,.31);crown.quadraticCurveTo(.3,.1,.52,.07);crown.lineTo(.52,0);crown.closePath();mesh(e,new T.ExtrudeGeometry(crown,{depth:.5,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:2,steps:1}),wood,0,2.66,-.25,g);
 for(const xx of[-.47,0,.47]){e.cyl(.025,.045,.12,xx,xx===0?3.03:2.83,0,gold,g,16);e.sphere(.045,xx,xx===0?3.12:2.92,0,gold,g)}
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const c=canvas.getContext('2d')!;
 c.fillStyle='#e2d4ac';c.fillRect(0,0,1024,1024);c.translate(512,512);
 for(const r of[475,455,332]){c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.strokeStyle='#7b632b';c.lineWidth=r===475?13:3;c.stroke()}
 for(let i=0;i<60;i++){c.save();c.rotate(i*Math.PI/30);c.fillStyle='#292720';c.fillRect(i%5?-2:-4,-448,i%5?4:8,i%5?15:27);c.restore()}
 const numerals=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];c.font='64px Georgia';c.fillStyle='#292720';c.textAlign='center';c.textBaseline='middle';numerals.forEach((n,i)=>c.fillText(n,Math.sin(i*Math.PI/6)*385,-Math.cos(i*Math.PI/6)*385));
 c.font='italic 26px Georgia';c.fillText('Bramblewick',0,-125);c.font='22px Georgia';c.fillText('LONDON · 1896',0,155);
 const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const face=mesh(e,new T.CircleGeometry(.35,64),new T.MeshStandardMaterial({map:tex,roughness:.65}),0,2.23,.247,g);
 const bezel=mesh(e,new T.TorusGeometry(.36,.018,10,64),gold,0,2.23,.25,g);
 for(const [length,angle]of[[.21,-.9],[.285,2.4]]){const hand=new T.Group();hand.position.set(0,2.23,.272);hand.rotation.z=angle;g.add(hand);e.box(.016,length,.008,0,length/2,0,dark,hand);e.sphere(.016,0,length,0,dark,hand,.6,1,.3)}
 e.sphere(.025,0,2.23,.286,gold,g,1,1,.35);
 return {g,face,bezel};
}
