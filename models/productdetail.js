"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProductDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static getProductList(userId) {
      return this.findAll({
        where: {
          userId,
        },
      });
    }
    static getAllProduct() {
      return this.findAll({});
    }

    static deleteProduct(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }
    updateProductQty(Qty) {
      return this.update({
        Qty,
      });
    }
  }
  ProductDetail.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      Image_Url: DataTypes.STRING,
      sell_price: DataTypes.DOUBLE,
      buy_price: DataTypes.DOUBLE,
      Qty: DataTypes.DOUBLE,
      Type: DataTypes.STRING,
      userId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ProductDetail",
    }
  );
  return ProductDetail;
};
