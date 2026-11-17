import * as T from 'three';
import type {Estate} from './world';
import {CELLAR_FLOOR} from './cellar';
import {PEOPLE} from './state';
import {WITNESSES} from './yard';

export const SUSPECTS={...PEOPLE,...WITNESSES};
export const METHODS={
 poison:'Poison in a drink',falcon:'The bronze falcon',fall:'A fall from the tower',
 poker:'The fireplace poker',knife:'The desk letter opener',wrench:'The fitter’s spanner',
 rollingPin:'The kitchen rolling pin',rope:'The gardener’s rope',bottle:'A heavy wine bottle',secateurs:'The gardener’s secateurs',
};
export const MOTIVES={
 inheritance:'To gain an inheritance',funds:'To conceal diverted restoration funds',rivalry:'A scholarly rivalry',
 dismissal:'Fear of losing a job',blackmail:'To stop blackmail',smuggling:'To hide stolen rationed supplies',
 revenge:'Revenge for a family grievance',protection:'To protect a relative',debt:'To escape a personal debt',
};
export const CANDIDATE_OBJECTS:Record<string,[string,string,string]>={
 'candidate-poison':['Garden · glasshouse bench','Corked garden treatment','A dark bottle labelled “Garden treatment — not for consumption”. The cork is wax-sealed and the neck is dusty. Edith keeps it for the plants. The label alone does not connect it to Elias’s drink.'],
 'candidate-poker':['Mansion · study fireplace','Iron fireplace poker','A soot-darkened iron poker rests on its own stand. Its tip is blackened from the fire; no piece appears to have broken away. Compare its material with the fragment beside Elias’s desk.'],
 'candidate-knife':['Mansion · study desk','Brass letter opener','A narrow brass letter opener with a walnut grip. Paper fibres cling to its blunt edge. An opened envelope lies nearby. There is no missing bronze talon on this object.'],
 'candidate-wrench':['Cellar · fitter’s workshop','Fitter’s spanner','A heavy open-ended spanner lies on the workbench, with oil around its jaws. Frank says it was used on a lodge hinge. Its presence here does not establish where it was last night.'],
 'candidate-rolling-pin':['Mansion · kitchen worktable','Beech rolling pin','A rolling pin with turned handles, resting in a dusting of flour. Mabel says it was in use before supper. You would need to check her account before treating the kitchen tool as a weapon.'],
 'candidate-rope':['Garden · potting shed','Coil of garden rope','A neatly coiled length of rough garden rope, secured with a small tie. Short fibres and a plant label remain caught in the twine. Hugh says it is used for the orchard supports.'],
};

/** Small props use existing worktops and shared materials; no new lights or moving bodies. */
export function buildCandidateObjects(e:Estate){
 const place=(id:string,x:number,y:number,z:number,cellar=false)=>{
  const g=new T.Group();g.name=CANDIDATE_OBJECTS[id][1];g.position.set(x,y,z);
  (cellar&&e.cellarInterior?e.cellarInterior:e.scene).add(g);
  e.target(g,id,g.name,'Inspect');return g;
 };
 const wood=e.mats.wood,iron=e.mats.dark,brass=e.mats.gold;
 const poker=place('candidate-poker',-19.25,.08,3.4);
 e.cyl(.14,.17,.055,0,.0275,0,iron,poker,16);
 e.cyl(.014,.014,.82,0,.46,0,iron,poker,10);
 e.box(.095,.025,.025,.035,.075,0,iron,poker);
 const grip=new T.Mesh(new T.TorusGeometry(.054,.012,6,16),iron);grip.position.y=.9;poker.add(grip);
 const knife=place('candidate-knife',-15.7,1.025,.45);
 e.box(.085,.035,.19,0,.0175,.14,wood,knife);
 const blade=new T.Shape();blade.moveTo(-.035,.05);blade.lineTo(.035,.05);blade.lineTo(.018,-.2);blade.lineTo(0,-.27);blade.lineTo(-.018,-.2);blade.closePath();
 const steel=new T.Mesh(new T.ExtrudeGeometry(blade,{depth:.012,bevelEnabled:false}),brass);steel.rotation.x=Math.PI/2;steel.position.y=.012;knife.add(steel);
 e.box(.115,.026,.028,0,.02,.05,brass,knife);
 const bottle=place('candidate-poison',29.95,.9,-30.1);
 e.cyl(.075,.08,.24,0,.12,0,e.mats.black,bottle,16);e.cyl(.028,.075,.07,0,.275,0,e.mats.black,bottle,16);e.cyl(.028,.028,.08,0,.35,0,wood,bottle,12);
 e.cyl(.081,.081,.11,0,.12,0,e.mats.paper,bottle,16);e.box(.046,.025,.008,0,.13,.082,e.mats.red,bottle);
 const pin=place('candidate-rolling-pin',-18.8,1.025,-11.7);
 e.cyl(.067,.067,.44,0,.067,0,wood,pin,20).rotation.z=Math.PI/2;
 for(const side of[-1,1])e.cyl(.028,.036,.14,side*.29,.067,0,wood,pin,12).rotation.z=Math.PI/2;
 const rope=place('candidate-rope',-22.8,.932,-31.75);
 for(let i=0;i<4;i++){
  const ring=new T.Mesh(new T.TorusGeometry(.095+i*.023,.011,6,24),e.mats.cream);ring.rotation.x=-Math.PI/2;ring.position.y=.012;rope.add(ring);
 }
 e.box(.022,.035,.18,0,.03,.12,wood,rope);
 const wrench=place('candidate-wrench',7.55,CELLAR_FLOOR+1.065,-34.05,true);
 e.box(.07,.026,.38,0,.013,0,iron,wrench);
 for(const end of[-1,1]){
  e.box(.19,.026,.045,0,.013,end*.19,iron,wrench);
  for(const side of[-1,1])e.box(.045,.026,.10,side*.073,.013,end*.24,iron,wrench);
 }
 // Apply the cellar's constant baked lighting after the spanner geometry exists.
 e.cellarLighting?.apply(wrench);
}
