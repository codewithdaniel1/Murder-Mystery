import {describe,it,expect} from 'vitest';
import {freshState,addEvidence,completeCall,canReport,solveDeduction,supportedCase,accuse,encodeSave,decodeSave,DEDUCTIONS} from '../src/state';
import type {DeductionId} from '../src/state';
function ready(){const s=freshState();s.flags.intro=true;addEvidence(s,'note');s.interviews.push('mara');s.flags.reported=true;return s}
function caseState(route:DeductionId[]){const s=ready();s.arrival='present';for(const id of ['weapon','money',...route] as DeductionId[]){addEvidence(s,...DEDUCTIONS[id].needs);solveDeduction(s,id,DEDUCTIONS[id].correct)}addEvidence(s,'sighting');return s}
describe('arrival rules',()=>{
 it('requires introduction, study lead, interview, report, and completed call',()=>{const s=freshState();expect(completeCall(s)).toBe(false);s.flags.intro=true;expect(canReport(s)).toBe(false);addEvidence(s,'note');expect(canReport(s)).toBe(false);s.interviews.push('rook');expect(canReport(s)).toBe(true);expect(completeCall(s)).toBe(false);s.flags.reported=true;expect(s.arrival).toBe('absent');expect(completeCall(s)).toBe(true);expect(s.arrival).toBe('queued');expect(completeCall(s)).toBe(false)});
 it('does not replay an arrival restored from a save',()=>{const s=ready();s.arrival='present';const r=decodeSave(encodeSave(s,s.pose))!;expect(completeCall(r)).toBe(false);expect(r.arrival).toBe('present')});
});
describe('fair deduction and resolution',()=>{
 it.each([['falseAlibi','passage'],['falseAlibi','provenance'],['passage','provenance']] as DeductionId[][])('accepts supported independent evidence route %j',(a,b)=>{const s=caseState([a,b]);expect(supportedCase(s)).toBe(true);expect(s.dog).toBe('waiting');expect(accuse(s,'rook','falcon','funds').win).toBe(true)});
 it('does not unlock a deduction without the actual clues or with a wrong inference',()=>{const s=freshState();expect(solveDeduction(s,'weapon',0)).toBe(false);addEvidence(s,'fragment','falcon');expect(solveDeduction(s,'weapon',1)).toBe(false);expect(solveDeduction(s,'weapon',0)).toBe(true);solveDeduction(s,'weapon',0);expect(s.deductions).toEqual(['weapon'])});
 it('allows retry after a wrong accusation and requires supporting evidence',()=>{const s=caseState(['falseAlibi','passage']);expect(accuse(s,'ada','falcon','funds').win).toBe(false);expect(s.finished).toBe(false);expect(accuse(s,'rook','poison','funds').win).toBe(false);expect(accuse(s,'rook','falcon','rivalry').win).toBe(false);s.deductions=[];expect(accuse(s,'rook','falcon','funds').win).toBe(false)});
 it('requires the owner to hear the explanation',()=>{const s=caseState(['falseAlibi','passage']);s.arrival='absent';expect(accuse(s,'rook','falcon','funds').win).toBe(false)});
});
describe('one-slot save data',()=>{
 it('round trips evidence, doors, dog route, flags and pose',()=>{const s=ready();s.dog='walking';s.flags.fountain=true;s.doors.study=true;completeCall(s);const pose={x:-10,z:4,yaw:1.2,pitch:-.2};const r=decodeSave(encodeSave(s,pose))!;expect(r).toEqual({...s,pose});expect(r.flags).not.toBe(s.flags)});
 it('refuses an approach mid-animation',()=>{const s=ready();s.arrival='arriving';expect(()=>encodeSave(s,s.pose)).toThrow();expect(decodeSave(JSON.stringify(s))).toBeNull()});
 it.each(['bad json','null','{}'])('rejects malformed save %s',raw=>expect(decodeSave(raw)).toBeNull());
 it('rejects unsupported versions, unknown clues and unsafe pose data',()=>{for(const change of [{version:2},{evidence:['unknown']},{pose:{x:999,z:0,yaw:0,pitch:0}},{pose:{x:0,z:0,yaw:null,pitch:0}},{flags:{intro:'true'}},{doors:[]}])expect(decodeSave(JSON.stringify({...freshState(),...change}))).toBeNull()});
});
