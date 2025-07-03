import {
  findAll,
  findOne,
  update,
  remove,
  search,
} from "../../service/genericService.js";
import initModels from "../../models/init-models.js";
import { sequelizeDB } from "../../database/connection.database.js";

import { Op, fn, col, where } from "sequelize";
import { sendAppointmentConfirmation } from "../../middlewares/sendAppointmentConfirmation.js";
import { sendAppointmentPaymentConfirmation } from "../../middlewares/sendAppointmentPaymentConfirmation.js";
import { supabase } from "../../database/supabase.js";
import { DateTime } from "luxon";
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
          { body: { ...req.body, IdAppointment: nuevoTurno.Id } }, // 
          res,
          () => {}
        );
      } catch (e) {
        console.error("Error al enviar el email de confirmación de pago:", e);
      }
    }

    // Enviar email de confirmación de turno (no frena el flujo si falla)
    try {
      await sendAppointmentConfirmation(
        { body: { ...req.body, IdAppointment: nuevoTurno.Id } }, 
        res,
        () => {}
      );
    } catch (e) {
      console.error("Error al enviar el email de confirmación de pago:", e);
    }

    res.status(201).json(nuevoTurno);
  } catch (error) {
    console.error("Error al crear el turno:", error);
    res.status(500).json({ error: error.message });
  }
};


