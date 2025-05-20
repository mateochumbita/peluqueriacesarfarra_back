import { create, findAll, findOne, update, remove, search } from '../../service/genericService.js';
import initModels from '../../models/init-models.js';
import { sequelizeDB } from '../../database/connection.database.js';

// Inicializar modelos
const models = initModels(sequelizeDB);
const Services = models.Services;

// Nombre de la tabla en Supabase
const supabaseTable = 'Services';

// Controladores específicos para Services
export const createService = create(Services, supabaseTable);
export const getAllServices = findAll(Services, supabaseTable);
export const getServiceById = findOne(Services);
export const updateService = update(Services, supabaseTable);
export const deleteService = remove(Services, supabaseTable);
export const searchServices = search(Services, supabaseTable);