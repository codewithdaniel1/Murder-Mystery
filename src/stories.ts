import {has,type GameState,type PersonId} from './state';
import type {WitnessId} from './yard';

type Speaker=PersonId|WitnessId;
type Story={id:string;label:string;reply:string;note:string;when?:(s:GameState)=>boolean;clears?:string};
const heard=(s:GameState,id:string)=>s.flags['story:'+id]===true;
const stories:Partial<Record<Speaker,Story[]>>={
 june:[
  {id:'blackout',label:'How has the war changed life here?',reply:'We used to light every window for the harvest supper. Now we hang blackout curtains and eat in the kitchen. The funny thing is, I know the household rather better since we stopped having all those grand dinners.',note:'June remembers the harvest suppers before the blackout.'},
  {id:'seed-parcel',label:'Did you send Peter to the shed with a parcel?',reply:'I did. The village sent us vegetable seed in a brown parcel. Peter delivered it before supper was cleared. If Mrs Ellis saw a dark coat, that would be Peter wearing his father’s old one.',note:'June says she sent Peter to the shed with vegetable seed.',when:s=>heard(s,'dark-coat')||heard(s,'peter-parcel'),clears:'dark-coat'},
 ],
 rook:[{id:'bell-rain',label:'Has the bell ever caused trouble before?',reply:'Once, in a gale, the bell went off early and half the village turned up for a supper that wasn’t ready. People hear it from farther away than you might think.',note:'Rook remembers the bell carrying as far as the village.'}],
 mara:[{id:'pip-rabbit',label:'How did Pip come to live here?',reply:'He followed me home from the village. The first night he barked at a rabbit and woke the entire east wing. June said any dog who could get everyone to breakfast on time was welcome to stay.',note:'Mara tells how Pip earned his place in the household.'}],
 ada:[{id:'trunks',label:'Did you and Elias ever argue?',reply:'We had a dreadful row about the trunks in the attic. I thought he meant to give away Mother’s things. He’d had them moved because the roof leaked. He even tucked notes inside so I’d know where everything was.',note:'Ada says her argument with Elias was over family trunks moved away from a leak.'}],
 tomas:[{id:'victory-bed',label:'What are you growing this year?',reply:'Beans where the roses used to be. I kept one rose under the wall, though. My father planted it the summer I was born. I’m willing to argue with the Ministry about that one.',note:'Tomas has turned most of the old rose garden over to vegetables.'}],
 beatrice:[{id:'last-supper',label:'What was Elias like before all this?',reply:'Years ago he found my little silver brooch down by the drive. He left it on my plate at supper under a cover. I thought I was being served a very small potato.',note:'Beatrice remembers Elias’s sense of humor.'}],
 jonah:[{id:'road-lamps',label:'What is it like driving after dark?',reply:'With the lamps hooded you count bends by the feel of them. Last winter I stopped to let a stray sheep cross, and the whole flock came out behind it. Her ladyship never let me forget the delay.',note:'Jonah describes night driving under blackout rules.'}],
 ellis:[
  {id:'dark-coat',label:'What could you make out on the drive?',reply:'A long dark coat and a brown parcel. I couldn’t see the person’s face. It was near the house, just before the half-hour bell, and they turned off toward the shed. I’ve been wondering about that ever since.',note:'Mabel saw an unidentified person carrying a parcel toward the shed before the bell.'},
  {id:'ellis-correction',label:'June says she sent Peter with seed.',reply:'That would explain the big coat and the parcel. I should have said what I saw and left it at that.',note:'Mabel agrees June’s account fits what she saw.',when:s=>heard(s,'dark-coat')&&heard(s,'seed-parcel')},
 ],
 clarke:[{id:'peter-parcel',label:'What was in the parcel?',reply:'Seed envelopes. I dropped one on the path and had to chase it right to the hedge. Mrs Bell would know. She’s the one who sent me.',note:'Peter says the parcel held seed and that June sent him.'}],
 briggs:[
  {id:'drive-chime',label:'Does hearing the chime place anyone in the tower?',reply:'No. I heard it just fine from the front gate, and I was nowhere near the tower. It comes across the fields even when the wind’s up.',note:'Elsie heard the half-hour chime from the gate, with no view of who was in the tower.'},
  {id:'automatic',label:'The repair notice says the chime was automatic.',reply:'Then I couldn’t tell you who was in the tower, or even whether anyone was there. All I heard was the bell.',note:'The gatekeeper’s account is consistent with the automatic chime.',when:s=>heard(s,'drive-chime')&&has(s,'bell')},
 ],
 finch:[{id:'shed-pot',label:'What happened after you heard the crash?',reply:'I fetched a lantern and nearly fetched the constable too. All I found was a flowerpot in pieces and a cat sitting up on the shelf, looking quite put out.',note:'Finch found a broken flowerpot and a cat after hearing the crash at the shed.'}],
 webb:[{id:'running-shadow',label:'Did anyone else see the shadow?',reply:'I told Mrs Bell I’d seen a runner. Then the same little shadow bolted straight through a gap no bigger than my hand. I went back and told her to strike that runner from the record.',note:'Nora withdrew her report of a runner after seeing the shadow slip through a rabbit gap.'}],
 hale:[{id:'silver-service',label:'How long have you worked here?',reply:'Since the old lord’s day. He once made me polish a silver jug for a visiting colonel. The colonel was his brother in a borrowed uniform. They let me in on the joke after I’d done the whole service.',note:'Hale has served the household since the old lord’s day.'}],
 price:[{id:'loose-latch',label:'Is the back door often left open?',reply:'On windy days it used to swing loose until I had the latch tightened. Last night I only saw it after June called. By then half the household was going in and out.',note:'Price only saw the back door after the household came to help.'}],
 green:[{id:'empty-drive',label:'Do the tire marks tell you anything?',reply:'The deep pair belong to the coal lorry. They’ve been there for days. It takes a proper rain to wash them out of the soft part of the drive.',note:'Samuel recognizes the old tire marks as the coal lorry’s.'}],
 ward:[{id:'rabbit-beds',label:'What keeps digging up the beds?',reply:'Rabbits, mostly. The first time I saw the soil disturbed I blamed the village children. Then I watched a rabbit drag half a lettuce under the hedge without so much as looking back.',note:'Hugh has watched rabbits dig up and raid the beds.'}],
 bellamy:[{id:'saved-cuttings',label:'Have you worked here long?',reply:'Since the winter the glass cracked. We carried the cuttings to the kitchen in soup bowls. The cook still insists I owe her three bowls and a good explanation.',note:'Edith once saved the glasshouse cuttings after a winter crack.'}],
 shaw:[{id:'orchard-crop',label:'What became of the old orchard?',reply:'The trees behind the fountain never did well, so we planted farther out where there’s a little more shelter. The first decent crop went into jars for the village hall.',note:'George remembers moving the orchard to find shelter from the wind.'}],
 pike:[{id:'cellar-knocks',label:'Any stories about the old cellar?',reply:'The first week I worked here, I heard three knocks from the tunnel after closing. I went for the butler. By the time we got back, we found a loose barrel hoop ticking against a rack in the draft.',note:'Walter once mistook a loose barrel hoop for someone knocking in the tunnel.'}],
 miller:[{id:'upper-steps',label:'Did you hear anything upstairs?',reply:'I heard what sounded like a footstep in the sitting room after I shut it up. It’s an old floor, and I hear that board pop most nights. I wouldn’t swear there was anyone in there.',note:'Ruth heard a noise upstairs but recognizes it as a board that often pops.'}],
 foster:[{id:'attic-trunks',label:'Did anyone go through the old trunks?',reply:'Mr Vale put a basin down under a drip and asked me to help him shift Miss Ada’s trunks. He put the lids back himself. I never saw him take anything out.',note:'Lucy recalls helping Elias move Ada’s trunks away from a leak.',when:s=>heard(s,'trunks')}],
};

export const storyTopics=(speaker:Speaker,s:GameState)=>(stories[speaker]??[]).filter(t=>!t.when||t.when(s));
export function rememberStory(s:GameState,id:string){s.flags['story:'+id]=true}
export function storyNotes(s:GameState){
 const all=Object.entries(stories) as [Speaker,Story[]][];
 const heardStories=all.flatMap(([speaker,list])=>list.filter(t=>heard(s,t.id)).map(t=>({...t,speaker})));
 const cleared=new Set(heardStories.map(t=>t.clears));
 return heardStories.map(({speaker,note,id})=>({speaker,note,cleared:cleared.has(id)}));
}
