import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {Estate} from './world';

// Merge only a finished static prop, never a room or an animated hierarchy.
export function finishProp(root:T.Group){
 root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),groups=new Map<T.Material,T.Mesh[]>();
 root.traverse(o=>{if(!(o instanceof T.Mesh)||o instanceof T.SkinnedMesh||Array.isArray(o.material)||o.material.transparent)return;const list=groups.get(o.material)??[];list.push(o);groups.set(o.material,list)});
 for(const [material,meshes]of groups){if(meshes.length<2)continue;
  const parts=meshes.map(m=>{const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(inverse.clone().multiply(m.matrixWorld));g.deleteAttribute('uv1');g.deleteAttribute('tangent');return g});
  const geometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());if(!geometry)continue;
  const mesh=new T.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);meshes.forEach(m=>m.removeFromParent());
 }
 return root;
}

export function craftedTable(e:Estate,x:number,z:number,w:number,d:number,h:number,collision=true){
 const root=new T.Group();root.position.set(x,0,z);
 const wood=e.mats.panel,top=e.mats.wood,brass=e.mats.gold;
 const style=h<.86?'workbench':w>=3?'writing desk':d>=1.1?'dining table':'console table';root.name=style;
 const box=(ww:number,hh:number,dd:number,xx:number,y:number,zz:number,m:T.Material)=>e.box(ww,hh,dd,xx,y,zz,m,root);
 e.round(w+.04,.13,d+.04,0,h,0,top,root);box(w+.07,.035,d+.07,0,h+.075,0,wood);
 const drawer=(xx:number,y:number,ww:number)=>{
  e.round(ww,.21,.055,xx,y,d/2+.012,wood,root);box(ww-.1,.012,.014,xx,y+.07,d/2+.045,top);
  for(const dx of [-ww*.25,ww*.25]){e.cyl(.025,.025,.03,xx+dx,y,d/2+.05,brass,root,10).rotation.x=Math.PI/2;}
  const pull=new T.Mesh(new T.TorusGeometry(.031,.005,5,12,Math.PI),brass);pull.rotation.z=Math.PI;pull.position.set(xx,y,d/2+.075);root.add(pull);
 };
 if(style==='writing desk'){
  // Pedestals support the top, with a usable knee opening at the centre.
  for(const side of [-1,1]){
   const px=side*(w/2-.39);box(.64,h-.15,d-.13,px,(h-.15)/2+.025,0,wood);
   for(const y of [.2,.44,.68])drawer(px,y,.56);
   box(.72,.075,d-.06,px,.055,0,top);
  }
  drawer(0,h-.18,Math.max(.6,w-1.66));
  const leather=e.mats.leather??wood;box(w*.49,.012,d*.65,0,h+.1,-.035,leather);
  for(const side of [-1,1])box(w*.5,.009,.015,0,h+.109,side*d*.325-.035,brass);
 }else{
  for(const side of [-1,1])box(w-.2,.2,.055,0,h-.16,side*(d/2-.09),wood);
  if(style==='console table')drawer(0,h-.16,w-.36);
  for(const sx of [-1,1])for(const sz of [-1,1]){
   const px=sx*(w/2-.14),pz=sz*(d/2-.14),length=h-.19;
   if(style==='workbench')box(.095,length,.095,px,length/2,pz,wood);
   else{e.cyl(.047,.072,length,px,length/2,pz,top,root,12);for(const y of [.08,h-.23])e.cyl(.076,.076,.045,px,y,pz,wood,root,12);}
  }
  if(style==='workbench'){
   for(let i=0;i<5;i++)box(w-.22,.045,(d-.22)/5-.012,0,.22,-(d-.22)/2+(i+.5)*(d-.22)/5,wood);
   for(let i=1;i<5;i++)box(.008,.002,d-.09,-w/2+i*w/5,h+.096,0,wood);
  }
 }
 finishProp(root);e.scene.add(root);if(collision)e.barrier(x,z,w,d);return root;
}

