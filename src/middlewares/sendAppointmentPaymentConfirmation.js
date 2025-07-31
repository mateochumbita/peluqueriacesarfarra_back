// src/middlewares/sendAppointmentPaymentConfirmation.js
import transporter from "../service/emailService.js";
import initModels from "../models/init-models.js";
import { sequelizeDB } from "../database/connection.database.js";
import { formaDateLatam } from "../../utils/formatDateLatam.js";

const models = initModels(sequelizeDB);
const Clients = models.Clients;
const Appointments = models.Appointments;
const Hairdressers_Services = models.Hairdressers_Services;
const Services = models.Services;

export const sendAppointmentPaymentConfirmation = async (req, res, next) => {
  try {
    const { IdCliente, Fecha, Hora, IdAppointment } = req.body;

    // Buscar el cliente y su email
    const cliente = await Clients.findByPk(IdCliente);
    if (!cliente || !cliente.Email) return next();

    // Buscar el turno
    let appointment;
    if (IdAppointment) {
      appointment = await Appointments.findByPk(IdAppointment);
    } else {
      appointment = await Appointments.findOne({
        where: { IdCliente, Fecha, Hora },
      });
    }

    // Obtener servicio y precio
    let nombreServicio = "";
    let precioServicio = "";
    if (appointment) {
      const hairdresserService = await Hairdressers_Services.findByPk(
        appointment.IdHairdresser_Service
      );
      if (hairdresserService) {
        const service = await Services.findByPk(hairdresserService.IdService);
        if (service) {
          nombreServicio = service.Nombre;
          precioServicio = service.Precio;
        }
      }
    }

    // Formatear la fecha
    const fechaLatam = Fecha ? formaDateLatam(Fecha) : Fecha;

    // Enviar correo
    const mailOptions = {
      from: `"Peluquería César Farra" <${process.env.EMAIL_USER}>`,
      to: cliente.Email,
      subject: "Confirmación de pago de turno",
      html: `
        <p>Hola ${cliente.Nombre},</p>
        <p>Tu pago para el turno del día <strong>${fechaLatam}</strong> a las <strong>${Hora}</strong> ha sido confirmado.</p>
        <p><strong>Servicio:</strong> ${nombreServicio}</p>
        <p><strong>Precio:</strong> $${precioServicio}</p>
        <p>¡Gracias por tu confianza!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("📩 Correo de confirmación de pago enviado a", cliente.Email);

    next();
  } catch (error) {
    console.error("❌ Error enviando email de confirmación de pago:", error);
    next();
  }
};
