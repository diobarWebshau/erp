import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class ClientAddressesModel extends Model {
    static getEditableFields = () => {
        return [
            "client_id", "street", "street_number",
            "neighborhood", "city", "state", "country",
            "zip_code",
        ];
    };
    static getAllFields() {
        return [
            "id", "client_id", "street", "street_number",
            "neighborhood", "city", "state", "country",
            "zip_code",
            "created_at", "updated_at"
        ];
    }
}
ClientAddressesModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "clients",
            key: "id"
        },
    },
    street: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    street_number: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    neighborhood: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    state: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    country: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    zip_code: {
        type: DataTypes.STRING(100),
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
    tableName: "clients_addresses",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});
export default ClientAddressesModel;
