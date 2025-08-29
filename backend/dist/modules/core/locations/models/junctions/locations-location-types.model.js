import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class LocationLocationTypeModel extends Model {
    static getEditableFields = () => {
        return [
            "location_type_id", "location_id"
        ];
    };
    static getAllFields() {
        return [
            "id", "location_type_id", "location_id"
        ];
    }
}
LocationLocationTypeModel.init({
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
}, {
    sequelize,
    tableName: "locations_location_types",
    timestamps: false
});
export default LocationLocationTypeModel;
