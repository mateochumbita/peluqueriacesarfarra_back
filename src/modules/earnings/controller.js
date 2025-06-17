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
import { Op, fn, col, literal } from "sequelize";
import { DateTime } from "luxon";
// Inicializar modelos
const models = initModels(sequelizeDB);
const Earnings = models.Earnings;
const Appointments = models.Appointments;


const supabaseTable = "Earnings";

// crear ingreso
export const createEarning = create(Earnings, supabaseTable);
// obtener todos los ingresos
export const getAllEarnings = findAll(Earnings, supabaseTable);
// obtener un ingreso por id
export const getEarningById = findOne(Earnings);
// actualizar un ingreso
export const updateEarning = update(Earnings, supabaseTable);
// eliminar un ingreso
export const deleteEarning = remove(Earnings, supabaseTable);
// buscar un ingreso
export const searchEarnings = search(Earnings, supabaseTable);

// Estadísticas de ingresos
export const getEarningsStats = async (req, res) => {
  try {
    const zone = "America/Argentina/Buenos_Aires";
    const hoy = DateTime.now().setZone(zone);
    const redondear = (n) => parseFloat(n.toFixed(2));

    // Fechas clave
    const inicioHoy = hoy.startOf("day");
    const finHoy = hoy.endOf("day");
    //de lunes a sabados
    const inicioSemana = hoy.minus({ days: hoy.weekday - 1 }).startOf("day"); 
    const finSemana = inicioSemana.plus({ days: 5 }).endOf("day"); 

    const inicioSemanaAnterior = inicioSemana.minus({ weeks: 1 });
    const finSemanaAnterior = inicioSemanaAnterior
      .plus({ days: 5 })
      .endOf("day");

    const inicioMes = hoy.startOf("month");
    const finMes = hoy.endOf("month");

    const inicioMesAnterior = hoy.minus({ months: 1 }).startOf("month");
    const finMesAnterior = hoy.minus({ months: 1 }).endOf("month");

    const sumarIngresos = async (desde, hasta) => {
      const result = await Earnings.findAll({
        include: [
          {
            model: Appointments,
            as: "Appointment",
            attributes: [],
            where: {
              [Op.and]: [
                sequelizeDB.where(
                  literal(
                    `(TO_TIMESTAMP(CONCAT("Appointment"."Fecha", ' ', "Appointment"."Hora"), 'YYYY-MM-DD HH24:MI:SS') AT TIME ZONE 'America/Argentina/Buenos_Aires')`
                  ),
                  {
                    [Op.between]: [desde.toISO(), hasta.toISO()],
                  }
                ),
              ],
            },
          },
        ],
        attributes: [[fn("SUM", col("Importe")), "total"]],
        raw: true,
      });

      return parseFloat(result[0].total) || 0;
    };

    const variacion = (actual, anterior) =>
      anterior === 0
        ? actual > 0
          ? 100
          : 0
        : redondear(((actual - anterior) / anterior) * 100);

    // Calcular ingresos
    const [
      ingresosHoy,
      ingresosSemana,
      ingresosSemanaAnterior,
      ingresosMes,
      ingresosMesAnterior,
    ] = await Promise.all([
      sumarIngresos(inicioHoy, finHoy),
      sumarIngresos(inicioSemana, finSemana),
      sumarIngresos(inicioSemanaAnterior, finSemanaAnterior),
      sumarIngresos(inicioMes, finMes),
      sumarIngresos(inicioMesAnterior, finMesAnterior),
    ]);

    const diasMes = finMes.day;
    const diasMesAnterior = finMesAnterior.day;
    const diaActual = hoy.day;

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
      const fecha = hoy.minus({ months: i });
      const inicio = fecha.startOf("month");
      const fin = fecha.endOf("month");
      const total = await sumarIngresos(inicio, fin);
      tendencia.push({
        mes: `${meses[inicio.month - 1]} ${inicio.year}`,
        total,
      });
    }

    const nombresDias = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const ingresosPorDia = [];

    for (let i = 0; i < 6; i++) {
      const dia = inicioSemana.plus({ days: i });
      const total = await sumarIngresos(dia.startOf("day"), dia.endOf("day"));
      ingresosPorDia.push({
        dia: nombresDias[i],
        total,
      });
    }

    res.json({
      ingresos: {
        hoy: ingresosHoy,
        semana: ingresosSemana,
        semanaAnterior: ingresosSemanaAnterior,
        mes: ingresosMes,
        mesAnterior: ingresosMesAnterior,
        variacionSemana: variacion(ingresosSemana, ingresosSemanaAnterior),
        variacionMes: variacion(ingresosMes, ingresosMesAnterior),
        promedioDiario: redondear(promedioDiario),
        promedioDiarioAnterior: redondear(promedioDiarioAnterior),
        variacionPromedioDiario: variacion(
          promedioDiario,
          promedioDiarioAnterior
        ),
        proyeccionMes: redondear(proyeccionMes),
        proyeccionMesAnterior: redondear(proyeccionMesAnterior),
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
