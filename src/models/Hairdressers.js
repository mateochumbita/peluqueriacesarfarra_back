import { DataTypes } from 'sequelize';

const Model = (sequelize) => {
  return sequelize.define('Hairdressers', {
    Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    Nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Especialidad: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Disponibilidad: {
      type: DataTypes.JSON,
      allowNull: false
    },
    Activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    },
    IdService: { // Clave foránea para relacionar con Services
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Services', // Nombre de la tabla referenciada
        key: 'Id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    tableName: 'Hairdressers',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Hairdressers_pkey",
        unique: true,
        fields: [
          { name: "Id" },
        ]
      }
    ]
  });
};

export default Model;
