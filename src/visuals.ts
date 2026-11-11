import * as T from 'three';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {Estate} from './world';
const base=import.meta.env.BASE_URL;
const seeded=(()=>{let a=9102;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}})();

export function materials(e:Estate):Promise<unknown>[] {
 const pending:Promise<unknown>[]=[];
 const texture=(name:string,color=false)=>{let finish:()=>void=()=>{};pending.push(new Promise<void>(r=>finish=r));const tex=new T.TextureLoader().load(base+'materials/'+name,finish,undefined,()=>{console.warn('Material unavailable:',name);finish()});tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.anisotropy=Math.min(8,e.renderer.capabilities.getMaxAnisotropy());if(color)tex.colorSpace=T.SRGBColorSpace;return tex;};
 const pbr=(name:string,tint:number,normal=.5)=>new T.MeshStandardMaterial({map:texture(name+'-color.jpg',true),normalMap:texture(name+'-normal.jpg'),roughnessMap:texture(name+'-roughness.jpg'),normalScale:new T.Vector2(normal,normal),color:tint,roughness:1});
 e.mats.stone=pbr('limestone',0xcac4b4,.6);e.mats.ashlar=pbr('ashlar',0xe3ded2,.38);e.mats.trim=e.mats.ashlar;
 e.mats.wood=pbr('oak',0x817365,.3);e.mats.panel=pbr('oak',0x514338,.25);e.mats.grass=pbr('lawn',0xaab394,.35);
 e.mats.gravel=pbr('gravel',0xc1bbac,.7);e.mats.slate=pbr('slate',0x8b9395,.65);e.mats.plaster=pbr('plaster',0xcec7b5,.15);
 e.mats.leather=pbr('leather',0x483026,.3);e.mats.dark.color.setHex(0x242c28);e.mats.gold.color.setHex(0x9f8253);e.mats.gold.roughness=.45;
 e.mats.glass=new T.MeshPhysicalMaterial({color:0xc5d5d5,metalness:.1,roughness:.08,transparent:true,opacity:.18,side:T.DoubleSide,depthWrite:false,envMapIntensity:1.3});
 pending.push(new RGBELoader().loadAsync(base+'materials/estate-sky.hdr').then(hdr=>{hdr.mapping=T.EquirectangularReflectionMapping;e.scene.background=hdr;e.scene.backgroundIntensity=.75;e.scene.backgroundRotation.y=.5;const pm=new T.PMREMGenerator(e.renderer);const env=pm.fromEquirectangular(hdr);e.scene.environment=env.texture;e.scene.environmentIntensity=.42;pm.dispose();}).catch(err=>console.warn('Sky unavailable',err)));
 return pending;
}
function mesh(e:Estate,geo:T.BufferGeometry,mat:T.Material,x:number,y:number,z:number,parent:T.Object3D=e.scene){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function mould(e:Estate,w:number,h:number,d:number,x:number,y:number,z:number){for(const [a,b,c]of[[0,0,0],[.12,.07,.08],[.21,.16,.15]])e.box(w+a,h+b,d+c,x,y+b,z,e.mats.trim);}
function arch(e:Estate,x:number,y:number,z:number,r:number,depth:number,mat:T.Material,parent:T.Object3D=e.scene){const shape=new T.Shape();shape.absarc(0,0,r+.23,0,Math.PI,false);shape.lineTo(-r,0);shape.absarc(0,0,r,Math.PI,0,true);shape.closePath();return mesh(e,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.02,bevelThickness:.02,curveSegments:20}),mat,x,y,z,parent);}
function roof(e:Estate,x:number,y:number,z:number,w:number,d:number,h:number){
 const pts=[-w/2,0,-d/2, w/2,0,-d/2, w/2-3,h,0, -w/2+3,h,0, -w/2,0,d/2,w/2,0,d/2];
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.setIndex([0,3,2,0,2,1,4,5,2,4,2,3,0,4,3,1,2,5]);const uv=[0,0,w/2,0,w/2-1.5,h/2,1.5,h/2,0,0,w/2,0];g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();const m=mesh(e,g,e.mats.slate,x,y,z);m.material=e.mats.slate.clone();(m.material as T.MeshStandardMaterial).side=T.DoubleSide;
 e.box(w-5,.16,.2,x,y+h,z,e.mats.dark);
}
function windowDetail(e:Estate,x:number,y:number,z:number,w=1.8,h=2.4,solid=false,parent:T.Object3D=e.scene){
 const trim=e.mats.trim,dark=e.mats.dark;const box=(a:number,b:number,c:number,xx:number,yy:number,zz:number,mat:T.Material)=>e.box(a,b,c,xx,yy,zz,mat,parent);
 if(solid)box(w,h,.055,x,y,z-.04,e.mat(0x172b2b,.25,.15));
 for(const side of[-1,1]){box(.19,h+.28,.3,x+side*(w/2+.09),y,z,trim);box(.055,h,.09,x+side*(w/2-.03),y,z+.08,dark);}
 box(w+.55,.14,.55,x,y-h/2-.07,z+.06,trim);box(w+.4,.18,.35,x,y+h/2+.08,z,trim);
 box(.065,h,.08,x,y,z+.08,dark);for(const off of[-h/6,h/6])box(w,.045,.08,x,y+off,z+.08,dark);
 if(!solid)box(w,h,.03,x,y,z,e.mats.glass);
 for(const side of[-1,1])box(.045,h,.07,x+side*w/4,y,z+.085,dark);
}
export function landscape(e:Estate){
 e.box(220,.2,220,0,-.18,0,e.mats.grass,e.scene,false);
 // Gravel drive, pale stone edging and an arrival court.
 e.box(8,.025,75,0,-.055,47,e.mats.gravel,e.scene,false);e.box(48,.025,8,0,-.05,17,e.mats.gravel,e.scene,false);
 for(const x of[-4.2,4.2])e.box(.19,.09,60,x,-.01,45,e.mats.trim);
 for(const z of[12.8,21.2])for(const x of[-14,14])e.box(19,.09,.18,x,-.01,z,e.mats.trim);
 // Fine iron boundary railings with stone gate piers.
 for(const x of[-8.8,8.8]){for(let z=24;z<56;z+=.55){e.cyl(.018,.018,1.12,x,.56,z,e.mats.dark,e.scene,6);mesh(e,new T.ConeGeometry(.045,.12,5),e.mats.dark,x,1.17,z);}for(const y of[.3,.91])e.box(.045,.045,32,x,y,40,e.mats.dark);}
 for(const x of[-5.7,5.7]){e.box(.95,2.1,.95,x,1.05,49,e.mats.stone);mould(e,1,.08,1,x,2.15,49);e.cyl(.17,.3,.45,x,2.46,49,e.mats.trim,e.scene,24);e.sphere(.18,x,2.77,49,e.mats.trim);}
 // Grass blades near boundaries, all in one instanced draw.
 const blade=new T.PlaneGeometry(.04,.42,1,3),mat=new T.MeshStandardMaterial({color:0x6d7950,side:T.DoubleSide,roughness:1});const grass=new T.InstancedMesh(blade,mat,2600),o=new T.Object3D();
 for(let i=0;i<2600;i++){const side=i%2?1:-1;const x=side*(5+seeded()*38),z=23+seeded()*35;o.position.set(x,.1,z);o.rotation.set((seeded()-.5)*.5,seeded()*Math.PI,0);o.scale.setScalar(.6+seeded());o.updateMatrix();grass.setMatrixAt(i,o.matrix);grass.setColorAt(i,new T.Color().setHSL(.21+seeded()*.045,.2+seeded()*.15,.23+seeded()*.12));}e.scene.add(grass);
}
export function castle(e:Estate){
 const {stone,trim,wood,plaster}=e.mats;
 e.box(42,.15,28,0,0,-2,wood);e.box(42,.25,28,0,4.9,-2,plaster);
 e.wall(18.8,1,.6,-11.6,.5,12);e.wall(18.8,1,.6,11.6,.5,12);e.wall(42,1,.65,0,4.35,12);e.wall(3.4,1.4,.65,0,4.1,12);
 const cuts=[-21,-18,-16,-12,-10,-1.8,1.8,10,12,16,18,21];for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1],mid=(a+b)/2;if(Math.abs(mid)<1.81||[-17,-11,11,17].some(x=>Math.abs(mid-x)<.1))continue;e.wall(b-a,2.85,.6,mid,2.425,12);}
 for(const x of[-17,-11,11,17])windowDetail(e,x,2.45,12.12,2,2.7);
 e.wall(.6,4.8,28,-21,2.4,-2);e.wall(.6,4.8,28,21,2.4,-2);e.wall(19.2,4.8,.6,-11.4,2.4,-16);e.wall(19.2,4.8,.6,11.4,2.4,-16);e.wall(3.6,1.4,.6,0,4.1,-16);
 for(const x of[-7,7]){e.wall(.32,4.8,13,x,2.4,-3.5,plaster);e.wall(.32,4.8,5.5,x,2.4,9.25,plaster);e.wall(.34,1.6,3,x,4,4.5,plaster);e.addDoor(x<0?'study':'library',x,6.2,Math.PI/2);}
 for(const x of[-17,17])e.wall(8,4.8,.3,x,2.4,-10,plaster);e.wall(10,4.8,.3,0,2.4,-10,plaster);e.addDoor('front',-1.6,12,0,true);e.addDoor('rear',-1.6,-16,0,true);
 // A second storey restores manor-house proportions. It is architectural scenery.
 e.box(42,3.6,28,0,6.8,-2,stone);roof(e,0,8.72,-2,43.2,29.2,4.8);
 for(const z of[12.4,-16.4]){for(const y of[.23,4.72,8.52])mould(e,42,.09,.22,0,y,z);for(const x of[-17,-11,-5,0,5,11,17]){const group=new T.Group();group.position.set(x,6.65,z);if(z<0)group.rotation.y=Math.PI;e.scene.add(group);windowDetail(e,0,0,.02,1.45,2.15,true,group);}}
 // Stone quoins alternate at the corners, rather than oversized battlements.
 for(const x of[-20.9,20.9])for(const z of[-16.1,12.1])for(let i=0;i<18;i++)e.box(i%2?.7:1.1,.38,i%2?1.1:.7,x,.25+i*.46,z,trim);
 for(const x of[-21,21])for(const z of[-16,12]){
 e.cyl(2.8,2.92,11.5,x,5.75,z,stone,e.scene,40);e.barrier(x,z,5.7,5.7);
 for(const y of[.3,4.8,8.7,11.4])e.cyl(2.98,2.98,.18,x,y,z,trim,e.scene,40);
 const cone=mesh(e,new T.ConeGeometry(3.2,5.2,40),e.mats.slate,x,14.12,z);const uv=cone.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*7,uv.getY(i)*3);
 e.cyl(.055,.12,1,x,17.1,z,e.mats.dark,e.scene,10);e.sphere(.1,x,17.65,z,e.mats.gold);
 for(const yy of[2.5,6.7,10])for(const angle of[0,Math.PI/2,Math.PI,Math.PI*1.5]){const g=new T.Group();g.position.set(x+Math.sin(angle)*2.82,yy,z+Math.cos(angle)*2.82);g.rotation.y=angle;e.scene.add(g);windowDetail(e,0,0,0,.7,1.65,true,g);}
 }
 // Projecting portico, arched entrance and a small stone balcony.
 for(const x of[-2.7,2.7]){e.box(.7,.24,.7,x,.15,14.2,trim);e.cyl(.22,.27,3.25,x,1.9,14.2,trim,e.scene,24);for(const y of[.48,3.48])e.cyl(.34,.34,.18,x,y,14.2,trim,e.scene,24);e.barrier(x,14.2,.55,.55);}
 arch(e,0,1.7,14.1,2.35,.36,trim);e.box(6.2,.35,3.25,0,4.18,13.1,trim);mould(e,6.35,.12,3.4,0,4.4,13.1);
 for(const x of[-2.9,2.9])e.box(.3,1,.3,x,4.98,14.55,trim);e.box(6,.15,.22,0,5.45,14.55,trim);for(let x=-2.5;x<2.6;x+=.45){e.cyl(.055,.08,.8,x,4.98,14.55,trim,e.scene,12);e.sphere(.09,x,5.05,14.55,trim);}
 e.sign('BRAMBLEWICK',0,3.5,12.46,2.7);
 // Chimney stacks, roof dormers and guttering.
 for(const x of[-13,13]){e.box(1.8,4,1.2,x,12,-3,stone);mould(e,2,.1,1.4,x,14,-3);for(const dx of[-.48,.48])e.cyl(.2,.22,.65,x+dx,14.45,-3,e.mat(0x6e4935),e.scene,16);}
 for(const x of[-13,-6,6,13]){e.box(1.85,1.6,.7,x,10,8.3,stone);windowDetail(e,x,10,8.72,1.1,1.25,true);roof(e,x,10.8,8.25,2.2,1.8,.85);}
 for(const z of[-16.7,12.7])e.cyl(.065,.065,42,0,8.6,z,e.mats.dark,e.scene,12).rotation.z=Math.PI/2;
 for(const x of[-18.8,18.8])e.cyl(.055,.055,8.5,x,4.25,12.52,e.mats.dark,e.scene,10);
 e.sign('THE STUDY',-7.2,3.35,4.5,1.3,Math.PI/2);e.sign('THE LIBRARY',7.2,3.35,4.5,1.3,-Math.PI/2);
}
function tube(e:Estate,points:T.Vector3[],r:number,mat:T.Material,parent:T.Object3D){return mesh(e,new T.TubeGeometry(new T.CatmullRomCurve3(points),20,r,7,false),mat,0,0,0,parent);}
export function interiorDetail(e:Estate){
 // Walnut wainscoting, recessed panels and fine picture rails.
 const panel=e.mats.panel,plaster=e.mats.plaster;
 for(const x of[-20.64,-7.22,-6.78,6.78,7.22,20.64])for(let z=-8.8;z<11;z+=1.5){if(Math.abs(x)<8&&z>2.2&&z<7.1)continue;const toward=x<0?1:-1;const face=x+toward*.035;
 e.box(.08,1.45,1.47,x,.8,z,panel);e.box(.025,1.08,1.13,face,.79,z,e.mats.wood);for(const zz of[-.64,.64])e.box(.05,1.4,.045,face+toward*.03,.8,z+zz,panel);for(const y of[.14,1.43,1.55,3.68,4.57])e.box(.12,y===1.55?.1:.06,1.5,face,y,z,y>3?e.mats.trim:panel);
 }
 // Side walls get plaster above panelling; conceal unfinished masonry indoors.
 for(const x of[-20.66,20.66])e.box(.04,3.1,27,x,3.05,-2,plaster);
 for(const x of[-14,0,14])for(let z=-7;z<=10;z+=5.5){e.box(13.6,.14,.15,x,4.69,z,e.mats.trim);for(const dx of[-4.5,0,4.5])e.box(.13,.14,5.5,x+dx,4.69,z-2.75,e.mats.trim);}
 for(const z of[0,8]){
 const g=new T.Group();g.position.set(0,3.8,z);e.scene.add(g);e.cyl(.025,.025,1,0,.55,0,e.mats.gold,g,12);e.sphere(.11,0,0,0,e.mats.gold,g);
 for(let i=0;i<6;i++){const a=i*Math.PI/3,dx=Math.cos(a),dz=Math.sin(a);tube(e,[new T.Vector3(0,0,0),new T.Vector3(dx*.4,-.25,dz*.4),new T.Vector3(dx*.7,-.1,dz*.7),new T.Vector3(dx*.7,.12,dz*.7)],.018,e.mats.gold,g);e.cyl(.065,.065,.25,dx*.7,.23,dz*.7,e.mats.cream,g,12);const glow=new T.MeshStandardMaterial({color:0xffe3ac,emissive:0xffbd6e,emissiveIntensity:2});e.sphere(.045,dx*.7,.38,dz*.7,glow,g,.7,1.5,.7);}
 const lamp=new T.PointLight(0xffd9a0,45,14,2);lamp.position.copy(g.position);e.scene.add(lamp);
 }
 // Book spines, brass hardware, curtain rods, linen curtains and tiebacks.
 const linen=e.mat(0xa79579,.95);for(const x of[-17,-11,11,17]){e.cyl(.025,.025,3.1,x,3.98,11.48,e.mats.gold).rotation.z=Math.PI/2;for(const side of[-1,1])for(let i=0;i<7;i++){const xx=x+side*(1.12+i*.045);e.cyl(.06,.085,2.82,xx,2.45,11.45+Math.sin(i)*.035,linen,e.scene,9);}e.box(3,.22,.2,x,4.05,11.42,panel);}
 // Detailed fireplace mantel and hearth.
 e.box(.8,.1,3.4,-20.2,.16,4.5,e.mats.slate);for(const z of[3.12,5.88]){e.box(.9,1.9,.25,-20.15,1.12,z,e.mats.trim);for(const y of[.3,1.9])e.box(1,.12,.38,-20.1,y,z,e.mats.trim);}
 e.box(1.1,.18,3.7,-20.1,2.17,4.5,e.mats.panel);
 // Persian-style woven rugs are geometric textiles, with a clear border and medallion.
 const cv=document.createElement('canvas');cv.width=512;cv.height=1024;const c=cv.getContext('2d')!;c.fillStyle='#422526';c.fillRect(0,0,512,1024);for(let i=0;i<5;i++){c.strokeStyle=i%2?'#97805c':'#2a3833';c.lineWidth=5;c.strokeRect(12+i*9,12+i*9,488-i*18,1000-i*18);}for(let y=80;y<970;y+=72)for(let x=80;x<470;x+=72){c.save();c.translate(x,y);c.rotate(Math.PI/4);c.strokeStyle='#9b8969';c.lineWidth=2;c.strokeRect(-12,-12,24,24);c.strokeStyle='#6a785d';c.strokeRect(-7,-7,14,14);c.restore();}c.save();c.translate(256,512);c.rotate(Math.PI/4);c.fillStyle='#273d38';c.fillRect(-95,-95,190,190);c.strokeStyle='#bca573';c.lineWidth=9;c.strokeRect(-95,-95,190,190);c.restore();
 const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;const rug=new T.MeshStandardMaterial({map:tex,roughness:1});for(const [x,z,w,h]of[[0,1,3,17],[-15,3.5,4.2,5.4],[15,4,4,5]]){const m=mesh(e,new T.PlaneGeometry(w,h),rug,x,.15,z);m.rotation.x=-Math.PI/2;m.castShadow=false;}
}

