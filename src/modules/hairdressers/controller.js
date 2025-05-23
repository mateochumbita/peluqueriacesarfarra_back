import { create, findAll, findOne, update, remove, search } from '../../service/genericService.js';
import initModels from '../../models/init-models.js';
import { sequelizeDB } from '../../database/connection.database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Inicializar modelos
const models = initModels(sequelizeDB);
const Users = models.Users;
const Hairdressers = models.Hairdressers;

// Nombre de la tabla en Supabase
const supabaseTable = 'Hairdressers';

const SECRET_KEY = process.env.JWT_SECRET;

// Controladores específicos para Clients
export const createHairdressers = create(Hairdressers, supabaseTable);
export const getAllHairdressers = findAll(Hairdressers, supabaseTable);
export const getHairdresserById = findOne(Hairdressers);
export const updateHairdresser = update(Hairdressers, supabaseTable);
export const deleteHairdresser = remove(Hairdressers, supabaseTable);
export const searchHairdressers = search(Hairdressers, supabaseTable);

// Crear peluquero y usuario asociado
export const createHairdresserWithUser = async (req, res) => {
  try {
    const {
      username,
      password,
      habilitado,
      IdProfile,
      // Datos de Hairdresser
      dni,
      nombre,
      apellido,
      telefono,
      email
    } = req.body;

    // Validaciones mínimas necesarias
    if (!username || !password || habilitado === undefined || !IdProfile ||
        !dni || !nombre || !apellido || !telefono || !email) {
      return res.status(400).json({ ok: false, msg: "Faltan datos obligatorios" });
    }

    // Validar usuario existente
    const existingUser = await Users.findOne({ where: { Username: username } });
    if (existingUser) {
      return res.status(400).json({ ok: false, msg: "El nombre de usuario ya existe" });
    }

    // Validar email de peluquero existente
    const existingHairdresser = await Hairdressers.findOne({ where: { Email: email } });
    if (existingHairdresser) {
      return res.status(400).json({ ok: false, msg: "El email ya está registrado como peluquero" });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await Users.create({
      Username: username,
      Password: hashedPassword,
      Habilitado: habilitado,
      IdProfile: IdProfile
    });

    // Crear peluquero vinculado al usuario
    const newHairdresser = await Hairdressers.create({
      Dni: dni,
      Nombre: nombre,
      Apellido: apellido,
      Telefono: telefono,
      Email: email,
      IdUser: newUser.Id
    });

    // Opcional: generar token
    let token = null;
    if (SECRET_KEY) {
      token = jwt.sign(
        { id: newUser.Id, username: newUser.Username },
        SECRET_KEY,
        { expiresIn: '24h' }
      );
    }

    return res.status(201).json({
      ok: true,
      msg: "Usuario y peluquero registrados con éxito",
      token,
      userId: newUser.Id,
      hairdresserId: newHairdresser.Id
    });

  } catch (error) {
    console.error("Error en el registro de peluquero:", error);
    return res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};