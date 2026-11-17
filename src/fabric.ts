import * as T from 'three';

let lining:T.MeshStandardMaterial|undefined;
function liningMaterial(){
 if(lining)return lining;
 const size=128,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const thread=(x%4<2?1:-1)*(y%4<2?1:-1),noise=((x*31+y*17+x*y)%19)/19;
  const n=.85+thread*.055+noise*.1,i=(y*size+x)*4;
  data.set([Math.round(112*n),Math.round(76*n),Math.round(108*n),255],i);
 }
 const map=new T.DataTexture(data,size,size);map.colorSpace=T.SRGBColorSpace;
 map.wrapS=map.wrapT=T.RepeatWrapping;map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;
 lining=new T.MeshStandardMaterial({map,color:0xffffff,roughness:.92,side:T.DoubleSide,bumpMap:map,bumpScale:.0007});
 return lining;
}
/** A thin torn lining scrap; its stitched diamond border remains a case clue. */
export function liningScrap(){
 const root=new T.Group();root.name='Torn plum jacket lining';
 const width=.145,height=.225,cols=22,rows=30,positions:number[]=[],uv:number[]=[],indices:number[]=[];
 const point=(u:number,v:number)=>{
  const torn=.004*Math.sin(v*93)+.002*Math.sin(v*173);
  return new T.Vector3((u-.5)*(width*(1-.18*v*v)+torn)-.012*v*v,-height*v+.003*Math.sin(u*91)*v*v,.009*Math.sin(u*9+v*2)*Math.sin(v*1.8)+.012*v*v);
 };
 for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){
  const u=x/cols,v=y/rows,p=point(u,v);positions.push(p.x,p.y,p.z);uv.push(u*3,v*4);
  if(x<cols&&y<rows){const a=y*(cols+1)+x;indices.push(a,a+1,a+cols+1,a+1,a+cols+2,a+cols+1);}
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
 const cloth=new T.Mesh(geo,liningMaterial());cloth.castShadow=true;cloth.receiveShadow=true;root.add(cloth);
 const stitches:number[]=[],fray:number[]=[];
 const segment=(out:number[],a:T.Vector3,b:T.Vector3)=>out.push(a.x,a.y,a.z+.0008,b.x,b.y,b.z+.0008);
 for(let row=0;row<5;row++){
  const cy=.1+row*.17;
  const corners=[[.78,cy],[.9,cy+.075],[.78,cy+.15],[.66,cy+.075],[.78,cy]];
  for(let k=0;k<4;k++)for(let j=0;j<4;j++){
   const a=corners[k],b=corners[k+1],t=j/4,q=(j+.58)/4;
   segment(stitches,point(T.MathUtils.lerp(a[0],b[0],t),T.MathUtils.lerp(a[1],b[1],t)),point(T.MathUtils.lerp(a[0],b[0],q),T.MathUtils.lerp(a[1],b[1],q)));
  }
 }
 for(let i=0;i<28;i++){
  const p=point(i/27,1);segment(fray,p,p.clone().add(new T.Vector3(.001*Math.sin(i*3),-.003-(i%4)*.001,.002)));
 }
 for(const [points,color]of [[stitches,0xb79aa6],[fray,0x8e7088]] as const){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));root.add(new T.LineSegments(g,new T.LineBasicMaterial({color})));}
 return root;
}
