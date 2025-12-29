import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}

export const checkApiHealth = async () => {
  if (!isSupabaseConfigured) return { ok: false, message: "Config Missing" };
  try {
    const { error } = await supabase.from('leaderboard').select('count', { count: 'exact', head: true });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Connected" };
  } catch (e: any) {
    return { ok: false, message: "Network Error" };
  }
};

export const submitScore = async (playerName: string, score: number) => {
  if (!isSupabaseConfigured) return;

  const cleanName = playerName.trim().toUpperCase();
  if (!cleanName || score <= 0) return;

  try {
    // First, check if the player already has a higher score
    const { data: existing } = await supabase
      .from('leaderboard')
      .select('score')
      .eq('player_name', cleanName)
      .maybeSingle();

    if (existing && existing.score >= score) {
      console.log("New score is not higher than existing.");
      return;
    }

    // Use upsert which requires INSERT and UPDATE permissions
    const { error } = await supabase
      .from('leaderboard')
      .upsert(
        { 
          player_name: cleanName, 
          score: score, 
          updated_at: new Date().toISOString() 
        },
        { onConflict: 'player_name' }
      );

    if (error) {
      console.error("Supabase Error:", error.message);
      // Fallback: Try a simple insert if upsert fails due to policy complexity
      if (error.code === '42501') {
        console.warn("Permission denied. Ensure RLS policies are applied in Supabase dashboard.");
      }
    }
  } catch (error) {
    console.error("Submission failed:", error);
  }
};
