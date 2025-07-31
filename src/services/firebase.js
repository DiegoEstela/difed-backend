const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const serviceAccount = require(path.resolve(
  __dirname,
  "../../firebase-service-account.json"
));

// Inicialización única
initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "difed-contratos",
});

// Exportar Firestore
const db = getFirestore();

// Exportar Storage
const bucket = getStorage().bucket();

// Función para subir PDF con token
const uploadPdfToStorage = async (file, filename) => {
  const token = Date.now().toString();
  const safeFilename = filename.replace(/\s+/g, "_");
  const uniqueName = `contracts/${safeFilename}-${token}.pdf`;

  const fileUpload = bucket.file(uniqueName);

  await fileUpload.save(file.buffer, {
    contentType: "application/pdf",
    metadata: {
      firebaseStorageDownloadTokens: token,
    },
  });

  return `https://firebasestorage.googleapis.com/v0/b/${
    bucket.name
  }/o/${encodeURIComponent(fileUpload.name)}?alt=media&token=${token}`;
};

module.exports = { db, bucket, uploadPdfToStorage };
