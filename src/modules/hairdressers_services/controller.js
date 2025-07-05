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
import { supabase } from "../../database/supabase.js";

const models = initModels(sequelizeDB);
const Hairdressers_Services = models.Hairdressers_Services;
const Hairdressers = models.Hairdressers;
const Services = models.Services;

const supabaseTable = "Hairdressers_Services";

// crear HairdresserService
export const createHairdresserService = create(
  Hairdressers_Services,
  supabaseTable
);

// obtener todos los HairdresserServices
export const getAllHairdresserServices = async (req, res) => {
  try {
    // Obtener registros locales desde Sequelize
    const localResultsRaw = await Hairdressers_Services.findAll({
      include: [
        {
          model: Hairdressers,
          as: "Hairdresser",
          attributes: ["Id", "Nombre"],
        },
        {
          model: Services,
          as: "Service",
          attributes: ["Id", "Nombre", "Precio"],
        },
      ],
    });

    // Formatear resultados locales para agregar los datos requeridos
    const localResults = localResultsRaw.map((item) => ({
      Id: item.Id,
      IdHairdresser: item.IdHairdresser,
      IdService: item.IdService,
      Hairdresser: {
        Id: item.Hairdresser?.Id,
        Nombre: item.Hairdresser?.Nombre,
      },
      Service: {
        Id: item.Service?.Id,
        Nombre: item.Service?.Nombre,
        Precio: item.Service?.Precio,
      },
    }));

    // Obtener datos desde Supabase
    const { data: supabaseData, error } = await supabase
      .from(supabaseTable)
      .select("*");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Cargar Hairdressers y Services para poder cruzar
    const [allHairdressers, allServices] = await Promise.all([
      Hairdressers.findAll({ attributes: ["Id", "Nombre"] }),
      Services.findAll({ attributes: ["Id", "Nombre", "Precio"] }), // <--- aquí
    ]);

    const hairdresserMap = new Map();
    allHairdressers.forEach((h) => {
      hairdresserMap.set(h.Id, { Id: h.Id, Nombre: h.Nombre });
    });

    const serviceMap = new Map();
    allServices.forEach((s) => {
      serviceMap.set(s.Id, { Id: s.Id, Nombre: s.Nombre, Precio: s.Precio });
    });

    // Formatear resultados de Supabase
    const supabaseResults = supabaseData.map((item) => ({
      ...item,
      Hairdresser: hairdresserMap.get(item.IdHairdresser) || null,
      Service: serviceMap.get(item.IdService) || null,
    }));

    res.status(200).json({ localResults, supabaseResults });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// obtener HairdresserService por id
export const getHairdresserServiceById = findOne(Hairdressers_Services);
// actualizar HairdresserService
export const updateHairdresserService = update(
  Hairdressers_Services,
  supabaseTable
);
// eliminar HairdresserService
export const deleteHairdresserService = remove(
  Hairdressers_Services,
  supabaseTable
);
// buscar HairdresserService
export const searchHairdresserServices = search(
  Hairdressers_Services,
  supabaseTable
);
