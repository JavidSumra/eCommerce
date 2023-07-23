"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserCart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static getCartProduct(productId, isPurchased, date) {
      return this.findOne({
        where: {
          productId,
          isPurchased,
          date,
        },
      });
    }
    static getCartItem(productId) {
      return this.findOne({
        where: {
          productId,
        },
      });
    }
    static getProducts(userId, status) {
      return this.findAll({
        where: {
          userId,
          isPurchased: status,
        },
      });
    }
    static getBill(userId, isPurchased, date) {
      return this.findAll({
        where: {
          userId,
          isPurchased,
          date,
        },
      });
    }
    static deleteCartItem(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }
    updatePurchase(userId, productId) {
      return this.update({
        where: {
          userId,
          productId,
        },
        isPurchased: true,
      });
    }
  }
  UserCart.init(
    {
      productId: DataTypes.STRING,
      userId: DataTypes.STRING,
      isPurchased: { type: DataTypes.BOOLEAN, defaultValue: false },
      date: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "UserCart",
    }
  );
  return UserCart;
};
