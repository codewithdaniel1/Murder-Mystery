import type {PersonId} from './state';
import {findPath,clearSegment} from './navigation';
import type {Point,Obstacle} from './navigation';
export type Activity='tidy'|'read'|'look'|'garden'|'car';
export interface Stop extends Point {seconds:number;face:number;activity:Activity;label:string}
export const ROUTINES:Record<PersonId,Stop[]>={
 june:[{x:2.6,z:6.7,seconds:8,face:.5,activity:'tidy',label:'Straightening the hall table'},{x:-3,z:-7.5,seconds:9,face:-2.5,activity:'tidy',label:'Dusting the mantel clock'},{x:3,z:3,seconds:6,face:2.5,activity:'look',label:'Checking the entrance hall'}],
 rook:[{x:-14.2,z:1.5,seconds:10,face:Math.PI,activity:'read',label:'Reviewing the estate accounts'},{x:-16,z:10.3,seconds:6,face:0,activity:'look',label:'Looking out over the drive'},{x:-18,z:6.2,seconds:7,face:-1.6,activity:'read',label:'Consulting his notebook'}],
 mara:[{x:13,z:-7.8,seconds:8,face:Math.PI,activity:'read',label:'Browsing the library shelves'},{x:14.4,z:3,seconds:12,face:1.57,activity:'read',label:'Comparing archive references'},{x:10,z:5,seconds:6,face:0,activity:'look',label:'Taking a break from her research'}],
 ada:[{x:-9,z:-20,seconds:8,face:Math.PI,activity:'look',label:'Taking in the garden'},{x:-7,z:-33.9,seconds:9,face:0,activity:'read',label:'Reading beside the garden bench'},{x:-7,z:-23,seconds:6,face:1.5,activity:'look',label:'Watching the fountain'}],
 tomas:[{x:23,z:-23,seconds:8,face:Math.PI,activity:'garden',label:'Tending the border plants'},{x:27.6,z:-28.7,seconds:10,face:2.4,activity:'garden',label:'Working at the potting bench'},{x:26,z:-23,seconds:5,face:-1.5,activity:'look',label:'Checking the glasshouse'}],
 beatrice:[{x:2,z:4,seconds:9,face:1.5,activity:'look',label:'Inspecting the entrance hall'},{x:-10,z:6,seconds:10,face:-1.5,activity:'read',label:'Reading Elias’s correspondence'},{x:2,z:1,seconds:8,face:0,activity:'look',label:'Considering the investigation'}],
 jonah:[{x:4,z:20.6,seconds:10,face:0,activity:'car',label:'Polishing the radiator grille'},{x:6,z:25,seconds:8,face:-1.57,activity:'car',label:'Checking the luggage straps'},{x:6,z:22.5,seconds:7,face:-1.57,activity:'look',label:'Waiting beside the driver’s door'}]
};
interface Memory {index:number;remaining:number;path:Point[];replan:number;started:boolean;speed:number}
export interface RoutineResult {position:Point;moving:boolean;face:number;activity:Activity|null;label:string}
export class EstateRoutines {
 memory=new Map<PersonId,Memory>();
 reset(){this.memory.clear()}
 update(id:PersonId,position:Point,dt:number,barriers:Obstacle[],doors:Record<string,boolean>,paused:boolean,player?:Point,facing?:number):RoutineResult{
 let m=this.memory.get(id);if(!m){m={index:0,remaining:0,path:[],replan:0,started:false,speed:0};this.memory.set(id,m)}const stops=ROUTINES[id];let task=stops[m.index];
 const still=():RoutineResult=>({position:{...position},moving:false,face:Math.hypot(position.x-task.x,position.z-task.z)<.3?task.face:(facing??task.face),activity:Math.hypot(position.x-task.x,position.z-task.z)<.3?task.activity:null,label:task.label});
 if(paused)return {...still(),activity:null};
 if(player&&Math.hypot(position.x-player.x,position.z-player.z)<1.35)return still();
 if(Math.hypot(position.x-task.x,position.z-task.z)<.14){if(!m.started){m.remaining=task.seconds;m.started=true}m.remaining-=dt;if(m.remaining>0){m.speed=0;return still();}m.index=(m.index+1)%stops.length;m.path=[];m.started=false;task=stops[m.index]}
 m.replan-=dt;if(!m.path.length){if(m.replan>0)return still();m.path=findPath(position,task,barriers,doors);m.replan=2;if(!m.path.length)return still()}
 let destination=m.path[0];while(m.path.length>1&&Math.hypot(position.x-destination.x,position.z-destination.z)<.005){m.path.shift();destination=m.path[0]}
 // Open a door only when physically approaching it; collision still guards the next step.
 for(const b of barriers)if(b.door&&Math.hypot(position.x-b.x,position.z-b.z)<2.2)doors[b.door]=true;
 const distance=Math.hypot(destination.x-position.x,destination.z-position.z);if(distance<.005){m.path.shift();return still()}
 const face=Math.atan2(destination.x-position.x,destination.z-position.z);
 // Turn toward the next path segment before translating, avoiding sideways skating.
 const angle=facing===undefined?0:Math.abs(Math.atan2(Math.sin(face-facing),Math.cos(face-facing)));
 const cruise=.95*Math.max(0,Math.cos(angle));const desired=angle>.8?0:Math.min(cruise,Math.max(.12,Math.sqrt(2*1.4*Math.max(0,distance-.12))));
 m.speed+=Math.max(-dt*2,Math.min(dt*1.6,desired-m.speed));
 if(angle>.8||m.speed<.001)return {...still(),face,activity:null};
 const travel=Math.min(distance,dt*m.speed),next={x:position.x+(destination.x-position.x)/distance*travel,z:position.z+(destination.z-position.z)/distance*travel};
 if(!clearSegment(position,next,barriers,doors,.3)){m.speed=0;m.path=[];m.replan=.5;return still()}
 if(player&&Math.hypot(next.x-player.x,next.z-player.z)<1.1)return still();
 return {position:next,moving:true,face,activity:null,label:'Walking · '+task.label.toLowerCase()};
 }
}
