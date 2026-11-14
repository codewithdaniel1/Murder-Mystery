import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import type {Estate} from './world';
import type {Activity} from './routines';
import type {PersonId} from './state';
import {rigDog} from './dog';
import {CAST,dressCharacter} from './appearance';
function updateRig(root:T.Object3D){root.updateWorldMatrix(true,false);root.updateMatrixWorld(true)}
export interface CharacterMotion {
 mixer:T.AnimationMixer;idle:T.AnimationAction;walk:T.AnimationAction;root:T.Object3D;
 bones:Map<string,T.Bone>;basePose:Map<string,T.Quaternion>;basePositions:Map<string,T.Vector3>;book:T.Group;
 soleSamples:{mesh:T.SkinnedMesh;point:T.Vector3;index:number}[];baseY:number;walkWeight:number;strideSpeed:number;activityWeights:Record<Activity,number>;
}
// Keep both actions alive. Rapid stop/start events change weights, never restart a stride.
export function createCharacterMotion(model:T.Object3D,clips:T.AnimationClip[],book:T.Group):CharacterMotion{
 const mixer=new T.AnimationMixer(model),idle=mixer.clipAction(clips.find(c=>c.name==='Idle_Standing')!),walk=mixer.clipAction(clips.find(c=>c.name==='Walk_Relaxed')!);
 const bones=new Map<string,T.Bone>();model.traverse(o=>{if(o instanceof T.Bone)bones.set(o.name,o)});
 // Measure the actual rig's stride instead of guessing a playback rate. The modest
 // idle blend reduces the wide, exaggerated stride of these interim character clips.
 walk.play();let min=Infinity,max=-Infinity;const foot=bones.get('foot_l'),v=new T.Vector3();
 for(let i=0;i<60;i++){mixer.setTime(walk.getClip().duration*i/60);updateRig(model);if(foot){model.worldToLocal(foot.getWorldPosition(v));min=Math.min(min,v.z);max=Math.max(max,v.z)}}
 const strideSpeed=Number.isFinite(max-min)?2*(max-min)*model.scale.y*1/walk.getClip().duration:.7;
 mixer.stopAllAction();idle.reset().play();walk.reset().play().setEffectiveWeight(0);mixer.update(0);
 const basePose=new Map<string,T.Quaternion>();for(const [name,bone]of bones)basePose.set(name,bone.quaternion.clone());
 const basePositions=new Map<string,T.Vector3>();for(const name of['foot_l','foot_r'])if(bones.has(name))basePositions.set(name,bones.get(name)!.position.clone());
 const soleSamples:CharacterMotion['soleSamples']=[];
 updateRig(model);
 model.traverse(o=>{if(!(o instanceof T.SkinnedMesh)||!/shoe/i.test(o.name+' '+(Array.isArray(o.material)?o.material.map(m=>m.name).join(' '):o.material.name)))return;
 const points:{index:number;point:T.Vector3;y:number}[]=[];const pos=o.geometry.getAttribute('position');
 for(let i=0;i<pos.count;i++){const point=new T.Vector3().fromBufferAttribute(pos,i),posed=o.applyBoneTransform(i,point.clone()).applyMatrix4(o.matrixWorld);points.push({index:i,point,y:posed.y})}
 points.sort((a,b)=>a.y-b.y);const low=points.filter(p=>p.y<points[0].y+.035);
 const step=Math.max(1,Math.floor(low.length/96));for(let i=0;i<low.length;i+=step)soleSamples.push({mesh:o,index:low[i].index,point:low[i].point});
 });
 return {mixer,idle,walk,root:model,bones,basePose,basePositions,book,soleSamples,baseY:model.position.y,walkWeight:0,strideSpeed:Math.max(.2,strideSpeed),activityWeights:{read:0,tidy:0,garden:0,car:0,look:0}};
}
export async function loadCharacters(e:Estate){
 const loader=new GLTFLoader();
 const names=['harper','jordan','sam','maya','pip'];const loaded=await Promise.all(names.map(name=>loader.loadAsync(import.meta.env.BASE_URL+'models/people/'+name+'.glb')));const sources=new Map(names.map((name,i)=>[name,loaded[i]])),dog=sources.get('pip')!;
 const heights:Record<PersonId,number>={june:1.64,rook:1.81,mara:1.69,ada:1.72,tomas:1.77,beatrice:1.68,jonah:1.79};
 for(const [id,a]of e.actors){
 const source=sources.get(CAST[id].model)!;const model=clone(source.scene);model.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),scale=heights[id]/size.y;
 model.scale.multiplyScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
 // Assets face forward (+Z), matching the game movement and dialogue facing convention.
 model.traverse(o=>{if(!(o instanceof T.Mesh))return;o.castShadow=true;o.receiveShadow=true;
 const list=Array.isArray(o.material)?o.material:[o.material];const copies=list.map(mat=>{const m=mat.clone() as T.MeshStandardMaterial;if(m.map)m.map.anisotropy=Math.min(4,e.renderer.capabilities.getMaxAnisotropy());m.envMapIntensity=.65;return m});o.material=Array.isArray(o.material)?copies:copies[0];});
 a.root.clear();a.root.add(model);a.root.position.y=.08;
 const book=new T.Group();e.box(.29,.035,.37,0,0,0,e.mats.red,book);e.box(.265,.018,.34,0,.025,0,e.mats.paper,book);book.visible=false;a.root.add(book);
 e.characterMotion.set(id,createCharacterMotion(model,source.animations,book));dressCharacter(id,model);
 }
 e.dogMotion=rigDog(dog.scene);e.dog.clear();e.dog.add(e.dogMotion.root);
}
export function animateCharacter(e:Estate,id:PersonId,moving:boolean,dt:number,paused:boolean,activity:Activity|null=null,time=0,speed=.9){
 const a=e.characterMotion.get(id);if(!a||paused)return;
 // AnimationMixer skips writes for unchanged tracks. Restore the saved mixer pose
 // first, otherwise our work gestures accumulate on those bones every frame.
 a.root.position.y=a.baseY;
 for(const [name,q]of a.basePose)a.bones.get(name)!.quaternion.copy(q);
 for(const [name,p]of a.basePositions)a.bones.get(name)!.position.copy(p);
 a.walkWeight=T.MathUtils.damp(a.walkWeight,moving?.98:0,12,dt);
 a.walk.enabled=a.idle.enabled=true;a.walk.setEffectiveWeight(a.walkWeight);a.idle.setEffectiveWeight(1-a.walkWeight);
 a.walk.setEffectiveTimeScale(moving?Math.max(0,speed)/a.strideSpeed:0);
 a.mixer.update(dt);
 for(const [name,q]of a.basePose)q.copy(a.bones.get(name)!.quaternion);
 for(const [name,p]of a.basePositions)p.copy(a.bones.get(name)!.position);
 for(const key of Object.keys(a.activityWeights) as Activity[])a.activityWeights[key]=T.MathUtils.damp(a.activityWeights[key],!moving&&activity===key?1:0,8,dt);
 a.book.visible=false;
 updateRig(a.root);
 if(a.soleSamples.length&&typeof e.groundHeight==='function'){
  let clearance=Infinity;const point=new T.Vector3();
  for(const sample of a.soleSamples){sample.mesh.applyBoneTransform(sample.index,point.copy(sample.point)).applyMatrix4(sample.mesh.matrixWorld);clearance=Math.min(clearance,point.y-e.groundHeight(point.x,point.z))}
  a.root.position.y+=.003-clearance;updateRig(a.root);
 }
 const actor=e.actors.get(id)!.root;
 const right=new T.Vector3(1,0,0).applyQuaternion(actor.quaternion),up=new T.Vector3(0,1,0);
 const turn=(name:string,axis:T.Vector3,angle:number)=>{const bone=a.bones.get(name);if(!bone?.parent||Math.abs(angle)<1e-6)return;const parent=bone.parent.getWorldQuaternion(new T.Quaternion()),localAxis=axis.clone().applyQuaternion(parent.invert());bone.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(localAxis,angle));bone.updateMatrixWorld(true)};
 const read=a.activityWeights.read,work=a.activityWeights.tidy+a.activityWeights.car+a.activityWeights.garden;
 turn('upperarm_l',right,-.4*read);turn('upperarm_r',right,-.4*read);
 turn('lowerarm_l',right,-.9*read);turn('lowerarm_r',right,-.9*read);turn('head',right,.15*read);
 turn('spine_02',right,.045*work);turn('upperarm_r',right,(-.3+Math.sin(time*1.7)*.035)*work);turn('lowerarm_r',right,-.2*work);turn('head',right,.1*work);
 turn('head',up,Math.sin(time*.35)*.08*a.activityWeights.look);
 const l=a.bones.get('hand_l'),r=a.bones.get('hand_r');
 if(read>.5&&l&&r){const left=actor.worldToLocal(l.getWorldPosition(new T.Vector3())),rightHand=actor.worldToLocal(r.getWorldPosition(new T.Vector3()));a.book.position.copy(left).add(rightHand).multiplyScalar(.5);a.book.rotation.set(-.18,0,Math.atan2(left.y-rightHand.y,left.x-rightHand.x));a.book.visible=true;}
}
