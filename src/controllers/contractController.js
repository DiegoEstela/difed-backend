const { bucket, db, uploadPdfToStorage } = require("../services/firebase");
const path = require("path");
const { sendContractEmail } = require("../services/mailer");

// SUBIR CONTRATO

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

    const signLink = `https://difed-contratos.web.app/signature/${docRef.id}`;
    await sendContractEmail(email, signLink);

    res.status(200).json({
      message: "Contrato cargado y enviado",
      id: docRef.id,
      signUrl: signLink,
    });
  } catch (error) {
    console.error("Error al subir contrato:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// 2 FIRMAR CONTRATO
exports.signContractController = async (req, res) => {
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
      metadata: {
        firebaseStorageDownloadTokens: newToken,
      },
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
