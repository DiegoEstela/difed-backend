const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtp.gmail.com
  port: parseInt(process.env.SMTP_PORT), // 587
  secure: false, // true para 465, false para 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // evitar errores de certificado en localhost
  },
});

exports.sendContractEmail = async (to, link) => {
  const info = await transporter.sendMail({
    from: `"Difed Contratos" <${process.env.SMTP_USER}>`,
    to,
    subject: "Nuevo contrato para firmar",
    text: `Tenés un nuevo contrato para firmar: ${link}`,
    html: `<p>Tenés un nuevo contrato para firmar:</p><p><a href="${link}">${link}</a></p>`,
  });

  console.log("Mensaje enviado:", info.messageId);
};
