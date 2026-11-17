import {describe,it,expect,vi} from 'vitest';
import * as T from 'three';
import {Estate} from '../src/world';

function fixture(){
 const e=Object.create(Estate.prototype) as Estate;
 e.scene=new T.Scene();e.camera=new T.PerspectiveCamera();e.scene.add(e.camera);
 e.ray=new T.Raycaster();e.pointer=new T.Vector2();e.targets=[];e.walls=[];e.doors=new Map();e.actors=new Map();
 return e;
}
function target(e:Estate,id:string,z:number){
 const root=new T.Group();root.position.z=z;
 root.add(new T.Mesh(new T.BoxGeometry(1,2,.3),new T.MeshBasicMaterial()));e.scene.add(root);
 e.targets.push({id,root,label:id,verb:'Speak to'});return root;
}
describe('interaction reach',()=>{
 it('skips distant NPC meshes before detailed raycasting',()=>{
  const e=fixture(),root=target(e,'ada',-20),raycast=vi.spyOn(root.children[0],'raycast');
  e.actors.set('ada',{root} as never);e.scene.updateMatrixWorld(true);
  expect(e.targetAt()).toBeNull();expect(raycast).not.toHaveBeenCalled();
 });
 it('allows nearby interactions, respects walls, and ignores hidden rooms',()=>{
  const e=fixture(),root=target(e,'ada',-2);e.actors.set('ada',{root} as never);e.scene.updateMatrixWorld(true);
  expect(e.targetAt()?.id).toBe('ada');
  const wall=new T.Mesh(new T.BoxGeometry(3,3,.1),new T.MeshBasicMaterial());wall.position.z=-1;e.scene.add(wall);e.walls.push(wall);e.scene.updateMatrixWorld(true);
  expect(e.targetAt()).toBeNull();e.walls=[];
  const room=new T.Group();e.scene.add(room);room.add(root);room.visible=false;
  expect(e.targetAt()).toBeNull();
 });
});
