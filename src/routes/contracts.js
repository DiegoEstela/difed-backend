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

// 🔹 Firma de contrato (nuevo endpoint)
router.post(
  "/sign",
  upload.single("signedPdf"), // input name="signedPdf"
  contractController.signContractController
);

module.exports = router;
