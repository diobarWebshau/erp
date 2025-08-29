import sequelize
    from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional }
    from "sequelize";

interface InventoryTransferAttributes {
    id: number,
    item_type: "product" | "input",
    item_id: number,
    item_name: string,
    qty: number,
    reason: string,
    status: "completed" | "canceled",
    source_location_id: number,
    destination_location_id: number,
    created_at: Date,
    updated_at: Date,
}

interface InventoryTransferCreationAttributes
    extends Optional<InventoryTransferAttributes,
        "id" | "created_at" | "updated_at" | "status"> { }

class InventoryTransferModel extends Model<
    InventoryTransferAttributes,
    InventoryTransferCreationAttributes
> {
    static getAllFields(): string[] {
        return [
            "id", "item_type", "item_id", "qty",
            "reason", "status", "source_location_id",
            "destination_location_id",
            "created_at", "updated_at"
        ];
    }

    static getEditableFields(): string[] {
        return [
            "status"
        ];
    }
}

InventoryTransferModel.init(
    {
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
    },
    {
        sequelize,
        tableName: "inventory_transfers",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export type {
    InventoryTransferAttributes,
    InventoryTransferCreationAttributes
}

export default InventoryTransferModel;
