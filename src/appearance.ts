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
// The hem follows the pelvis closely so moving legs remain behind the fabric.
function skirtGeometry(outfit:T.SkinnedMesh,modelName:string,frontOnly=false){
 const maya=modelName==='maya',top=maya?.99:.89,bottom=maya?.53:.34;
 const rings=frontOnly?[
  {y:top-.015,x:.18,z:.155},{y:top-.17,x:.21,z:.19},{y:bottom+.045,x:.3,z:.375}
 ]:maya?[
  {y:top,x:.165,z:.15},
  {y:top-.075,x:.185,z:.17},
  {y:top-.15,x:.205,z:.195},
  {y:top-.22,x:.218,z:.205},
  {y:top-.29,x:.22,z:.205},
  {y:bottom+.07,x:.215,z:.2},
  {y:bottom,x:.21,z:.198}
 ]:[
  {y:top,x:.18,z:.145},{y:top-.12,x:.2,z:.17},{y:top-.29,x:.24,z:.23},{y:bottom,x:.34,z:.36}
 ];
 const segments=frontOnly?20:48,start=frontOnly?-1.04:0,end=frontOnly?1.04:Math.PI*2;
 const positions:number[]=[],uvs:number[]=[],indices:number[]=[],skinIndices:number[]=[],skinWeights:number[]=[];
 const pelvis=outfit.skeleton.bones.findIndex(b=>b.name==='pelvis');
 const left=outfit.skeleton.bones.findIndex(b=>b.name==='thigh_l');
 const right=outfit.skeleton.bones.findIndex(b=>b.name==='thigh_r');
 for(let row=0;row<rings.length;row++)for(let i=0;i<=segments;i++){
  const t=i/segments,a=start+(end-start)*t,r=rings[row];
  const pleat=frontOnly?0:maya?Math.cos(a*8)*(.001+row*.001):Math.cos(a*12)*(.002+row*.004);
  const x=Math.sin(a)*(r.x+pleat),z=Math.cos(a)*(r.z+pleat)+(frontOnly?.012:0);
  positions.push(x,r.y,z);uvs.push(t,row/(rings.length-1));
  const follow=frontOnly?0:Math.max(0,(row-1)/(rings.length-2))*(maya?.025:.05);
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

let adaSkirtFabric:T.DataTexture|undefined;
function tailoredWool(){
 if(adaSkirtFabric)return adaSkirtFabric;
 const size=256,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const n=((x*73856093)^(y*19349663))>>>0;
  const thread=((x+y)%4===0?2:0),seam=[64,128,192].some(s=>Math.abs(x-s)<=1)?18:0;
  const shade=246+(n%9)-4-thread-seam,p=(y*size+x)*4;
  data[p]=data[p+1]=data[p+2]=shade;data[p+3]=255;
 }
 const texture=new T.DataTexture(data,size,size,T.RGBAFormat);texture.colorSpace=T.SRGBColorSpace;
 texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearMipmapLinearFilter;texture.generateMipmaps=true;
 texture.needsUpdate=true;adaSkirtFabric=texture;return texture;
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
  if(style.model==='maya'&&name==='1942 tailored skirt')material.map=tailoredWool();
  const mesh=new T.SkinnedMesh(geometry,material);mesh.name=name;
  mesh.position.copy(outfit.position);mesh.quaternion.copy(outfit.quaternion);mesh.scale.copy(outfit.scale);
  outfit.parent!.add(mesh);mesh.bind(outfit.skeleton,outfit.bindMatrix.clone());
  mesh.castShadow=true;mesh.receiveShadow=true;
 };
 attach(skirtGeometry(outfit,style.model),style.skirt,'1942 tailored skirt');
 if(style.apron)attach(skirtGeometry(outfit,style.model,true),0xd4cbb5,'1942 housekeeper apron');
}

