#!/usr/bin/env python3
import sqlite3
import datetime
import pathlib
import sys

DB_PATH = pathlib.Path('prisma/dev.db')
if not DB_PATH.exists():
    print(f'[normalize-user-datetimes] banco não encontrado em {DB_PATH}')
    sys.exit(1)

def to_timestamp_ms(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return int(value)
    if isinstance(value, str):
        try:
            ts = datetime.datetime.fromisoformat(value)
            return int(ts.timestamp() * 1000)
        except ValueError:
            pass
    return None

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute('SELECT id, createdAt, updatedAt, lastLoginAt FROM users')
rows = cur.fetchall()
for user_id, created, updated, last_login in rows:
    created_ts = to_timestamp_ms(created)
    updated_ts = to_timestamp_ms(updated)
    last_login_ts = to_timestamp_ms(last_login)
    cur.execute(
        'UPDATE users SET createdAt=?, updatedAt=?, lastLoginAt=? WHERE id=?',
        (created_ts, updated_ts, last_login_ts, user_id),
    )
conn.commit()
conn.close()
print(f'[normalize-user-datetimes] {len(rows)} registros atualizados.')
