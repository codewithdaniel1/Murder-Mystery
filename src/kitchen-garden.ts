import {gardenSurface,mergeGardenParts} from './garden-surfaces';
import * as T from 'three';
import type {Estate} from './world';

// Shared geometry and instancing keep the vegetable beds inexpensive to draw.
export function buildKitchenGarden(e:Estate){
 const soil=gardenSurface('soil',0x927856);soil.map!.repeat.set(3,7);
 const root=new T.Group();root.name='Lodge kitchen garden';e.scene.add(root);
 const cane=e.mat(0x80704d,1),twine=e.mat(0xb5a37c,1),stem=e.mat(0x405636,1);
 const shape=new T.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-.085,.025,-.12,.12,0,.25);shape.bezierCurveTo(.1,.12,.085,.025,0,0);
 const leafGeometry=new T.ShapeGeometry(shape,5),p=leafGeometry.attributes.position,colors:number[]=[];
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i);p.setZ(i,.024*Math.sin(y/.25*Math.PI)-Math.abs(x)*.28);
  const v=.65+.25*(y/.25)+(Math.abs(x)<.009?.1:0);colors.push(v*.86,v,v*.68);
 }
 leafGeometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));leafGeometry.computeVertexNormals();
 const leaves=new T.InstancedMesh(leafGeometry,new T.MeshStandardMaterial({color:0x58753a,roughness:.95,side:T.DoubleSide,vertexColors:true}),1000);
 leaves.name='Pointed climbing bean leaves';leaves.castShadow=false;leaves.receiveShadow=true;root.add(leaves);
 const pods=new T.InstancedMesh(new T.CapsuleGeometry(.014,.12,3,5),e.mat(0x668642,1),120);pods.name='Hanging bean pods';root.add(pods);
 const clods=new T.InstancedMesh(new T.IcosahedronGeometry(.04,0),e.mat(0x65503a,1),240);clods.name='Cultivated soil clods';root.add(clods);
 const dummy=new T.Object3D();let li=0,pi=0,ci=0;
 function leaf(x:number,y:number,z:number,angle:number,scale=1,tilt=.5){
  dummy.position.set(x,y,z);dummy.rotation.set(tilt,angle,.15*Math.sin(li*2.4));dummy.scale.setScalar(scale);dummy.updateMatrix();leaves.setMatrixAt(li++,dummy.matrix);
 }
 function rod(a:T.Vector3,b:T.Vector3,r:number,mat:T.Material){
  const mesh=e.cyl(r,r,a.distanceTo(b),0,0,0,mat,root,5);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());mesh.castShadow=false;
 }
 for(const x of[-16,-20.2,-24.4]){
  const base=e.groundHeight(x,-58);
  e.floor(2.95,.14,7,x,base+.015,-58,soil);
  for(const dx of[-1.45,1.45])e.box(.12,.21,7,x+dx,base+.06,-58,e.mats.wood,root);
  for(const dz of[-3.5,3.5])e.box(2.95,.21,.12,x,base+.06,-58+dz,e.mats.wood,root);
  rod(new T.Vector3(x,base+1.99,-61),new T.Vector3(x,base+1.99,-55),.028,cane);
  for(let j=0;j<5;j++){
   const z=-60.7+j*1.3;
   for(const side of[-1,1]){
    const foot=new T.Vector3(x+side*.7,base+.1,z),tip=new T.Vector3(x,base+1.99,z);
    rod(foot,tip,.018,cane);
    // A winding stem follows each cane instead of a stack of flat discs.
    const points:T.Vector3[]=[];
    for(let k=0;k<=16;k++){
     const t=k/16;points.push(new T.Vector3(x+side*.7*(1-t)+.027*Math.sin(t*24),base+.15+t*1.73,z+.027*Math.cos(t*24)));
    }
    const vine=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),20,.009,4,false),stem);root.add(vine);
    for(let k=0;k<6;k++){
     const t=.1+k*.145,vx=x+side*.7*(1-t),vy=base+.15+t*1.73,angle=k*2.4+side;
     for(const branch of[-1,1]){
      const end=new T.Vector3(vx+Math.sin(angle)*.1*branch,vy+.055,z+Math.cos(angle)*.1*branch);
      rod(new T.Vector3(vx,vy,z),end,.004,stem);
      leaf(end.x,end.y,end.z,angle+(branch<0?Math.PI:0),.68+.17*Math.sin(k+j),.7);
     }
     if(k===2||k===4){
      dummy.position.set(vx+.045,vy-.08,z+.04);dummy.rotation.set(.12,angle,.18);dummy.scale.setScalar(1);dummy.updateMatrix();pods.setMatrixAt(pi++,dummy.matrix);
     }
    }
   }
   const tie=new T.Mesh(new T.TorusGeometry(.045,.005,3,8),twine);tie.position.set(x,base+1.96,z);tie.rotation.x=.4;root.add(tie);
  }
  // Low salad rows beneath the beans, with visible furrows and irregular earth.
  for(const side of[-1,1])for(let j=0;j<8;j++){
   const z=-60.9+j*.81,vx=x+side*1.12;
   for(let k=0;k<6;k++)leaf(vx,base+.14,z,k*Math.PI/3,.62,.95);
  }
  for(let i=0;i<80;i++){
   dummy.position.set(x+Math.sin(i*14.13)*1.32,base+.095,-61.35+((i*.83)%6.7));dummy.rotation.set(i*.7,i,0);dummy.scale.set(1,.5,.7);dummy.updateMatrix();clods.setMatrixAt(ci++,dummy.matrix);
  }
 }
 mergeGardenParts(root);
 leaves.count=li;pods.count=pi;clods.count=ci;
 for(const mesh of[leaves,pods,clods]){mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}
}
