import * as T from 'three';
import type {PersonId} from './state';
export const CAST:Record<PersonId,{model:string;coat:number;hair:number;hat?:'cloche'|'cap';glasses?:boolean}>={
 june:{model:'harper',coat:0x687d72,hair:0xd4d0ba},
 mara:{model:'harper',coat:0xc19565,hair:0x63442f,glasses:true},
 ada:{model:'maya',coat:0x607c9e,hair:0x30241d},
 beatrice:{model:'harper',coat:0x976270,hair:0x3a2922,hat:'cloche'},
 rook:{model:'jordan',coat:0x705465,hair:0x34302b,glasses:true},
 tomas:{model:'sam',coat:0x80845d,hair:0x8f897c,hat:'cap'},
 jonah:{model:'jordan',coat:0x40556c,hair:0x28231f,hat:'cap'}
};
export function dressCharacter(id:PersonId,model:T.Object3D){
 const style=CAST[id];
 model.traverse(o=>{if(!(o instanceof T.Mesh))return;const mats=Array.isArray(o.material)?o.material:[o.material];
 for(const m of mats){if(!(m instanceof T.MeshStandardMaterial))continue;
  if(/fabric|shirt|suit|coat|blouse|jacket/i.test(m.name)){m.color.setHex(style.coat).multiplyScalar(1.8);m.roughness=.86;}
  if(/hair|afro|short01|ponytail/i.test(m.name))m.color.setHex(style.hair);
  if(/Original accessory|Accessory detail/i.test(m.name))o.visible=false;
 }
 if(style.hat==='cap'&&/afro/i.test(o.name))o.visible=false;
 });
 const head=model.getObjectByName('head');if(!head)return;
 model.updateWorldMatrix(true,false);model.updateMatrixWorld(true);
 const headPosition=head.getWorldPosition(new T.Vector3()),eyeBounds=new T.Box3();let crownY=headPosition.y+.15;
 model.traverse(o=>{if(!(o instanceof T.Mesh)||!o.visible)return;if(o instanceof T.SkinnedMesh)o.computeBoundingBox();const bounds=new T.Box3().setFromObject(o);
 if(o.name==='low-poly')eyeBounds.union(bounds);
 if(/anatomical_body|short01|afro01|ponytail01/.test(o.name))crownY=Math.max(crownY,bounds.max.y);
 });
 const eyes=eyeBounds.isEmpty()?new T.Vector3(0,.04,.1):eyeBounds.getCenter(new T.Vector3()).sub(headPosition);
 if(!eyeBounds.isEmpty())eyes.z=eyeBounds.max.z-headPosition.z+.008;
 const hatY=crownY-headPosition.y-(style.hat==='cloche'?.045:.065);
 const anchor=new T.Group();anchor.name='Fitted character accessories';
 anchor.quaternion.copy(head.getWorldQuaternion(new T.Quaternion()).invert().multiply(model.parent!.getWorldQuaternion(new T.Quaternion())));
 const worldScale=head.getWorldScale(new T.Vector3());anchor.scale.set(1/worldScale.x,1/worldScale.y,1/worldScale.z);head.add(anchor);
 const metal=new T.MeshStandardMaterial({color:0x8d7951,metalness:.75,roughness:.35}),cloth=new T.MeshStandardMaterial({color:style.coat,roughness:.9});
 const add=(geometry:T.BufferGeometry,material:T.Material,x:number,y:number,z:number)=>{const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;anchor.add(m);return m};
 if(style.glasses){for(const side of[-1,1]){add(new T.TorusGeometry(.028,.002,6,28),metal,eyes.x+side*.034,eyes.y,eyes.z);const arm=add(new T.CylinderGeometry(.002,.002,.09,6),metal,eyes.x+side*.063,eyes.y,eyes.z-.045);arm.rotation.x=Math.PI/2}const bridge=add(new T.CylinderGeometry(.002,.002,.014,6),metal,eyes.x,eyes.y+.002,eyes.z);bridge.rotation.z=Math.PI/2;}
 if(style.hat){const cloche=style.hat==='cloche';const crown=add(new T.SphereGeometry(1,32,16,0,Math.PI*2,0,Math.PI/2),cloth,0,hatY,0);crown.scale.set(.118,cloche?.105:.09,.125);const brim=add(new T.CylinderGeometry(cloche?.15:.12,cloche?.153:.123,.012,40),cloth,0,hatY,.006);brim.scale.z=cloche?1.04:1.1;
  if(!cloche){const visor=add(new T.SphereGeometry(1,24,12),cloth,0,hatY-.004,.108);visor.scale.set(.096,.008,.065);add(new T.SphereGeometry(.013,12,8),metal,0,hatY+.032,.124)}
  const ribbon=add(new T.CylinderGeometry(.12,.121,.025,40,1,true),new T.MeshStandardMaterial({color:0x302c26,roughness:.8}),0,hatY+.016,0);ribbon.scale.z=1.05;
 }
}
