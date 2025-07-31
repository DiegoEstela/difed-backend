const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage(); // para subir a Firebase directamente

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".pdf") {
      return cb(new Error("Solo se permiten archivos PDF"));
    }
    cb(null, true);
  },
});

module.exports = upload;
