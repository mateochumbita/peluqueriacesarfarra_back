import { DataTypes } from 'sequelize';

const Model = (sequelize) => {
  return sequelize.define('Earnings', {
    Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    Importe:{
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
  
   IdAppointment:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Appointments',
        key: 'Id'
      }
   }


  }, {
    sequelize,
    tableName: 'Earnings',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Earnings_pkey",
        unique: true,
        fields: [
          { name: "Id" },
        ]
      },
      {
        name: "Earnings_IdAppointment_fkey",
        fields: [
          { name: "IdAppointment" },
        ]
      },
    ]
  });
};

export default Model;
