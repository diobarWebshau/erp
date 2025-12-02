import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class LocationModel extends Model {
    static getEditableFields = () => {
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
    static getAllFields() {
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
LocationModel.init({
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
}, {
    sequelize,
    tableName: "locations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
export default LocationModel;