function trimSkirtedHarperSuit(model:T.Object3D){
 let suit:T.SkinnedMesh|undefined;
 model.getObjectByName('male_elegantsuit01')?.traverse(o=>{if(!suit&&o instanceof T.SkinnedMesh)suit=o});
 if(!suit)return;
 const geometry=suit.geometry.clone(),source=geometry.getIndex(),positions=geometry.getAttribute('position');
 if(!source)return;
 const kept:number[]=[],lower:number[]=[];
 for(let i=0;i<source.count;i+=3){
  const a=source.getX(i),b=source.getX(i+1),c=source.getX(i+2);
  const ys=[positions.getY(a),positions.getY(b),positions.getY(c)];
  // Separate the upper jacket from the lower legwear, leaving the coat tails
  // and trouser thighs hidden behind the new skirt and apron.
  if(Math.min(...ys)>.82)kept.push(a,b,c);
  if(Math.min(...ys)<.52)lower.push(a,b,c);
 }
 const legs=geometry.clone();legs.setIndex(lower);legs.clearGroups();legs.computeBoundingSphere();
 const legwear=new T.SkinnedMesh(legs,new T.MeshStandardMaterial({color:0x333936,roughness:1,side:T.DoubleSide}));
 legwear.name='1942 skirt legwear';legwear.position.copy(suit.position);legwear.quaternion.copy(suit.quaternion);legwear.scale.copy(suit.scale);
 suit.parent!.add(legwear);legwear.bind(suit.skeleton,suit.bindMatrix.clone());legwear.castShadow=true;legwear.receiveShadow=true;
 geometry.setIndex(kept);geometry.clearGroups();suit.geometry=geometry;
}

function trimAdaTrousers(model:T.Object3D){
 const trousers=model.getObjectByName('female_casualsuit01_2');
 if(!(trousers instanceof T.SkinnedMesh))return;
 const geometry=trousers.geometry.clone(),source=geometry.getIndex(),positions=geometry.getAttribute('position');
 if(!source)return;
 const kept:number[]=[];
 for(let i=0;i<source.count;i+=3){const a=source.getX(i),b=source.getX(i+1),c=source.getX(i+2);
  if(Math.min(positions.getY(a),positions.getY(b),positions.getY(c))<.55)kept.push(a,b,c);
 }
 for(let i=0;i<positions.count;i++){
  const x=positions.getX(i),z=positions.getZ(i),legCenter=x<0?-.11:.11;
  positions.setX(i,legCenter+(x-legCenter)*.78);positions.setZ(i,z*.78);
 }
 positions.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();
 geometry.setIndex(kept);geometry.clearGroups();trousers.geometry=geometry;
 trousers.material=new T.MeshStandardMaterial({color:0x20252c,roughness:1,side:T.DoubleSide});
}

