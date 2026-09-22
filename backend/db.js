/**
 * db.js
 * -----
 * A tiny file-based "database" so the whole project runs with a plain
 * `npm install` + `npm start` — no MySQL/Postgres/Mongo server required.
 * Data is stored as JSON files inside backend/data/ and read/written
 * synchronously (the app is small, so this is simple and reliable).
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const TRAINS_FILE = path.join(DATA_DIR, "trains.json");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");

function ensureFile(filePath, defaultValue) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
  }
}

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  ensureFile(USERS_FILE, []);
  ensureFile(BOOKINGS_FILE, []);

  // Trains are seeded the first time the server starts, so the file only
  // needs generating here if seed.js hasn't produced it yet.
  if (!fs.existsSync(TRAINS_FILE)) {
    const { generateTrains } = require("./seed");
    fs.writeFileSync(TRAINS_FILE, JSON.stringify(generateTrains(), null, 2));
  }
}

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  ensureDataFiles,
  getUsers: () => readJSON(USERS_FILE),
  saveUsers: (data) => writeJSON(USERS_FILE, data),
  getTrains: () => readJSON(TRAINS_FILE),
  saveTrains: (data) => writeJSON(TRAINS_FILE, data),
  getBookings: () => readJSON(BOOKINGS_FILE),
  saveBookings: (data) => writeJSON(BOOKINGS_FILE, data),
};
