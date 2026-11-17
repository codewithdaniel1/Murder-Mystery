import * as T from 'three';

export function buildCellarRats(parent:T.Group,floor:number){
 const fur=[0x67584d,0x504b47].map(color=>new T.MeshStandardMaterial({color,roughness:.94}));
 const skin=new T.MeshStandardMaterial({color:0x8c645e,roughness:.85});
 const dark=new T.MeshStandardMaterial({color:0x211818,roughness:.62});
 const oval=new T.SphereGeometry(1,12,8);
 const tailShape=new T.TubeGeometry(new T.CatmullRomCurve3([
  [0,0,0],[.008,-.057,-.06],[.027,-.082,-.145],[.006,-.084,-.23],[-.033,-.079,-.295]
 ].map(([x,y,z])=>new T.Vector3(x,y,z))),12,.008,6,false);
 const rats=[
  {x:-8.55,z:-10.8,rx:.58,rz:2.55,height:.022,period:13},
  {x:6.35,z:-8.35,rx:.64,rz:1.95,height:.022,period:11}
 ].map((route,i)=>{
  const root=new T.Group(),body=new T.Group();
  root.name=i?'Storeroom rat':'Wine vault rat';
  parent.add(root);root.add(body);
  const part=(mat:T.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number,node=body)=>{
   const mesh=new T.Mesh(oval,mat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);node.add(mesh);return mesh;
  };
  const coat=fur[i];
  part(coat,0,.101,-.018,.066,.07,.145);
  const head=new T.Group();head.position.set(0,.109,.103);body.add(head);
  part(coat,0,0,.019,.047,.049,.066,head);
  part(coat,0,-.017,.068,.029,.026,.049,head);
  part(dark,0,-.014,.113,.012,.01,.009,head);
  const paws=[];
  for(const side of [-1,1]){
   part(coat,side*.033,.044,-.012,.023,.028,.013,head).rotation.z=-side*.25;
   part(skin,side*.035,.048,-.002,.016,.02,.008,head);
   part(dark,side*.039,.018,.048,.008,.009,.009,head);
   for(const fore of [-1,1]){
    const paw=part(skin,side*(fore>0?.039:.055),.015,fore*.081,.016,.014,.03,root);
    paws.push({paw,phase:side===fore?0:Math.PI,z:paw.position.z});
   }
  }
  const tail=new T.Mesh(tailShape,skin);tail.position.set(0,.096,-.138);body.add(tail);
  return {route,root,body,head,tail,paws,time:i*3.4};
 });
 const update=(dt:number)=>{
  for(const rat of rats){
   const {route,root,body,head,tail,paws}=rat;
   rat.time=(rat.time+dt)%(route.period+2);
   const moving=rat.time<route.period;
   const a=Math.min(rat.time/route.period,1)*2*Math.PI;
   root.position.set(route.x+route.rx*Math.cos(a),floor+route.height,route.z+route.rz*Math.sin(a));
   root.rotation.y=Math.atan2(-route.rx*Math.sin(a),route.rz*Math.cos(a));
   const step=rat.time*34;
   body.position.y=moving?.009*(1+Math.cos(step*2)):0;
   head.rotation.x=moving?0:.15+.11*Math.sin(rat.time*15);
   tail.rotation.y=.13*Math.sin(rat.time*(moving?12:5));
   for(const {paw,phase,z} of paws){
    paw.position.z=z+(moving?Math.cos(step+phase)*.033:0);
    paw.position.y=.015+(moving?Math.max(0,Math.sin(step+phase))*.028:0);
   }
  }
 };
 update(0);
 return update;
}
