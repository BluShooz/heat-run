import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Environment, Stars, Cloud, Instance, Instances, Sparkles } from '@react-three/drei';
import { Color, MeshStandardMaterial, Vector3 } from 'three';
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
            <Environment preset="night" blur={0.8} background />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {/* Rain Particles - Simple Sparkles for now, can upgrade to InstancedMesh for lines */}
            <Sparkles
                count={5000}
                scale={[100, 40, 100]}
                size={4}
                speed={4}
                opacity={0.4}
                color="#aaa"
                position={[0, 20, 0]}
            />

            {/* Ground - Wet Asphalt */}
            <RigidBody type="fixed" colliders={false} friction={1} restitution={0}>
                <CuboidCollider args={[100, 1, 100]} position={[0, -1, 0]} />
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
                    <planeGeometry args={[200, 200, 256, 256]} />
                    <meshStandardMaterial
                        ref={asphaltRef}
                        color="#111"
                        roughness={0.9}
                        metalness={0.2}
                        onBeforeCompile={AsphaltShader.onBeforeCompile}
                    />
                </mesh>
            </RigidBody>

            {/* Street Lights */}
            {[-20, 0, 20].map((z) => (
                <group key={z} position={[10, 5, z]}>
                    <spotLight
                        color="#ffaa00"
                        intensity={20}
                        distance={30}
                        angle={0.6}
                        penumbra={0.5}
                        castShadow
                        shadow-bias={-0.0001}
                    />
                    <mesh position={[0, 0.5, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, 6]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    {/* Volumetric Fake (Cone) */}
                    <mesh position={[0, -3, 0]} rotation={[0, 0, 0]}>
                        <coneGeometry args={[3, 10, 32, 1, true]} />
                        <meshBasicMaterial color="#ffaa00" transparent opacity={0.03} depthWrite={false} />
                    </mesh>
                </group>
            ))}

            {/* City Blocks */}
            <RigidBody type="fixed">
                <CuboidCollider args={[5, 5, 20]} position={[-15, 5, 0]} />
                <mesh position={[-15, 5, 0]} castShadow receiveShadow>
                    <boxGeometry args={[10, 10, 40]} />
                    <meshStandardMaterial color="#222" />
                </mesh>

                <CuboidCollider args={[5, 10, 10]} position={[20, 10, 10]} />
                <mesh position={[20, 10, 10]} castShadow receiveShadow>
                    <boxGeometry args={[10, 20, 20]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
            </RigidBody>
        </group>
    );
}
