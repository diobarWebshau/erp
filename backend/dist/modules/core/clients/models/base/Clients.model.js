import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class ClientModel extends Model {
    static getEditableFields = () => {
        return [
            "company_name", "tax_id", "email",
            "phone", "city", "state", "country",
            "street", "street_number", "neighborhood",
            "payment_terms", "credit_limit",
            "zip_code", "tax_regimen", "cfdi",
            "payment_method", "is_active"
        ];
    };
    static getAllFields() {
        return [
            "id", "company_name", "tax_id", "email",
            "phone", "city", "state", "country",
            "street", "street_number", "neighborhood",
            "payment_terms", "credit_limit",
            "zip_code", "tax_regimen", "cfdi",
            "payment_method", "is_active",
            "created_at", "updated_at"
        ];
    }
}
ClientModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    company_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    tax_id: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(100),
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
    street: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    street_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    neighborhood: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    payment_terms: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    credit_limit: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: true
    },
    zip_code: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tax_regimen: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    cfdi: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    payment_method: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    is_active: {
        type: DataTypes.TINYINT,
        defaultValue: true,
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
    tableName: "clients",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});
export default ClientModel;
