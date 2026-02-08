import { createSupabaseClient } from '../utils/supabase';

export async function onRequestPost(context) {
    const supabase = createSupabaseClient(context.env);
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    try {
        const data = await context.request.json();
        let url = data.url;

        if (!url) {
            return new Response(JSON.stringify({ error: 'Domain URL is required' }), { status: 400, headers });
        }

        // Clean URL
        url = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

        // Check if exists
        const { data: existing, error: checkError } = await supabase
            .from('domains')
            .select('id')
            .eq('url', url); // .single() might fail if not found and we don't catch, better check list length

        if (existing && existing.length > 0) {
            return new Response(JSON.stringify({ success: true, message: 'Domain already exists', domain: url }), { status: 200, headers });
        }

        // Insert new domain
        const { error: insertError } = await supabase
            .from('domains')
            .insert({ url, active: true });

        if (insertError) throw insertError;

        return new Response(JSON.stringify({ success: true, domain: url }), { status: 200, headers });

    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
