import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional } from "sequelize";
import { LocationTypeCreateAttributes } from "./LocationTypes.model.js";
import { InventoryLocationItemCreationAttributes, LocationLocationTypeAttributes } from "../../../../../modules/types.js";

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
    // info
    id: number;
    name: string;
    description: string;

    // contact
    phone: string;

    // address
    street: string;
    street_number: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    zip_code: number;
    location_location_type?: LocationLocationTypeAttributes[];

    // status
    is_active: number;
    created_at: Date;
    updated_at: Date;

    // relationships
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
            "phone",
            "city",
            "state",
            "country",
            "is_active",
            "street",
            "street_number",
            "neighborhood",
            "zip_code",
        ];
    };

    static getAllFields(): string[] {
        return [
            "id",
            "name",
            "description",
            "phone",
            "city",
            "state",
            "country",
            "is_active",
            "created_at",
            "updated_at",
            "street",
            "street_number",
            "neighborhood",
            "zip_code",
        ];
    }
}

LocationModel.init(
    {
        // info
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
        // contact
        phone: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        // address
        street: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        street_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        neighborhood: {
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
        zip_code: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // status
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
