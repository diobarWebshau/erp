import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class InventoryTransferModel extends Model {
    static getAllFields() {
        return [
            "id", "item_type", "item_id", "qty",
            "reason", "status", "source_location_id",
            "destination_location_id",
            "created_at", "updated_at"
        ];
    }
    static getEditableFields() {
        return [
            "status"
        ];
    }
}
InventoryTransferModel.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    item_type: {
        type: DataTypes.ENUM("product", "input"),
        allowNull: false,
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    item_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("completed", "canceled"),
        allowNull: false,
    },
    source_location_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "locations",
            key: "id",
        },
    },
    destination_location_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "locations",
            key: "id",
        },
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
    tableName: "inventory_transfers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
export default InventoryTransferModel;
