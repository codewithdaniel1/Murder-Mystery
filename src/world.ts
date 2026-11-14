import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {materials,landscape,castle,interiorDetail,sceneryAssets,batchDetail,grandfatherClock} from './visuals';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {loadCharacters,animateCharacter} from './characters';
import {DogFollower,animateDog} from './dog';
import type {DogMotion} from './dog';
import type {CharacterMotion} from './characters';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {EstateRoutines} from './routines';
import {clearAt,clearSegment,resolveOverlap} from './navigation';
import type {Activity} from './routines';
import type { GameState,PersonId,Pose } from './state';
export interface Target {id:string;label:string;verb:string;root:T.Object3D;distance?:number}
interface Barrier {x:number;z:number;w:number;d:number;door?:string}
interface Actor {isWalking?:boolean;activity?:Activity|null;activityLabel?:string;root:T.Group;head:T.Group;arms:T.Group[];legs:T.Group[];home:T.Vector3;id:PersonId}
const rnd=(()=>{let s=4217;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}})();
export class Estate {
 scene=new T.Scene();camera=new T.PerspectiveCamera(65,innerWidth/innerHeight,.06,220);renderer:T.WebGLRenderer;
 surfaces:{x:number;z:number;w:number;d:number;y:number}[]=[];routines=new EstateRoutines();characterMotion=new Map<PersonId,CharacterMotion>();targets:Target[]=[];barriers:Barrier[]=[];walls:T.Object3D[]=[];actors=new Map<PersonId,Actor>();doors=new Map<string,{pivot:T.Group;angle:number;open:number}>();
 ray=new T.Raycaster();clock=0;clockPendulum?:T.Group;car:T.Group;dog:T.Group;dogMotion?:DogMotion;dogFollower=new DogFollower();hands:T.Group;held:T.Group|null=null;gesture=0;weather=0;
 composer:EffectComposer;ao:GTAOPass;sun:T.DirectionalLight; mats:Record<string,T.MeshStandardMaterial>={}; pointer=new T.Vector2(0,0);lastMove=false;inspectRotation=0;ready:Promise<void>;quality='Auto';
 constructor(container:HTMLElement){
 this.renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));this.renderer.setSize(innerWidth,innerHeight);this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.95;container.appendChild(this.renderer.domElement);
 this.scene.background=new T.Color('#c4cbd0');this.scene.fog=new T.Fog('#bcc4c2',90,210);
 this.scene.add(new T.HemisphereLight(0xc7def0,0x615241,.42));this.sun=new T.DirectionalLight(0xffe7c7,3.2);this.sun.position.set(-28,38,26);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-44,right:44,top:44,bottom:-44,near:1,far:115});this.sun.shadow.bias=-.00008;this.sun.shadow.normalBias=.025;this.sun.shadow.radius=2;this.scene.add(this.sun);
 this.mats={dark:this.mat(0x26302a),gold:this.mat(0xaa8c51,.4,.7),black:this.mat(0x171c1a,.6),cream:this.mat(0xcdbfa3),leaf:this.mat(0x3c5631),red:this.mat(0x472d2c),paper:this.mat(0xe4d5b6),glass:this.mat(0xbac7c4)};
 const loaded=materials(this);
 this.landscape();this.castle();this.interiors();interiorDetail(this);this.garden();
 this.addActor('june',2,6,0x3b4943,0xd1b39c,true);this.addActor('rook',-12,3,0x3f3e47,0xc2a48a,false);this.addActor('mara',13,1,0x7d6045,0xd2b7a1,true);this.addActor('ada',-9,-20,0x537b72,0xd7b79e,true);this.addActor('tomas',23,-21,0x66704b,0xc6a182,false);this.addActor('beatrice',4,20,0x664d56,0xd8b59b,true);this.addActor('jonah',7,24,0x3c4853,0xc7a085,false);
 this.actors.get('beatrice')!.root.visible=false;this.actors.get('jonah')!.root.visible=false;
 this.car=this.makeCar();this.car.position.set(4,0,56);this.car.visible=false;this.scene.add(this.car);
 this.dog=this.makeDog();this.dog.position.set(11,.1,3);this.scene.add(this.dog);this.target(this.dog,'pip','Pip','Greet');
 this.hands=this.makeHands();this.camera.add(this.hands);this.scene.add(this.camera);this.camera.position.set(0,6.2,38);this.camera.lookAt(0,3,0);
 this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));this.ao=new GTAOPass(this.scene,this.camera,innerWidth,innerHeight);this.ao.blendIntensity=.35;this.ao.updateGtaoMaterial({radius:.45,distanceExponent:1.5,thickness:1,scale:1});this.composer.addPass(this.ao);this.composer.addPass(new OutputPass());this.ao.setSize(Math.round(innerWidth*.75),Math.round(innerHeight*.75));
 loaded.push(sceneryAssets(this),loadCharacters(this));batchDetail(this);this.ready=Promise.all(loaded).then(()=>{});addEventListener('resize',()=>{this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);this.composer.setSize(innerWidth,innerHeight);this.ao.setSize(Math.round(innerWidth*.75),Math.round(innerHeight*.75));});
 }
 mat(c:number,roughness=.75,metalness=0){return new T.MeshStandardMaterial({color:c,roughness,metalness});}
 box(w:number,h:number,d:number,x:number,y:number,z:number,mat:T.Material,parent:T.Object3D=this.scene,shadow=true){const geo=new T.BoxGeometry(w,h,d);const uv=geo.attributes.uv,pos=geo.attributes.position,n=geo.attributes.normal;for(let i=0;i<uv.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i));uv.setXY(i,(nx>.5?pos.getZ(i):pos.getX(i))/2,(ny>.5?pos.getZ(i):pos.getY(i))/2);}const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;parent.add(m);return m;}
 round(w:number,h:number,d:number,x:number,y:number,z:number,mat:T.Material,parent:T.Object3D){const m=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(w,h,d)*.15),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 cyl(rt:number,rb:number,h:number,x:number,y:number,z:number,mat:T.Material,parent:T.Object3D=this.scene,seg=16){const geo=new T.CylinderGeometry(rt,rb,h,seg);if(mat===this.mats.stone){const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*Math.PI*(rt+rb)/2,uv.getY(i)*h/2);}const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 sphere(rad:number,x:number,y:number,z:number,mat:T.Material,parent:T.Object3D=this.scene,sx=1,sy=1,sz=1){const m=new T.Mesh(new T.SphereGeometry(rad,24,18),mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;parent.add(m);return m;}
 floor(w:number,h:number,d:number,x:number,y:number,z:number,mat:T.Material){this.surfaces.push({x,z,w,d,y:y+h/2});return this.box(w,h,d,x,y,z,mat,this.scene,false)}
 groundHeight(x:number,z:number){let y=-.08;for(const f of this.surfaces)if(Math.abs(x-f.x)<=f.w/2&&Math.abs(z-f.z)<=f.d/2)y=Math.max(y,f.y);return y}
 collisionBarriers(s:GameState){const list=[...this.barriers];if(s.arrival==='arriving'||s.arrival==='present')list.push({x:4,z:s.arrival==='present'?24:this.car.position.z,w:2.45,d:5.25});return list}
 advanceArrival(progress:number,dt:number,s:GameState){const next=Math.min(1,progress+dt/15),from=56-32*T.MathUtils.smoothstep(progress,0,1),to=56-32*T.MathUtils.smoothstep(next,0,1);const people=[this.camera.position,...[...this.actors.values()].filter(a=>a.root.visible).map(a=>a.root.position),this.dog.position];if(people.some(p=>Math.abs(p.x-4)<1.65&&p.z>to-3.1&&p.z<from+3.1))return progress;return next}
 barrier(x:number,z:number,w:number,d:number,door?:string){this.barriers.push({x,z,w,d,door});}
 wall(w:number,h:number,d:number,x:number,y:number,z:number,mat=this.mats.stone){const m=this.box(w,h,d,x,y,z,mat);this.walls.push(m);if(y-h/2<1.85)this.barrier(x,z,w,d);return m;}
 target(root:T.Object3D,id:string,label:string,verb='Inspect'){this.targets.push({root,id,label,verb});return root;}
 sign(text:string,x:number,y:number,z:number,width=1.6,rotation=0,parent:T.Object3D=this.scene){const c=document.createElement('canvas');c.width=512;c.height=160;const ctx=c.getContext('2d')!;ctx.fillStyle='#243b32';ctx.fillRect(0,0,512,160);ctx.strokeStyle='#b9a673';ctx.lineWidth=4;ctx.strokeRect(10,10,492,140);ctx.fillStyle='#eadfbc';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='28px Georgia';ctx.fillText(text,256,81);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(width,width*.3125),new T.MeshStandardMaterial({map:tex,roughness:.8}));m.position.set(x,y,z);m.rotation.y=rotation;parent.add(m);return m;}
 landscape(){landscape(this)}
 castle(){castle(this)}
 addDoor(id:string,x:number,z:number,rotation:number,open=false){const pivot=new T.Group();pivot.position.set(x,.12,z);pivot.rotation.y=rotation;const door=new T.Group();this.box(3.1,3.15,.16,1.55,1.58,0,this.mats.dark,door);for(const y of[.85,2.2])this.box(2.6,1.05,.04,1.55,y,.105,this.mats.wood,door);this.cyl(.065,.065,.28,2.8,1.45,.22,this.mats.gold,door).rotation.x=Math.PI/2;pivot.add(door);this.scene.add(pivot);this.target(door,'door:'+id,id==='front'?'Entrance doors':id==='rear'?'Garden door':id==='study'?'Study door':'Library door','Open / close');this.doors.set(id,{pivot:door,angle:open?-Math.PI/2:0,open:open?1:0});door.rotation.y=open?-Math.PI/2:0;const along=Math.abs(Math.sin(rotation))>.5;this.barrier(x+(along?0:1.55),z+(along?-1.55:0),along?.28:3.1,along?3.1:.28,id);}
 lamp(x:number,y:number,z:number){this.cyl(.17,.24,.08,x,y,z,this.mats.gold);this.cyl(.025,.04,.55,x,y+.3,z,this.mats.gold);const shade=this.mat(0xe5c28a);shade.emissive=new T.Color(0xd19444);shade.emissiveIntensity=.6;this.cyl(.22,.4,.43,x,y+.72,z,shade);const l=new T.PointLight(0xffcf87,35,9,2);l.position.set(x,y+.65,z);this.scene.add(l);}
 table(x:number,z:number,w=2,d=1,h=.92){const g=new T.Group();g.position.set(x,0,z);this.box(w,.14,d,0,h,0,this.mats.wood,g);for(const a of[-1,1])for(const b of[-1,1])this.box(.09,h,.09,a*(w/2-.15),h/2,b*(d/2-.12),this.mats.dark,g);this.scene.add(g);this.barrier(x,z,w,d);return g;}
 paper(title:string,lines:string[],x:number,y:number,z:number,book=false,parent:T.Object3D=this.scene){const g=new T.Group();g.position.set(x,y,z);if(book)this.box(.65,.07,.85,0,0,0,this.mats.red,g);const cv=document.createElement('canvas');cv.width=512;cv.height=640;const ctx=cv.getContext('2d')!;ctx.fillStyle='#e6d6ae';ctx.fillRect(0,0,512,640);ctx.fillStyle='#3f372b';ctx.font='bold 28px Georgia';ctx.fillText(title,35,70);ctx.font='22px Georgia';lines.forEach((l,i)=>ctx.fillText(l,35,130+i*42));ctx.strokeStyle='#a78f62';ctx.strokeRect(20,20,472,600);const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;const sheet=new T.Mesh(new T.PlaneGeometry(.56,.72),new T.MeshStandardMaterial({map:tex,roughness:.95,side:T.DoubleSide}));sheet.rotation.x=-Math.PI/2;sheet.position.y=.045;g.add(sheet);parent.add(g);return g;}
 falcon(parent:T.Object3D=this.scene){const g=new T.Group();this.cyl(.3,.35,.14,0,.08,0,this.mats.gold,g);this.sphere(.2,0,.42,0,this.mats.gold,g,.8,1.5,.7);this.sphere(.12,.02,.73,0,this.mats.gold,g);const beak=new T.Mesh(new T.ConeGeometry(.06,.2,5),this.mats.gold);beak.rotation.z=-Math.PI/2;beak.position.set(.15,.73,0);g.add(beak);for(const s of[-1,1]){const wing=this.sphere(.19,s*.17,.45,0,this.mats.gold,g,.45,1.5,.8);wing.rotation.z=s*.3;}this.cyl(.035,.035,.23,0,.22,0,this.mats.gold,g);parent.add(g);return g;}
 interiors(){

 this.table(4,8,2.4,.85);this.lamp(4.8,1.02,8);
 const phone=new T.Group();phone.position.set(3.55,1.05,8);this.round(.55,.13,.42,0,0,0,this.mats.black,phone);this.cyl(.15,.15,.035,0,.09,.02,this.mats.gold,phone);this.cyl(.09,.09,.05,0,.12,.02,this.mats.black,phone);this.box(.45,.065,.09,0,.26,-.1,this.mats.black,phone);for(const x of[-.23,.23])this.sphere(.08,x,.23,-.1,this.mats.black,phone);this.scene.add(phone);this.target(phone,'phone','Telephone','Use');
 // Hall clock and paintings.
 grandfatherClock(this,-4,-8.8);

 this.table(-15,0,3.6,1.5);this.lamp(-16.25,1.02,0);this.target(this.paper('TO LADY BEATRICE',['Before another payment,','compare the original invoice.','We must speak tonight.','                         E. Vale'],-15,1.02,.15),'note','Elias’s unfinished letter');this.target(this.paper('ESTATE ACCOUNTS',['Supplier invoice       £60','Estate claim            £180','Personal receipt       £120','','vel aran si'],-14,1.04,-.1,true),'ledger','The ledger & receipts');
 const fragment=new T.Group();fragment.position.set(-13.4,.18,1.25);const claw=this.cyl(.03,.09,.22,0,.05,0,this.mats.gold,fragment);claw.rotation.z=.7;this.scene.add(fragment);this.target(fragment,'fragment','A bronze fragment','Pick up');this.barrier(-15,0,3.6,1.5);
 // Covered chair, fireplace, rug, books.

 this.box(.6,2.2,3,-20.65,1.1,4.5,this.mats.stone);this.box(.2,1.3,1.9,-20.25,.75,4.5,this.mats.black);this.box(.95,.15,3.3,-20.4,2.1,4.5,this.mats.trim);const ember=this.mat(0x992a0e);ember.emissive=new T.Color(0xff6a1c);ember.emissiveIntensity=2;this.box(.18,.12,1.3,-20.08,.2,4.5,ember);const fire=new T.PointLight(0xffa058,7,8,2);fire.position.set(-19.6,.8,4.5);this.scene.add(fire);
 for(let j=0;j<3;j++){const x=12+j*3.4;this.barrier(x,-9.35,2.9,.9);this.box(2.8,3.4,.65,x,1.7,-9.6,this.mats.wood);for(let level=0;level<4;level++){this.box(2.9,.09,.8,x,.35+level*.8,-9.4,this.mats.dark);for(let b=0;b<10;b++){this.box(.16+rnd()*.06,.42+rnd()*.23,.35,x-1.15+b*.25,.6+level*.8,-9.15,this.mat([0x735647,0x536454,0x8c714e,0x40586c][b%4]));}}}
 this.table(16,3,2,1.1);this.lamp(16.6,1.03,3);this.target(this.paper('AVELLIC REGISTER',['vel aran si:','received personally','by the steward.','','A reference for archivists.'],15.55,1.04,3,true),'lexicon','Avellic reference volume');
 this.table(16,7,2.3,.8);for(let i=0;i<4;i++)this.box(.6,.07,.85,15.6+i*.2,1+i*.07,7,this.mats.red);
 // Bell alcove, garment snag and office display.
 const mechanism=new T.Group();mechanism.position.set(-17,1.8,-15.5);this.box(1.3,1.2,.22,0,0,0,this.mats.wood,mechanism);for(const x of[-.28,.28]){const gear=this.cyl(.23,.23,.12,x,0,.16,this.mats.gold,mechanism,12);gear.rotation.x=Math.PI/2;}this.box(.045,.7,.045,0,-1,.18,this.mats.cream,mechanism);this.scene.add(mechanism);this.target(mechanism,'bell','Bell mechanism & repair notice');this.sign('MANUAL ROPE REMOVED',-17,2.9,-15.15,2.3);
 const latch=new T.Group();latch.position.set(-10.43,1.5,-9.75);this.box(.12,.3,.1,0,0,0,this.mats.gold,latch);this.box(.18,.23,.04,.08,-.04,.07,this.mat(0x73506d),latch);this.scene.add(latch);this.target(latch,'lining','Fabric caught on the latch');
 this.table(14,-13.5,2.2,.8);const plinth=new T.Group();plinth.position.set(14,1.04,-13.5);this.box(.75,.1,.6,0,0,0,this.mats.black,plinth);this.scene.add(plinth);this.target(plinth,'display','An empty bronze-falcon display');
 }
 garden(){const stone=this.mats.trim,gravel=this.mats.gravel;this.floor(5,.04,20,0,-.02,-25,gravel);this.floor(31,.04,3,13,-.01,-23,gravel);this.floor(3,.04,13,25,-.01,-29,gravel);this.floor(29,.04,3,12,-.01,-35,gravel);
 // Fountain and water.
 this.cyl(3.15,3.2,.35,0,.1,-30,stone);this.cyl(2.9,2.9,.1,0,.32,-30,this.mat(0x446f6a,.23,.25));this.cyl(.55,.75,1.35,0,.8,-30,stone);this.cyl(1.2,.8,.23,0,1.55,-30,stone);this.sphere(.25,0,1.9,-30,this.mats.gold);this.barrier(0,-30,6.2,6.2);this.target(this.scene.children[this.scene.children.length-1],'fountain','The garden fountain','Visit');
 for(const x of[-12,12]){this.barrier(x,-29,1.1,10);}for(let i=0;i<6;i++){const x=-16+i*6;this.floor(4,.32,2,x,.1,-40,this.mats.stone);this.barrier(x,-40,4,2);}
 const flowers=new T.InstancedMesh(new T.SphereGeometry(.07,5,4),this.mat(0xddbd98),480),stems=new T.InstancedMesh(new T.CylinderGeometry(.018,.025,.45,4),this.mats.leaf,480);const m=new T.Matrix4();for(let i=0;i<480;i++){const x=-18+rnd()*36,z=-39.2-rnd()*1.5,y=.4+rnd()*.4;m.makeTranslation(x,y,z);flowers.setMatrixAt(i,m);m.makeTranslation(x,y-.2,z);stems.setMatrixAt(i,m);}this.scene.add(flowers,stems);
 for(const x of[-7,7]){this.barrier(x,-36,2.8,.9);this.box(2.6,.12,.65,x,.55,-36,this.mats.wood);this.box(2.6,.6,.12,x,.95,-36.3,this.mats.wood);for(const a of[-1,1])this.box(.1,.6,.55,x+a,.22,-36,this.mats.dark);}
 // Greenhouse, with an accessible central entrance.
 const glass=this.mats.glass,metal=this.mats.dark;this.floor(10,.15,8,26,0,-29,this.mat(0x8e9277));for(const x of[21,31]){this.box(.1,3.5,8,x,1.75,-29,glass,this.scene,false);this.barrier(x,-29,.2,8);}this.box(10,3.5,.1,26,1.75,-33,glass,this.scene,false);this.barrier(26,-33,10,.2);for(const x of[22.8,29.2]){this.box(3.6,3.5,.1,x,1.75,-25,glass,this.scene,false);this.barrier(x,-25,3.6,.2);}for(let x=21;x<=31;x+=2){this.box(.08,3.6,.09,x,1.8,-25,metal);this.box(.08,3.6,.09,x,1.8,-33,metal);for(const z of[-25,-33]){const beam=this.box(5.5,.08,.09,x<26?23.5:28.5,4.2,z,metal);beam.rotation.z=x<26?.24:-.24;}}
 for(const x of[21,31])for(let z=-33;z<=-25;z+=2)this.box(.09,3.6,.08,x,1.8,z,metal);
 for(const x of[23.5,28.5]){const roof=this.box(5.5,.04,8.2,x,4.15,-29,glass,this.scene,false);roof.rotation.z=x<26?.24:-.24;}this.box(.09,.09,8.3,26,4.85,-29,metal);
 this.table(28.8,-30,2.8,1.2,.8);for(let i=0;i<6;i++){const x=22+rnd()*1.2,z=-26-i;this.cyl(.3,.22,.5,x,.3,z,this.mat(0xa66e4d));}
 const tray=new T.Group();tray.position.set(28.8,.93,-30);this.box(1.2,.2,.7,0,0,0,this.mats.wood,tray);this.box(1,.08,.6,0,.13,0,this.mat(0x514335),tray);this.scene.add(tray);this.target(tray,'falcon','Disturbed potting tray','Search');

 }
 addActor(id:PersonId,x:number,z:number,color:number,skin:number,female:boolean){const root=new T.Group();root.position.set(x,.13,z);const coat=this.mat(color),skinMat=this.mat(skin),trousers=this.mat(0x343936),boot=this.mats.black;this.round(.45,.72,.27,0,1.04,0,coat,root);this.round(.5,.3,.28,0,1.35,0,coat,root);if(female)this.cyl(.23,.34,.64,0,.65,0,coat,root);this.box(.1,.4,.015,0,1.29,.16,this.mats.cream,root);this.box(.04,.29,.02,0,1.25,.18,this.mats.dark,root);const head=new T.Group();head.position.y=1.65;this.sphere(.17,0,0,0,skinMat,head,.86,1.2,.91);this.sphere(.17,0,.07,-.025,this.mat(id==='mara'||id==='june'?0x8a8374:0x4c3c30),head,.92,.8,.96);this.sphere(.045,0,-.015,.15,skinMat,head,.6,1,.8);for(const a of[-1,1])this.sphere(.014,a*.065,.015,.147,this.mats.black,head,1,.7,.5);this.box(.05,.009,.01,0,-.08,.15,this.mat(0x815d4d),head);if(id==='tomas'||id==='jonah'){this.cyl(.2,.2,.08,0,.18,0,coat,head);this.box(.32,.025,.14,0,.145,.14,coat,head);}root.add(head);
 const arms:T.Group[]=[],legs:T.Group[]=[];for(const a of[-1,1]){const arm=new T.Group();arm.position.set(a*.29,1.32,0);this.round(.14,.48,.16,0,-.2,0,coat,arm);this.sphere(.075,0,-.49,.025,skinMat,arm,.8,1.2,.8);root.add(arm);arms.push(arm);const leg=new T.Group();leg.position.set(a*.12,.71,0);this.round(.16,.58,.19,0,-.29,0,trousers,leg);this.round(.18,.12,.32,0,-.6,.07,boot,leg);root.add(leg);legs.push(leg);}this.scene.add(root);this.actors.set(id,{root,head,arms,legs,home:root.position.clone(),id});this.target(root,'npc:'+id,({june:'June Bell',rook:'Edmund Rook',mara:'Dr. Mara Voss',ada:'Ada Ashcombe',tomas:'Tomas Reed',beatrice:'Lady Beatrice',jonah:'Jonah Pike'})[id],'Speak to');return root;}
 makeDog(){const g=new T.Group(),fur=this.mat(0xd1c4a5),patch=this.mat(0x786047);this.round(.3,.33,.65,0,.35,0,fur,g);this.sphere(.17,0,.55,.32,fur,g,.9,1,1);this.round(.16,.11,.2,0,.5,.48,fur,g);this.sphere(.045,0,.52,.59,this.mats.black,g);for(const x of[-.13,.13]){this.sphere(.08,x,.64,.3,patch,g,.6,1.5,.7);this.sphere(.02,x*.55,.58,.47,this.mats.black,g);for(const z of[-.22,.22]){const leg=this.cyl(.04,.05,.3,x,.16,z,fur,g,7);}}const tail=this.cyl(.035,.06,.35,0,.55,-.38,fur,g,7);tail.rotation.x=-.6;this.cyl(.18,.18,.045,0,.42,.27,this.mats.red,g).rotation.x=Math.PI/2;return g;}
 makeCar(){const g=new T.Group(),paint=this.mat(0x253c35,.28,.6),glass=this.mat(0x78938e,.15,.4);this.round(2.05,.65,4.7,0,.83,0,paint,g);this.round(1.85,.86,2.3,0,1.5,.3,paint,g);this.box(1.7,.55,.03,0,1.56,-.87,glass,g);this.box(1.7,.5,.03,0,1.56,1.47,glass,g);for(const x of[-.94,.94]){this.box(.02,.5,1.95,x,1.57,.3,glass,g);this.box(.05,.61,.09,x,1.56,.2,paint,g);for(const z of[-1.45,1.45]){const tire=this.cyl(.43,.43,.24,x*1.1,.46,z,this.mats.black,g,24);tire.rotation.z=Math.PI/2;const hub=this.cyl(.23,.23,.26,x*1.13,.46,z,this.mats.gold,g,18);hub.rotation.z=Math.PI/2;}this.box(.06,.06,.27,x,1.19,.45,this.mats.gold,g);}this.box(1.25,.47,.1,0,.8,-2.4,this.mats.black,g);for(let i=0;i<10;i++)this.box(.035,.4,.12,-.53+i*.118,.8,-2.46,this.mats.gold,g);for(const x of[-.78,.78]){const h=this.cyl(.17,.17,.12,x,1,-2.3,this.mats.cream,g);h.rotation.x=Math.PI/2;}this.box(2.1,.12,.14,0,.48,-2.47,this.mats.gold,g);this.box(2.1,.12,.14,0,.48,2.47,this.mats.gold,g);return g;}
 makeHands(){const g=new T.Group(),coat=this.mat(0x605544),skin=this.mat(0xc8a987);for(const side of[-1,1]){const a=new T.Group();a.position.set(side*.3,-.72,-.42);a.rotation.set(-.5,0,-side*.22);this.round(.15,.38,.17,0,-.08,0,coat,a);this.round(.13,.16,.1,0,.18,0,skin,a);for(let i=0;i<4;i++)this.round(.025,.1,.03,-.047+i*.031,.27,.015,skin,a);g.add(a);}g.visible=false;return g;}
 present(id:string){this.clearHeld();const g=new T.Group();if(id==='fragment'){this.cyl(.02,.08,.18,0,0,0,this.mats.gold,g).rotation.z=.6;}else if(id==='falcon'){this.falcon(g);g.scale.setScalar(.5);}else if(id==='lining'){this.box(.22,.26,.02,0,0,0,this.mat(0x73506d),g);}else{const data:Record<string,[string,string[]]>={note:['E. VALE',['Compare the original invoice.','We must speak tonight.']],ledger:['ESTATE ACCOUNTS',['£60  /  £180  /  £120','vel aran si']],bell:['REPAIR NOTICE',['Manual rope removed.','Automatic chime operating.']],display:['BRONZE FALCON',['Presented to Edmund Rook']],lexicon:['AVELLIC REGISTER',['vel aran si','received personally','by the steward']]};const [title,lines]=data[id]??['CASE NOTES',['Bramblewick Estate']];this.paper(title,lines,0,0,0,id==='ledger'||id==='lexicon',g);g.rotation.x=.9;g.scale.setScalar(.65);}g.position.set(-.24,-.2,-.72);this.camera.add(g);this.held=g;this.hands.visible=true;this.hands.position.y=.06;}
 clearHeld(){if(this.held){this.camera.remove(this.held);this.held.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});this.held=null;}this.hands.position.y=0;}
 resetDog(walking:boolean,doors:Record<string,boolean>){
 this.dogFollower.reset();const target=walking?this.camera.position:this.actors.get('mara')!.root.position;
 for(const radius of[1.4,.8,.4,0]){let placed=false;for(let i=0;i<8;i++){const p={x:target.x+Math.sin(i*Math.PI/4)*radius,z:target.z+Math.cos(i*Math.PI/4)*radius};if(clearAt(p,this.barriers,doors,.22)){this.dog.position.set(p.x,.08,p.z);placed=true;break}}if(placed)break}
 if(this.dogMotion){this.dogMotion.weight=0;this.dogMotion.phase=0;animateDog(this.dogMotion,0,1/60)}
 }
 pose():Pose{return {x:this.camera.position.x,z:this.camera.position.z,yaw:this.camera.rotation.y,pitch:this.camera.rotation.x};}
 setPose(p:Pose){this.camera.rotation.order='YXZ';this.camera.position.set(p.x,this.groundHeight(p.x,p.z)+1.65,p.z);this.camera.rotation.set(p.pitch,p.yaw,0,'YXZ');}
 move(dx:number,dz:number,s:GameState){
 const start=this.camera.position.clone(),barriers=this.collisionBarriers(s);
 for(const a of this.actors.values())if(a.root.visible)barriers.push({x:a.root.position.x,z:a.root.position.z,w:.4,d:.4});
 let p=resolveOverlap(start,barriers,s.doors,.26);const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.08));
 for(let i=0;i<steps;i++){const px={x:p.x+dx/steps,z:p.z};if(Math.abs(px.x)<52&&clearSegment(p,px,barriers,s.doors,.26))p=px;const pz={x:p.x,z:p.z+dz/steps};if(pz.z<53&&pz.z>-49&&clearSegment(p,pz,barriers,s.doors,.26))p=pz;}
 this.lastMove=Math.hypot(p.x-start.x,p.z-start.z)>.0001;this.camera.position.x=p.x;this.camera.position.z=p.z;
 this.camera.position.y=T.MathUtils.lerp(this.camera.position.y,this.groundHeight(p.x,p.z)+1.65,.35);
 }

 targetAt():Target|null{this.ray.setFromCamera(this.pointer,this.camera);let best:Target|null=null,near=3.25;for(const t of this.targets){if(!t.root.visible||!t.root.parent?.visible)continue;const hit=this.ray.intersectObject(t.root,true)[0];if(hit&&hit.distance<near){const occluder=this.ray.intersectObjects([...this.walls,...[...this.doors.values()].map(d=>d.pivot)],true)[0];if(occluder&&occluder.distance<hit.distance-.08)continue;near=hit.distance;best={...t,distance:near};}}return best;}
  setQuality(q:string){this.quality=q;const cap=q==='Low'?.85:q==='High'?1.8:q==='Medium'?1.25:Math.min(devicePixelRatio,1.25);this.renderer.setPixelRatio(Math.min(devicePixelRatio,cap));this.renderer.shadowMap.enabled=q!=='Low';this.ao.enabled=q!=='Low';this.renderer.setSize(innerWidth,innerHeight);this.composer.setPixelRatio(this.renderer.getPixelRatio());this.composer.setSize(innerWidth,innerHeight);this.ao.setSize(Math.round(innerWidth*.75),Math.round(innerHeight*.75));}
 update(dt:number,s:GameState,playing:boolean,talking:PersonId|null,arrivalT:number,menu=false){if(playing||talking)this.clock+=dt;
 for(const[id,d]of this.doors){const goal=s.doors[id]?-Math.PI/2:0;d.angle=T.MathUtils.damp(d.angle,goal,10,dt);d.pivot.rotation.y=d.angle;}
 const solid=this.collisionBarriers(s);
 for(const[id,a]of this.actors){
 if((id==='beatrice'||id==='jonah')&&s.arrival!=='present'){a.root.visible=false;continue;}a.root.visible=true;
 const before=a.root.position.clone();
 const nearby=[...this.actors.values()].filter(other=>other.id!==id&&other.root.visible&&other.root.position.distanceTo(a.root.position)<4).map(other=>({x:other.root.position.x,z:other.root.position.z,w:.48,d:.48}));
 const result=this.routines.update(id,a.root.position,dt,[...solid,...nearby],s.doors,!playing||id===talking,this.camera.position,a.root.rotation.y);a.root.position.x=result.position.x;a.root.position.z=result.position.z;
 a.root.position.y=this.groundHeight(a.root.position.x,a.root.position.z);a.isWalking=result.moving;a.activity=id===talking?null:result.activity;a.activityLabel=result.label;
 const targetAngle=id===talking?Math.atan2(this.camera.position.x-a.root.position.x,this.camera.position.z-a.root.position.z):result.face;
 if(playing||id===talking){const delta=Math.atan2(Math.sin(targetAngle-a.root.rotation.y),Math.cos(targetAngle-a.root.rotation.y));a.root.rotation.y+=delta*Math.min(1,dt*5);}
 animateCharacter(this,id,result.moving,dt,!playing&&!talking,a.activity??null,this.clock,dt>0?Math.hypot(a.root.position.x-before.x,a.root.position.z-before.z)/dt:0);
 }

 this.car.visible=s.arrival!=='absent'&&s.arrival!=='queued';if(s.arrival==='arriving')this.car.position.z=56-32*T.MathUtils.smoothstep(arrivalT,0,1);if(s.arrival==='present')this.car.position.z=24;this.car.position.y=this.groundHeight(this.car.position.x,this.car.position.z)-.03;
 if(playing){
 const target=s.dog==='walking'?this.camera.position:this.actors.get('mara')!.root.position;
 const follow=this.dogFollower.update(this.dog.position,this.dog.rotation.y,target,dt,solid,s.doors,false);
 this.dog.position.x=follow.position.x;this.dog.position.z=follow.position.z;this.dog.rotation.y=follow.heading;
 this.dog.position.y=this.groundHeight(this.dog.position.x,this.dog.position.z);
 if(this.dogMotion)animateDog(this.dogMotion,follow.distance,dt);
 }
 if(this.clockPendulum)this.clockPendulum.rotation.z=Math.sin(this.clock*2.7)*.085;
 this.gesture=Math.max(0,this.gesture-dt*2);if(!this.held){this.hands.visible=this.gesture>0;this.hands.position.y=this.gesture*.16+(playing&&this.lastMove?Math.sin(this.clock*7)*.008:0);}
 if(menu){this.camera.position.set(17+Math.sin(this.clock*.016)*1.2,4.4,46);this.camera.lookAt(0,6.1,2);this.hands.visible=false;this.clock+=dt;}
 this.composer.render(dt);
 }
}
