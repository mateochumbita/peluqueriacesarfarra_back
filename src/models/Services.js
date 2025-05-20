import { DataTypes } from 'sequelize';

const Model = (sequelize) => {
  return sequelize.define('Services', {
    Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    Nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    Descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    Duracion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    IdHairdresser: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Hairdressers',
        key: 'Id'
      }
    },
  }, {
    sequelize,
    tableName: 'Services',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Services_pkey",
        unique: true,
        fields: [
          { name: "Id" },
        ]
      },
        {
            name: "fki_fk_IdHairdresser",
            fields: [
            { name: "IdHairdresser" },
            ]
        }
    //   ,
    //   {
    //     name: "fki_fk_IdPerfil",
    //     fields: [
    //       { name: "IdPerfil" },
    //     ]
    //   },
    ]
  });
};

export default Model;
