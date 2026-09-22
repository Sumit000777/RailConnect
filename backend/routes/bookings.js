const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function generatePNR() {
  return Math.floor(1000000000 + Math.random() * 8999999999).toString();
}

function coachForClass(cls) {
  const prefix = { "1A": "H", "2A": "A", "3A": "B", SL: "S", CC: "C", EC: "E", "2S": "D" }[cls] || "G";
  const coachNum = 1 + Math.floor(Math.random() * 12);
  return `${prefix}${coachNum}`;
}

// GET /api/bookings - all bookings belonging to the logged-in user
router.get("/", (req, res) => {
  const bookings = db.getBookings().filter((b) => b.userId === req.user.id);
  bookings.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
  res.json({ bookings });
});

// GET /api/bookings/summary - counts for the dashboard
router.get("/summary/stats", (req, res) => {
  const bookings = db.getBookings().filter((b) => b.userId === req.user.id);
  const active = bookings.filter((b) => b.status === "Confirmed");
  const cancelled = bookings.filter((b) => b.status === "Cancelled");
  const recent = [...bookings]
    .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))
    .slice(0, 5);

  res.json({
    totalBooked: bookings.length,
    totalCancelled: cancelled.length,
    activeBookings: active.length,
    recent,
  });
});

// GET /api/bookings/:id
router.get("/:id", (req, res) => {
  const booking = db.getBookings().find((b) => b.id === req.params.id && b.userId === req.user.id);
  if (!booking) return res.status(404).json({ message: "Booking not found." });
  res.json({ booking });
});

// POST /api/bookings - create a booking and immediately generate the ticket
router.post("/", (req, res) => {
  const { trainId, journeyDate, preferredClass, passengers } = req.body || {};

  if (!trainId || !journeyDate || !Array.isArray(passengers) || passengers.length === 0) {
    return res.status(400).json({ message: "Train, journey date and at least one passenger are required." });
  }

  const train = db.getTrains().find((t) => t.id === trainId);
  if (!train) return res.status(404).json({ message: "Selected train could not be found." });

  const cls = preferredClass && train.classesAvailable.includes(preferredClass)
    ? preferredClass
    : train.classesAvailable[0];

  for (const p of passengers) {
    if (!p.name || !p.age || !p.gender) {
      return res.status(400).json({ message: "Each passenger needs a name, age and gender." });
    }
  }

  const seatedPassengers = passengers.map((p) => ({
    name: p.name.trim(),
    age: Number(p.age),
    gender: p.gender,
    berthPreference: p.berthPreference || "No preference",
    coach: coachForClass(cls),
    seat: 1 + Math.floor(Math.random() * 72),
  }));

  const booking = {
    id: "BKG-" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 99),
    pnr: generatePNR(),
    userId: req.user.id,
    trainId: train.id,
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    source: train.source,
    destination: train.destination,
    departureTime: train.departureTime,
    arrivalTime: train.arrivalTime,
    journeyDate,
    class: cls,
    passengers: seatedPassengers,
    fareTotal: train.baseFare * passengers.length * (cls === "1A" ? 3 : cls === "2A" ? 2 : cls === "3A" ? 1.5 : 1),
    status: "Confirmed",
    bookedAt: new Date().toISOString(),
    cancelledAt: null,
  };
  booking.fareTotal = Math.round(booking.fareTotal);

  const bookings = db.getBookings();
  bookings.push(booking);
  db.saveBookings(bookings);

  res.status(201).json({ booking });
});

// POST /api/bookings/:id/cancel
router.post("/:id/cancel", (req, res) => {
  const bookings = db.getBookings();
  const booking = bookings.find((b) => b.id === req.params.id && b.userId === req.user.id);

  if (!booking) return res.status(404).json({ message: "Booking not found." });
  if (booking.status === "Cancelled") {
    return res.status(400).json({ message: "This booking is already cancelled." });
  }

  booking.status = "Cancelled";
  booking.cancelledAt = new Date().toISOString();
  db.saveBookings(bookings);

  res.json({ booking });
});

module.exports = router;
