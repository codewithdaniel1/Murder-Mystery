import * as T from 'three';

const LOWER_WATER_Y=.318;
const UPPER_WATER_Y=1.735;

function flowTexture(){
 const width=128,height=16,data=new Uint8Array(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const crest=Math.pow(.5+.5*Math.sin(x*.29+Math.sin(y*.65)*.8),8);
  const fine=.5+.5*Math.sin(x*.91+y*1.7);
  const i=(y*width+x)*4;
  data[i]=165+Math.round(70*crest);data[i+1]=210+Math.round(35*crest);
  data[i+2]=218+Math.round(32*crest);data[i+3]=120+Math.round(90*crest+25*fine);
 }
 const texture=new T.DataTexture(data,width,height,T.RGBAFormat);
 texture.colorSpace=T.SRGBColorSpace;texture.wrapS=T.RepeatWrapping;
 texture.wrapT=T.RepeatWrapping;texture.repeat.set(3,1);
 texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearMipmapLinearFilter;
 texture.generateMipmaps=true;texture.needsUpdate=true;return texture;
}

function surfaceTexture(){
 const size=64,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const band=Math.sin(x*.5+y*.29)+Math.sin(x*.18-y*.62);
  const sheen=Math.max(0,band)*5;
  const i=(y*size+x)*4;
  data[i]=86+sheen;data[i+1]=129+sheen;data[i+2]=134+sheen;data[i+3]=255;
 }
 const texture=new T.DataTexture(data,size,size,T.RGBAFormat);
 texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;
 texture.repeat.set(2,2);texture.magFilter=T.LinearFilter;
 texture.minFilter=T.LinearMipmapLinearFilter;texture.generateMipmaps=true;
 texture.needsUpdate=true;return texture;
}

type Ripple={mesh:T.Mesh<T.RingGeometry,T.MeshBasicMaterial>;phase:number;upper:boolean};

/** Light, animated water for the garden fountain; all parts share one parent. */
export class FountainWater {
 group=new T.Group();
 private time=0;
 private flow=flowTexture();
 private surface=surfaceTexture();
 private ripples:Ripple[]=[];
 private paths:T.CubicBezierCurve3[]=[];
 private droplets:T.InstancedMesh;
 private dummy=new T.Object3D();
 private point=new T.Vector3();

 constructor(parent:T.Object3D){
  this.group.position.set(0,0,-30);parent.add(this.group);
  const poolMaterial=new T.MeshStandardMaterial({map:this.surface,color:0xa7d3cf,roughness:.23,metalness:.08,transparent:true,opacity:.92,depthWrite:false,side:T.DoubleSide});
  for(const [radius,y] of [[2.78,LOWER_WATER_Y],[1.08,UPPER_WATER_Y]]){
   const pool=new T.Mesh(new T.CircleGeometry(radius,64),poolMaterial);
   pool.rotation.x=-Math.PI/2;pool.position.y=y;pool.receiveShadow=true;
   pool.renderOrder=1;this.group.add(pool);
  }
  const streamMaterial=new T.MeshStandardMaterial({map:this.flow,color:0xb8e5e3,roughness:.12,metalness:.12,transparent:true,opacity:.78,depthWrite:false,side:T.DoubleSide,emissive:0x24464a,emissiveIntensity:.16});
  const makeStream=(curve:T.CubicBezierCurve3,radius:number)=>{
   const mesh=new T.Mesh(new T.TubeGeometry(curve,24,radius,7,false),streamMaterial);
   mesh.renderOrder=2;this.group.add(mesh);this.paths.push(curve);
  };
  for(let i=0;i<8;i++){
   const angle=i*Math.PI/4,c=Math.cos(angle),s=Math.sin(angle);
   makeStream(new T.CubicBezierCurve3(
    new T.Vector3(c*.16,2.14,s*.16),new T.Vector3(c*.37,2.46,s*.37),
    new T.Vector3(c*.76,2.23,s*.76),new T.Vector3(c*.9,UPPER_WATER_Y+.008,s*.9)
   ),.017);
  }
  for(let i=0;i<10;i++){
   const angle=i*Math.PI/5,c=Math.cos(angle),s=Math.sin(angle);
   makeStream(new T.CubicBezierCurve3(
    new T.Vector3(c*1.2,1.76,s*1.2),new T.Vector3(c*1.28,1.53,s*1.28),
    new T.Vector3(c*1.46,.58,s*1.46),new T.Vector3(c*1.59,LOWER_WATER_Y+.015,s*1.59)
   ),.028);
  }
  const ringGeometry=new T.RingGeometry(.075,.092,32);
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4,ring=new T.Mesh(ringGeometry,new T.MeshBasicMaterial({color:0xc9e5df,transparent:true,opacity:.25,depthWrite:false,side:T.DoubleSide}));
   ring.rotation.x=-Math.PI/2;ring.position.set(Math.cos(a)*.9,UPPER_WATER_Y+.012,Math.sin(a)*.9);
   ring.renderOrder=3;this.group.add(ring);this.ripples.push({mesh:ring,phase:i/8,upper:true});
  }
  for(let i=0;i<10;i++){
   const a=i*Math.PI/5,ring=new T.Mesh(ringGeometry,new T.MeshBasicMaterial({color:0xd3ece8,transparent:true,opacity:.28,depthWrite:false,side:T.DoubleSide}));
   ring.rotation.x=-Math.PI/2;ring.position.set(Math.cos(a)*1.59,LOWER_WATER_Y+.012,Math.sin(a)*1.59);
   ring.renderOrder=3;this.group.add(ring);this.ripples.push({mesh:ring,phase:i/10,upper:false});
  }
  this.droplets=new T.InstancedMesh(new T.SphereGeometry(.024,6,5),new T.MeshStandardMaterial({color:0xd6f0eb,roughness:.08,transparent:true,opacity:.7,depthWrite:false}),this.paths.length*3);
  this.droplets.frustumCulled=false;this.droplets.renderOrder=4;this.group.add(this.droplets);
 }

 update(dt:number,camera:T.Vector3){
  const dx=camera.x,dz=camera.z+30;
  this.group.visible=dx*dx+dz*dz<68*68;
  if(!this.group.visible)return;
  this.time+=dt;
  this.flow.offset.x=-(this.time*.24)%1;
  this.surface.offset.set((this.time*.013)%1,-(this.time*.009)%1);
  for(const {mesh,phase,upper} of this.ripples){
   const age=(this.time*.85+phase)%1;
   mesh.scale.setScalar(.75+age*(upper?2.3:3.6));
   mesh.material.opacity=(1-age)*(upper?.28:.38);
  }
  for(let i=0;i<this.paths.length;i++)for(let bead=0;bead<3;bead++){
   const path=this.paths[i],u=(this.time*(i<8?1.06:.78)+bead/3+i*.071)%1;
   path.getPoint(u,this.point);this.dummy.position.copy(this.point);
   this.dummy.scale.setScalar(i<8?.62:.85+bead*.16);this.dummy.updateMatrix();
   this.droplets.setMatrixAt(i*3+bead,this.dummy.matrix);
  }
  this.droplets.instanceMatrix.needsUpdate=true;
 }
}
