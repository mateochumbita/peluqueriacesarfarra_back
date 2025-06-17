import { Resend } from 'resend';
import initModels from '../models/init-models.js';
import { sequelizeDB } from '../database/connection.database.js';

const models = initModels(sequelizeDB);
const Clients = models.Clients;
const Appointments = models.Appointments;
const Hairdressers_Services = models.Hairdressers_Services;
const Services = models.Services;

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendAppointmentPaymentConfirmation = async (req, res, next) => {
  try {
    const { IdCliente, Fecha, Hora, IdAppointment } = req.body;
    // Buscar el cliente y su email
    const cliente = await Clients.findByPk(IdCliente);
    if (!cliente || !cliente.Email) {
      return next(); // Si no hay email, no se envía nada
    }

    // Buscar el turno para obtener el servicio y precio
    let appointment;
    if (IdAppointment) {
      appointment = await Appointments.findByPk(IdAppointment);
    } else {
      appointment = await Appointments.findOne({
        where: { IdCliente, Fecha, Hora }
      });
    }

    let nombreServicio = '';
    let precioServicio = '';
    if (appointment) {
      const hairdresserService = await Hairdressers_Services.findByPk(appointment.IdHairdresser_Service);
      if (hairdresserService) {
        const service = await Services.findByPk(hairdresserService.IdService);
        if (service) {
          nombreServicio = service.Nombre;
          precioServicio = service.Precio;
        }
      }
    }

    // Formatear la fecha con formatDateLatam
    let fechaLatam = Fecha;
    if (Fecha) {
      const [year, month, day] = Fecha.split('-');
      fechaLatam = `${day}/${month}/${year}`;
    }

    await resend.emails.send({
      from: 'onboarding@resend.dev', 
      to: cliente.Email,
      subject: 'Confirmación de pago de turno',
      html: `<p>Hola ${cliente.Nombre}, tu pago para el turno del día <strong>${fechaLatam}</strong> a las <strong>${Hora}</strong> ha sido confirmado.<br>
      <strong>Servicio:</strong> ${nombreServicio} <br>
      <strong>Precio:</strong> $${precioServicio} <br>
      ¡Gracias por tu confianza!</p>`
    });

    next();
  } catch (error) {
    console.error('Error enviando email de confirmación de pago:', error);
    next(); 
  }
};