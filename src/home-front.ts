import * as T from 'three';
import type {Estate} from './world';
import {clone} from 'three/addons/utils/SkeletonUtils.js';

function notice(e:Estate,id:string,label:string,title:string,lines:string[],x:number,y:number,z:number,yaw=0){
 const g=new T.Group();g.position.set(x,y,z);g.rotation.y=yaw;e.scene.add(g);
 e.box(.6,.77,.047,0,0,0,e.mats.panel,g);
 e.paper(title,lines,0,0,-.006,false,g).rotation.x=Math.PI/2;
 e.target(g,id,label,'Read');
}

export function lodgeEvacueeRoom(e:Estate,mid:number){
 const iron=e.mats.dark,linen=e.mat(0xd5c8aa,.97),quilt=e.mat(0x676d57,.96);
 for(const [i,z] of [mid-2.15,mid+2.15].entries()){
  const x=-9.45;e.barrier(x,z,2.05,.93);
  e.box(1.96,.12,.89,x,.46,z,iron);
  e.round(1.94,.17,.86,x,.58,z,linen,e.scene);
  e.round(1.38,.09,.88,x+.29,.68,z,quilt,e.scene);
  e.round(.36,.14,.68,x-.67,.71,z,linen,e.scene);
  for(const [dx,h] of [[-.98,.98],[.98,.76]]){
   for(const dz of [-.4,.4]){
    e.cyl(.023,.026,h,x+dx,.075+h/2,z+dz,iron,e.scene,8);
    e.sphere(.034,x+dx,.075+h,z+dz,e.mats.gold);
   }
   e.box(.04,.045,.82,x+dx,h,z,iron);
   for(const dz of [-.25,0,.25])e.box(.027,h-.47,.026,x+dx,(h+.47)/2,z+dz,iron);
  }
  e.box(.22,.025,.3,x+.71,.737,z,i?linen:quilt);
 }
 e.table(-10.85,mid,.8,.8,.68);
 const letters=e.paper('DEAR MUM',['I have my own peg here.','Mrs Mercer says I have grown.','Please write when you can.','Love, Elsie'],-10.85,.76,mid);
 letters.scale.set(.67,1,.67);
 e.box(.012,.014,.46,0,.056,0,e.mats.red,letters);
 e.box(.38,.014,.012,0,.056,0,e.mats.red,letters);
 e.target(letters,'lodge-letters','Letters home','Read');
 e.box(.085,.16,1.9,-11.68,1.36,mid+1.45,e.mats.panel);
 for(let i=0;i<5;i++)e.cyl(.023,.023,.12,-11.59,1.39,mid+.72+i*.36,e.mats.wood).rotation.z=Math.PI/2;
 const chart=new T.Group();chart.position.set(-11.69,0,mid-3.55);e.scene.add(chart);
 e.box(.04,1.03,.23,0,1.12,0,e.mats.wood,chart);
 for(let i=0;i<16;i++)e.box(.008,.008,i%4===0?.13:.065,.025,.66+i*.059,-.09+(i%4===0?.065:.0325),iron,chart);
 for(const [y,width] of [[1.04,.16],[1.17,.19],[1.26,.17]])e.box(.009,.012,width,.027,y,.03,quilt,chart);
 e.target(chart,'lodge-heights','Evacuees’ height chart','Read');
}

export function groundHomeFront(e:Estate){
 const {panel,wood,dark,gold,cream}=e.mats,enamel=e.mat(0x52635c,.71),red=e.mat(0x794e45,.86);
 // The station sits tight to the back wall, out of the scullery route.
 const x=1.5,z=-15.52;
 notice(e,'fire-watch-rota','Fire-watch rota','FIRE WATCH',['20:00–20:30 · L. Price','20:10 · Relieved (A. Hale)','20:30–21:00 · J. Bell'] ,x,1.52,-15.65);
 e.cyl(.18,.135,.26,x,.205,z,enamel,e.scene,14);
 e.cyl(.02,.02,.57,x+.19,.49,z,gold,e.scene,8);
 e.box(.3,.035,.048,x+.19,.78,z,wood);
 e.box(.24,.026,.12,x+.19,.095,z,dark);
 e.cyl(.035,.047,.2,x-.26,.102,z,dark).rotation.z=Math.PI/2;
 e.barrier(x,z,.65,.42);
 const px=-8.62,pz=-14.88;
 notice(e,'orchard-tally','Orchard tally','ORCHARD',['Apples  |||||','Pears     |||','T. Reed · windfalls at dusk'],px,1.7,pz);
 e.box(1.05,.075,.36,px,1.12,pz+.14,panel);
 for(let i=0;i<4;i++){
  const j=px-.37+i*.24,m=i%2?red:enamel;
  e.cyl(.067,.071,.16,j,1.246,pz+.14,m,e.scene,10);
  e.cyl(.069,.069,.025,j,1.336,pz+.14,cream,e.scene,10);
  e.box(.082,.05,.008,j,1.25,pz+.207,cream);
 }
 const towel=e.round(.36,.027,.29,-11.42,1.077,-15.24,cream,e.scene);
 towel.rotation.y=.24;
 for(let i=0;i<4;i++)e.box(.004,.007,.1,-11.49+i*.02,1.095,-15.23,red);

 // Bicycle parked along the gatehouse wall, clear of the side door and desk.
 const g=new T.Group();g.position.set(-12.4,.075,42.62);e.scene.add(g);
 const beam=(a:T.Vector3,b:T.Vector3,r=.019,m=enamel)=>{
  const d=b.clone().sub(a),p=a.clone().addScaledVector(d,.5);
  const cylinder=e.cyl(r,r,d.length(),p.x,p.y,p.z,m,g,8);
  cylinder.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());
 };
 const point=(x:number,y:number)=>new T.Vector3(x,y,0);
 for(const wx of [-.57,.57]){
  for(const [r,t,m] of [[.335,.024,dark],[.308,.011,gold]] as const){
   const wheel=new T.Mesh(new T.TorusGeometry(r,t,6,26),m);wheel.position.set(wx,.36,0);g.add(wheel);
  }
  for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(point(wx,.36),point(wx+Math.cos(a)*.3,.36+Math.sin(a)*.3),.004,gold);}
 }
 const seat=point(-.19,.84),head=point(.33,.82),pedals=point(-.06,.36);
 for(const [a,b] of [[seat,head],[head,pedals],[pedals,seat],[pedals,point(-.57,.36)],[seat,point(-.57,.36)],[head,point(.57,.36)],[head,point(.32,1.01)]])beam(a,b);
 e.round(.25,.055,.17,-.19,.88,0,dark,g);
 e.box(.043,.026,.29,.32,1.015,0,gold,g);
 e.barrier(-12.4,42.62,1.86,.3);
 const mail=e.paper('TO THE HOUSE',['From the village postmistress','For Mrs Bell · by bicycle'],-13.97,1.035,44.52);
 mail.scale.set(.58,1,.52);mail.rotation.y=-.16;e.target(mail,'gatehouse-mail','Gatehouse messages','Read');
 e.cyl(.032,.04,.19,-14.39,1.06,44.22,dark).rotation.x=Math.PI/2;
 e.cyl(.05,.05,.028,-14.39,1.06,44.328,gold).rotation.x=Math.PI/2;
}

