import { findAll, findOne, update, remove, search } from '../../service/genericService.js';
import initModels from '../../models/init-models.js';
import { sequelizeDB } from '../../database/connection.database.js';
import { Op } from 'sequelize'; // <-- AGREGA ESTA LÍNEA

const models = initModels(sequelizeDB);
const Appointments = models.Appointments;
const Availabilities = models.Availabilities;
const supabaseTable = 'Appointments';

// Utilidad para obtener el nombre del día en español
function getDiaSemana(fecha) {
  const dias = [
    'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
  ];
  const [year, month, day] = fecha.split('-').map(Number);
  const date = new Date(year, month - 1, day); // Mes base 0
  return dias[date.getDay()];
}

// Crear Appointment con validaciones
export const createAppointment = async (req, res) => {
  try {
    const { PeluqueroId, Fecha, Hora, ClienteId, Notas } = req.body;

    // 1. Validar disponibilidad del peluquero
    const diaSemana = getDiaSemana(Fecha);

    const disponibilidad = await Availabilities.findOne({
      where: {
        HairdresserId: PeluqueroId,
        DiaSemana: diaSemana,
        Activo: true,
        HoraInicio: { [Op.lte]: Hora },
        HoraFin: { [Op.gt]: Hora }
      }
    });

    if (!disponibilidad) {
      return res.status(400).json({
        error: 'El peluquero no está disponible en ese día y horario.'
      });
    }

    // 2. Validar que no haya otro turno en ese horario
    const turnoExistente = await Appointments.findOne({
      where: {
        PeluqueroId,
        Fecha,
        Hora
      }
    });

    if (turnoExistente) {
      return res.status(400).json({
        error: 'Ya existe un turno para ese peluquero en ese día y horario.'
      });
    }

    // 3. Obtener el servicio que ofrece el peluquero
    const hairdresser = await models.Hairdressers.findByPk(PeluqueroId, {
      include: {
        model: models.Services,
        as: 'Service'
      }
    });

    if (!hairdresser || !hairdresser.Service) {
      return res.status(400).json({
        error: 'No se pudo determinar el servicio del peluquero.'
      });
    }

    // Si querés guardar el nombre del servicio como string (opcional):
    const nombreServicio = hairdresser.Service.nombre;
    console.log('Nombre del servicio:', nombreServicio);

    // 4. Crear el turno con la info correcta
    const nuevoTurno = await Appointments.create({
      ClienteId,
      PeluqueroId,
      Fecha,
      Hora,
      Servicio: nombreServicio, // Opcional: si mantenés el campo "Servicio"
      Estado: 'pendiente',
      Notas
    });

    res.status(201).json(nuevoTurno);

  } catch (error) {
    console.error('Error al crear el turno:', error);
    res.status(500).json({ error: error.message });
  }
};


export const getAllAppointments = findAll(Appointments, supabaseTable);
export const getAppointmentById = findOne(Appointments);
export const updateAppointment = update(Appointments, supabaseTable);
export const deleteAppointment = remove(Appointments, supabaseTable);
export const searchAppointments = search(Appointments, supabaseTable);