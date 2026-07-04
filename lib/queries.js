import { getDb, ensureDb } from "./db";

// ---------- Stock ----------
export async function listStock() {
  await ensureDb();
  const db = getDb();
  const { rows } = await db.execute(
    "SELECT * FROM stock_items ORDER BY (quantity <= min_threshold) DESC, name ASC"
  );
  return rows;
}

export async function createStock({ name, unit, quantity, min_threshold }) {
  await ensureDb();
  const db = getDb();
  await db.execute({
    sql: "INSERT INTO stock_items (name, unit, quantity, min_threshold) VALUES (?, ?, ?, ?)",
    args: [name, unit, quantity, min_threshold],
  });
}

export async function updateStock(id, { name, unit, quantity, min_threshold }) {
  await ensureDb();
  const db = getDb();
  await db.execute({
    sql: "UPDATE stock_items SET name = ?, unit = ?, quantity = ?, min_threshold = ?, updated_at = datetime('now') WHERE id = ?",
    args: [name, unit, quantity, min_threshold, id],
  });
}

export async function deleteStock(id) {
  await ensureDb();
  const db = getDb();
  await db.execute({ sql: "DELETE FROM stock_items WHERE id = ?", args: [id] });
}

// ---------- Menu ----------
export async function listMenu() {
  await ensureDb();
  const db = getDb();
  const { rows: menu } = await db.execute("SELECT * FROM menu_items ORDER BY name ASC");
  const { rows: ingredients } = await db.execute(
    `SELECT mi.menu_item_id, mi.qty_used, s.id as stock_id, s.name as stock_name, s.unit
     FROM menu_ingredients mi JOIN stock_items s ON s.id = mi.stock_item_id`
  );
  return menu.map((m) => ({
    ...m,
    ingredients: ingredients.filter((i) => i.menu_item_id === m.id),
  }));
}

export async function createMenu({ name, price, points_earned, ingredients }) {
  await ensureDb();
  const db = getDb();
  const result = await db.execute({
    sql: "INSERT INTO menu_items (name, price, points_earned) VALUES (?, ?, ?)",
    args: [name, price, points_earned],
  });
  const menuId = Number(result.lastInsertRowid);
  for (const ing of ingredients || []) {
    await db.execute({
      sql: "INSERT INTO menu_ingredients (menu_item_id, stock_item_id, qty_used) VALUES (?, ?, ?)",
      args: [menuId, ing.stock_item_id, ing.qty_used],
    });
  }
  return menuId;
}

export async function deleteMenu(id) {
  await ensureDb();
  const db = getDb();
  await db.execute({ sql: "DELETE FROM menu_items WHERE id = ?", args: [id] });
}

// ---------- Customers ----------
export async function listCustomers() {
  await ensureDb();
  const db = getDb();
  const { rows } = await db.execute("SELECT * FROM customers ORDER BY points DESC, name ASC");
  return rows;
}

export async function createCustomer({ name, phone }) {
  await ensureDb();
  const db = getDb();
  await db.execute({
    sql: "INSERT INTO customers (name, phone, points) VALUES (?, ?, 0)",
    args: [name, phone || null],
  });
}

export async function deleteCustomer(id) {
  await ensureDb();
  const db = getDb();
  await db.execute({ sql: "DELETE FROM customers WHERE id = ?", args: [id] });
}