function addFittedBlouse(model:T.Object3D,color:number){
 let body:T.SkinnedMesh|undefined;
 model.traverse(o=>{if(!body&&o instanceof T.SkinnedMesh&&/anatomical_body/i.test(o.name))body=o});
 if(!body)return;
 const geometry=body.geometry.clone(),positions=geometry.getAttribute('position');
 const joints=geometry.getAttribute('skinIndex'),weights=geometry.getAttribute('skinWeight');
 const armBones=new Set(body.skeleton.bones.map((bone,i)=>/^(clavicle|upperarm|lowerarm)/.test(bone.name)?i:-1).filter(i=>i>=0));
 const torsoBones=new Set(body.skeleton.bones.map((bone,i)=>/^(pelvis|spine_)/.test(bone.name)?i:-1).filter(i=>i>=0));
 const headBones=new Set(body.skeleton.bones.map((bone,i)=>/^(head|neck_)/.test(bone.name)?i:-1).filter(i=>i>=0));
 const handBones=new Set(body.skeleton.bones.map((bone,i)=>/^(hand|finger|thumb)/.test(bone.name)?i:-1).filter(i=>i>=0));
 const influence=(index:number,bones:Set<number>)=>{let total=0;for(let k=0;k<4;k++)if(bones.has(joints.getComponent(index,k)))total+=weights.getComponent(index,k);return total};
 const original=geometry.getIndex();if(!original)return;
 const skinFaces:number[]=[],blouseFaces:number[]=[];
 for(let i=0;i<original.count;i+=3){
  const a=original.getX(i),b=original.getX(i+1),c=original.getX(i+2);
  const x=(positions.getX(a)+positions.getX(b)+positions.getX(c))/3;
  const y=(positions.getY(a)+positions.getY(b)+positions.getY(c))/3;
  const arm=(influence(a,armBones)+influence(b,armBones)+influence(c,armBones))/3;
  const torso=(influence(a,torsoBones)+influence(b,torsoBones)+influence(c,torsoBones))/3;
  const head=(influence(a,headBones)+influence(b,headBones)+influence(c,headBones))/3;
  const hand=(influence(a,handBones)+influence(b,handBones)+influence(c,handBones))/3;
  // Assign fabric on the original skinned surface: no duplicate mesh can
  // drift away from the shoulder or leave skin visible at the seams.
  const chest=y>.94&&y<1.57&&torso>.12&&head<.5;
  const shoulder=y>1.2&&y<1.67&&Math.abs(x)>.1&&head<.85;
  const sleeve=y>.7&&arm>.12&&hand<.45&&head<.6;
  (hand<.45&&(chest||shoulder||sleeve)?blouseFaces:skinFaces).push(a,b,c);
 }
 geometry.setIndex([...skinFaces,...blouseFaces]);geometry.clearGroups();geometry.addGroup(0,skinFaces.length,0);geometry.addGroup(skinFaces.length,blouseFaces.length,1);
 body.geometry=geometry;const skin=Array.isArray(body.material)?body.material[0]:body.material;
 body.material=[skin,new T.MeshStandardMaterial({color,roughness:.98,metalness:0,side:T.DoubleSide})];
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
 if(style.model==='harper'&&style.skirt!==undefined)trimSkirtedHarperSuit(model);
 if(id==='ada')trimAdaTrousers(model);
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
 const hatY=crownY-headPosition.y-(style.hat==='housekeeper'?.05:.055);
 const anchor=new T.Group();anchor.name='Fitted character accessories';
 anchor.quaternion.copy(head.getWorldQuaternion(new T.Quaternion()).invert().multiply(model.parent!.getWorldQuaternion(new T.Quaternion())));
 const worldScale=head.getWorldScale(new T.Vector3());anchor.scale.set(1/worldScale.x,1/worldScale.y,1/worldScale.z);head.add(anchor);
 const metal=new T.MeshStandardMaterial({color:0x8d7951,metalness:.75,roughness:.35}),cloth=new T.MeshStandardMaterial({color:style.hat==='housekeeper'?0xd4cbb5:style.coat,roughness:.98});
 const add=(geometry:T.BufferGeometry,material:T.Material,x:number,y:number,z:number)=>{const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;anchor.add(m);return m};
 if(style.glasses){for(const side of[-1,1]){add(new T.TorusGeometry(.028,.002,6,28),metal,eyes.x+side*.034,eyes.y,eyes.z);const arm=add(new T.CylinderGeometry(.002,.002,.09,6),metal,eyes.x+side*.063,eyes.y,eyes.z-.045);arm.rotation.x=Math.PI/2}const bridge=add(new T.CylinderGeometry(.002,.002,.014,6),metal,eyes.x,eyes.y+.002,eyes.z);bridge.rotation.z=Math.PI/2;}
 if(style.hat){const beret=style.hat==='beret',housekeeper=style.hat==='housekeeper';
  if(housekeeper){
   // A small gathered cloth cap sits over the back of her hair. Its soft
   // folds have no rigid brim or cylindrical helmet band.
   const crown=add(new T.SphereGeometry(1,32,20,0,Math.PI*2,0,Math.PI/2),cloth,0,hatY,0);
   crown.scale.set(.092,.073,.09);
   for(const side of[-1,1]){const fold=add(new T.SphereGeometry(1,16,10),cloth,side*.048,hatY+.018,-.058);fold.scale.set(.037,.026,.029);}
   const knot=add(new T.SphereGeometry(.024,12,8),cloth,0,hatY-.035,-.09);knot.scale.set(1,.65,.7);
  }else{
   const crown=add(new T.SphereGeometry(1,32,16,0,Math.PI*2,0,Math.PI/2),cloth,0,hatY,0);
   crown.scale.set(beret?.143:.116,beret?.065:.093,beret?.14:.125);
   const brim=add(new T.CylinderGeometry(beret?.145:.12,beret?.15:.123,.012,40),cloth,0,hatY-.002,.005);brim.scale.z=beret?1.03:1.1;
   if(style.hat==='cap'){const visor=add(new T.SphereGeometry(1,24,12),cloth,0,hatY-.004,.108);visor.scale.set(.096,.008,.065);add(new T.SphereGeometry(.013,12,8),metal,0,hatY+.032,.124)}
  }
 }
}
