import { createClient } from '@supabase/supabase-js';

export const createSupabaseClient = (env) => {
    return createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
};
