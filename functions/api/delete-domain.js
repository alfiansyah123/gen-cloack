import { createSupabaseClient } from '../utils/supabase';

// Delete domain from database
export async function onRequest(context) {
    // Handle DELETE method (or POST with action)
    if (context.request.method !== 'DELETE' && context.request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    try {
        const supabase = createSupabaseClient(context.env);
        const { domain } = await context.request.json();

        if (!domain) {
            return new Response(JSON.stringify({ error: 'Domain is required' }), { status: 400, headers });
        }

        // Clean URL just like in add-domain (remove protocol, trailing slash)
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').trim();

        const { data, error, count } = await supabase
            .from('domains')
            .delete()
            .eq('url', cleanDomain)
            .select();

        if (error) throw error;

        // If data is empty, it means nothing was deleted
        const numDeleted = data ? data.length : 0;

        return new Response(JSON.stringify({
            success: true,
            message: `Deleted ${numDeleted} domain(s)`,
            deleted: numDeleted
        }), { status: 200, headers });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'DELETE, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
