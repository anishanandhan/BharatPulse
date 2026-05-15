import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Text, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface PlayerProps {
  targetPosition: [number, number, number];
  color: string;
  label?: string;
}

function Player({ targetPosition, color, label }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(...targetPosition));
  const targetPosVec = useMemo(() => new THREE.Vector3(...targetPosition), [targetPosition]);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth movement using lerp
      currentPos.current.lerp(targetPosVec, delta * 5);
      groupRef.current.position.copy(currentPos.current);
    }
    if (meshRef.current) {
      // Hover animation
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2 + targetPosition[0]) * 0.1 + 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={2} 
          toneMapped={false} 
        />
      </mesh>
      {label && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
      <pointLight color={color} intensity={0.5} distance={2} />
    </group>
  );
}

function Pitch() {
  const pitchWidth = 20;
  const pitchHeight = 14;
  
  const points = useMemo(() => {
    const p = [];
    p.push(new THREE.Vector3(-pitchWidth/2, 0.01, -pitchHeight/2));
    p.push(new THREE.Vector3(pitchWidth/2, 0.01, -pitchHeight/2));
    p.push(new THREE.Vector3(pitchWidth/2, 0.01, pitchHeight/2));
    p.push(new THREE.Vector3(-pitchWidth/2, 0.01, pitchHeight/2));
    p.push(new THREE.Vector3(-pitchWidth/2, 0.01, -pitchHeight/2));
    p.push(new THREE.Vector3(0, 0.01, -pitchHeight/2));
    p.push(new THREE.Vector3(0, 0.01, pitchHeight/2));
    return p;
  }, []);

  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[pitchWidth + 4, pitchHeight + 4]} />
        <meshStandardMaterial color="#020617" roughness={1} metalness={0.1} />
      </mesh>
      
      <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.1, transparent: true }))} />
      
      <gridHelper args={[30, 30, 0x1e3a8a, 0x0f172a]} position={[0, -0.02, 0]} />
    </group>
  );
}

interface TacticalMap3DProps {
  intensity: number;
}

