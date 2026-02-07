import sqlite3
import re
from pathlib import Path

db_path = Path('prisma/dev.db')
if not db_path.exists():
    raise SystemExit(f"Banco não encontrado em {db_path}")

iso_re = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$")
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
issues = []
for row in cur.fetchall():
    table = row['name']
    columns = conn.execute(f"PRAGMA table_info({table});").fetchall()
    datetime_cols = [col['name'] for col in columns if 'DATETIME' in col['type'].upper()]
    if not datetime_cols:
        continue
    for col in datetime_cols:
        for value_row in conn.execute(f"SELECT id, {col} FROM {table};"):
            value = value_row[col]
            if value is None:
                continue
            if not isinstance(value, str) or not iso_re.match(value):
                issues.append((table, value_row['id'], col, value))
conn.close()
if issues:
    print('Valores inconsistentes detectados:')
    for table, pk, column, value in issues:
        print(f"- {table}.{column} (id={pk}): {value}")
else:
    print('Todos os campos DateTime estão com formatos ISO válidos.')
