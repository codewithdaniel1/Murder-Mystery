import {ratModel} from './wildlife-models';
import * as T from 'three';

export function buildCellarRats(parent:T.Group,floor:number){
 const rats=[
  {x:-8.55,z:-10.8,rx:.58,rz:2.55,height:0,period:13},
  {x:6.35,z:-8.35,rx:.64,rz:1.95,height:0,period:11}
 ].map((route,i)=>{
  const {root,body,head,tail,paws}=ratModel(i);parent.add(root);
  return {route,root,body,head,tail,paws,time:i*3.4};
 });
 const update=(dt:number)=>{
  for(const rat of rats){
   const {route,root,body,head,tail,paws}=rat;
   rat.time=(rat.time+dt)%(route.period+2);
   const moving=rat.time<route.period;
   const a=Math.min(rat.time/route.period,1)*2*Math.PI;
   root.position.set(route.x+route.rx*Math.cos(a),floor+route.height,route.z+route.rz*Math.sin(a));
   root.rotation.y=Math.atan2(-route.rx*Math.sin(a),route.rz*Math.cos(a));
   const step=rat.time*34;
   body.position.y=moving?.009*(1+Math.cos(step*2)):0;
   head.rotation.x=moving?0:.15+.11*Math.sin(rat.time*15);
   tail.rotation.y=.13*Math.sin(rat.time*(moving?12:5));
   for(const {paw,phase,z} of paws){
    paw.position.z=z+(moving?Math.cos(step+phase)*.033:0);
    paw.position.y=.006+(moving?Math.max(0,Math.sin(step+phase))*.028:0);
   }
  }
 };
 update(0);
 return update;
}
