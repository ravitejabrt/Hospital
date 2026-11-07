// data/db.js
const fs = require('fs');
const path = require('path');
const seedData = require('./seed');

const DB_FILE = path.join(__dirname, 'db.json');

function initDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
    console.log('[DB] Initialized database with seed data at:', DB_FILE);
  }
}

function getDb() {
  try {
    initDb();
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Error reading DB file, recreating from seed:', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
    return JSON.parse(JSON.stringify(seedData));
  }
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[DB] Error saving DB:', err);
    return false;
  }
}

function resetDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
  console.log('[DB] Database reset to initial seed data');
  return seedData;
}

module.exports = {
  getDb,
  saveDb,
  resetDb
};
