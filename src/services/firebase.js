const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");

const serviceAccount = require(path.resolve(
  __dirname,
  "../../firebase-service-account.json"
));

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "difed-contratos",
});

const bucket = getStorage().bucket();

exports.uploadPdfToStorage = async (file, filename) => {
  const blob = bucket.file(`contracts/${filename}`);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: "application/pdf",
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on("error", reject);
    blobStream.on("finish", async () => {
      await blob.makePublic();
      resolve(
        `https://storage.googleapis.com/${bucket.name}/contracts/${filename}`
      );
    });
    blobStream.end(file.buffer);
  });
};
