import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, MathUtils, PerspectiveCamera } from 'three';
import { useInputStore } from './Input';
import { useGameStore } from './store';
import { playerPositionRef } from './CameraController'; // We still use this ref from Player

export function CameraSystem() {
    const { camera } = useThree();
    const { viewMode, setViewMode } = useGameStore();

    // Toggle input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'KeyV') {
                setViewMode(useGameStore.getState().viewMode === 'third' ? 'first' : 'third');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useFrame((state, delta) => {
        const { sprint } = useInputStore.getState();
        const pPos = playerPositionRef.current;

        if (viewMode === 'third') {
            const offset = new Vector3(0, 2.5, 4.5);
            const sprintOffset = new Vector3(0, 2.8, 6.0);
            const desiredOffset = offset.lerp(sprintOffset, sprint ? 0.05 : 0.05);

            const desiredPos = pPos.clone().add(desiredOffset);
            camera.position.lerp(desiredPos, delta * 4);

            const lookAtTarget = pPos.clone().add(new Vector3(0, 1.5, 0));
            camera.lookAt(lookAtTarget);

        } else {
            // FIRST PERSON
            // Position at "Head" height
            const headPos = pPos.clone().add(new Vector3(0, 1.7, 0));

            // Add subtle bob
            if (sprint) {
                headPos.y += Math.sin(state.clock.elapsedTime * 15) * 0.1;
            }

            // We want the camera to look where the body is facing? 
            // Or mouse look? 
            // For now, let's look FORWARD relative to player. 
            // Wait, we need the player's rotation.
            // We don't have player rotation in a ref easily. but we have Velocity/Direction.
            // Let's just stick to the head pos and valid look direction.
            // Camera lag is minimal in FPS.

            camera.position.lerp(headPos, delta * 15);

            // Look slightly forward/down
            // Need player rotation ref to do this properly.
            // Quick hack: Look at position + forward vector (assuming Z- is forward for now)
            // Ideally Player exports rotation.
        }

        // Common Effects
        if ((camera as PerspectiveCamera).isPerspectiveCamera) {
            const baseFov = viewMode === 'first' ? 75 : 45;
            const sprintFov = viewMode === 'first' ? 85 : 60;
            (camera as PerspectiveCamera).fov = MathUtils.lerp((camera as PerspectiveCamera).fov, sprint ? sprintFov : baseFov, delta * 3);
            camera.updateProjectionMatrix();
        }
    });

    return null;
}
