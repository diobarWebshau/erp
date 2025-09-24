import { LocationAttributes } from "../../../../types";
import sequelize
    from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional }
    from "sequelize";

interface InventoryAttributes {
    id: number,
    stock: number,
    minimum_stock: number,
    maximum_stock: number,
    lead_time: number,
    created_at: Date,
    updated_at: Date,
}

interface IInventoryDetails {
    stock: number,
    item_id: number,
    available: number,
    commited: number,
    item_name: string,
    item_type: "product" | "input",
    location_id: number,
    inventory_id: number,
    minimum_stock: number,
    maximum_stock: number,
    lead_time: number,
    location_name: string,
    location?: LocationAttributes
    item?: IItem
    qty?: number,
}

interface IObjectInventoryDetails {
    inventories: IInventoryDetails[]
}

interface IItem {
    id: string,
    item_id: number,
    item_name: string,
    item_type: "product" | "input",
    sku: string | null,
    locations: LocationAttributes[]
}

interface InventoryCreationAttributes
    extends Optional<InventoryAttributes,
        "id" | "created_at" | "updated_at"> { }

class InventoryModel extends
    Model<InventoryAttributes,
        InventoryCreationAttributes> {
    static getAllFields(): string[] {
        return [
            "id", "stock", "minimum_stock",
            "maximum_stock", "lead_time",
            "created_at", "updated_at"];
    }
    static getEditableFields(): string[] {
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
},
    {
        sequelize,
        tableName: "inventories",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

export type {
    InventoryAttributes,
    InventoryCreationAttributes,
    IInventoryDetails,
    IObjectInventoryDetails,
    IItem
}

export default InventoryModel;