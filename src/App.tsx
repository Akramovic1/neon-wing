import React, { useEffect, useRef, useState } from 'react';
import { GameScene } from './game/GameScene';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './game/constants';
import { Trophy, Play, RotateCcw, Zap, User, ChevronRight, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Leaderboard } from './components/Leaderboard';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { BIRD_MODELS } from './game/types';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('highScore')) || 0);
  const [playerName, setPlayerName] = useState('');
  const [selectedBirdIndex, setSelectedBirdIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const gameRef = useRef<GameScene | null>(null);

  const currentBird = BIRD_MODELS[selectedBirdIndex];

  // Optimized Submission: Only save if it's a new personal best for this pilot
  const autoSubmitScore = async (finalScore: number) => {
    const pilotName = playerName.trim().toUpperCase();
    if (!pilotName || !isSupabaseConfigured || finalScore <= 0) return;

    setIsSubmitting(true);
    setSubmitError(false);
    
    try {
      // 1. Check for existing record for this pilot
      const { data: existing } = await supabase
        .from('leaderboard')
        .select('score')
        .eq('player_name', pilotName)
        .single();

      if (existing) {
        // 2. Only update if the new score is higher
        if (finalScore > existing.score) {
          const { error } = await supabase
            .from('leaderboard')
            .update({ score: finalScore })
            .eq('player_name', pilotName);
          if (error) throw error;
        }
      } else {
        // 3. Create new record if pilot doesn't exist
        const { error } = await supabase
          .from('leaderboard')
          .insert([{ player_name: pilotName, score: finalScore }]);
        if (error) throw error;
      }
    } catch (err) {
      console.error("Auto-submission failed:", err);
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startGame = () => {
    if (!canvasRef.current) return;
    setScore(0);
    setSubmitError(false);
    setIsSubmitting(false);
    setGameState('PLAYING');
    
    gameRef.current = new GameScene(
      canvasRef.current,
      currentBird,
      playerName,
      (finalScore) => {
        setGameState('GAMEOVER');
        if (finalScore > highScore) {
          setHighScore(finalScore);
          localStorage.setItem('highScore', finalScore.toString());
        }
        autoSubmitScore(finalScore);
      },
      (newScore) => setScore(newScore)
    );
  };

  const nextBird = () => setSelectedBirdIndex((prev) => (prev + 1) % BIRD_MODELS.length);
  const prevBird = () => setSelectedBirdIndex((prev) => (prev - 1 + BIRD_MODELS.length) % BIRD_MODELS.length);

  useEffect(() => {
    let animationFrameId: number;
    const render = (time: number) => {
      if (gameState === 'PLAYING' && gameRef.current) {
        gameRef.current.update(time);
        gameRef.current.draw();
      }
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center font-sans text-white p-4">
      <div className="flex flex-col lg:flex-row gap-8 items-start max-w-6xl w-full justify-center">
        
        <div className="relative group mx-auto lg:mx-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#9E7FFF] to-[#38bdf8] rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          
          <div className="relative bg-[#171717] rounded-xl overflow-hidden border border-[#2F2F2F] shadow-2xl">
            {gameState === 'PLAYING' && (
              <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none z-10">
                <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                  <span className="text-3xl font-black tracking-tighter text-[#9E7FFF]">{score}</span>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="block" />

            {gameState === 'MENU' && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-6">
                  <Zap size={48} className="text-[#9E7FFF] mb-2 mx-auto" />
                  <h1 className="text-4xl font-black tracking-tighter italic">NEON<span className="text-[#38bdf8]">WING</span></h1>
                </div>

                <div className="w-full max-w-xs mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={prevBird} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <ChevronLeft />
                    </button>
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-1">Select Unit</div>
                      <div className="text-xl font-black italic" style={{ color: currentBird.primaryColor }}>
                        {currentBird.name}
                      </div>
                    </div>
                    <button onClick={nextBird} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <ChevronRight />
                    </button>
                  </div>
                  
                  <div className="bg-[#262626] p-4 rounded-xl border border-[#2F2F2F] mb-4">
                    <p className="text-xs text-neutral-400 leading-relaxed">{currentBird.description}</p>
                  </div>

                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="PILOT NICKNAME"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value.toUpperCase().slice(0, 12))}
                      className="w-full bg-[#171717] border border-[#2F2F2F] rounded-xl py-3 pl-12 pr-4 text-sm font-bold tracking-widest focus:outline-none focus:border-[#9E7FFF] transition-colors"
                    />
                  </div>
                </div>

                <button 
                  onClick={startGame} 
                  disabled={!playerName.trim()}
                  className="group relative px-12 py-4 bg-[#9E7FFF] disabled:opacity-50 disabled:grayscale rounded-full font-bold text-lg flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Play fill="currentColor" /> INITIATE FLIGHT
                </button>
              </div>
            )}

            {gameState === 'GAMEOVER' && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
                <h2 className="text-4xl font-black text-red-500 mb-2 italic">CRASHED</h2>
                
                <div className="bg-[#262626] w-full rounded-2xl p-6 border border-[#2F2F2F] mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-neutral-400 uppercase text-xs tracking-widest">Score</span>
                    <span className="text-2xl font-bold">{score}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[#f472b6]">
                      <Trophy size={16} />
                      <span className="uppercase text-xs tracking-widest">Best</span>
                    </div>
                    <span className="text-2xl font-bold text-[#f472b6]">{highScore}</span>
                  </div>
                </div>

                <div className="mb-8 flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-[#38bdf8]" />
                      <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">Syncing Data...</span>
                    </>
                  ) : submitError ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase">Sync Failed</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Data Secured</span>
                    </>
                  )}
                </div>

                <button onClick={startGame} className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors">
                  <RotateCcw size={20} /> REBOOT SYSTEM
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-[#171717] p-6 rounded-2xl border border-[#2F2F2F]">
            <h2 className="text-xl font-black italic mb-4 flex items-center gap-2">
              <Trophy className="text-[#f472b6]" /> HALL OF FAME
            </h2>
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
