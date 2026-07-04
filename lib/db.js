import { createClient } from "@libsql/client";

let client;
let initPromise;

export function getDb() {
  if (!client) {
    client = createClient({
      // Local dev: file-based SQLite. Production: point DATABASE_URL to a
      // Turso (libSQL) database, e.g. libsql://your-db.turso.io
      url: process.env.DATABASE_URL || "file:./local.db",
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  }
  return client;
}

async function createSchema(db) {
  await db.execute(`CREATE TABLE IF NOT EXISTS stock_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 0,
    min_threshold REAL NOT NULL DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    points_earned INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS menu_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    stock_item_id INTEGER NOT NULL REFERENCES stock_items(id) ON DELETE CASCADE,
    qty_used REAL NOT NULL
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    points INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER REFERENCES customers(id),
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price REAL NOT NULL,
    points_earned INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    reward_name TEXT NOT NULL,
    points_used INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
}

async function seedIfEmpty(db) {
  const { rows } = await db.execute("SELECT COUNT(*) as count FROM stock_items");
  if (rows[0].count > 0) return;

  await db.batch(
    [
      "INSERT INTO stock_items (name, unit, quantity, min_threshold) VALUES ('Biji Kopi Arabika', 'gram', 5000, 1000)",
      "INSERT INTO stock_items (name, unit, quantity, min_threshold) VALUES ('Susu Full Cream', 'ml', 8000, 2000)",
      "INSERT INTO stock_items (name, unit, quantity, min_threshold) VALUES ('Sirup Vanilla', 'ml', 300, 500)",
      "INSERT INTO stock_items (name, unit, quantity, min_threshold) VALUES ('Cup 12oz', 'pcs', 40, 50)",

      "INSERT INTO menu_items (name, price, points_earned) VALUES ('Espresso', 15000, 1)",
      "INSERT INTO menu_items (name, price, points_earned) VALUES ('Cafe Latte', 22000, 2)",
      "INSERT INTO menu_items (name, price, points_earned) VALUES ('Vanilla Latte', 25000, 2)",

      "INSERT INTO menu_ingredients (menu_item_id, stock_item_id, qty_used) VALUES (1, 1, 18)",
      "INSERT INTO menu_ingredients (menu_item_id, stock_item_id, qty_used) VALUES (1, 4, 1)",
      "INSERT INTO menu_ingredients (menu_item_id, stock_item_id, qty_used) VALUES (2, 1, 18)",
      "INSERT INTO menu_ingredients (menu_item_id, stock_item_id, qty_used) VALUES (2, 2, 150)",
      "INSERT INTO menu_ingredients (menu_item_id, stock_item_id, qty_used) VALUES (2, 4, 1)",
      "INSERT INTO menu_ingredients (menu_item_id, stock_item_id, qty_used) VALUES (3, 1, 18)",
      "INSERT INTO menu_ingredients (menu_item_id, stock_item_id, qty_used) VALUES (3, 2, 150)",
      "INSERT INTO menu_ingredients (menu_item_id, stock_item_id, qty_used) VALUES (3, 3, 20)",
      "INSERT INTO menu_ingredients (menu_item_id, stock_item_id, qty_used) VALUES (3, 4, 1)",

      "INSERT INTO customers (name, phone, points) VALUES ('Dewi Anggraini', '0812-3456-7890', 8)",
      "INSERT INTO customers (name, phone, points) VALUES ('Budi Santoso', '0813-2233-4455', 3)",
    ].map((sql) => ({ sql }))
  );
}

export async function ensureDb() {
  if (!initPromise) {
    const db = getDb();
    initPromise = createSchema(db).then(() => seedIfEmpty(db));
  }
  return initPromise;
}
