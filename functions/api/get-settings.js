
import { createSupabaseClient } from '../utils/supabase';

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    const supabase = createSupabaseClient(env);
    let query = supabase.from('settings').select('key, value');

    if (key) {
        query = query.eq('key', key).single();
    }

    const { data, error } = await query;

    if (error && error.code !== 'PGRST116') {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
