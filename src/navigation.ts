export interface Point {x:number;z:number}
export interface Obstacle extends Point {w:number;d:number;door?:string}
export function clearAt(p:Point,barriers:Obstacle[],doors:Record<string,boolean>,radius=.3,allowDoors=false){return !barriers.some(b=>!(b.door&&(allowDoors||doors[b.door]))&&Math.abs(p.x-b.x)<b.w/2+radius&&Math.abs(p.z-b.z)<b.d/2+radius)}
export function clearSegment(a:Point,b:Point,barriers:Obstacle[],doors:Record<string,boolean>,radius=.3,allowDoors=false){
 // Exact segment vs expanded rectangles: sampled segments can miss a narrow corner
 // intersection which then traps the actor when it approaches in smaller steps.
 for(const box of barriers){
  if(box.door&&(allowDoors||doors[box.door]))continue;
  let entry=0,exit=1,miss=false;
  for(const axis of ['x','z'] as const){const half=(axis==='x'?box.w:box.d)/2+radius-1e-8,min=box[axis]-half,max=box[axis]+half,delta=b[axis]-a[axis];
   if(Math.abs(delta)<1e-12){if(a[axis]<=min||a[axis]>=max){miss=true;break}}else{let low=(min-a[axis])/delta,high=(max-a[axis])/delta;if(low>high)[low,high]=[high,low];entry=Math.max(entry,low);exit=Math.min(exit,high);if(entry>exit){miss=true;break}}
  }
  if(!miss&&entry<=exit)return false;
 }
 return true;
}

class Heap {items:{id:number;f:number}[]=[];push(n:{id:number;f:number}){const a=this.items;a.push(n);let i=a.length-1;while(i){const p=(i-1)>>1;if(a[p].f<=n.f)break;a[i]=a[p];i=p}a[i]=n}pop(){const a=this.items,result=a[0],last=a.pop()!;if(a.length){let i=0;while(i*2+1<a.length){let c=i*2+1;if(c+1<a.length&&a[c+1].f<a[c].f)c++;if(a[c].f>=last.f)break;a[i]=a[c];i=c}a[i]=last}return result}}
export function findPath(from:Point,to:Point,barriers:Obstacle[],doors:Record<string,boolean>,radius=.3,allowDoors=true):Point[]{
 if(clearSegment(from,to,barriers,doors,radius,allowDoors))return [{...to}];
 const step=.5,minX=-51,minZ=-48,width=205,height=201;const grid=(p:Point)=>({x:Math.round((p.x-minX)/step),z:Math.round((p.z-minZ)/step)}),point=(id:number)=>({x:minX+(id%width)*step,z:minZ+Math.floor(id/width)*step});
 const findCell=(p:Point)=>{const c=grid(p);let best=-1,dist=Infinity;for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++){const x=c.x+dx,z=c.z+dz;if(x<0||z<0||x>=width||z>=height)continue;const id=z*width+x,q=point(id),d=Math.hypot(q.x-p.x,q.z-p.z);if(d<dist&&clearSegment(p,q,barriers,doors,radius,allowDoors)){best=id;dist=d}}return best};
 const start=findCell(from),end=findCell(to);if(start<0||end<0)return [];
 const g=new Map<number,number>([[start,0]]),parent=new Map<number,number>(),closed=new Set<number>(),open=new Heap();const goal=point(end);const h=(id:number)=>{const p=point(id);return Math.hypot(p.x-goal.x,p.z-goal.z)};open.push({id:start,f:h(start)});
 while(open.items.length){const {id}=open.pop();if(closed.has(id))continue;if(id===end){const chain:Point[]=[{...to}];let n=id;chain.push(point(n));while(parent.has(n)){n=parent.get(n)!;chain.push(point(n))}chain.reverse();const result:Point[]=[];let anchor=from;for(let i=0;i<chain.length;){let next=i;while(next+1<chain.length&&clearSegment(anchor,chain[next+1],barriers,doors,radius,allowDoors))next++;result.push(chain[next]);anchor=chain[next];i=next+1}return result}
 closed.add(id);const p=point(id),x=id%width,z=Math.floor(id/width);for(const [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const xx=x+dx,zz=z+dz;if(xx<0||zz<0||xx>=width||zz>=height)continue;const next=zz*width+xx;if(closed.has(next))continue;const q=point(next);if(!clearSegment(p,q,barriers,doors,radius,allowDoors))continue;const score=g.get(id)!+Math.hypot(dx,dz)*step;if(score<(g.get(next)??Infinity)){g.set(next,score);parent.set(next,id);open.push({id:next,f:score+h(next)})}}
 }return [];
}

// Recover gracefully when an older save, or a newly closed door, overlaps a body.
export function resolveOverlap(position:Point,barriers:Obstacle[],doors:Record<string,boolean>,radius=.26):Point {
 const p={...position};
 for(let pass=0;pass<8;pass++){
  let changed=false;
  for(const b of barriers){if(b.door&&doors[b.door])continue;const dx=p.x-b.x,dz=p.z-b.z,px=b.w/2+radius-Math.abs(dx),pz=b.d/2+radius-Math.abs(dz);
   if(px<=0||pz<=0)continue;
   if(px<pz)p.x+=(dx<0?-1:1)*(px+.001);else p.z+=(dz<0?-1:1)*(pz+.001);changed=true;
  }
  if(!changed)return p;
 }
 return p;
}
