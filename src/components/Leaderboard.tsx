import React, { useEffect, useState, useCallback } from 'react';
import { supabase, LeaderboardEntry, isSupabaseConfigured, testConnection } from '../lib/supabase';
import { Users, RefreshCw, WifiOff, AlertTriangle } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [isKeyInvalid, setIsKeyInvalid] = useState(false);

  const fetchScores = useCallback(async (silent = false) => {
    if (!isSupabaseConfigured) return;
    
    if (!silent) setLoading(true);
    setError(null);

    try {
      // First, test if the key is even valid
      const isOk = await testConnection();
      if (!isOk) {
        setIsKeyInvalid(true);
        throw new Error("Invalid API Key (401)");
      }

      const { data, error: supabaseError } = await supabase
        .from('leaderboard')
        .select('id, player_name, score, created_at')
        .order('score', { ascending: false })
        .limit(8);

      if (supabaseError) throw supabaseError;
      setScores(data || []);
      setIsKeyInvalid(false);
    } catch (e: any) {
      console.error("Leaderboard fetch failed", e);
      if (!silent) setError(e.message || "Connection failed");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  if (isKeyInvalid) {
    return (
      <div className="w-full bg-red-500/10 rounded-2xl border border-red-500/50 p-6 text-center">
        <AlertTriangle size={24} className="mx-auto mb-3 text-red-500" />
        <p className="text-xs text-red-400 uppercase tracking-widest font-black mb-2">Auth Error 401</p>
        <p className="text-[10px] text-neutral-400">The Supabase Anon Key is invalid or expired. Please check your .env file.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#1a1a1a] rounded-2xl border border-[#2F2F2F] overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-[#2F2F2F] flex items-center justify-between bg-[#262626]">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#38bdf8]" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Global Rankings</h3>
        </div>
        <button onClick={() => fetchScores()} className="text-neutral-500 hover:text-white transition-colors">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      
      <div className="divide-y divide-[#2F2F2F] min-h-[200px]">
        {loading && scores.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-neutral-500 animate-pulse">
            <RefreshCw size={24} className="animate-spin mb-2 opacity-20" />
            <span className="text-[10px] uppercase tracking-tighter">Syncing...</span>
          </div>
        ) : scores.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-neutral-600">
            <span className="text-[10px] uppercase tracking-widest">No scores yet</span>
          </div>
        ) : (
          scores.map((entry, index) => (
            <div key={entry.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <span className={`w-4 text-xs font-black ${
                  index === 0 ? 'text-yellow-400' : 
                  index === 1 ? 'text-neutral-300' : 
                  index === 2 ? 'text-orange-400' : 'text-neutral-500'
                }`}>
                  {index + 1}
                </span>
                <span className="font-bold text-xs tracking-wider truncate max-w-[120px] group-hover:text-[#38bdf8] transition-colors">
                  {entry.player_name}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-[#9E7FFF]">{entry.score.toLocaleString()}</span>
                <span className="text-[8px] text-neutral-600 uppercase font-bold">Points</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
