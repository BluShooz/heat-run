import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CuboidCollider, useRapier } from '@react-three/rapier';
import { Vector3, Quaternion, Euler, Group } from 'three';
import { playerPositionRef, playerVelocityRef } from './CameraController';
import { useGameStore } from './store';

type AIState = 'PATROL' | 'ALERT' | 'CHASE' | 'SEARCH';

const PATROL_SPEED = 3;
const CHASE_SPEED = 9;
const ALERT_SPEED = 0;
const VISION_DISTANCE = 15;
const VISION_ANGLE = Math.PI / 3; // 60 degrees

// Simple patrol points
const PATROL_POINTS = [
    new Vector3(10, 0, 10),
    new Vector3(-10, 0, 10),
    new Vector3(-10, 0, -10),
    new Vector3(10, 0, -10),
];

export function PoliceAI({ id, startPos }: { id: number, startPos: [number, number, number] }) {
    const rigidBodyRef = useRef<RapierRigidBody>(null);
    const meshRef = useRef<Group>(null);
    const { world, rapier } = useRapier(); // rapier instance
    const { increaseHeat, setSpotted } = useGameStore();

    const [aiState, setAiState] = useState<AIState>('PATROL');
    const [targetPoint, setTargetPoint] = useState<Vector3>(PATROL_POINTS[0]);
    const currentPointIndex = useRef(0);
    const detectionTime = useRef(0);
    const lastSpottedPos = useRef<Vector3 | null>(null);

    useFrame((state, delta) => {
        const rb = rigidBodyRef.current;
        if (!rb) return;

        const pos = rb.translation();
        const currentPos = new Vector3(pos.x, pos.y, pos.z);
        const playerPos = playerPositionRef.current;

        // -- SENSORS --
        const toPlayer = playerPos.clone().sub(currentPos);
        const distToPlayer = toPlayer.length();

        // Vision Check
        let canSeePlayer = false;
        if (distToPlayer < VISION_DISTANCE) {
            // Angle check
            const forward = new Vector3(0, 0, 1).applyQuaternion(meshRef.current?.quaternion || new Quaternion());
            const angle = forward.angleTo(toPlayer.clone().normalize());

            if (angle < VISION_ANGLE / 2) {
                // Raycast check (Line of Sight)
                const rayOrigin = { x: currentPos.x, y: currentPos.y + 1, z: currentPos.z };
                const rayDir = toPlayer.clone().normalize();

                // use rapier.Ray
                const ray = new rapier.Ray(rayOrigin, rayDir);

                // Cast ray, max dist = distToPlayer
                const hit = world.castRay(ray, distToPlayer + 1, true);

                if (!hit || hit.timeOfImpact >= distToPlayer - 1) {
                    canSeePlayer = true;
                }
            }
        }

        // -- STATE MACHINE --

        switch (aiState) {
            case 'PATROL':
                if (canSeePlayer) {
                    setAiState('CHASE');
                    setSpotted(true);
                }
                // Move to waypoint
                const toPoint = targetPoint.clone().sub(currentPos);
                toPoint.y = 0;
                if (toPoint.length() < 1) {
                    // Next point
                    currentPointIndex.current = (currentPointIndex.current + 1) % PATROL_POINTS.length;
                    setTargetPoint(PATROL_POINTS[currentPointIndex.current]);
                }
                moveTowards(rb, targetPoint, PATROL_SPEED, delta);
                break;

            case 'CHASE':
                if (canSeePlayer) {
                    lastSpottedPos.current = playerPos.clone();
                    moveTowards(rb, playerPos, CHASE_SPEED, delta);
                    increaseHeat(10 * delta); // Rapid heat increase

                    // Rotation to face player
                    lookAt(meshRef.current, playerPos);

                } else {
                    setAiState('SEARCH');
                    setSpotted(false);
                }
                break;

            case 'SEARCH':
                if (canSeePlayer) {
                    setAiState('CHASE');
                    setSpotted(true);
                } else if (lastSpottedPos.current) {
                    moveTowards(rb, lastSpottedPos.current, CHASE_SPEED * 0.5, delta);
                    if (currentPos.distanceTo(lastSpottedPos.current) < 2) {
                        lastSpottedPos.current = null;
                        setAiState('PATROL');
                    }
                } else {
                    setAiState('PATROL');
                }
                break;
        }
    });

    // Helper functions
    const moveTowards = (rb: RapierRigidBody, target: Vector3, speed: number, delta: number) => {
        const currentPos = rb.translation();
        const dir = new Vector3(target.x - currentPos.x, 0, target.z - currentPos.z).normalize();

        const vel = new Vector3(dir.x * speed, rb.linvel().y, dir.z * speed);
        rb.setLinvel(vel, true);

        if (speed > 0.1) {
            lookAt(meshRef.current, target);
        }
    };

    const lookAt = (obj: Group | null, target: Vector3) => {
        if (!obj) return;
        obj.lookAt(target.x, obj.position.y, target.z);
    }

    return (
        <RigidBody
            ref={rigidBodyRef}
            position={startPos}
            lockRotations
            type="dynamic"
            colliders={false}
        >
            <CuboidCollider args={[0.5, 1, 0.5]} />
            <group ref={meshRef}>
                {/* Visuals */}
                <mesh position={[0, 0, 0]} castShadow>
                    <boxGeometry args={[0.8, 1.8, 0.5]} />
                    <meshStandardMaterial color={aiState === 'CHASE' ? 'red' : 'blue'} />
                </mesh>
                {/* Vision Cone Debug */}
                {aiState !== 'ALERT' && (
                    <mesh position={[0, 1.5, 2]} rotation={[Math.PI / 2, 0, 0]}>
                        <coneGeometry args={[2, 4, 32, 1, true]} />
                        <meshBasicMaterial color="yellow" wireframe transparent opacity={0.2} />
                    </mesh>
                )}
            </group>
        </RigidBody>
    );
}
