import * as T from 'three';
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';

/** User-supplied enclosure, in metres, with an illustrative vertical internal PCB. */
export function createIntelligenceChip(){
 const group=new T.Group();let disposed=false;
 const shellMaterial=new T.MeshStandardMaterial({color:'#c4cdd3',roughness:.55,metalness:.15,transparent:true,opacity:.14,depthWrite:false,side:T.DoubleSide});
 const edgeMaterial=new T.LineBasicMaterial({color:'#82939f',transparent:true,opacity:.62});
 const housing=new T.Group();group.add(housing);
 // Neutral placeholder is replaced by the exact attached STL after loading.
 const placeholder=new T.Mesh(new T.BoxGeometry(.105,.043,.070),shellMaterial);housing.add(placeholder);
 new STLLoader().load('/models/FlowLink_OBU-HD1_RevA.stl',geometry=>{
  if(disposed){geometry.dispose();return}
  geometry.rotateX(-Math.PI/2);geometry.computeBoundingBox();const center=geometry.boundingBox!.getCenter(new T.Vector3());geometry.translate(-center.x,-center.y,-center.z);geometry.scale(.001,.001,.001);
  housing.remove(placeholder);placeholder.geometry.dispose();
  const shell=new T.Mesh(geometry,shellMaterial);shell.renderOrder=5;housing.add(shell);
  const edges=new T.LineSegments(new T.EdgesGeometry(geometry,40),edgeMaterial);edges.renderOrder=6;housing.add(edges);
 },undefined,()=>{ /* Neutral enclosure remains if the model cannot load. */ });
 const boardMat=new T.MeshStandardMaterial({color:'#788994',metalness:.35,roughness:.5});
 const silver=new T.MeshStandardMaterial({color:'#b4bfc5',metalness:.7,roughness:.3});
 const coreMat=new T.MeshStandardMaterial({color:'#2c83cf',emissive:'#207cec',emissiveIntensity:.8,roughness:.3});
 function box(w:number,h:number,d:number,x:number,y:number,z:number,mat:T.Material){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);group.add(m);return m}
 // Small upright 24 × 28 mm board, centered inside the 127 × 76 × 43 mm unit.
 box(.024,.028,.0018,-.005,0,0,boardMat);
 const core=box(.010,.010,.0026,-.005,.001,.002,coreMat);core.renderOrder=7;
 for(const side of [-1,1])for(let i=0;i<7;i++)box(.003,.0007,.001,-.005+side*.007,.001+(i-3)*.0014,.002,silver);
 const traceMat=new T.LineBasicMaterial({color:'#4486b8',transparent:true,opacity:.6});
 for(let i=0;i<6;i++){const y=(i-2.5)*.0035;const line=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(-.016,y,.0012),new T.Vector3(-.013,y,.0012),new T.Vector3(-.010,y*.5,.0012)]),traceMat);group.add(line);}
 const glow=new T.Mesh(new T.PlaneGeometry(.014,.014),new T.MeshBasicMaterial({color:'#369fff',transparent:true,opacity:.15,depthWrite:false,side:T.DoubleSide}));glow.position.set(-.005,.001,.0035);glow.renderOrder=8;group.add(glow);
 // Green diagnostic coupling and nine contacts; rear pass-through remains distinct.
 for(const x of [-.061,.056]){
  const ring=new T.Mesh(new T.TorusGeometry(.012,.002,8,24),new T.MeshStandardMaterial({color:x>0?'#5a8d76':'#87939b',roughness:.6}));ring.rotation.y=Math.PI/2;ring.position.set(x,0,0);group.add(ring);
  if(x>0)for(let i=0;i<9;i++){const a=i/9*Math.PI*2;const pin=new T.Mesh(new T.SphereGeometry(.001,5,4),silver);pin.position.set(x+.001,Math.cos(a)*.008,Math.sin(a)*.008);group.add(pin);}
 }
 function update(now:number,connected:boolean,reduced:boolean,reveal=0){shellMaterial.opacity=1-reveal*.86;shellMaterial.transparent=reveal>.001;shellMaterial.depthWrite=reveal<.001;edgeMaterial.opacity=.25+reveal*.37;const pulse=reduced?.6:(Math.sin(now*.0045)+1)/2;coreMat.emissiveIntensity=connected?1:.2+pulse*1.8;coreMat.color.set('#246aaa').lerp(new T.Color('#5fc3ff'),connected?.35:pulse);(glow.material as T.MeshBasicMaterial).opacity=connected?.18:.05+pulse*.3;glow.scale.setScalar(1+pulse*.1);}
 return{group,update,dispose:()=>{disposed=true}};
}
