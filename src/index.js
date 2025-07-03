import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { sequelizeDB } from "./database/connection.database.js";
import router from "./modules/routes.js";
import initModels from "./models/init-models.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
dotenv.config();

const app = express();

const models = initModels(sequelizeDB);

// script que sincroniza los modelos con la base de datos
//está comentado ya que no se necesita sincronizar las tablas constantemente

// async function syncModels() {
//   try {
// // // //     // Orden recomendado según dependencias
// // // // //     await models.Profiles.sync({ force: true });
// // // // //     await models.Users.sync({ force: true });
// // // // //     await models.Clients.sync({ force: true });
// // // // //     await models.Services.sync({ force: true });
// //     await models.Hairdressers.sync({ alter: true });
// // // // //     await models.Hairdressers_Services.sync({ force: true });
//  await models.Appointments.sync({ alter: true });
// // // // //     await models.Earnings.sync({ force: true });
// // // //     console.log('Todas las tablas fueron eliminadas y recreadas en orden.');
//   } catch (error) {
//     console.error('Error al sincronizar los modelos:', error);
//   }
// }

// syncModels();

//configuración de swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Peluquería César Farra",
      version: "1.0.0",
      description: "Documentación de la API para la gestión de la peluquería",
    },
    servers: [
      {
        url: "http://localhost:3001/api/v1",
        description: "Servidor local",
      },
      {
        url: "https://peluqueriacesarfarra-back.vercel.app/api/v1",
        description: "Servidor en producción",
      },

    ],
  },
 apis: ["./src/modules/**/*.js"], // Asegurate de comentar con Swagger tus rutas
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
      "https://peluqueriacesarfarra-front.vercel.app",
      "https://glittering-cucurucho-f990e1.netlify.app"
    ],
    credentials: true,
  })
);
app.use(express.json()); // Middleware para procesar JSON
app.use(express.urlencoded({ extended: true })); // Middleware para procesar datos de formularios
app.use(cookieParser());


// Swagger UI route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Inicializar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log("Supabase URL:", process.env.SUPABASE_URL);
  console.log("Supabase Key:", process.env.SUPABASE_KEY);
});


export default app;