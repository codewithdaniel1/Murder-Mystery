import * as T from 'three';

const oval=new T.SphereGeometry(1,20,14);
let furMap:T.DataTexture|undefined;
const coats=new Map<string,T.MeshStandardMaterial>();
function coat(color:number){
 const key=String(color);if(coats.has(key))return coats.get(key)!;
 if(!furMap){
  const n=128,data=new Uint8Array(n*n*4);
  let seed=721379;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   seed=(Math.imul(seed,1664525)+1013904223)>>>0;
   const grain=seed/4294967296;
   const i=(y*n+x)*4,v=Math.round(229+grain*24);data.set([v,v,v,255],i);
  }
  furMap=new T.DataTexture(data,n,n);furMap.colorSpace=T.SRGBColorSpace;furMap.wrapS=furMap.wrapT=T.RepeatWrapping;furMap.minFilter=T.LinearMipmapLinearFilter;furMap.repeat.set(5,5);furMap.generateMipmaps=true;furMap.needsUpdate=true;
 }
 const mat=new T.MeshStandardMaterial({color,map:furMap,bumpMap:furMap,bumpScale:.00025,roughness:.98});coats.set(key,mat);return mat;
}
const skin=new T.MeshStandardMaterial({color:0x92726c,roughness:.88});
const eye=new T.MeshStandardMaterial({color:0x130f0c,roughness:.16});
const nose=new T.MeshStandardMaterial({color:0x3c2e29,roughness:.65});
function ellipsoid(parent:T.Object3D,mat:T.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number){
 const m=new T.Mesh(oval,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
/** Smooth tapered cross-sections join the torso and muzzle into organic silhouettes. */
function profile(parent:T.Object3D,mat:T.Material,rings:number[][]){
 const centerCurve=new T.CatmullRomCurve3(rings.map(([z,y,rx])=>new T.Vector3(z,y,rx)));
 const heightCurve=new T.CatmullRomCurve3(rings.map(([z,_y,_rx,ry])=>new T.Vector3(z,ry,0)));
 const controls=rings;
 rings=Array.from({length:(controls.length-1)*3+1},(_,i)=>{
  const t=i/((controls.length-1)*3),p=centerCurve.getPoint(t),h=heightCurve.getPoint(t);
  return [p.x,p.y,Math.max(.001,p.z),Math.max(.001,h.y)];
 });
 const p:number[]=[],uv:number[]=[],ix:number[]=[],sides=20;
 rings.forEach(([z,y,rx,ry],j)=>{
  for(let i=0;i<=sides;i++){const a=i/sides*Math.PI*2;p.push(Math.cos(a)*rx,y+Math.sin(a)*ry,z);uv.push(i/sides,j/(rings.length-1));
   if(j<rings.length-1&&i<sides){const k=j*(sides+1)+i;ix.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}}
 });
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();const mesh=new T.Mesh(g,mat);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function whiskers(parent:T.Object3D,z:number,y:number,spread:number){
 const points:number[]=[];
 for(const side of[-1,1])for(let i=0;i<3;i++)points.push(side*.012,y,z,side*spread,y+(i-1)*.012,z-.01-i*.008);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));parent.add(new T.LineSegments(g,new T.LineBasicMaterial({color:0x9d9588,transparent:true,opacity:.65})));
}
function ear(parent:T.Group,x:number,y:number,z:number,length:number,width:number,outer:T.Material){
 const root=new T.Group();root.position.set(x,y,z);parent.add(root);
 const shape=new T.Shape();shape.moveTo(-width*.35,0);shape.bezierCurveTo(-width,length*.35,-width*.65,length*.9,0,length);shape.bezierCurveTo(width*.65,length*.9,width,length*.35,width*.35,0);shape.closePath();
 const g=new T.ShapeGeometry(shape,12);const pos=g.attributes.position;
 for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin(pos.getY(i)/length*Math.PI)*.018);
 g.computeVertexNormals();const outside=new T.Mesh(g,outer.clone());(outside.material as T.MeshStandardMaterial).side=T.DoubleSide;root.add(outside);
 const inner=new T.Mesh(g,skin);inner.scale.set(.5,.78,1);inner.position.set(0,.008,.001);root.add(inner);return root;
}
export function rabbitModel(index=0){
 const root=new T.Group(),head=new T.Group();root.name='Wild rabbit';const fur=coat(index%2?0x756953:0x80705a),pale=coat(0xb6ad96);
 profile(root,fur,[[-.26,.13,.002,.002],[-.20,.16,.09,.1],[-.12,.18,.115,.135],[0,.18,.095,.105],[.09,.2,.055,.072],[.13,.21,.002,.002]]);
 head.position.set(0,.215,.115);root.add(head);
 profile(head,fur,[[-.055,0,.002,.002],[-.02,.014,.065,.067],[.035,.0,.061,.052],[.088,-.018,.03,.024],[.111,-.02,.002,.002]]);
 for(const side of[-1,1]){
  ellipsoid(head,pale,side*.023,-.025,.077,.028,.024,.035);
  ellipsoid(head,eye,side*.054,.018,.031,.008,.009,.006);
  const pinna=ear(head,side*.034,.047,-.024,.19,.035,fur);pinna.rotation.z=-side*.18;pinna.rotation.x=-.13;
 }
 ellipsoid(head,nose,0,-.015,.109,.009,.006,.006);whiskers(head,.09,-.02,.09);
 ellipsoid(root,pale,0,.14,-.263,.039,.039,.037);
 const feet:T.Group[]=[];
 for(const hind of[true,false])for(const side of[-1,1]){
  const foot=new T.Group();foot.position.set(side*(hind?.08:.05),.025,hind?-.13:.095);root.add(foot);feet.push(foot);
  if(hind)ellipsoid(root,fur,side*.085,.103,-.112,.062,.08,.072);
  else ellipsoid(root,fur,side*.05,.092,.085,.022,.075,.027);
  ellipsoid(foot,fur,0,0,.027,hind?.032:.018,.021,hind?.073:.039);
  for(let toe=0;toe<3;toe++)ellipsoid(foot,pale,(toe-1)*.01,-.003,hind?.082:.06,.006,.009,.012);
 }
 return {root,head,feet};
}
export function ratModel(index=0){
 const root=new T.Group(),body=new T.Group(),head=new T.Group();root.add(body);root.name=index?'Storeroom rat':'Wine vault rat';const fur=coat(index?0x514d44:0x6c6150);
 profile(body,fur,[[-.17,.075,.002,.002],[-.12,.084,.058,.055],[-.025,.091,.064,.065],[.055,.09,.047,.05],[.1,.087,.002,.002]]);
 head.position.set(0,.09,.075);body.add(head);
 profile(head,fur,[[-.025,0,.002,.002],[0,.009,.039,.039],[.045,-.009,.029,.027],[.099,-.021,.007,.009]]);
 ellipsoid(head,nose,0,-.02,.099,.009,.007,.007);whiskers(head,.085,-.012,.079);
 const paws:{paw:T.Group;phase:number;z:number}[]=[];
 for(const side of[-1,1]){
  const pinna=ear(head,side*.031,.025,.006,.042,.023,fur);pinna.rotation.z=-side*.55;
  ellipsoid(head,eye,side*.032,.012,.039,.006,.006,.005);
  for(const fore of[-1,1]){
   const paw=new T.Group();paw.position.set(side*(fore>0?.038:.05),.014,fore*.085);root.add(paw);
   ellipsoid(paw,fur,0,.015,-.008,.015,.026,.02);
   for(let toe=0;toe<4;toe++)ellipsoid(paw,skin,(toe-1.5)*.006,0,.015,.004,.006,.021);
   paws.push({paw,phase:side===fore?0:Math.PI,z:paw.position.z});
  }
 }
 const curve=new T.CatmullRomCurve3([[0,.075,-.14],[.025,.035,-.22],[.045,.015,-.32],[.012,.01,-.41]].map(p=>new T.Vector3(...p as [number,number,number])));
 const tailGeo=new T.TubeGeometry(curve,20,.008,6,false),p=tailGeo.attributes.position;
 // Taper the bare tail all the way to its fine tip.
 for(let i=0;i<p.count;i++){const t=Math.floor(i/7)/20,c=curve.getPointAt(t);p.setXYZ(i,c.x+(p.getX(i)-c.x)*(1-.88*t),c.y+(p.getY(i)-c.y)*(1-.88*t),c.z+(p.getZ(i)-c.z)*(1-.88*t));}tailGeo.computeVertexNormals();
 const tail=new T.Mesh(tailGeo,skin);body.add(tail);return {root,body,head,tail,paws};
}
export function birdModel(index=0){
 const root=new T.Group(),wings:T.Group[]=[];root.name='Garden bird';const feather=coat(0x615a4c),dark=coat(0x383a33),breast=coat(index%2?0x8c6347:0xaca696);
 profile(root,feather,[[-.18,-.005,.002,.002],[-.11,0,.026,.024],[-.025,.008,.063,.067],[.065,.03,.038,.044],[.1,.045,.002,.002]]);
 ellipsoid(root,breast,0,-.018,.018,.052,.044,.071);ellipsoid(root,feather,0,.053,.105,.041,.043,.047);
 const beak=new T.Mesh(new T.ConeGeometry(.012,.047,8),nose);beak.rotation.x=Math.PI/2;beak.position.set(0,.05,.168);root.add(beak);
 for(const side of[-1,1]){
  ellipsoid(root,eye,side*.033,.065,.122,.004,.004,.004);
  const wing=new T.Group();wing.position.set(side*.043,.018,-.013);root.add(wing);wings.push(wing);
  const shape=new T.Shape();shape.moveTo(0,.045);shape.bezierCurveTo(side*.11,.07,side*.25,-.055,side*.30,-.18);shape.lineTo(side*.17,-.145);shape.lineTo(side*.055,-.12);shape.closePath();
  const g=new T.ShapeGeometry(shape,10);g.rotateX(Math.PI/2);const mesh=new T.Mesh(g,dark.clone());(mesh.material as T.MeshStandardMaterial).side=T.DoubleSide;wing.add(mesh);
  for(let i=0;i<4;i++){const f=ellipsoid(wing,feather,side*(.12+i*.035),-.003,-.055-i*.028,.014,.004,.07-i*.008);f.rotation.y=-side*.6;}
 }
 for(const side of[-1,1])ellipsoid(root,dark,side*.012,-.003,-.19,.018,.005,.065);
 return {root,wings};
}
/** A small terrier with a tapered muzzle, natural eyes, folded ears and distinct paws. */
export function dogModel(){
 const root=new T.Group(),body=new T.Group();root.add(body);const fur=coat(0x9a805a),pale=coat(0xc0b298),brown=coat(0x63503b);
 profile(body,fur,[[-.4,.30,.002,.002],[-.31,.30,.105,.12],[-.18,.30,.115,.13],[.03,.33,.105,.14],[.17,.36,.078,.12],[.22,.38,.002,.002]]);
 ellipsoid(body,pale,0,.255,.11,.083,.082,.087);
 const head=new T.Group();head.position.set(0,.46,.23);body.add(head);
 profile(head,fur,[[-.09,-.025,.002,.002],[-.05,.005,.077,.083],[.035,.005,.074,.079],[.07,-.018,.045,.045],[.17,-.033,.033,.027]]);
 ellipsoid(head,nose,0,-.029,.17,.032,.022,.013);
 ellipsoid(head,pale,0,-.06,.115,.039,.012,.062);
 for(const side of[-1,1]){
  ellipsoid(head,eye,side*.051,.021,.063,.009,.01,.007);
  const ear=ellipsoid(head,brown,side*.071,-.012,-.026,.032,.071,.026);ear.rotation.z=side*.31;
 }
 const collar=new T.Mesh(new T.TorusGeometry(.079,.012,6,24),new T.MeshStandardMaterial({color:0x54382d,roughness:.88}));collar.position.set(0,.40,.172);collar.rotation.x=-.7;body.add(collar);
 for(const side of[-1,1])for(const fore of[-1,1]){
  const z=fore>0?.14:-.27;
  ellipsoid(body,fur,side*.082,.205,z,.029,.10,.034);
  ellipsoid(body,fur,side*.087,.095,z-.014,.023,.075,.023);
  const paw=ellipsoid(body,pale,side*.087,.027,z+.012,.031,.027,.052);paw.name='Rounded_paw_'+side+'_'+fore;
  for(let toe=0;toe<3;toe++)ellipsoid(body,brown,side*.087+(toe-1)*.016,.022,z+.055,.006,.012,.009);
 }
 const tail=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0,.35,-.34),new T.Vector3(0,.43,-.45),new T.Vector3(.035,.52,-.49)]),14,.022,8),fur);body.add(tail);
 // rigDog's source convention is +X; the rest of the wildlife is built facing +Z.
 body.rotation.y=Math.PI/2;root.updateMatrixWorld(true);return root;
}
