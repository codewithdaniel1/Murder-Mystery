import {expect,it} from 'vitest';
import {decodeSave,encodeSave,freshState} from '../src/state';
import {rememberStory,storyNotes,storyTopics} from '../src/stories';

it('lets the player corroborate the parcel rumor without changing case evidence',()=>{
 const state=freshState();
 expect(storyTopics('june',state).some(t=>t.id==='seed-parcel')).toBe(false);
 rememberStory(state,storyTopics('ellis',state)[0].id);
 expect(storyNotes(state)[0].cleared).toBe(false);
 expect(storyTopics('june',state).some(t=>t.id==='seed-parcel')).toBe(true);
 rememberStory(state,'seed-parcel');
 expect(storyTopics('ellis',state).some(t=>t.id==='ellis-correction')).toBe(true);
 const restored=decodeSave(encodeSave(state,state.pose))!;
 expect(storyNotes(restored).find(n=>n.speaker==='ellis')?.cleared).toBe(true);
 expect(restored.evidence).toEqual([]);
 expect(restored.interviews).toEqual([]);
});

it('resolves the unlogged delivery through two physical clues and a corrected account',()=>{
 const state=freshState();
 const available=(speaker:'ward'|'sutton',id:string)=>storyTopics(speaker,state).some(t=>t.id===id);
 expect(available('ward','delivery-car')).toBe(true);
 rememberStory(state,'delivery-car');
 expect(available('ward','delivery-van')).toBe(false);
 state.flags.vehicleLogRead=true;
 expect(available('ward','delivery-van')).toBe(true);
 rememberStory(state,'delivery-van');
 expect(available('sutton','delivery-resolved')).toBe(false);
 state.flags.shelterCrateRead=true;
 expect(available('sutton','delivery-resolved')).toBe(true);
 rememberStory(state,'delivery-resolved');
 const restored=decodeSave(encodeSave(state,state.pose))!;
 expect(storyNotes(restored).some(n=>n.speaker==='ward'&&n.cleared)).toBe(true);
 expect(storyNotes(restored).some(n=>n.note.startsWith('The Unlogged Delivery'))).toBe(true);
 expect(restored.evidence).toEqual([]);
});
