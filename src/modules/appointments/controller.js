import {
  findAll,
  findOne,
  update,
  remove,
  search,
} from "../../service/genericService.js";
import initModels from "../../models/init-models.js";
import { sequelizeDB } from "../../database/connection.database.js";
import { Op } from "sequelize";
import { sendAppointmentConfirmation } from "../../middlewares/sendAppointmentConfirmation.js";
import { sendAppointmentPaymentConfirmation } from "../../middlewares/sendAppointmentPaymentConfirmation.js";
import { supabase } from "../../database/supabase.js";
const models = initModels(sequelizeDB);
const Appointments = models.Appointments;
const Earnings = models.Earnings;
const Clients = models.Clients;
const Hairdressers_Services = models.Hairdressers_Services;
const Hairdressers = models.Hairdressers;
const Services = models.Services;
const supabaseTable = "Appointments";

// Crear Appointment y replicar en Earnings
export const createAppointment = async (req, res) => {
  try {
    const { IdCliente, Fecha, Hora, IdHairdresser_Service, Estado } = req.body;

    // 1. Validar que no haya otro turno igual (misma fecha, hora y servicio)
    const turnoExistente = await Appointments.findOne({
      where: {
        Fecha,
        Hora,
        IdHairdresser_Service,
      },
    });

    if (turnoExistente) {
      return res.status(400).json({
        error: "Turno ya reservado para esta fecha, hora y servicio.",
      });
    }

    // 2. Buscar el precio del servicio
    const hairdresserService = await Hairdressers_Services.findByPk(
      IdHairdresser_Service
    );
    if (!hairdresserService) {
      return res
        .status(400)
        .json({ error: "No se encontró el servicio del peluquero." });
    }

    const service = await Services.findByPk(hairdresserService.IdService);
    if (!service) {
      return res.status(400).json({ error: "No se encontró el servicio." });
    }

    // 3. Crear el turno (EstadoPago es obligatorio según tu modelo)
    const nuevoTurno = await Appointments.create({
      IdCliente,
      Fecha,
      Hora,
      IdHairdresser_Service,
      Estado,
    });

    // 4. Solo si EstadoPago es true, crear el registro en Earnings
    if (Estado === "Pagado") {
      await Earnings.create({
        Importe: service.Precio,
        IdAppointment: nuevoTurno.Id,
      });
      // Enviar email de confirmación de pago
      try {
        await sendAppointmentPaymentConfirmation(
          { body: { ...req.body, IdAppointment: nuevoTurno.Id } }, // <-- Se agrega el IdAppointment
          res,
          () => {}
        );
      } catch (e) {
        // El error ya se loguea en el middleware, no hace falta más manejo aquí
      }
    }

    // Enviar email de confirmación de turno (no frena el flujo si falla)
    try {
      await sendAppointmentConfirmation(
        { body: { ...req.body, IdAppointment: nuevoTurno.Id } }, // <-- Se agrega el IdAppointment
        res,
        () => {}
      );
    } catch (e) {
      // El error ya se loguea en el middleware, no hace falta más manejo aquí
    }

    res.status(201).json(nuevoTurno);
  } catch (error) {
    console.error("Error al crear el turno:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await models.Appointments.findAll({
      include: [
        {
          model: models.Hairdressers_Services,
          as: "HairdresserService",
          include: [
            {
              model: models.Hairdressers,
              as: "Hairdresser",
              attributes: ["Nombre"],
            },
            {
              model: models.Services,
              as: "Service",
              attributes: ["Nombre", "Descripcion"],
            },
          ],
        },
        {
          model: models.Clients,
          as: "Cliente",
          attributes: ["Nombre"],
        },
      ],
      order: [
        ['Fecha', 'DESC'],
        ['Hora', 'DESC'],
      ],
    });

    const localResults = appointments.map((appt) => {
      const originalData = appt.toJSON();
      return {
        ...originalData,
        desc: {
          Peluquero: appt.HairdresserService?.Hairdresser?.Nombre || null,
          Servicio: appt.HairdresserService?.Service?.Nombre || null,
          DescripcionServicio:
            appt.HairdresserService?.Service?.Descripcion || null,
        },
      };
    });

    const { data: supabaseResultsRaw, error } = await supabase
      .from("Appointments")
      .select("*");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Ordenamos los resultados de Supabase en el mismo orden (más reciente a más antiguo)
    const sortedSupabase = supabaseResultsRaw.sort((a, b) => {
      const dateA = new Date(`${a.Fecha}T${a.Hora}`);
      const dateB = new Date(`${b.Fecha}T${b.Hora}`);
      return dateB - dateA; // descendente
    });

    const enrichedSupabaseResults = await Promise.all(
      sortedSupabase.map(async (appt) => {
        const hairdresserService = await Hairdressers_Services.findOne({
          where: { Id: appt.IdHairdresser_Service },
          include: [
            {
              model: Hairdressers,
              as: "Hairdresser",
              attributes: ["Nombre"],
            },
            {
              model: Services,
              as: "Service",
              attributes: ["Nombre", "Descripcion"],
            },
          ],
        });

        const client = await Clients.findOne({
          where: { Id: appt.IdCliente },
          attributes: ["Nombre"],
        });

        return {
          ...appt,
          HairdresserService: hairdresserService
            ? {
                Id: hairdresserService.Id,
                IdHairdresser: hairdresserService.IdHairdresser,
                IdService: hairdresserService.IdService,
                Hairdresser: hairdresserService.Hairdresser
                  ? { Nombre: hairdresserService.Hairdresser.Nombre }
                  : null,
                Service: hairdresserService.Service
                  ? {
                      Nombre: hairdresserService.Service.Nombre,
                      Descripcion: hairdresserService.Service.Descripcion,
                    }
                  : null,
              }
            : null,
          Cliente: client ? { Nombre: client.Nombre } : null,
          desc:
            hairdresserService || client
              ? {
                  Peluquero: hairdresserService?.Hairdresser?.Nombre || null,
                  Servicio: hairdresserService?.Service?.Nombre || null,
                  DescripcionServicio:
                    hairdresserService?.Service?.Descripcion || null,
                  Cliente: client?.Nombre || null,
                }
              : null,
        };
      })
    );

    return res.status(200).json({
      localResults,
      supabaseResults: enrichedSupabaseResults,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAppointmentById = findOne(Appointments);
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { Estado, ...rest } = req.body;

    // Buscar el turno existente
    const turno = await Appointments.findByPk(id);
    if (!turno) {
      return res.status(404).json({ error: "Turno no encontrado." });
    }

    // Actualizar el turno
    await turno.update({ Estado, ...rest });

    // Si Estado es 'Pagado', crear el registro en Earnings si no existe
    if (Estado === "Pagado") {
      const existeEarning = await Earnings.findOne({
        where: { IdAppointment: turno.Id },
      });
      if (!existeEarning) {
        // Buscar el precio del servicio
        const hairdresserService = await Hairdressers_Services.findByPk(
          turno.IdHairdresser_Service
        );
        if (hairdresserService) {
          const service = await Services.findByPk(hairdresserService.IdService);
          if (service) {
            await Earnings.create({
              Importe: service.Precio,
              IdAppointment: turno.Id,
            });
          }
        }
      }

      // Sumar 1 punto de fidelidad al cliente
      const client = await models.Clients.findByPk(turno.IdCliente);
      if (client) {
        await client.increment("PuntosFidelidad", { by: 1 });
      }

      // Enviar email de confirmación de pago
      try {
        await sendAppointmentPaymentConfirmation(
          { body: { ...turno.dataValues, IdAppointment: turno.Id } },
          res,
          () => {}
        );
      } catch (e) {
        // El error ya se loguea en el middleware, no hace falta más manejo aquí
      }
    }

    res.status(200).json(turno);
  } catch (error) {
    console.error("Error al actualizar el turno:", error);
    res.status(500).json({ error: error.message });
  }
};
export const deleteAppointment = remove(Appointments, supabaseTable);
export const searchAppointments = search(Appointments, supabaseTable);
export const getAppointmentsStats = async (req, res) => {
  try {
    const capacidadMaximaDia = 30;

    // Fechas útiles
    const hoy = new Date();
    const hoyStr = hoy.toISOString().slice(0, 10);

    // Semana actual (lunes a domingo)
    const diaSemana = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1; // 0=domingo
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

    const inicioMesAnterior = new Date(
      hoy.getFullYear(),
      hoy.getMonth() - 1,
      1
    );
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

    // Helper para formato YYYY-MM-DD
    const toDateStr = (d) => d.toISOString().slice(0, 10);

    // --- Turnos ---
    // Hoy
    const turnosHoy = await Appointments.count({ where: { Fecha: hoyStr } });
    // Semana actual
    const turnosSemana = await Appointments.count({
      where: {
        Fecha: {
          [Op.between]: [toDateStr(inicioSemana), toDateStr(finSemana)],
        },
      },
    });
    // Mes actual
    const turnosMes = await Appointments.count({
      where: {
        Fecha: { [Op.between]: [toDateStr(inicioMes), toDateStr(finMes)] },
      },
    });

    // --- Turnos anteriores ---
    // Semana anterior
    const turnosSemanaAnterior = await Appointments.count({
      where: {
        Fecha: {
          [Op.between]: [
            toDateStr(inicioSemanaAnterior),
            toDateStr(finSemanaAnterior),
          ],
        },
      },
    });
    // Mes anterior
    const turnosMesAnterior = await Appointments.count({
      where: {
        Fecha: {
          [Op.between]: [
            toDateStr(inicioMesAnterior),
            toDateStr(finMesAnterior),
          ],
        },
      },
    });

    // --- Cancelaciones ---
    // Hoy
    const cancelacionesHoy = await Appointments.count({
      where: { Fecha: hoyStr, Estado: "Cancelado" },
    });
    // Semana actual
    const cancelacionesSemana = await Appointments.count({
      where: {
        Fecha: {
          [Op.between]: [toDateStr(inicioSemana), toDateStr(finSemana)],
        },
        Estado: "Cancelado",
      },
    });
    // Mes actual
    const cancelacionesMes = await Appointments.count({
      where: {
        Fecha: { [Op.between]: [toDateStr(inicioMes), toDateStr(finMes)] },
        Estado: "Cancelado",
      },
    });

    // --- Cancelaciones anteriores ---
    // Semana anterior
    const cancelacionesSemanaAnterior = await Appointments.count({
      where: {
        Fecha: {
          [Op.between]: [
            toDateStr(inicioSemanaAnterior),
            toDateStr(finSemanaAnterior),
          ],
        },
        Estado: "Cancelado",
      },
    });
    // Mes anterior
    const cancelacionesMesAnterior = await Appointments.count({
      where: {
        Fecha: {
          [Op.between]: [
            toDateStr(inicioMesAnterior),
            toDateStr(finMesAnterior),
          ],
        },
        Estado: "Cancelado",
      },
    });

    // --- Tasa de ocupación ---
    // Por día del mes actual
    const diasMes = finMes.getDate();
    const tasaOcupacionMes = (turnosMes / (diasMes * capacidadMaximaDia)) * 100;
    // Mes anterior
    const diasMesAnterior = finMesAnterior.getDate();
    const tasaOcupacionMesAnterior =
      (turnosMesAnterior / (diasMesAnterior * capacidadMaximaDia)) * 100;

    // Por semana actual
    const tasaOcupacionSemana = (turnosSemana / (7 * capacidadMaximaDia)) * 100;
    const tasaOcupacionSemanaAnterior =
      (turnosSemanaAnterior / (7 * capacidadMaximaDia)) * 100;

    // Por hoy
    const tasaOcupacionHoy = (turnosHoy / capacidadMaximaDia) * 100;

    // Redondear tasas a 1 decimal
    const tasaOcupacionHoyRed = parseFloat(tasaOcupacionHoy.toFixed(1));
    const tasaOcupacionSemanaRed = parseFloat(tasaOcupacionSemana.toFixed(1));
    const tasaOcupacionMesRed = parseFloat(tasaOcupacionMes.toFixed(1));
    const tasaOcupacionSemanaAnteriorRed = parseFloat(
      tasaOcupacionSemanaAnterior.toFixed(1)
    );
    const tasaOcupacionMesAnteriorRed = parseFloat(
      tasaOcupacionMesAnterior.toFixed(1)
    );



     // --- Turnos por día (lunes a sábado de la semana actual) ---
    const nombresDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const turnosPorDia = [];

    for (let i = 0; i < 6; i++) { // de lunes a sábado
      const fechaDia = new Date(inicioSemana);
      fechaDia.setDate(inicioSemana.getDate() + i);
      const fechaStr = toDateStr(fechaDia);

      const cantidad = await Appointments.count({
        where: { Fecha: fechaStr }
      });

      turnosPorDia.push({ dia: nombresDias[i], cantidad });
    }

    // Helper para calcular variación porcentual con 1 decimal
    const variacion = (actual, anterior) =>
      anterior === 0
        ? actual > 0
          ? 100.0
          : 0.0
        : parseFloat((((actual - anterior) / anterior) * 100).toFixed(1));

    res.json({
      turnos: {
        hoy: turnosHoy,
        semana: turnosSemana,
        mes: turnosMes,
        semanaAnterior: turnosSemanaAnterior,
        mesAnterior: turnosMesAnterior,
        variacionSemana: variacion(turnosSemana, turnosSemanaAnterior),
        variacionMes: variacion(turnosMes, turnosMesAnterior),
      },
      tasaOcupacion: {
        hoy: tasaOcupacionHoyRed,
        semana: tasaOcupacionSemanaRed,
        mes: tasaOcupacionMesRed,
        semanaAnterior: tasaOcupacionSemanaAnteriorRed,
        mesAnterior: tasaOcupacionMesAnteriorRed,
        variacionSemana: variacion(
          tasaOcupacionSemana,
          tasaOcupacionSemanaAnterior
        ),
        variacionMes: variacion(tasaOcupacionMes, tasaOcupacionMesAnterior),
      },
      cancelaciones: {
        hoy: cancelacionesHoy,
        semana: cancelacionesSemana,
        mes: cancelacionesMes,
        semanaAnterior: cancelacionesSemanaAnterior,
        mesAnterior: cancelacionesMesAnterior,
        variacionSemana: variacion(
          cancelacionesSemana,
          cancelacionesSemanaAnterior
        ),
        variacionMes: variacion(cancelacionesMes, cancelacionesMesAnterior),
      },
      turnosPorDia
    });
  } catch (error) {
    console.error("Error en getAppointmentsStats:", error);
    res.status(500).json({ error: error.message });
  }
};
 