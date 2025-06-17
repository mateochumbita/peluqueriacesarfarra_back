import request from "supertest";
import app from "../../../index";
import initModels from "../../../models/init-models.js";
import { sequelizeDB } from "../../../database/connection.database.js"; // ejemplo para appointments.test.js

const models = initModels(sequelizeDB);
const Appointments = models.Appointments;

describe("POST /api/v1/appointments", () => {
  let token;

  beforeAll(async () => {
    // Suponiendo que tenés un login con email y contraseña
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      username: "administrador",
      password: "Admin2025*",
    });

    token = loginRes.body.token; // o como devuelvas el JWT
  });

  beforeAll(async () => {
    await Appointments.destroy({ where: { Fecha: "2023-05-15" } });
  });

  it("debería crear un nuevo turno", async () => {
    const nuevoTurno = {
      Fecha: "2023-05-15",
      Hora: "10:00:00",
      IdHairdresser_Service: 11,
      IdCliente: 1,
      Estado: "Reservado",
    };

    const res = await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send(nuevoTurno);
    expect(res.statusCode).toBe(201); // o el status que uses realmente
    expect(res.body).toHaveProperty("Id");
    expect(res.body.Id).toBeDefined();
  });
});


describe("PUT /api/v1/appointments/:id", () => {
  let token;

  beforeAll(async () => {
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      username: "administrador",
      password: "Admin2025*",
    });

    token = loginRes.body.token;
  });

  it("debería cancelar el turno", async () => {
    // Primero creamos el turno
    const turnoNuevo = {
      Fecha: "2023-05-16",
      Hora: "11:00:00",
      IdHairdresser_Service: 11,
      IdCliente: 1,
      Estado: "Reservado",
    };

    const crearRes = await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send(turnoNuevo);

    expect(crearRes.statusCode).toBe(201);
    const turnoId = crearRes.body.Id;

    // Luego actualizamos el estado a "Cancelado"
    const actualizarRes = await request(app)
      .put(`/api/v1/appointments/${turnoId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ Estado: "Cancelado" });

    expect(actualizarRes.statusCode).toBe(200);
    expect(actualizarRes.body).toHaveProperty("Estado", "Cancelado");
  });
});
