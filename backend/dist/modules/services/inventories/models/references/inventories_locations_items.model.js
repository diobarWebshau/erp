import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class InventoryLocationItemModel extends Model {
    static getAllFields() {
        return [
            "id", "inventory_id",
            "item_type", "item_id",
            "location_id",
            "created_at", "updated_at"
        ];
    }
    static getEditableFields() {
        return [
            "inventory_id",
            "location_id",
            "item_type", "item_id",
        ];
    }
}
InventoryLocationItemModel.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    inventory_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "inventories",
            key: "id"
        }
    },
    location_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "locations",
            key: "id"
        }
    },
    item_type: {
        type: DataTypes.ENUM,
        values: ['product', 'input'],
        allowNull: false
    },
    item_id: {
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
    tableName: "inventories_locations_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});
export default InventoryLocationItemModel;
