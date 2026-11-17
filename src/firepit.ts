import * as T from 'three';
import type {Estate} from './world';
export const FIREPIT={x:18,z:-43,radius:1.05};
export function buildFirepit(e:Estate){
 const root=new T.Group();root.name='Garden firepit';const {x,z,radius}=FIREPIT,y=e.groundHeight(x,z);
 root.position.set(x,y,z);e.scene.add(root);e.barrier(x,z,radius*2,radius*2);
 const stone=e.mats.stone,ash=e.mat(0x38332d,1),charcoal=e.mat(0x201c18,1);
 e.cyl(radius+.12,radius+.2,.035,0,.018,0,ash,root,48);
 const basin=new T.Mesh(new T.CircleGeometry(.84,48),ash);basin.rotation.x=-Math.PI/2;basin.position.y=.045;root.add(basin);
 const stoneGeometry=new T.IcosahedronGeometry(.245,1);
 for(let row=0;row<2;row++)for(let i=0;i<12;i++){
  const a=(i+row*.5)/12*Math.PI*2;
  const block=new T.Mesh(stoneGeometry,stone);block.position.set(Math.sin(a)*.95,.11+row*.15,Math.cos(a)*.95);block.scale.set(1,.48,.65);block.rotation.y=a;block.castShadow=true;block.receiveShadow=true;root.add(block);
 }
 for(let i=0;i<5;i++){
  const log=e.cyl(.075,.105,.95,0,.13+i*.017,0,e.mats.wood,root,12);log.rotation.set(Math.PI/2,0,i*1.29);
  const burned=e.cyl(.077,.086,.58,0,.14+i*.017,0,charcoal,root,12);burned.rotation.copy(log.rotation);
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
