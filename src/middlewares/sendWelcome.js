import { Resend } from 'resend';
import initModels from '../models/init-models.js';
import { sequelizeDB } from '../database/connection.database.js';

const models = initModels(sequelizeDB);
const Clients = models.Clients;

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (req, res, next) => {
  try {
    // El IdCliente puede estar en req.body o en req.newClientId (ajusta según tu flujo)
    const clientId = req.newClientId || req.body.IdCliente;
    if (!clientId) return next();

    const cliente = await Clients.findByPk(clientId);
    if (!cliente || !cliente.Email) return next();

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: cliente.Email,
      subject: '¡Bienvenido/a!',
      html: `<p>Hola <strong>${cliente.Nombre}</strong>,<br>
      ¡Bienvenido/a a nuestra plataforma!<br>
      Tu email registrado es: <strong>${cliente.Email}</strong>.<br>
      Gracias por unirte.</p>`
    });

    next();
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
    next();
  }
};