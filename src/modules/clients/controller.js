import { create, findAll, findOne, update, remove, search } from '../../service/genericService.js';
import initModels from '../../models/init-models.js';
import { sequelizeDB } from '../../database/connection.database.js';

// Inicializar modelos
const models = initModels(sequelizeDB);
const Clients = models.Clients;

// Nombre de la tabla en Supabase
const supabaseTable = 'Clients';

// Controladores específicos para Clients
export const createClient = create(Clients, supabaseTable);
export const getAllClients = findAll(Clients, supabaseTable);
export const getClientById = findOne(Clients);
export const updateClient = update(Clients, supabaseTable);
export const deleteClient = remove(Clients, supabaseTable);
export const searchClients = search(Clients, supabaseTable);