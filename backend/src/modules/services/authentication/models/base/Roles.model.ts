import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional } from "sequelize";

interface RoleAttributes {
  id: number;
  name: string;
  created_at: Date,
  updated_at: Date
}

interface RoleCreationAttributes
  extends Optional<RoleAttributes,
    "id" | "created_at" | "updated_at"> { }

class RoleModel extends
  Model<RoleAttributes, RoleCreationAttributes> {
  static getEditableFields(): string[] {
    return [
      'name'
    ];
  }
  static getAllFields(): string[] {
    return [
      "id", "name", "created_at",
      "updated_at"
    ];
  }
}

RoleModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "roles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

export type {
  RoleAttributes, RoleCreationAttributes
}

export default RoleModel;
