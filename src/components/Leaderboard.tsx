import React, { useEffect, useState, useCallback } from 'react';
import { supabase, LeaderboardEntry, isSupabaseConfigured, checkApiHealth } from '../lib/supabase';
import { Users, RefreshCw, AlertCircle, Trophy } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const health = await checkApiHealth();
      if (!health.ok) {
        setError(health.message);
        setLoading(false);
        return;
      }

      const { data, error: supabaseError } = await supabase
        .from('leaderboard')
        .select('id, player_name, score, created_at')
        .order('score', { ascending: false })
        .limit(5);

      if (supabaseError) throw supabaseError;
      setScores(data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load rankings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  if (error) {
    return (
      <div className="w-full bg-red-500/10 rounded-xl border border-red-500/20 p-4 text-center">
        <AlertCircle size={20} className="mx-auto mb-2 text-red-500" />
        <p className="text-[10px] text-red-400 uppercase font-black tracking-tighter">Connection Error</p>
        <p className="text-[9px] text-neutral-500 mt-1">{error}</p>
        <button 
          onClick={() => fetchScores()}
          className="mt-3 text-[10px] bg-red-500/20 hover:bg-red-500/40 px-3 py-1 rounded-full transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#1a1a1a]/80 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-yellow-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Hall of Fame</h3>
        </div>
        {loading && <RefreshCw size={12} className="animate-spin text-neutral-600" />}
      </div>
      
      <div className="divide-y divide-white/5">
        {scores.length === 0 && !loading ? (
          <div className="p-8 text-center text-neutral-600 text-[10px] uppercase tracking-widest">
            No legends yet
          </div>
        ) : (
          scores.map((entry, index) => (
            <div key={entry.id} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black w-4 ${
                  index === 0 ? 'text-yellow-400' : 'text-neutral-600'
                }`}>
                  0{index + 1}
                </span>
                <span className="text-xs font-bold tracking-wider text-neutral-200">
                  {entry.player_name}
                </span>
              </div>
              <span className="text-xs font-black text-[#9E7FFF]">
                {entry.score.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
