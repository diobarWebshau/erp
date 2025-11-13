import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class LocationModel extends Model {
    static getEditableFields = () => {
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
    static getAllFields() {
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
LocationModel.init({
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
}, {
    sequelize,
    tableName: "locations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
export default LocationModel;
