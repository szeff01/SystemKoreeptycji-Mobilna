const express = require("express");
const router = express.Router();
const Tutor = require("../models/Tutor");

// Endpoint do dodawania korepetytorów
router.post("/add", async (req, res) => {
  const {
    firstName,
    lastName,
    phone,
    price,
    description,
    location,
    imageUrl,
    category,
    availability,
  } = req.body;

  console.log("Otrzymane dane:", req.body); // Loguj dane przychodzące z aplikacji

  // Sprawdzenie, czy wszystkie wymagane pola są obecne
  if (!firstName || !lastName || !phone || !price || !description || !category) {
    console.error("Błąd: Wymagane pola są puste");
    return res.status(400).json({ error: "Wszystkie wymagane pola muszą być wypełnione." });
  }

  try {
    // Tworzenie nowego korepetytora
    const newTutor = new Tutor({
      firstName,
      lastName,
      phone,
      price,
      description,
      location,
      imageUrl,
      category,
      availability,
    });

    console.log("Próba zapisu korepetytora:", newTutor);

    // Zapis do MongoDB
    const savedTutor = await newTutor.save();
    console.log("Korepetytor zapisany pomyślnie:", savedTutor);

    // Zwrócenie odpowiedzi
    res.status(201).json({ message: "Korepetytor został dodany pomyślnie!", tutor: savedTutor });
  } catch (err) {
    console.error("Błąd dodawania korepetytora:", err.message);
    res.status(500).json({ error: "Wewnętrzny błąd serwera.", details: err.message });
  }
});

// Endpoint do pobierania listy korepetytorów
router.get("/", async (req, res) => {
  try {
    const tutors = await Tutor.find();
    console.log("Pobrano korepetytorów:", tutors);
    res.status(200).json(tutors);
  } catch (err) {
    console.error("Błąd pobierania korepetytorów:", err.message);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

// Endpoint do pobierania konkretnego korepetytora po ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // Walidacja formatu ID
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: "Nieprawidłowy format ID." });
  }

  try {
    const tutor = await Tutor.findById(id);
    if (!tutor) {
      console.error("Korepetytor nie został znaleziony:", id);
      return res.status(404).json({ error: "Korepetytor nie został znaleziony." });
    }
    console.log("Pobrano korepetytora:", tutor);
    res.status(200).json(tutor);
  } catch (err) {
    console.error("Błąd pobierania korepetytora:", err.message);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

// Endpoint do usuwania korepetytora po ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  // Walidacja formatu ID
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: "Nieprawidłowy format ID." });
  }

  try {
    const deletedTutor = await Tutor.findByIdAndDelete(id);
    if (!deletedTutor) {
      console.error("Korepetytor nie został znaleziony do usunięcia:", id);
      return res.status(404).json({ error: "Korepetytor nie został znaleziony." });
    }
    console.log("Usunięto korepetytora:", deletedTutor);
    res.status(200).json({ message: "Korepetytor został usunięty.", tutor: deletedTutor });
  } catch (err) {
    console.error("Błąd usuwania korepetytora:", err.message);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

module.exports = router;
