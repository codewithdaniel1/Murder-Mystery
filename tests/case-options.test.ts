import {describe,it,expect} from 'vitest';
import * as T from 'three';
import {SUSPECTS,METHODS,MOTIVES,CANDIDATE_OBJECTS,buildCandidateObjects} from '../src/case-options';
import {PEOPLE,freshState,accuse,encodeSave,decodeSave,DEDUCTIONS,solveDeduction,addEvidence} from '../src/state';
import {WITNESSES,buildShed} from '../src/yard';
import {buildCellar,CELLAR_FLOOR} from '../src/cellar';
import {buildWartimeEstate} from '../src/estate-life';
import {furnishedEstate} from './estate-fixture';
import {clearAt} from '../src/navigation';
import {storyTopics,rememberStory,storyNotes} from '../src/stories';

describe('expanded accusation investigation',()=>{
 it('includes every named character and retains the supported solution',()=>{
  expect(Object.keys(SUSPECTS).sort()).toEqual([...Object.keys(PEOPLE),...Object.keys(WITNESSES)].sort());
  const s=freshState();s.arrival='present';
  for(const id of ['weapon','money','falseAlibi','passage'] as const){addEvidence(s,...DEDUCTIONS[id].needs);solveDeduction(s,id,DEDUCTIONS[id].correct)}
  for(const id of Object.keys(WITNESSES))expect(accuse(s,id,'falcon','funds').win).toBe(false);
  for(const method of Object.keys(METHODS).filter(id=>id!=='falcon'))expect(accuse(s,'rook',method,'funds').win).toBe(false);
  for(const motive of Object.keys(MOTIVES).filter(id=>id!=='funds'))expect(accuse(s,'rook','falcon',motive).win).toBe(false);
  expect(s.finished).toBe(false);expect(accuse(s,'rook','falcon','funds').win).toBe(true);
 });
 it('makes every new object reachable and inspectable from its room',()=>{
  const e=furnishedEstate();buildShed(e);buildWartimeEstate(e);buildCellar(e);buildCandidateObjects(e);
  e.cellarInterior!.visible=true;e.ray=new T.Raycaster();e.pointer=new T.Vector2();
  const stands:Record<string,[number,number,number]>={
   'candidate-poker':[-17.4,1.73,2.7],'candidate-knife':[-15.7,1.73,2.1],
   'candidate-poison':[27.0,1.73,-30.1],'candidate-rolling-pin':[-17.35,1.73,-11.7],
   'candidate-rope':[-22.8,1.73,-30.3],'candidate-wrench':[5.9,CELLAR_FLOOR+1.65,-34.05],
  };
  let triangles=0;
  for(const id of Object.keys(CANDIDATE_OBJECTS)){
   const root=e.targets.find(t=>t.id===id)!.root,[x,y,z]=stands[id];
   expect.soft(clearAt({x,z},id==='candidate-wrench'?e.cellarBarriers:e.barriers,{},.26),id+' approach').toBe(true);
   e.scene.updateMatrixWorld(true);const center=new T.Box3().setFromObject(root).getCenter(new T.Vector3());
   e.camera.position.set(x,y,z);e.camera.lookAt(center);e.camera.updateMatrixWorld(true);
   expect.soft(e.targetAt()?.id,id+' target').toBe(id);
   root.traverse(o=>{if(o instanceof T.Mesh)triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3});
  }
  expect(triangles).toBeLessThan(5000);
 });
 it('saves object observations and unlocks corroborating motive dialogue',()=>{
  const s=freshState();expect(storyTopics('hewitt',s).some(t=>t.id==='weapon-spanner')).toBe(false);
  s.flags['read:candidate-wrench']=true;
  expect(storyTopics('hewitt',s).some(t=>t.id==='weapon-spanner')).toBe(true);
  rememberStory(s,'motive-debt');expect(storyTopics('hale',s).some(t=>t.id==='motive-debt-check')).toBe(true);
  rememberStory(s,'motive-debt-check');
  const saved=decodeSave(encodeSave(s,s.pose))!;
  expect(saved.flags['read:candidate-wrench']).toBe(true);
  expect(storyNotes(saved).find(t=>t.speaker==='jonah'&&t.cleared)).toBeDefined();
  expect(saved.evidence).toEqual([]);
 });
});
