import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {Estate} from './world';

export function flowerBorders(e:Estate){
 const beds=[
  ...Array.from({length:6},(_,i)=>({x:-16+i*6,z:-40,w:3.65,d:1.68,n:40,palette:i%2?[0xf4dfc3,0xb44b62,0xd5818f]:[0xf3d49b,0xb9a1dc,0x8062ae]})),
  ...[-1,1].flatMap(side=>[
   {x:side*12,z:-29,w:1.67,d:7.6,n:66,palette:[0xf0d6cb,0xaf626f,0xdfac67]},
   {x:side*14,z:24,w:15.8,d:3.25,n:85,palette:[0xe3b171,0xf6e2bc,0xaf727b]}
  ])
 ];
 const count=beds.reduce((n,b)=>n+b.n,0),petals:T.BufferGeometry[]=[];
 for(let i=0;i<5;i++){
  const a=i*Math.PI*2/5;
  petals.push(new T.SphereGeometry(1,6,3).scale(.038,.013,.023).rotateY(-a).translate(Math.cos(a)*.039,.022,Math.sin(a)*.039));
 }
 const bloom=new T.InstancedMesh(mergeGeometries(petals)!,e.mat(0xffffff,.92),count);
 petals.forEach(g=>g.dispose());
 const centers=new T.InstancedMesh(new T.SphereGeometry(.022,7,4),e.mat(0xc38a36,.88),count);
 const stemParts=[
  new T.CylinderGeometry(.005,.009,1,5).translate(0,.5,0),
  new T.SphereGeometry(1,6,4).scale(.067,.035,.02).rotateZ(.6).translate(.048,.46,0),
  new T.SphereGeometry(1,6,4).scale(.064,.033,.02).rotateZ(-.55).translate(-.045,.68,0)
 ];
 const greens=new T.InstancedMesh(mergeGeometries(stemParts)!,e.mat(0xffffff,.91),count);
 stemParts.forEach(g=>g.dispose());
 let seed=82177,index=0;
 const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const pose=new T.Object3D(),color=new T.Color();
 for(const bed of beds)for(let i=0;i<bed.n;i++){
  const x=bed.x+(rand()-.5)*bed.w,z=bed.z+(rand()-.5)*bed.d,y=e.groundHeight(x,z)-.008,h=.18+rand()*.32,s=.65+rand()*.65;
  pose.position.set(x,y,z);pose.scale.set(s,h,s);pose.rotation.set(0,rand()*Math.PI*2,0);pose.updateMatrix();
  greens.setMatrixAt(index,pose.matrix);greens.setColorAt(index,color.setHSL(.19+rand()*.08,.35,.21+rand()*.11));
  pose.position.y=y+h;pose.scale.setScalar(s);pose.updateMatrix();
  bloom.setMatrixAt(index,pose.matrix);centers.setMatrixAt(index,pose.matrix);
  bloom.setColorAt(index,color.setHex(bed.palette[Math.floor(rand()*bed.palette.length)]).multiplyScalar(.83+rand()*.17));
  index++;
 }
 bloom.name='Garden flower borders';e.scene.add(greens,bloom,centers);
}

export const ORCHARD=Array.from({length:8},(_,i)=>({
 x:19+(i%4)*6,z:i<4?-58:-67,pear:i>=4,angle:i*2.4,scale:.86+(i%3)*.1
}));
export const ORCHARD_HEIGHT=4.7,ORCHARD_WIDTH=1.42;

export function orchardFruit(e:Estate,tree:T.Object3D){
 const points:T.Vector3[]=[];
 tree.updateMatrixWorld(true);
 tree.traverse(o=>{
  if(!(o instanceof T.Mesh)||Array.isArray(o.material)||!/branches/i.test(o.material.name))return;
  const attr=o.geometry.attributes.position,p=new T.Vector3();
  for(let i=0;i<attr.count;i+=4){
   p.fromBufferAttribute(attr,i).applyMatrix4(o.matrixWorld);
   if(p.y>ORCHARD_HEIGHT*.35&&p.y<ORCHARD_HEIGHT*.83&&Math.hypot(p.x,p.z)>.42&&points.every(q=>q.distanceToSquared(p)>.12))points.push(p.clone());
  }
 });
 if(!points.length)return;
 const poses=ORCHARD.flatMap(t=>points.slice(0,36).map((_,i)=>({
  ...t,point:points[(i*7+Math.round(t.angle*10))%points.length]
 })));
 const stem=new T.InstancedMesh(new T.CylinderGeometry(.004,.005,.075,5),e.mat(0x5c442b),poses.length);
 const matrix=new T.Matrix4(),xyz=new T.Vector3(),up=new T.Vector3(0,1,0),color=new T.Color();
 for(const pear of [false,true]){
  const profile=pear?[[.01,-.06],[.042,-.048],[.053,-.023],[.052,0],[.039,.027],[.023,.053],[.018,.063],[0,.068]]:
   [[0,-.046],[.035,-.047],[.053,-.029],[.06,0],[.052,.036],[.031,.05],[0,.043]];
  const row=poses.filter(p=>p.pear===pear);
  const fruit=new T.InstancedMesh(new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),10),e.mat(0xffffff,.55),row.length);
  fruit.name=pear?'Orchard pears':'Orchard apples';
  row.forEach(({x,z,angle,scale,point},i)=>{
   xyz.copy(point).multiply(new T.Vector3(scale*ORCHARD_WIDTH,scale,scale*ORCHARD_WIDTH)).applyAxisAngle(up,angle);
   xyz.add(new T.Vector3(x,e.groundHeight(x,z)-.035*scale,z));
   stem.setMatrixAt(i+(pear?poses.length-row.length:0),matrix.makeTranslation(xyz.x,xyz.y-.035,xyz.z));
   fruit.setMatrixAt(i,matrix.makeTranslation(xyz.x,xyz.y-.115,xyz.z));
   fruit.setColorAt(i,color.setHex((pear?[0xaeb852,0xc1ba65,0x869c47]:[0xb23631,0xd16a42,0x8e392c])[i%3]));
  });
  e.scene.add(fruit);
 }
 e.scene.add(stem);
}
