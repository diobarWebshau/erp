import { DataTypes, Model } from "sequelize";
import sequelize from "./../../../../../mysql/configSequelize.js";
class ShippingOrderModel extends Model {
    static getEditableFields() {
        return [
            "id", "status", "carrier_id",
            "load_evidence", "delivery_cost",
            "delivery_date", "shipping_date",
            "created_at", "updated_at"
        ];
    }
    static getAllFields() {
        return [
            "id", "code", "status", "carrier_id",
            "load_evidence", "delivery_cost",
            "delivery_date", "shipping_date",
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
    delivery_cost: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false
    },
    delivery_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    shipping_date: {
        type: DataTypes.DATE,
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
    tableName: "shipping_orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});
export default ShippingOrderModel;
