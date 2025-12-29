import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase Environment Variables");
}

// Initialize client with explicit headers and no session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'x-application-name': 'neon-wing'
    }
  }
});

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}

/**
 * Direct Connection Test
 * This bypasses the SDK to see if the API Key is accepted by the REST endpoint
 */
export const testConnection = async () => {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/leaderboard?select=*&limit=1`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    if (response.status === 401) {
      console.error("CRITICAL: The API Key (Anon Key) is being REJECTED by Supabase (401). Please verify the key in Supabase Dashboard > Settings > API.");
      return false;
    }
    console.log("Supabase Connection Test: Success", response.status);
    return true;
  } catch (e) {
    console.error("Connection test failed", e);
    return false;
  }
};

export const submitScore = async (playerName: string, score: number) => {
  const cleanName = playerName.trim().toUpperCase();
  const { data, error } = await supabase
    .from('leaderboard')
    .upsert(
      { player_name: cleanName, score: score, updated_at: new Date().toISOString() },
      { onConflict: 'player_name' }
    )
    .select();

  if (error) throw error;
  return data;
};
