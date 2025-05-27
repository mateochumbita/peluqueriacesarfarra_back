import { create, findAll, findOne, update, remove, search} from '../../service/genericService.js';
import initModels from '../../models/init-models.js';
import { sequelizeDB } from '../../database/connection.database.js';

// Inicializar modelos
const models = initModels(sequelizeDB);
const Users = models.Users;

// Nombre de la tabla en Supabase
const supabaseTable = 'Users';


export const getAllUsers = findAll(Users, supabaseTable);
export const getUserById = findOne(Users); // Cambiado de getuserById a getUserById
export const updateUser = update(Users, supabaseTable);
export const deleteUser = remove(Users, supabaseTable);
export const searchUsers = search(Users, supabaseTable);