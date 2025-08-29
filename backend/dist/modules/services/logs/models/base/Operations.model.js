import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class OperationModel extends Model {
    static getEditableFields = () => [
        "name"
    ];
    static getAllFields = () => [
        "id", "name",
        "created_at", "updated_at",
    ];
}
OperationModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
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
}, {
    sequelize,
    tableName: "operations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
export default OperationModel;
