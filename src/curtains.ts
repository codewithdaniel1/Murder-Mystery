import * as T from 'three';
import type {Estate} from './world';
import {wovenFabric} from './detail';
import {finishProp} from './craftsmanship';

/** Local +Z faces into the room. The centre stays open for daylight and views. */
export function windowCurtains(e:Estate,x:number,y:number,z:number,w:number,h:number,rotation=0,floor=0,color=0x80765f,projection=.2){
 const root=new T.Group();root.name='Window curtains';root.position.set(x,y,z);root.rotation.y=rotation;
 const key='curtain-'+color,cloth=e.mats[key]??(e.mats[key]=wovenFabric(e,color));cloth.side=T.DoubleSide;
 const top=h/2+.14,bottom=floor-y+.045,length=top-bottom,outer=w/2+.22;
 const rod=e.cyl(.022,.022,w+.73,0,top+.075,projection,e.mats.gold,root,12);rod.rotation.z=Math.PI/2;
 for(const side of [-1,1]){
  const finial=new T.Mesh(new T.SphereGeometry(.047,10,8),e.mats.panel);finial.position.set(side*(w/2+.4),top+.075,projection);root.add(finial);
  e.box(.045,.07,projection+.035,side*(w/2+.26),top+.075,projection/2,e.mats.gold,root);
  const positions:number[]=[],uv:number[]=[],indices:number[]=[],nx=20,ny=26;
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
   const u=i/nx,v=j/ny,gather=Math.exp(-Math.pow((v-.63)/.18,2));
   const span=(w*.31+.12)*(1-.49*gather);
   const xx=side*(outer-u*span),yy=top-v*length-.014*Math.sin(u*Math.PI*8)*(v>.9?(v-.9)*10:0);
   const depth=projection+Math.cos(u*Math.PI*10)*(.035+.022*(1-gather))+.025*Math.sin(v*Math.PI);
   positions.push(xx,yy,depth);uv.push(u*2,v*3);
   if(i&&j){const a=j*(nx+1)+i,b=a-nx-1;indices.push(a-1,b-1,b,a-1,b,a);}
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  root.add(new T.Mesh(geometry,cloth));
  for(let i=0;i<6;i++){
   const ring=new T.Mesh(new T.TorusGeometry(.032,.005,5,10),e.mats.gold);ring.rotation.y=Math.PI/2;ring.position.set(side*(outer-i*(w*.31+.12)/5),top+.063,projection);root.add(ring);
  }
  const tieY=top-length*.63,span=(w*.31+.12)*.51;
  const curve=new T.CatmullRomCurve3([new T.Vector3(side*(outer+.025),tieY+.035,projection-.07),new T.Vector3(side*(outer-span*.5),tieY-.045,projection+.12),new T.Vector3(side*(outer-span-.02),tieY+.015,projection-.03)]);
  root.add(new T.Mesh(new T.TubeGeometry(curve,12,.012,5,false),e.mats.gold));
 }
 e.scene.add(finishProp(root));return root;
}
