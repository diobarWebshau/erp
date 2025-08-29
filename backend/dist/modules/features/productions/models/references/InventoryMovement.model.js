import { Model, DataTypes } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class InventoryMovementModel extends Model {
    static getAllFields() {
        return [
            "id",
            "location_id",
            "locaton_name",
            "item_id",
            "item_type",
            "item_name",
            "qty",
            "movement_type",
            "reference_id",
            "reference_type",
            "description",
            "is_locked",
            "created_at",
            "production_id"
        ];
    }
    static getEditableFields() {
        return [
            "description",
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
    location_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "locations",
            key: "id"
        }
    },
    location_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    item_type: {
        type: DataTypes.ENUM("product", "input"),
        allowNull: false
    },
    item_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    qty: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false
    },
    movement_type: {
        type: DataTypes.ENUM("in", "out", "allocate"),
        allowNull: false
    },
    reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    reference_type: {
        type: DataTypes.ENUM('Production Order', 'Order', 'Transfer', "Purchased", "Scrap", "Internal Production Order"),
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
        defaultValue: 0,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    tableName: "inventory_movements",
    timestamps: false,
    createdAt: "created_at"
});
export default InventoryMovementModel;