// ---------- Transactions (Kasir) ----------
export async function createTransaction({ customer_id, menu_item_id, quantity }) {
  await ensureDb();
  const db = getDb();

  const { rows: menuRows } = await db.execute({
    sql: "SELECT * FROM menu_items WHERE id = ?",
    args: [menu_item_id],
  });
  const menu = menuRows[0];
  if (!menu) throw new Error("Menu tidak ditemukan");

  const { rows: ingredientRows } = await db.execute({
    sql: "SELECT * FROM menu_ingredients WHERE menu_item_id = ?",
    args: [menu_item_id],
  });

  // Check stock availability
  for (const ing of ingredientRows) {
    const { rows: stockRows } = await db.execute({
      sql: "SELECT * FROM stock_items WHERE id = ?",
      args: [ing.stock_item_id],
    });
    const stock = stockRows[0];
    const needed = ing.qty_used * quantity;
    if (!stock || stock.quantity < needed) {
      throw new Error(`Stok ${stock ? stock.name : "bahan"} tidak cukup`);
    }
  }

  const totalPrice = menu.price * quantity;
  const pointsEarned = menu.points_earned * quantity;

  // Deduct stock
  for (const ing of ingredientRows) {
    await db.execute({
      sql: "UPDATE stock_items SET quantity = quantity - ?, updated_at = datetime('now') WHERE id = ?",
      args: [ing.qty_used * quantity, ing.stock_item_id],
    });
  }

  // Record transaction
  const result = await db.execute({
    sql: "INSERT INTO transactions (customer_id, menu_item_id, quantity, total_price, points_earned) VALUES (?, ?, ?, ?, ?)",
    args: [customer_id || null, menu_item_id, quantity, totalPrice, customer_id ? pointsEarned : 0],
  });

  // Add loyalty points
  if (customer_id) {
    await db.execute({
      sql: "UPDATE customers SET points = points + ? WHERE id = ?",
      args: [pointsEarned, customer_id],
    });
  }

  return { id: Number(result.lastInsertRowid), totalPrice, pointsEarned };
}

export async function listTransactions() {
  await ensureDb();
  const db = getDb();
  const { rows } = await db.execute(
    `SELECT t.*, m.name as menu_name, c.name as customer_name
     FROM transactions t
     JOIN menu_items m ON m.id = t.menu_item_id
     LEFT JOIN customers c ON c.id = t.customer_id
     ORDER BY t.created_at DESC, t.id DESC`
  );
  return rows;
}

// ---------- Redemptions ----------
export async function createRedemption({ customer_id, reward_name, points_used }) {
  await ensureDb();
  const db = getDb();
  const { rows } = await db.execute({
    sql: "SELECT * FROM customers WHERE id = ?",
    args: [customer_id],
  });
  const customer = rows[0];
  if (!customer) throw new Error("Pelanggan tidak ditemukan");
  if (customer.points < points_used) throw new Error("Poin pelanggan tidak cukup");

  await db.execute({
    sql: "UPDATE customers SET points = points - ? WHERE id = ?",
    args: [points_used, customer_id],
  });
  await db.execute({
    sql: "INSERT INTO redemptions (customer_id, reward_name, points_used) VALUES (?, ?, ?)",
    args: [customer_id, reward_name, points_used],
  });
}

export async function listRedemptions() {
  await ensureDb();
  const db = getDb();
  const { rows } = await db.execute(
    `SELECT r.*, c.name as customer_name FROM redemptions r
     JOIN customers c ON c.id = r.customer_id
     ORDER BY r.created_at DESC, r.id DESC`
  );
  return rows;
}

// ---------- Dashboard ----------
export async function getDashboardStats() {
  await ensureDb();
  const db = getDb();
  const [stockCount, lowStock, customerCount, todayTx, totalTxToday] = await Promise.all([
    db.execute("SELECT COUNT(*) as c FROM stock_items"),
    db.execute("SELECT * FROM stock_items WHERE quantity <= min_threshold ORDER BY quantity ASC"),
    db.execute("SELECT COUNT(*) as c FROM customers"),
    db.execute("SELECT COUNT(*) as c FROM transactions WHERE date(created_at) = date('now')"),
    db.execute("SELECT COALESCE(SUM(total_price),0) as total FROM transactions WHERE date(created_at) = date('now')"),
  ]);
  return {
    stockCount: stockCount.rows[0].c,
    lowStock: lowStock.rows,
    customerCount: customerCount.rows[0].c,
    todayTxCount: todayTx.rows[0].c,
    todayRevenue: totalTxToday.rows[0].total,
  };
}
