import { DataTypes } from "sequelize";
import _Clients from "./Clients.js";
import _Users from "./Users.js";
import _Hairdressers from "./Hairdressers.js";
import _Appointments from "./Appointments.js";
import _Profiles from "./Profiles.js";
import _Services from "./Services.js";
import _Earnings from "./Earnings.js";

import _Hairdressers_Services from "./Hairdressers_Services.js";

function initModels(sequelize) {
  const Profiles = _Profiles(sequelize, DataTypes);
  const Users = _Users(sequelize, DataTypes);
  const Clients = _Clients(sequelize, DataTypes);
  const Services = _Services(sequelize, DataTypes);
  const Hairdressers = _Hairdressers(sequelize, DataTypes);
  const Hairdressers_Services = _Hairdressers_Services(sequelize, DataTypes);
  const Appointments = _Appointments(sequelize, DataTypes);
  const Earnings = _Earnings(sequelize, DataTypes);

  // Relación Muchos a Uno entre Users y Profiles
  Users.belongsTo(Profiles, { as: "Profile", foreignKey: "IdProfile" });
  Profiles.hasMany(Users, { as: "Users", foreignKey: "IdProfile" });

  // Relación 1:1 entre Users y Clients
  Clients.belongsTo(Users, { as: "User", foreignKey: "IdUser" });
  Users.hasOne(Clients, { as: "Client", foreignKey: "IdUser" });

  // Relación N:M entre Hairdressers y Services a través de Hairdressers_Services
  Hairdressers.belongsToMany(Services, {
    through: Hairdressers_Services,
    as: "Services",
    foreignKey: "IdHairdresser",
    otherKey: "IdService",
  });
  Services.belongsToMany(Hairdressers, {
    through: Hairdressers_Services,
    as: "Hairdressers",
    foreignKey: "IdService",
    otherKey: "IdHairdresser",
  });

  // Relación 1:1 entre Users y Hairdressers
  Hairdressers.belongsTo(Users, { as: "User", foreignKey: "IdUser" });
  Users.hasOne(Hairdressers, { as: "Hairdresser", foreignKey: "IdUser" });

  // Relación N:1 entre Appointments y Hairdressers_Services
  Appointments.belongsTo(Hairdressers_Services, {
    as: "HairdresserService",
    foreignKey: "IdHairdresser_Service",
  });
  Hairdressers_Services.hasMany(Appointments, {
    as: "Appointments",
    foreignKey: "IdHairdresser_Service",
  });

  // Relación entre Appointments y Clients
  Appointments.belongsTo(Clients, {
    as: "Cliente",
    foreignKey: "IdCliente",
  });
  Clients.hasMany(Appointments, {
    as: "Appointments",
    foreignKey: "IdCliente",
  });

  // Relación 1:1 entre Earnings y Appointments
  Earnings.belongsTo(Appointments, {
    as: "Appointment",
    foreignKey: "IdAppointment",
  });
  Appointments.hasOne(Earnings, {
    as: "Earnings",
    foreignKey: "IdAppointment",
  });

  return {
    Profiles,
    Users,
    Clients,
    Services,
    Hairdressers,
    Hairdressers_Services,
    Appointments,
    Earnings,
  };
}

export default initModels;
