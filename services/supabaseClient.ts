import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
    // Fail fast in dev to surface misconfiguration
    // eslint-disable-next-line no-console
    console.warn('Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
} else {
    // Debug: show masked URL to ensure envs are loaded (no keys printed)
    try {
        const u = new URL(supabaseUrl);
        // eslint-disable-next-line no-console
        console.log('[Supabase] Using URL host:', u.host);
    } catch (_e) {
        // eslint-disable-next-line no-console
        console.log('[Supabase] VITE_SUPABASE_URL present');
    }
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');


