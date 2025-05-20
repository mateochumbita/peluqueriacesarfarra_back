import { create, findAll, findOne, update, remove, search } from '../../service/genericService.js';
import initModels from '../../models/init-models.js';
import { sequelizeDB } from '../../database/connection.database.js';

// Inicializar modelos
const models = initModels(sequelizeDB);
const Earnings = models.Earnings;

// Nombre de la tabla en Supabase
const supabaseTable = 'Earnings';

// Controladores específicos para Earnings
export const createEarning = create(Earnings, supabaseTable);
export const getAllEarnings = findAll(Earnings, supabaseTable);
export const getEarningById = findOne(Earnings);
export const updateEarning = update(Earnings, supabaseTable);
export const deleteEarning = remove(Earnings, supabaseTable);
export const searchEarnings = search(Earnings, supabaseTable);