import GameCanvas from '@/components/GameCanvas';

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-black text-white">
      <GameCanvas />

      {/* UI Overlay Layer */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-8 z-10 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic opacity-80">Heat Run</h1>
            <p className="text-xs opacity-50 font-mono">Build 0.0.1</p>
          </div>
          <div className="text-right">
            <span className="bg-red-600 text-black px-2 py-1 font-bold text-xs">LIVE</span>
          </div>
        </div>
      </div>
    </main>
  );
}
