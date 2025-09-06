const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "UserOlx", 
    required: true 
  }, // Reference to user who posted

  category: { 
    type: String, 
    default: "Car", 
    enum: ["Car"] 
  },

  brand: { 
    type: String, 
    required: true, 
    trim: true 
  },

  model: { 
    type: String, 
    trim: true 
  }, 

  year: { 
    type: Number, 
    required: true, 
    min: 1886, 
    max: new Date().getFullYear() + 1 
  },

  fuel: { 
    type: String, 
    enum: ["Petrol", "Diesel", "Electric", "Hybrid"], 
    required: true 
  },

  transmission: { 
    type: String, 
    enum: ["Manual", "Automatic"], 
    required: true 
  },

  kmDriven: { 
    type: Number, 
    required: true, 
    min: 0 
  },

  adTitle: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100 
  },

  price: { 
    type: Number, 
    required: true, 
    min: 0 
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

  photos: [{ 
    type: String, 
    trim: true 
  }], 

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Car", carSchema);

