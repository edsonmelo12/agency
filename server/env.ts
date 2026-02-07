import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const loadEnvFile = (filename: string, override = false) => {
  const filePath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filePath)) {
    return;
  }
  dotenv.config({ path: filePath, override });
};

loadEnvFile('.env');
loadEnvFile('.env.local', true);
if (process.env.DATABASE_URL?.startsWith('file:')) {
  const relative = process.env.DATABASE_URL.slice(5);
  const resolved = path.resolve(process.cwd(), relative);
  process.env.DATABASE_URL = `file:${resolved}`;
}
