import * as T from 'three';
import {SVGRenderer} from 'three/examples/jsm/renderers/SVGRenderer.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {config,vehicles,type Vehicle,SimulationDataProvider} from './simulation';
import {smooth,storyTime} from './story';
import {createIntelligenceChip} from './chip';
const BLUE=0x246bfa;
const material=(color:T.ColorRepresentation,roughness=.7)=>new T.MeshStandardMaterial({color,roughness,metalness:.12});
const asphalt=material('#abb0b5'),concrete=material('#e5e7e7'),paint=material('#fafafa'),dark=material('#30363d'),glass=material('#4b5964',.23);
function box(parent:T.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,mat:T.Material=concrete,rounded=false){const m=new T.Mesh(rounded?new RoundedBoxGeometry(w,h,d,3,Math.min(.10,w*.18,h*.18,d*.18)):new T.BoxGeometry(w,h,d,Math.max(1,Math.ceil(w/12)),1,Math.max(1,Math.ceil(d/12))),mat);m.position.set(x,y,z);if(h<.45&&w>8)m.renderOrder=y<-.2?-30:y<0?-20:-10;if(h<.05)m.renderOrder=-5;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function cylinder(parent:T.Object3D,r:number,h:number,x:number,y:number,z:number,mat:T.Material){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,8),mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m}
function label(text:string,w=512,h=100){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d')!;ctx.fillStyle='#e8eceb';ctx.fillRect(0,0,w,h);ctx.fillStyle='#47525a';ctx.font='500 44px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,w/2,h/2);return new T.CanvasTexture(c)}
export function createVehicle(v:Vehicle){const g=new T.Group();const len=v.length,semi=v.type==='semi',tall=['semi','bus','van'].includes(v.type);const body=material(v.type==='van'?'#90989f':v.type==='bus'?'#657078':'#30373e',.32);
 box(g,2.5,.6,len,0,.72,0,dark,true);
 if(semi){box(g,2.55,2.75,6.8,0,2.05,1.2,material('#8b9195'),true);box(g,2.5,2.55,2.6,0,1.9,-3.7,body,true);box(g,2.28,.82,.08,0,2.55,-5.03,glass);box(g,2.63,.82,1.5,0,2.55,-3.7,glass);box(g,1.9,.65,.08,0,1.1,-5.05,dark);for(let i=0;i<4;i++)box(g,1.9,.04,.05,0,.87+i*.15,-5.11,material('#98a0a4'));}
 else{box(g,2.3,tall?1.95:.85,len-.3,0,tall?1.65:1.1,0,body,true);box(g,2.05,tall?.8:.72,len*.62,0,tall?2.15:1.7,.05,glass,true);box(g,2.12,.16,len*.63,0,tall?2.64:2.12,.05,body,true);for(const x of [-1.08,1.08])for(const z of [-len*.23,len*.22])box(g,.11,.8,.16,x,tall?2.13:1.7,z,body);}
 const wheelZ=semi?[-3.8,.5,3.4,4.25]:[-len*.31,len*.31];for(const x of [-1.23,1.23])for(const z of wheelZ){const wheel=cylinder(g,.49,.27,x,.52,z,material('#20262b'));wheel.rotation.z=Math.PI/2;const hub=cylinder(g,.25,.29,x,.52,z,material('#82898d'));hub.rotation.z=Math.PI/2;}
 for(const x of [-.88,.88]){box(g,.5,.16,.07,x,1,-len/2-.025,paint);box(g,.44,.14,.07,x,1,len/2+.025,material('#8c4548'));}
 const cm=new T.MeshStandardMaterial({color:BLUE,emissive:BLUE,emissiveIntensity:.65,transparent:true});const chip=box(g,.75,.16,.75,0,semi?3.4:tall?2.85:2.35,semi?-3.7:0,cm);const aura=new T.Mesh(new T.RingGeometry(.58,.72,32),new T.MeshBasicMaterial({color:BLUE,transparent:true,opacity:.28,side:T.DoubleSide}));aura.rotation.x=-Math.PI/2;aura.position.copy(chip.position);aura.position.y-=.06;g.add(aura);chip.visible=false;aura.visible=false;
 return{g,chip,aura};}
export function createEnvironment(scene:T.Scene,mobile:boolean){
 box(scene,450,.4,450,0,-.38,0,material('#eef0ef'));
 for(const axis of [0,1]){const road=new T.Group();if(axis)road.rotation.y=Math.PI/2;box(road,25,.12,360,0,-.08,0,asphalt);for(const x of [-14,14])box(road,3,.25,360,x,.03,0);for(const x of [-8.3,-4.2,4.2,8.3])for(let z=-175;z<176;z+=8)if(Math.abs(z)>16)box(road,.13,.015,3.2,x,.005,z,paint);for(const x of [-.16,.16])for(const z of [-97,97])box(road,.10,.02,163,x,.01,z,material('#d0c7a6'));for(const side of [-1,1]){for(let x=-10.5;x<11;x+=1.8)box(road,.8,.03,3.4,x,.04,side*14.5,paint);box(road,11,.03,.28,side===1?6:-6,.04,side*17);}
 scene.add(road);}
 // Quiet, modular urban blocks, planted plazas and a restrained Atlanta skyline.
 const buildingMats=['#d4d8d9','#c5cccf','#dfe2e2','#cbd1d3'].map(c=>material(c));
 for(let i=0;i<(mobile?22:46);i++){const side=i%4,s=Math.floor(i/4),x=(side<2?-1:1)*(24+(s%3)*17),z=(side%2?-1:1)*(27+Math.floor(s/3)*30);const h=5+((i*17)%26);const w=9+(i%3)*2,d=12+(i%4)*2;box(scene,w,h,d,x,h/2,z,buildingMats[i%4]);box(scene,w+.4,.3,d+.4,x,h+.15,z,paint);for(let f=2;f<h;f+=3.1)box(scene,w+.04,.5,d+.04,x,f,z,material('#b7c1c6'));box(scene,w*.6,.8,d*.6,x,h+.7,z,buildingMats[(i+1)%4]);}
 for(let i=0;i<(mobile?20:56);i++){const side=i%4,k=Math.floor(i/4),x=side<2?(side===0?-17:17):(-92+k*14),z=side<2?(-92+k*14):(side===2?-17:17);if(Math.abs(x)<18&&Math.abs(z)<19)continue;cylinder(scene,.18,2.7,x,1.3,z,material('#9da49f'));const crown=new T.Mesh(new T.IcosahedronGeometry(1.65,1),material('#a4b3a7'));crown.scale.y=1.35;crown.position.set(x,3.5,z);crown.castShadow=true;scene.add(crown);box(scene,3.5,.10,3.5,x,.19,z,material('#c4cec6'));}
 for(const x of [-13.6,13.6])for(const z of [-38,36,70,-70]){cylinder(scene,.09,7,x,3.5,z,dark);box(scene,2,.1,.35,x+(x>0?-1:1),7,z,dark);}
 // Inspired skyline silhouette, not a geographically accurate city model.
 box(scene,12,48,12,-25,24,-132,material('#bcc5ca'));const crown=new T.Mesh(new T.ConeGeometry(8,13,4),material('#aebbc1'));crown.rotation.y=Math.PI/4;crown.position.set(-25,54,-132);scene.add(crown);cylinder(scene,.12,10,-25,65,-132,dark);
 for(const [txt,x,z] of [['PEACHTREE ST',-15,18],['10TH STREET',17,-17]] as [string,number,number][]){cylinder(scene,.09,4.8,x,2.4,z,dark);const m=new T.Mesh(new T.PlaneGeometry(5.5,1.08),new T.MeshBasicMaterial({map:label(txt),side:T.DoubleSide}));m.position.set(x,4.5,z);scene.add(m)}
 // Transit shelter establishes a local streetscape without reproducing branding.
 box(scene,7,.25,3,22,3.2,24,dark);for(const x of [19,25])box(scene,.12,3,.12,x,1.7,24,dark);box(scene,6,2.4,.1,22,1.8,25.3,glass);
 const signals:{axis:string;lamps:T.Mesh[];halos:T.Mesh[];stopBar:T.Mesh}[]=[];
 for(const axis of ['ns','ew'])for(const side of [-1,1]){
  const g=new T.Group();g.position.set(axis==='ns'?side*11:side*17,0,axis==='ns'?side*17:-side*11);if(axis==='ew')g.rotation.y=Math.PI/2;if(side<0)g.rotation.y+=Math.PI;
  cylinder(g,.13,7.6,0,3.8,0,dark);box(g,6,.18,.18,-2.9,7.6,0,dark);
  box(g,1.05,2.65,.55,-5,6.4,0,dark,true);const lamps:T.Mesh[]=[],halos:T.Mesh[]=[];
  for(let j=0;j<3;j++){
   const lens=new T.Mesh(new T.SphereGeometry(.34,14,10),new T.MeshBasicMaterial({color:'#313841',toneMapped:false}));lens.position.set(-5,7.25-j*.82,.35);g.add(lens);lamps.push(lens);
   const halo=new T.Mesh(new T.SphereGeometry(.55,12,8),new T.MeshBasicMaterial({color:'#ff4438',transparent:true,opacity:.2,depthWrite:false,toneMapped:false}));halo.position.copy(lens.position);g.add(halo);halos.push(halo);
  }
  const stopBar=box(g,9,.045,.20,-5,.075,0,new T.MeshBasicMaterial({color:'#ff4438',transparent:true,opacity:.45,toneMapped:false}));
  scene.add(g);signals.push({axis,lamps,halos,stopBar});
 }

 return signals;
}
export function createWorld(host:HTMLElement,getProgress:()=>number,onReady:()=>void,onFailure:()=>void){
 const mobile=host.clientWidth<700,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const scene=new T.Scene();scene.background=new T.Color('#edf0f1');scene.fog=new T.Fog('#edf0f1',95,240);const camera=new T.PerspectiveCamera(mobile?51:43,host.clientWidth/host.clientHeight,.004,550);
 let renderer:T.WebGLRenderer|SVGRenderer;let software=false;try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'})}catch{renderer=new SVGRenderer();renderer.setQuality('low');software=true;}renderer.setSize(host.clientWidth,host.clientHeight);if(renderer instanceof T.WebGLRenderer){renderer.setPixelRatio(Math.min(window.devicePixelRatio,mobile?1.25:1.7));renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;}host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','3D simulated Atlanta intersection with vehicles coordinated by FLOWLINK');

 scene.add(new T.HemisphereLight('#f8fbff','#959eaa',software?.75:2.6));const sun=new T.DirectionalLight('#ffffff',software?.8:3);sun.position.set(-45,80,35);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-95;sun.shadow.camera.right=95;sun.shadow.camera.top=95;sun.shadow.camera.bottom=-95;sun.shadow.bias=-.001;scene.add(sun);
 if(software)scene.add(new T.AmbientLight('#ffffff',1.15));
 const signals=createEnvironment(scene,mobile||software),cars=vehicles.map(v=>{const car=createVehicle(v);scene.add(car.g);return car}),provider=new SimulationDataProvider();
 // Replace the hero's solid cab block with an actual shell and an open doorway.
 const heroCab=cars[0].g;
 for(const child of [...heroCab.children])if(child instanceof T.Mesh&&child.position.z<-2&&child.position.y>1&&child!==cars[0].chip)heroCab.remove(child);
 const shellPaint=material('#414b55'),headliner=material('#b2bbc1');
 box(heroCab,2.50,.12,2.65,0,3.16,-3.70,shellPaint,true);
 box(heroCab,2.44,2.14,.12,0,2.03,-2.43,shellPaint,true);
 box(heroCab,.12,1.25,2.56,-1.20,1.62,-3.70,shellPaint,true);
 box(heroCab,2.42,1.18,.15,0,1.57,-4.94,shellPaint,true);
 box(heroCab,2.28,.05,2.32,0,3.06,-3.70,headliner);
 box(heroCab,2.36,.12,2.46,0,1.00,-3.70,headliner);
 box(heroCab,.12,.20,2.56,1.20,1.08,-3.70,shellPaint,true);
 // Right-side opening: front and rear pillars, with the hinged door between them.
 for(const z of [-4.77,-2.51])box(heroCab,.12,2.04,.15,1.20,2.05,z,shellPaint,true);
 // Mount the unit to the underside of the dash; it never floats in the footwell.
 const mountMat=material('#687681');
 for(const x of [-.70,-.60])box(cars[0].g,.018,.19,.025,x,1.655,-4.12,mountMat);
 const detailedChip=createIntelligenceChip();cars[0].g.add(detailedChip.group);detailedChip.group.position.set(-.65,1.55,-4.12);
 const interior=new T.Group();cars[0].g.add(interior);
 const dashMat=material('#b7c1c8'),trimMat=material('#84919c');
 box(interior,2.22,.38,.60,0,1.96,-4.57,dashMat,true);
 box(interior,2.22,.16,.68,0,2.16,-4.57,dashMat,true);
 // Sculpted dashboard, gauges, vents, console, seats and footwell details.
 const cabinMat=material('#9aa7b1'),seatMat=material('#677582'),screenMat=material('#435764');
 box(interior,.56,.27,.055,-.65,2.22,-4.49,trimMat,true);
 for(const x of [-.80,-.52]){const dial=new T.Mesh(new T.CircleGeometry(.083,20),screenMat);dial.position.set(x,2.23,-4.455);interior.add(dial);const needle=box(interior,.008,.055,.007,x,2.25,-4.446,paint);needle.rotation.z=-.5;}
 box(interior,.29,.19,.026,.08,2.19,-4.46,screenMat,true);
 for(const x of [-1,.43,.87])for(let i=0;i<4;i++)box(interior,.13,.011,.024,x,2.20+i*.025,-4.46,trimMat);
 for(let i=0;i<6;i++)box(interior,.045,.025,.025,-.05+i*.06,2.01,-4.465,trimMat,true);
 box(interior,.48,.78,.74,.30,1.44,-3.90,cabinMat,true);
 const shifter=cylinder(interior,.021,.22,.32,1.91,-3.69,trimMat);box(interior,.075,.055,.065,.32,2.04,-3.69,trimMat,true);
 for(const x of [-.65,.70]){box(interior,.64,.17,.66,x,1.2,-3.05,seatMat,true);const back=box(interior,.64,.74,.15,x,1.63,-2.77,seatMat,true);back.rotation.x=-.1;box(interior,.34,.18,.14,x,2.08,-2.73,seatMat,true);for(const side of [-1,1])box(interior,.09,.08,.43,x+side*.36,1.5,-3.0,trimMat,true);}
 box(interior,2.05,.05,1.85,0,.93,-3.73,cabinMat);
 for(const x of [-.82,-.59,-.38]){const pedal=box(interior,.10,.035,.18,x,1.07,-4.33,trimMat);pedal.rotation.x=-.3;}
 for(const x of [-1.14]){box(interior,.055,.4,.85,x,1.58,-3.56,cabinMat,true);box(interior,.10,.055,.20,x,1.84,-3.65,trimMat,true);}
 // Restrained Class 8 cab details: glovebox, cup holders, air brakes and seat stitching.
 box(interior,.62,.30,.10,.68,1.82,-4.55,dashMat,true);
 box(interior,.17,.022,.025,.68,1.90,-4.48,trimMat,true);
 for(const x of [.16,.39]){const rim=new T.Mesh(new T.TorusGeometry(.065,.009,6,20),trimMat);rim.rotation.x=Math.PI/2;rim.position.set(x,1.84,-3.95);interior.add(rim);}
 for(const [x,color] of [[.14,'#d0b765'],[.29,'#b76960']] as [number,string][]){const knob=new T.Mesh(new T.CylinderGeometry(.027,.027,.035,8),material(color));knob.rotation.x=Math.PI/2;knob.position.set(x,2.03,-4.42);interior.add(knob);}
 for(const x of [-.65,.70])for(const dx of [-.20,.20])box(interior,.008,.52,.008,x+dx,1.65,-2.677,cabinMat);
 for(const x of [-1.11]){box(interior,.07,.07,.35,x,1.65,-3.45,trimMat,true);box(interior,.04,.10,.32,x,1.28,-3.65,seatMat,true);}
 // Wheel, hub and spokes share one tilted assembly, connected to the dash by a column.
 const steering=new T.Group();steering.position.set(-.65,2.15,-4.08);steering.rotation.x=-.42;interior.add(steering);
 const wheel=new T.Mesh(new T.TorusGeometry(.205,.024,12,48),material('#48545e'));steering.add(wheel);
 const hub=new T.Mesh(new T.CylinderGeometry(.067,.067,.045,24),trimMat);hub.rotation.x=Math.PI/2;steering.add(hub);
 for(const angle of [Math.PI/2,Math.PI*7/6,Math.PI*11/6]){const spoke=box(steering,.025,.155,.020,Math.cos(angle)*.115,Math.sin(angle)*.115,0,trimMat,true);spoke.rotation.z=angle-Math.PI/2;}
 const columnStart=new T.Vector3(-.65,2.15,-4.08),columnEnd=new T.Vector3(-.65,1.99,-4.49),columnVector=columnEnd.clone().sub(columnStart);
 const column=new T.Mesh(new T.CylinderGeometry(.045,.060,columnVector.length(),20),trimMat);column.position.copy(columnStart).add(columnEnd).multiplyScalar(.5);column.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),columnVector.normalize());interior.add(column);
 // Passenger-side door with a front hinge, window frame and interior trim.
 const door=new T.Group();door.position.set(1.28,0,-4.65);cars[0].g.add(door);
 const doorPaint=material('#414b55'),doorGlass=new T.MeshStandardMaterial({color:'#b9d0dc',transparent:true,opacity:.17,depthWrite:false,side:T.DoubleSide});
 box(door,.10,.85,1.65,0,1.55,.825,doorPaint,true);
 box(door,.055,.58,1.48,-.075,1.62,.83,cabinMat,true);
 box(door,.16,.075,.62,-.12,1.87,.82,trimMat,true);
 box(door,.025,.80,1.48,0,2.39,.83,doorGlass);
 for(const z of [.035,1.62])box(door,.075,.93,.065,0,2.40,z,doorPaint,true);
 box(door,.075,.065,1.65,0,2.85,.825,doorPaint,true);
 box(door,.055,.055,.23,.07,1.94,1.36,paint,true);
 // Cab silhouette remains legible during the transparent reveal.
 for(const x of [-1.16,1.16]){box(interior,.065,1.02,.07,x,2.38,-4.78,trimMat);box(interior,.065,.06,1.8,x,2.92,-3.86,trimMat);}
 box(interior,2.30,.065,.08,0,2.90,-4.78,trimMat);
 const windscreen=new T.Mesh(new T.PlaneGeometry(2.22,.9),doorGlass);windscreen.position.set(0,2.43,-4.80);interior.add(windscreen);
 // Minimal landscape display within the reference's practical truck layout.
 box(interior,.57,.33,.035,.12,2.23,-4.40,screenMat,true);
 for(let i=0;i<3;i++)box(interior,.18,.008,.008,.02,2.31-i*.055,-4.375,paint);
 box(interior,.085,.085,.008,.28,2.23,-4.375,material('#6d9cc0'),true);
 // Accessible coupling below the driver's steering column, then ELD pass-through.
 const port=new T.Mesh(new T.CylinderGeometry(.015,.015,.021,18),material('#538c70'));port.rotation.z=Math.PI/2;port.position.set(-.58,1.55,-4.12);interior.add(port);
 const makeCable=(points:T.Vector3[],radius:number)=>{const mesh=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),30,radius,5,false),material('#66727c'));interior.add(mesh);return mesh};
 makeCable([new T.Vector3(-.715,1.55,-4.12),new T.Vector3(-.82,1.43,-4.15),new T.Vector3(-.91,1.54,-4.38),new T.Vector3(-.88,1.78,-4.55)],.008);
 makeCable([new T.Vector3(-.65,1.57,-4.22),new T.Vector3(-.80,1.63,-4.50),new T.Vector3(-1.02,1.70,-4.65),new T.Vector3(-1.06,2.6,-4.78),new T.Vector3(-.98,3.3,-4.70),new T.Vector3(-.80,3.38,-4.5)],.005);
 const antenna=cylinder(interior,.085,.045,-.80,3.4,-4.5,material('#48545e'));
 cars[0].chip.position.copy(antenna.position); // invisible network anchor; only the antenna is outside

 const dotGeometry=new T.OctahedronGeometry(.25,0),dotMaterial=new T.MeshBasicMaterial({color:'#1767ef',toneMapped:false});
 const links=Array.from({length:8},()=>{const group=new T.Group();for(let i=0;i<30;i++)group.add(new T.Mesh(dotGeometry,dotMaterial));scene.add(group);return group});

 const packets=Array.from({length:8},()=>{const dot=new T.Mesh(new T.SphereGeometry(.34,8,6),new T.MeshBasicMaterial({color:'#2587ff',toneMapped:false}));scene.add(dot);return dot});
 const paths=vehicles.slice(0,5).map(v=>{const pts=Array.from({length:55},(_,i)=>v.axis==='ns'?new T.Vector3(2.1+v.lane*4.1,.15,55-i*1.7):new T.Vector3(-55+i*1.7,.15,2.1+v.lane*4.1));const line=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineDashedMaterial({color:BLUE,dashSize:1.1,gapSize:1,transparent:true,opacity:.4}));line.computeLineDistances();scene.add(line);return line});
 const ring=new T.Mesh(new T.RingGeometry(16,16.12,90),new T.MeshBasicMaterial({color:BLUE,transparent:true,opacity:.3,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.08;scene.add(ring);
 let raf=0,last=performance.now(),p=getProgress(),badFrames=0,finalStart=0;const look=new T.Vector3(),target=new T.Vector3();let initialized=false;let renderedAt=0;
 function render(now:number){if(software&&now-renderedAt<100){raf=requestAnimationFrame(render);return}renderedAt=now;const dt=Math.min((now-last)/1000,software?.3:.06);last=now;p+=(getProgress()-p)*(1-Math.exp(-dt*5));const wide=smooth(.30,.38,p),end=smooth(.75,1,p);if(p>.98&&!finalStart)finalStart=now;if(p<.97)finalStart=0;
 const time=storyTime(p)+(finalStart?(now-finalStart)/1000:0);const frame=provider.getFrame(time>86?15+(time-86)%65:time);
 cars.forEach((c,i)=>{const v=vehicles[i];const d=frame.positions[i];c.g.position.set(v.axis==='ns'?2.1+v.lane*4.1:d,0,v.axis==='ns'?-d:2.1+v.lane*4.1);c.g.rotation.y=v.axis==='ns'?0:-Math.PI/2;c.g.visible=Math.abs(d)<178&&(i!==1||p>.33);c.chip.visible=p>=.22;c.aura.visible=p>=.22;const chipMat=c.chip.material as T.MeshStandardMaterial;chipMat.emissiveIntensity=p<.44?.35+((Math.sin(now*.0055+i)+1)/2)*2.1:1.15;const pulse=reduced?.5:(Math.sin(now*.0055+i)+1)/2;c.aura.scale.setScalar(p<.44?1+pulse*.4:1);(c.aura.material as T.MeshBasicMaterial).opacity=p<.44?.15+pulse*.4:.32;});
 const hero=cars[0].g.position;
 target.set(T.MathUtils.lerp(hero.x+13,57+end*16,wide),T.MathUtils.lerp(12,75+end*38,wide),T.MathUtils.lerp(hero.z+24,73+end*22,wide));
 look.set(T.MathUtils.lerp(hero.x-(mobile?0:10),-14,wide),0,T.MathUtils.lerp(hero.z-10,0,wide));
 // Smooth doorway entrance, a broad stationary reveal, and a retraced exit.
 const easing=(a:number,b:number,v:number)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*t*(t*(t*6-15)+10)};
 const close=easing(.205,.23,p)*(1-easing(.255,.28,p));
 const doorOpen=easing(.10,.15,p)*(1-easing(.30,.345,p));
 door.rotation.y=doorOpen*Math.PI*.48;
 const cabinLook=hero.clone().add(new T.Vector3(-.65,1.55,-4.12));
 const chipView=new T.Vector3(-.48,1.64,-3.86);
 if(p>=.08&&p<.23){
  // One path, no separate interior pan or change of direction.
  const approach=new T.CatmullRomCurve3([new T.Vector3(13,12,24),new T.Vector3(8,6,3),new T.Vector3(4,2.65,-3.10),new T.Vector3(1.6,2.40,-3.26),new T.Vector3(.32,2.10,-3.48),chipView],false,'centripetal');
  const t=easing(.08,.23,p);target.copy(approach.getPoint(t).add(hero));
  const gaze=easing(.08,.20,p);look.lerp(cabinLook,gaze);
 }else if(p>=.23&&p<.255){
  // 0.025 × 60 seconds = 1.5 seconds at the chip.
  target.copy(chipView).add(hero);look.copy(cabinLook);
 }else if(p>=.255&&p<.38){
  const exit=new T.CatmullRomCurve3([chipView,new T.Vector3(.32,2.10,-3.48),new T.Vector3(1.6,2.40,-3.26),new T.Vector3(4,2.65,-3.10),new T.Vector3(10,16,8),new T.Vector3(30,50,40),new T.Vector3(57-hero.x,75,73-hero.z)],false,'centripetal');
  const t=easing(.255,.38,p);target.copy(exit.getPoint(t).add(hero));look.copy(cabinLook).lerp(new T.Vector3(-14,0,0),t);
 }
 camera.fov=T.MathUtils.lerp(mobile?51:43,mobile?62:58,easing(.16,.20,p)*(1-easing(.30,.38,p)));camera.updateProjectionMatrix();
 camera.position.copy(target);camera.lookAt(look);
 detailedChip.group.visible=true;detailedChip.group.scale.setScalar(1);detailedChip.update(now,p>.38,reduced,close);
 dashMat.transparent=close>.001;dashMat.opacity=1-close*.75;dashMat.depthWrite=close<.02;

 cars[0].chip.visible=false;cars[0].aura.visible=false;

 // Only connect vehicles whose front bumper has not entered the intersection.
 const approaching=cars.map((car,index)=>({car,index})).filter(({car,index})=>car.g.visible&&frame.positions[index]+vehicles[index].length/2<=-config.stopLine);
 links.forEach((link,i)=>{
  const from=approaching[i],to=approaching[i+1];
  if(!from||!to){link.visible=false;packets[i].visible=false;return;}
  const a=from.car.chip.getWorldPosition(new T.Vector3()),b=to.car.chip.getWorldPosition(new T.Vector3());
  const reveal=smooth(.29+i*.003,.335+i*.003,p);
  const relevant=reveal>0&&a.distanceTo(b)<105;
  link.visible=relevant;packets[i].visible=relevant;
  link.children.forEach((dot,j)=>{const f=j/29;dot.visible=f<=reveal;dot.position.set(T.MathUtils.lerp(a.x,b.x,f),T.MathUtils.lerp(a.y,b.y,f)+Math.sin(f*Math.PI)*4,T.MathUtils.lerp(a.z,b.z,f));});
  const f=(reduced?.5:(now*.00035+i*.13)%1)*reveal;
  packets[i].position.set(T.MathUtils.lerp(a.x,b.x,f),T.MathUtils.lerp(a.y,b.y,f)+Math.sin(f*Math.PI)*4,T.MathUtils.lerp(a.z,b.z,f));
 });

 paths.forEach(path=>path.visible=p>.49&&p<.81);ring.visible=p>.64;
 signals.forEach(s=>{
  const active=frame.signal===s.axis?2:frame.signal===`yellow-${s.axis}`?1:0;
  const colors=['#ff342b','#ffc12b','#08d37f'];
  s.lamps.forEach((lamp,i)=>{(lamp.material as T.MeshBasicMaterial).color.set(i===active?colors[i]:'#252d35');s.halos[i].visible=i===active;(s.halos[i].material as T.MeshBasicMaterial).color.set(colors[i]);});
  (s.stopBar.material as T.MeshBasicMaterial).color.set(colors[active]);
 });

 renderer.render(scene,camera);if(!initialized){initialized=true;onReady()}if(renderer instanceof T.WebGLRenderer&&dt>.035&&++badFrames===100){renderer.setPixelRatio(1);renderer.shadowMap.enabled=false;}raf=requestAnimationFrame(render);
 }
 raf=requestAnimationFrame(render);const resize=()=>{camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)};window.addEventListener('resize',resize);const lost=(e:Event)=>{e.preventDefault();onFailure()};renderer.domElement.addEventListener('webglcontextlost',lost);
 return()=>{detailedChip.dispose();cancelAnimationFrame(raf);window.removeEventListener('resize',resize);renderer.domElement.removeEventListener('webglcontextlost',lost);scene.traverse(o=>{const m=o as T.Mesh;if(m.geometry)m.geometry.dispose();if(m.material){const mats=Array.isArray(m.material)?m.material:[m.material];mats.forEach(mat=>mat.dispose())}});if(renderer instanceof T.WebGLRenderer)renderer.dispose();renderer.domElement.remove()};
}