const portraitNames=['beatrice','ada','rook'] as const;
const portraitW=144,portraitH=195,portraitMargin=8;
export function upperHomeFront(e:Estate,y:number){
 const cv=document.createElement('canvas');
 cv.width=portraitNames.length*(portraitW+portraitMargin)+portraitMargin;
 cv.height=portraitH+2*portraitMargin;
 const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;
 // The rear window bay centers are x=0 and x=5.
 const frame=e.box(1.89,.943,.058,2.5,y+1.6,-15.65,e.mats.panel);
 const photo=new T.Mesh(new T.PlaneGeometry(1.76,1.76*cv.height/cv.width),new T.MeshStandardMaterial({map:tex,roughness:.93}));
 photo.position.z=.033;frame.add(photo);
 e.target(frame,'family-photos','Painted portraits of the household');
}

export function paintHouseholdPortraits(e:Estate){
 const frame=e.targets.find(t=>t.id==='family-photos')?.root;
 const art=frame?.children[0];
 if(!(art instanceof T.Mesh)||!(art.material instanceof T.MeshStandardMaterial)||!art.material.map)return;
 const tex=art.material.map,canvas=tex.image as HTMLCanvasElement,ctx=canvas.getContext('2d');
 if(!ctx)return;
 const renderer=e.renderer,oldTarget=renderer.getRenderTarget(),oldColor=renderer.getClearColor(new T.Color()),oldAlpha=renderer.getClearAlpha();
 const target=new T.WebGLRenderTarget(portraitW,portraitH);
 const pixels=new Uint8Array(portraitW*portraitH*4);
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-.28,.28,.38,-.38,.1,10);
 scene.add(new T.HemisphereLight(0xffe8cd,0x807570,1.65));
 const key=new T.DirectionalLight(0xffe5c0,2.3);key.position.set(-2,3,3);scene.add(key);
 const fill=new T.DirectionalLight(0xd7def0,.65);fill.position.set(2,2,-1);scene.add(fill);
 ctx.fillStyle='#a18b64';ctx.fillRect(0,0,canvas.width,canvas.height);
 try{
  for(const [i,id] of portraitNames.entries()){
   const original=e.characterMotion.get(id)?.root;
   if(!original)continue;
   const model=clone(original);scene.add(model);model.updateMatrixWorld(true);
   const head=model.getObjectByName('head')?.getWorldPosition(new T.Vector3())??new T.Vector3(0,1.54,0);
   const center=head.clone().add(new T.Vector3(0,-.10,0));
   camera.position.copy(center).add(new T.Vector3([.28,-.36,.17][i],.07,2));
   camera.lookAt(center);
   scene.background=new T.Color([0x514840,0x495247,0x59463d][i]);
   renderer.setRenderTarget(target);renderer.render(scene,camera);
   renderer.readRenderTargetPixels(target,0,0,portraitW,portraitH,pixels);
   const image=ctx.createImageData(portraitW,portraitH);
   for(let y=0;y<portraitH;y++)for(let x=0;x<portraitW;x++){
    const src=((portraitH-y-1)*portraitW+x)*4,dst=(y*portraitW+x)*4;
    const vignette=1-.29*Math.hypot((x-portraitW/2)/portraitW,(y-portraitH/2)/portraitH);
    const grain=((Math.imul(x+1,1561)^Math.imul(y+1,761))&15)-7;
    for(let c=0;c<3;c++)image.data[dst+c]=(Math.pow(pixels[src+c]/255,1/2.2)*255*[1.04,.91,.76][c]*vignette)+grain*.46;
    image.data[dst+3]=255;
   }
   ctx.putImageData(image,portraitMargin+i*(portraitW+portraitMargin),portraitMargin);
   scene.remove(model);
  }
  tex.needsUpdate=true;
 }finally{
  renderer.setRenderTarget(oldTarget);renderer.setClearColor(oldColor,oldAlpha);target.dispose();
 }
}
