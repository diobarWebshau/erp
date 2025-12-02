import { InventoryLocationItemCreationAttributes, LocationLocationTypeAttributes, LocationsProductionLinesAttributes } from "../../../../../modules/types.js";
import { InventoryLocationItemManager } from "src/modules/services/inventories/models/references/inventories_locations_items.model.js";
import { LocationsProductionLinesManager } from "src/modules/features/productions/models/junctions/locations-production-lines.model.js";
import { LocationLocationTypeManager } from "../junctions/locations-location-types.model.js";
import { LocationTypeCreateAttributes } from "./LocationTypes.model.js";
import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";

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
    custom_id: string,
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
    production_capacity: number,
    location_manager: string,

    // status
    is_active: number;
    created_at: Date;
    updated_at: Date;

    // relationships
    location_production_line?: LocationsProductionLinesAttributes[]
    location_location_type?: LocationLocationTypeAttributes[];
    inventories_locations_items?: InventoryLocationItemCreationAttributes[];
    types?: LocationTypeCreateAttributes[];
    inventory?: IInventory;

    // managers
    location_location_type_updated?: LocationLocationTypeManager,
    inventories_locations_items_updated?: InventoryLocationItemManager,
    location_production_line_updated?: LocationsProductionLinesManager
}

type LocationCreateAttributes = Partial<LocationAttributes>;

class LocationModel extends Model<LocationAttributes, LocationCreateAttributes> {
    static getEditableFields = (): string[] => {
        return [
            "name",
            "description",

            "phone",

            "street",
            "street_number",
            "neighborhood",
            "city",
            "state",
            "country",
            "zip_code",
            "production_capacity",
            "location_manager",
            "custom_id",

            "is_active",
        ];
    };

    static getAllFields(): string[] {
        return [
            "id",
            "name",
            "description",

            "phone",

            "street",
            "street_number",
            "neighborhood",
            "city",
            "state",
            "country",
            "zip_code",
            "production_capacity",
            "location_manager",
            "custom_id",

            "is_active",
            "created_at",
            "updated_at",
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
            allowNull: true,
            unique: true,
        },
        description: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        production_capacity: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        location_manager: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        custom_id: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        // contact
        phone: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        // address
        street: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        street_number: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        neighborhood: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        state: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        country: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        zip_code: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        // status
        is_active: {
            type: DataTypes.TINYINT,
            allowNull: true,
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
