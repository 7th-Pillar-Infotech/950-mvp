const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
})

async function setupDatabase() {
  const client = await pool.connect()

  try {
    console.log('Creating mvp_leads table...')

    await client.query(`
      CREATE TABLE IF NOT EXISTS mvp_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        idea TEXT,
        mvp_type VARCHAR(50),
        goal VARCHAR(50),
        features TEXT,
        existing_assets TEXT,
        timeline VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    console.log('mvp_leads table created successfully!')

  } catch (err) {
    console.error('Error setting up database:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

setupDatabase()
  .then(() => {
    console.log('Database setup complete!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Database setup failed:', err)
    process.exit(1)
  })
