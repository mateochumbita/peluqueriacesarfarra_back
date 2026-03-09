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
    return res.status(500).json({ ok: false, msg: "Error en el servidor", error });
  }
};

// Login de usuarios
export const login = async (req, res) => {
  try {
    console.log("📥 LOGIN REQUEST BODY:", req.body);

    const { username, password } = req.body;

    if (!username || !password) {
      console.log("❌ Datos faltantes en login");
      return res.status(400).json({ ok: false, msg: "Faltan datos" });
    }

    console.log("🔍 Buscando usuario en la BD:", username);

    const user = await Users.findOne({
      where: { Username: username },
      include: {
        model: Profiles,
        as: "Profile",
        attributes: ["Nombre"],
      },
    });

    console.log("🔎 Resultado de Users.findOne:", user);

    if (!user) {
      console.log("❌ Usuario no encontrado en la base");
      return res.status(400).json({ ok: false, msg: "Usuario no encontrado" });
    }

    if (!user.Habilitado) {
      console.log("⛔ Usuario encontrado, pero no habilitado");
      return res.status(403).json({
        ok: false,
        msg: "Usuario no habilitado para iniciar sesión",
      });
    }

    console.log("🔐 Validando contraseña...");

    const isPasswordValid = await bcrypt.compare(password, user.Password);

    if (!isPasswordValid) {
      console.log("❌ Contraseña incorrecta");
      return res.status(400).json({ ok: false, msg: "Contraseña incorrecta" });
    }

    console.log("🔑 Generando token...");

    const token = jwt.sign(
      { id: user.Id, username: user.Username },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    console.log("✅ Login exitoso:", user.Id);

    return res.status(200).json({
      ok: true,
      token,
      user: {
        Id: user.Id,
        Username: user.Username,
        IdProfile: user.IdProfile,
        Profile: user.Profile,
      },
    });

  } catch (error) {
    console.error("💥 ERROR en login:", error);
    console.error("📌 Mensaje:", error.message);
    console.error("📌 Stack:", error.stack);

    return res.status(500).json({
      ok: false,
      msg: "Error en el servidor",
      error: error.message,  // 🔥 OPCIONAL: ver causa real
      stack: error.stack,    // 🔥 SOLO PARA DEBUG
    });
  }
};