import { DataTypes, Model, Optional }
    from "sequelize";
import sequelize
    from "../../../../../mysql/configSequelize.js";

interface RolePermissionAttributes {
    id: number;
    role_id: number,
    permission_id: number,
}

interface RolePermissionCreationAttributes
    extends Optional<RolePermissionAttributes,
        "id"> { }

class RolePermissionModel
    extends Model<RolePermissionAttributes,
        RolePermissionCreationAttributes> {
    static getEditableFields(): string[] {
        return [
            "role_id",
            'permission_id'
        ];
    }
    static getAllFields(): string[] {
        return [
            "id",
            "role_id",
            "permission_id"
        ];
    }
}

RolePermissionModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        permission_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "permissions",
                key: "id"
            },
            allowNull: false
        },
        role_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "roles",
                key: "id"
            },
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: "roles_permissions",
        timestamps: false,
        underscored: true,
    }
);

export type {
    RolePermissionAttributes,
    RolePermissionCreationAttributes
}

export default RolePermissionModel;
