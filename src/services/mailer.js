const nodemailer = require("nodemailer");
const axios = require("axios");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

/**
 * 1️⃣ Envío del primer mail para firma
 * @param {string} to - Correo destinatario
 * @param {string} recipientName - Nombre del cliente
 * @param {string} link - Link al contrato para firmar
 */
exports.sendContractEmail = async (to, recipientName, link) => {
  try {
    const info = await transporter.sendMail({
      from: `"Difed Contratos" <${process.env.SMTP_USER}>`,
      to,
      subject: `Estimado/a ${recipientName}, tiene un nuevo contrato para firmar`,
      text: `Hola ${recipientName}, 
      
Se ha generado un nuevo contrato correspondiente a su compra reciente.  
Para proceder, debe revisarlo y firmarlo haciendo clic en el siguiente enlace: ${link} 

Muchas gracias por su confianza.
      
Equipo Difed Contratos`,
      html: `
        <p>Hola <strong>${recipientName}</strong>,</p>
        <p>Se ha generado un nuevo contrato correspondiente a su <strong>compra reciente</strong>.</p>
        <p>Por favor, revise el documento y proceda a la firma digital desde el siguiente enlace:</p>
        <p>
          <a href="${link}" 
             style="display:inline-block;padding:10px 16px;background-color:#52a0b6;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;margin-top:10px;">
             📄 Firmar contrato
          </a>
        </p>
        <br/>
        <p style="font-size:12px;color:#555;">Si el botón no funciona, copie y pegue este enlace en su navegador:</p>
        <p style="font-size:12px;color:#555;">${link}</p>
        <br/>
        <p>Muchas gracias por su confianza.<br/>Equipo Difed Contratos</p>
      `,
    });

    console.log(
      "📧 Email inicial enviado a:",
      to,
      "| MessageID:",
      info.messageId
    );
  } catch (err) {
    console.error("❌ Error enviando email inicial:", err);
    throw err;
  }
};

/**
 * 2️⃣ Envío del contrato confirmado como adjunto
 * @param {string} to - Correo destinatario
 * @param {string} recipientName - Nombre del cliente
 * @param {object} contract - Contrato con { nombre, apellido, url }
 */
exports.sendConfirmedContractEmail = async (to, recipientName, contract) => {
  try {
    // Descargar PDF desde Firebase Storage
    const response = await axios.get(contract.url, {
      responseType: "arraybuffer",
    });

    const info = await transporter.sendMail({
      from: `"Difed Contratos" <${process.env.SMTP_USER}>`,
      to,
      subject: `Contrato firmado - ${contract.nombre} ${contract.apellido}`,
      html: `
        <p>Estimado/a ${recipientName},</p>
        <p>Le informamos que el contrato de <strong>${contract.nombre} ${contract.apellido}</strong> ha sido firmado y confirmado.</p>
        <p>Puede descargarlo desde el siguiente enlace:</p>
        <p>
          <a href="${contract.url}" 
             style="display:inline-block;padding:10px 16px;background-color:#52a0b6;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;margin-top:10px;">
             📄 Descargar contrato
          </a>
        </p>
        <br/>
        <p>Gracias por confiar en nosotros.<br/>Equipo Difed Contratos</p>
      `,
      attachments: [
        {
          filename: `Contrato-${contract.nombre}-${contract.apellido}.pdf`,
          content: Buffer.from(response.data, "binary"),
        },
      ],
    });

    console.log(
      "📧 Email confirmado enviado a:",
      to,
      "| MessageID:",
      info.messageId
    );
  } catch (err) {
    console.error("❌ Error enviando contrato confirmado:", err);
    throw err;
  }
};
