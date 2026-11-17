import * as T from 'three';

/** Move an ankle with a two-bone leg solve, keeping the shoe's orientation. */
export function plantFoot(bones:Map<string,T.Bone>,actor:T.Object3D,side:'l'|'r',localTarget:T.Vector3,roll=0){
 const hip=bones.get('thigh_'+side),knee=bones.get('calf_'+side),foot=bones.get('foot_'+side);
 if(!hip||!knee||!foot||!hip.parent||!knee.parent||!foot.parent)return;
 actor.updateWorldMatrix(true,true);
 const h=hip.getWorldPosition(new T.Vector3()),k=knee.getWorldPosition(new T.Vector3()),f=foot.getWorldPosition(new T.Vector3());
 const shoeRotation=foot.getWorldQuaternion(new T.Quaternion());
 if(roll)shoeRotation.premultiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0).transformDirection(actor.matrixWorld),roll));
 const lowerAxis=f.clone().sub(k).applyQuaternion(knee.getWorldQuaternion(new T.Quaternion()).invert());
 const a=h.distanceTo(k),b=k.distanceTo(f),target=actor.localToWorld(localTarget.clone());
 const toTarget=target.clone().sub(h),distance=T.MathUtils.clamp(toTarget.length(),Math.abs(a-b)+.0001,a+b-.0001);
 if(distance<.0001)return;
 const direction=toTarget.normalize();target.copy(h).addScaledVector(direction,distance);
 // A fixed forward pole keeps the knee from flipping sideways when the leg
 // approaches full extension. The idle knee offset is unstable at that point.
 const bend=new T.Vector3(0,0,1).transformDirection(actor.matrixWorld);
 bend.addScaledVector(direction,-bend.dot(direction));
 if(bend.lengthSq()<1e-7)bend.set(0,1,0).transformDirection(actor.matrixWorld).addScaledVector(direction,-bend.dot(direction));
 bend.normalize();
 const along=(a*a-b*b+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,a*a-along*along));
 const nextKnee=h.clone().addScaledVector(direction,along).addScaledVector(bend,height);
 const rotate=(bone:T.Bone,from:T.Vector3,to:T.Vector3)=>{
  const delta=new T.Quaternion().setFromUnitVectors(from.normalize(),to.normalize());
  const world=bone.getWorldQuaternion(new T.Quaternion()).premultiply(delta);
  bone.quaternion.copy(bone.parent!.getWorldQuaternion(new T.Quaternion()).invert().multiply(world));
  bone.updateWorldMatrix(false,true);
 };
 rotate(hip,k.clone().sub(h),nextKnee.clone().sub(h));
 const newKnee=knee.getWorldPosition(new T.Vector3());
 // The imported rig gives the ankle its own control, separate from the calf.
 // Aim the calf's original lower axis at the ankle, then move that control.
 rotate(knee,lowerAxis.applyQuaternion(knee.getWorldQuaternion(new T.Quaternion())),target.clone().sub(newKnee));
 foot.position.copy(foot.parent.worldToLocal(target));
 // A level shoe avoids the toe flick inherited from the imported animation.
 foot.quaternion.copy(foot.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(shoeRotation));
 foot.updateWorldMatrix(false,true);
}
