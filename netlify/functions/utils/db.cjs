const { Pool } = require('pg');

const pool = new Pool({
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    database: 'postgres',
    user: 'postgres.vkgjvslafnshlsrrcrar',
    password: 'Melpost123@',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;
