'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AuctionBid extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AuctionBid.init({
    instanceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bidder: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deliveryInstructions: {
      type: DataTypes.BLOB,
      allowNull: false
    },
    signature: {
      type: DataTypes.BLOB,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'auction_bids',
    modelName: 'AuctionBid'
  });
  return AuctionBid;
};