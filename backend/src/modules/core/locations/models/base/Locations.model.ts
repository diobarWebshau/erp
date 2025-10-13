import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional } from "sequelize";
import { LocationTypeCreateAttributes } from "./LocationTypes.model.js";
import { InventoryLocationItemCreationAttributes } from "../../../../../modules/types.js";

interface IInventory {
    stock: number;
    item_id: number;
    available: number;
    item_name: string;
    item_type: string;
    location_id: number;
    inventory_id: number;
    maximum_stock: number;
    minimum_stock: number;
    committed_qty: number;
    location_name: string;
    pending_production_qty: number;
}

interface LocationAttributes {
    id: number;
    name: string;
    description: string;
    address: string;
    mail: string;
    phone: string;
    city: string;
    state: string;
    country: string;
    is_active: number;
    created_at: Date;
    updated_at: Date;
    inventory_location_item?: InventoryLocationItemCreationAttributes[];
    types?: LocationTypeCreateAttributes[];
    inventory?: IInventory;
}

interface LocationCreateAttributes
    extends Optional<
        LocationAttributes,
        | "id"
        | "created_at"
        | "updated_at"
        | "is_active"
        | "inventory_location_item"
        | "types"
        | "inventory"
    > { }

class LocationModel extends Model<LocationAttributes, LocationCreateAttributes> {
    static getEditableFields = (): string[] => {
        return [
            "name",
            "description",
            "address",
            "mail",
            "phone",
            "city",
            "state",
            "country",
            "is_active",
        ];
    };

    static getAllFields(): string[] {
        return [
            "id",
            "name",
            "description",
            "address",
            "mail",
            "phone",
            "city",
            "state",
            "country",
            "is_active",
            "created_at",
            "updated_at",
        ];
    }
}

LocationModel.init(
    {
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
        description: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        mail: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        is_active: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
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
        tableName: "locations",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export type { LocationAttributes, LocationCreateAttributes };
export default LocationModel;
