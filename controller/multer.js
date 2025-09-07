const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "olx_ads",
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req, file) => Date.now() + "-" + file.originalname.replace(/\s+/g, "_"),
  },
});

exports.uploadMultiple = multer({ storage }).array("photos", 5);

