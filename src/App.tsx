import React, { useState, useEffect, useRef } from 'react';
import { GameScene } from './game/GameScene';
import { BIRD_MODELS, BirdConfig } from './game/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './game/constants';
import { Leaderboard } from './components/Leaderboard';
import { submitScore } from './lib/supabase';
import { Trophy, Play, Rocket } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [selectedBird, setSelectedBird] = useState<BirdConfig>(BIRD_MODELS[0]);
  const [nickname, setNickname] = useState('PILOT_01');
  const [score, setScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameScene | null>(null);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
  };

  const handleGameOver = async (finalScore: number) => {
    setGameState('gameover');
    setScore(finalScore);
    if (finalScore > 0) {
      await submitScore(nickname, finalScore);
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && canvasRef.current) {
      gameRef.current = new GameScene(
        canvasRef.current,
        selectedBird,
        nickname,
        handleGameOver,
        (currentScore) => setScore(currentScore)
      );

      let animationFrame: number;
      const loop = (time: number) => {
        if (gameRef.current) {
          gameRef.current.update(time);
          gameRef.current.draw();
          animationFrame = requestAnimationFrame(loop);
        }
      };
      animationFrame = requestAnimationFrame(loop);

      return () => cancelAnimationFrame(animationFrame);
    }
  }, [gameState]);

  return (
    <div className="fixed inset-0 bg-[#171717] text-white flex items-center justify-center overflow-hidden font-sans selection:bg-[#9E7FFF]/30">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#9E7FFF]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative flex flex-col lg:flex-row gap-8 items-center justify-center w-full h-full p-4 max-w-7xl mx-auto">
        
        {/* Game Container with Responsive Scaling */}
        <div className="relative flex-shrink-0 group">
          <div className="relative border-4 border-[#2F2F2F] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black aspect-[2/3] h-[70vh] lg:h-[85vh] max-h-[800px]">
            <canvas 
              ref={canvasRef} 
              width={CANVAS_WIDTH} 
              height={CANVAS_HEIGHT}
              className={`w-full h-full object-contain transition-all duration-700 ${gameState !== 'playing' ? 'opacity-30 blur-sm scale-105' : 'opacity-100 blur-0 scale-100'}`}
            />

            {/* Menu Overlay */}
            {gameState === 'menu' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md p-6 z-10">
                <div className="mb-6 text-center">
                  <h1 className="text-5xl font-black italic tracking-tighter text-[#9E7FFF] drop-shadow-[0_0_15px_rgba(158,127,255,0.5)]">NEON WING</h1>
                  <p className="text-[#A3A3A3] text-[9px] tracking-[0.4em] uppercase mt-2">Neural Link Established</p>
                </div>
                
                <div className="grid grid-cols-1 gap-2 w-full max-w-[260px] mb-6">
                  {BIRD_MODELS.map(bird => (
                    <button
                      key={bird.id}
                      onClick={() => setSelectedBird(bird)}
                      className={`p-3 rounded-xl border-2 transition-all text-left group ${
                        selectedBird.id === bird.id 
                        ? 'border-[#9E7FFF] bg-[#9E7FFF]/10 shadow-[0_0_20px_rgba(158,127,255,0.1)]' 
                        : 'border-[#2F2F2F] hover:border-[#38bdf8]/50 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-bold text-[10px] tracking-wider ${selectedBird.id === bird.id ? 'text-[#9E7FFF]' : 'text-white'}`}>
                          {bird.name}
                        </span>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: bird.primaryColor }} />
                      </div>
                      <p className="text-[8px] text-[#A3A3A3] leading-tight uppercase tracking-tighter">{bird.description}</p>
                    </button>
                  ))}
                </div>

                <div className="w-full max-w-[260px] space-y-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={nickname}
                      maxLength={12}
                      onChange={(e) => setNickname(e.target.value.toUpperCase())}
                      className="bg-[#262626] border border-[#2F2F2F] rounded-xl p-3 w-full text-center font-mono text-xs text-[#38bdf8] focus:outline-none focus:border-[#38bdf8] transition-colors"
                      placeholder="ENTER CALLSIGN"
                    />
                    <div className="absolute -top-2 left-4 bg-[#171717] px-2 text-[7px] text-neutral-500 font-bold tracking-widest">PILOT_ID</div>
                  </div>

                  <button 
                    onClick={startGame}
                    className="w-full bg-[#9E7FFF] hover:bg-[#8A66FF] text-white font-black py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-[#9E7FFF]/20 flex items-center justify-center gap-3 group"
                  >
                    <Rocket size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    INITIATE FLIGHT
                  </button>
                </div>
              </div>
            )}

            {/* Game Over Overlay */}
            {gameState === 'gameover' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl z-10">
                <div className="text-center mb-10">
                  <h2 className="text-[10px] font-black text-[#ef4444] tracking-[0.5em] uppercase mb-4">Critical System Failure</h2>
                  <div className="text-7xl font-black text-white tracking-tighter">{score}</div>
                  <p className="text-neutral-500 text-[9px] mt-2 tracking-widest uppercase">Data Packets Recovered</p>
                </div>
                
                <div className="flex flex-col gap-3 w-full max-w-[220px]">
                  <button 
                    onClick={startGame}
                    className="bg-white text-black font-black py-4 rounded-xl hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Play size={14} fill="currentColor" />
                    RE-ENGAGE
                  </button>
                  <button 
                    onClick={() => setGameState('menu')}
                    className="bg-[#262626] text-white font-bold py-4 rounded-xl border border-[#2F2F2F] hover:bg-[#2F2F2F] transition-all text-sm"
                  >
                    RETURN TO HANGAR
                  </button>
                </div>
              </div>
            )}

            {/* HUD */}
            {gameState === 'playing' && (
              <div className="absolute top-12 left-0 right-0 text-center pointer-events-none select-none z-0">
                <div className="text-7xl font-black opacity-10 tracking-tighter">{score}</div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Leaderboard - Hidden on small mobile, shown on tablet/desktop */}
        <div className="hidden md:flex flex-col gap-6 w-full max-w-xs">
          <div className="bg-[#262626]/50 p-6 rounded-2xl border border-[#2F2F2F] backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#9E7FFF]/10 rounded-lg">
                <Trophy size={18} className="text-[#9E7FFF]" />
              </div>
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-widest">Global Rankings</h2>
                <p className="text-[8px] text-neutral-500 uppercase">Top Interceptors</p>
              </div>
            </div>
            <Leaderboard />
          </div>

          <div className="bg-[#262626]/30 p-4 rounded-xl border border-[#2F2F2F] text-[9px] text-neutral-500 uppercase tracking-[0.2em] leading-relaxed">
            <p className="mb-2 text-[#38bdf8] font-bold">Flight Manual:</p>
            <p>[SPACE] or [CLICK] to activate thrusters. Avoid structural pylons. Maintain neural sync.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
