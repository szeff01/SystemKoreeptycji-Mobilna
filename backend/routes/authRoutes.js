const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Rejestracja użytkownika
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Wszystkie pola są wymagane." });
  }

  try {
    // Sprawdzenie, czy użytkownik już istnieje
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Użytkownik z tym emailem już istnieje." });
    }

    // Utworzenie nowego użytkownika
    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: "Użytkownik zarejestrowany pomyślnie!" });
  } catch (err) {
    console.error("Błąd rejestracji:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

// Logowanie użytkownika
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email i hasło są wymagane." });
  }

  try {
    // Znalezienie użytkownika w bazie danych
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: "Nieprawidłowe dane logowania." });
    }

    res.status(200).json({ user: { username: user.username, email: user.email } });
  } catch (err) {
    console.error("Błąd logowania:", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

module.exports = router;