//obtener todos los appointments cuyo estado sea reservado
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
              attributes: ["Nombre", "Descripcion", "Precio"],
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
        ["Fecha", "DESC"],
        ["Hora", "DESC"],
      ],
    });

    const localResults = appointments.map((appt) => {
      const originalData = appt.toJSON();
      return {
        ...originalData,
        desc: {
          Peluquero: appt.HairdresserService?.Hairdresser?.Nombre || null,
          Servicio: appt.HairdresserService?.Service?.Nombre || null,
          Precio: appt.HairdresserService?.Service?.Precio || null,
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

    // se ordena del más reciente al más antiguo
    const sortedSupabase = supabaseResultsRaw.sort((a, b) => {
      const dateA = new Date(`${a.Fecha}T${a.Hora}`);
      const dateB = new Date(`${b.Fecha}T${b.Hora}`);
      return dateB - dateA; // descendente
    });

    //se replica el orden en supabaseResults
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
              attributes: ["Nombre", "Descripcion", "Precio"],
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
                      Precio: hairdresserService.Service.Precio,
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

//obtener appointment por id
export const getAppointmentById = findOne(Appointments);

//obtener appointments por clientId
export const getAppointmentsByClientId = async (req, res) => {
  const { clientId } = req.params;

  try {
    // === BASE LOCAL ===
    const appointments = await Appointments.findAll({
      where: {
        IdCliente: clientId,
      },
      include: [
        {
          model: Hairdressers_Services,
          as: "HairdresserService",
          include: [
            {
              model: Hairdressers,
              as: "Hairdresser",
              attributes: ["Nombre"],
            },
            {
              model: Services,
              as: "Service",
              attributes: ["Nombre", "Descripcion", "Precio"],
            },
          ],
        },
        {
          model: Clients,
          as: "Cliente",
          attributes: ["Nombre"],
        },
      ],
      order: [
        ["Fecha", "DESC"],
        ["Hora", "DESC"],
      ],
    });

    const localResults = appointments.map((appt) => {
      const originalData = appt.toJSON();
      return {
        ...originalData,
        desc: {
          Peluquero: appt.HairdresserService?.Hairdresser?.Nombre || null,
          Servicio: appt.HairdresserService?.Service?.Nombre || null,
          Precio: appt.HairdresserService?.Service?.Precio || null,
          DescripcionServicio:
            appt.HairdresserService?.Service?.Descripcion || null,
        },
      };
    });

    // === SUPABASE ===
    const { data: supabaseRaw, error } = await supabase
      .from("Appointments")
      .select("*")
      .eq("IdCliente", clientId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const sortedSupabase = supabaseRaw.sort((a, b) => {
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
              attributes: ["Nombre", "Descripcion", "Precio"],
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
                      Precio: hairdresserService.Service.Precio,
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
    console.error("Error en getAppointmentsByClientId:", error);
    return res.status(500).json({ error: error.message });
  }
};

//actualizar appointment
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

//eliminar appointment
export const deleteAppointment = remove(Appointments, supabaseTable);
// buscar appointment
export const searchAppointments = search(Appointments, supabaseTable);

//obtener estadisticas de los appointments
export const getAppointmentsStats = async (req, res) => {
  try {
    const capacidadMaximaDia = 30;
    const zone = "America/Argentina/Buenos_Aires";
    const hoy = DateTime.now().setZone(zone);

    // Fechas clave
    const inicioHoy = hoy.startOf("day");
    const finHoy = hoy.endOf("day");

    // Semana actual (lunes a sábado)
    const inicioSemana = hoy.minus({ days: hoy.weekday - 1 }).startOf("day");
    const finSemana = inicioSemana.plus({ days: 5 }).endOf("day");

    // Semana anterior
    const inicioSemanaAnterior = inicioSemana.minus({ weeks: 1 });
    const finSemanaAnterior = inicioSemanaAnterior
      .plus({ days: 6 })
      .endOf("day");

    // Mes actual
    const inicioMes = hoy.startOf("month");
    const finMes = hoy.endOf("month");

    // Mes anterior
    const inicioMesAnterior = hoy.minus({ months: 1 }).startOf("month");
    const finMesAnterior = hoy.minus({ months: 1 }).endOf("month");

    const redondear = (valor) => parseFloat(valor.toFixed(1));

    // Helper  TIMESTAMP(Fecha, Hora)
    const contar = async (inicio, fin, estado = null) => {
      const whereCond = {
        [Op.and]: [
          where(
            fn(
              "TO_TIMESTAMP",
              fn("CONCAT", col("Fecha"), " ", col("Hora")),
              "YYYY-MM-DD HH24:MI:SS"
            ),
            {
              [Op.between]: [inicio.toISO(), fin.toISO()],
            }
          ),
        ],
      };
      if (estado) whereCond.Estado = estado;
      return await Appointments.count({ where: whereCond });
    };

    const [
      turnosHoy,
      turnosSemana,
      turnosMes,
      turnosSemanaAnterior,
      turnosMesAnterior,
      cancelacionesHoy,
      cancelacionesSemana,
      cancelacionesMes,
      cancelacionesSemanaAnterior,
      cancelacionesMesAnterior,
    ] = await Promise.all([
      contar(inicioHoy, finHoy),
      contar(inicioSemana, finSemana),
      contar(inicioMes, finMes),
      contar(inicioSemanaAnterior, finSemanaAnterior),
      contar(inicioMesAnterior, finMesAnterior),
      contar(inicioHoy, finHoy, "Cancelado"),
      contar(inicioSemana, finSemana, "Cancelado"),
      contar(inicioMes, finMes, "Cancelado"),
      contar(inicioSemanaAnterior, finSemanaAnterior, "Cancelado"),
      contar(inicioMesAnterior, finMesAnterior, "Cancelado"),
    ]);

    const tasaOcupacionHoy = (turnosHoy / capacidadMaximaDia) * 100;
    const tasaOcupacionSemana = (turnosSemana / (6 * capacidadMaximaDia)) * 100; // lunes a sábado
    const tasaOcupacionSemanaAnterior =
      (turnosSemanaAnterior / (6 * capacidadMaximaDia)) * 100;
    const diasMes = finMes.day;
    const diasMesAnterior = finMesAnterior.day;
    const tasaOcupacionMes = (turnosMes / (diasMes * capacidadMaximaDia)) * 100;
    const tasaOcupacionMesAnterior =
      (turnosMesAnterior / (diasMesAnterior * capacidadMaximaDia)) * 100;

    const nombresDias = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const turnosPorDia = [];

    for (let i = 0; i < 6; i++) {
      const dia = inicioSemana.plus({ days: i });
      const cantidad = await contar(dia.startOf("day"), dia.endOf("day"));
      turnosPorDia.push({ dia: nombresDias[i], cantidad });
    }

    const variacion = (actual, anterior) =>
      anterior === 0
        ? actual > 0
          ? 100.0
          : 0.0
        : redondear(((actual - anterior) / anterior) * 100);

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
        hoy: redondear(tasaOcupacionHoy),
        semana: redondear(tasaOcupacionSemana),
        mes: redondear(tasaOcupacionMes),
        semanaAnterior: redondear(tasaOcupacionSemanaAnterior),
        mesAnterior: redondear(tasaOcupacionMesAnterior),
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
      turnosPorDia,
    });
  } catch (error) {
    console.error("Error en getAppointmentsStats:", error);
    res.status(500).json({ error: error.message });
  }
};


//obtener los turnos del dia de la fecha
export const getAllAppointmentsDay = async (req, res) => {
  try {
    const hoy = new Date().toISOString().slice(0, 10); 

    // === BASE LOCAL ===
    const appointments = await models.Appointments.findAll({
      where: {
        Fecha: hoy,
        Estado: "Reservado",
      },
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
        ["Fecha", "DESC"],
        ["Hora", "DESC"],
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
      .select("*")
      .eq("Fecha", hoy)
      .eq("Estado", "Reservado"); 
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const sortedSupabase = supabaseResultsRaw.sort((a, b) => {
      const dateA = new Date(`${a.Fecha}T${a.Hora}`);
      const dateB = new Date(`${b.Fecha}T${b.Hora}`);
      return dateB - dateA;
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
    console.error("Error en getAllAppointmentsDay:", error);
    return res.status(500).json({ error: error.message });
  }
};
