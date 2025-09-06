const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

// Only allow images
const fileFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpg', 'image/jpeg'];
  cb(null, allowed.includes(file.mimetype));
};

// Export multer middlewares
exports.uploadMultiple = multer({ storage, fileFilter }).array('photos', 5); // for cars and properties
