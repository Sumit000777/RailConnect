/**
 * seed.js
 * -------
 * Generates the train timetable data (~110 trains) used by the app.
 * Run directly with `npm run seed` to regenerate backend/data/trains.json,
 * or it runs automatically the first time the server starts and no
 * trains.json file exists yet.
 */

const STATIONS = [
  "New Delhi", "Mumbai Central", "Howrah Jn", "Chennai Central", "Bengaluru City",
  "Hyderabad Deccan", "Ahmedabad Jn", "Pune Jn", "Jaipur Jn", "Lucknow NR",
  "Kanpur Central", "Patna Jn", "Bhopal Jn", "Nagpur Jn", "Surat",
  "Kolkata", "Chandigarh", "Amritsar Jn", "Varanasi Jn", "Guwahati",
  "Bhubaneswar", "Thiruvananthapuram Central", "Kochi Ernakulam", "Coimbatore Jn",
  "Vijayawada Jn", "Visakhapatnam", "Indore Jn", "Ranchi Jn", "Raipur Jn",
  "Jodhpur Jn", "Agra Cantt", "Gwalior Jn", "Dehradun", "Haridwar Jn",
  "Jammu Tawi", "Madurai Jn", "Nashik Road", "Vadodara Jn", "Allahabad Jn",
  "Mysuru Jn",
];

const TRAIN_TYPES = [
  { tag: "Rajdhani Express", avgSpeed: 85, classes: ["1A", "2A", "3A"] },
  { tag: "Shatabdi Express", avgSpeed: 90, classes: ["CC", "EC"] },
  { tag: "Duronto Express", avgSpeed: 80, classes: ["1A", "2A", "3A", "SL"] },
  { tag: "Superfast Express", avgSpeed: 70, classes: ["1A", "2A", "3A", "SL", "2S"] },
  { tag: "Express", avgSpeed: 55, classes: ["2A", "3A", "SL", "2S"] },
  { tag: "Passenger", avgSpeed: 40, classes: ["SL", "2S"] },
  { tag: "Intercity Express", avgSpeed: 60, classes: ["CC", "SL", "2S"] },
  { tag: "Garib Rath", avgSpeed: 65, classes: ["3A"] },
  { tag: "Jan Shatabdi", avgSpeed: 58, classes: ["CC", "2S"] },
  { tag: "Vande Bharat Express", avgSpeed: 100, classes: ["CC", "EC"] },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function pad(n) {
  return n.toString().padStart(2, "0");
}

// Small deterministic PRNG so re-running seed.js gives stable, repeatable data.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function runningDays(rng) {
  // ~40% of trains run daily, the rest run on a subset of days.
  if (rng() < 0.4) return ["Daily"];
  const count = 2 + Math.floor(rng() * 5);
  const shuffled = [...DAYS].sort(() => rng() - 0.5);
  return shuffled.slice(0, count).sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
}

function generateTrains(count = 110) {
  const rng = mulberry32(20260101);
  const trains = [];
  const usedPairs = new Set();
  const usedNumbers = new Set();

  let attempts = 0;
  while (trains.length < count && attempts < count * 20) {
    attempts++;
    const source = pick(STATIONS, rng);
    let destination = pick(STATIONS, rng);
    if (destination === source) continue;

    const pairKey = `${source}->${destination}`;
    if (usedPairs.has(pairKey)) continue;
    usedPairs.add(pairKey);

    let number;
    do {
      number = 10000 + Math.floor(rng() * 9000);
    } while (usedNumbers.has(number));
    usedNumbers.add(number);

    const type = pick(TRAIN_TYPES, rng);

    const depHour = Math.floor(rng() * 24);
    const depMin = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], rng);

    // Rough distance estimate purely to make journey time & fare feel real.
    const distanceKm = 150 + Math.floor(rng() * 1850);
    const travelHours = distanceKm / type.avgSpeed;
    const totalMinutes = Math.round(travelHours * 60);

    const depTotalMin = depHour * 60 + depMin;
    const arrTotalMin = depTotalMin + totalMinutes;
    const arrHour = Math.floor(arrTotalMin / 60) % 24;
    const arrMin = arrTotalMin % 60;
    const dayOffset = Math.floor(arrTotalMin / (60 * 24));

    const baseFare = Math.round(distanceKm * 1.1 + 150);

    trains.push({
      id: `TRN-${number}`,
      trainNumber: String(number),
      trainName: `${source.split(" ")[0]} ${destination.split(" ")[0]} ${type.tag}`,
      type: type.tag,
      source,
      destination,
      departureTime: `${pad(depHour)}:${pad(depMin)}`,
      arrivalTime: `${pad(arrHour)}:${pad(arrMin)}`,
      dayOffset, // 0 = arrives same day, 1 = next day, etc.
      durationMinutes: totalMinutes,
      distanceKm,
      runningDays: runningDays(rng),
      classesAvailable: type.classes,
      baseFare,
      totalSeats: 72,
    });
  }

  return trains;
}

if (require.main === module) {
  const fs = require("fs");
  const path = require("path");
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const trains = generateTrains();
  fs.writeFileSync(
    path.join(dataDir, "trains.json"),
    JSON.stringify(trains, null, 2)
  );
  console.log(`Seeded ${trains.length} trains into backend/data/trains.json`);
}

module.exports = { generateTrains };
