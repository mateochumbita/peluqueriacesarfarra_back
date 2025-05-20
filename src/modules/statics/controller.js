import initModels from '../../models/init-models.js';
import { sequelizeDB } from '../../database/connection.database.js';
import { Op, fn, col, literal } from 'sequelize';

// Inicializar modelos
const models = initModels(sequelizeDB);
const Appointments = models.Appointments;

// Obtener estadísticas de turnos
export const getStatistics = async (req, res) => {
  const { inicio, fin } = req.query;

  if (!inicio || !fin) {
    return res.status(400).json({ error: 'Debes proporcionar las fechas "inicio" y "fin" en el query.' });
  }

  try {
    // 1. Cantidad de turnos en el rango
    const totalAppointments = await Appointments.count({
      where: {
        Fecha: { [Op.between]: [inicio, fin] }
      }
    });

    // 2. Horarios con mayor demanda
    const topTimeSlots = await Appointments.findAll({
      attributes: ['Fecha', 'Hora', [fn('COUNT', col('Id')), 'Cantidad']],
      where: {
        Fecha: { [Op.between]: [inicio, fin] }
      },
      group: ['Fecha', 'Hora'],
      order: [[literal('Cantidad'), 'DESC']],
      limit: 5
    });

    // 3. Servicios más solicitados
    const topServices = await Appointments.findAll({
      attributes: ['Servicio', [fn('COUNT', col('Servicio')), 'Cantidad']],
      where: {
        Fecha: { [Op.between]: [inicio, fin] }
      },
      group: ['Servicio'],
      order: [[literal('Cantidad'), 'DESC']],
      limit: 5
    });

    res.status(200).json({
      totalAppointments,
      topTimeSlots,
      topServices
    });

  } catch (error) {
    console.error('[ERROR][STATICS]:', error.message);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
