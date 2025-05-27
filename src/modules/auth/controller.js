import initModels from "../../models/init-models.js";
import { sequelizeDB } from "../../database/connection.database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from '../../middlewares/SendWelcome.js';

const models = initModels(sequelizeDB);
const Users = models.Users;
const Clients = models.Clients;
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

    const existingClient = await Clients.findOne({ where: { Email: email } });
    if (existingClient) {
      return res
        .status(400)
        .json({ ok: false, msg: "El email ya está registrado como cliente" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Users.create({
      Username: username,
      Password: hashedPassword,
      Habilitado: habilitado,
      IdProfile: IdProfile,
    });

    const newClient = await Clients.create({
      Dni: dni,
      Nombre: nombre,
      Telefono: telefono,
      Email: email,
      IdUser: newUser.Id,
    });
    console.log("Nuevo cliente creado:", newClient);
    

    // Enviar email de bienvenida de forma segura
    try {
      await sendWelcomeEmail(
        { body: { IdCliente: newClient.dataValues.Id } }, // Usa dataValues.Id
        res,
        () => {}
      );
    } catch (e) {
      // El error ya se loguea en el middleware, no hace falta más manejo aquí
    }

    if (!SECRET_KEY) {
      return res
        .status(500)
        .json({
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
      msg: "Usuario y cliente registrados con éxito",
      token,
      userId: newUser.Id,
      clientId: newClient.Id,
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