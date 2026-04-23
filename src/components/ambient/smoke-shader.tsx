"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";
import { useReducedMotion, useSaveData } from "@/lib/hooks";

/**
 * Volumetric-looking smoke plane rendered via a fragment shader with
 * 3D simplex noise drift. Full-viewport, drifts right-to-left at 0.04 speed,
 * opacity 0.4–0.7, never obscures hero copy (the hero composes this
 * behind z-10 content with a vignette over the top).
 *
 * a11y:
 *   · canvas is aria-hidden + tabIndex=-1 (decorative)
 *   · mount guarded by prefers-reduced-motion + prefers-reduced-data
 *   · webglcontextlost → swap to static SVG fallback
 */
const FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // --- simplex noise (Ashima Arts / WebGL-noise), compressed ---
  vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
  vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);
    const vec4 D=vec4(0.,.5,1.,2.);
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;
    vec3 x2=x0-i2+C.yyy;
    vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
    float n_=.142857142857;
    vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);
    vec4 y_=floor(j-7.*x_);
    vec4 x=x_*ns.x+ns.yyyy;
    vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);
    vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.+1.;
    vec4 s1=floor(b1)*2.+1.;
    vec4 sh=-step(h,vec4(0.));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
    m=m*m;
    return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  float fbm(vec3 p){
    float v=0.;
    float a=.5;
    for(int i=0;i<5;i++){
      v += a * snoise(p);
      p *= 2.02;
      a *= .5;
    }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    // right-to-left drift: shift noise origin with time
    vec3 p = vec3(uv * vec2(2.2, 1.4), uTime * 0.04);
    p.x += uTime * 0.03;        // slow horizontal advection
    float n = fbm(p);
    // squash + soft contrast
    float smoke = smoothstep(0.0, 0.9, n * 0.55 + 0.4);
    smoke *= smoothstep(0.0, 0.35, uv.y) * smoothstep(1.0, 0.5, uv.y); // vertical fade
    vec3 col = mix(vec3(0.055, 0.043, 0.036), vec3(0.784, 0.537, 0.247), smoke * 0.7);
    // opacity between ~0.4 and ~0.7
    float alpha = smoothstep(0.15, 0.9, smoke) * 0.62;
    gl_FragColor = vec4(col, alpha);
  }
`;

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function SmokePlane() {
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function SvgSmokeFallback() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
    >
      <defs>
        <radialGradient id="smoke-fb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(233,221,198,0.22)" />
          <stop offset="60%" stopColor="rgba(200,137,63,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <circle cx="280" cy="540" r="220" fill="url(#smoke-fb)">
        <animate attributeName="cy" values="540;460;540" dur="14s" repeatCount="indefinite" />
      </circle>
      <circle cx="900" cy="320" r="280" fill="url(#smoke-fb)">
        <animate attributeName="cy" values="320;380;320" dur="18s" repeatCount="indefinite" />
      </circle>
      <circle cx="600" cy="700" r="200" fill="url(#smoke-fb)">
        <animate attributeName="cy" values="700;630;700" dur="16s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export function SmokeShader() {
  // WebGL context loss is one-shot; everything else is derived from MQ/Save-Data.
  // SSR snapshot is `false` for both, so first server render = "shader" mode,
  // matching the typical client. The SvgSmokeFallback always paints behind so
  // there is no flash even if the client downgrades on first paint.
  const [glLost, setGlLost] = useState(false);
  const reducedMotion = useReducedMotion();
  const saveData = useSaveData();
  const mode: "shader" | "fallback" =
    glLost || reducedMotion || saveData ? "fallback" : "shader";

  if (mode === "fallback") {
    return <SvgSmokeFallback />;
  }

  return (
    <>
      <Canvas
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0"
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            setGlLost(true);
          });
        }}
      >
        <SmokePlane />
      </Canvas>
      {/* Keep the SVG behind as a safety net — cheap and invisible when shader paints */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <SvgSmokeFallback />
      </div>
    </>
  );
}
