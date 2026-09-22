const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/trains?from=&to=&number=&name=
router.get("/", (req, res) => {
  const { from = "", to = "", number = "", name = "" } = req.query;
  let trains = db.getTrains();

  const f = from.trim().toLowerCase();
  const t = to.trim().toLowerCase();
  const n = number.trim().toLowerCase();
  const nm = name.trim().toLowerCase();

  if (f) trains = trains.filter((tr) => tr.source.toLowerCase().includes(f));
  if (t) trains = trains.filter((tr) => tr.destination.toLowerCase().includes(t));
  if (n) trains = trains.filter((tr) => tr.trainNumber.includes(n));
  if (nm) trains = trains.filter((tr) => tr.trainName.toLowerCase().includes(nm));

  res.json({ count: trains.length, trains });
});

// GET /api/trains/:id
router.get("/:id", (req, res) => {
  const trains = db.getTrains();
  const train = trains.find((tr) => tr.id === req.params.id);
  if (!train) return res.status(404).json({ message: "Train not found." });
  res.json({ train });
});

module.exports = router;
