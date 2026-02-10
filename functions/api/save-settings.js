
import { createSupabaseClient } from '../utils/supabase';

export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { key, value } = body;

    if (!key || !value) {
        return new Response(JSON.stringify({ error: 'Missing key or value' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const supabase = createSupabaseClient(env);

    const { error } = await supabase
        .from('settings')
        .upsert({ key, value, updated_at: new Date().toISOString() });

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
