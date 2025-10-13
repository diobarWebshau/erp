import { DataTypes, Model } from "sequelize";
import sequelize from "./../../../../../mysql/configSequelize.js";
class ShippingOrderModel extends Model {
    static getEditableFields() {
        return [
            "id", "status", "carrier_id",
            "load_evidence", "delivery_cost",
            "delivery_date", "shipping_date",
            "tracking_number", "shipment_type", "transport_method", "comments",
            "created_at", "updated_at"
        ];
    }
    static getAllFields() {
        return [
            "id", "code", "status", "carrier_id",
            "load_evidence", "delivery_cost",
            "delivery_date", "shipping_date",
            "tracking_number", "shipment_type", "transport_method", "comments",
            "created_at", "updated_at"
        ];
    }
}
ShippingOrderModel.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    status: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    carrier_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "carriers",
            key: "id"
        }
    },
    load_evidence: {
        type: DataTypes.JSON,
        allowNull: true
    },
    tracking_number: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    shipment_type: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    transport_method: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    delivery_cost: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false
    },
    delivery_date: {
        type: DataTypes.DATE,
        allowNull: false // como lo tenías
    },
    shipping_date: {
        type: DataTypes.DATE,
        allowNull: false // como lo tenías
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
    tableName: "shipping_orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});
export default ShippingOrderModel;
