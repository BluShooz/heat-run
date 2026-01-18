import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, RapierRigidBody, useRapier } from '@react-three/rapier';
import { Vector3, Quaternion, Euler, Group } from 'three';
import { useInputStore } from './Input';
import { useGameStore } from './store';
import { useControls } from 'leva';
import { playerPositionRef, playerVelocityRef } from './CameraController';

const WALKING_SPEED = 4;
const SPRINT_SPEED = 9; // Slower, heavier
const ACCELERATION = 15;
const DRAG = 8; // More drag for weight
const JUMP_FORCE = 5;
const ROTATION_SPEED = 8;

export function Player() {
    const rigidBodyRef = useRef<RapierRigidBody>(null);
    const playerMeshRef = useRef<Group>(null);
    const { rapier, world } = useRapier();
    const { gamePhase } = useGameStore();

    const { speedMulti, sprintMulti } = useControls('Player Physics', {
        speedMulti: { value: WALKING_SPEED, min: 1, max: 20 },
        sprintMulti: { value: SPRINT_SPEED, min: 5, max: 30 },
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
        const euler = new Euler(0, cam.rotation.y, 0);

        direction.subVectors(frontVector, sideVector).normalize();
        direction.applyEuler(euler);

        const targetSpeed = sprint ? sprintMulti : speedMulti;
        const moveForce = direction.clone().multiplyScalar(ACCELERATION);

        if (direction.length() > 0.1) {
            const horizontalVel = new Vector3(velocity.x, 0, velocity.z);
            if (horizontalVel.length() < targetSpeed) {
                rb.applyImpulse(moveForce.multiplyScalar(delta * rb.mass()), true);
            }

            if (playerMeshRef.current) {
                const targetRotation = Math.atan2(direction.x, direction.z);
                const currentRotation = playerMeshRef.current.rotation.y;
                let diff = targetRotation - currentRotation;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;

                playerMeshRef.current.rotation.y += diff * ROTATION_SPEED * delta;
            }

        } else {
            const damping = new Vector3(-velocity.x * DRAG * delta, 0, -velocity.z * DRAG * delta);
            rb.applyImpulse(damping.multiplyScalar(rb.mass()), true);
        }

        if (jump) {
            const rayOrigin = { x: position.x, y: position.y - 0.9, z: position.z };
            const rayDir = { x: 0, y: -1, z: 0 };
            const ray = new rapier.Ray(rayOrigin, rayDir);
            const hit = world.castRay(ray, 0.2, true);

            if (hit && hit.timeOfImpact < 0.2) {
                rb.applyImpulse({ x: 0, y: JUMP_FORCE * rb.mass(), z: 0 }, true);
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
                mass={1.2} // Heavier
                friction={1}
                restitution={0}
            >
                <CapsuleCollider args={[0.75, 0.4]} />

                <group ref={playerMeshRef} position={[0, -0.9, 0]}>
                    {/* Hoodie Character Proxy - Composite Geometry */}

                    {/* Body */}
                    <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
                        <cylinderGeometry args={[0.35, 0.3, 0.8]} />
                        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
                    </mesh>

                    {/* Head/Hood */}
                    <mesh castShadow receiveShadow position={[0, 1.3, 0]}>
                        <sphereGeometry args={[0.25]} />
                        <meshStandardMaterial color="#222" roughness={0.9} />
                    </mesh>

                    {/* Legs */}
                    <mesh position={[-0.15, 0.3, 0]} castShadow>
                        <capsuleGeometry args={[0.12, 0.6]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    <mesh position={[0.15, 0.3, 0]} castShadow>
                        <capsuleGeometry args={[0.12, 0.6]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                </group>
            </RigidBody>
        </group>
    );
}
