'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SellerProduct extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SellerProduct.init({
    instanceId: DataTypes.INTEGER,
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    seller: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    buyer: {
      type: DataTypes.STRING,
      defaultValue: ""
    },
    addDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    linkForMedia: DataTypes.STRING,
    marketHashOfData: {
      type: DataTypes.BLOB,
      allowNull: false
    },
    approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    delivered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deliveryInstructions: DataTypes.BLOB,
    description: DataTypes.STRING
  }, {
    sequelize,
    tableName: 'sellerProducts',
    modelName: 'SellerProduct',
  });
  return SellerProduct;
};