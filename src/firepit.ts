import {gardenSurface,mergeGardenParts} from './garden-surfaces';
import * as T from 'three';
import type {Estate} from './world';
export const FIREPIT={x:18,z:-43,radius:1.05};
export function buildFirepit(e:Estate){
 const root=new T.Group();root.name='Garden firepit';const {x,z,radius}=FIREPIT,y=e.groundHeight(x,z);
 root.position.set(x,y,z);e.scene.add(root);
 // Follow the round stone rim; a single square leaves invisible blocked corners.
 const rim=1.2,strips=16,step=2*rim/strips;
 for(let i=0;i<strips;i++){
  const dz=-rim+(i+.5)*step,inner=Math.max(0,Math.abs(dz)-step/2);
  e.barrier(x,z+dz,2*Math.sqrt(rim*rim-inner*inner),step);
 }
 const stone=gardenSurface('stone',0xa69c8a),ash=e.mat(0x38332d,1),charcoal=e.mat(0x201c18,1);
 e.cyl(radius+.12,radius+.2,.035,0,.018,0,ash,root,48);
 const basin=new T.Mesh(new T.CircleGeometry(.84,48),ash);basin.rotation.x=-Math.PI/2;basin.position.y=.045;root.add(basin);
 stone.vertexColors=true;
 const stoneGeometry=new T.IcosahedronGeometry(.245,1),sp=stoneGeometry.attributes.position;
 const colors:number[]=[];
 for(let i=0;i<sp.count;i++){
  const px=sp.getX(i),py=sp.getY(i),pz=sp.getZ(i),grain=Math.sin(px*173+py*211+pz*97);
  sp.setXYZ(i,px*(1+.09*grain),py*(1+.07*grain),pz*(1+.08*grain));
  const tone=.77+.16*(grain+1)/2;colors.push(tone,tone*.97,tone*.91);
 }
 stoneGeometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));stoneGeometry.computeVertexNormals();
 for(let row=0;row<2;row++)for(let i=0;i<12;i++){
  const a=(i+row*.5)/12*Math.PI*2;
  const block=new T.Mesh(stoneGeometry,stone);block.position.set(Math.sin(a)*.95,.11+row*.15,Math.cos(a)*.95);
  block.scale.set(1.05+.12*Math.sin(i*3),.6,.78);block.rotation.set(.08*Math.sin(i),a,.06*Math.cos(i));block.castShadow=true;block.receiveShadow=true;root.add(block);
 }
 const bark=gardenSurface('bark',0x79604b),cut=e.mat(0x9c7951,1);
 bark.vertexColors=true;
 const logGeometry=new T.CylinderGeometry(.082,.108,1.06,16,5),lp=logGeometry.attributes.position,lc:number[]=[];
 for(let i=0;i<lp.count;i++){
  const a=Math.atan2(lp.getZ(i),lp.getX(i)),y=lp.getY(i),ridge=1+.12*Math.sin(a*9)+.05*Math.sin(y*31+a*4);
  lp.setXYZ(i,lp.getX(i)*ridge,y,lp.getZ(i)*ridge);
  const v=.55+.4*(.5+.5*Math.sin(a*9+y*3));lc.push(v,v*.86,v*.71);
 }
 logGeometry.setAttribute('color',new T.Float32BufferAttribute(lc,3));logGeometry.computeVertexNormals();
 for(let i=0;i<5;i++){
  const timber=new T.Group();timber.name='Bark and cut firewood';timber.position.set(Math.sin(i*3)*.08,.18+i*.038,Math.cos(i*2)*.11);timber.rotation.set(Math.PI/2,.12*Math.sin(i),i*1.29);root.add(timber);
  const log=new T.Mesh(logGeometry,bark);log.castShadow=true;log.receiveShadow=true;timber.add(log);
  for(const side of[-1,1]){
   const end=e.cyl(.078,.078,.008,0,side*.534,0,cut,timber,16);
   end.scale.setScalar(side<0?1.28:1);
   for(const r of[.03,.055]){
    const ring=new T.Mesh(new T.TorusGeometry(r,.0017,3,20),bark);ring.rotation.x=Math.PI/2;ring.position.y=side*.541;timber.add(ring);
   }
   e.box(.003,.002,.105,.009,side*.544,0,charcoal,timber,false).rotation.y=.4+i;
  }
  e.cyl(.085,.089,.43,0,0,0,charcoal,timber,12);
 }
 // Four slatted armchairs leave broad gaps to approach the fire.
 const timber=e.mats.wood.clone();timber.roughness=.96;
 for(let i=0;i<4;i++){
  const a=Math.PI/4+i*Math.PI/2,cx=x+Math.sin(a)*3,cz=z+Math.cos(a)*3;
  const chair=new T.Group();chair.name='Firepit garden armchair';chair.position.set(cx,e.groundHeight(cx,cz),cz);chair.rotation.y=a+Math.PI;e.scene.add(chair);
  for(const dx of[-.29,.29])for(const dz of[-.27,.27])e.box(.065,.5,.065,dx,.25,dz,timber,chair);
  for(let j=0;j<6;j++)e.box(.65,.045,.087,0,.48,-.27+j*.105,timber,chair);
  for(const dx of[-.29,.29]){
   e.box(.065,.57,.065,dx,.77,-.29,timber,chair);
   e.box(.052,.23,.052,dx,.61,.23,timber,chair);
   e.box(.105,.045,.69,dx,.74,0,timber,chair);
   e.box(.055,.065,.62,dx,.3,0,timber,chair);
  }
  for(let j=0;j<5;j++){const slat=e.box(.098,.49,.041,-.25+j*.125,.79,-.32,timber,chair);slat.rotation.x=-.13;}
  e.box(.69,.065,.055,0,1.05,-.35,timber,chair);
  e.barrier(cx,cz,1,1);mergeGardenParts(chair);
 }
 const emberMaterial=new T.MeshStandardMaterial({color:0x6b2110,emissive:0xf84c0b,emissiveIntensity:1.6,roughness:1});
 const emberGeometry=new T.IcosahedronGeometry(1,0);
 for(let i=0;i<22;i++){
  const a=i*2.4,r=.12+(.1*(i%5)),size=.024+(i%3)*.006;const ember=new T.Mesh(emberGeometry,emberMaterial);ember.position.set(Math.sin(a)*r,.09,Math.cos(a)*r);ember.scale.set(size,size*.5,size);root.add(ember);
 }
 const time={value:0};
 const flameMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,
  uniforms:{time},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`varying vec2 vUv; uniform float time;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
  void main(){float y=vUv.y;float n=noise(vec2(vUv.x*6.0,y*5.0-time*2.2));
   float sway=sin(y*8.0-time*2.5)*.075*y;
   float edge=abs(vUv.x-.5+sway)*2.0;
   float height=1.0-y;float shape=height*height*.8+(n-.5)*.28;
   float alpha=(1.0-smoothstep(shape-.06,shape+.12,edge))*smoothstep(0.0,.16,y)*(1.0-smoothstep(.65,1.0,y));
   vec3 color=mix(vec3(1.0,.16,.015),vec3(1.0,.72,.16),pow(1.0-y,2.0));
   gl_FragColor=vec4(color,alpha*.72);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`});
 const flames=new T.Group();flames.name='Firepit flames';root.add(flames);
 for(let i=0;i<3;i++){
  const m=new T.Mesh(new T.PlaneGeometry(.86,.78),flameMaterial);m.position.y=.48;m.rotation.y=i*Math.PI/3;flames.add(m);
 }
 e.target(root,'garden-firepit','Garden firepit','Inspect');
 return (dt:number)=>{time.value=(time.value+Math.min(dt,.1))%1000;emberMaterial.emissiveIntensity=1.35+.15*Math.sin(time.value*4.3);};
}
