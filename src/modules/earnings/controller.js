import {
  create,
  findAll,
  findOne,
  update,
  remove,
  search,
} from "../../service/genericService.js";
import initModels from "../../models/init-models.js";
import { sequelizeDB } from "../../database/connection.database.js";
import { Op } from "sequelize";

// Inicializar modelos
const models = initModels(sequelizeDB);
const Earnings = models.Earnings;

// Nombre de la tabla en Supabase
const supabaseTable = "Earnings";

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
    const today = new Date();
    const formatDate = (date) => date.toISOString().slice(0, 10);
    const getDow = (date) => (date.getDay() === 0 ? 6 : date.getDay() - 1); // lunes = 0

    // Fechas clave
    const weekDay = getDow(today);
    const monday = new Date(today);
    monday.setDate(today.getDate() - weekDay);
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);

    const lastMonday = new Date(monday);
    lastMonday.setDate(monday.getDate() - 7);
    const lastSaturday = new Date(lastMonday);
    lastSaturday.setDate(lastMonday.getDate() + 5);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Función para sumar ingresos en un rango de fechas
    const sumarIngresos = async (from, to) => {
      const result = await Earnings.findAll({
        include: [
          {
            model: models.Appointments,
            as: "Appointment",
            attributes: [],
            where: {
              Fecha: { [Op.between]: [formatDate(from), formatDate(to)] },
            },
          },
        ],
        attributes: [
          [sequelizeDB.fn("SUM", sequelizeDB.col("Importe")), "total"],
        ],
        raw: true,
      });
      return parseFloat(result[0].total) || 0;
    };

    // Variación en porcentaje
    const variacion = (actual, anterior) => {
      if (anterior === 0) return actual > 0 ? 100 : 0;
      return parseFloat((((actual - anterior) / anterior) * 100).toFixed(1));
    };

    // --- Cálculos principales ---
    const [
      ingresosHoy,
      ingresosSemana,
      ingresosSemanaAnterior,
      ingresosMes,
      ingresosMesAnterior,
    ] = await Promise.all([
      sumarIngresos(today, today),
      sumarIngresos(monday, saturday),
      sumarIngresos(lastMonday, lastSaturday),
      sumarIngresos(startOfMonth, endOfMonth),
      sumarIngresos(startOfLastMonth, endOfLastMonth),
    ]);

    const diasMes = endOfMonth.getDate();
    const diasMesAnterior = endOfLastMonth.getDate();
    const diaActual = today.getDate();

    const promedioDiario = ingresosMes / diasMes;
    const promedioDiarioAnterior = ingresosMesAnterior / diasMesAnterior;
    const proyeccionMes = (ingresosMes / diaActual) * diasMes;
    const proyeccionMesAnterior =
      (ingresosMesAnterior / diaActual) * diasMesAnterior;
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    const tendencia = [];
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      const fin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
      const total = await sumarIngresos(inicio, fin);
      tendencia.push({
        mes: `${meses[inicio.getMonth()]} ${inicio.getFullYear()}`,
        total,
      });
    }

    // Ingresos por día (lunes a sábado de esta semana)
    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const ingresosPorDia = [];

    for (let i = 1; i <= 6; i++) {
      const result = await Earnings.findAll({
        include: [
          {
            model: models.Appointments,
            as: "Appointment",
            attributes: [],
            where: {
              Fecha: {
                [Op.between]: [formatDate(monday), formatDate(saturday)],
              },
              [Op.and]: sequelizeDB.where(
                sequelizeDB.fn(
                  "EXTRACT",
                  sequelizeDB.literal('"DOW" FROM "Fecha"')
                ),
                i
              ),
            },
          },
        ],
        attributes: [
          [sequelizeDB.fn("SUM", sequelizeDB.col("Importe")), "total"],
        ],
        raw: true,
      });

      ingresosPorDia.push({
        dia: dias[i],
        total: parseFloat(result[0].total) || 0,
      });
    }

    // --- Respuesta ---
    res.json({
      ingresos: {
        hoy: ingresosHoy,
        semana: ingresosSemana,
        semanaAnterior: ingresosSemanaAnterior,
        mes: ingresosMes,
        mesAnterior: ingresosMesAnterior,
        variacionSemana: variacion(ingresosSemana, ingresosSemanaAnterior),
        variacionMes: variacion(ingresosMes, ingresosMesAnterior),
        promedioDiario: parseFloat(promedioDiario.toFixed(2)),
        promedioDiarioAnterior: parseFloat(promedioDiarioAnterior.toFixed(2)),
        variacionPromedioDiario: variacion(
          promedioDiario,
          promedioDiarioAnterior
        ),
        proyeccionMes: parseFloat(proyeccionMes.toFixed(2)),
        proyeccionMesAnterior: parseFloat(proyeccionMesAnterior.toFixed(2)),
        variacionProyeccion: variacion(proyeccionMes, proyeccionMesAnterior),
      },
      tendencia6Meses: tendencia,
      ingresosPorDia,
    });
  } catch (error) {
    console.error("Error en getEarningsStats:", error);
    res.status(500).json({ error: error.message });
  }
};
