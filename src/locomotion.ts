import * as T from 'three';

/** Narrow the exported wide-stance walk without moving the planted feet vertically.
 * These rigs have independent foot controls; the thigh/calf deform bones must be
 * solved as well as moving the foot, or the ankle mesh separates from the shin.
 */
export function narrowStride(bones:Map<string,T.Bone>,actor:T.Object3D,weight:number){
 if(weight<1e-5)return;
 const left=bones.get('foot_l'),right=bones.get('foot_r');if(!left||!right)return;
 const l=actor.worldToLocal(left.getWorldPosition(new T.Vector3())),r=actor.worldToLocal(right.getWorldPosition(new T.Vector3())),middle=(l.x+r.x)/2;
 for(const side of ['l','r']){
  const hip=bones.get('thigh_'+side),knee=bones.get('calf_'+side),foot=bones.get('foot_'+side);if(!hip||!knee||!foot)continue;
  const h=hip.getWorldPosition(new T.Vector3()),k=knee.getWorldPosition(new T.Vector3()),f=foot.getWorldPosition(new T.Vector3()),orientation=foot.getWorldQuaternion(new T.Quaternion());
  const target=actor.worldToLocal(f.clone());target.x=T.MathUtils.lerp(target.x,middle+(target.x>=middle?.115:-.115),weight);actor.localToWorld(target);
  const a=h.distanceTo(k),b=k.distanceTo(f),direction=target.clone().sub(h),distance=T.MathUtils.clamp(direction.length(),Math.abs(a-b)+1e-4,a+b-1e-4);direction.normalize();
  const bend=k.clone().sub(h).addScaledVector(direction,-k.clone().sub(h).dot(direction));
  if(bend.lengthSq()<1e-8)bend.set(0,0,1).applyQuaternion(actor.getWorldQuaternion(new T.Quaternion()));bend.normalize();
  const along=(a*a-b*b+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,a*a-along*along));
  const nextKnee=h.clone().addScaledVector(direction,along).addScaledVector(bend,height);
  const lowerLocal=f.clone().sub(k).applyQuaternion(knee.getWorldQuaternion(new T.Quaternion()).invert()).normalize();
  const rotate=(bone:T.Bone,from:T.Vector3,to:T.Vector3)=>{const delta=new T.Quaternion().setFromUnitVectors(from.normalize(),to.normalize()),world=bone.getWorldQuaternion(new T.Quaternion()).premultiply(delta);bone.quaternion.copy(bone.parent!.getWorldQuaternion(new T.Quaternion()).invert().multiply(world));bone.updateMatrixWorld(true)};
  rotate(hip,k.clone().sub(h),nextKnee.clone().sub(h));
  const nowKnee=knee.getWorldPosition(new T.Vector3());rotate(knee,lowerLocal.applyQuaternion(knee.getWorldQuaternion(new T.Quaternion())),target.clone().sub(nowKnee));
  foot.position.copy(foot.parent!.worldToLocal(target));foot.quaternion.copy(foot.parent!.getWorldQuaternion(new T.Quaternion()).invert().multiply(orientation));foot.updateMatrixWorld(true);
 }
}
