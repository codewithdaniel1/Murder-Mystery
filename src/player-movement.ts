// Travel uses real frame time, independently of the animation simulation cap.
// Ignore suspended tabs / debugger pauses instead of teleporting on resume.
export function playerStep(keys:ReadonlySet<string>,yaw:number,elapsed:number){
 const seconds=Number.isFinite(elapsed)&&elapsed>0&&elapsed<=.25?elapsed:0;
 const strafe=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));
 const forward=Number(keys.has('KeyS'))-Number(keys.has('KeyW'));
 const length=Math.hypot(strafe,forward)||1;
 const distance=(keys.has('ShiftLeft')||keys.has('ShiftRight')?4.5:2.9)*seconds;
 const x=strafe/length*distance,z=forward/length*distance;
 return {x:Math.cos(yaw)*x+Math.sin(yaw)*z,z:-Math.sin(yaw)*x+Math.cos(yaw)*z,seconds};
}
