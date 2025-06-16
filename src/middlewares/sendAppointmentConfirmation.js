import { Resend } from "resend";
import initModels from "../models/init-models.js";
import { sequelizeDB } from "../database/connection.database.js";

const models = initModels(sequelizeDB);
const Clients = models.Clients;
const Appointments = models.Appointments;
const Hairdressers_Services = models.Hairdressers_Services;
const Services = models.Services;
import { formaDateLatam } from "../../utils/formatDateLatam.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendAppointmentConfirmation = async (req, res, next) => {
  try {
    const { IdCliente, Fecha, Hora, IdAppointment } = req.body;

    // Buscar el cliente y su email
    const cliente = await Clients.findByPk(IdCliente);
    if (!cliente || !cliente.Email) {
      return next(); // Si no hay email, no se envía nada
    }

    // Buscar el turno para obtener el servicio y precio
    // Si IdAppointment no viene en el body, buscar el último turno del cliente en esa fecha y hora
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

    // Formatear la fecha a formato latinoamericano (DD/MM/YYYY)
    const fechaLatam = formaDateLatam(Fecha);

    await resend.emails.send({
      from: "onboarding@resend.dev", // Cambia esto por tu dominio verificado si lo tienes
      to: cliente.Email,
      subject: "Confirmación de turno",
      html: `<p>Hola ${cliente.Nombre}, tu turno ha sido registrado para el día <strong>${fechaLatam}</strong> a las <strong>${Hora}</strong>.<br>
      <strong>Servicio:</strong> ${nombreServicio} <br>
      <strong>Precio:</strong> $${precioServicio} <br>
      ¡Gracias por elegirnos!</p>`,
    });

    next();
  } catch (error) {
    console.error("Error enviando email de confirmación:", error);
    next(); // No frena el flujo si falla el mail
  }
};
