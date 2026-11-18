import {it,expect} from 'vitest';
import {playerStep} from '../src/player-movement';
import {estateFixture} from './estate-fixture';
import {freshState} from '../src/state';

it('keeps walk and run velocity constant across refresh rates and irregular frames',()=>{
 const schedules=[Array(120).fill(1/120),Array(60).fill(1/60),Array(30).fill(1/30),[.016,.07,.028,.09,.046,.1,.05,.08,.02,.1,.1,.1,.1,.1]];
 for(const run of [false,true])for(const schedule of schedules){
  const keys=new Set(['KeyW',...(run?['ShiftLeft']:[])]);
  let distance=0,time=0;
  for(const seconds of schedule){const step=playerStep(keys,.73,seconds);distance+=Math.hypot(step.x,step.z);time+=seconds;expect(Math.hypot(step.x,step.z)/seconds).toBeCloseTo(run?4.5:2.9,10);}
  expect(distance).toBeCloseTo(time*(run?4.5:2.9),10);
 }
});
it('normalizes diagonals, supports either shift key, and ignores suspended frames',()=>{
 const straight=playerStep(new Set(['KeyW','ShiftRight']),0,.02),diagonal=playerStep(new Set(['KeyW','KeyD','ShiftLeft']),0,.02);
 expect(Math.hypot(diagonal.x,diagonal.z)).toBeCloseTo(Math.hypot(straight.x,straight.z));
 for(const dt of [0,-1,1,Infinity,NaN]){const step=playerStep(new Set(['KeyW']),0,dt);expect(Math.hypot(step.x,step.z)).toBe(0);expect(step.seconds).toBe(0);}
 expect(playerStep(new Set(['KeyW','KeyS']),0,.02).z).toBe(0);
});
it('moves the real collision controller the same distance on slow frames and keeps flat-ground camera height steady',()=>{
 const e=estateFixture(),s=freshState();e.setPose({x:65,z:20,yaw:0,pitch:0});
 const initial=e.camera.position.clone();
 for(const dt of [.016,.08,.03,.09,.024]){const step=playerStep(new Set(['KeyW']),0,dt);const z=e.camera.position.z;e.move(step.x,step.z,s,dt);expect(z-e.camera.position.z).toBeCloseTo(2.9*dt,8);expect(e.camera.position.y).toBe(initial.y);}
});
it('smooths camera height by elapsed time rather than number of rendered frames',()=>{
 const e=estateFixture(),s=freshState();
 const height=(steps:number)=>{e.setPose({x:65,z:20,yaw:0,pitch:0});e.camera.position.y+=.15;for(let i=0;i<steps;i++)e.move(0,0,s,.1/steps);return e.camera.position.y;};
 expect(height(3)).toBeCloseTo(height(6),10);expect(height(6)).toBeCloseTo(height(12),10);
});
