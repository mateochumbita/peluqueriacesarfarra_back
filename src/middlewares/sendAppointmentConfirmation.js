// src/middlewares/sendAppointmentConfirmation.js
import transporter from "../service/emailService.js";
import initModels from "../models/init-models.js";
import { sequelizeDB } from "../database/connection.database.js";
import { formaDateLatam } from "../../utils/formatDateLatam.js";

const models = initModels(sequelizeDB);
const Clients = models.Clients;
const Appointments = models.Appointments;
const Hairdressers_Services = models.Hairdressers_Services;
const Services = models.Services;

export const sendAppointmentConfirmation = async (req, res, next) => {
  try {
    const { IdCliente, Fecha, Hora, IdAppointment } = req.body;

    const cliente = await Clients.findByPk(IdCliente);
    if (!cliente || !cliente.Email) return next();

    let appointment;
    if (IdAppointment) {
      appointment = await Appointments.findByPk(IdAppointment);
    } else {
      appointment = await Appointments.findOne({
        where: { IdCliente, Fecha, Hora },
      });
    }

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

    const fechaLatam = formaDateLatam(Fecha);

    const mailOptions = {
      from: `"Peluquería César Farra" <${process.env.EMAIL_USER}>`,
      to: cliente.Email,
      subject: "Confirmación de turno",
      html: `
        <p>Hola ${cliente.Nombre},</p>
        <p>Tu turno ha sido registrado para el día <strong>${fechaLatam}</strong> a las <strong>${Hora}</strong>.</p>
        <p><strong>Servicio:</strong> ${nombreServicio}</p>
        <p><strong>Precio:</strong> $${precioServicio}</p>
        <p>¡Gracias por elegirnos!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("📩 Correo de confirmación enviado a", cliente.Email);

    next();
  } catch (error) {
    console.error("❌ Error al enviar email de confirmación:", error);
    next(); // No cortar flujo aunque falle
  }
};