export function TacticalMap3D({ intensity }: TacticalMap3DProps) {
  const [homeFormation, setHomeFormation] = useState<'4-4-2' | '4-3-3' | '3-5-2'>('4-4-2');
  const [awayFormation, setAwayFormation] = useState<'4-4-2' | '4-3-3' | '3-5-2'>('4-4-2');
  const [isReplaying, setIsReplaying] = useState(false);
  const [ballPos, setBallPos] = useState<[number, number, number]>([1, 0.3, 2]);
  
  const homeColor = "#3b82f6";
  const awayColor = "#f8fafc";

  const getPositions = (team: 'home' | 'away', formation: '4-4-2' | '4-3-3' | '3-5-2'): [number, number, number][] => {
    // Shared logic, flipping x coordinate for away team
    const flip = team === 'away' ? -1 : 1;
    
    // Base positions (home team), easy to adjust
    if (formation === '4-4-2') return [
      [-8 * flip, 0, 0], 
      [-5 * flip, 0, -3], [-5 * flip, 0, -1], [-5 * flip, 0, 1], [-5 * flip, 0, 3],
      [-2 * flip, 0, -3], [-2 * flip, 0, -1], [-2 * flip, 0, 1], [-2 * flip, 0, 3],
      [2 * flip, 0, -1], [2 * flip, 0, 1]
    ];
    if (formation === '4-3-3') return [
      [-8 * flip, 0, 0], 
      [-5 * flip, 0, -3], [-5 * flip, 0, -1], [-5 * flip, 0, 1], [-5 * flip, 0, 3],
      [-1 * flip, 0, -2], [-1 * flip, 0, 0], [-1 * flip, 0, 2],
      [3 * flip, 0, -2], [3 * flip, 0, 0], [3 * flip, 0, 2]
    ];
    // 3-5-2
    return [
      [-8 * flip, 0, 0],
      [-4 * flip, 0, -3], [-4 * flip, 0, 0], [-4 * flip, 0, 3],
      [-1 * flip, 0, -4], [-1 * flip, 0, -2], [-1 * flip, 0, 0], [-1 * flip, 0, 2], [-1 * flip, 0, 4],
      [3 * flip, 0, -1], [3 * flip, 0, 1]
    ];
  };

  const cycleFormation = (current: '4-4-2' | '4-3-3' | '3-5-2'): '4-4-2' | '4-3-3' | '3-5-2' => {
      if (current === '4-4-2') return '4-3-3';
      if (current === '4-3-3') return '3-5-2';
      return '4-4-2';
  };

  const handleReplay = () => {
    setIsReplaying(true);
    setBallPos([8, 0.3, 0]);
    setTimeout(() => {
      setBallPos([1, 0.3, 2]);
      setIsReplaying(false);
    }, 3000);
  };

  return (
    <div className="relative aspect-[4/3] bg-black border border-white/10 rounded-sm overflow-hidden stark-card" id="tactical-map-3d">
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 15, 10]} fov={40} />
        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2.2} 
          minDistance={10}
          maxDistance={30}
        />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
        
        <Environment preset="city" />

        <group rotation={[0, -Math.PI / 2, 0]}>
          <Pitch />
          
          {getPositions('home', homeFormation).map((pos, i) => (
            <Player 
              key={`h-${i}`} 
              targetPosition={pos} 
              color={homeColor} 
              label={i === 0 ? "GK" : i === 5 ? "CAP" : undefined} 
            />
          ))}
          
          {getPositions('away', awayFormation).map((pos, i) => (
            <Player 
              key={`a-${i}`} 
              targetPosition={pos} 
              color={awayColor} 
            />
          ))}
          
          <Ball position={ballPos} isReplaying={isReplaying} />

          {isReplaying && (
            <Float speed={5} rotationIntensity={0} floatIntensity={0.5}>
              <mesh position={[4, 0.2, 1]} rotation={[Math.PI/2, 0, -Math.PI/4]}>
                <ringGeometry args={[0.5, 0.6, 3, 1, 0, Math.PI]} />
                <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} side={THREE.DoubleSide} />
              </mesh>
            </Float>
          )}
        </group>
        <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={30} blur={2.5} far={4.5} />
      </Canvas>
      
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-40">
        <div className="flex items-center gap-2 bg-black/80 px-3 py-1 border border-white/10 backdrop-blur-md">
           <div className={`w-1.5 h-1.5 rounded-full ${isReplaying ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
           <span className="text-[10px] mono-meta font-black uppercase italic tracking-widest text-white">
             {isReplaying ? 'AI_RECONSTRUCTING_REPLAY' : 'TACTICAL_SYNC_OK'}
           </span>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 border border-blue-500/20 backdrop-blur-md">
           <span className="text-[8px] mono-meta text-blue-400 font-bold uppercase tracking-widest">Home: {homeFormation} | Away: {awayFormation}</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 flex gap-2 z-40 pointer-events-auto">
         <button 
           onClick={handleReplay}
           disabled={isReplaying}
           className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-blue-500 hover:border-blue-500 transition-all group"
         >
            <div className="flex items-center gap-2">
               <Radio className={`w-3 h-3 ${isReplaying ? 'animate-spin text-blue-300' : ''} text-white`} />
               <span className="text-[10px] font-black uppercase italic tracking-widest text-white">AI Replay</span>
            </div>
         </button>
         <button 
           onClick={() => setHomeFormation(cycleFormation(homeFormation))}
           className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/20 transition-all"
         >
            <span className="text-[10px] font-black uppercase italic tracking-widest text-white/50">Morph Home</span>
         </button>
         <button 
           onClick={() => setAwayFormation(cycleFormation(awayFormation))}
           className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/20 transition-all"
         >
            <span className="text-[10px] font-black uppercase italic tracking-widest text-white/50">Morph Away</span>
         </button>
      </div>
      
      <div className="absolute bottom-4 right-4 z-40 pointer-events-none">
        <div className="bg-black/90 px-4 py-2 border border-blue-500/40 flex items-center gap-3">
           <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
           <div className="flex flex-col">
              <span className="text-[10px] font-black italic uppercase leading-none text-white">BharatTactics v3.0</span>
              <span className="text-[7px] mono-meta opacity-40 text-white/50">SPATIAL_AWARENESS_ACTIVE</span>
           </div>
        </div>
      </div>
    </div>
  );
}

function Ball({ position, isReplaying }: { position: [number, number, number], isReplaying: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const currentPos = useRef(new THREE.Vector3(...position));
  const targetPosVec = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((state, delta) => {
    if (ref.current) {
      currentPos.current.lerp(targetPosVec, delta * (isReplaying ? 2 : 5));
      ref.current.position.copy(currentPos.current);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={4} />
      <pointLight color="#facc15" intensity={1} distance={3} />
    </mesh>
  );
}

import { Zap, Radio } from 'lucide-react';
