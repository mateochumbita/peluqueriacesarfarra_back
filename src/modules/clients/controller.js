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
import { supabase } from "../../database/supabase.js";

// Inicializar modelos
const models = initModels(sequelizeDB);
const Clients = models.Clients;
const Users = models.Users;

// Nombre de la tabla en Supabase
const supabaseTable = "Clients";

// Controladores específicos para Clients
export const createClient = create(Clients, supabaseTable);
export const getAllClients = async (req, res) => {
  try {
    // --- Local ---
    const localResults = await Clients.findAll({
      include: [
        {
          model: Users,
          as: "User",
          where: { Habilitado: true },
          attributes: [], // No devolvemos los datos del user
        },
      ],
    });

    // --- Supabase: trae todos los clients ---
    const { data, error } = await supabase.from(supabaseTable).select("*");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // ⚠️ Filtramos en memoria (porque no podemos hacer join en Supabase)
    const supabaseResults = [];

    for (const client of data) {
      // Buscamos el usuario correspondiente desde la tabla Users en Sequelize
      const user = await Users.findOne({
        where: {
          Id: client.IdUser,
          Habilitado: true,
        },
        attributes: ["Id"],
      });

      if (user) {
        supabaseResults.push(client);
      }
    }

    res.status(200).json({ localResults, supabaseResults });
  } catch (error) {
    console.error("Error en getAllClients:", error);
    res.status(500).json({ error: error.message });
  }
};
export const getAllDisabledClients = async (req, res) => {
  try {
    // --- Local ---
    const localResults = await Clients.findAll({
      include: [
        {
          model: Users,
          as: "User",
          where: { Habilitado: false },
          attributes: [], // No devolvemos los datos del user
        },
      ],
    });

    // --- Supabase: trae todos los clients ---
    const { data, error } = await supabase.from(supabaseTable).select("*");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // ⚠️ Filtramos en memoria (porque no podemos hacer join en Supabase)
    const supabaseResults = [];

    for (const client of data) {
      // Buscamos el usuario correspondiente desde la tabla Users en Sequelize
      const user = await Users.findOne({
        where: {
          Id: client.IdUser,
          Habilitado: false,
        },
        attributes: ["Id"],
      });

      if (user) {
        supabaseResults.push(client);
      }
    }

    res.status(200).json({ localResults, supabaseResults });
  } catch (error) {
    console.error("Error en getAllClients:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getClientById = findOne(Clients);
export const updateClient = update(Clients, supabaseTable);
export const deleteClient = remove(Clients, supabaseTable);
export const searchClients = search(Clients, supabaseTable);

// Estadísticas de clientes
export const getClientsStats = async (req, res) => {
  try {
    // Fechas útiles
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

    const inicioMesAnterior = new Date(
      hoy.getFullYear(),
      hoy.getMonth() - 1,
      1
    );
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

    // Helper para formato YYYY-MM-DD
    const toDateStr = (d) => d.toISOString().slice(0, 10);

    // --- Clientes creados ---
    // Hoy
    const clientesHoy = await Clients.count({
      where: { FechaRegistro: { [Op.gte]: hoyStr } },
    });
    // Semana actual
    const clientesSemana = await Clients.count({
      where: {
        FechaRegistro: {
          [Op.between]: [toDateStr(inicioSemana), toDateStr(finSemana)],
        },
      },
    });
    // Mes actual
    const clientesMes = await Clients.count({
      where: {
        FechaRegistro: {
          [Op.between]: [toDateStr(inicioMes), toDateStr(finMes)],
        },
      },
    });

    // Semana anterior
    const clientesSemanaAnterior = await Clients.count({
      where: {
        FechaRegistro: {
          [Op.between]: [
            toDateStr(inicioSemanaAnterior),
            toDateStr(finSemanaAnterior),
          ],
        },
      },
    });
    // Mes anterior
    const clientesMesAnterior = await Clients.count({
      where: {
        FechaRegistro: {
          [Op.between]: [
            toDateStr(inicioMesAnterior),
            toDateStr(finMesAnterior),
          ],
        },
      },
    });

    // --- Clientes recurrentes (más de un turno en el último mes) ---
    const Appointments = models.Appointments;
    const unMesAtras = new Date(hoy);
    unMesAtras.setMonth(hoy.getMonth() - 1);

    // Buscar clientes con más de un turno en el último mes
    const recurrentesRaw = await Appointments.findAll({
      attributes: [
        "IdCliente",
        [sequelizeDB.fn("COUNT", sequelizeDB.col("Id")), "turnos"],
      ],
      where: {
        Fecha: { [Op.gte]: toDateStr(unMesAtras) },
      },
      group: ["IdCliente"],
      having: sequelizeDB.literal('COUNT("Id") > 1'),
    });
    const clientesRecurrentes = recurrentesRaw.length;

    // --- Ranking de puntos de fidelidad ---
    const ranking = await Clients.findAll({
      attributes: ["Id", "Nombre", "Email", "PuntosFidelidad"],
      order: [["PuntosFidelidad", "DESC"]],
      limit: 10,
    });

    // Helper para variación porcentual
    const variacion = (actual, anterior) =>
      anterior === 0
        ? actual > 0
          ? 100.0
          : 0.0
        : parseFloat((((actual - anterior) / anterior) * 100).toFixed(1));

    res.json({
      clientes: {
        hoy: clientesHoy,
        semana: clientesSemana,
        mes: clientesMes,
        semanaAnterior: clientesSemanaAnterior,
        mesAnterior: clientesMesAnterior,
        variacionSemana: variacion(clientesSemana, clientesSemanaAnterior),
        variacionMes: variacion(clientesMes, clientesMesAnterior),
      },
      recurrentes: clientesRecurrentes,
      ranking,
    });
  } catch (error) {
    console.error("Error en getClientsStats:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getClientByUserId = async (req, res) => {
  const { idUser } = req.params;

  try {
    const client = await Clients.findOne({
      where: { IdUser: idUser },
    });

    if (!client) {
      return res
        .status(404)
        .json({
          message: "Cliente no encontrado para el IdUser proporcionado",
        });
    }

    res.json(client);
  } catch (error) {
    console.error("Error en getClientByUserId:", error);
    res.status(500).json({ error: error.message });
  }
};
