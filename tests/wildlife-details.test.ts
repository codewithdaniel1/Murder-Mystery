import {it,expect} from 'vitest';
import * as T from 'three';
import {rabbitModel,ratModel,birdModel,dogModel} from '../src/wildlife-models';
import {rigDog,animateDog} from '../src/dog';
import {liningScrap} from '../src/fabric';
import {buildKitchenGarden} from '../src/kitchen-garden';
import {buildFirepit,FIREPIT} from '../src/firepit';
import {furnishedEstate} from './estate-fixture';
import {clearAt} from '../src/navigation';
import {buildCellarRats} from '../src/cellar-rats';

it('keeps the detailed animals within a small geometry budget with finite normals',()=>{
 for(const animal of [rabbitModel().root,ratModel().root,birdModel().root,dogModel()]){
  let triangles=0;animal.traverse(o=>{if(!(o instanceof T.Mesh))return;const g=o.geometry;
   triangles+=(g.index?.count??g.attributes.position.count)/3;
   for(const name of ['position','normal'])for(const value of g.attributes[name]?.array??[])expect(Number.isFinite(value)).toBe(true);
  });expect(triangles).toBeLessThan(30000);
 }
});
it('binds Pip’s new model to all four paws without nonfinite deformations',()=>{
 const motion=rigDog(dogModel());expect(motion.legs).toHaveLength(4);
 for(let frame=0;frame<150;frame++)animateDog(motion,frame<100?.025:0,1/60);
 for(const mesh of motion.meshes){
  const p=new T.Vector3();for(let i=0;i<mesh.geometry.attributes.position.count;i+=13){mesh.getVertexPosition(i,p);expect(Number.isFinite(p.length())).toBe(true);}
 }
 const bounds=new T.Box3().setFromObject(motion.root);expect(bounds.getSize(new T.Vector3()).y).toBeLessThan(.7);
});
it('makes the lining thin, folded and frayed while preserving the stitched clue',()=>{
 const scrap=liningScrap(),bounds=new T.Box3().setFromObject(scrap),size=bounds.getSize(new T.Vector3());
 expect(size.z).toBeLessThan(.035);expect(size.z).toBeGreaterThan(.008);expect(size.y).toBeGreaterThan(.2);
 expect(scrap.children.filter(c=>c instanceof T.LineSegments)).toHaveLength(2);
});
it('keeps a firepit clear of routes, solid to players, and lit without another scene light',()=>{
 const e=furnishedEstate(),before=e.barriers.length,update=buildFirepit(e);
 expect(e.barriers).toHaveLength(before+5);
 const chairs=e.scene.children.filter(c=>c.name==='Firepit garden armchair');expect(chairs).toHaveLength(4);
 for(const chair of chairs){expect(clearAt(chair.position,e.barriers,{},.26)).toBe(false);expect(new T.Box3().setFromObject(chair).min.y).toBeCloseTo(e.groundHeight(chair.position.x,chair.position.z));}
 expect(clearAt(FIREPIT,e.barriers,{},.26)).toBe(false);
 for(const side of[-1,1])expect(clearAt({x:FIREPIT.x+side*1.8,z:FIREPIT.z},e.barriers,{},.26)).toBe(true);
 const fire=e.targets.find(t=>t.id==='garden-firepit')!.root;let triangles=0;fire.traverse(o=>{if(o instanceof T.Mesh)triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3});expect(triangles).toBeLessThan(7000);let lights=0;fire.traverse(o=>{if(o instanceof T.Light)lights++});expect(lights).toBe(0);
 update(.1);const flame=fire.getObjectByName('Firepit flames')!.children[0] as T.Mesh<T.BufferGeometry,T.ShaderMaterial>;
 expect(flame.material.uniforms.time.value).toBeCloseTo(.1);
});
it('keeps cellar rats grounded and bounded through repeated running and resting cycles',()=>{
 const parent=new T.Group(),update=buildCellarRats(parent,-4.8);expect(parent.children).toHaveLength(2);
 for(let i=0;i<600;i++){
  update(.05);for(const rat of parent.children){expect(rat.position.y).toBe(-4.8);expect(Math.abs(rat.position.x)).toBeLessThan(10);expect(Number.isFinite(rat.rotation.y)).toBe(true);}
 }
});

it('grows the kitchen garden with shared leaf geometry, hanging pods and grounded raised beds',()=>{
 const e=furnishedEstate();buildKitchenGarden(e);
 const garden=e.scene.getObjectByName('Lodge kitchen garden')!;
 const leaves=garden.getObjectByName('Pointed climbing bean leaves') as T.InstancedMesh;
 const pods=garden.getObjectByName('Hanging bean pods') as T.InstancedMesh;
 expect(leaves.count).toBeGreaterThan(400);expect(leaves.count).toBeLessThan(1000);expect(pods.count).toBe(60);
 for(const mesh of[leaves,pods]){
  mesh.computeBoundingBox();expect(Number.isFinite(mesh.boundingBox!.min.length())).toBe(true);
  expect(mesh.boundingBox!.max.y).toBeLessThan(2.3);expect(mesh.boundingBox!.min.y).toBeGreaterThan(Math.min(...[-16,-20.2,-24.4].map(x=>e.groundHeight(x,-58))));
 }
});
