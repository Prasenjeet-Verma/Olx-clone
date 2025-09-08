const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// 🔹 Storage for ads (multiple images)
const adsStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "olx_ads",
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req, file) =>
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_"),
  },
});

// 🔹 Storage for profile pictures (single image)
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pics",
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req, file) =>
      "profile-" + Date.now() + "-" + file.originalname.replace(/\s+/g, "_"),
  },
});

// 🔹 Middlewares
exports.uploadMultiple = multer({ storage: adsStorage }).array("photos", 5);
exports.uploadSingle = multer({ storage: profileStorage }).single("profilePic");

