const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config");

const router = express.Router();

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

function makeToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/signup
router.post("/signup", (req, res) => {
  const { name, email, password, phone } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are all required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const users = db.getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email === normalizedEmail)) {
    return res.status(409).json({ message: "An account with this email already exists. Please log in instead." });
  }

  const newUser = {
    id: "USR-" + Date.now().toString(36).toUpperCase(),
    name: name.trim(),
    email: normalizedEmail,
    phone: phone ? phone.trim() : "",
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  db.saveUsers(users);

  const token = makeToken(newUser);
  res.status(201).json({ token, user: publicUser(newUser) });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const users = db.getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user) {
    // Matches the spec: tell the user no account exists so the frontend
    // can redirect them to the Sign-Up page.
    return res.status(404).json({
      message: "No account found with this email. Please sign up first.",
      accountExists: false,
    });
  }

  const passwordOk = bcrypt.compareSync(password, user.passwordHash);
  if (!passwordOk) {
    return res.status(401).json({ message: "Incorrect password. Please try again.", accountExists: true });
  }

  const token = makeToken(user);
  res.json({ token, user: publicUser(user) });
});

module.exports = router;
