import { DataTypes, Model, Optional }
  from "sequelize";
import sequelize
  from "../../../../../mysql/configSequelize.js";

interface PermissionAttributes {
  id: number;
  name: string;
  created_at: string,
  updated_at: string
}

interface PermissionCreationAttributes
  extends Optional<PermissionAttributes,
    "id" | "created_at" | "updated_at"> { }

class PermissionModel
  extends Model<PermissionAttributes,
    PermissionCreationAttributes> {
  static getEditableFields(): string[] {
    return ['name'];
  }
  static getAllFields(): string[] {
    return [
      "id", "name", "created_at",
      "updated_at"
    ];
  }
}

PermissionModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
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
    tableName: "permissions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

export type {
  PermissionAttributes,
  PermissionCreationAttributes
}

export default PermissionModel;
