import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class ShippingOrderPurchaseOrderProductModel extends Model {
    static getEditableFields = () => {
        return [
            "shipping_order_id",
            "purchase_order_product_id",
            "qty"
        ];
    };
    static getAllFields() {
        return [
            "id", "shipping_order_id",
            "purchase_order_product_id",
            "qty"
        ];
    }
}
ShippingOrderPurchaseOrderProductModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    shipping_order_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "shipping_orders",
            key: "id"
        },
    },
    purchase_order_product_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "purchased_orders_products",
            key: "id"
        }
    },
    qty: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false
    }
}, {
    sequelize,
    tableName: "shipping_orders_purchased_order_products",
    timestamps: false
});
export default ShippingOrderPurchaseOrderProductModel;
