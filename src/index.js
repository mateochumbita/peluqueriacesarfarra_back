import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { sequelizeDB } from "./database/connection.database.js";
import router from "./modules/routes.js";
import initModels from './models/init-models.js';
dotenv.config();

const app = express();

const models = initModels(sequelizeDB);

// async function syncModels() {
//   try {
// // //     // Orden recomendado según dependencias
// // //     await models.Profiles.sync({ force: true });
// // //     await models.Users.sync({ force: true });
// // //     await models.Clients.sync({ force: true });
// // //     await models.Services.sync({ force: true });
// // //     await models.Hairdressers.sync({ force: true });
// // //     await models.Hairdressers_Services.sync({ force: true });
//  await models.Appointments.sync({ alter: true });
// // //     await models.Earnings.sync({ force: true });
// // //     console.log('Todas las tablas fueron eliminadas y recreadas en orden.');
//   } catch (error) {
//     console.error('Error al sincronizar los modelos:', error);
//   }
// }

// syncModels();

// Middlewares
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
}));
app.use(express.json()); // Middleware para procesar JSON
app.use(express.urlencoded({ extended: true })); // Middleware para procesar datos de formularios
app.use(cookieParser());

// Rutas
app.use("/api/v1", router);

// Ruta inicial
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>NodeJs BO</title></head>
      <body><h1>¡Bienvenido al backend la Peluquería César Farra!</h1></body>
    </html>
  `);
});

// Inicializar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log("Supabase URL:", process.env.SUPABASE_URL);
  console.log("Supabase Key:", process.env.SUPABASE_KEY);
});
