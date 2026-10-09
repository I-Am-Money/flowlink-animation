export type VehicleType='semi'|'sedan'|'suv'|'van'|'bus';
export type Vehicle={id:string;type:VehicleType;axis:'ns'|'ew';arrival:number;length:number;lane:number;speed:number;destination:string;trajectory:[number,number,number][]};
export const config={speed:15,greenDuration:18,yellowDuration:3,clearance:3,duration:110,step:.1,stopLine:17,stopBuffer:2.5};
export const vehicles:Vehicle[]=Array.from({length:12},(_,i)=>({id:`FL-${String(i+1).padStart(3,'0')}`,type:(['semi','sedan','suv','van','bus','sedan'] as VehicleType[])[i%6],axis:i%3===1?'ew':'ns',arrival:i===0?0:3+i*2.4,length:i%6===0?10:i%6===4?8:4.4,lane:i%2,speed:config.speed,destination:i%3===1?'East corridor':'North corridor',trajectory:i%3===1?[[-75,0,3],[0,0,3],[75,0,3]]:[[3,0,75],[3,0,0],[3,0,-75]]}));
export type Frame={t:number;positions:number[];signal:'ns'|'ew'|'yellow-ns'|'yellow-ew'|'red'};
export type Run={frames:Frame[];travelTimes:number[];delays:number[];throughput:number};
// Deterministic replay: both controllers receive exactly the same demand and geometry.
export function predictConflicts(positions:number[],time:number){
 const arrival=vehicles.map((v,i)=>Math.max(0,v.arrival-time)+Math.max(0,-positions[i])/v.speed);
 return vehicles.flatMap((v,i)=>vehicles.flatMap((w,j)=>j>i&&v.axis!==w.axis&&positions[i]<0&&positions[j]<0&&Math.abs(arrival[i]-arrival[j])<6?[{vehicles:[v.id,w.id],timeToConflict:Math.max(arrival[i],arrival[j])}]:[]));
}
// Evaluate remaining green windows by forecast waiting time, including clearance.
export function chooseWindow(positions:number[],time:number,axis:'ns'|'ew'){
 const candidates=[7,10,13,16,18];
 const scored=candidates.map(seconds=>({seconds,cost:vehicles.reduce((sum,v,i)=>{if(positions[i]>-15)return sum;const eta=Math.max(0,v.arrival-time)+Math.max(0,-config.stopLine-config.stopBuffer-v.length/2-positions[i])/v.speed;if(eta>30)return sum;const wait=v.axis===axis?(eta>seconds?24:0):Math.max(0,seconds+config.yellowDuration+config.clearance-eta);return sum+wait},0)}));
 return scored.sort((a,b)=>a.cost-b.cost||a.seconds-b.seconds)[0].seconds;
}
export function simulate(optimized:boolean):Run{
 const positions=vehicles.map((v,i)=>-65-i*12),finished=vehicles.map(()=>0),entry=vehicles.map(()=>0),frames:Frame[]=[];
 let axis:'ns'|'ew'='ew',phase:'green'|'yellow'|'red'='green',elapsed=0;let window=optimized?chooseWindow(positions,0,axis):config.greenDuration;
 for(let tick=0;tick<=config.duration/config.step;tick++){
  const t=tick*config.step;elapsed+=config.step;
  const demand=(a:string)=>vehicles.reduce((sum,v,i)=>sum+(v.axis===a&&positions[i]<-15&&positions[i]>-85?1:0),0);
  const occupied=vehicles.some((v,i)=>positions[i]>-15&&positions[i]<15+v.length);
  if(phase==='green'&&elapsed>=window&&(!optimized||demand(axis==='ns'?'ew':'ns')>0)){phase='yellow';elapsed=0;}
  else if(phase==='yellow'&&elapsed>=config.yellowDuration){phase='red';elapsed=0;}
  else if(phase==='red'&&elapsed>=config.clearance&&!occupied){axis=axis==='ns'?'ew':'ns';phase='green';elapsed=0;window=optimized?chooseWindow(positions,t,axis):config.greenDuration;}
  const signal=phase==='green'?axis:phase==='yellow'?`yellow-${axis}` as Frame['signal']:'red';
  for(let i=0;i<vehicles.length;i++){
   const v=vehicles[i];if(t<v.arrival)continue;if(!entry[i])entry[i]=t||.001;
   let next=positions[i]+v.speed*config.step;
   const stop=-config.stopLine-config.stopBuffer-v.length/2;
   if(positions[i]<=stop&&!(phase==='green'&&axis===v.axis))next=Math.min(next,stop);
   // Car following is constrained by the actual lead vehicle's rear bumper.
   for(let j=0;j<vehicles.length;j++)if(j!==i&&vehicles[j].axis===v.axis&&vehicles[j].lane===v.lane&&positions[j]>positions[i]) next=Math.min(next,positions[j]-(v.length+vehicles[j].length)/2-3);
   positions[i]=Math.max(positions[i],next);
   if(positions[i]>=78&&!finished[i])finished[i]=t-entry[i];
  }
  frames.push({t,positions:[...positions],signal});
 }
 const travelTimes=finished.map((n,i)=>n||config.duration-entry[i]);const delays=travelTimes.map((n,i)=>Math.max(0,n-(143+i*12)/vehicles[i].speed));
 return{frames,travelTimes,delays,throughput:finished.filter(Boolean).length/config.duration*3600};
}
export const baseline=simulate(false),optimized=simulate(true);
const total=(xs:number[])=>xs.reduce((a,b)=>a+b,0);
export const metrics={totalTimeSaved:total(baseline.travelTimes)-total(optimized.travelTimes),averageTimeSaved:(total(baseline.travelTimes)-total(optimized.travelTimes))/vehicles.length,vehiclesProcessed:vehicles.length,averageDelay:total(optimized.delays)/vehicles.length,baselineTravelTime:total(baseline.travelTimes)/vehicles.length,optimizedTravelTime:total(optimized.travelTimes)/vehicles.length,intersectionThroughput:optimized.throughput,conflictsAvoided:vehicles.filter((v,i)=>vehicles.some((w,j)=>j<i&&w.axis!==v.axis&&Math.abs((65+i*12)/v.speed+v.arrival-((65+j*12)/w.speed+w.arrival))<6)).length};
export interface VehicleDataProvider{getVehicles():Vehicle[];getFrame(time:number):Frame;getIntersections():{id:string;signals:string[];roads:string[]}[];subscribe(callback:()=>void):()=>void}
export class SimulationDataProvider implements VehicleDataProvider{getVehicles(){return vehicles}getFrame(t:number){const idx=Math.min(optimized.frames.length-2,Math.max(0,Math.floor(t/config.step)));const a=optimized.frames[idx],b=optimized.frames[idx+1],f=Math.max(0,Math.min(1,(t-a.t)/config.step));return {...a,positions:a.positions.map((p,i)=>p+(b.positions[i]-p)*f)}}getIntersections(){return[{id:'atl-demo-01',signals:['north-south','east-west'],roads:['Peachtree corridor','10th Street corridor']}]}subscribe(_callback:()=>void){return()=>{}}}
// Adapter accepts validated snapshots; a future WebSocket transport can call ingest.
export class RealtimeDataProvider implements VehicleDataProvider{private frame:Frame={t:0,positions:[],signal:'red'};private list:Vehicle[]=[];private listeners=new Set<()=>void>();ingest(frame:Frame,list:Vehicle[]){this.frame=frame;this.list=list;this.listeners.forEach(fn=>fn())}getVehicles(){return this.list}getFrame(){return this.frame}getIntersections(){return[{id:'live',signals:[],roads:[]}]}subscribe(fn:()=>void){this.listeners.add(fn);return()=>{this.listeners.delete(fn)}}}

// Aspirational future scenario, independent of the measured simulation output.
// Peak/holiday-season commute days replace regular days; they are not extra trips.
export const commuteAssumptions={workdays:250,tripsPerDay:2,annualTrafficHours:75,regularDays:200,peakDays:50,regularDelayMinutes:8,peakDelayMinutes:13,regularSavedMinutes:5.4,peakSavedMinutes:10.68};
export function annualSavings(a=commuteAssumptions){
 const hours=(a.regularDays*a.regularSavedMinutes+a.peakDays*a.peakSavedMinutes)*a.tripsPerDay/60;
 const baselineHours=(a.regularDays*a.regularDelayMinutes+a.peakDays*a.peakDelayMinutes)*a.tripsPerDay/60;
 return{hours,baselineHours,remainingHours:baselineHours-hours,percent:hours/a.annualTrafficHours*100};
}
export const annualMetrics=annualSavings();
