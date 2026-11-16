import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export const FOUNTAIN_Z=-30;
const LOWER=.328,UPPER=1.735;
const TAU=Math.PI*2;
const jetAngles=Array.from({length:4},(_,i)=>Math.PI/4+i*Math.PI/2);
const fallAngles=Array.from({length:8},(_,i)=>i*Math.PI/4+.065*Math.sin(i*7));
const polar=(r:number,y:number,a:number)=>new T.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);

function waterNormals(){
 const n=64,data=new Uint8Array(n*n*4),normal=new T.Vector3();
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const u=x/n*TAU,v=y/n*TAU;
  const a=Math.cos(3*u+2*v),b=Math.cos(u-4*v),c=Math.cos(6*u+5*v);
  normal.set(.16*a+.11*b+.045*c,.11*a-.21*b+.048*c,1).normalize();
  const i=(y*n+x)*4;
  data.set([127.5*(normal.x+1),127.5*(normal.y+1),127.5*(normal.z+1),255],i);
 }
 const map=new T.DataTexture(data,n,n);map.wrapS=map.wrapT=T.RepeatWrapping;
 map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;
 map.generateMipmaps=true;map.repeat.set(2.3,2.3);map.needsUpdate=true;
 return map;
}

function fallingRibbon(angle:number,index:number){
 const pos:number[]=[],uv:number[]=[],indices:number[]=[];
 for(let i=0;i<=18;i++){
  const t=i/18,r=1.165+.48*t, y=UPPER-(UPPER-LOWER)*t*t;
  const width=(.065+(index%3)*.019)*(1-.68*t);
  for(let j=0;j<3;j++){
   const a=angle+(j-1)*width+.008*Math.sin(t*8+index);
   const v=polar(r+(j===1?.018:0),y,a);
   pos.push(v.x,v.y,v.z);uv.push(t,j/2);
  }
  if(i)for(let j=0;j<2;j++){
   const k=(i-1)*3+j;indices.push(k,k+3,k+1,k+1,k+3,k+4);
  }
 }
 const geo=new T.BufferGeometry();geo.setIndex(indices);
 geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));
 geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 geo.computeVertexNormals();return geo;
}

export class FountainWater {
 group=new T.Group();
 private time=0;
 private normals=waterNormals();
 private flowTime={value:0};
 private rings:T.InstancedMesh;
 private ringAlpha:T.InstancedBufferAttribute;
 private spray:T.InstancedMesh;
 private dummy=new T.Object3D();
 private point=new T.Vector3();
 private impacts=[...jetAngles.map(a=>polar(.91,UPPER,a)),...fallAngles.map(a=>polar(1.645,LOWER,a))];

