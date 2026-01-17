'use client';

import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Physics } from '../game/Physics';
import { Player } from '../game/Player';
import { CameraController } from '../game/CameraController';
import { World } from '../game/World';
import { PoliceAI } from '../game/PoliceAI';
import { GameEffects } from '../game/PostProcessing';
import { Suspense, useEffect } from 'react';
import { initInputListeners } from '../game/Input';
import { Leva } from 'leva';

export default function GameCanvas() {
    useEffect(() => {
        const unsub = initInputListeners();
        return unsub;
    }, []);

    return (
        <div className="w-full h-full bg-black relative">
            <Leva hidden={false} />
            <Canvas shadows camera={{ position: [0, 5, 10], fov: 45 }}>
                <color attach="background" args={['#050510']} />
                <Suspense fallback={null}>
                    <Physics>
                        <ambientLight intensity={0.2} />
                        <directionalLight
                            position={[10, 20, 10]}
                            intensity={1.5}
                            castShadow
                            shadow-mapSize={[2048, 2048]}
                        />

                        <Player />
                        <CameraController />
                        <World />

                        <PoliceAI id={1} startPos={[10, 5, 10]} />
                        <PoliceAI id={2} startPos={[-10, 5, -10]} />

                        <GameEffects />

                        {/* Temporary markers */}
                        <mesh position={[5, 1, 5]} castShadow>
                            <boxGeometry args={[2, 2, 2]} />
                            <meshStandardMaterial color="red" />
                        </mesh>
                    </Physics>
                </Suspense>
            </Canvas>
            <Loader />
        </div>
    );
}
