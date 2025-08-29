import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class LocationTypeModel extends Model {
    static getEditableFields = () => {
        return [
            "id", "name"
        ];
    };
    static getAllFields() {
        return [
            "id", "name", "created_at",
            "updated_at"
        ];
    }
}
LocationTypeModel.init({
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
}, {
    sequelize,
    tableName: "location_types",
    timestamps: false
});
export default LocationTypeModel;
