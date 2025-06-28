import jwt from "jsonwebtoken";
import initModels from "../models/init-models.js";
import { sequelizeDB } from "../database/connection.database.js";

//inicializar modelos
const models = initModels(sequelizeDB);
const Users = models.Users;
const Profiles = models.Profiles;


//autheticate token
// Middleware de autenticación
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ message: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(403)
      .json({ message: "Token not provided in the authorization header" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "newToken");
    const user = await Users.findByPk(decoded.id, {
      include: {
        model: Profiles,
        as: "Profile",
        attributes: ["Nombre"],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profileName = user.Profile?.Nombre?.toLowerCase();
    req.userId = user.Id;
    req.userRole = profileName;

    const path = req.originalUrl.toLowerCase();
    const method = req.method.toUpperCase();

    if (profileName === "admin") {
      return next();
    }

    if (profileName === "cliente") {
      // Permitir acceso a /api/v1/clients/*
      if (path.startsWith("/api/v1/clients")) {
        return next();
      }

      // Permitir acceso a su propio perfil: /api/v1/users/:id
      const match = path.match(/\/users\/(\d+)/);
      const userIdParam = match ? parseInt(match[1]) : null;

      if (path.startsWith("/api/v1/users/") && userIdParam === user.Id) {
        return next();
      }

      // Permitir GET y POST en /api/v1/appointments
      if (
        path.startsWith("/api/v1/appointments") &&
        (method === "GET" || method === "POST")
      ) {
        return next();
      }

      return res.status(403).json({ message: "Access denied for client role" });
    }

    return res
      .status(403)
      .json({ message: "Access denied: unknown profile role" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};