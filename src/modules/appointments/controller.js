import { findAll, findOne, update, remove, search } from '../../service/genericService.js';
import initModels from '../../models/init-models.js';
import { sequelizeDB } from '../../database/connection.database.js';
import { Op } from 'sequelize';

const models = initModels(sequelizeDB);
const Appointments = models.Appointments;
const Earnings = models.Earnings;
const Hairdressers_Services = models.Hairdressers_Services;
const Services = models.Services;
const supabaseTable = 'Appointments';

// Crear Appointment y replicar en Earnings
export const createAppointment = async (req, res) => {
  try {
    const { IdCliente, Fecha, Hora, IdHairdresser_Service, EstadoPago } = req.body;

    // 1. Validar que no haya otro turno igual
    const turnoExistente = await Appointments.findOne({
      where: {
        IdCliente,
        Fecha,
        Hora,
        IdHairdresser_Service
      }
    });

    if (turnoExistente) {
      return res.status(400).json({
        error: 'Ya existe un turno para ese cliente, servicio y horario.'
      });
    }

    // 2. Buscar el precio del servicio
    const hairdresserService = await Hairdressers_Services.findByPk(IdHairdresser_Service);
    if (!hairdresserService) {
      return res.status(400).json({ error: 'No se encontró el servicio del peluquero.' });
    }

    const service = await Services.findByPk(hairdresserService.IdService);
    if (!service) {
      return res.status(400).json({ error: 'No se encontró el servicio.' });
    }

    // 3. Crear el turno (EstadoPago es obligatorio según tu modelo)
    const nuevoTurno = await Appointments.create({
      IdCliente,
      Fecha,
      Hora,
      IdHairdresser_Service,
      EstadoPago
    });

    // 4. Solo si EstadoPago es true, crear el registro en Earnings
    if (EstadoPago === true || EstadoPago === 'true') {
      await Earnings.create({
        Importe: service.Precio,
        IdAppointment: nuevoTurno.Id
      });
    }

    res.status(201).json(nuevoTurno);

  } catch (error) {
    console.error('Error al crear el turno:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllAppointments = findAll(Appointments, supabaseTable);
export const getAppointmentById = findOne(Appointments);
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { EstadoPago, ...rest } = req.body;

    // Buscar el turno existente
    const turno = await Appointments.findByPk(id);
    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado.' });
    }

    // Guardar el valor anterior de EstadoPago
    const estadoPagoAnterior = turno.EstadoPago;

    // Actualizar el turno
    await turno.update({ ...rest, ...(EstadoPago !== undefined ? { EstadoPago } : {}) });

    // Si EstadoPago cambió de false a true, crear el registro en Earnings (si no existe)
    if (
      estadoPagoAnterior === false &&
      (EstadoPago === true || EstadoPago === 'true')
    ) {
      // Verificar si ya existe un registro en Earnings para este turno
      const existeEarning = await Earnings.findOne({ where: { IdAppointment: turno.Id } });
      if (!existeEarning) {
        // Buscar el precio del servicio
        const hairdresserService = await Hairdressers_Services.findByPk(turno.IdHairdresser_Service);
        if (hairdresserService) {
          const service = await Services.findByPk(hairdresserService.IdService);
          if (service) {
            await Earnings.create({
              Importe: service.Precio,
              IdAppointment: turno.Id
            });
          }
        }
      }
    }

    res.status(200).json(turno);

  } catch (error) {
    console.error('Error al actualizar el turno:', error);
    res.status(500).json({ error: error.message });
  }
};
export const deleteAppointment = remove(Appointments, supabaseTable);
export const searchAppointments = search(Appointments, supabaseTable);