// The old playable span was 104 by 102 metres. Keep the house and its paths
// in place while expanding the perimeter to three times each dimension.
export const GROUNDS={halfWidth:156,back:-151,front:155,terrainEdge:420} as const;
export const withinGrounds=(x:number,z:number)=>
 Math.abs(x)<GROUNDS.halfWidth&&z>GROUNDS.back&&z<GROUNDS.front;
