import { createSupabaseClient } from '../utils/supabase';

export async function onRequestGet(context) {
    const supabase = createSupabaseClient(context.env);
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    const url = new URL(context.request.url);
    const period = url.searchParams.get('period') || 'today';

    try {
        let query = supabase
            .from('clicks')
            .select(`
                id,
                slug,
                country,
                ip_address,
                created_at,
                click_id,
                os,
                user_agent,
                links ( original_url )
            `)
            .order('created_at', { ascending: false })
            .limit(500);

        // Date Filtering
        // Note: Using UTC dates to approximate 'CURRENT_DATE' logic 
        // Ideally we should match the DB server timezone or user timezone.
        // Assuming Postgres uses UTC.
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();

        // Yesterday logic:
        const yest = new Date(now);
        yest.setUTCDate(now.getUTCDate() - 1);
        const yesterdayStart = new Date(Date.UTC(yest.getUTCFullYear(), yest.getUTCMonth(), yest.getUTCDate())).toISOString();

        // Week logic:
        const week = new Date(now);
        week.setUTCDate(now.getUTCDate() - 7);
        const weekStart = new Date(Date.UTC(week.getUTCFullYear(), week.getUTCMonth(), week.getUTCDate())).toISOString();

        if (period === 'today') {
            query = query.gte('created_at', today);
        } else if (period === 'yesterday') {
            query = query.gte('created_at', yesterdayStart).lt('created_at', today);
        } else if (period === 'week') {
            query = query.gte('created_at', weekStart);
        }

        const { data: clicks, error } = await query;

        if (error) throw error;

        // Map response to match expected frontend format
        const mappedClicks = clicks.map(row => ({
            id: row.id,
            slug: row.slug,
            country: row.country,
            ip: row.ip_address,
            time: row.created_at,
            clickId: row.click_id,
            os: row.os || 'Unknown',
            // Handle flatting joined data
            originalUrl: row.links?.original_url || ''
        }));

        return new Response(JSON.stringify({ clicks: mappedClicks }), { status: 200, headers });

    } catch (err) {
        console.error('Reports Error:', err);
        return new Response(JSON.stringify({ error: 'Failed to fetch messages' }), { status: 500, headers });
    }
}
