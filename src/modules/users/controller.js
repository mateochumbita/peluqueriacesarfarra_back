import { create, findAll, findOne, update, remove, search} from '../../service/genericService.js';
import initModels from '../../models/init-models.js';
import { sequelizeDB } from '../../database/connection.database.js';

// Inicializar modelos
const models = initModels(sequelizeDB);
const Users = models.Users;


const supabaseTable = 'Users';

//obtener todos los usuarios
export const getAllUsers = findAll(Users, supabaseTable);
//obtener un usuario por id
export const getUserById = findOne(Users); 
//actualizar usuario
export const updateUser = update(Users, supabaseTable);
//eliminar usuario
export const deleteUser = remove(Users, supabaseTable);
//buscar usuario
export const searchUsers = search(Users, supabaseTable);