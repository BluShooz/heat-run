import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Environment, Cloud, Sparkles } from '@react-three/drei';
import { Color, MeshStandardMaterial, Vector3, FogExp2 } from 'three';
import { AsphaltShader } from './Shaders/WetAsphalt';

export function World() {
    const asphaltRef = useRef<MeshStandardMaterial>(null);

    useFrame((state) => {
        if (asphaltRef.current && (asphaltRef.current as any).userData?.shader) {
            (asphaltRef.current as any).userData.shader.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <group>
            {/* Atmosphere: Overcast city night */}
            {/* We use a dark color for fog to blend distant objects */}
            <color attach="background" args={['#050505']} />
            <fogExp2 attach="fog" args={['#050505', 0.03]} />

            {/* Lighting: HDR + Dull Ambient */}
            {/* Low saturation environment */}
            <Environment preset="city" blur={1} background={false} />
            <ambientLight intensity={0.1} color="#445566" />

            {/* Rain - Heavier, more noticeable */}
            <Sparkles
                count={8000}
                scale={[100, 40, 100]}
                size={3}
                speed={5}
                opacity={0.2}
                color="#ccc"
                position={[0, 20, 0]}
            />

            {/* Ground - Wet Asphalt */}
            <RigidBody type="fixed" colliders={false} friction={1} restitution={0}>
                <CuboidCollider args={[100, 1, 100]} position={[0, -1, 0]} />
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
                    <planeGeometry args={[200, 200, 256, 256]} />
                    <meshStandardMaterial
                        ref={asphaltRef}
                        color="#0a0a0a"
                        roughness={0.9}
                        metalness={0.4}
                        onBeforeCompile={AsphaltShader.onBeforeCompile}
                    />
                </mesh>
            </RigidBody>

            {/* Street Lights - Fewer, more dramatic */}
            {[-40, -10, 20, 50].map((z) => (
                <group key={z} position={[15, 6, z]}>
                    <spotLight
                        color="#ffeebb"
                        intensity={15}
                        distance={40}
                        angle={0.5}
                        penumbra={1}
                        castShadow
                        shadow-bias={-0.0001}
                    />
                    <mesh position={[0, 0.5, 0]}>
                        <cylinderGeometry args={[0.15, 0.15, 7]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    {/* Volumetric Haze around light */}
                    <mesh position={[0, -2, 0]}>
                        <sphereGeometry args={[4, 16, 16]} />
                        <meshBasicMaterial color="#ffeebb" transparent opacity={0.02} depthWrite={false} />
                    </mesh>
                </group>
            ))}

            {/* City Blocks - Brutalist Concrete */}
            <RigidBody type="fixed">
                {/* Left Buildings */}
                <CuboidCollider args={[10, 20, 100]} position={[-25, 20, 0]} />
                <mesh position={[-25, 20, 0]} castShadow receiveShadow>
                    <boxGeometry args={[20, 40, 200]} />
                    <meshStandardMaterial color="#222" roughness={0.8} />
                </mesh>

                {/* Right Buildings */}
                <CuboidCollider args={[10, 20, 100]} position={[35, 20, 0]} />
                <mesh position={[35, 20, 0]} castShadow receiveShadow>
                    <boxGeometry args={[20, 40, 200]} />
                    <meshStandardMaterial color="#222" roughness={0.8} />
                </mesh>

                {/* Obstacles */}
                <CuboidCollider args={[1, 1, 1]} position={[0, 1, 15]} />
                <mesh position={[0, 1, 15]} castShadow receiveShadow>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial color="#333" roughness={0.5} />
                </mesh>

                <CuboidCollider args={[2, 1.5, 0.5]} position={[-5, 1.5, -10]} />
                <mesh position={[-5, 1.5, -10]} castShadow receiveShadow>
                    <boxGeometry args={[4, 3, 1]} />
                    <meshStandardMaterial color="#444" roughness={0.9} />
                </mesh>
            </RigidBody>
        </group>
    );
}
