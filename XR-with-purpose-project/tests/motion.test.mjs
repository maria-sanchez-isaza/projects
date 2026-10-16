import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SCENES,DURATION} from '../dist/content.js';
import {renderFrame,sceneAt} from '../dist/composition.js';
test('seven contiguous scenes span exactly 65 seconds',()=>{assert.equal(SCENES.length,7);assert.equal(SCENES[0].start,0);SCENES.forEach((s,i)=>assert.equal(s.end,SCENES[i+1]?.start??DURATION));});
test('forward and reverse scrubbing produce identical frames',()=>{const times=Array.from({length:DURATION*30+1},(_,i)=>i/30);const frames=times.map(renderFrame);times.reverse().forEach(t=>{assert.equal(renderFrame(t),frames[Math.round(t*30)]);assert.ok(!/NaN|undefined/.test(renderFrame(t)));});});
test('exact boundaries and end frame are stable',()=>{SCENES.forEach((s,i)=>assert.equal(sceneAt(s.start),i));assert.equal(renderFrame(100),renderFrame(DURATION));assert.equal(renderFrame(-1),renderFrame(0));assert.match(renderFrame(DURATION),/SUPPORTING DIGITAL LITERACY/);});
test('required assignment content is represented',()=>{assert.match(renderFrame(2),/without requiring them to become XR developers/);assert.match(renderFrame(10),/INTENDED AUDIENCE/);assert.match(renderFrame(20),/BACKWARD DESIGN/);[28,39,50].forEach((t,i)=>{assert.match(renderFrame(t),new RegExp('ADULT LEARNING STRATEGY '+(i+1)));assert.match(renderFrame(t),/WHY IT WORKS FOR ADULT LEARNERS/);});assert.match(renderFrame(60),/Accessible alternatives/);});
test('transport pauses, scrubs both ways, restarts, and never loops',async()=>{
 const elements=new Map();const make=id=>({value:0,textContent:'',dataset:{},children:[],classList:{toggle(){}},setAttribute(){},addEventListener(k,f){this[k]=f},set innerHTML(v){this.html=v},get innerHTML(){return this.html}});
 globalThis.document={getElementById:id=>{if(!elements.has(id))elements.set(id,make(id));return elements.get(id)},addEventListener(){}};globalThis.window={};let cb;globalThis.requestAnimationFrame=f=>{cb=f;return 1};globalThis.cancelAnimationFrame=()=>{cb=null};
 await import('../dist/player.js');const m=window.motion;
 elements.get('play').onclick();cb(0);cb(2000);assert.equal(m.time,2);elements.get('play').onclick();assert.equal(m.playing,false);assert.equal(cb,null);
 elements.get('timeline').input({target:{value:'33'}});assert.equal(m.time,33);elements.get('timeline').input({target:{value:'7'}});assert.equal(m.time,7);
 elements.get('restart').onclick();assert.equal(m.time,0);assert.equal(m.playing,true);cb(0);cb(71000);assert.equal(m.time,DURATION);assert.equal(m.playing,false);assert.equal(cb,null);elements.get('play').onclick();assert.equal(m.time,DURATION);assert.equal(m.playing,false);
});

