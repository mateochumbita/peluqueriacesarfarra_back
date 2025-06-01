import { DataTypes } from "sequelize";

const Model = (sequelize) => {
  return sequelize.define(
    "Hairdressers",
    {
      Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      Dni: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      Email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Telefono: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      FechaRegistro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      IdUser: {
        // Clave foránea para relacionar con Users
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Nombre de la tabla referenciada
          key: "Id",
        },
      },
    },
    {
      sequelize,
      tableName: "Hairdressers",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "Hairdressers_pkey",
          unique: true,
          fields: [{ name: "Id" }],
        },
        {
          name: "Hairdressers_IdUser_idx", // Cambiado para evitar conflictos
          fields: [{ name: "IdUser" }],
        },
      ],
    }
  );
};

export default Model;