function normalized(source:T.Object3D,height:number){const g=source.clone(true),b=new T.Box3().setFromObject(g),size=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3());const scale=height/size.y;g.scale.multiplyScalar(scale);g.position.set(-center.x*scale,-b.min.y*scale,-center.z*scale);const root=new T.Group();root.add(g);return root;}
function staticBatch(e:Estate,source:T.Object3D,positions:[number,number,number,number][],height:number){const model=normalized(source,height);model.updateMatrixWorld(true);model.traverse(obj=>{if(!(obj instanceof T.Mesh))return;const geo=obj.geometry.clone();geo.applyMatrix4(obj.matrixWorld);const inst=new T.InstancedMesh(geo,obj.material,positions.length),m=new T.Matrix4(),q=new T.Quaternion(),v=new T.Vector3(),scale=new T.Vector3();positions.forEach(([x,z,s,angle],i)=>{q.setFromAxisAngle(new T.Vector3(0,1,0),angle);v.set(x,0,z);scale.setScalar(s);m.compose(v,q,scale);inst.setMatrixAt(i,m)});inst.castShadow=true;inst.receiveShadow=true;inst.frustumCulled=true;e.scene.add(inst);});}
export async function sceneryAssets(e:Estate){const loader=new GLTFLoader();
 const load=async(name:string)=>{try{return (await loader.loadAsync(base+'models/'+name+'.glb')).scene}catch(err){console.warn('Scenery asset unavailable:',name,err);return null}};
 const shrub=await load('shrub');if(shrub){const positions:[number,number,number,number][]=[];for(const x of[-12,12])for(let z=-34;z<=-25;z+=1.15)positions.push([x,z,.65+seeded()*.2,seeded()*6.28]);for(const x of[-25.5,25.5])for(let z=-16;z<=12;z+=2.2)positions.push([x,z,1+seeded()*.4,seeded()*6.28]);for(const side of[-1,1])for(let i=0;i<35;i++)positions.push([side*(31+seeded()*25),-45+seeded()*100,1+seeded()*1.3,seeded()*6.28]);staticBatch(e,shrub,positions,1.8);}
 const flower=await load('shrub-flowering');if(flower){const poses:[number,number,number,number][]=[];for(const side of[-1,1])for(let i=0;i<16;i++)poses.push([side*(7+seeded()*14),22+seeded()*4,.55+seeded()*.3,seeded()*6]);for(let x=-17;x<19;x+=2)poses.push([x,-40,.6,seeded()*6]);staticBatch(e,flower,poses,1.7);}
 const fern=await load('fern');if(fern){const poses:[number,number,number,number][]=[];for(let i=0;i<35;i++)poses.push([(i%2?1:-1)*(25+seeded()*9),-20+seeded()*60,.6+seeded()*.5,seeded()*6]);staticBatch(e,fern,poses,1);}
 const tree=await load('tree');if(tree){const poses:[number,number,number,number][]=[];for(let i=0;i<32;i++)poses.push([(i%2?1:-1)*(36+seeded()*27),-58+seeded()*125,.75+seeded()*.65,seeded()*6]);for(let i=0;i<12;i++)poses.push([-30+seeded()*60,-55-seeded()*15,.8+seeded()*.3,seeded()*6]);staticBatch(e,tree,poses,11);}
 const chair=await load('armchair');if(chair)for(const [x,z,r]of[[-18,4,1.2],[12,7,-.5],[18,7,.5]]){const root=normalized(chair,1.1);root.position.set(x,.1,z);root.rotation.y=r;root.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true}});e.scene.add(root);e.barrier(x,z,.9,.9);}
}

