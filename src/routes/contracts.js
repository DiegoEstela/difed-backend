const express = require("express");
const multer = require("multer");
const router = express.Router();
const contractController = require("../controllers/contractController");

// 🔹 multer configurado con memoryStorage para Firebase
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🔹 Subida inicial de contrato
router.post(
  "/upload",
  upload.single("file"), // input name="file"
  contractController.uploadContract
);

// 🔹 Firma de contrato
router.post(
  "/sign",
  upload.single("signedPdf"), // usar siempre "file" para evitar errores
  contractController.signContract
);

// 🔹 Confirmacion y envio del contrato
router.post("/confirm-and-send", contractController.confirmAndSend);

module.exports = router;
