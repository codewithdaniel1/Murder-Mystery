import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import type {Estate} from './world';
import type {PersonId} from './state';
export interface CharacterMotion {mixer:T.AnimationMixer;idle:T.AnimationAction;walk:T.AnimationAction;moving:boolean;root:T.Object3D}
export async function loadCharacters(e:Estate){
 const loader=new GLTFLoader();
 const [female,male,dog]=await Promise.all(['harper','jordan','pip'].map(name=>loader.loadAsync(import.meta.env.BASE_URL+'models/people/'+name+'.glb')));
 const colors:Record<PersonId,number>={june:0x8c948a,rook:0x8e828a,mara:0xbba087,ada:0x91b0a1,tomas:0x929b7a,beatrice:0xb092a1,jonah:0x8294a8};
 const heights:Record<PersonId,number>={june:1.64,rook:1.81,mara:1.69,ada:1.72,tomas:1.77,beatrice:1.68,jonah:1.79};
 for(const [id,a]of e.actors){
 const source=['june','mara','ada','beatrice'].includes(id)?female:male;const model=clone(source.scene);model.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),scale=heights[id]/size.y;
 model.scale.multiplyScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
 // Assets face forward (+Z), matching the game movement and dialogue facing convention.
 model.traverse(o=>{if(!(o instanceof T.Mesh))return;o.castShadow=true;o.receiveShadow=true;
 const list=Array.isArray(o.material)?o.material:[o.material];const copies=list.map(mat=>{const m=mat.clone() as T.MeshStandardMaterial;if(/fabric|suit/i.test(m.name))m.color.multiply(new T.Color(colors[id]));if(m.map)m.map.anisotropy=Math.min(4,e.renderer.capabilities.getMaxAnisotropy());m.envMapIntensity=.65;return m});o.material=Array.isArray(o.material)?copies:copies[0];});
 a.root.clear();a.root.add(model);a.root.position.y=.08;
 const mixer=new T.AnimationMixer(model);const idle=mixer.clipAction(source.animations.find(c=>c.name==='Idle_Standing')!),walk=mixer.clipAction(source.animations.find(c=>c.name==='Walk_Relaxed')!);idle.play();idle.time=Math.random()*idle.getClip().duration;mixer.update(0);walk.play();walk.setEffectiveWeight(0);
 e.characterMotion.set(id,{mixer,idle,walk,moving:false,root:model});
 }
 const b=new T.Box3().setFromObject(dog.scene),size=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3()),scale=.58/size.y;const model=dog.scene;model.scale.multiplyScalar(scale);model.position.set(-center.x*scale,-b.min.y*scale,-center.z*scale);
 // Dog model's long axis is X; rotate it into the game's forward Z axis.
 const pivot=new T.Group();pivot.add(model);pivot.rotation.y=-Math.PI/2;e.dog.clear();e.dog.add(pivot);e.dogLegs=[];model.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true}});
}
export function animateCharacter(e:Estate,id:PersonId,moving:boolean,dt:number,paused:boolean){const a=e.characterMotion.get(id);if(!a||paused)return;
 if(a.moving!==moving){a.moving=moving;const enter=moving?a.walk:a.idle,exit=moving?a.idle:a.walk;enter.enabled=true;enter.setEffectiveTimeScale(moving?.73:1);enter.setEffectiveWeight(1);enter.reset().play();enter.crossFadeFrom(exit,.3,false);}
 a.mixer.update(dt);
}
