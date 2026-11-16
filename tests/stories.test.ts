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
