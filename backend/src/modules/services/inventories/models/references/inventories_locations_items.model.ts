import sequelize
    from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional }
    from "sequelize";
import {
    InventoryCreationAttributes
} from "../base/Inventories.model.js";

interface InventoryLocationItemAttributes {
    id: number,
    inventory_id: number,
    item_type: 'product' | 'input',
    item_id: number,
    location_id: number,
    created_at: Date,
    updated_at: Date,
    inventory?: InventoryCreationAttributes,
}

interface InventoryLocationItemCreationAttributes
    extends Optional<InventoryLocationItemAttributes,
        "id" | "created_at" | "updated_at"> { }

class InventoryLocationItemModel extends
    Model<InventoryLocationItemAttributes,
        InventoryLocationItemCreationAttributes> {
    static getAllFields(): string[] {
        return [
            "id", "inventory_id",
            "item_type", "item_id",
            "location_id",
            "created_at", "updated_at"
        ];
    }
    static getEditableFields(): string[] {
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
},
    {
        sequelize,
        tableName: "inventories_locations_items",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

export type {
    InventoryLocationItemAttributes,
    InventoryLocationItemCreationAttributes
}

export default InventoryLocationItemModel;