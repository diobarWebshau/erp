import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class CarrierModel extends Model {
    static getEditableFields = () => [
        "name", "company_name", "rfc", "phone", "vehicle",
        "plates", "license_number", "active", "type"
    ];
    static getAllFields = () => [
        "id", "company_name", "name", "rfc", "phone",
        "vehicle", "plates", "license_number", "active",
        "type", "created_at", "updated_at"
    ];
}
CarrierModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    company_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    rfc: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    type: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    vehicle: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    plates: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    license_number: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    active: {
        type: DataTypes.TINYINT,
        allowNull: false,
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
    tableName: "carriers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
export default CarrierModel;
