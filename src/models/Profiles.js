import { DataTypes } from 'sequelize';

const Model = (sequelize) => {
  return sequelize.define('Profiles', {
    Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    Nombre:{
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Descripcion:{
      type: DataTypes.STRING(50),
      allowNull: false
    },
  
  }, {
    sequelize,
    tableName: 'Profiles',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Profiles_pkey",
        unique: true,
        fields: [
          { name: "Id" },
        ]
      }
    
    ]
  });
};

export default Model;
