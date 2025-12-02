import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";

interface LocationTypeAttributes {
    id: number,
    name: string,
    created_at: Date,
    updated_at: Date,
}

type LocationTypeCreateAttributes = Partial<LocationTypeAttributes>;

interface LocationTypeManager {
    added: LocationTypeAttributes[];
    deleted: LocationTypeAttributes[];
    modified: LocationTypeAttributes[];
}


class LocationTypeModel extends Model<LocationTypeAttributes, LocationTypeCreateAttributes> {
    static getEditableFields = () => ["id", "name"]
    static getAllFields = () => ["id", "name", "created_at", "updated_at"]
}

LocationTypeModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
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
        tableName: "location_types",
        timestamps: false
    }
);

export type {
    LocationTypeAttributes,
    LocationTypeCreateAttributes,
    LocationTypeManager
}

export default LocationTypeModel;