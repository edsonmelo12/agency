const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'prisma', 'dev.db');
const TARGETS = {
  users: ['createdAt', 'updatedAt', 'lastLoginAt'],
};

const isNumericString = (value) => {
  return typeof value === 'string' && /^[0-9]+$/.test(value);
};

const toISOString = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  try {
    const date = new Date(num);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
};

const run = () => {
  console.log(`Opening database ${DB_PATH}`);
  const db = new Database(DB_PATH, { readonly: false });
  try {
    Object.entries(TARGETS).forEach(([table, columns]) => {
      columns.forEach((column) => {
        const rows = db
          .prepare(`SELECT id, ${column} FROM ${table} WHERE ${column} IS NOT NULL`)
          .all();
        rows.forEach((row) => {
          const { id } = row;
          const value = row[column];
          if (isNumericString(value)) {
            const iso = toISOString(value);
            if (iso) {
              db
                .prepare(`UPDATE ${table} SET ${column} = ? WHERE id = ?`)
                .run(iso, id);
              console.log(`[${table}] normalized ${column} for id=${id}`);
            }
          }
        });
      });
    });
  } finally {
    db.close();
  }
};

run();
