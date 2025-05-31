import initModels from "../../models/init-models.js";
import { sequelizeDB } from "../../database/connection.database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const models = initModels(sequelizeDB);
const Users = models.Users;
const Clients = models.Clients;
const Profiles = models.Profiles;
const SECRET_KEY = process.env.JWT_SECRET;

// Registro de usuarios
export const register = async (req, res) => {
  try {
    const {
      username,
      password,
      habilitado,
      IdProfile,
      dni,
      nombre,
      telefono,
      email,
    } = req.body;

    if (
      !username ||
      !password ||
      habilitado === undefined ||
      !IdProfile ||
      !dni ||
      !nombre ||
      !telefono ||
      !email
    ) {
      return res
        .status(400)
        .json({ ok: false, msg: "Faltan datos obligatorios" });
    }

    const existingUser = await Users.findOne({ where: { Username: username } });
    if (existingUser) {
      return res
        .status(400)
        .json({ ok: false, msg: "El nombre de usuario ya existe" });
    }

    // Verificar el perfil
    const profile = await models.Profiles.findByPk(IdProfile);
    if (!profile) {
      return res
        .status(400)
        .json({ ok: false, msg: "Perfil inválido" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const newUser = await Users.create({
      Username: username,
      Password: hashedPassword,
      Habilitado: habilitado,
      IdProfile: IdProfile,
    });

    let createdEntity = null;
    let entityType = "";

    if (profile.Nombre.toLowerCase() === "cliente") {
      // Validar duplicado en Clients
      const existingClient = await Clients.findOne({ where: { Email: email } });
      if (existingClient) {
        return res.status(400).json({ ok: false, msg: "El email ya está registrado como cliente" });
      }

      createdEntity = await Clients.create({
        Dni: dni,
        Nombre: nombre,
        Telefono: telefono,
        Email: email,
        IdUser: newUser.Id,
      });
      entityType = "cliente";

    } else if (profile.Nombre.toLowerCase() === "admin") {
      // Validar duplicado en Hairdressers
      const existingHairdresser = await models.Hairdressers.findOne({ where: { Email: email } });
      if (existingHairdresser) {
        return res.status(400).json({ ok: false, msg: "El email ya está registrado como peluquero" });
      }

      createdEntity = await models.Hairdressers.create({
        Dni: dni,
        Nombre: nombre,
        Telefono: telefono,
        Email: email,
        IdUser: newUser.Id,
      });
      entityType = "peluquero";
    } else {
      return res.status(400).json({ ok: false, msg: "Tipo de perfil no soportado para registro automático" });
    }

    // Crear token
    if (!SECRET_KEY) {
      return res.status(500).json({
        ok: false,
        msg: "JWT_SECRET no definido en variables de entorno",
      });
    }

    const token = jwt.sign(
      { id: newUser.Id, username: newUser.Username },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    return res.status(201).json({
      ok: true,
      msg: `Usuario y ${entityType} registrados con éxito`,
      token,
      userId: newUser.Id,
      entityId: createdEntity.Id,
    });
  } catch (error) {
    console.error("Error en el registro:", error);
    return res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

// Login de usuarios
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ ok: false, msg: "Faltan datos" });
    }

    const user = await Users.findOne({ where: { Username: username } });

    if (!user) {
      return res.status(400).json({ ok: false, msg: "Usuario no encontrado" });
    }

    if (!user.Habilitado) {
      return res
        .status(403)
        .json({ ok: false, msg: "Usuario no habilitado para iniciar sesión" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(400).json({ ok: false, msg: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.Id, username: user.Username },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    return res.status(200).json({ ok: true, token, user });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    return res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};