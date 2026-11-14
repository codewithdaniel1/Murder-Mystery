import * as T from 'three';
import type {PersonId} from './state';
type Hat = 'beret'|'cap'|'headscarf';
type Costume = {model:string;coat:number;hair:number;hat?:Hat;glasses?:boolean;skirt?:number;blouse?:number;trousers?:number;apron?:boolean};

// Bramblewick is set in 1942. The shared source figures have contemporary
// garments, so these costumes add a period silhouette to their existing rigs.
export const CAST:Record<PersonId,Costume>={
 june:{model:'harper',coat:0x596458,hair:0x9a9485,hat:'headscarf',skirt:0x434c43,apron:true},
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
  {y:top,x:maya?.215:.19,z:maya?.17:.15},{y:top-.12,x:.225,z:.175},{y:top-.29,x:.263,z:.205},{y:bottom,x:.305,z:.237}
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
 if(style.apron)attach(skirtGeometry(outfit,style.model,true),0xd4cbb5,'1942 housekeeper apron');
}

function addFittedShortSleeves(model:T.Object3D,color:number){
 let body:T.SkinnedMesh|undefined;
 model.traverse(o=>{if(!body&&o instanceof T.SkinnedMesh&&/anatomical_body/i.test(o.name))body=o});
 if(!body?.parent)return;
 const geometry=body.geometry.clone(),positions=geometry.getAttribute('position'),normals=geometry.getAttribute('normal');
 const original=geometry.getIndex();if(!original)return;
 const sleeveFaces:number[]=[];
 for(let i=0;i<original.count;i+=3){
  const a=original.getX(i),b=original.getX(i+1),c=original.getX(i+2);
  const x=(positions.getX(a)+positions.getX(b)+positions.getX(c))/3;
  const y=(positions.getY(a)+positions.getY(b)+positions.getY(c))/3;
  if(Math.abs(x)>.15&&y>1.17&&y<1.44)sleeveFaces.push(a,b,c);
 }
 geometry.setIndex(sleeveFaces);
 for(let i=0;i<positions.count;i++)positions.setXYZ(i,
  positions.getX(i)+normals.getX(i)*.004,
  positions.getY(i)+normals.getY(i)*.004,
  positions.getZ(i)+normals.getZ(i)*.004
 );
 positions.needsUpdate=true;geometry.computeBoundingSphere();
 const material=new T.MeshStandardMaterial({color,roughness:.98,metalness:0,side:T.DoubleSide});
 const sleeves=new T.SkinnedMesh(geometry,material);sleeves.name='1942 fitted blouse sleeves';
 sleeves.position.copy(body.position);sleeves.quaternion.copy(body.quaternion);sleeves.scale.copy(body.scale);
 body.parent.add(sleeves);sleeves.bind(body.skeleton,body.bindMatrix.clone());
 sleeves.castShadow=true;sleeves.receiveShadow=true;
}

function addGardenerWaistcoat(model:T.Object3D){
 const shirt=model.getObjectByName('male_casualsuit02_1');
 if(!(shirt instanceof T.SkinnedMesh)||!shirt.parent)return;
 const pelvis=shirt.skeleton.bones.findIndex(b=>b.name==='pelvis');
 const spine=shirt.skeleton.bones.findIndex(b=>b.name==='spine_02');
 if(pelvis<0||spine<0)return;
 const rings=[
  {y:1.04,x:.205,z:.165,gap:.12,spine:0},
  {y:1.12,x:.226,z:.176,gap:.13,spine:.35},
  {y:1.28,x:.248,z:.181,gap:.32,spine:.8},
  {y:1.4,x:.236,z:.169,gap:.64,spine:1}
 ];
 const segments=48,positions:number[]=[],uvs:number[]=[],indices:number[]=[],skinIndices:number[]=[],skinWeights:number[]=[];
 for(let row=0;row<rings.length;row++)for(let i=0;i<=segments;i++){
  const r=rings[row],t=i/segments,angle=r.gap+(Math.PI*2-2*r.gap)*t;
  positions.push(Math.sin(angle)*r.x,r.y,Math.cos(angle)*r.z);
  uvs.push(t,row/(rings.length-1));
  skinIndices.push(pelvis,spine,0,0);skinWeights.push(1-r.spine,r.spine,0,0);
 }
 for(let row=0;row<rings.length-1;row++)for(let i=0;i<segments;i++){
  const a=row*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,a+1,b,b+1);
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
 geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(skinIndices,4));
 geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(skinWeights,4));
 geometry.setIndex(indices);geometry.computeVertexNormals();
 const material=new T.MeshStandardMaterial({color:0x6d5540,roughness:.98,metalness:0,side:T.DoubleSide});
 const vest=new T.SkinnedMesh(geometry,material);vest.name='1942 gardener waistcoat';
 vest.position.copy(shirt.position);vest.quaternion.copy(shirt.quaternion);vest.scale.copy(shirt.scale);
 shirt.parent.add(vest);vest.bind(shirt.skeleton,shirt.bindMatrix.clone());
 vest.castShadow=true;vest.receiveShadow=true;
}

