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
    static getCartProduct(productId) {
      return this.findOne({
        where: {
          productId,
        },
      });
    }
    static getProducts(userId) {
      return this.findAll({
        where: {
          userId,
          isPurchased: false,
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
    static updatePurchase(userId, id) {
      return this.update({
        where: {
          userId,
          id,
        },
        isPurchased: true,
      });
    }
  }
  UserCart.init(
    {
      productId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isPurchased: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "UserCart",
    }
  );
  return UserCart;
};
