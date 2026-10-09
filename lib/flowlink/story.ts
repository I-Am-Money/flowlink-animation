export const stateNames=['INTRO','VEHICLE_REVEAL','INTELLIGENCE','SECOND_VEHICLE','NETWORK_REVEAL','CONNECTING','CONNECTED','BIRDSEYE','PREDICTION','COORDINATION','TRAFFIC_FLOW','NETWORK_SCALE','RESULT'] as const;
const boundaries=[0,.04,.12,.35,.38,.40,.43,.45,.46,.58,.68,.82,.90,1];
export const states=stateNames.map((name,i)=>({name,start:boundaries[i],end:boundaries[i+1],camera:i===2?'chip-closeup':i<4?'follow':i<8?'rise':'overview',vehicles:i<8?'approach':'coordinated',chips:i<2?'off':i<6?'pulse':'solid',connections:i<4?'hidden':'active',signals:i<9?'waiting':'adaptive'}));
export const chapters=[{at:0,label:'Perspective',eyebrow:'01 / INDIVIDUAL INTELLIGENCE',title:'Every journey.\nA new perspective.',copy:'One vehicle understands the road. Imagine what happens when they all do.'},{at:.12,label:'Intelligence',eyebrow:'02 / VEHICLE INTELLIGENCE',title:'THE FLOWLINK\nINTELLIGENCE',copy:'Under the driver’s dash. Connected to the road.'},{at:.38,label:'Connection',eyebrow:'03 / A CONNECTED NETWORK',title:'Individual insight.\nCollective understanding.',copy:'Vehicles share what they know. The network sees the bigger picture.'},{at:.46,label:'Prediction',eyebrow:'04 / PREDICTIVE COORDINATION',title:'See it coming.\nKeep it moving.',copy:'Anticipate crossing paths. Adjust signal timing before vehicles arrive.'},{at:.68,label:'Flow',eyebrow:'05 / MOVEMENT, COORDINATED',title:'A city moving\nin conversation.',copy:'Less waiting. Better timing. One connected transportation network.'},{at:.90,label:'Impact',eyebrow:'06 / THE VALUE OF FLOW',title:'Time, given back.',copy:'Small improvements at one intersection. Possibility at the scale of a city.'}];
export const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};

// Truck reaches its red-light stop before entry; the signal stays red through exit.
// Other traffic continues to advance throughout the interior sequence.
export function storyTime(progress:number){
 const p=Math.max(0,Math.min(1,progress));
 if(p<.08)return p*40;
 if(p<.38)return 3.2+(p-.08)*(12.3/.30);
 if(p<.60)return 15.5+(p-.38)*(16.5/.22);
 return 32+(p-.60)*80;
}
