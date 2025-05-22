import { DataTypes } from 'sequelize';

const Model = (sequelize) => {
  return sequelize.define('Hairdressers_Services', {
    Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
   IdHairdresser: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Hairdressers',
        key: 'Id'
      }
    },
    IdService: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Services',
        key: 'Id'
      }
    },
    
  }, {
    sequelize,
    tableName: 'Hairdressers_Services',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Hairdressers_Services_pkey",
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
      },
      {
        name: "fki_fk_IdService",
        fields: [
          { name: "IdService" },
        ]
      }
       
    ]
  });
};

export default Model;
