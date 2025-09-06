const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserOlx",
    required: true,
  },
  category: {
    type: String,
    default: "Property",
    enum: ["Property"],
  },
  // ✅ Location Fields
  state: { 
    type: String, 
    required: true, 
    trim: true 
  },

  city: { 
    type: String, 
    required: true, 
    trim: true 
  },
  houseType: { type: String, required: true }, // e.g., Apartment, Villa
  bhk: { type: Number, required: true }, // 1 BHK, 2 BHK, etc.
  bathrooms: { type: Number, required: true },
  furnishing: {
    type: String,
    enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
  },
  projectStatus: {
    type: String,
    enum: ["Ready to move", "Under construction"],
  },
  listedBy: {
    type: String,
    enum: ["Owner", "Builder", "Agent"],
    required: true,
  },
  totalFloors: { type: Number },
  adTitle: { type: String, required: true },
  price: { type: Number, required: true },
  photos: [{ type: String }], // Array of uploaded photos
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Property", propertySchema);
