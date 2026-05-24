'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import type { Mesh } from 'three';

function Orb({
  position,
  scale,
  speed,
  color,
  wireframe = false,
}: {
  position: [number, number, number];
  scale: number;
  speed: number;
  color: string;
  wireframe?: boolean;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed * 0.3;
  });

  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[scale, wireframe ? 1 : 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={wireframe ? 0.6 : 0.2}
          roughness={wireframe ? 1 : 0.15}
          metalness={wireframe ? 0 : 0.9}
          wireframe={wireframe}
          transparent
          opacity={wireframe ? 0.55 : 0.85}
        />
      </mesh>
    </Float>
  );
}

function Torus({ position, speed }: { position: [number, number, number]; speed: number }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * speed * 0.2;
    ref.current.rotation.z += delta * speed * 0.15;
  });
  return (
    <Float speed={speed * 0.8} floatIntensity={0.8}>
      <mesh ref={ref} position={position}>
        <torusGeometry args={[0.6, 0.08, 16, 60]} />
        <meshStandardMaterial color="#0EA5FF" emissive="#0EA5FF" emissiveIntensity={0.5} transparent opacity={0.35} />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[6, 6, 4]} intensity={2} color="#0EA5FF" />
      <pointLight position={[-6, -4, 3]} intensity={1} color="#7C3AED" />
      <pointLight position={[0, -6, 6]} intensity={0.5} color="#22C55E" />

      {/* Main feature orb — large wireframe */}
      <Orb position={[3.5, 3.0, -2]} scale={1.6} speed={1.2} color="#0EA5FF" wireframe />

      {/* Solid metallic orbs */}
      <Orb position={[-3.2, 0.3, -1]} scale={0.7} speed={1.8} color="#7C3AED" />
      <Orb position={[1.2, -0.9, -3]} scale={0.5} speed={2.1} color="#22C55E" />
      <Orb position={[-1.8, 4.3, -4]} scale={1.1} speed={1.1} color="#0EA5FF" wireframe />
      <Orb position={[4.5, -1.0, -5]} scale={0.4} speed={2.5} color="#F59E0B" />

      {/* Torus rings */}
      <Torus position={[-4, 3.5, -3]} speed={1.3} />
      <Torus position={[2.5, -2.0, -4]} speed={0.9} />
    </>
  );
}

export function ThreeScene({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, -2, 9], fov: 52 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
