import {
    LocationAttributes, LocationCreateAttributes,
    ProductionLineCreationAttributes
} from "./../../../../../modules/types.js";
import sequelize
    from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional }
    from "sequelize";

interface LocationsProductionLinesAttributes {
    id: number,
    production_line_id: number,
    location_id: number,
    location?: LocationCreateAttributes
    production_line?: ProductionLineCreationAttributes
}

interface LocationsProductionLinesCreateAttributes
    extends Optional<
        LocationsProductionLinesAttributes, "id"> { }

interface LocationsProductionLinesManager {
    added: LocationsProductionLinesCreateAttributes[];
    deleted: LocationsProductionLinesAttributes[];
    modified: LocationsProductionLinesCreateAttributes[];
}

class LocationsProductionLinesModel
    extends Model<
        LocationsProductionLinesAttributes,
        LocationsProductionLinesCreateAttributes> {
    static getEditableFields = () => {
        return [
            "production_line_id", "location_id"
        ];
    }
    static getAllFields() {
        return [
            "id", "production_line_id", "location_id"
        ];
    }
}


LocationsProductionLinesModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        production_line_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "production_lines",
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
        tableName: "locations_production_lines",
        timestamps: false
    }
);

export type {
    LocationsProductionLinesAttributes,
    LocationsProductionLinesCreateAttributes,
    LocationsProductionLinesManager
}

export default LocationsProductionLinesModel;