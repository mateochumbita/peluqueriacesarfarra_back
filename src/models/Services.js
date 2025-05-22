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
       
    ]
  });
};

export default Model;
