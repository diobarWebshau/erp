import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class PurchasedOrderModel extends Model {
    static getEditableFields = () => {
        return [
            "order_code", "delivery_date",
            "status", "client_id", "company_name",
            "tax_id", "email", "phone", "city",
            "state", "country", "street", "street_number", "neighborhood",
            "payment_terms", "zip_code", "tax_regimen",
            "cfdi", "payment_method", "client_address_id",
            "shipping_street", "shipping_street_number", "shipping_neighborhood", "shipping_city",
            "shipping_state", "shipping_country",
            "shipping_zip_code", "total_price", "created_at"
        ];
    };
    static getAllFields() {
        return [
            "id", "order_code", "delivery_date",
            "status", "client_id", "company_name",
            "tax_id", "email", "phone", "city",
            "state", "country", "street", "street_number", "neighborhood",
            "payment_terms", "zip_code", "tax_regimen",
            "cfdi", "payment_method", "client_address_id",
            "shipping_street", "shipping_street_number", "shipping_neighborhood", "shipping_city",
            "shipping_state", "shipping_country",
            "shipping_zip_code", "total_price",
            "created_at", "updated_at"
        ];
    }
}
PurchasedOrderModel.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order_code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    delivery_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    // client fields
    client_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "clients",
            key: "id"
        },
    },
    company_name: {
        type: DataTypes.STRING(100),
        allowNull: false
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
        type: DataTypes.STRING(100),
        allowNull: false
    },
    neighborhood: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    payment_terms: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    zip_code: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    tax_regimen: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    cfdi: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    payment_method: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    // shipping fields(client address)
    client_address_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "clients_addresses",
            key: "id"
        },
    },
    shipping_street: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    shipping_street_number: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    shipping_neighborhood: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    shipping_city: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    shipping_state: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    shipping_country: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    shipping_zip_code: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    //
    total_price: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE(),
        // defaultValue: DataTypes.NOW(),
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE(),
        // defaultValue: DataTypes.NOW(),
        allowNull: false
    }
}, {
    sequelize,
    tableName: "purchased_orders",
    timestamps: true,
    updatedAt: "updated_at",
    createdAt: "created_at"
});
export default PurchasedOrderModel;