export function secateurs(e:Estate){
 const root=new T.Group();root.name='Bypass secateurs';const steel=e.mats.dark,wood=e.mats.panel;
 for(const side of [-1,1]){
  const arm=new T.Group();arm.name=side<0?'shears-left':'shears-right';root.add(arm);
  e.cyl(.012,.014,.13,0,-.065,0,steel,arm,10);
  e.round(.036,.13,.027,0,-.17,0,wood,arm);
  const blade=new T.Shape();blade.moveTo(-.012,0);blade.quadraticCurveTo(-.06,.08,-.008,.14);blade.quadraticCurveTo(.014,.06,.017,0);blade.closePath();
  const mesh=new T.Mesh(new T.ExtrudeGeometry(blade,{depth:.006,bevelEnabled:false,curveSegments:10}),steel);mesh.position.z=-.003;arm.add(mesh);
  if(side>0)mesh.scale.x=-1;
 }
 e.cyl(.02,.02,.028,0,0,0,e.mats.gold,root,12).rotation.x=Math.PI/2;
 poseSecateurs(root,false);return root;
}
export function poseSecateurs(root:T.Object3D,closed:boolean){
 for(const side of [-1,1]){const arm=root.getObjectByName(side<0?'shears-left':'shears-right');if(arm)arm.rotation.z=side*(closed?.045:.28);}
}

export function shedTools(e:Estate,x:number,z:number){
 const root=new T.Group();root.name='Potting shed tool rack';root.position.set(x,0,z);e.scene.add(root);
 const wood=e.mats.panel,iron=e.mats.dark,brass=e.mats.gold;
 e.box(2.65,.17,.075,.9,1.93,-2.11,wood,root);
 for(const xx of [-.15,.55,1.25,1.95]){
  e.cyl(.025,.025,1.12,xx,1.13,-2.02,wood,root,12);
  e.cyl(.034,.034,.06,xx,1.7,-2.02,brass,root,10);
  e.box(.045,.05,.13,xx,1.94,-2.02,iron,root);
 }
 // Spade, four-tine fork, bow rake and hoe, hanging against the back wall.
 e.round(.23,.32,.04,-.15,.46,-2.02,iron,root);
 for(let i=0;i<4;i++)e.cyl(.012,.016,.3,.46+i*.06,.48,-2.02,iron,root,8);
 e.box(.24,.06,.04,.55,.66,-2.02,iron,root);
 e.box(.53,.055,.055,1.25,.64,-2.02,iron,root);
 for(let i=0;i<9;i++)e.box(.018,.13,.022,1.01+i*.06,.56,-2.02,iron,root);
 e.box(.32,.045,.13,1.95,.57,-2.02,iron,root);
 // Watering can with a curved carrying handle and long spout.
 e.cyl(.15,.17,.27,1.58,.7,-1.27,iron,root,20);
 e.cyl(.11,.15,.035,1.58,.853,-1.27,brass,root,16);
 const handle=new T.Mesh(new T.TorusGeometry(.17,.018,6,18,Math.PI),iron);handle.position.set(1.58,.82,-1.27);root.add(handle);
 const spout=e.cyl(.025,.045,.42,1.85,.77,-1.27,iron,root,12);spout.rotation.z=-1.02;
 e.cyl(.06,.035,.045,2.03,.88,-1.27,brass,root,14).rotation.z=-1.02;
 // Seed trays and labelled wooden drawers below the work surface.
 for(const xx of [-1.8,-1.15]){
  e.box(.52,.08,.38,xx,.33,-1.26,wood,root);
  for(const side of [-1,1])e.box(.52,.08,.025,xx,.41,-1.26+side*.18,wood,root);
  for(let i=0;i<4;i++)e.box(.012,.045,.34,xx-.2+i*.13,.38,-1.26,wood,root);
 }
 finishProp(root);
 const tool=secateurs(e);tool.position.set(x-.95,.932,z-1.28);tool.rotation.x=-Math.PI/2;tool.rotation.z=.3;e.scene.add(tool);
 e.target(tool,'shed-secateurs','Gardener’s secateurs','Inspect');
 const packet=e.paper('SEED SAVING',['APPLE & PEAR GRAFTS','Sharpen, clean and oil tools.','Return the secateurs after use.'],x+1.05,.512,z-1.25);packet.scale.setScalar(.55);e.target(packet,'shed-seeds','Gardener’s seed notes','Read');
}
