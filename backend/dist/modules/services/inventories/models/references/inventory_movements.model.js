import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class InventoryMovementModel extends Model {
    static getAllFields() {
        return [
            "id", "inventory_id",
            "location_id", "location_name",
            "item_id", "item_type", "item_name",
            "qty", "movement_type",
            "reference_id", "reference_type",
            "production_id", "description",
            "is_locked",
            "created_at", "updated_at"
        ];
    }
    static getEditableFields() {
        return [
            "inventory_id",
            "location_id",
            "item_type", "item_id",
            "qty",
            "movement_type",
            "reference_id", "reference_type",
            "production_id", "description",
            "is_locked"
        ];
    }
}
InventoryMovementModel.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    inventory_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "inventories",
            key: "id"
        }
    },
    location_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "locations",
            key: "id"
        }
    },
    location_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    item_type: {
        type: DataTypes.ENUM("product", "input"),
        allowNull: false
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    item_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    qty: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false
    },
    movement_type: {
        type: DataTypes.ENUM("in", "out"),
        allowNull: false
    },
    reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    reference_type: {
        type: DataTypes.ENUM("production", "order", "transfer", "purchased"),
        allowNull: true
    },
    production_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_locked: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
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
    }
}, {
    sequelize,
    tableName: "inventory_movements",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});
