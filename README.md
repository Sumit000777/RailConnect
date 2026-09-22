# RailYatra — Railway Management System

A full working railway ticket booking system: user signup/login, a personal
dashboard, live train search across ~110 trains, ticket booking with
passenger + berth details, instant ticket/PNR generation (no payment step),
booking history with cancellation, and a Dark/Light theme switch.

No database server to install — data is stored in JSON files under
`backend/data/`, created automatically the first time you run the server.

## Project structure

```
railway-management-system/
├── backend/                   # Node.js + Express API and static server
│   ├── server.js              # entry point — run this
│   ├── config.js              # JWT secret / port
│   ├── db.js                  # tiny JSON-file data layer
│   ├── seed.js                # generates the ~110 train timetable
│   ├── middleware/
│   │   └── auth.js            # JWT auth guard for protected routes
│   ├── routes/
│   │   ├── auth.js            # POST /api/auth/signup, /api/auth/login
│   │   ├── trains.js          # GET  /api/trains, /api/trains/:id
│   │   └── bookings.js        # GET/POST bookings, cancel, dashboard stats
│   └── data/                  # auto-generated: users.json, trains.json, bookings.json
│
└── frontend/                  # plain HTML/CSS/JS — one file per page
    ├── index.html             # Home
    ├── login.html             # Login
    ├── signup.html            # Sign Up
    ├── dashboard.html         # Dashboard (after login)
    ├── train-timings.html     # Search trains
    ├── booking.html           # Ticket booking / passenger details
    ├── ticket.html            # Generated ticket / PNR
    ├── history.html           # Booking history + cancellation
    ├── css/style.css          # shared styles (Dark + Light theme)
    └── js/
        ├── api.js             # fetch helper, session storage, route guard
        ├── theme.js           # Dark/Light theme toggle
        ├── auth.js            # login + signup form logic
        ├── dashboard.js
        ├── trains.js
        ├── booking.js
        ├── ticket.js
        └── history.js
```

## How to run it in VS Code

1. Open the `railway-management-system` folder in VS Code.
2. Open a terminal (``Ctrl+` ``) and install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open **http://localhost:3000** in your browser.

That's it — the same server serves both the API (`/api/...`) and the
frontend pages, so there's nothing else to configure and no CORS issues.

The first time it starts, `backend/db.js` automatically creates
`backend/data/users.json`, `bookings.json`, and seeds `trains.json` with
110 trains (you can regenerate the timetable any time with `npm run seed`).

## Using the app

1. **Sign Up** with a name, email and password (from the Home page).
2. You're taken straight to your **Dashboard**.
3. Open **Train Timings** in the sidebar, search by station / train number
   / train name, and click **Book Now** on a train.
4. Fill in journey date, class, and passenger details (name, age, gender,
   contact, berth preference) — you can add multiple passengers.
5. Click **Confirm Booking** — no payment step. A ticket with a PNR/booking
   ID is generated immediately.
6. View or cancel bookings any time from **Booking History**.
7. Toggle **Dark / Light** theme from the header on any page.
8. **Logout** from the sidebar to end your session.

## Notes

- Passwords are hashed with bcrypt; sessions use JWTs stored in the
  browser's `localStorage` and sent as `Authorization: Bearer <token>`.
- This is a self-contained demo project (file-based storage, no payment
  gateway) — for production use you'd swap `backend/db.js` for a real
  database, but the route files wouldn't need to change much.