export function dressCharacter(id:PersonId,model:T.Object3D){
 const style=CAST[id];
 model.traverse(o=>{if(!(o instanceof T.Mesh))return;const mats=Array.isArray(o.material)?o.material:[o.material];
 for(const m of mats){if(!(m instanceof T.MeshStandardMaterial))continue;
  if(/tailored business fabric/i.test(m.name)){if(id==='june'){m.map=null;m.needsUpdate=true;m.color.setHex(style.coat)}else m.color.setHex(style.coat).multiplyScalar(2.15);m.roughness=.98;m.metalness=0;}
  if(/plum satin full-length top/i.test(m.name)){m.map=null;m.color.setHex(style.blouse??style.coat);m.roughness=.98;m.metalness=0;m.needsUpdate=true;}
  if(/charcoal tailored trousers/i.test(m.name)){m.map=null;m.color.setHex(style.skirt??0x3e3c39);m.roughness=1;m.metalness=0;m.needsUpdate=true;}
  if(/original top/i.test(m.name)){m.color.setHex(style.coat).multiplyScalar(id==='tomas'?1.15:1.7);m.roughness=.98;m.metalness=0;}
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
 if(id==='ada')addFittedShortSleeves(model,style.blouse??style.coat);
 if(id==='tomas')addGardenerWaistcoat(model);
 const head=model.getObjectByName('head');if(!head)return;
 model.updateWorldMatrix(true,false);model.updateMatrixWorld(true);
 const headPosition=head.getWorldPosition(new T.Vector3()),eyeBounds=new T.Box3();let crownY=headPosition.y+.15;
 model.traverse(o=>{if(!(o instanceof T.Mesh)||!o.visible)return;if(o instanceof T.SkinnedMesh)o.computeBoundingBox();const bounds=new T.Box3().setFromObject(o);
 if(o.name==='low-poly')eyeBounds.union(bounds);
 if(/anatomical_body|short01|afro01|ponytail01/.test(o.name))crownY=Math.max(crownY,bounds.max.y);
 });
 const eyes=eyeBounds.isEmpty()?new T.Vector3(0,.04,.1):eyeBounds.getCenter(new T.Vector3()).sub(headPosition);
 if(!eyeBounds.isEmpty())eyes.z=eyeBounds.max.z-headPosition.z+.008;
 const hatY=crownY-headPosition.y-.055;
 const anchor=new T.Group();anchor.name='Fitted character accessories';
 anchor.quaternion.copy(head.getWorldQuaternion(new T.Quaternion()).invert().multiply(model.parent!.getWorldQuaternion(new T.Quaternion())));
 const worldScale=head.getWorldScale(new T.Vector3());anchor.scale.set(1/worldScale.x,1/worldScale.y,1/worldScale.z);head.add(anchor);
 const metal=new T.MeshStandardMaterial({color:0x8d7951,metalness:.75,roughness:.35}),cloth=new T.MeshStandardMaterial({color:style.hat==='headscarf'?0xd4cbb5:style.coat,roughness:.98});
 const add=(geometry:T.BufferGeometry,material:T.Material,x:number,y:number,z:number)=>{const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;anchor.add(m);return m};
 if(style.glasses){for(const side of[-1,1]){add(new T.TorusGeometry(.028,.002,6,28),metal,eyes.x+side*.034,eyes.y,eyes.z);const arm=add(new T.CylinderGeometry(.002,.002,.09,6),metal,eyes.x+side*.063,eyes.y,eyes.z-.045);arm.rotation.x=Math.PI/2}const bridge=add(new T.CylinderGeometry(.002,.002,.014,6),metal,eyes.x,eyes.y+.002,eyes.z);bridge.rotation.z=Math.PI/2;}
 if(style.hat){const beret=style.hat==='beret',scarf=style.hat==='headscarf';
  const crown=add(new T.SphereGeometry(1,32,16,0,Math.PI*2,0,Math.PI/2),cloth,0,hatY,0);
  crown.scale.set(beret?.143:scarf?.126:.116,beret?.065:scarf?.06:.093,beret?.14:.125);
  if(!scarf){const brim=add(new T.CylinderGeometry(beret?.145:.12,beret?.15:.123,.012,40),cloth,0,hatY-.002,.005);brim.scale.z=beret?1.03:1.1;}
  if(style.hat==='cap'){const visor=add(new T.SphereGeometry(1,24,12),cloth,0,hatY-.004,.108);visor.scale.set(.096,.008,.065);add(new T.SphereGeometry(.013,12,8),metal,0,hatY+.032,.124)}
  if(scarf){const knot=add(new T.SphereGeometry(.024,12,8),cloth,0,hatY-.055,-.115);knot.scale.set(1,.6,.7);}
 }
}
