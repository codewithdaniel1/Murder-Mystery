import * as T from 'three';
import type {PersonId} from './state';
type Hat = 'beret'|'cap'|'housekeeper';
type Costume = {model:string;coat:number;hair:number;hat?:Hat;glasses?:boolean;skirt?:number;blouse?:number;trousers?:number;apron?:boolean};

// Bramblewick is set in 1942. The shared source figures have contemporary
// garments, so these costumes add a period silhouette to their existing rigs.
export const CAST:Record<PersonId,Costume>={
 june:{model:'harper',coat:0x596458,hair:0x9a9485,hat:'housekeeper',skirt:0x434c43,apron:true},
 mara:{model:'harper',coat:0x786b59,hair:0x554438,glasses:true,skirt:0x635a4e},
 ada:{model:'maya',coat:0x506574,hair:0x30241d,blouse:0xc5bca5,skirt:0x435463},
 beatrice:{model:'harper',coat:0x684d56,hair:0x483b35,hat:'beret',skirt:0x5b4149},
 rook:{model:'jordan',coat:0x514b52,hair:0x34302b,glasses:true},
 tomas:{model:'sam',coat:0xb09b7a,hair:0x8f897c,trousers:0x414743},
 jonah:{model:'jordan',coat:0x354653,hair:0x28231f,hat:'cap'}
};

