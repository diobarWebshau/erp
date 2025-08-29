import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class InventoryModel extends Model {
    static getAllFields() {
        return [
            "id", "stock", "minimum_stock",
            "maximum_stock", "lead_time",
            "created_at", "updated_at"
        ];
    }
    static getEditableFields() {
        return [
            "stock", "minimum_stock",
            "maximum_stock", "lead_time"
        ];
    }
}
InventoryModel.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    stock: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false
    },
    minimum_stock: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false
    },
    maximum_stock: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false
    },
    lead_time: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
}, {
    sequelize,
    tableName: "inventories",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});
export default InventoryModel;
