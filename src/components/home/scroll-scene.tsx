"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import * as THREE from "three";
import { BrassDivider } from "@/components/primitives/brass-divider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * Sticky 3D scroll section.
 *   - Outer wrapper is 300vh (scroll distance)
 *   - Inner wrapper is sticky top-0 h-screen (pinned while parent scrolls)
 *   - Canvas fills the pinned wrapper
 *   - Scroll progress drives camera Z + object rotation via a shared ref
 *     so the 3D scene feels like it's advancing through depth
 *
 * a11y:
 *   · Canvas is aria-hidden + tabIndex=-1
 *   · Real content (headline + body copy) is rendered in DOM above the
 *     canvas in a plain flex layout so keyboard/SR users never depend on
 *     the 3D experience
 *   · prefers-reduced-motion: canvas unmounts, static final state renders
 *   · webglcontextlost: canvas swaps to CSS-only placeholder
 */

type ProgressRef = { value: number };

function Ring({ progress }: { progress: ProgressRef }) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const innerRef = useRef<THREE.Mesh | null>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Base idle rotation
      meshRef.current.rotation.y += delta * 0.12;
      // Scroll-driven Z translation + tilt
      const p = progress.value;
      meshRef.current.position.z = -1.5 + p * 3.5;
      meshRef.current.rotation.x = -0.35 + p * 0.9;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.18;
      innerRef.current.rotation.z += delta * 0.06;
      const p = progress.value;
      innerRef.current.position.z = -2.5 + p * 2.0;
      innerRef.current.scale.setScalar(0.7 + p * 0.5);
    }
    // Pulse light intensity with scroll
    const light = state.scene.getObjectByName("amber-key") as THREE.PointLight | null;
    if (light) {
      light.intensity = 3 + Math.sin(state.clock.elapsedTime * 0.7) * 0.6 + progress.value * 2;
    }
  });

  return (
    <>
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
        <mesh ref={meshRef}>
          <torusGeometry args={[1.05, 0.09, 28, 140]} />
          <meshStandardMaterial
            color="#C8893F"
            metalness={0.95}
            roughness={0.2}
            emissive="#8B3A1F"
            emissiveIntensity={0.08}
          />
        </mesh>
      </Float>
      <Float speed={0.9} rotationIntensity={0.4} floatIntensity={0.4}>
        <mesh ref={innerRef}>
          <torusGeometry args={[0.55, 0.05, 20, 100]} />
          <meshStandardMaterial
            color="#E0A358"
            metalness={0.9}
            roughness={0.3}
            emissive="#C8893F"
            emissiveIntensity={0.12}
          />
        </mesh>
      </Float>
    </>
  );
}

function Scene({ progress }: { progress: ProgressRef }) {
  return (
    <>
      <color attach="background" args={["#0E0B09"]} />
      <fog attach="fog" args={["#0E0B09", 2, 7]} />
      <ambientLight intensity={0.15} />
      <pointLight name="amber-key" position={[2, 1.5, 1.5]} intensity={4} color="#E0A358" />
      <pointLight position={[-1.5, -1, 2]} intensity={2} color="#8B3A1F" />
      <Ring progress={progress} />
      <Environment preset="studio" background={false} />
    </>
  );
}

export function ScrollScene() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const canvasHolderRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<ProgressRef>({ value: 0 });
  const [mode, setMode] = useState<"3d" | "fallback" | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
    const saveData = conn?.saveData ?? false;
    setMode(reducedMotion || saveData ? "fallback" : "3d");
  }, []);

  useGSAP(
    () => {
      if (mode !== "3d") return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const trigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            progressRef.current.value = self.progress;
          },
        });
        return () => {
          trigger.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [mode] },
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="scroll-scene-title"
      className="relative bg-[var(--color-bg-primary)]"
      style={{ height: "300vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div ref={canvasHolderRef} className="absolute inset-0">
          {mode === "3d" ? (
            <Canvas
              aria-hidden="true"
              tabIndex={-1}
              camera={{ position: [0, 0, 3.2], fov: 38 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
              onCreated={({ gl }) => {
                gl.domElement.addEventListener("webglcontextlost", (e) => {
                  e.preventDefault();
                  setMode("fallback");
                });
              }}
            >
              <Scene progress={progressRef.current} />
            </Canvas>
          ) : (
            <div aria-hidden="true" className="absolute inset-0 hero-bg-fallback" />
          )}
          {/* Edge vignette to keep copy readable */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(80% 55% at 50% 50%, transparent 30%, rgba(14,11,9,0.5) 70%, rgba(14,11,9,0.9) 100%)",
            }}
          />
        </div>

        {/* Foreground copy — always in the DOM, readable without 3D */}
        <div className="relative z-10 h-full w-full flex items-center">
          <div className="container mx-auto max-w-5xl px-6 grid md:grid-cols-[1fr_1.1fr] gap-10 items-center">
            <div className="hidden md:block" />
            <div className="max-w-xl">
              <p className="font-[family-name:var(--font-inter)] uppercase tracking-[0.45em] text-[0.82rem] text-[var(--color-accent-amber)]">
                The trade, in depth
              </p>
              <BrassDivider className="mt-5 max-w-[80px] opacity-70" />
              <h2
                id="scroll-scene-title"
                className="mt-6 font-[family-name:var(--font-fraunces)] text-[3.2rem] md:text-[4.4rem] leading-[0.95] tracking-[-0.025em] text-[var(--color-text-primary)]"
                style={{ fontVariationSettings: '"opsz" 144' }}
              >
                Each order, a{" "}
                <span className="italic font-[family-name:var(--font-cormorant)] text-[var(--color-accent-amber)]">
                  single loop.
                </span>
              </h2>
              <p className="mt-7 font-[family-name:var(--font-cormorant)] text-[1.35rem] leading-[1.65] text-[var(--color-text-primary)]/80 max-w-[52ch]">
                From the first click to the knock at your door, one brass
                ring closes. We don&rsquo;t re-route, re-sell or re-bill.
                The driver leaves; the ring is cast again for the next
                name on the counter.
              </p>
              <p className="mt-4 font-[family-name:var(--font-inter)] text-[1.05rem] text-[var(--color-text-muted)] max-w-[52ch]">
                Scroll to watch the loop draw.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
