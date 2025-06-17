import { create, findAll, findOne, update, remove, search } from '../../service/genericService.js';
import initModels from '../../models/init-models.js';
import { sequelizeDB } from '../../database/connection.database.js';


const models = initModels(sequelizeDB);
const Services = models.Services;


const supabaseTable = 'Services';

// crear servicio
export const createService = create(Services, supabaseTable);
// obtener todos los servicios
export const getAllServices = findAll(Services, supabaseTable);
// obtener un servicio por id
export const getServiceById = findOne(Services);
//actualizar un servicio
export const updateService = update(Services, supabaseTable);
//eliminar un servicio
export const deleteService = remove(Services, supabaseTable);
//buscar un servicio
export const searchServices = search(Services, supabaseTable);