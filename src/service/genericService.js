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
  const requestId = Date.now(); 
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

    // Insertar registro en supabase
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

// Obtener todos los registros de la tabla
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

// Obtener los registros por id
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

// Buscar registros 
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


