import { useRef, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, MathUtils, PerspectiveCamera } from 'three';
import { useInputStore } from './Input';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';

export const playerPositionRef = { current: new Vector3() };
export const playerVelocityRef = { current: new Vector3() };

export function CameraController() {
    const { camera } = useThree();
    const targetPos = useRef(new Vector3());
    const cameraPos = useRef(new Vector3());

    useFrame((state, delta) => {
        const { sprint } = useInputStore.getState();

        // Standard offset (Behind player)
        const offset = new Vector3(0, 2.5, 4.5);
        const sprintOffset = new Vector3(0, 2.8, 6.0);

        // Ideally we rotate offset based on Camera Angle? No, based on Player Direction? 
        // Standard TPS: Camera rotates around player based on mouse (Orbit).
        // Game Design: "Cinematic shoulder camera".
        // For now, let's keep the offset relative to World Z to verify system is working, then improve to follow Player Rotation or Mouse.

        const currentOffset = offset.clone().lerp(sprintOffset, sprint ? 0.05 : 0.05);

        // Dynamic FOV
        const baseFov = 45;
        const sprintFov = 60;

        if ((camera as PerspectiveCamera).isPerspectiveCamera) {
            (camera as PerspectiveCamera).fov = MathUtils.lerp((camera as PerspectiveCamera).fov, sprint ? sprintFov : baseFov, delta * 3);
            camera.updateProjectionMatrix();
        }

        const pPos = playerPositionRef.current;
        const desiredPos = pPos.clone().add(currentOffset);

        // Smooth damp
        camera.position.lerp(desiredPos, delta * 4);

        // Look at player offset
        const lookAtTarget = pPos.clone().add(new Vector3(0, 1.5, 0));
        camera.lookAt(lookAtTarget);

        // Noise
        if (sprint) {
            const time = state.clock.elapsedTime;
            camera.position.x += Math.sin(time * 20) * 0.02;
            camera.position.y += Math.cos(time * 15) * 0.02;
        }
    });

    return null;
}
