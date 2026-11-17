import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import * as T from 'three';

// Small repeating surface maps shared by all instances; no per-frame texture work.
export function gardenSurface(kind:'bark'|'stone'|'soil',color:number){
 const size=128,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const hash=Math.sin(x*127.1+y*311.7)*43758.5453,n=hash-Math.floor(hash);
  const broad=.5+.5*Math.sin(x*.17+Math.sin(y*.1)*2);
  const value=kind==='bark'?.48+.18*n+.28*Math.pow(.5+.5*Math.sin(x*.49+Math.sin(y*.07)*.7),.3):kind==='stone'?.68+.13*n+.12*broad:.43+.38*n+.12*broad;
  const v=Math.round(value*255),i=(y*size+x)*4;data[i]=v;data[i+1]=v;data[i+2]=v;data[i+3]=255;
 }
 const map=new T.DataTexture(data,size,size);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;
 return new T.MeshStandardMaterial({color,map,bumpMap:map,bumpScale:kind==='bark'?.008:kind==='stone'?.009:.018,roughness:1});
}

export function mergeGardenParts(group:T.Group){
 const byMaterial=new Map<T.Material,T.Mesh[]>();
 for(const child of group.children){
  if(!(child instanceof T.Mesh)||child instanceof T.InstancedMesh||Array.isArray(child.material)||child.material.transparent)continue;
  const meshes=byMaterial.get(child.material)??[];meshes.push(child);byMaterial.set(child.material,meshes);
 }
 for(const [material,meshes]of byMaterial){
  if(meshes.length<2)continue;
  const geometries=meshes.map(m=>{m.updateMatrix();return m.geometry.clone().applyMatrix4(m.matrix);});
  const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());
  if(!geometry)continue;
  const merged=new T.Mesh(geometry,material);merged.castShadow=meshes.some(m=>m.castShadow);merged.receiveShadow=true;group.add(merged);
  for(const mesh of meshes){group.remove(mesh);mesh.geometry.dispose();}
 }
}
