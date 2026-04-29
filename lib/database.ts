import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('fitforge.db');
  await initializeSchema(db);
  return db;
}

async function initializeSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      sets INTEGER NOT NULL,
      reps TEXT NOT NULL,
      weight REAL NOT NULL,
      weight_unit TEXT NOT NULL DEFAULT 'kg',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS body_measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      weight REAL,
      weight_unit TEXT NOT NULL DEFAULT 'kg',
      height REAL,
      height_unit TEXT NOT NULL DEFAULT 'cm',
      chest REAL,
      waist REAL,
      hips REAL,
      arms REAL,
      thighs REAL,
      neck REAL,
      age INTEGER,
      gender TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// ---- Workouts ----

export interface WorkoutEntry {
  id?: number;
  date: string;
  muscleGroup: string;
  exerciseName: string;
  exerciseId: string;
  sets: number;
  reps: string;
  weight: number;
  weightUnit: string;
  notes?: string;
  createdAt?: string;
}

export async function insertWorkout(entry: WorkoutEntry): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO workouts (date, muscle_group, exercise_name, exercise_id, sets, reps, weight, weight_unit, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [entry.date, entry.muscleGroup, entry.exerciseName, entry.exerciseId, entry.sets, entry.reps, entry.weight, entry.weightUnit, entry.notes ?? null]
  );
  return result.lastInsertRowId;
}

export async function getWorkoutsForExercise(exerciseId: string, limit = 20): Promise<WorkoutEntry[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    `SELECT * FROM workouts WHERE exercise_id = ? ORDER BY date DESC LIMIT ?`,
    [exerciseId, limit]
  );
  return rows.map(rowToWorkout);
}

export async function getLastWorkoutForExercise(exerciseId: string): Promise<WorkoutEntry | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<any>(
    `SELECT * FROM workouts WHERE exercise_id = ? ORDER BY date DESC, created_at DESC LIMIT 1`,
    [exerciseId]
  );
  return row ? rowToWorkout(row) : null;
}

export async function getPersonalBest(exerciseId: string): Promise<WorkoutEntry | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<any>(
    `SELECT * FROM workouts WHERE exercise_id = ? ORDER BY weight DESC LIMIT 1`,
    [exerciseId]
  );
  return row ? rowToWorkout(row) : null;
}

export async function getRecentWorkouts(limit = 30): Promise<WorkoutEntry[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    `SELECT * FROM workouts ORDER BY date DESC, created_at DESC LIMIT ?`,
    [limit]
  );
  return rows.map(rowToWorkout);
}

export async function getWorkoutsForMuscle(muscleGroup: string, limit = 20): Promise<WorkoutEntry[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    `SELECT * FROM workouts WHERE muscle_group = ? ORDER BY date DESC LIMIT ?`,
    [muscleGroup, limit]
  );
  return rows.map(rowToWorkout);
}

function rowToWorkout(row: any): WorkoutEntry {
  return {
    id: row.id,
    date: row.date,
    muscleGroup: row.muscle_group,
    exerciseName: row.exercise_name,
    exerciseId: row.exercise_id,
    sets: row.sets,
    reps: row.reps,
    weight: row.weight,
    weightUnit: row.weight_unit,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function deleteWorkout(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(`DELETE FROM workouts WHERE id = ?`, [id]);
}

export interface WeeklyVolumeEntry {
  muscleGroup: string;
  totalVolume: number;
  sessionCount: number;
}

export async function getWeeklyVolume(): Promise<WeeklyVolumeEntry[]> {
  const database = await getDatabase();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const since = weekStart.toISOString().split('T')[0];
  const rows = await database.getAllAsync<any>(
    `SELECT muscle_group,
            COUNT(DISTINCT date) as session_count,
            SUM(sets * weight) as total_volume
     FROM workouts
     WHERE date >= ?
     GROUP BY muscle_group
     ORDER BY total_volume DESC`,
    [since]
  );
  return rows.map(r => ({
    muscleGroup: r.muscle_group,
    totalVolume: Math.round(r.total_volume ?? 0),
    sessionCount: r.session_count ?? 0,
  }));
}

// ---- Body Measurements ----

export interface BodyMeasurement {
  id?: number;
  date: string;
  weight?: number;
  weightUnit: string;
  height?: number;
  heightUnit: string;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  neck?: number;
  age?: number;
  gender?: string;
  createdAt?: string;
}

export async function insertMeasurement(m: BodyMeasurement): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO body_measurements (date, weight, weight_unit, height, height_unit, chest, waist, hips, arms, thighs, neck, age, gender)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [m.date, m.weight ?? null, m.weightUnit, m.height ?? null, m.heightUnit,
     m.chest ?? null, m.waist ?? null, m.hips ?? null, m.arms ?? null,
     m.thighs ?? null, m.neck ?? null, m.age ?? null, m.gender ?? null]
  );
  return result.lastInsertRowId;
}

export async function getAllMeasurements(): Promise<BodyMeasurement[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    `SELECT * FROM body_measurements ORDER BY date DESC`
  );
  return rows.map(rowToMeasurement);
}

export async function getLatestMeasurement(): Promise<BodyMeasurement | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<any>(
    `SELECT * FROM body_measurements ORDER BY date DESC, created_at DESC LIMIT 1`
  );
  return row ? rowToMeasurement(row) : null;
}

function rowToMeasurement(row: any): BodyMeasurement {
  return {
    id: row.id,
    date: row.date,
    weight: row.weight,
    weightUnit: row.weight_unit,
    height: row.height,
    heightUnit: row.height_unit,
    chest: row.chest,
    waist: row.waist,
    hips: row.hips,
    arms: row.arms,
    thighs: row.thighs,
    neck: row.neck,
    age: row.age,
    gender: row.gender,
    createdAt: row.created_at,
  };
}

// ---- Chat Messages ----

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export async function insertChatMessage(msg: ChatMessage): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO chat_messages (role, content) VALUES (?, ?)`,
    [msg.role, msg.content]
  );
  return result.lastInsertRowId;
}

export async function getChatHistory(limit = 50): Promise<ChatMessage[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    `SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );
  return rows.reverse().map(r => ({ id: r.id, role: r.role as 'user' | 'assistant', content: r.content, createdAt: r.created_at }));
}

export async function clearChatHistory(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(`DELETE FROM chat_messages`);
}

// ---- Settings ----

export async function getSetting(key: string): Promise<string | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<any>(`SELECT value FROM user_settings WHERE key = ?`, [key]);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)`,
    [key, value]
  );
}
