import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class RolePermissionModel extends Model {
    static getEditableFields() {
        return [
            "role_id",
            'permission_id'
        ];
    }
    static getAllFields() {
        return [
            "id",
            "role_id",
            "permission_id"
        ];
    }
}
RolePermissionModel.init({
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
}, {
    sequelize,
    tableName: "roles_permissions",
    timestamps: false,
    underscored: true,
});
export default RolePermissionModel;
