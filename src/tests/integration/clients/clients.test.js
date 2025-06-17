import request from "supertest";
import app from "../../../index";
import initModels from "../../../models/init-models.js";
import { sequelizeDB } from "../../../database/connection.database.js";

const models = initModels(sequelizeDB);
const Clients = models.Clients;
const Users = models.Users;
//eliminar el cliente de prueba si es que lo hay
beforeAll(async () => {
  try {
    await Clients.destroy({ where: { Dni: "12345678" } });
    await Users.destroy({ where: { Username: "usertetest" } });
  } catch (error) {
    console.error("Error eliminando usuarios/clients:", error);
  }
});
//prueba crear un cliente
describe("POST /api/v1/auth/register", () => {
  it("debería crear un nuevo cliente", async () => {
    const nuevoCliente = {
      username: "usertetest",
      password: "123456",
      habilitado: false,
      IdProfile: 2, 
      dni: "12345678",
      nombre: "prueba",
      telefono: "123456789",
      email: "8nGZT@example.com",
    };

    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(nuevoCliente);

    expect(res.statusCode).toBe(201);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("ok", true); 
    expect(res.body).toHaveProperty("msg");
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("entityId");
    expect(typeof res.body.token).toBe("string");
    expect(typeof res.body.userId).toBe("number");
    expect(typeof res.body.entityId).toBe("number");
  });
});
