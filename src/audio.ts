type Position=[number,number,number];
type Playing={source:AudioBufferSourceNode;gain:GainNode;pan?:PannerNode;filter?:BiquadFilterNode};
const FILES=['birds','wind','fountain','fireplace','step-wood-1','step-wood-2','step-gravel-1','step-stone-1','step-grass-1','step-grass-2','door-open','door-close','paper-1','paper-2','dog-bark','engine','murmur','telephone-ring'];
export function surfaceAt(x:number,z:number){
 if(z>-16&&z<12&&Math.abs(x)<21){if((Math.abs(x)<1.5&&z>-7&&z<9)||(Math.abs(x+15)<2.1&&Math.abs(z-3.5)<2.7))return 'carpet';return 'wood'}
 if(x>21&&x<31&&z<-25&&z>-33)return 'stone';
 if((z>12&&Math.abs(x)<4)||(z>12.8&&z<21.2&&Math.abs(x)<24)||(z<-16&&z>-35&&Math.abs(x)<2.5)||(Math.abs(z+23)<1.5&&x>0&&x<29)||(Math.abs(x-25)<1.5&&z<-23&&z>-35))return 'gravel';
 return 'grass';
}
export class EstateAudio {
 context:AudioContext|null=null;master:GainNode|null=null;volume=.65;active=new Set<Playing>();buffers=new Map<string,AudioBuffer>();loops=new Map<string,Playing>();loading:Promise<void>|null=null;voice:Playing|null=null;phone:Playing|null=null;npcSteps=new Map<string,number>();lastPosition:Position|null=null;distance=0;stepIndex=0;barkAt=18;lastBark=-Infinity;paused=true;
 start(){if(!this.context){this.context=new AudioContext();this.master=this.context.createGain();this.master.gain.value=this.volume;const limiter=this.context.createDynamicsCompressor();limiter.threshold.value=-16;limiter.knee.value=16;limiter.ratio.value=3;limiter.attack.value=.015;limiter.release.value=.2;this.master.connect(limiter);limiter.connect(this.context.destination);this.loading=this.load();}this.paused=false;void this.context.resume();}
 async load(){await Promise.all(FILES.map(async name=>{try{const res=await fetch(import.meta.env.BASE_URL+'audio/'+name+'.ogg');if(!res.ok)throw Error(String(res.status));const data=await res.arrayBuffer();this.buffers.set(name,await this.context!.decodeAudioData(data));}catch(err){console.warn('Recorded sound unavailable:',name,err)}}));}
 playClip(name:string,volume:number,position?:Position,rate=1,loop=false):Playing|null{
 const c=this.context,buffer=this.buffers.get(name);if(!c||!buffer||!this.master||this.paused)return null;
 const source=c.createBufferSource(),gain=c.createGain(),filter=c.createBiquadFilter();source.buffer=buffer;source.loop=loop;source.playbackRate.value=rate;gain.gain.value=volume;filter.type='lowpass';filter.frequency.value=18000;source.connect(filter);filter.connect(gain);let pan:PannerNode|undefined;
 if(position){pan=c.createPanner();pan.panningModel='HRTF';pan.distanceModel='inverse';pan.refDistance=2;pan.rolloffFactor=1.3;pan.maxDistance=45;this.position(pan,position);gain.connect(pan);pan.connect(this.master)}else gain.connect(this.master);
 const clip={source,gain,pan,filter};this.active.add(clip);source.onended=()=>{source.disconnect();gain.disconnect();filter.disconnect();pan?.disconnect();this.active.delete(clip)};source.start(0,loop?Math.random()*buffer.duration:0);return clip;
 }
 position(p:PannerNode,xyz:Position){const time=this.context!.currentTime;p.positionX.setTargetAtTime(xyz[0],time,.08);p.positionY.setTargetAtTime(xyz[1],time,.08);p.positionZ.setTargetAtTime(xyz[2],time,.08)}
 loop(name:string,gain:number,position?:Position,cutoff=18000){let clip=this.loops.get(name);if(!clip){const created=this.playClip(name,0,position,1,true);if(!created)return;clip=created;this.loops.set(name,clip)}const t=this.context!.currentTime;clip.gain.gain.setTargetAtTime(gain,t,.65);clip.filter?.frequency.setTargetAtTime(cutoff,t,.55);if(position&&clip.pan)this.position(clip.pan,position)}
 vocal(person:string,position?:Position){this.stopVoice();const rates:Record<string,number>={june:1.08,mara:1.03,ada:1.12,beatrice:1.02,rook:.92,tomas:.96,jonah:1};this.voice=this.playClip('murmur',.43,position,rates[person]??1)}
 stopVoice(){if(this.voice){this.stop(this.voice);this.voice=null}if(this.phone){this.stop(this.phone);this.phone=null}}
 stop(clip:Playing){try{clip.source.stop()}catch{}this.active.delete(clip)}
 effect(type:string,pos?:Position){
 if(type==='phone'){this.phone=this.playClip('telephone-ring',.25,pos);if(this.phone)this.phone.source.stop(this.context!.currentTime+1.2);return}
 if(type==='bark'){const now=this.context?.currentTime??0;if(now-this.lastBark<8)return;this.lastBark=now;this.playClip('dog-bark',.45,pos);return}
 const mapping:Record<string,[string,number]>={paper:[Math.random()<.5?'paper-1':'paper-2',.48],door:['door-open',.65],'door-close':['door-close',.6],clue:['paper-1',.22],fountain:['fountain',.15]};const item=mapping[type];if(item)this.playClip(item[0],item[1],pos,.97+Math.random()*.06);
 }
 update(dt:number,p:{x:number;y:number;z:number},yaw:number,moving:boolean,inside:boolean,dog:Position,car:Position|null){const c=this.context;if(!c||this.paused)return;const l=c.listener;
 l.positionX.value=p.x;l.positionY.value=p.y;l.positionZ.value=p.z;l.forwardX.value=-Math.sin(yaw);l.forwardY.value=0;l.forwardZ.value=-Math.cos(yaw);l.upX.value=0;l.upY.value=1;l.upZ.value=0;
 this.loop('wind',inside?.025:.24,undefined,inside?650:8000);this.loop('birds',inside?.035:.26,undefined,inside?1100:10000);
 this.loop('fountain',inside?.02:.75,[0,.8,-30],inside?550:14000);this.loop('fireplace',inside&&p.x<-7?.65:inside?.12:.005,[-20,1,4.5],inside?11000:400);
 this.loop('engine',car?(inside?.12:.9):0,car??[4,1,24],inside?850:9500);
 const current:Position=[p.x,p.y,p.z];if(this.lastPosition&&moving){const d=Math.hypot(p.x-this.lastPosition[0],p.z-this.lastPosition[2]);if(d<1)this.distance+=d;else this.distance=0;}else this.distance=0;this.lastPosition=current;
 if(this.distance>1.15){this.distance%=1.15;const surface=surfaceAt(p.x,p.z);this.stepIndex++;const n=this.stepIndex%2+1;const file=surface==='carpet'||surface==='wood'?'step-wood-'+n:surface==='grass'?'step-grass-'+n:surface==='stone'?'step-stone-1':'step-gravel-1';this.playClip(file,surface==='carpet'?.17:.48,undefined,.94+Math.random()*.12);}
 this.barkAt-=dt;if(this.barkAt<0){this.barkAt=24+Math.random()*22;if(Math.hypot(p.x-dog[0],p.z-dog[2])<12)this.effect('bark',dog)}

 }
 updateActors(dt:number,actors:{id:string;x:number;z:number;moving:boolean}[],player:{x:number;z:number}){if(this.paused)return;for(const a of actors){let time=(this.npcSteps.get(a.id)??.3)-dt;if(a.moving&&time<=0&&Math.hypot(a.x-player.x,a.z-player.z)<11){const surface=surfaceAt(a.x,a.z);const file=surface==='carpet'||surface==='wood'?'step-wood-1':surface==='grass'?'step-grass-1':surface==='stone'?'step-stone-1':'step-gravel-1';this.playClip(file,surface==='carpet'?.09:.22,[a.x,.1,a.z],.95+Math.random()*.1);time=.58+Math.random()*.1;}this.npcSteps.set(a.id,Math.max(time,-.1));}}
 pause(){this.stopVoice();for(const clip of [...this.active])if(!clip.source.loop)this.stop(clip);this.paused=true;this.lastPosition=null;this.distance=0;if(this.context)void this.context.suspend()}
 resume(){this.start()}
 setVolume(v:number){this.volume=Math.max(0,Math.min(1,v));if(this.master&&this.context)this.master.gain.setTargetAtTime(this.volume,this.context.currentTime,.08);}
}
