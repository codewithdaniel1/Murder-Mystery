import * as T from 'three';

export type CellarLamp={x:number;y:number;z:number;power:number;range:number};
// The cellar never changes shape or switches its lamps off. Store their
// combined light in one small 3D texture instead of lighting every object
// in the estate with every underground lamp on each frame.
export function bakeCellarLighting(lamps:CellarLamp[]){
 const origin=new T.Vector3(-30,-5,-90),size=new T.Vector3(42,6,90),step=.75;
 const cells=[size.x/step+1,size.y/step+1,size.z/step+1] as const;
 const data=new Uint8Array(cells[0]*cells[1]*cells[2]);
 let i=0;
 for(let iz=0;iz<cells[2];iz++)for(let iy=0;iy<cells[1];iy++)for(let ix=0;ix<cells[0];ix++){
  const x=origin.x+ix*step,y=origin.y+iy*step,z=origin.z+iz*step;
  let energy=0;
  for(const lamp of lamps){
   const d2=(x-lamp.x)**2+(y-lamp.y)**2+(z-lamp.z)**2,ratio=d2/(lamp.range*lamp.range);
   if(ratio>=1)continue;
   energy+=lamp.power*(1-ratio*ratio)**2/Math.max(2,d2)*.25;
  }
  data[i++]=Math.round(255*Math.sqrt(Math.min(energy,6)/6));
 }
 const texture=new T.Data3DTexture(data,...cells);
 texture.format=T.RedFormat;texture.minFilter=T.LinearFilter;texture.magFilter=T.LinearFilter;texture.needsUpdate=true;
 const scale=new T.Vector3(...cells).multiplyScalar(step);
 const offset=origin.multiplyScalar(-1).addScalar(step/2);
 const materials=new Map<T.Material,T.Material>();
 const lit=(source:T.Material)=>{
  const cached=materials.get(source);if(cached)return cached;
  if(!(source instanceof T.MeshStandardMaterial))return source;
  const material=source.clone();
  material.customProgramCacheKey=()=> 'cellar-baked-light-v1';
  material.onBeforeCompile=shader=>{
   shader.uniforms.cellarIrradiance={value:texture};
   shader.uniforms.cellarScale={value:scale};
   shader.uniforms.cellarOffset={value:offset};
   shader.vertexShader='varying vec3 vCellarPosition;\n'+shader.vertexShader.replace('#include <project_vertex>',`
    vec4 cellarVertex=vec4(transformed,1.0);
    #ifdef USE_INSTANCING
     cellarVertex=instanceMatrix*cellarVertex;
    #endif
    vCellarPosition=(modelMatrix*cellarVertex).xyz;
    #include <project_vertex>
   `);
   shader.fragmentShader=`uniform highp sampler3D cellarIrradiance;
    uniform vec3 cellarScale,cellarOffset;
    varying vec3 vCellarPosition;
   `+shader.fragmentShader.replace('#include <lights_fragment_end>',`
    #include <lights_fragment_end>
    float cellarSample=texture(cellarIrradiance,(vCellarPosition+cellarOffset)/cellarScale).r;
    float cellarFacing=0.53+0.47*max(0.0,dot(normal,viewMatrix[1].xyz));
    reflectedLight.indirectDiffuse+=diffuseColor.rgb*(1.0-metalnessFactor)*vec3(1.0,0.61,0.29)
     *cellarSample*cellarSample*6.0*cellarFacing;
   `);
  };
  materials.set(source,material);return material;
 };
 return {texture,apply(root:T.Object3D){
  root.traverse(object=>{
   if(object instanceof T.Mesh)object.material=Array.isArray(object.material)?object.material.map(lit):lit(object.material);
  });
 }};
}
