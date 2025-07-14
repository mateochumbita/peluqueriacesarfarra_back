// src/services/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Recomendado: contraseña de aplicación
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Error al conectar con el servidor de correo:", error);
  } else {
    console.log("✅ Servidor de correo listo");
  }
});

export default transporter;
