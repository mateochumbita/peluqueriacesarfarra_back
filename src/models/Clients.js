import { DataTypes } from 'sequelize';

const Model = (sequelize) => {
  return sequelize.define('Clients', {
    Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    Dni: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    Nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Telefono: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    Password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    FechaRegistro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    PuntosFidelidad: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    UserId: { // Clave foránea para relacionar con Users
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Nombre de la tabla referenciada
        key: 'Id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    tableName: 'Clients',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Clients_pkey",
        unique: true,
        fields: [
          { name: "Id" },
        ]
      }
    ]
  });
};

export default Model;
