import GameCanvas from '@/components/GameCanvas';
import PhoneUI from '@/components/PhoneUI';

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-black relative">
      <GameCanvas />
      <PhoneUI />

      {/* Introduction Fade / Cinematic Overlay if needed */}
      <div className="absolute top-8 left-8 pointer-events-none opacity-50 mix-blend-overlay">
        <h1 className="text-2xl font-bold tracking-widest uppercase font-mono">DIRTY MONEY</h1>
        <p className="text-xs tracking-[0.2em] uppercase">Cut Off</p>
      </div>
    </main>
  );
}
