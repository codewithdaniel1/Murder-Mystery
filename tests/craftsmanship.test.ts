import {describe,it,expect} from 'vitest';
import * as T from 'three';
import {furnishedEstate} from './estate-fixture';
import {craftedTable,poseSecateurs} from '../src/craftsmanship';
import {makeEstateSaloon,makeSaloonBoot,rollCarWheels} from '../src/motorcar';
import {buildShed} from '../src/yard';
import {clearAt} from '../src/navigation';
import {UPPER_FLOOR} from '../src/upstairs';

const triangles=(root:T.Object3D)=>{let n=0;root.traverse(o=>{if(o instanceof T.Mesh)n+=(o.geometry.index?.count??o.geometry.getAttribute('position').count)/3});return n};
const aim=(e:ReturnType<typeof furnishedEstate>,eye:T.Vector3,target:T.Object3D)=>{
 e.scene.updateMatrixWorld(true);e.camera.position.copy(eye);e.camera.lookAt(new T.Box3().setFromObject(target).getCenter(new T.Vector3()));e.camera.updateMatrixWorld(true);e.pointer=new T.Vector2();e.ray=new T.Raycaster();
 return e.targetAt()?.id;
};
describe('period furnishings and shed tools',()=>{
 it('keeps the curved saloon and moving boot within its collision footprint',()=>{
  const e=furnishedEstate(),car=makeEstateSaloon(e),boot=makeSaloonBoot(e);car.add(boot);car.updateMatrixWorld(true);
  const box=new T.Box3().setFromObject(car);expect(box.max.x).toBeLessThan(1.225);expect(box.min.x).toBeGreaterThan(-1.225);expect(box.max.z).toBeLessThan(2.625);expect(box.min.z).toBeGreaterThan(-2.625);
  expect(triangles(car)).toBeLessThan(16000);
  const wheels=car.children.filter(o=>o.name==='road-wheel');expect(wheels).toHaveLength(4);
  const before=wheels[0].quaternion.clone();rollCarWheels(car,0);expect(wheels[0].quaternion.angleTo(before)).toBe(0);
  rollCarWheels(car,.408);expect(wheels[0].rotation.x).toBeCloseTo(-1);
  const lid=new T.Box3().setFromObject(boot);boot.rotation.x=-1;car.updateMatrixWorld(true);expect(new T.Box3().setFromObject(boot).max.y).toBeGreaterThan(lid.max.y+.3);
 });
 it('gives tables distinct profiles while preserving their footprint and document height',()=>{
  const e=furnishedEstate();
  for(const [w,d,h,name]of [[3.6,1.5,.92,'writing desk'],[2.4,.85,.92,'console table'],[2,1.2,.92,'dining table'],[1.72,.65,.82,'workbench']] as const){
   const root=craftedTable(e,0,0,w,d,h);expect(root.name).toBe(name);root.updateMatrixWorld(true);
   const box=new T.Box3().setFromObject(root);expect(box.max.y).toBeCloseTo(h+.1,1);expect(box.min.y).toBeGreaterThanOrEqual(-.001);expect(triangles(root)).toBeLessThan(13000);
   expect(e.barriers.at(-1)).toMatchObject({x:0,z:0,w,d});
  }
 });
 it('lets the player reach the shed tools and operate both blades without moving the tool off the bench',()=>{
  const e=furnishedEstate();buildShed(e);
  const shears=e.targets.find(t=>t.id==='shed-secateurs')!.root;
  const stand={x:-22,z:-29.8};expect(clearAt(stand,e.barriers,{},.26)).toBe(true);
  expect(aim(e,new T.Vector3(stand.x,1.73,stand.z),shears)).toBe('shed-secateurs');
  const before=shears.position.clone(),left=shears.getObjectByName('shears-left')!,right=shears.getObjectByName('shears-right')!;
  poseSecateurs(shears,true);expect(Math.abs(left.rotation.z-right.rotation.z)).toBeLessThan(.1);
  poseSecateurs(shears,false);expect(Math.abs(left.rotation.z-right.rotation.z)).toBeGreaterThan(.5);
  expect(shears.position.distanceTo(before)).toBe(0);
 });
 it('keeps the new bedroom document and the rear gallery portrait reachable',()=>{
  const e=furnishedEstate(true);
  for(const [id,x,z]of [['bedroom-travel',8.8,-11.5],['family-photos',2.5,-13.25]] as const){
   expect(clearAt({x,z},e.upperBarriers,{},.26)).toBe(true);
   expect(aim(e,new T.Vector3(x,UPPER_FLOOR+1.65,z),e.targets.find(t=>t.id===id)!.root)).toBe(id);
  }
 });
});
