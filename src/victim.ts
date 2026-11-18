import * as T from 'three';
import type {Estate} from './world';

// The victim is a frozen, dressed character; he never enters the living NPC update loop.
export function placeVictim(e:Estate,model:T.Object3D){
 const body=new T.Group();body.name='Elias Vale';body.position.set(-18,0,3.05);body.rotation.y=.18;
 model.rotation.x=-Math.PI/2;body.add(model);e.scene.add(body);
 const head=model.getObjectByName('head');if(head)head.rotateY(.22);
 body.updateMatrixWorld(true);
 model.traverse(o=>{if(o instanceof T.SkinnedMesh){o.skeleton.update();o.computeBoundingBox();o.computeBoundingSphere();}});
 const bounds=new T.Box3().setFromObject(body);
 body.position.y=e.groundHeight(body.position.x,body.position.z)+.012-bounds.min.y;
 body.updateMatrixWorld(true);bounds.setFromObject(body);
 const center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
 e.barrier(center.x,center.z,size.x,size.z);
 e.target(body,'elias-body','Elias Vale','Examine');
 return body;
}
