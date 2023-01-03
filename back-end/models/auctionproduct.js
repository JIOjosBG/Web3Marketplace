'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AuctionProduct extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AuctionProduct.init({
    instanceId: DataTypes.INTEGER,
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    minimalPrice:{
      type: DataTypes.STRING,
      allowNull: false
    },
    seller: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currentBidder: DataTypes.STRING,
    bidAmount: DataTypes.STRING,
    finishDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    addDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    linkForMedia: DataTypes.STRING,
    marketHashOfData:{
      type: DataTypes.BLOB,
      defaultValue: null
    },
    approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    delivered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deliveryInstructions: DataTypes.BLOB,
    description: DataTypes.STRING,
  }, {
    sequelize,
    tableName: 'auction_products',
    modelName: 'AuctionProduct'
  });
  return AuctionProduct;
};