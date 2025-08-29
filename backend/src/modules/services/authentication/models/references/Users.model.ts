import sequelize
  from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional }
  from "sequelize";

interface UserAttributes {
  id: number;
  username: string;
  password: string;
  role_id: number | null;
  created_at: Date;
  updated_at: Date;
}

interface UserCreationAttributes
  extends Optional<UserAttributes,
    'id' | 'created_at' | 'updated_at'> { }

class UserModel extends
  Model<UserAttributes, UserCreationAttributes> {
  static getEditableFields(): string[] {
    return [
      'username', 'password',
      "role_id"
    ];
  }
  static getAllFields(): string[] {
    return [
      "id", "username", "password", "role_id",
      "created_at", "updated_at"
    ];
  }
}

UserModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "roles",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export type {
  UserAttributes,
  UserCreationAttributes
}

export default UserModel;
