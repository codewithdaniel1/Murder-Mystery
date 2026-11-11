export type EvidenceId = 'fragment'|'note'|'ledger'|'receipts'|'alibi'|'bell'|'sighting'|'lining'|'cleaned'|'coat'|'display'|'falcon'|'translation'|'terrace'|'journey';
export type DeductionId = 'weapon'|'provenance'|'falseAlibi'|'passage'|'money';
export type PersonId = 'june'|'rook'|'mara'|'ada'|'tomas'|'beatrice'|'jonah';
export interface Pose { x:number; z:number; yaw:number; pitch:number }
export interface GameState { version:1; evidence:EvidenceId[]; deductions:DeductionId[]; flags:Record<string,boolean>; interviews:PersonId[]; dog:'waiting'|'walking'|'done'; arrival:'absent'|'queued'|'arriving'|'present'; doors:Record<string,boolean>; pose:Pose; finished:boolean }
export const SAVE_KEY='bramblewick.case.1';
export const PEOPLE:Record<PersonId,{name:string;role:string;initials:string;color:string}>={
 june:{name:'June Bell',role:'The housekeeper',initials:'JB',color:'#aebaaa'},
 rook:{name:'Edmund Rook',role:'The steward',initials:'ER',color:'#b2a5b8'},
 mara:{name:'Dr. Mara Voss',role:'The visiting scholar',initials:'MV',color:'#c3a684'},
 ada:{name:'Ada Ashcombe',role:'The owner’s niece',initials:'AA',color:'#adc1bc'},
 tomas:{name:'Tomas Reed',role:'The gardener',initials:'TR',color:'#a0b08b'},
 beatrice:{name:'Lady Beatrice',role:'The owner',initials:'BA',color:'#c0a2a0'},
 jonah:{name:'Jonah Pike',role:'The driver',initials:'JP',color:'#9dabb9'}
};
export const EVIDENCE:Record<EvidenceId,{title:string;source:string;text:string;kind:'object'|'document'|'statement'}>={
 fragment:{title:'A broken bronze talon',source:'Study · beside the desk',kind:'object',text:'A small bronze talon with an uneven broken edge. It snapped from something larger.'},
 note:{title:'Elias’s unfinished letter',source:'Study · writing desk',kind:'document',text:'“Beatrice—before you approve another restoration payment, compare the estate’s claim with the original invoice. I have placed the papers with the old ledger. We must speak tonight. —E.V.”'},
 ledger:{title:'The Avellic ledger',source:'Study · writing desk',kind:'document',text:'Beside a payment of £120 is the annotation “vel aran si”. Its meaning is not yet established.'},
 receipts:{title:'Three financial records',source:'Study · ledger envelope',kind:'document',text:'The supplier invoiced £60. The estate was charged £180 for that same work. A separate payment slip records £120 received by Edmund Rook.'},
 alibi:{title:'Rook’s bell-tower account',source:'Edmund Rook · statement',kind:'statement',text:'“In the bell tower, from about 20:25 until 20:35. I rang the half-hour bell myself. By hand.”'},
 bell:{title:'A disconnected bell rope',source:'Service passage · bell mechanism',kind:'object',text:'The manual coupling is disconnected. The dated repair notice reads: “Manual rope removed today. Automatic half-hour chime operating normally. —T. Reed.”'},
 sighting:{title:'June’s passage sighting',source:'June Bell · statement',kind:'statement',text:'June saw Rook enter the service passage at 20:26. She did not see which door he used afterward.'},
 lining:{title:'Plum fabric on the latch',source:'Service passage · door latch',kind:'object',text:'A piece of plum jacket lining, edged with stitched diamonds, is caught on the latch.'},
 cleaned:{title:'A freshly cleaned latch',source:'June Bell · statement',kind:'statement',text:'June cleaned the latch at 20:15. Nothing was caught on it then.'},
 coat:{title:'Rook’s torn jacket lining',source:'Edmund Rook · observation',kind:'object',text:'Rook’s torn lining has the same plum fabric and stitched-diamond border as the snag. He cannot name the door that caught it.'},
 display:{title:'The empty falcon plinth',source:'Steward’s office · display',kind:'document',text:'“Bronze Falcon — Presented to Edmund Rook.” The inventory illustration shows a falcon with an extended claw.'},
 falcon:{title:'The concealed bronze falcon',source:'Greenhouse · potting tray',kind:'object',text:'A heavy bronze falcon, concealed beneath loose potting material. One talon is missing. Rook’s name is engraved on its base.'},
 translation:{title:'“Received personally by the steward”',source:'Verified Avellic interpretation',kind:'document',text:'“Vel aran si” means “received personally by the steward”, distinguishing a personal receipt from a payment to an outside supplier.'},
 terrace:{title:'The terrace accounts',source:'Ada / Mara / Tomas · statements',kind:'statement',text:'Ada and Mara were on the terrace while Tomas worked by the fountain. They went inside when June called. The hedge blocks the greenhouse from view.'},
 journey:{title:'The owner’s journey',source:'Jonah Pike · statement and receipt',kind:'statement',text:'Jonah says Beatrice was with him on the road from eight. The toll receipt supports their journey, though it cannot independently establish every minute.'}
};
export const DEDUCTIONS:Record<DeductionId,{title:string;needs:EvidenceId[];options:string[];correct:number;text:string}>={
 weapon:{title:'The object used in the study',needs:['fragment','falcon'],options:['The falcon matches the fragment at the scene.','The falcon proves where Ada was.','The fragment identifies the poison.'],correct:0,text:'The broken edge fits the falcon’s missing talon, connecting it to the scene.'},
 provenance:{title:'Where the falcon came from',needs:['display','falcon'],options:['It belongs to the gardener.','It came from Rook’s office display.','Elias ordered a new ornament.'],correct:1,text:'The illustration and engraving connect the falcon to Rook’s office. Ownership alone does not prove who used it.'},
 falseAlibi:{title:'The half-hour bell',needs:['alibi','bell'],options:['The bell never rang.','Rook could not have been anywhere near the tower.','Rook could not have rung it manually.'],correct:2,text:'The manual rope was disconnected. The automatic chime explains the sound; Rook’s claimed action is impossible.'},
 passage:{title:'The service route',needs:['lining','cleaned','coat'],options:['Rook used the passage after the latch was cleaned.','June tore her own jacket.','The fabric establishes the exact time of death.'],correct:0,text:'The matching lining and June’s cleaning account connect Rook to recent use of the service route.'},
 money:{title:'The missing restoration money',needs:['ledger','receipts','translation'],options:['All £180 went to the supplier.','£120 of the estate’s payment went personally to Rook.','The translation establishes Ada’s inheritance.'],correct:1,text:'£60 of actual work plus £120 received by Rook explains the £180 claim. Elias was about to expose the diversion.'}
};
export function freshState():GameState {return {version:1,evidence:[],deductions:[],flags:{},interviews:[],dog:'waiting',arrival:'absent',doors:{front:true,rear:true},pose:{x:0,z:22,yaw:0,pitch:0},finished:false};}
export function has(s:GameState,id:EvidenceId){return s.evidence.includes(id)}
export function addEvidence(s:GameState,...ids:EvidenceId[]){let count=0;for(const id of ids)if(!has(s,id)){s.evidence.push(id);count++}return count;}
export function canReport(s:GameState){return !!s.flags.intro && ['fragment','note','ledger'].some(x=>has(s,x as EvidenceId)) && s.interviews.length>0;}
export function canCall(s:GameState){return canReport(s)&&!!s.flags.reported;}
export function completeCall(s:GameState){if(!canCall(s)||s.arrival!=='absent')return false;s.arrival='queued';s.flags.called=true;return true;}
export function solveDeduction(s:GameState,id:DeductionId,choice:number){const d=DEDUCTIONS[id];if(!d.needs.every(e=>has(s,e))||choice!==d.correct)return false;if(!s.deductions.includes(id))s.deductions.push(id);return true;}
export function supportedCase(s:GameState){const d=(id:DeductionId)=>s.deductions.includes(id);const connection=(d('falseAlibi')&&d('passage'))||(d('falseAlibi')&&has(s,'sighting')&&d('provenance'))||(d('passage')&&has(s,'sighting')&&d('provenance'));return d('weapon')&&d('money')&&connection;}
export function accuse(s:GameState,person:string,method:string,motive:string):{win:boolean;message:string}{
 if(s.arrival!=='present')return {win:false,message:'Lady Beatrice must be here to hear the explanation. Finish June’s report and the gatehouse call.'};
 if(person!=='rook')return {win:false,message:'That accusation is not supported by the connections you have established. Review the suspect’s opportunity and the physical evidence.'};
 if(method!=='falcon')return {win:false,message:'The proposed method does not account for the physical evidence in the study.'};
 if(motive!=='funds')return {win:false,message:'The proposed motive does not explain what Elias intended to reveal that evening.'};
 if(!supportedCase(s))return {win:false,message:'A promising suspicion, but the explanation needs more support. Establish the weapon, the financial motive, and a convincing connection to Rook in your notebook.'};
 s.finished=true;return {win:true,message:'The case is explained.'};
}
export function objective(s:GameState):[string,string]{
 if(s.finished)return ['Case closed','Elias’s final discovery has been heard.'];
 if(!s.flags.intro)return ['Speak to June','The housekeeper is waiting in the entrance hall.'];
 if(!['fragment','note','ledger'].some(x=>has(s,x as EvidenceId)))return ['Examine the study','The room to the left of the entrance hall holds Elias’s work.'];
 if(!s.interviews.length)return ['Hear another account','Question Rook in the study, Mara in the library, or a guest outside.'];
 if(!s.flags.reported)return ['Report back to June','Tell the housekeeper what you have found.'];
 if(s.arrival==='absent')return ['Telephone the gatehouse','Use the telephone on the hall side table.'];
 if(s.arrival==='queued'||s.arrival==='arriving')return ['The owner is arriving','Look toward the front drive, or continue investigating.'];
 if(!has(s,'falcon'))return ['Follow the garden lead','Ask Tomas about the greenhouse, or walk Pip for Mara.'];
 if(!has(s,'translation'))return ['Interpret the ledger','Return Pip to Mara, or inspect the library reference after speaking to Beatrice.'];
 if(!supportedCase(s))return ['Connect the evidence','Open your notebook. Compare the bell, passage, weapon, and accounts.'];
 return ['Present your explanation','Speak to Lady Beatrice, or use the accusation page in your notebook.'];
}
export function encodeSave(s:GameState,pose:Pose){if(s.arrival==='arriving')throw new Error('Let the car finish its approach before saving.');return JSON.stringify({...s,pose});}
export function decodeSave(raw:string):GameState|null{
 try{const v=JSON.parse(raw);if(!v||v.version!==1||!Array.isArray(v.evidence)||!v.evidence.every((e:unknown)=>typeof e==='string'&&Object.hasOwn(EVIDENCE,e))||!Array.isArray(v.deductions)||!v.deductions.every((e:unknown)=>typeof e==='string'&&Object.hasOwn(DEDUCTIONS,e))||!Array.isArray(v.interviews)||!v.interviews.every((e:unknown)=>typeof e==='string'&&Object.hasOwn(PEOPLE,e))||!v.flags||typeof v.flags!=='object'||Array.isArray(v.flags)||!Object.values(v.flags).every(x=>typeof x==='boolean')||!v.doors||typeof v.doors!=='object'||Array.isArray(v.doors)||!Object.values(v.doors).every(x=>typeof x==='boolean')||!['waiting','walking','done'].includes(v.dog)||!['absent','queued','present'].includes(v.arrival)||typeof v.finished!=='boolean')return null;
 const p=v.pose;if(!p||!['x','z','yaw','pitch'].every(k=>typeof p[k]==='number'&&Number.isFinite(p[k]))||Math.abs(p.x)>100||Math.abs(p.z)>100||Math.abs(p.pitch)>1.55)return null;
 return {...v,evidence:[...new Set(v.evidence)],deductions:[...new Set(v.deductions)],interviews:[...new Set(v.interviews)],flags:{...v.flags},doors:{...v.doors},pose:{...p}} as GameState;
 }catch{return null}
}
