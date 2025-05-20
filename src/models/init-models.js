import { DataTypes } from 'sequelize';
import _Clients from './Clients.js';
import _Users from './Users.js';
import _Hairdressers from './Hairdressers.js';
import _Appointments from './Appointments.js';
import _Profiles from './Profiles.js';
import _Services from './Services.js';
import _Earnings from './Earnings.js';


function initModels(sequelize) {
  const Clients = _Clients(sequelize, DataTypes);
  const Users = _Users(sequelize, DataTypes);
  const Hairdressers = _Hairdressers(sequelize, DataTypes);
  const Appointments = _Appointments(sequelize, DataTypes);
  const Profiles = _Profiles(sequelize, DataTypes);
  const Services = _Services(sequelize, DataTypes);
  const Earnings = _Earnings(sequelize, DataTypes);

  // Relación 1:1 entre Users y Clients
  Clients.belongsTo(Users, { as: 'User', foreignKey: 'UserId' });
  Users.hasOne(Clients, { as: 'Client', foreignKey: 'UserId' });

  // Relación 1:1 entre Users y Hairdressers
  Hairdressers.belongsTo(Users, { as: 'User', foreignKey: 'UserId' });
  Users.hasOne(Hairdressers, { as: 'Hairdresser', foreignKey: 'UserId' });

  // Relación Muchos a Uno entre Users y Profiles
  Users.belongsTo(Profiles, { as: 'Profile', foreignKey: 'IdProfile' });
  Profiles.hasMany(Users, { as: 'Users', foreignKey: 'IdProfile' });

  // Relación entre Appointments y Clients
  Appointments.belongsTo(Clients, { as: "IdCliente_Client", foreignKey: "IdCliente" });
  Clients.hasMany(Appointments, { as: "Appointments", foreignKey: "IdCliente" });

  // Relación entre Appointments y Hairdressers
  Appointments.belongsTo(Hairdressers, { as: "IdPeluquero_Hairdresser", foreignKey: "IdPeluquero" });
  Hairdressers.hasMany(Appointments, { as: "Appointments", foreignKey: "IdPeluquero" });

  // Relación entre Services y Hairdressers (1:N)
  Hairdressers.belongsTo(Services, { as: 'Service', foreignKey: 'IdService' });
  Services.hasMany(Hairdressers, { as: 'Hairdressers', foreignKey: 'IdService' });
  //relaacion entre Earnings y appointments
  Appointments.belongsTo(Earnings, { as: "Earnings", foreignKey: "IdEarnings" });
  Earnings.hasMany(Appointments, { as: "Appointments", foreignKey: "IdEarnings" });

  return {
    Clients,
    Users,
    Hairdressers,
    Appointments,
    Profiles,
    Services,
    Earnings,
  };
}

export default initModels;
