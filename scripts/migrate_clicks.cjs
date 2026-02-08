const { Pool } = require('pg');

const pool = new Pool({
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    database: 'postgres',
    user: 'postgres.vkgjvslafnshlsrrcrar',
    password: 'Melpost123@',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('Creating clicks table...');

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS clicks (
                id SERIAL PRIMARY KEY,
                link_id INTEGER REFERENCES links(id) ON DELETE CASCADE,
                slug VARCHAR(255) NOT NULL,
                country VARCHAR(10) DEFAULT 'XX',
                user_agent TEXT,
                ip_address VARCHAR(45),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
        console.log('✓ clicks table created successfully');

        // Create index for faster queries
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON clicks(created_at DESC)
        `);
        console.log('✓ Index created');

        console.log('Migration completed!');
    } catch (error) {
        console.error('Migration failed:', error.message);
    } finally {
        await pool.end();
    }
}

migrate();
