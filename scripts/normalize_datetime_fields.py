import sqlite3
from pathlib import Path
from datetime import datetime, timezone
import re

db_path = Path('prisma/dev.db')
if not db_path.exists():
    raise SystemExit(f"Banco não encontrado: {db_path}")

iso_re = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$")

def to_iso(value):
    if value is None:
        return None
    if isinstance(value, str):
        if iso_re.match(value):
            return value
        if value.isdigit():
            return datetime.fromtimestamp(int(value) / 1000, tz=timezone.utc).isoformat()
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value / 1000, tz=timezone.utc).isoformat()
    return None

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
updates = []
for row in cursor.fetchall():
    table = row['name']
    cols = conn.execute(f"PRAGMA table_info({table});").fetchall()
    datetime_cols = [col for col in cols if 'DATETIME' in col['type'].upper()]
    if not datetime_cols:
        continue
    pk_cols = [col['name'] for col in cols if col['pk']]
    pk_col = pk_cols[0] if pk_cols else cols[0]['name']
    rows = conn.execute(f"SELECT {pk_col}, " + ", ".join([col['name'] for col in datetime_cols]) + f" FROM {table};").fetchall()
    for data in rows:
        pk = data[pk_col]
        updates_values = {}
        for col in datetime_cols:
            col_name = col['name']
            current = data[col_name]
            iso = to_iso(current)
            if iso and iso != current:
                updates_values[col_name] = iso
        if updates_values:
            placeholders = ", ".join(f"{k} = ?" for k in updates_values)
            params = list(updates_values.values()) + [pk]
            conn.execute(f"UPDATE {table} SET {placeholders} WHERE {pk_col} = ?", params)
            updates.append((table, pk, updates_values))
conn.commit()
conn.close()
if updates:
    print('Campos normalizados:')
    for table, pk, cols in updates:
        inline = ', '.join(f"{k}='{v}'" for k, v in cols.items())
        print(f"- {table}({pk}): {inline}")
else:
    print('Nenhum campo precisou de normalização.')
