import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface InputState {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    sprint: boolean;
    jump: boolean;
    crouch: boolean;
}

export const useInputStore = create(
    subscribeWithSelector<InputState>(() => ({
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false,
        jump: false,
        crouch: false,
    }))
);

// Map keys to actions
const keyMap: Record<string, keyof InputState> = {
    KeyW: 'forward',
    ArrowUp: 'forward',
    KeyS: 'backward',
    ArrowDown: 'backward',
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
    ShiftLeft: 'sprint',
    Space: 'jump',
    KeyC: 'crouch',
    ControlLeft: 'crouch',
};

export const initInputListeners = () => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
        const action = keyMap[e.code];
        if (action) {
            useInputStore.setState({ [action]: true });
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        const action = keyMap[e.code];
        if (action) {
            useInputStore.setState({ [action]: false });
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
};
