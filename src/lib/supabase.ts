import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Restore the missing export required by Leaderboard.tsx
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}

export const checkApiHealth = async () => {
  try {
    if (!isSupabaseConfigured) return { ok: false, message: "Missing Config" };
    const { error } = await supabase.from('leaderboard').select('count', { count: 'exact', head: true });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Connected" };
  } catch (e) {
    return { ok: false, message: "Network Error" };
  }
};

export const submitScore = async (playerName: string, score: number) => {
  const cleanName = playerName.trim().toUpperCase();
  if (!cleanName) throw new Error("Name required");

  const { data, error } = await supabase
    .from('leaderboard')
    .upsert(
      { 
        player_name: cleanName, 
        score: score, 
        updated_at: new Date().toISOString() 
      },
      { onConflict: 'player_name' }
    )
    .select();

  if (error) {
    console.error("Supabase Sync Error:", error);
    throw error;
  }
  return data;
};
