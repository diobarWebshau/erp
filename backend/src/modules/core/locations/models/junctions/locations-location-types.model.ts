import sequelize
    from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional }
    from "sequelize";
import { LocationTypeCreateAttributes } from "../base/LocationTypes.model.js";

interface LocationLocationTypeAttributes {
    id: number,
    location_id: number,
    location_type_id: number
    location_type?: LocationTypeCreateAttributes
}

type LocationLocationTypeCreateAttributes = Partial<LocationLocationTypeAttributes>;

interface LocationLocationTypeManager {
    added: LocationLocationTypeCreateAttributes[],
    modified: LocationLocationTypeCreateAttributes[],
    deleted: LocationLocationTypeCreateAttributes[]
}

class LocationLocationTypeModel
    extends Model<
        LocationLocationTypeAttributes,
        LocationLocationTypeCreateAttributes> {
    static getEditableFields = () => {
        return [
            "location_type_id", "location_id"
        ];
    }
    static getAllFields() {
        return [
            "id", "location_type_id", "location_id"
        ];
    }
}

LocationLocationTypeModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        location_type_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "location_types",
                key: "id"
            },
        },
        location_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "locations",
                key: "id"
            }
        }
    },
    {
        sequelize,
        tableName: "locations_location_types",
        timestamps: false
    }
);

export type {
    LocationLocationTypeAttributes,
    LocationLocationTypeCreateAttributes,
    LocationLocationTypeManager
}

export default LocationLocationTypeModel;