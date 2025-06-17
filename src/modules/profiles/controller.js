import { create, findAll, findOne, update, remove, search } from '../../service/genericService.js';
import initModels from '../../models/init-models.js';
import { sequelizeDB } from '../../database/connection.database.js';


const models = initModels(sequelizeDB);
const Profiles = models.Profiles;


const supabaseTable = 'Profiles';

//crear perfil
export const createProfile = create(Profiles, supabaseTable);
//obtener todos los perfiles
export const getAllProfiles = findAll(Profiles, supabaseTable);
//obtener un perfil
export const getProfileById = findOne(Profiles);
//actualizar un perfil
export const updateProfile = update(Profiles, supabaseTable);
//eliminar un perfil
export const deleteProfile = remove(Profiles, supabaseTable);
//buscar un perfil
export const searchProfiles = search(Profiles, supabaseTable);