const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      unique: true,
    },

    mobileno: {
      type: Number,
      required: true,
      unique: true,
    },
    favorites: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
        itemType: {
          type: String,
          required: true,
          enum: ["Car", "Mobile", "Property"],
        },
      },
    ],
    profilePic: { 
  type: String, 
  default: "https://res.cloudinary.com/dg0nbbyxb/image/upload/v1694070000/default.png" 
},


    // This will automatically store the date of account creation
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Automatically adds createdAt & updatedAt fields
    timestamps: true,
  }
);

// ✅ Virtual property to easily get only the year
userSchema.virtual("accountYear").get(function () {
  return this.createdAt.getFullYear();
});

module.exports = mongoose.model("UserOlx", userSchema);
