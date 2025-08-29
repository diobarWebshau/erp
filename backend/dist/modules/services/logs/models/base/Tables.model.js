import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class TableModel extends Model {
    static getEditableFields = () => [
        "name", "table_name"
    ];
    static getAllFields = () => [
        "id", "name", "table_name",
        "created_at", "updated_at",
    ];
}
TableModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    table_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
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
    tableName: "tables",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
export default TableModel;