// Built in the source mesh's bind-pose coordinates, using its existing bones.
// The small thigh influence gives the hem a little movement during each step.
function skirtGeometry(outfit:T.SkinnedMesh,modelName:string,frontOnly=false){
 const maya=modelName==='maya',top=maya?1.01:.89,bottom=maya?.32:.34;
 const rings=frontOnly?[
  {y:top-.015,x:.19,z:.155},{y:top-.17,x:.238,z:.195},{y:bottom+.045,x:.305,z:.246}
 ]:[
  {y:top,x:maya?.16:.19,z:maya?.135:.15},{y:top-.12,x:maya?.19:.225,z:maya?.18:.175},{y:top-.29,x:maya?.255:.263,z:maya?.255:.205},{y:bottom,x:maya?.32:.305,z:maya?.35:.237}
 ];
 const segments=frontOnly?20:48,start=frontOnly?-1.04:0,end=frontOnly?1.04:Math.PI*2;
 const positions:number[]=[],uvs:number[]=[],indices:number[]=[],skinIndices:number[]=[],skinWeights:number[]=[];
 const pelvis=outfit.skeleton.bones.findIndex(b=>b.name==='pelvis');
 const left=outfit.skeleton.bones.findIndex(b=>b.name==='thigh_l');
 const right=outfit.skeleton.bones.findIndex(b=>b.name==='thigh_r');
 for(let row=0;row<rings.length;row++)for(let i=0;i<=segments;i++){
  const t=i/segments,a=start+(end-start)*t,r=rings[row];
  const pleat=frontOnly?0:Math.cos(a*12)*(.002+row*.004);
  const x=Math.sin(a)*(r.x+pleat),z=Math.cos(a)*(r.z+pleat)+(frontOnly?.012:0);
  positions.push(x,r.y,z);uvs.push(t,row/(rings.length-1));
  const follow=frontOnly?0:Math.max(0,(row-1)/(rings.length-2))*.19;
  // Blend both thighs near the front and back seams. A hard left/right choice
  // splits coincident seam vertices as soon as either leg moves.
  const leftWeight=T.MathUtils.smoothstep(x,-.12,.12);
  skinIndices.push(pelvis,left,right,0);skinWeights.push(1-follow,follow*leftWeight,follow*(1-leftWeight),0);
 }
 for(let row=0;row<rings.length-1;row++)for(let i=0;i<segments;i++){
  const a=row*(segments+1)+i,b=a+segments+1;
  indices.push(a,b,a+1,a+1,b,b+1);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
 g.setAttribute('skinIndex',new T.Uint16BufferAttribute(skinIndices,4));
 g.setAttribute('skinWeight',new T.Float32BufferAttribute(skinWeights,4));
 g.setIndex(indices);g.computeVertexNormals();return g;
}

function fittedWaistband(outfit:T.SkinnedMesh){
 const pelvis=outfit.skeleton.bones.findIndex(b=>b.name==='pelvis');
 const rings=[{y:1.015,x:.16,z:.135,center:.03},{y:.955,x:.19,z:.18,center:.025}];
 const positions:number[]=[],indices:number[]=[],skinIndices:number[]=[],skinWeights:number[]=[];
 for(const ring of rings)for(let i=0;i<=48;i++){
  const a=i/48*Math.PI*2;
  positions.push(Math.sin(a)*ring.x,ring.y,Math.cos(a)*ring.z+ring.center);
  skinIndices.push(pelvis,0,0,0);skinWeights.push(1,0,0,0);
 }
 for(let i=0;i<48;i++){const b=i+49;indices.push(i,b,i+1,i+1,b,b+1)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 g.setAttribute('skinIndex',new T.Uint16BufferAttribute(skinIndices,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(skinWeights,4));
 g.setIndex(indices);g.computeVertexNormals();return g;
}

function addPeriodClothing(model:T.Object3D,style:Costume){
 if(style.skirt===undefined)return;
 const garment=model.getObjectByName(style.model==='maya'?'female_casualsuit01':'male_elegantsuit01');
 let source:T.SkinnedMesh|undefined;
 garment?.traverse(o=>{if(!source&&o instanceof T.SkinnedMesh)source=o});
 if(!source?.parent)return;
 const outfit=source;
 const attach=(geometry:T.BufferGeometry,color:number,name:string)=>{
  const material=new T.MeshStandardMaterial({color,roughness:.98,metalness:0,side:T.DoubleSide});
  const mesh=new T.SkinnedMesh(geometry,material);mesh.name=name;
  mesh.position.copy(outfit.position);mesh.quaternion.copy(outfit.quaternion);mesh.scale.copy(outfit.scale);
  outfit.parent!.add(mesh);mesh.bind(outfit.skeleton,outfit.bindMatrix.clone());
  mesh.castShadow=true;mesh.receiveShadow=true;
 };
 attach(skirtGeometry(outfit,style.model),style.skirt,'1942 tailored skirt');
 if(style.model==='maya')attach(fittedWaistband(outfit),style.skirt,'1942 high waistband');
 if(style.apron)attach(skirtGeometry(outfit,style.model,true),0xd4cbb5,'1942 housekeeper apron');
}

function addFittedBlouse(model:T.Object3D,color:number){
 let body:T.SkinnedMesh|undefined;
 model.traverse(o=>{if(!body&&o instanceof T.SkinnedMesh&&/anatomical_body/i.test(o.name))body=o});
 if(!body?.parent)return;
 const geometry=body.geometry.clone(),positions=geometry.getAttribute('position');
 const joints=geometry.getAttribute('skinIndex'),weights=geometry.getAttribute('skinWeight');
 const armBones=new Set(body.skeleton.bones.map((bone,i)=>/^(clavicle|upperarm|lowerarm)/.test(bone.name)?i:-1).filter(i=>i>=0));
 const torsoBones=new Set(body.skeleton.bones.map((bone,i)=>/^(pelvis|spine_)/.test(bone.name)?i:-1).filter(i=>i>=0));
 const headBones=new Set(body.skeleton.bones.map((bone,i)=>/^(head|neck_)/.test(bone.name)?i:-1).filter(i=>i>=0));
 const handBones=new Set(body.skeleton.bones.map((bone,i)=>/^(hand|finger|thumb)/.test(bone.name)?i:-1).filter(i=>i>=0));
 const influence=(index:number,bones:Set<number>)=>{let total=0;for(let k=0;k<4;k++)if(bones.has(joints.getComponent(index,k)))total+=weights.getComponent(index,k);return total};
 const original=geometry.getIndex();if(!original)return;
 const blouseFaces:number[]=[];
 for(let i=0;i<original.count;i+=3){
  const a=original.getX(i),b=original.getX(i+1),c=original.getX(i+2);
  const x=(positions.getX(a)+positions.getX(b)+positions.getX(c))/3;
  const y=(positions.getY(a)+positions.getY(b)+positions.getY(c))/3;
  const arm=(influence(a,armBones)+influence(b,armBones)+influence(c,armBones))/3;
  const torso=(influence(a,torsoBones)+influence(b,torsoBones)+influence(c,torsoBones))/3;
  const head=(influence(a,headBones)+influence(b,headBones)+influence(c,headBones))/3;
  const hand=(influence(a,handBones)+influence(b,handBones)+influence(c,handBones))/3;
  // Cover the chest and shoulder as well as the arms. Head and neck weights
  // keep the blouse off the face even at the open collar.
  const chest=y>1.02&&y<1.53&&Math.abs(x)<.32&&torso>.3;
  const shoulder=y>1.25&&y<1.68&&Math.abs(x)>.08&&Math.abs(x)<.4;
  const sleeve=Math.abs(x)>.08&&y>.9&&y<1.63&&arm>.27&&Math.min(influence(a,armBones),influence(b,armBones),influence(c,armBones))>.12;
  if((((chest||sleeve)&&head<.1)||(shoulder&&head<.9))&&hand<.3)blouseFaces.push(a,b,c);
 }
 geometry.setIndex(blouseFaces);geometry.clearGroups();
 const material=new T.MeshStandardMaterial({color,roughness:.98,metalness:0,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 const blouse=new T.SkinnedMesh(geometry,material);blouse.name='1942 fitted blouse';
 blouse.position.copy(body.position);blouse.quaternion.copy(body.quaternion);blouse.scale.copy(body.scale);
 body.parent.add(blouse);blouse.bind(body.skeleton,body.bindMatrix.clone());
 blouse.castShadow=true;blouse.receiveShadow=true;
}

function flattenGardenerShirt(model:T.Object3D){
 const shirt=model.getObjectByName('male_casualsuit02_1');
 if(!(shirt instanceof T.SkinnedMesh))return;
 // Keep the original fitted shirt and its rig; soften only the two raised
 // areas across the front chest. Clone first so no source mesh is altered.
 shirt.geometry=shirt.geometry.clone();
 const positions=shirt.geometry.getAttribute('position');
 for(let i=0;i<positions.count;i++){
  const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
  if(z<=.13)continue;
  const chest=T.MathUtils.smoothstep(y,1.15,1.23)*(1-T.MathUtils.smoothstep(y,1.34,1.42));
  const center=1-T.MathUtils.smoothstep(Math.abs(x),.12,.22);
  positions.setZ(i,z-Math.max(0,z-.13)*.75*chest*center);
 }
 positions.needsUpdate=true;shirt.geometry.computeVertexNormals();shirt.geometry.computeBoundingSphere();
}

export function dressCharacter(id:PersonId,model:T.Object3D){
 const style=CAST[id];
 model.traverse(o=>{if(!(o instanceof T.Mesh))return;const mats=Array.isArray(o.material)?o.material:[o.material];
 for(const m of mats){if(!(m instanceof T.MeshStandardMaterial))continue;
  if(/tailored business fabric/i.test(m.name)){if(id==='june'){m.map=null;m.needsUpdate=true;m.color.setHex(style.coat)}else m.color.setHex(style.coat).multiplyScalar(2.15);m.roughness=.98;m.metalness=0;}
  if(/plum satin full-length top/i.test(m.name)){m.map=null;m.color.setHex(style.blouse??style.coat);m.roughness=.98;m.metalness=0;m.needsUpdate=true;}
  if(/charcoal tailored trousers/i.test(m.name)){m.map=null;m.color.setHex(style.skirt??0x3e3c39);m.roughness=1;m.metalness=0;m.needsUpdate=true;}
  if(/original top/i.test(m.name)){if(id==='tomas'){m.map=null;m.color.setHex(style.coat);m.needsUpdate=true}else m.color.setHex(style.coat).multiplyScalar(1.7);m.roughness=.98;m.metalness=0;}
  if(/original bottom/i.test(m.name)){m.color.setHex(style.trousers??style.coat).multiplyScalar(1.7);m.roughness=.98;m.metalness=0;}
  if(/hair|afro|short01|ponytail/i.test(m.name))m.color.setHex(style.hair);
  if(/Original accessory|Accessory detail/i.test(m.name))o.visible=false;
 }
 if(style.hat==='cap'&&/afro/i.test(o.name))o.visible=false;
 if(id==='ada'&&o instanceof T.SkinnedMesh&&o.name==='ponytail01'){
  // Tuck the modern long ponytail into a compact nape roll.
  o.geometry=o.geometry.clone();const positions=o.geometry.getAttribute('position');
  for(let i=0;i<positions.count;i++)if(positions.getY(i)<1.52)positions.setY(i,1.48+(positions.getY(i)-1.28)*.16);
  positions.needsUpdate=true;o.geometry.computeVertexNormals();o.geometry.computeBoundingSphere();
 }
 });
 addPeriodClothing(model,style);
 if(id==='ada')addFittedBlouse(model,style.blouse??style.coat);
 if(id==='tomas')flattenGardenerShirt(model);
 const head=model.getObjectByName('head');if(!head)return;
 model.updateWorldMatrix(true,false);model.updateMatrixWorld(true);
 const headPosition=head.getWorldPosition(new T.Vector3()),eyeBounds=new T.Box3();let crownY=headPosition.y+.15;
 model.traverse(o=>{if(!(o instanceof T.Mesh)||!o.visible)return;if(o instanceof T.SkinnedMesh)o.computeBoundingBox();const bounds=new T.Box3().setFromObject(o);
 if(o.name==='low-poly')eyeBounds.union(bounds);
 if(/anatomical_body|short01|afro01|ponytail01/.test(o.name))crownY=Math.max(crownY,bounds.max.y);
 });
 const eyes=eyeBounds.isEmpty()?new T.Vector3(0,.04,.1):eyeBounds.getCenter(new T.Vector3()).sub(headPosition);
 if(!eyeBounds.isEmpty())eyes.z=eyeBounds.max.z-headPosition.z+.008;
 const hatY=crownY-headPosition.y-(style.hat==='housekeeper'?.08:.055);
 const anchor=new T.Group();anchor.name='Fitted character accessories';
 anchor.quaternion.copy(head.getWorldQuaternion(new T.Quaternion()).invert().multiply(model.parent!.getWorldQuaternion(new T.Quaternion())));
 const worldScale=head.getWorldScale(new T.Vector3());anchor.scale.set(1/worldScale.x,1/worldScale.y,1/worldScale.z);head.add(anchor);
 const metal=new T.MeshStandardMaterial({color:0x8d7951,metalness:.75,roughness:.35}),cloth=new T.MeshStandardMaterial({color:style.hat==='housekeeper'?0xd4cbb5:style.coat,roughness:.98});
 const add=(geometry:T.BufferGeometry,material:T.Material,x:number,y:number,z:number)=>{const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;anchor.add(m);return m};
 if(style.glasses){for(const side of[-1,1]){add(new T.TorusGeometry(.028,.002,6,28),metal,eyes.x+side*.034,eyes.y,eyes.z);const arm=add(new T.CylinderGeometry(.002,.002,.09,6),metal,eyes.x+side*.063,eyes.y,eyes.z-.045);arm.rotation.x=Math.PI/2}const bridge=add(new T.CylinderGeometry(.002,.002,.014,6),metal,eyes.x,eyes.y+.002,eyes.z);bridge.rotation.z=Math.PI/2;}
 if(style.hat){const beret=style.hat==='beret',housekeeper=style.hat==='housekeeper';
  if(housekeeper){
   // A close-fitting cloth crown and deep band replace the old flat disc.
   const crown=add(new T.SphereGeometry(1,32,20,0,Math.PI*2,0,Math.PI/2),cloth,0,hatY+.02,-.005);
   crown.scale.set(.108,.105,.115);
   const band=add(new T.CylinderGeometry(.108,.11,.04,36,1,true),cloth,0,hatY,-.005);band.scale.z=1.06;
   const seam=add(new T.TorusGeometry(.109,.004,6,36),new T.MeshStandardMaterial({color:0xb9ae99,roughness:1}),0,hatY-.018,-.005);seam.rotation.x=Math.PI/2;seam.scale.y=1.06;
  }else{
   const crown=add(new T.SphereGeometry(1,32,16,0,Math.PI*2,0,Math.PI/2),cloth,0,hatY,0);
   crown.scale.set(beret?.143:.116,beret?.065:.093,beret?.14:.125);
   const brim=add(new T.CylinderGeometry(beret?.145:.12,beret?.15:.123,.012,40),cloth,0,hatY-.002,.005);brim.scale.z=beret?1.03:1.1;
   if(style.hat==='cap'){const visor=add(new T.SphereGeometry(1,24,12),cloth,0,hatY-.004,.108);visor.scale.set(.096,.008,.065);add(new T.SphereGeometry(.013,12,8),metal,0,hatY+.032,.124)}
  }
 }
}
