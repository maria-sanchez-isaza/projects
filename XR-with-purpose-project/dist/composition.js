import {SCENES,COLORS as C,DURATION} from './content.js';
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
const lerp=(a,b,v)=>a+(b-a)*v;
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export const sceneAt=t=>SCENES.findIndex(s=>t>=s.start&&t<s.end)===-1?SCENES.length-1:SCENES.findIndex(s=>t>=s.start&&t<s.end);
const text=(lines,x,y,size=40,weight=400,fill=C.ink,leading=1.22)=>`<text x="${x}" y="${y}" fill="${fill}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="${weight>=800?-size*.035:0}">${(Array.isArray(lines)?lines:[lines]).map((s,i)=>`<tspan x="${x}" dy="${i?size*leading:0}">${esc(s)}</tspan>`).join('')}</text>`;
const rect=(x,y,w,h,color,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" ${extra}/>`;
const line=(x,y,x2,y2,color=C.ink,w=3)=>`<path d="M${x},${y} L${x2},${y2}" stroke="${color}" stroke-width="${w}" fill="none"/>`;
const reveal=(html,p,dy=25)=>`<g opacity="${ease(p)}" transform="translate(0 ${dy*(1-ease(p))})">${html}</g>`;
const label=(s,x=100,y=148)=>text(s,x,y,25,700);
const why=s=>label('WHY IT WORKS FOR ADULT LEARNERS',100,840)+text(s.why,100,897,36,400);
const arrow=(x,y,w=90)=>line(x,y,x+w,y)+`<path d="M${x+w-13},${y-10} l13,10 l-13,10" fill="none" stroke="${C.ink}" stroke-width="3"/>`;
const laptop=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><rect width="200" height="130" rx="5" fill="${C.paper}" stroke="${C.ink}" stroke-width="6"/><path d="M-20 145 H220 L200 160 H0 Z" fill="${C.ink}"/><path d="M30 40 H170 M30 65 H145 M30 90 H100" stroke="${C.blue}" stroke-width="10"/></g>`;
const headset=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><path d="M25 45 Q30 -25 100 -25 Q170 -25 175 45" fill="none" stroke="${C.ink}" stroke-width="12"/><path d="M10 30 Q100 10 190 30 L185 105 Q140 125 100 95 Q60 125 15 105 Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="6"/><path d="M38 48 H162" stroke="${C.ink}" stroke-width="6"/></g>`;
// These persistent collage pieces move across the entire composition; no CSS timers.
const layouts=[
 {blue:[1280,220,550,740,-5],yellow:[1530,830,300,80,0],red:[100,690,360,19,0],person:[1300,200,500,780]},
 {blue:[105,240,520,730,3],yellow:[680,298,1030,135,-1],red:[700,450,260,14,0],person:[125,205,500,780]},
 {blue:[100,560,530,170,0],yellow:[690,560,530,170,0],red:[1280,560,530,170,0],person:[1610,780,175,270]},
 {blue:[1200,430,570,250,-3],yellow:[1100,265,420,110,-2],red:[100,680,360,18,0],person:[1600,190,180,280]},
 {blue:[100,660,520,65,-2],yellow:[750,480,250,180,2],red:[1290,465,18,280,0],person:[1560,155,180,280]},
 {blue:[1200,300,570,400,2],yellow:[1240,280,260,65,-3],red:[100,765,360,14,0],person:[1510,330,270,420]},
 {blue:[100,515,850,105,0],yellow:[970,515,850,105,-1],red:[970,660,850,105,1],person:[1660,180,155,240]}
];
function layoutAt(t){let i=sceneAt(t),start=SCENES[i].start;const prev=layouts[Math.max(0,i-1)],next=layouts[i],p=i===0?1:ease((t-start)/.85);return Object.fromEntries(Object.keys(next).map(k=>[k,next[k].map((v,j)=>lerp(prev[k][j],v,p))]));}
function content(i,t){const s=SCENES[i],u=(t-s.start)/1.25;
 if(i===0)return label('WEEK 4 / TRAINING PROPOSAL')+reveal(text(s.title,100,300,112,900,C.ink,1.03),(u+.3)/.75)+text(s.body,100,788,36)+text('PURPOSE BEFORE TECHNOLOGY',100,980,22,700);
 if(i===1)return label(s.heading,700)+text(s.title,700,303,91,900,C.ink,1.04)+s.points.map((p,j)=>reveal(line(700,540+j*99,745,540+j*99,j%2?C.coral:C.blue,7)+text(p,776,552+j*99,37,400),(u-.12*j)/.5)).join('');
 if(i===2)return label(s.heading)+text(s.title,100,280,104,900)+text(s.body,100,360,46,700)+text(s.highlight,100,439,35)+['OUTCOME','PRACTICE','LEARNING'].map((p,j)=>reveal(text(p,145+j*590,662,49,800), (u-.55*j)/.4)).join('')+reveal(text('←',635,666,65,400),(u-.3)/.3)+reveal(text('←',1225,666,65,400),(u-.85)/.3)+text('01  Define the destination',100,800,29,700)+text('02  Plan meaningful practice',690,800,29,700)+text('03  Select the learning',1280,800,29,700)+text('DESIGN FROM THE DESTINATION BACK.',100,968,26,700);
 if(i===3)return label(s.heading)+text(s.title,100,293,112,900,C.ink,1.03)+text(s.body,100,535,37)+why(s)+reveal(text('A TEACHING CHALLENGE',1140,330,27,700),u/.4)+reveal(text(['“Help students see','a complex process.”'],1235,510,38,700),(u-.3)/.5)+reveal(arrow(1290,720,105)+text(['XR / INTERACTIVE','LEARNING'],1425,710,28,700),(u-.7)/.6);
 if(i===4)return label(s.heading)+text(s.title,100,280,99,900)+text(s.body,100,366,36)+why(s)+reveal(headset(260,515,.8)+text('HEADSET XR',145,697,35,800),u/.5)+reveal(laptop(850,515,.65)+text('BROWSER EXPERIENCE',712,688,31,800),(u-.2)/.5)+reveal(rect(1350,500,120,85,C.paper)+line(1375,528,1445,528)+line(1375,550,1425,550)+text(['INTERACTIVE','CANVAS ACTIVITY'],1340,648,33,800),(u-.4)/.5);
 if(i===5){const p=ease((u-.3)/1.2);return label(s.heading)+text(s.title,100,283,100,900,C.ink,1.03)+text(s.body,100,514,36)+text(s.points[0],100,607,38,700)+text('or',100,658,30)+text(s.points[1],100,723,38,700)+why(s)+`<g transform="translate(${lerp(1160,1210,p)} ${lerp(340,365,p)}) rotate(${lerp(-7,0,p)})">${rect(0,0,290,260,C.paper,'stroke="#161615" stroke-width="3"')}${text(p<.5?'COURSE IDEA':'CLASS ACTIVITY',23,47,24,700)}${line(25,79,260,79)}${line(25,114,240,114)}${line(25,144,210,144)}${reveal(text('✓ READY TO USE',25,223,25,800),p)}</g>`;}
 if(i===6)return label(s.heading)+text(s.title,100,280,86,900,C.ink,1.06)+s.points.map((p,j)=>text(p,135+(j%2)*870,580+Math.floor(j/2)*145,42,700)).join('')+text('A SHARED GOAL. MORE THAN ONE WAY TO GET THERE.',100,950,29,700);
}
export function renderFrame(seconds){const t=clamp(seconds,0,DURATION),idx=sceneAt(t),l=layoutAt(t);let current=idx,start=SCENES[idx].start;const u=(t-start)/1.25,fade=current?ease((u-.18)/.3):1;
 const shapes=['blue','yellow','red'].map(k=>{const[x,y,w,h,r]=l[k];return rect(x,y,w,h,C[k==='red'?'coral':k],`transform="rotate(${r} ${x+w/2} ${y+h/2})"`)}).join('');
 const[x,y,w,h]=l.person;
 const prior=idx-1;
 return `<defs><filter id="paper"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" stitchTiles="stitch" seed="8"/><feColorMatrix type="saturate" values="0"/></filter><clipPath id="frame"><rect width="1920" height="1080"/></clipPath></defs><g clip-path="url(#frame)">${rect(0,0,1920,1080,C.paper)}${shapes}<image href="assets/faculty.png" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>${current&&fade<1?`<g opacity="${1-ease(u/.18)}" transform="translate(0 ${-24*fade})">${content(prior,Math.min(t,start-.001))}</g>`:''}<g opacity="${fade}" transform="translate(0 ${24*(1-fade)})">${content(idx,t)}</g>${rect(0,0,1920,1080,'#000','filter="url(#paper)" opacity=".045" pointer-events="none"')}${line(100,72,1820,72,C.ink,1)}${text('XR / ADULT LEARNING',100,49,19,700)}${text(`${String(idx+1).padStart(2,'0')} / ${String(SCENES.length).padStart(2,'0')}`,1715,49,19,700)}</g>`;
}


