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

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        let url = data.url;

        if (!url) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Domain URL is required' })
            };
        }

        // Clean URL
        url = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

        // Check if exists
        const existing = await pool.query('SELECT id FROM domains WHERE url = $1', [url]);

        if (existing.rows.length > 0) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'Domain already exists', domain: url })
            };
        }

        // Insert new domain
        await pool.query('INSERT INTO domains (url, active) VALUES ($1, true)', [url]);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, domain: url })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
