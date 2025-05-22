import { create, findAll, findOne, update, remove, search } from '../../service/genericService.js';
import initModels from '../../models/init-models.js';
import { sequelizeDB } from '../../database/connection.database.js';

// Inicializar modelos
const models = initModels(sequelizeDB);
const Hairdressers_Services = models.Hairdressers_Services;

// Nombre de la tabla en Supabase
const supabaseTable = 'Hairdressers_Services';

// Controladores específicos para Hairdressers_Services
export const createHairdresserService = create(Hairdressers_Services, supabaseTable);
export const getAllHairdresserServices = findAll(Hairdressers_Services, supabaseTable);
export const getHairdresserServiceById = findOne(Hairdressers_Services);
export const updateHairdresserService = update(Hairdressers_Services, supabaseTable);
export const deleteHairdresserService = remove(Hairdressers_Services, supabaseTable);
export const searchHairdresserServices = search(Hairdressers_Services, supabaseTable);