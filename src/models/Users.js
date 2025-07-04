import { DataTypes } from 'sequelize';

const Users = (sequelize) => {
  return sequelize.define('Users', {
    Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true, 
      primaryKey: true,
      autoIncrement: true
    },
    Username: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
   
    IdProfile: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Profiles',
        key: 'Id'
      }

    }
  }, {
    sequelize,
    tableName: 'Users',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Users_pkey",
        unique: true,
        fields: [
          { name: "Id" },
        ]
      },
      {
        name: "fki_fk_IdPerfil",
        fields: [
          { name: "IdProfile" },
        ]
      }
    ]
  });
};

export default Users;