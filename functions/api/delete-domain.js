import { createSupabaseClient } from '../utils/supabase';

// Delete domain from database (and associated links)
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

        // 1. Get Domain ID first
        const { data: domainData, error: findError } = await supabase
            .from('domains')
            .select('id')
            .eq('url', cleanDomain)
            .single();

        if (findError || !domainData) {
            // Already gone or not found. 
            // Return success so UI can update (assuming it's already deleted)
            return new Response(JSON.stringify({
                success: true,
                message: `Domain not found (already deleted?)`,
                deleted: 0
            }), { status: 200, headers });
        }

        const domainId = domainData.id;

        // 2. Delete Dependent Links (Manual Cascade)
        // We must delete links referencing this domain_id first to satisfy FK constraint
        const { error: linksError } = await supabase
            .from('links')
            .delete()
            .eq('domain_id', domainId);

        if (linksError) {
            console.error('Error deleting links:', linksError);
            throw new Error('Failed to delete associated links: ' + linksError.message);
        }

        // 3. Delete Domain
        const { data, error, count } = await supabase
            .from('domains')
            .delete()
            .eq('id', domainId)
            .select();

        if (error) throw error;

        const numDeleted = data ? data.length : 0;

        return new Response(JSON.stringify({
            success: true,
            message: `Deleted domain and associated links`,
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
