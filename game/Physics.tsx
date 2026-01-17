import { Physics as RapierPhysics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { useControls } from 'leva';
import { ReactNode } from 'react';

interface PhysicsProps {
    children: ReactNode;
}

export function Physics({ children }: PhysicsProps) {
    const { debug } = useControls('Physics', {
        debug: false,
    });

    return (
        <RapierPhysics debug= { debug } gravity = { [0, -9.81, 0]} timeStep = "vary" >
            { children }
            </RapierPhysics>
  );
}
