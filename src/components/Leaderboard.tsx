import React, { useEffect, useState, useCallback } from 'react';
import { supabase, LeaderboardEntry, isSupabaseConfigured, checkApiHealth } from '../lib/supabase';
import { RefreshCw, AlertCircle, Trophy } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError("Supabase configuration missing");
      setLoading(false);
      return;
    }

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
        .limit(8);

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
    
    // Real-time updates
    const channel = supabase
      .channel('leaderboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, () => {
        fetchScores();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchScores]);

  if (error) {
    return (
      <div className="w-full bg-red-500/5 rounded-xl border border-red-500/20 p-4 text-center">
        <AlertCircle size={16} className="mx-auto mb-2 text-red-500" />
        <p className="text-[9px] text-red-400 uppercase font-black tracking-tighter">Sync Error</p>
        <button 
          onClick={() => fetchScores()}
          className="mt-2 text-[8px] bg-red-500/20 hover:bg-red-500/40 px-3 py-1 rounded-full transition-all uppercase font-bold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#1a1a1a]/40 rounded-xl border border-white/5 overflow-hidden">
      <div className="divide-y divide-white/5">
        {loading && scores.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={16} className="animate-spin text-[#9E7FFF]" />
            <span className="text-[8px] text-neutral-500 uppercase tracking-widest">Syncing Data...</span>
          </div>
        ) : scores.length === 0 ? (
          <div className="p-8 text-center text-neutral-600 text-[9px] uppercase tracking-widest">
            No legends yet
          </div>
        ) : (
          scores.map((entry, index) => (
            <div key={entry.id} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-3">
                <span className={`text-[9px] font-black w-4 ${
                  index === 0 ? 'text-yellow-400' : index === 1 ? 'text-neutral-300' : index === 2 ? 'text-amber-600' : 'text-neutral-600'
                }`}>
                  {index + 1}
                </span>
                <span className="text-[10px] font-bold tracking-wider text-neutral-300 group-hover:text-white transition-colors">
                  {entry.player_name}
                </span>
              </div>
              <span className="text-[10px] font-black text-[#9E7FFF] tabular-nums">
                {entry.score.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
