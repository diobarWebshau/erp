import {
    DataTypes,
    Model,
    Optional
} from "sequelize";
import sequelize
    from "../../../../../mysql/configSequelize.js";
import {
    PurchaseOrderProductCreateAttributes
} from "./../../../../types.js";

interface ShippingOrderPurchaseOrderProductAttributes {
    id: number,
    shipping_order_id: number,
    purchase_order_product_id: number,
    qty: number,
    purchase_order_products?: PurchaseOrderProductCreateAttributes
}

interface ShippingOrderPurchaseOrderProductCreateAttributes
    extends Optional<
        ShippingOrderPurchaseOrderProductAttributes,
        "id"
    > { }

interface ShippingOrderPurchaseOrderProductManager {
    added: ShippingOrderPurchaseOrderProductCreateAttributes[],
    deleted: ShippingOrderPurchaseOrderProductAttributes[],
    modified: ShippingOrderPurchaseOrderProductCreateAttributes[]
}

class ShippingOrderPurchaseOrderProductModel extends
    Model<
        ShippingOrderPurchaseOrderProductAttributes,
        ShippingOrderPurchaseOrderProductCreateAttributes
    > {
    static getEditableFields = () => {
        return [
            "shipping_order_id",
            "purchase_order_product_id",
            "qty"
        ];
    }
    static getAllFields() {
        return [
            "id", "shipping_order_id",
            "purchase_order_product_id",
            "qty"
        ];
    }
}

ShippingOrderPurchaseOrderProductModel.init(
    {
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
    },
    {
        sequelize,
        tableName:
            "shipping_orders_purchased_order_products",
        timestamps: false
    }
);

export {
    ShippingOrderPurchaseOrderProductAttributes,
    ShippingOrderPurchaseOrderProductCreateAttributes,
    ShippingOrderPurchaseOrderProductManager
}

export default ShippingOrderPurchaseOrderProductModel;