 constructor(parent:T.Object3D){
  this.group.name='Fountain water';this.group.position.z=FOUNTAIN_Z;parent.add(this.group);
  const poolMaterial=new T.MeshStandardMaterial({normalMap:this.normals,normalScale:new T.Vector2(.8,.8),
   color:0x829891,roughness:.15,metalness:.13,envMapIntensity:1.55,transparent:true,opacity:.48,depthWrite:false});
  for(const [radius,y] of [[2.84,LOWER],[1.15,UPPER]]){
   const pool=new T.Mesh(new T.CircleGeometry(radius,64),poolMaterial);
   pool.rotation.x=-Math.PI/2;pool.position.y=y;pool.receiveShadow=true;
   pool.renderOrder=1;this.group.add(pool);
  }
  const clearWater=new T.MeshStandardMaterial({color:0xd3e1db,roughness:.14,metalness:.12,envMapIntensity:1.6,
   transparent:true,opacity:.72,depthWrite:false,side:T.DoubleSide,emissive:0x45615c,emissiveIntensity:.17});
  clearWater.forceSinglePass=true;
  clearWater.onBeforeCompile=shader=>{
   shader.uniforms.fountainTime=this.flowTime;
   shader.vertexShader='varying vec2 vFountainUV;\n'+shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n vFountainUV=uv;');
   shader.fragmentShader='uniform float fountainTime; varying vec2 vFountainUV;\n'+shader.fragmentShader.replace('#include <alphatest_fragment>',`
    float streak=0.64+0.36*sin(56.0*vFountainUV.x-15.0*fountainTime+sin(vFountainUV.y*18.0));
    float edge=0.6+0.4*sin(vFountainUV.y*3.14159);
    diffuseColor.a*=streak*edge;
    diffuseColor.rgb*=0.84+0.24*streak;
    #include <alphatest_fragment>`);
  };
  const pieces:T.BufferGeometry[]=jetAngles.map((a,i)=>{
   const curve=new T.CubicBezierCurve3(polar(.246,2.075,a),polar(.47,2.34+i*.013,a),polar(.77,2.3,a),polar(.91,UPPER,a));
   return new T.TubeGeometry(curve,20,.012+(i%2)*.002,6,false);
  });
  pieces.push(...fallAngles.map(fallingRibbon));
  const streams=new T.Mesh(mergeGeometries(pieces)!,clearWater);
  pieces.forEach(g=>g.dispose());streams.renderOrder=2;this.group.add(streams);

  const rings=new T.RingGeometry(.88,1,24);
  this.ringAlpha=new T.InstancedBufferAttribute(new Float32Array(this.impacts.length*2),1).setUsage(T.DynamicDrawUsage);
  rings.setAttribute('rippleAlpha',this.ringAlpha);
  const ringMat=new T.MeshBasicMaterial({color:0xd6e4db,transparent:true,depthWrite:false});
  ringMat.onBeforeCompile=shader=>{
   shader.vertexShader='attribute float rippleAlpha; varying float vRippleAlpha;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vRippleAlpha=rippleAlpha;');
   shader.fragmentShader='varying float vRippleAlpha;\n'+shader.fragmentShader.replace('#include <alphatest_fragment>','#include <alphatest_fragment>\n diffuseColor.a*=vRippleAlpha;');
  };
  this.rings=new T.InstancedMesh(rings,ringMat,this.ringAlpha.count);
  this.rings.frustumCulled=false;this.rings.renderOrder=3;this.group.add(this.rings);
  this.spray=new T.InstancedMesh(new T.SphereGeometry(1,5,4),new T.MeshBasicMaterial({color:0xcddfd8,transparent:true,opacity:.6,depthWrite:false}),this.impacts.length*4);
  this.spray.frustumCulled=false;this.spray.renderOrder=4;this.group.add(this.spray);
  this.update(0,new T.Vector3(0,1,FOUNTAIN_Z));
 }

 update(dt:number,camera:T.Vector3){
  const distance=Math.hypot(camera.x,camera.z-FOUNTAIN_Z);
  this.time+=dt;
  this.group.visible=distance<68;if(!this.group.visible)return;
  this.flowTime.value=this.time;
  this.normals.offset.set((this.time*.023)%1,(-this.time*.017)%1);
  this.rings.visible=this.spray.visible=distance<26;
  if(!this.rings.visible)return;
  const d=this.dummy;d.rotation.set(-Math.PI/2,0,0);
  for(const [i,impact] of this.impacts.entries())for(let n=0;n<2;n++){
   const age=(this.time*(i<4?1.4:.96)+i*.191+n*.5)%1;
   d.position.copy(impact);d.position.y+=.008+n*.002;
   d.scale.setScalar(.035+age*(i<4?.12:.32));d.updateMatrix();
   const index=i*2+n;
   this.rings.setMatrixAt(index,d.matrix);
   this.ringAlpha.setX(index,(1-age)**2*(i<4?.41:.54));
  }
  this.rings.instanceMatrix.needsUpdate=this.ringAlpha.needsUpdate=true;
  d.rotation.set(0,0,0);
  for(const [i,impact] of this.impacts.entries())for(let n=0;n<4;n++){
   const phase=(this.time*(2.1+n*.13)+i*.283+n*.27)%1;
   const angle=i*1.7+n*2.39;
   const height=(.09+n*.023)*(i<4?.65:1);
   this.point.copy(impact);
   this.point.x+=Math.cos(angle)*phase*.18;this.point.z+=Math.sin(angle)*phase*.18;
   this.point.y+=4*height*phase*(1-phase);
   d.position.copy(this.point);d.scale.setScalar((.008+n*.0015)*(1-.65*phase));d.updateMatrix();
   this.spray.setMatrixAt(i*4+n,d.matrix);
  }
  this.spray.instanceMatrix.needsUpdate=true;
 }
}
