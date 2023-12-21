import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
// import { OutputPass } from 'three/examples/jsm/postprocessing/outputPass'

const params = {
  threshold: 1,
  strength: 1, // 强度
  radius: 0.84, // 半径
  exposure: 1.55 // 扩散
}
export const createEffectComposer = (
  scene: THREE.Scene,
  camera: THREE.OrthographicCamera,
  renderer: THREE.WebGLRenderer,
  width: number,
  height: number
) => {
  // 创建合成器
  const effectComposer = new EffectComposer(renderer)
  // 渲染器通道，将场景全部加入渲染器
  const renderPass = new RenderPass(scene, camera)
  effectComposer.addPass(renderPass)
  // 添加虚幻发光通道
  const unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85)
  unrealBloomPass.threshold = params.threshold
  unrealBloomPass.strength = params.strength
  unrealBloomPass.radius = params.radius
  unrealBloomPass.renderToScreen = false
  // 辉光合成器
  const glowComposer = new EffectComposer(renderer)
  glowComposer.renderToScreen = false
  glowComposer.addPass(new RenderPass(scene, camera))
  glowComposer.addPass(unrealBloomPass)

  // 着色器通道
  const shaderPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: glowComposer.renderTarget2.texture },
        tDiffuse: {
          value: null
        }
      },
      // 顶点着色器
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      // 片元着色器
      fragmentShader: `
        uniform sampler2D baseTexture;
        uniform sampler2D bloomTexture;
        varying vec2 vUv;
        void main() {
          tgl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
        }`,
      defines: {}
    }),
    'baseTexture'
  )
  shaderPass.renderToScreen = true
  shaderPass.needsSwap = true

  effectComposer.addPass(shaderPass)

  return {
    glowComposer,
    effectComposer
  }
}
