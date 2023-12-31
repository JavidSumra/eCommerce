"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static getUser(email) {
      return this.findOne({
        where: {
          email,
        },
      });
    }
    static getAllUser() {
      return this.findAll({});
    }
    updateData(name, email) {
      return this.update({
        email,
        name,
      });
    }
    updatePassword(password) {
      return this.update({
        password,
      });
    }
  }
  UserDetail.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      isAdmin: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "UserDetail",
    }
  );
  return UserDetail;
};
