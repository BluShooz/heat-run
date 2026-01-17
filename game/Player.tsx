import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, RapierRigidBody, useRapier } from '@react-three/rapier';
import { Vector3, Quaternion, Euler, Group } from 'three';
import { useInputStore } from './Input';
import { useGameStore } from './store';
import { useControls } from 'leva';
import { playerPositionRef, playerVelocityRef } from './CameraController';

const WALKING_SPEED = 5;
const SPRINT_SPEED = 12;
const ACCELERATION = 20; // Force multiplier
const DRAG = 5; // Damping
const JUMP_FORCE = 6;
const VAULT_FORCE = 8;
const ROTATION_SPEED = 10;

export function Player() {
    const rigidBodyRef = useRef<RapierRigidBody>(null);
    const playerMeshRef = useRef<Group>(null);
    const { rapier, world } = useRapier();
    const { setHeat, increaseHeat } = useGameStore();

    // Controls for tweaking feel
    const { speedMulti, sprintMulti, jumpForce } = useControls('Player Physics', {
        speedMulti: { value: WALKING_SPEED, min: 1, max: 20 },
        sprintMulti: { value: SPRINT_SPEED, min: 5, max: 30 },
        jumpForce: { value: JUMP_FORCE, min: 1, max: 20 },
    });

    useFrame((state, delta) => {
        const rb = rigidBodyRef.current;
        if (!rb) return;

        const { forward, backward, left, right, sprint, jump } = useInputStore.getState();
        const velocity = rb.linvel();
        const position = rb.translation();

        // -- MOVEMENT --
        const direction = new Vector3();
        const frontVector = new Vector3(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));
        const sideVector = new Vector3((left ? 1 : 0) - (right ? 1 : 0), 0, 0);

        const cam = state.camera;
        // Rotate direction to match camera heading
        const euler = new Euler(0, cam.rotation.y, 0);

        // Correct way:
        // Move vector relative to camera
        direction.subVectors(frontVector, sideVector).normalize();
        direction.applyEuler(euler);

        const targetSpeed = sprint ? sprintMulti : speedMulti;
        const moveForce = direction.clone().multiplyScalar(ACCELERATION);

        // Apply force only if moving, else apply drag to stop
        if (direction.length() > 0.1) {
            // Limit max horizontal velocity manually to avoid infinite acceleration
            const horizontalVel = new Vector3(velocity.x, 0, velocity.z);
            if (horizontalVel.length() < targetSpeed) {
                rb.applyImpulse(moveForce.multiplyScalar(delta * rb.mass()), true);
            }

            // Rotate character to face movement direction
            if (playerMeshRef.current) {
                const targetRotation = Math.atan2(direction.x, direction.z);
                const currentRotation = playerMeshRef.current.rotation.y;
                let diff = targetRotation - currentRotation;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;

                playerMeshRef.current.rotation.y += diff * ROTATION_SPEED * delta;
            }

            if (sprint) {
                increaseHeat(0.05 * delta);
            }

        } else {
            const damping = new Vector3(-velocity.x * DRAG * delta, 0, -velocity.z * DRAG * delta);
            rb.applyImpulse(damping.multiplyScalar(rb.mass()), true);
        }

        // -- JUMP --
        if (jump) {
            const rayOrigin = { x: position.x, y: position.y - 0.9, z: position.z };
            const rayDir = { x: 0, y: -1, z: 0 };
            const ray = new rapier.Ray(rayOrigin, rayDir);
            const hit = world.castRay(ray, 0.2, true);

            if (hit && hit.timeOfImpact < 0.2) {
                rb.applyImpulse({ x: 0, y: jumpForce * rb.mass(), z: 0 }, true);
            }
        }

        // Update global refs for camera
        if (rb) {
            playerPositionRef.current.copy(rb.translation());
            playerVelocityRef.current.copy(rb.linvel());
        }
    });

    return (
        <group>
            <RigidBody
                ref={rigidBodyRef}
                colliders={false}
                enabledRotations={[false, false, false]}
                position={[0, 5, 0]}
                mass={1}
                friction={1}
                restitution={0}
            >
                <CapsuleCollider args={[0.75, 0.4]} />

                <group ref={playerMeshRef} position={[0, -0.2, 0]}>
                    <mesh castShadow receiveShadow position={[0, 0, 0]}>
                        <capsuleGeometry args={[0.4, 1.5, 4, 8]} />
                        <meshStandardMaterial color="#222" roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 0.5, 0.35]}>
                        <boxGeometry args={[0.3, 0.1, 0.2]} />
                        <meshStandardMaterial color="#0ff" emissive="#0ff" emissiveIntensity={2} />
                    </mesh>
                </group>
            </RigidBody>
        </group>
    );
}
