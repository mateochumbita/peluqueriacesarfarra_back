import { supabase } from "../database/supabase.js";
import { Op } from "sequelize";
import initModels from "../models/init-models.js";
import { sequelizeDB } from "../database/connection.database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



const models = initModels(sequelizeDB);

const SECRET_KEY = process.env.JWT_SECRET;

const Users = models.Users;
const Appointments = models.Appointments;
const Clients = models.Clients;

// Crear un registro en la base de datos local y Supabase
export const create = (Model, supabaseTable) => async (req, res) => {
  const requestId = Date.now(); // Identificador único para esta solicitud
  console.log(`[${requestId}] [CREATE] Datos recibidos:`, req.body);
  try {
    // Crear registro en la base de datos local
    const localResult = await Model.create(req.body);
    console.log(
      `[${requestId}] [CREATE] Registro creado en base de datos local:`,
      localResult
    );

    // Verificar si el registro ya existe en Supabase
    const { data: existingData, error: fetchError } = await supabase
      .from(supabaseTable)
      .select("Id")
      .eq("Id", localResult.Id)
      .single();

    if (fetchError && fetchError.details !== "No rows found") {
      console.error(
        `[${requestId}] [ERROR] Al verificar en Supabase:`,
        fetchError.message
      );
      return res.status(500).json({ error: fetchError.message });
    }

    if (existingData) {
      console.log(
        `[${requestId}] [CREATE] Registro ya existe en Supabase:`,
        existingData
      );
      return res
        .status(200)
        .json({ localResult, supabaseResult: existingData });
    }

    // Insertar en Supabase si no existe
    const { data, error } = await supabase
      .from(supabaseTable)
      .insert([localResult.toJSON()]);

    if (error) {
      console.error(
        `[${requestId}] [ERROR] Al insertar en Supabase:`,
        error.message
      );
      return res.status(500).json({ error: error.message });
    }

    console.log(
      `[${requestId}] [CREATE] Registro insertado en Supabase:`,
      data
    );

    res.status(201).json({ localResult, supabaseResult: data });
  } catch (error) {
    console.error(`[${requestId}] [ERROR] En el servidor:`, error.message);
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los registros
export const findAll = (Model, supabaseTable) => async (req, res) => {
  try {
    const localResults = await Model.findAll();

    const { data, error } = await supabase.from(supabaseTable).select("*");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ localResults, supabaseResults: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un registro por ID
export const findOne = (Model) => async (req, res) => {
  try {
    const instance = await Model.findByPk(req.params.id);
    if (instance) {
      res.status(200).json(instance);
    } else {
      res.status(404).json({ error: "Not Found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar un registro
export const update = (Model, supabaseTable) => async (req, res) => {
  try {
    const [updated] = await Model.update(req.body, {
      where: { Id: req.params.id },
    });

    if (!updated) {
      return res.status(404).json({ error: "No encontrado" });
    }

    const { data, error } = await supabase
      .from(supabaseTable)
      .update(req.body)
      .eq("Id", req.params.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: "Actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un registro
export const remove = (Model, supabaseTable) => async (req, res) => {
  try {
    const deleted = await Model.destroy({
      where: { Id: req.params.id },
    });

    if (!deleted) {
      return res.status(404).json({ error: "No encontrado" });
    }

    const { error } = await supabase
      .from(supabaseTable)
      .delete()
      .eq("Id", req.params.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: "Eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar registros con filtros dinámicos
export const search = (Model, supabaseTable) => async (req, res) => {
  try {
    const filters = {};
    const { nombre, email } = req.query;

    if (nombre) {
      filters.Nombre = { [Op.like]: `%${nombre}%` };
    }
    if (email) {
      filters.Email = { [Op.like]: `%${email}%` };
    }

    const localResults = await Model.findAll({ where: filters });

    const { data, error } = await supabase
      .from(supabaseTable)
      .select("*")
      .match(filters);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ localResults, supabaseResults: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// // Registro de usuarios
// export const register = async (req, res) => {
//   try {
//     console.log("Datos recibidos:", req.body);

//     const {
//       username,
//       password,
//       habilitado,
//       IdProfile,
//       dni,
//       nombre,
//       telefono,
//       email,
//     } = req.body;

//     // Validaciones mínimas necesarias
//     if (
//       !username ||
//       !password ||
//       habilitado === undefined ||
//       !IdProfile ||
//       !dni ||
//       !nombre ||
//       !telefono ||
//       !email
//     ) {
//       return res
//         .status(400)
//         .json({ ok: false, msg: "Faltan datos obligatorios" });
//     }

//     const existingUser = await Users.findOne({ where: { Username: username } });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ ok: false, msg: "El nombre de usuario ya existe" });
//     }

//     const existingClient = await Clients.findOne({ where: { Email: email } });
//     if (existingClient) {
//       return res
//         .status(400)
//         .json({ ok: false, msg: "El email ya está registrado como cliente" });
//     }

//     console.log("Hasheando contraseña...");
//     const hashedPassword = await bcrypt.hash(password, 10);

//     console.log("Creando usuario...");
//     const newUser = await Users.create({
//       Username: username,
//       Password: hashedPassword,
//       Habilitado: habilitado,
//       IdProfile: IdProfile,
//     });

//     console.log("Creando cliente vinculado al usuario...");
//     const newClient = await Clients.create({
//       Dni: dni,
//       Nombre: nombre,
//       Telefono: telefono,
//       Email: email,
//       IdUser: newUser.Id,
//     });


//     console.log("Generando token...");
//     if (!SECRET_KEY) {
//       return res
//         .status(500)
//         .json({
//           ok: false,
//           msg: "JWT_SECRET no definido en variables de entorno",
//         });
//     }

//     const token = jwt.sign(
//       { id: newUser.Id, username: newUser.Username },
//       SECRET_KEY,
//       { expiresIn: "24h" }
//     );

//     return res.status(201).json({
//       ok: true,
//       msg: "Usuario y cliente registrados con éxito",
//       token,
//       userId: newUser.Id,
//       clientId: newClient.Id,
//     });
//   } catch (error) {
//     console.error("Error en el registro:", error);
//     return res.status(500).json({ ok: false, msg: "Error en el servidor" });
//   }
// };

// // Login de usuarios
// export const login = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ ok: false, msg: "Faltan datos" });
//     }

//     const user = await Users.findOne({ where: { Username: username } });

//     if (!user) {
//       return res.status(400).json({ ok: false, msg: "Usuario no encontrado" });
//     }

//     // Validar si el usuario está habilitado
//     if (!user.Habilitado) {
//       return res
//         .status(403)
//         .json({ ok: false, msg: "Usuario no habilitado para iniciar sesión" });
//     }

//     // Comparar la contraseña hasheada
//     const isPasswordValid = await bcrypt.compare(password, user.Password);
//     if (!isPasswordValid) {
//       return res.status(400).json({ ok: false, msg: "Contraseña incorrecta" });
//     }

//     const token = jwt.sign(
//       { id: user.Id, username: user.Username },
//       SECRET_KEY,
//       { expiresIn: "24h" }
//     );

//     return res.status(200).json({ ok: true, token, user });
//   } catch (error) {
//     console.error("Error en el inicio de sesión:", error);
//     return res.status(500).json({ ok: false, msg: "Error en el servidor" });
//   }
// };

// // Logout y blacklist de tokens
// export const logout = async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       return res.status(400).json({ ok: false, msg: "Token no proporcionado" });
//     }

//     // Agregar el token a la lista negra
//     blacklistedTokens.push(token);

//     return res
//       .status(200)
//       .json({ ok: true, msg: "Sesión cerrada correctamente" });
//   } catch (error) {
//     console.error("Error en el cierre de sesión:", error);
//     return res.status(500).json({ ok: false, msg: "Error en el servidor" });
//   }
// };

