const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import tras
const authRoutes = require("./routes/authRoutes");
const tutorRoutes = require("./routes/tutorRoutes");

const app = express();

// Middleware
app.use(express.json()); // Obsługa JSON w żądaniach
app.use(cors()); // Obsługa CORS (dla żądań z innych domen)

// Rejestracja tras
app.use("/auth", authRoutes); // Trasy uwierzytelniania
app.use("/tutors", tutorRoutes); // Trasy dla korepetytorów

// Połączenie z MongoDB
const mongoURI = "mongodb://127.0.0.1:27017/korepetytor";
mongoose
  .connect(mongoURI) // Usunięto przestarzałe opcje konfiguracji
  .then(() => console.log("Połączono z MongoDB"))
  .catch((err) => {
    console.error("Błąd połączenia z MongoDB:", err.message);
    process.exit(1); // Zakończ proces, jeśli nie można połączyć się z bazą
  });

// Obsługa błędów 404 (gdy żądana trasa nie istnieje)
app.use((req, res) => {
  res.status(404).json({ error: "Nie znaleziono trasy." });
});

// Obsługa globalnych błędów (na wypadek nieoczekiwanych błędów)
app.use((err, req, res, next) => {
  console.error("Błąd globalny:", err.stack);
  res.status(500).json({ error: "Wewnętrzny błąd serwera." });
});

// Uruchomienie serwera na porcie 5001
const PORT = 5001;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
