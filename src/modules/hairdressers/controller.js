import { create, findAll, findOne, update, remove, search } from '../../service/genericService.js';
import initModels from '../../models/init-models.js';
import { sequelizeDB } from '../../database/connection.database.js';

// Inicializar modelos
const models = initModels(sequelizeDB);
const Hairdressers = models.Hairdressers;

// Nombre de la tabla en Supabase
const supabaseTable = 'Hairdressers';

// Controladores específicos para Clients
export const createHairdressers = create(Hairdressers, supabaseTable);
export const getAllHairdressers = findAll(Hairdressers, supabaseTable);
export const getHairdresserById = findOne(Hairdressers);
export const updateHairdresser = update(Hairdressers, supabaseTable);
export const deleteHairdresser = remove(Hairdressers, supabaseTable);
export const searchHairdressers = search(Hairdressers, supabaseTable);