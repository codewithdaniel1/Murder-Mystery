import {describe,it,expect} from 'vitest';
import {Raycaster,Vector3} from 'three';
import {estateFixture} from './estate-fixture';
const e=estateFixture();for(const d of e.doors.values())d.pivot.rotation.y=0;e.scene.updateMatrixWorld(true);
function hit(x:number,y:number,z:number,dx:number,dz:number,far=1.6){return new Raycaster(new Vector3(x,y,z),new Vector3(dx,0,dz),0,far).intersectObjects(e.scene.children,true).length>0}
describe('castle shell and door seams',()=>{
 it('has no gaps across the closed front wall at floor, eye and lintel height',()=>{const holes=[];for(let x=-18;x<=18;x+=.13)for(const y of[.25,.75,1.7,3.3,3.5,3.7,4.6])if(!hit(x,y,12.8,0,-1))holes.push([Number(x.toFixed(2)),y]);expect(holes).toEqual([])});
 it('seals the front entry jambs where the old wall panels fell short',()=>{for(const x of[-1.95,-1.75,1.75,1.95])for(const y of[.25,.75,3.5,3.7])expect(hit(x,y,12.8,0,-1),`${x}, ${y}`).toBe(true)});
 it('fully frames both hall doors, including the upper corner beside each lintel',()=>{for(const side of[-1,1])for(let z=2.8;z<6.8;z+=.11)for(const y of[.25,1.7,3.3,3.6,4.6])expect(hit(side*6.4,y,z,side,0),`${side},${z},${y}`).toBe(true)});
 it('limits rear passage openings to the two framed doorways',()=>{for(let x=-18;x<18;x+=.17){const opening=Math.abs(x-9.2)<1.3||Math.abs(x+9.2)<1.3;if(!opening)expect(hit(x,1.7,-9.3,0,-1),String(x)).toBe(true);expect(hit(x,3.7,-9.3,0,-1),String(x)).toBe(true)}});
 it('leaves the intended entry walkable when the door opens',()=>{e.doors.get('front')!.pivot.rotation.y=-Math.PI/2;e.scene.updateMatrixWorld(true);expect(hit(0,1.7,12.8,0,-1)).toBe(false);e.doors.get('front')!.pivot.rotation.y=0;e.scene.updateMatrixWorld(true)});
});
