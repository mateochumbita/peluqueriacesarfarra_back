import { DataTypes } from 'sequelize';

const Model = (sequelize) => {
  return sequelize.define('Appointments', {
    Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    ClienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Clients',
        key: 'Id'
      }
    },
    PeluqueroId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Hairdressers',
        key: 'Id'
      }
    },
    Fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    Hora: {
      type: DataTypes.TIME,
      allowNull: false
    },
    Servicio: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Estado: {
      type: DataTypes.ENUM('pendiente', 'confirmado', 'cancelado', 'completado', 'no_asistió'),
      defaultValue: 'pendiente'
    },
    Notas: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Appointments',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Appointments_pkey",
        unique: true,
        fields: [
          { name: "Id" },
        ]
      },
      {
        name: "fki_fk_ClienteId",
        fields: [
          { name: "ClienteId" },
        ]
      },
      {
        name: "fki_fk_PeluqueroId",
        fields: [
          { name: "PeluqueroId" },
        ]
      }
    ]
  });
};

export default Model;
