import { create, findAll, findOne, update, remove, search } from '../../service/genericService.js';
import initModels from '../../models/init-models.js';
import { sequelizeDB } from '../../database/connection.database.js';

// Inicializar modelos
const models = initModels(sequelizeDB);
const Profiles = models.Profiles;

// Nombre de la tabla en Supabase
const supabaseTable = 'Profiles';

// Controladores específicos para Profiles
export const createProfile = create(Profiles, supabaseTable);
export const getAllProfiles = findAll(Profiles, supabaseTable);
export const getProfileById = findOne(Profiles);
export const updateProfile = update(Profiles, supabaseTable);
export const deleteProfile = remove(Profiles, supabaseTable);
export const searchProfiles = search(Profiles, supabaseTable);