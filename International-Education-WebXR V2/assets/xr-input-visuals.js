import {Group} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {XRControllerModelFactory} from 'three/addons/webxr/XRControllerModelFactory.js';
import {XRHandModelFactory} from 'three/addons/webxr/XRHandModelFactory.js';

function disposeModel(root){const resources=new Set();root.traverse(o=>{if(o.geometry)resources.add(o.geometry);for(const material of (Array.isArray(o.material)?o.material:[o.material])){if(!material)continue;resources.add(material);for(const value of Object.values(material))if(value?.isTexture)resources.add(value)}});resources.forEach(r=>r.dispose())}
// A factory event proxy keeps reconnect listeners and late model loads scoped
// to one input-source lifetime, rather than accumulating on tracked XR groups.
export function createXRInputVisuals({renderer,rig}){
 const slots=[0,1].map(index=>{
  const ray=renderer.xr.getController(index),grip=renderer.xr.getControllerGrip(index),hand=renderer.xr.getHand(index);rig.add(grip,hand);let active=null;
  function clear(){if(!active)return;const old=active;active=null;old.live=false;old.model.removeFromParent();disposeModel(old.model);old.proxy.dispatchEvent({type:'disconnected',data:old.source});old.model.clear()}
  ray.addEventListener('connected',event=>{clear();const source=event.data;if(source.targetRayMode!=='tracked-pointer')return;if(!source.hand&&!source.gamepad)return;
   const current={source,live:true,proxy:new Group(),model:null};active=current;
   class SourceLoader extends GLTFLoader{load(url,onLoad,onProgress,onError){if(!current.live)return;return super.load(url,gltf=>{if(current.live)onLoad(gltf);else disposeModel(gltf.scene)},onProgress,error=>{if(current.live){console.warn('XR input model could not load:',url,error)}})}}
   const loader=new SourceLoader();if(source.hand){loader.setPath(new URL('./xr-profiles/generic-hand/',import.meta.url).href);current.proxy.joints=hand.joints;const factory=new XRHandModelFactory(loader);current.model=factory.createHandModel(current.proxy,'mesh');hand.add(current.model)}else{const factory=new XRControllerModelFactory(loader);factory.setPath(new URL('./xr-profiles',import.meta.url).href);current.model=factory.createControllerModel(current.proxy);grip.add(current.model)}
   current.model.visible=false;current.proxy.dispatchEvent({type:'connected',data:source});
  });ray.addEventListener('disconnected',clear);
  return {clear,update(){if(!active)return;const tracked=active.source.hand?hand.visible&&hand.joints.wrist?.visible:grip.visible;active.model.visible=renderer.xr.isPresenting&&!!tracked}};
 });
 renderer.xr.addEventListener('sessionend',()=>slots.forEach(s=>s.clear()));
 return {update(){slots.forEach(s=>s.update())}};
}
