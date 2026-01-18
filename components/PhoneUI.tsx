'use client';

import { useState, useEffect } from 'react';
import { useInputStore } from '../game/Input';
import { useGameStore } from '../game/store';

export default function PhoneUI() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeApp, setActiveApp] = useState<'home' | 'messages' | 'map'>('home');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Tab' || e.code === 'KeyP') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="absolute bottom-8 right-8 w-64 h-[500px] bg-black border-4 border-stone-800 rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col font-sans z-50">
            {/* Screen */}
            <div className="flex-1 bg-stone-900 text-white p-4 relative">
                {/* Status Bar */}
                <div className="flex justify-between text-xs text-stone-400 mb-4">
                    <span>11:42 PM</span>
                    <span>5G</span>
                </div>

                {activeApp === 'home' && (
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <button onClick={() => setActiveApp('messages')} className="flex flex-col items-center gap-1 active:scale-95 transition">
                            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                                💬
                            </div>
                            <span className="text-[10px]">Messages</span>
                        </button>
                        <button onClick={() => setActiveApp('map')} className="flex flex-col items-center gap-1 active:scale-95 transition">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                                🗺️
                            </div>
                            <span className="text-[10px]">Maps</span>
                        </button>
                    </div>
                )}

                {activeApp === 'messages' && (
                    <div className="h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-4 border-b border-stone-800 pb-2 cursor-pointer" onClick={() => setActiveApp('home')}>
                            <span className="text-stone-400">←</span>
                            <h2 className="font-bold">Messages</h2>
                        </div>
                        <div className="space-y-3 overflow-y-auto">
                            <div className="bg-stone-800 p-2 rounded-lg text-xs">
                                <p className="font-bold text-red-400">Unknown</p>
                                <p className="text-stone-300">They know you're in the district. Keep your head down.</p>
                            </div>
                            <div className="bg-stone-800 p-2 rounded-lg text-xs">
                                <p className="font-bold text-stone-200">Contact</p>
                                <p className="text-stone-300">Meet me at the plaza under the yellow light.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeApp === 'map' && (
                    <div className="h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-4 border-b border-stone-800 pb-2 cursor-pointer" onClick={() => setActiveApp('home')}>
                            <span className="text-stone-400">←</span>
                            <h2 className="font-bold">CityMap</h2>
                        </div>
                        <div className="flex-1 bg-stone-800 rounded flex items-center justify-center text-xs text-stone-500">
                            [Offline Mode]
                        </div>
                    </div>
                )}
            </div>

            {/* Home Bar */}
            <div className="h-8 bg-black flex justify-center items-center">
                <div className="w-20 h-1 bg-stone-700 rounded-full cursor-pointer" onClick={() => setActiveApp('home')}></div>
            </div>
        </div>
    );
}
