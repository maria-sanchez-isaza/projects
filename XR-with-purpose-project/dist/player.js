import {SCENES,DURATION} from './content.js';
import {renderFrame,clamp,sceneAt} from './composition.js';
const $=id=>document.getElementById(id),svg=$('composition'),slider=$('timeline');
let time=0,playing=false,last=null,raf=null;
const format=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
slider.max=DURATION;
$('segments').innerHTML=SCENES.map((s,i)=>`<span style="flex:${s.end-s.start};background:${['#0789ed','#0789ed','#ffcf20','#f34b37','#ffcf20','#0789ed','#f34b37','#ffcf20'][i]}"></span>`).join('');
$('markers').innerHTML=SCENES.map((s,i)=>`<button data-scene="${i}" style="flex:${s.end-s.start}" aria-label="Seek to ${s.label}, ${s.start} seconds">${s.label}</button>`).join('');
$('transcript').innerHTML=SCENES.map(s=>`<article><small>${format(s.start)}–${format(s.end)}</small><h3>${s.heading}</h3>${s.label!=='Title'?`<h4>${s.title.join(' ')}</h4>`:''}<p>${s.body?.join(' ')||''}</p>${s.highlight?`<p><strong>${s.highlight.join(' ')}</strong></p>`:''}${s.points?`<ul>${s.points.map(p=>`<li>${p}</li>`).join('')}</ul>`:''}${s.why?`<p><strong>Why it works for adult learners:</strong> ${s.why.join(' ')}</p>`:''}${s.final?`<h4>${s.final.join(' ')}</h4>`:''}</article>`).join('');
function draw(){svg.innerHTML=renderFrame(time);slider.value=time;slider.setAttribute('aria-valuetext',`${time.toFixed(1)} seconds of ${DURATION} seconds; ${SCENES[sceneAt(time)].label}`);$('time').textContent=`${format(time)} / ${format(DURATION)}`;[...$('markers').children].forEach((e,i)=>{e.classList.toggle('active',i===sceneAt(time));e.setAttribute('aria-current',i===sceneAt(time)?'step':'false')});[...$('segments').children].forEach((e,i)=>e.classList.toggle('active',i<=sceneAt(time)));}
function setPlaying(value){playing=value&&time<DURATION;last=null;cancelAnimationFrame(raf);$('play-label').textContent=playing?'Pause':'Play';$('play-icon').textContent=playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',playing?'Pause animation':'Play animation');$('play').setAttribute('aria-pressed',String(playing));if(playing)raf=requestAnimationFrame(tick);}
function tick(now){if(!playing)return;if(last!==null)time=clamp(time+(now-last)/1000,0,DURATION);last=now;draw();if(time>=DURATION)setPlaying(false);else raf=requestAnimationFrame(tick);}
function seek(value){time=clamp(value,0,DURATION);last=null;if(time>=DURATION)setPlaying(false);draw();}
$('play').onclick=()=>setPlaying(!playing);
$('restart').onclick=()=>{seek(0);setPlaying(true)};
slider.addEventListener('input',e=>seek(Number(e.target.value)));
$('markers').addEventListener('click',e=>{const i=e.target.dataset.scene;if(i!==undefined)seek(SCENES[Number(i)].start)});
document.addEventListener('keydown',e=>{if(e.target===slider||/INPUT|TEXTAREA|BUTTON|SUMMARY/.test(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();setPlaying(!playing)}if(e.code==='ArrowRight'||e.code==='ArrowLeft'){e.preventDefault();seek(time+(e.code==='ArrowRight'?1:-1))}});
document.addEventListener('visibilitychange',()=>{last=null});
// Export interface: pause and set an exact timestamp/frame before capturing the SVG.
window.motion={seek,pause:()=>setPlaying(false),play:()=>setPlaying(true),renderFrame,get time(){return time},get playing(){return playing},duration:DURATION};
draw();
