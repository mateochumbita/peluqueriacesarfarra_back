import request from "supertest";
import app from "../../../index";
import initModels from "../../../models/init-models.js";
import { sequelizeDB } from "../../../database/connection.database.js";

const models = initModels(sequelizeDB);

const Services = models.Services;

//prueba crear un servicio
describe("POST /api/v1/services", () => {
  let token;

  beforeAll(async () => {
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      username: "administrador",
      password: "Admin2025*",
    });

    token = loginRes.body.token;
  });

  beforeAll(async () => {
    await Services.destroy({ where: { Nombre: "Prueba" } });
  });

  it("debería crear un nuevo servicio", async () => {
    const nuevoServicio = {
      Nombre: "Prueba",
      Descripcion: "servicio de prueba",
      Precio: "8000.00",
      Duracion: 25,
    };

    const res = await request(app)
      .post("/api/v1/services")
      .set("Authorization", `Bearer ${token}`)
      .send(nuevoServicio);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("localResult");
    expect(res.body.localResult).toHaveProperty("Id");
    expect(res.body.localResult.Nombre).toBe("Prueba");
  });
});

afterAll(async () => {
  await sequelizeDB.close();
});
