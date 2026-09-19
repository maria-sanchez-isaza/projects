import * as THREE from 'three';

// The model is rendered once to a linear HDR target. Glow uses three small
// screen-space passes, then the final pass applies tone mapping and grading.
export class ShowroomEffects {
  constructor(renderer) {
    this.renderer = renderer;
    this.settings = { bloom: .13, saturation: .92, contrast: .99 };
    this.sceneTarget = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType, samples: 4, depthBuffer: true, stencilBuffer: false,
    });
    this.sceneTarget.texture.colorSpace = THREE.LinearSRGBColorSpace;
    this.brightTarget = this.makeTarget();
    this.blurTarget = this.makeTarget();
    this.bloomTarget = this.makeTarget();

    const vertexShader = `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
    this.brightMaterial = new THREE.ShaderMaterial({
      vertexShader, toneMapped: false,
      uniforms: { source: { value: this.sceneTarget.texture }, threshold: { value: 1.25 } },
      fragmentShader: `varying vec2 vUv;
        uniform sampler2D source;
        uniform float threshold;
        void main() {
          vec3 c = texture2D(source, vUv).rgb;
          float l = dot(c, vec3(.2126, .7152, .0722));
          gl_FragColor = vec4(c * smoothstep(threshold, threshold + .7, l), 1.0);
        }`,
    });
    this.blurMaterial = new THREE.ShaderMaterial({
      vertexShader, toneMapped: false,
      uniforms: {
        source: { value: null },
        stepSize: { value: new THREE.Vector2() },
        direction: { value: new THREE.Vector2(1, 0) },
      },
      fragmentShader: `varying vec2 vUv;
        uniform sampler2D source;
        uniform vec2 stepSize, direction;
        void main() {
          vec2 d = stepSize * direction;
          vec3 c = texture2D(source, vUv).rgb * .227027;
          c += (texture2D(source, vUv + d).rgb + texture2D(source, vUv - d).rgb) * .316216;
          c += (texture2D(source, vUv + 2.0 * d).rgb + texture2D(source, vUv - 2.0 * d).rgb) * .070270;
          gl_FragColor = vec4(c, 1.0);
        }`,
    });
    this.outputMaterial = new THREE.ShaderMaterial({
      vertexShader,
      uniforms: {
        source: { value: this.sceneTarget.texture },
        glow: { value: this.bloomTarget.texture },
        bloom: { value: this.settings.bloom },
        saturation: { value: this.settings.saturation },
        contrast: { value: this.settings.contrast },
      },
      fragmentShader: `varying vec2 vUv;
        uniform sampler2D source, glow;
        uniform float bloom, saturation, contrast;
        void main() {
          vec3 c = texture2D(source, vUv).rgb + texture2D(glow, vUv).rgb * bloom;
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          float l = dot(gl_FragColor.rgb, vec3(.2126, .7152, .0722));
          gl_FragColor.rgb = clamp((mix(vec3(l), gl_FragColor.rgb, saturation) - .5) * contrast + .5, 0.0, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    this.quadScene = new THREE.Scene();
    this.quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.outputMaterial);
    this.quad.frustumCulled = false;
    this.quadScene.add(this.quad);
  }

  makeTarget() {
    return new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false });
  }

  resize() {
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    this.sceneTarget.setSize(size.x, size.y);
    const width = Math.max(1, Math.ceil(size.x / 2));
    const height = Math.max(1, Math.ceil(size.y / 2));
    for (const target of [this.brightTarget, this.blurTarget, this.bloomTarget]) target.setSize(width, height);
    this.blurMaterial.uniforms.stepSize.value.set(1 / width, 1 / height);
  }

  render(scene, camera) {
    const renderer = this.renderer;
    renderer.setRenderTarget(this.sceneTarget);
    renderer.render(scene, camera);
    if (this.settings.bloom > 0) {
      this.quad.material = this.brightMaterial;
      renderer.setRenderTarget(this.brightTarget);
      renderer.render(this.quadScene, this.quadCamera);

      this.quad.material = this.blurMaterial;
      this.blurMaterial.uniforms.source.value = this.brightTarget.texture;
      this.blurMaterial.uniforms.direction.value.set(1, 0);
      renderer.setRenderTarget(this.blurTarget);
      renderer.render(this.quadScene, this.quadCamera);

      this.blurMaterial.uniforms.source.value = this.blurTarget.texture;
      this.blurMaterial.uniforms.direction.value.set(0, 1);
      renderer.setRenderTarget(this.bloomTarget);
      renderer.render(this.quadScene, this.quadCamera);
    }
    this.quad.material = this.outputMaterial;
    renderer.setRenderTarget(null);
    renderer.render(this.quadScene, this.quadCamera);
  }
}
