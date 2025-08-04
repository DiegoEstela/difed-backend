const path = require("path");
const { bucket, db, uploadPdfToStorage } = require("../services/firebase");
const {
  sendContractEmail,
  sendConfirmedContractEmail,
} = require("../services/mailer");

/**
 * 1️⃣ Subir contrato y enviar mail inicial
 */
exports.uploadContract = async (req, res) => {
  try {
    const file = req.file;
    const { email, dni, nombre, apellido } = req.body;

    if (!file) return res.status(400).json({ error: "Archivo no encontrado" });

    const filename = path.parse(file.originalname).name;
    const fileUrl = await uploadPdfToStorage(file, filename);

    const docRef = await db.collection("contracts").add({
      email,
      filename,
      dni,
      nombre,
      apellido,
      url: fileUrl,
      status: "pendiente",
      createdAt: new Date(),
    });

    // Link de firma
    const signLink = `https://difed-contratos.web.app/signature/${docRef.id}`;

    // 🔹 Mail inicial (ahora incluye nombre del cliente)
    await sendContractEmail(email, nombre, signLink);

    res.status(200).json({
      message: "Contrato cargado y enviado",
      id: docRef.id,
      signUrl: signLink,
      version: "v4.0",
    });
  } catch (error) {
    console.error("❌ Error al subir contrato:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * 2️⃣ Firmar contrato y actualizar Storage + Firestore
 */
exports.signContract = async (req, res) => {
  try {
    const { contractId, clarification } = req.body;
    const signedFile = req.file;

    if (!contractId || !signedFile) {
      return res
        .status(400)
        .json({ error: "Faltan datos para firmar el contrato" });
    }

    // Obtener contrato en Firestore
    const docRef = db.collection("contracts").doc(contractId);
    const docSnap = await docRef.get();
    if (!docSnap.exists)
      return res.status(404).json({ error: "Contrato no encontrado" });

    const contractData = docSnap.data();
    const filename = contractData.filename || `contract-${contractId}`;

    // Sobrescribir archivo en Storage (mismo nombre)
    const blob = bucket.file(`contracts/${filename}.pdf`);
    const newToken = Date.now().toString();

    await blob.save(signedFile.buffer, {
      contentType: "application/pdf",
      metadata: { firebaseStorageDownloadTokens: newToken },
    });

    // Generar nueva URL con token actualizado
    const signedUrl = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURIComponent(blob.name)}?alt=media&token=${newToken}`;

    // Actualizar Firestore
    await docRef.update({
      status: "firmado",
      signedAt: new Date(),
      clarification: clarification || "",
      url: signedUrl,
    });

    res.status(200).json({
      message: "Contrato firmado correctamente",
      signedUrl,
    });
  } catch (error) {
    console.error("❌ Error al firmar contrato:", error);
    res.status(500).json({ error: "Error al firmar contrato" });
  }
};

/**
 * 3️⃣ Confirmar contrato firmado y enviar email con adjunto
 */
exports.confirmAndSend = async (req, res) => {
  try {
    const { contractId, email, recipientName } = req.body;

    console.log(req.body);

    if (!contractId || !email || !recipientName) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    // 🔹 Obtener contrato
    const docRef = db.collection("contracts").doc(contractId);
    const snap = await docRef.get();

    if (!snap.exists)
      return res.status(404).json({ error: "Contrato no encontrado" });

    const contract = snap.data();

    // 🔹 Actualizar Firestore
    await docRef.update({
      status: "confirmado",
      signedAt: new Date().toISOString(),
    });

    // 🔹 Enviar email con adjunto
    await sendConfirmedContractEmail(email, recipientName, {
      nombre: contract.nombre,
      apellido: contract.apellido,
      url: contract.url,
    });

    res
      .status(200)
      .json({ message: "Contrato confirmado y enviado correctamente" });
  } catch (error) {
    console.error("❌ Error confirmando y enviando contrato:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
