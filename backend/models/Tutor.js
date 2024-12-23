const mongoose = require("mongoose");

const tutorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  location: { type: String, enum: ["Online", "Offline"], default: "Online" },
  imageUrl: { type: String },
  category: { type: String, required: true },
  availability: [
    {
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  ],
});

const Tutor = mongoose.model("Tutor", tutorSchema);
module.exports = Tutor;
