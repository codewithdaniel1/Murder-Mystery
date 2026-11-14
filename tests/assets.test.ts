import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Box3,Vector3,AnimationMixer} from 'three';
const models=['fern','shrub','shrub-flowering','tree','armchair','people/harper','people/jordan','people/pip','people/sam','people/maya','garden-tree'];
function glb(name:string){const file=readFileSync(new URL('../public/models/'+name+'.glb',import.meta.url));const length=file.readUInt32LE(12);return {file,j:JSON.parse(file.subarray(20,20+length).toString()),bin:file.subarray(28+length)}}
describe('bundled production art',()=>{
 for(const name of models)it(name+' is self-contained, has valid indices and usable geometry',async()=>{
 const {file,j,bin}=glb(name);expect(file.toString('utf8',0,4)).toBe('glTF');expect(file.readUInt32LE(8)).toBe(file.length);expect(j.buffers).toHaveLength(1);expect(j.buffers[0].uri).toBeUndefined();expect(j.images.every((i:{uri?:string})=>!i.uri)).toBe(true);
 for(const mesh of j.meshes)for(const primitive of mesh.primitives){if(primitive.indices===undefined)continue;const a=j.accessors[primitive.indices],v=j.bufferViews[a.bufferView],count=j.accessors[primitive.attributes.POSITION].count;const bytes=a.componentType===5125?4:2,offset=(a.byteOffset??0)+(v.byteOffset??0);let max=0;for(let i=0;i<a.count;i++)max=Math.max(max,bytes===4?bin.readUInt32LE(offset+i*bytes):bin.readUInt16LE(offset+i*bytes));expect(max).toBeLessThan(count);}
 // Parse the actual buffers and rig without browser-only image decoding.
 j.images=[];j.textures=[];j.materials=j.materials.map(()=>({}));const text=Buffer.from(JSON.stringify(j));const json=Buffer.alloc(Math.ceil(text.length/4)*4,32);text.copy(json);const header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+bin.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);const bh=Buffer.alloc(8);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);const bytes=Buffer.concat([header,json,bh,bin]);const data=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length);
 const model=await new GLTFLoader().parseAsync(data,'');const size=new Box3().setFromObject(model.scene).getSize(new Vector3());expect(size.x).toBeGreaterThan(.05);expect(size.y).toBeGreaterThan(.1);expect(size.z).toBeGreaterThan(.05);
 if(['people/harper','people/jordan','people/sam','people/maya'].includes(name)){expect(model.animations.map(a=>a.name)).toContain('Idle_Standing');expect(model.animations.map(a=>a.name)).toContain('Walk_Relaxed');const mixer=new AnimationMixer(model.scene);mixer.clipAction(model.animations.find(a=>a.name==='Idle_Standing')!).play();mixer.update(.5);const animated=new Box3().setFromObject(model.scene).getSize(new Vector3());expect(animated.y).toBeGreaterThan(1);expect(animated.y).toBeLessThan(2.2);}
 });
});
