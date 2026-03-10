import { Sequelize } from "sequelize";
import "dotenv/config";
import pg from "pg";

// Configuración de la conexión a la base de datos
export const sequelizeDB = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectModule: pg,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

// prueba de conexión a la base de datos
(async () => {
  try {
    await sequelizeDB.authenticate();
    console.log("DATABASE connected");
    console.log("🔍 DATABASE_URL RECIBIDA:", process.env.DATABASE_URL);
  } catch (error) {
    console.error("DATABASE connection failed:", error);
  }
})();
