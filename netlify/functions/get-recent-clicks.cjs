const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    database: 'postgres',
    user: 'postgres.vkgjvslafnshlsrrcrar',
    password: 'Melpost123@',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // Get recent clicks with link info
        const result = await pool.query(`
            SELECT 
                c.id,
                c.slug,
                c.country,
                c.ip_address,
                c.created_at,
                c.click_id,
                c.os,
                l.title,
                l.original_url
            FROM clicks c
            LEFT JOIN links l ON c.link_id = l.id
            ORDER BY c.created_at DESC
            LIMIT 20
        `);

        const clicks = result.rows.map(row => ({
            id: row.id,
            slug: row.slug,
            country: row.country || 'XX',
            ip: row.ip_address || 'unknown',
            time: row.created_at,
            title: row.title || row.slug,
            url: row.original_url,
            clickId: row.click_id || null,
            os: row.os || 'Unknown'
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ clicks, count: clicks.length })
        };

    } catch (error) {
        console.error('Get clicks error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch clicks: ' + error.message })
        };
    }
};
