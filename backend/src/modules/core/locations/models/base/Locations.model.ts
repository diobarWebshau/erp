import sequelize
    from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional }
    from "sequelize";
import {
    LocationTypeCreateAttributes
} from "./LocationTypes.model.js";
import {
    InventoryLocationItemCreationAttributes
} from "../../../../../modules/types.js";

interface LocationAttributes {
    id: number,
    name: string,
    description: string,
    is_active: boolean,
    created_at: Date,
    updated_at: Date,
    inventory_location_item?: InventoryLocationItemCreationAttributes[]
    types?: LocationTypeCreateAttributes[]
}

interface LocationCreateAttributes extends
    Optional<LocationAttributes,
        "id" | "created_at" | "updated_at" | "is_active"> { }

class LocationModel extends
    Model<LocationAttributes,
        LocationCreateAttributes> {
    static getEditableFields = (): string[] => {
        return [
            "name", "description",
            "is_active"
        ];
    }
    static getAllFields(): string[] {
        return [
            "id", "name", "description",
            "is_active", "created_at", "updated_at"
        ];
    }
}

LocationModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    is_active: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
},
    {
        sequelize,
        tableName: "locations",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

export type {
    LocationAttributes,
    LocationCreateAttributes
}

export default LocationModel;

