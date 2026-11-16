import * as T from 'three';
import type {Estate} from './world';
import {cellarGroundOpenings} from './cellar';

let weave:T.DataTexture|undefined;
export function wovenFabric(e:Estate,color:number){
 if(!weave){
  const n=64,pixels=new Uint8Array(n*n*4);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   const value=118+(x%4===0?27:0)+(y%4===0?25:0)+((x*31+y*17+x*y)%13);
   const i=(y*n+x)*4;pixels.set([value,value,value,255],i);
  }
  weave=new T.DataTexture(pixels,n,n);weave.wrapS=weave.wrapT=T.RepeatWrapping;
  weave.magFilter=T.LinearFilter;weave.minFilter=T.LinearMipmapLinearFilter;
  weave.repeat.set(2,2);weave.generateMipmaps=true;weave.needsUpdate=true;
 }
 const cloth=e.mat(color,.96);cloth.bumpMap=weave;cloth.bumpScale=.015;
 return cloth;
}

export function wallSocket(e:Estate,x:number,y:number,z:number,rotation:number){
 const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;
 e.round(.095,.17,.035,0,0,0,e.mats.dark,g);
 for(const dx of [-.018,.018])e.box(.012,.019,.008,dx,-.012,.021,e.mats.black,g);
 e.sphere(.012,0,.043,.023,e.mats.gold,g);
 e.scene.add(g);
}

export function gardenBench(e:Estate,x:number,z:number){
 const g=new T.Group();g.position.set(x,0,z);e.scene.add(g);
 const wood=e.mats.wood,edge=e.mats.panel,iron=e.mats.dark,bolt=e.mats.gold;
 e.barrier(x,z,2.8,.9);
 for(let j=0;j<5;j++)e.round(2.66,.058,.112,0,.55,-.254+j*.127,wood,g);
 for(let j=0;j<5;j++)e.round(2.66,.092,.055,0,.68+j*.102,-.29-j*.014,wood,g);
 for(const side of [-1,1]){
  const dx=side*1.03;
  for(const fore of [-.23,.23]){
   const leg=e.round(.085,.55,.095,dx,.27,fore,iron,g);leg.rotation.x=fore*.45;
   e.round(.13,.055,.18,dx,.031,fore,iron,g);
  }
  e.round(.095,.105,.65,dx,.49,0,iron,g);
  const upright=e.round(.083,.65,.084,dx,.82,-.34,iron,g);upright.rotation.x=-.12;
  const arm=e.round(.13,.062,.58,dx,.75,-.015,edge,g);arm.rotation.x=.025;
  e.round(.08,.22,.08,dx,.65,.19,iron,g);
  for(let j=0;j<5;j++){
   e.cyl(.016,.016,.006,dx,.583,-.254+j*.127,bolt,g,8);
   e.cyl(.012,.012,.008,dx,.68+j*.102,-.26-j*.014,bolt,g,8).rotation.x=Math.PI/2;
  }
 }
 e.round(2.18,.073,.074,0,.27,0,iron,g);
}

export function gardenGroundDetail(e:Estate){
 let state=329581;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
 const openings=cellarGroundOpenings();
 const clear=(x:number,z:number)=>e.groundHeight(x,z)<-.073&&
  !openings.some(h=>x>h.left-1&&x<h.right+1&&z>h.near-1&&z<h.far+1);
 const tuft=new T.BufferGeometry(),vertices:number[]=[];
 for(let i=0;i<5;i++){
  const a=i*2.399,r=.018+(i%2)*.023,x=Math.cos(a)*r,z=Math.sin(a)*r;
  const dx=Math.cos(a)*.017,dz=Math.sin(a)*.017;
  vertices.push(x-dz,0,z+dx,x+dz,0,z-dx,x+dx*2,.065+(i%3)*.025,z+dz*2);
 }
 tuft.setAttribute('position',new T.Float32BufferAttribute(vertices,3));tuft.computeVertexNormals();
 const matrix=new T.Matrix4(),dummy=new T.Object3D(),color=new T.Color();
 const patches=[[-17,-34,8,15],[17,-34,7,15],[-15,31,8,17],[15,31,8,17],[-30,-16,7,23],[30,-16,7,23],[0,-42,32,9]];
 const blades=new T.InstancedMesh(tuft,new T.MeshStandardMaterial({side:T.DoubleSide,roughness:1}),2100);
 let count=0;
 for(const [x,z,w,d] of patches)for(let i=0;i<360;i++){
  const px=x+(random()-.5)*w,pz=z+(random()-.5)*d;if(!clear(px,pz)||count===2100)continue;
  const s=.6+random()*.9;dummy.position.set(px,-.079,pz);dummy.rotation.y=random()*6.28;
  dummy.scale.set(s,s*.85,s);dummy.updateMatrix();blades.setMatrixAt(count,dummy.matrix);
  blades.setColorAt(count++,color.setHSL(.18+random()*.09,.25+random()*.23,.17+random()*.13));
 }
 blades.count=count;blades.receiveShadow=true;e.scene.add(blades);
 const leaf=new T.CircleGeometry(.065,5);leaf.rotateX(-Math.PI/2);leaf.scale(1.4,1,.6);
 const litter=new T.InstancedMesh(leaf,new T.MeshStandardMaterial({side:T.DoubleSide,roughness:1}),460);
 count=0;
 for(const side of [-1,1])for(let z=-43;z<51;z+=10.5)for(let i=0;i<24;i++){
  const angle=random()*6.28,r=.65+Math.sqrt(random())*2.65;
  const x=side*(33+(Math.round(z)%2?3:0))+Math.cos(angle)*r,pz=z+Math.sin(angle)*r;
  if(!clear(x,pz))continue;
  matrix.makeRotationY(angle).setPosition(x,-.074,pz);litter.setMatrixAt(count,matrix);
  litter.setColorAt(count++,color.setHSL(.075+random()*.08,.24+random()*.26,.19+random()*.18));
 }
 litter.count=count;litter.receiveShadow=true;e.scene.add(litter);
}
