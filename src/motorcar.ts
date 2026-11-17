import * as T from 'three';
import type {Estate} from './world';
import {finishProp} from './craftsmanship';

// Cross-sections form a rounded coachbuilt shell instead of stacked boxes.
function coachwork(sections:number[][],material:T.Material,parent:T.Group){
 const vertices:number[]=[],uv:number[]=[],indices:number[]=[],segments=24;
 sections.forEach(([z,width,bottom,top],row)=>{
  for(let i=0;i<=segments;i++){
   const angle=i/segments*Math.PI*2,c=Math.cos(angle),s=Math.sin(angle);
   vertices.push(Math.sign(c)*Math.pow(Math.abs(c),.45)*width,(bottom+top)/2+Math.sign(s)*Math.pow(Math.abs(s),.55)*(top-bottom)/2,z);
   uv.push(i/segments,row/(sections.length-1));
   if(row&&i){const a=row*(segments+1)+i,b=a-segments-1;indices.push(a-1,b-1,b,a-1,b,a);}
  }
 });
 // End faces are covered with triangle fans, with outward winding at each end.
 for(const row of [0,sections.length-1])for(let i=1;i<segments-1;i++){
  const start=row*(segments+1);if(row===0)indices.push(start,start+i+1,start+i);else indices.push(start,start+i,start+i+1);
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
 const mesh=new T.Mesh(geometry,material);parent.add(mesh);return mesh;
}
function pane(points:number[][],material:T.Material,parent:T.Group){
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();const mesh=new T.Mesh(g,material);parent.add(mesh);return mesh;
}
export function makeEstateSaloon(e:Estate){
 const car=new T.Group();car.name='Bramblewick pre-war touring saloon';
 const body=new T.Group();car.add(body);
 const paint=e.mat(0x233c34,.3,.5),chrome=e.mat(0xa6ada7,.26,.88),rubber=e.mat(0x171b19,.96),interior=e.mat(0x4a3930,.96),glass=e.mat(0x99b7b0,.2,.05);
 glass.transparent=true;glass.opacity=.42;glass.depthWrite=false;glass.side=T.DoubleSide;
 coachwork([[-2.28,.64,.66,1.03],[-2.05,.75,.59,1.12],[-1.2,.84,.56,1.19],[-.65,.9,.55,1.22],[.8,.92,.55,1.2],[1.65,.85,.57,1.17],[2.3,.67,.62,1.05]],paint,body);
 coachwork([[-.86,.68,1.77,1.83],[-.5,.79,1.8,1.98],[.55,.8,1.8,2.02],[1.07,.71,1.77,1.87]],paint,body);
 const beam=(a:number[],b:number[],r:number,m:T.Material)=>{
  const start=new T.Vector3(...a),end=new T.Vector3(...b),v=end.clone().sub(start);
  const mesh=e.cyl(r,r,v.length(),...start.clone().add(end).multiplyScalar(.5).toArray() as [number,number,number],m,body,10);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());
 };
 for(const side of [-1,1]){
  const x=side*.88;
  pane([[side*.81,1.22,-.96],[side*.7,1.8,-.7],[side*.78,1.8,.15],[x,1.23,.15]],glass,body);
  pane([[x,1.23,.27],[side*.78,1.8,.27],[side*.69,1.79,1.06],[side*.82,1.22,1.39]],glass,body);
  beam([side*.81,1.2,-.98],[side*.7,1.81,-.7],.043,paint);
  beam([x,1.2,.21],[side*.78,1.82,.21],.04,paint);
  beam([side*.82,1.2,1.4],[side*.69,1.8,1.07],.05,paint);
  beam([x,1.23,-.87],[x,1.23,1.3],.015,chrome);
  // Door seams, handles, running boards and rounded separate wings.
  for(const z of [-.92,.21,1.36])beam([side*.912,.73,z],[side*.9,1.2,z],.006,rubber);
  for(const z of [-.02,1.04])e.round(.035,.035,.17,side*.94,1.15,z,chrome,body);
  e.round(.3,.075,2.17,side*1.01,.46,.1,rubber,body);
  e.round(.32,.025,2.2,side*1.01,.51,.1,chrome,body);
  for(const z of [-1.45,1.45]){
   const wing=new T.Mesh(new T.TorusGeometry(.49,.085,8,28,Math.PI),paint);wing.rotation.y=Math.PI/2;wing.position.set(side*1.005,.46,z);wing.scale.z=1.65;body.add(wing);
   const wheel=new T.Group();wheel.name='road-wheel';wheel.position.set(side*1.04,.46,z);car.add(wheel);
   const tire=e.cyl(.408,.408,.225,0,0,0,rubber,wheel,32);tire.rotation.z=Math.PI/2;
   const rim=e.cyl(.272,.272,.235,0,0,0,chrome,wheel,24);rim.rotation.z=Math.PI/2;
   const hub=e.cyl(.17,.17,.26,0,0,0,paint,wheel,20);hub.rotation.z=Math.PI/2;
   const cap=e.cyl(.105,.105,.27,0,0,0,chrome,wheel,20);cap.rotation.z=Math.PI/2;
   const ring=new T.Mesh(new T.TorusGeometry(.335,.012,5,32),rubber);ring.rotation.y=Math.PI/2;ring.position.x=side*.116;wheel.add(ring);finishProp(wheel);
  }
 }
 pane([[-.81,1.22,-.98],[.81,1.22,-.98],[.7,1.8,-.71],[-.7,1.8,-.71]],glass,body);
 pane([[.82,1.22,1.4],[-.82,1.22,1.4],[-.69,1.79,1.08],[.69,1.79,1.08]],glass,body);
 beam([0,1.23,-.99],[0,1.8,-.72],.014,chrome);
 for(const x of [-.34,.34])beam([x,1.27,-1],[x+.15,1.45,-.9],.009,rubber);
 e.round(1.46,.24,.44,0,1.18,-.63,interior,body);
 for(const z of [.02,.99]){
  e.round(1.48,.18,.55,0,1.15,z,interior,body);e.round(1.47,.48,.15,0,1.43,z+.21,interior,body);
  for(const x of [-.56,-.28,0,.28,.56])e.box(.009,.33,.012,x,1.44,z+.127,chrome,body);
 }
 const steering=new T.Mesh(new T.TorusGeometry(.18,.012,7,24),rubber);steering.position.set(.47,1.49,-.46);steering.rotation.x=-.6;body.add(steering);
 e.round(1.14,.52,.12,0,.91,-2.29,chrome,body);e.box(.97,.42,.035,0,.91,-2.36,rubber,body);
 for(let i=0;i<17;i++)e.box(.018,.4,.028,-.448+i*.056,.91,-2.383,chrome,body);
 for(const x of [-.84,.84]){
  e.cyl(.169,.17,.17,x,.99,-2.11,chrome,body,24).rotation.x=Math.PI/2;
  e.cyl(.143,.143,.012,x,.99,-2.205,e.mats.cream,body,24).rotation.x=Math.PI/2;
  e.round(.1,.1,.04,x,.87,2.23,e.mats.red,body);
 }
 for(const z of [-2.46,2.45]){e.round(2.18,.095,.13,0,.49,z,chrome,body);for(const x of [-.6,.6])e.round(.08,.16,.24,x,.55,z-Math.sign(z)*.09,chrome,body);}
 e.box(.59,.14,.022,0,.59,-2.4,rubber,body);
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const ink=canvas.getContext('2d')!;ink.fillStyle='#202620';ink.fillRect(0,0,256,64);ink.fillStyle='#ddd7bf';ink.font='40px Georgia';ink.textAlign='center';ink.fillText('BW 1938',128,47);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const plate=new T.Mesh(new T.PlaneGeometry(.55,.13),new T.MeshStandardMaterial({map:texture,roughness:.8}));plate.position.set(0,.59,-2.415);plate.rotation.y=Math.PI;body.add(plate);
 finishProp(body);return car;
}
export function rollCarWheels(car:T.Group,distance:number){for(const child of car.children)if(child.name==='road-wheel')child.rotation.x-=distance/.408;}

export function makeSaloonBoot(e:Estate){
 const boot=new T.Group();boot.position.set(0,1.17,1.43);
 coachwork([[0,.79,-.025,.055],[.45,.76,-.06,.022],[.91,.66,-.145,-.07]],e.mat(0x233c34,.3,.5),boot);
 e.round(.16,.04,.025,0,-.045,.89,e.mats.gold,boot);return boot;
}
