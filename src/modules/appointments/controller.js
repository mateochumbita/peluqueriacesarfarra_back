import { create, findAll, findOne, update, remove, search } from '../../service/genericService.js';
import initModels from '../../models/init-models.js';
import { sequelizeDB } from '../../database/connection.database.js';

// Inicializar modelos
const models = initModels(sequelizeDB);
const Appointments = models.Appointments;

// Nombre de la tabla en Supabase
const supabaseTable = 'Appointments';

// Controladores específicos para Appointments
export const createAppointment = create(Appointments, supabaseTable);
export const getAllAppointments = findAll(Appointments, supabaseTable);
export const getAppointmentById = findOne(Appointments);
export const updateAppointment = update(Appointments, supabaseTable);
export const deleteAppointment = remove(Appointments, supabaseTable);
export const searchAppointments = search(Appointments, supabaseTable);