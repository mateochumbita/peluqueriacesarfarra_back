import { DataTypes } from 'sequelize';

const Model = (sequelize) => {
  return sequelize.define('Appointments', {
    Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    IdCliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Clients',
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
    Estado: {
      type: DataTypes.ENUM('Reservado', 'Pagado', 'Cancelado'),
      allowNull: false
    },
  
   IdHairdresser_Service: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Hairdressers_Services',
        key: 'Id'
      },
      EstadoPago: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
    },
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
          { name: "IdCliente" },
        ]
      },
      {
        name: "fki_fk_IdHairdresser_Service",
        fields: [
          { name: "IdHairdresser_Service" },
        ]
      }
    ]
  });
};

export default Model;
