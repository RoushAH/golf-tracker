import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '../../data');
mkdirSync(dataDir, { recursive: true });

const dbPath = join(dataDir, 'golf_tracker.db');

let db = null;

async function getDatabase() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

export async function initializeDatabase() {
  const database = await getDatabase();

  // Run migrations
  await runMigrations(database);

  database.run(`
    CREATE TABLE IF NOT EXISTS drill_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      scoring_type TEXT NOT NULL,
      categories TEXT NOT NULL,
      metadata TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      is_default INTEGER DEFAULT 0,
      deleted_at INTEGER
    );
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      drill_type_id TEXT NOT NULL,
      user_id TEXT,
      started_at INTEGER NOT NULL,
      completed_at INTEGER,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      sync_version INTEGER DEFAULT 0,
      device_id TEXT,
      deleted_at INTEGER,
      FOREIGN KEY (drill_type_id) REFERENCES drill_types(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS results (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      category TEXT NOT NULL,
      outcome TEXT NOT NULL,
      ball_number INTEGER,
      sequence INTEGER NOT NULL,
      recorded_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      sync_version INTEGER DEFAULT 0,
      device_id TEXT,
      deleted_at INTEGER,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS sync_state (
      device_id TEXT PRIMARY KEY,
      last_sync_at INTEGER NOT NULL,
      last_pull_version INTEGER DEFAULT 0
    );
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT,
      picture TEXT,
      created_at INTEGER NOT NULL,
      last_login_at INTEGER NOT NULL
    );
  `);

  database.run('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');

  database.run('CREATE INDEX IF NOT EXISTS idx_sessions_drill_type ON sessions(drill_type_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at)');
  database.run('CREATE INDEX IF NOT EXISTS idx_results_session ON results(session_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_results_category ON results(category)');
  database.run('CREATE INDEX IF NOT EXISTS idx_sync_updated ON sessions(updated_at)');
  database.run('CREATE INDEX IF NOT EXISTS idx_sync_updated_results ON results(updated_at)');

  await seedDefaultDrills();
  saveDatabase();
}

async function runMigrations(database) {
  // Check if user_id column exists in sessions table
  const tableInfo = database.exec("PRAGMA table_info(sessions)");

  if (tableInfo.length > 0) {
    const columns = tableInfo[0].values.map(row => row[1]); // column name is at index 1

    if (!columns.includes('user_id')) {
      console.log('🔧 Running migration: Adding user_id to sessions table');
      database.run('ALTER TABLE sessions ADD COLUMN user_id TEXT');
      saveDatabase();
      console.log('✓ Migration complete');
    }
  }
}

async function seedDefaultDrills() {
  const database = await getDatabase();
  const result = database.exec('SELECT COUNT(*) as count FROM drill_types WHERE is_default = 1');

  const count = result[0]?.values[0]?.[0] || 0;

  if (count === 0) {
    const now = Date.now();

    const defaultDrills = [
      {
        id: uuidv4(),
        name: 'Putting by Distance',
        description: 'Practice putting accuracy at various distances',
        scoring_type: 'made_missed',
        categories: JSON.stringify(['under 3\'', '3-6\'', '6-12\'', '12\'+']),
        metadata: null,
        created_at: now,
        updated_at: now,
        is_default: 1
      },
      {
        id: uuidv4(),
        name: 'Chipping Target Practice',
        description: 'Chip to target from various distances',
        scoring_type: 'made_missed',
        categories: JSON.stringify(['10-20\'', '30-50\'', '50\'+']),
        metadata: null,
        created_at: now,
        updated_at: now,
        is_default: 1
      },
      {
        id: uuidv4(),
        name: 'Par 18',
        description: '9 balls off the green - chip on then putt',
        scoring_type: 'stroke_count',
        categories: JSON.stringify(['ball']),
        metadata: JSON.stringify({ total_balls: 9 }),
        created_at: now,
        updated_at: now,
        is_default: 1
      }
    ];

    for (const drill of defaultDrills) {
      database.run(
        `INSERT INTO drill_types (id, name, description, scoring_type, categories, metadata, created_at, updated_at, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [drill.id, drill.name, drill.description, drill.scoring_type, drill.categories, drill.metadata, drill.created_at, drill.updated_at, drill.is_default]
      );
    }

    saveDatabase();
    console.log('✓ Seeded 3 default drill types');
  }
}

export { getDatabase, saveDatabase };
export default getDatabase;
