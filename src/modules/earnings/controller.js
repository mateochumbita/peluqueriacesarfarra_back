import { create, findAll, findOne, update, remove, search } from '../../service/genericService.js';
import initModels from '../../models/init-models.js';
import { sequelizeDB } from '../../database/connection.database.js';
import { Op } from 'sequelize';

// Inicializar modelos
const models = initModels(sequelizeDB);
const Earnings = models.Earnings;

// Nombre de la tabla en Supabase
const supabaseTable = 'Earnings';

// Controladores específicos para Earnings
export const createEarning = create(Earnings, supabaseTable);
export const getAllEarnings = findAll(Earnings, supabaseTable);
export const getEarningById = findOne(Earnings);
export const updateEarning = update(Earnings, supabaseTable);
export const deleteEarning = remove(Earnings, supabaseTable);
export const searchEarnings = search(Earnings, supabaseTable);

// Estadísticas de ingresos
export const getEarningsStats = async (req, res) => {
  try {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().slice(0, 10);

    // Semana actual (lunes a domingo)
    const diaSemana = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1;
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - diaSemana);
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);

    // Mes actual
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    // Periodos anteriores
    const inicioSemanaAnterior = new Date(inicioSemana);
    inicioSemanaAnterior.setDate(inicioSemana.getDate() - 7);
    const finSemanaAnterior = new Date(inicioSemanaAnterior);
    finSemanaAnterior.setDate(inicioSemanaAnterior.getDate() + 6);

    const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

    const toDateStr = d => d.toISOString().slice(0, 10);

    // Helper para variación porcentual
    const variacion = (actual, anterior) =>
      anterior === 0
        ? (actual > 0 ? 100.0 : 0.0)
        : parseFloat((((actual - anterior) / anterior) * 100).toFixed(1));

    // Helper para sumar ingresos en un rango de fechas
    const sumarIngresos = async (desde, hasta) => {
      const result = await Earnings.findAll({
        include: [{
          model: models.Appointments,
          as: 'Appointment',
          attributes: [],
          where: {
            Fecha: { [Op.between]: [toDateStr(desde), toDateStr(hasta)] }
          }
        }],
        attributes: [
          [sequelizeDB.fn('SUM', sequelizeDB.col('Importe')), 'total']
        ],
        raw: true
      });
      return parseFloat(result[0].total) || 0;
    };

    // Hoy
    const ingresosHoy = await sumarIngresos(hoy, hoy);

    // Semana actual
    const ingresosSemana = await sumarIngresos(inicioSemana, finSemana);

    // Mes actual
    const ingresosMes = await sumarIngresos(inicioMes, finMes);

    // Semana anterior
    const ingresosSemanaAnterior = await sumarIngresos(inicioSemanaAnterior, finSemanaAnterior);

    // Mes anterior
    const ingresosMesAnterior = await sumarIngresos(inicioMesAnterior, finMesAnterior);

    // --- Promedio diario ---
    const diasMes = finMes.getDate();
    const promedioDiario = ingresosMes / diasMes;

    const diasMesAnterior = finMesAnterior.getDate();
    const promedioDiarioAnterior = ingresosMesAnterior / diasMesAnterior;

    // --- Proyección mensual ---
    const diaActual = hoy.getDate();
    const proyeccionMes = (ingresosMes / diaActual) * diasMes;
    const proyeccionMesAnterior = (ingresosMesAnterior / (hoy.getMonth() === 0 ? 31 : diaActual)) * diasMesAnterior;

    // --- Tendencia últimos 6 meses ---
    const tendencia = [];
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      const fin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
      const total = await sumarIngresos(inicio, fin);
      tendencia.push({
        mes: `${inicio.getFullYear()}-${(inicio.getMonth() + 1).toString().padStart(2, '0')}`,
        total
      });
    }

    // --- Ingresos por día de martes a sábado (gráfico de barras) ---
    const dias = ['Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const ingresosPorDia = [];
    for (let i = 2; i <= 6; i++) {
      const result = await Earnings.findAll({
        include: [{
          model: models.Appointments,
          as: 'Appointment',
          attributes: [],
          where: sequelizeDB.where(
            sequelizeDB.fn('EXTRACT', sequelizeDB.literal('DOW FROM "Fecha"')), i
          )
        }],
        attributes: [
          [sequelizeDB.fn('SUM', sequelizeDB.col('Importe')), 'total']
        ],
        raw: true
      });
      ingresosPorDia.push({
        dia: dias[i - 2],
        total: parseFloat(result[0].total) || 0
      });
    }

    res.json({
      ingresos: {
        hoy: ingresosHoy,
        semana: ingresosSemana,
        mes: ingresosMes,
        semanaAnterior: ingresosSemanaAnterior,
        mesAnterior: ingresosMesAnterior,
        variacionSemana: variacion(ingresosSemana, ingresosSemanaAnterior),
        variacionMes: variacion(ingresosMes, ingresosMesAnterior),
        promedioDiario: parseFloat(promedioDiario.toFixed(2)),
        promedioDiarioAnterior: parseFloat(promedioDiarioAnterior.toFixed(2)),
        variacionPromedioDiario: variacion(promedioDiario, promedioDiarioAnterior),
        proyeccionMes: parseFloat(proyeccionMes.toFixed(2)),
        proyeccionMesAnterior: parseFloat(proyeccionMesAnterior.toFixed(2)),
        variacionProyeccion: variacion(proyeccionMes, proyeccionMesAnterior)
      },
      tendencia6Meses: tendencia,
      ingresosPorDia
    });
  } catch (error) {
    console.error('Error en getEarningsStats:', error);
    res.status(500).json({ error: error.message });
  }
};