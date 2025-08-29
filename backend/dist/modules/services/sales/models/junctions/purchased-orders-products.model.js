import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class PurchaseOrderProductModel extends Model {
    static getEditableFields = () => {
        return [
            "purchase_order_id", "qty", "status", "recorded_price"
        ];
    };
    static getAllFields = () => {
        return [
            "id", "purchase_order_id", "product_id",
            "qty", "product_name", "recorded_price",
            "status", "original_price"
        ];
    };
}
PurchaseOrderProductModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    purchase_order_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "purchased_orders",
            key: "id"
        },
        allowNull: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "products",
            key: "id"
        },
        allowNull: true
    },
    qty: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false,
    },
    recorded_price: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false,
    },
    product_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    original_price: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    sequelize,
    tableName: "purchased_orders_products",
    timestamps: false
});
export default PurchaseOrderProductModel;
