import * as T from 'three';
import type {Estate} from './world';
import {craftedTable,finishProp} from './craftsmanship';
import {wovenFabric} from './detail';

function vase(e:Estate,x:number,y:number,z:number){
 const root=new T.Group();root.position.set(x,y,z);const ceramic=e.mat(0x8d9e92,.48),stem=e.mats.leaf;
 const shape=[new T.Vector2(.075,0),new T.Vector2(.115,.08),new T.Vector2(.1,.2),new T.Vector2(.048,.25),new T.Vector2(.055,.31)];
 root.add(new T.Mesh(new T.LatheGeometry(shape,16),ceramic));
 for(let i=0;i<5;i++){
  const a=i*2.4,xx=Math.cos(a)*.12,zz=Math.sin(a)*.12;
  const stalk=e.cyl(.006,.006,.42,xx*.6,.39,zz*.6,stem,root,6);stalk.rotation.z=-xx*.5;
  for(let j=0;j<5;j++){const angle=j*Math.PI*2/5;e.round(.055,.019,.065,xx+Math.cos(angle)*.027,.59+(i%2)*.03,zz+Math.sin(angle)*.027,e.mats.cream,root);}
  e.cyl(.016,.016,.018,xx,.607+(i%2)*.03,zz,e.mats.gold,root,8);
 }
 e.scene.add(finishProp(root));
}
function luggage(e:Estate,x:number,y:number,z:number){
 const root=new T.Group();root.position.set(x,y,z);root.name='Leather travelling trunk';
 e.round(1,.43,.55,0,.23,0,e.mats.leather??e.mats.panel,root);
 for(const xx of [-.34,.34]){e.box(.055,.44,.56,xx,.23,0,e.mats.panel,root);e.box(.065,.07,.03,xx,.31,.29,e.mats.gold,root);}
 e.round(.24,.045,.055,0,.27,.307,e.mats.dark,root);
 e.scene.add(finishProp(root));
}
export function dressUpperRooms(e:Estate,base:number,solid:(w:number,d:number,x:number,z:number)=>void){
 const walnut=e.mats.panel,brass=e.mats.gold,linen=wovenFabric(e,0xc5b89b);
 // A narrow console and runner compose the gallery without obstructing the stairs.
 const console=craftedTable(e,2.5,-15.05,2.25,.53,.79,false);console.position.y=base;solid(2.25,.53,2.5,-15.05);
 vase(e,3.1,base+.89,-15.05);
 e.box(2.12,.015,8.2,2.2,base+.012,-4.3,wovenFabric(e,0x6d493c));
 // Writing desk in the bedroom, plus a dressing mirror and personal luggage.
 const desk=craftedTable(e,8.65,-13.7,3.05,.72,.92,false);desk.position.y=base;solid(3.05,.72,8.65,-13.7);
 const letters=e.paper('TRAVEL PLANS',['Train to London · postponed','Leave the blue case packed.'],8.8,base+.977,-13.65);letters.scale.setScalar(.55);e.target(letters,'bedroom-travel','Postponed travel plans','Read');
 const chair=new T.Group();chair.position.set(8.65,base,-12.7);chair.name='Bedroom writing chair';
 e.round(.58,.11,.55,0,.47,0,walnut,chair);e.round(.51,.055,.49,0,.55,0,linen,chair);
 for(const xx of [-.23,.23])for(const zz of [-.21,.21])e.cyl(.024,.035,.44,xx,.23,zz,walnut,chair,10);
 for(const xx of [-.23,.23])e.box(.045,.55,.045,xx,.78,.23,walnut,chair);
 for(const yy of [.77,.97])e.round(.5,.09,.055,0,yy,.23,walnut,chair);
 e.scene.add(finishProp(chair));solid(.62,.6,8.65,-12.7);
 const dresser=new T.Group();dresser.name='Walnut dressing mirror';dresser.position.set(19.9,base,-9.2);dresser.rotation.y=-Math.PI/2;
 e.round(1.2,.12,.52,0,.83,0,walnut,dresser);e.round(.84,1.05,.08,0,1.55,-.13,walnut,dresser);
 const mirror=e.mat(0x9ba8a1,.22,.65);e.round(.73,.94,.018,0,1.55,-.078,mirror,dresser);
 for(const xx of [-.45,.45])e.box(.065,.8,.065,xx,.4,0,walnut,dresser);
 for(const xx of [-.27,0,.27])e.cyl(.033,.035,.12,xx,.95,.07,brass,dresser,12);
 e.scene.add(finishProp(dresser));solid(.65,1.3,19.9,-9.2);
 luggage(e,17,base,-8.8);solid(1.05,.6,17,-8.8);
 // Linen room baskets and folded blankets sit inside the existing shelf footprint.
 const basket=new T.Group();basket.position.set(-16,base+.34,-12.2);
 for(let i=0;i<8;i++)e.box(.88,.024,.62,0,i*.045,0,walnut,basket);
 for(const xx of [-.39,.39])e.box(.045,.39,.66,xx,.17,0,e.mats.wood,basket);
 e.round(.73,.11,.51,0,.39,0,linen,basket);basket.scale.y=.8;e.scene.add(finishProp(basket));
}
export function dressAttic(e:Estate,base:number){
 // Repair labels and fabric change the silhouettes of existing stored crates.
 const root=new T.Group();root.name='Attic storage textiles';root.position.y=base;
 const cloth=wovenFabric(e,0xb5ac94);
 for(const [x,z,h,w]of [[-11.8,-5.45,.88,1.1],[-14.1,2.5,.72,1.8]]){
  e.round(w,.055,.64,x,h+.075,z,cloth,root);
  e.box(.34,.03,.17,x+.15,h+.12,z+.1,e.mats.red,root);
  e.box(.29,.018,.14,x+.15,h+.147,z+.1,e.mats.paper,root);
 }
 // Worn leather straps on the existing trunk, not an oversized cover.
 for(const xx of [-14.04,-13.16])e.box(.06,.7,.89,xx,.35,-5.3,e.mats.dark,root);
 e.scene.add(finishProp(root));
}
export function dressGroundRooms(e:Estate){
 vase(e,4.65,1.03,8);
 const root=new T.Group();root.name='Study writing set';root.position.set(-16.15,1.03,-.37);
 e.round(.27,.025,.17,0,0,0,e.mats.panel,root);e.cyl(.035,.045,.07,-.065,.05,0,e.mats.dark,root,12);
 e.cyl(.039,.039,.016,-.065,.09,0,e.mats.gold,root,12);
 const pen=e.cyl(.006,.006,.24,.055,.035,0,e.mats.gold,root,8);pen.rotation.z=1.32;
 e.scene.add(finishProp(root));
}

export function drapedQuilt(e:Estate,x:number,y:number,z:number,w:number,d:number,cloth:T.MeshStandardMaterial){
 const vertices:number[]=[],uv:number[]=[],indices:number[]=[],nx=24,nz=24;
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
  const u=i/nx,v=j/nz,xx=(u-.5)*w,zz=(v-.5)*d;
  const side=T.MathUtils.smoothstep(Math.abs(xx),w*.435,w*.5),end=T.MathUtils.smoothstep(v,.89,1);
  const folds=Math.cos(xx*32+Math.sin(zz*3))*.009+Math.cos(zz*23)*.004;
  vertices.push(x+xx,y+folds-.21*side-.16*end,z+zz);uv.push(u*2,v*2);
  if(i&&j){const a=j*(nx+1)+i,b=a-nx-1;indices.push(a-1,b,a,b-1,b,a-1);}
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
 const mat=cloth.clone();mat.side=T.DoubleSide;const mesh=new T.Mesh(geometry,mat);mesh.castShadow=true;mesh.receiveShadow=true;e.scene.add(mesh);
}
