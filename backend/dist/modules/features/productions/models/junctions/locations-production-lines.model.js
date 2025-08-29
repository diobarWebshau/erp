import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class LocationsProductionLinesModel extends Model {
    static getEditableFields = () => {
        return [
            "production_line_id", "location_id"
        ];
    };
    static getAllFields() {
        return [
            "id", "production_line_id", "location_id"
        ];
    }
}
LocationsProductionLinesModel.init({
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
}, {
    sequelize,
    tableName: "locations_production_lines",
    timestamps: false
});
export default LocationsProductionLinesModel;
