const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./db");
const { PORT } = require("./config");
const authRoutes = require("./routes/auth");
const trainRoutes = require("./routes/trains");
const bookingRoutes = require("./routes/bookings");

// Make sure backend/data/*.json exist (and seed ~110 trains) before we start.
db.ensureDataFiles();

const app = express();
app.use(cors());
app.use(express.json());

// ---- API routes ----
app.use("/api/auth", authRoutes);
app.use("/api/trains", trainRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// ---- Serve the frontend (plain HTML/CSS/JS) from the same server ----
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");
app.use(express.static(FRONTEND_DIR));

// Fallback: any unknown, non-API GET request goes to the home page.
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`\nRailway Management System running:`);
  console.log(`  → http://localhost:${PORT}\n`);
});