// Merge opaque static detail by material, preserving all interactive objects and wall occluders.
export function batchDetail(e:Estate){const excluded=new Set<T.Object3D>(e.walls);for(const t of e.targets)t.root.traverse(o=>excluded.add(o));for(const a of e.actors.values())a.root.traverse(o=>excluded.add(o));e.car.traverse(o=>excluded.add(o));e.dog.traverse(o=>excluded.add(o));const groups=new Map<T.Material,T.Mesh[]>();
 e.scene.updateMatrixWorld(true);for(const child of [...e.scene.children]){if(!(child instanceof T.Mesh)||child instanceof T.InstancedMesh||excluded.has(child)||Array.isArray(child.material)||child.material.transparent)continue;const list=groups.get(child.material)??[];list.push(child);groups.set(child.material,list);}
 for(const [mat,meshes]of groups){if(meshes.length<8)continue;const geos=meshes.map(m=>{const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrixWorld);g.deleteAttribute('uv1');g.deleteAttribute('tangent');return g;});try{const combined=mergeGeometries(geos,false);if(combined){const m=new T.Mesh(combined,mat);m.castShadow=true;m.receiveShadow=true;e.scene.add(m);meshes.forEach(n=>e.scene.remove(n));}}finally{geos.forEach(g=>g.dispose())}}
}
