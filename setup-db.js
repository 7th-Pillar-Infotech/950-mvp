const { Client } = require('pg');

const client = new Client({
  host: 'db.buildmatic.ai',
  port: 54341,
  user: 'postgres',
  password: 'a64273c5a76bf7b9f50e62ec2b110634',
  database: 'postgres',
  ssl: false,
  connectionTimeoutMillis: 10000
});

const sql = `
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  idea TEXT NOT NULL,
  stage TEXT NOT NULL,
  timeline TEXT NOT NULL,
  budget TEXT NOT NULL,
  chat_responses JSONB DEFAULT '{}',
  qualified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  spots_remaining INTEGER NOT NULL DEFAULT 10,
  total_spots INTEGER NOT NULL DEFAULT 10
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_daily_spots_date ON daily_spots(date);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_spots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous insert leads" ON leads;
DROP POLICY IF EXISTS "Allow anonymous read daily_spots" ON daily_spots;
DROP POLICY IF EXISTS "Allow anonymous update daily_spots" ON daily_spots;
DROP POLICY IF EXISTS "Allow anonymous insert daily_spots" ON daily_spots;

CREATE POLICY "Allow anonymous insert leads" ON leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous read daily_spots" ON daily_spots FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous update daily_spots" ON daily_spots FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous insert daily_spots" ON daily_spots FOR INSERT TO anon WITH CHECK (true);

INSERT INTO daily_spots (date, spots_remaining, total_spots)
VALUES (CURRENT_DATE, 10, 10)
ON CONFLICT (date) DO NOTHING;
`;

async function setup() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!');

    console.log('Running migrations...');
    await client.query(sql);
    console.log('Database setup complete!');

    const result = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables created:', result.rows.map(r => r.table_name));

    const spots = await client.query("SELECT * FROM daily_spots WHERE date = CURRENT_DATE");
    console.log('Today spots:', spots.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

setup();
