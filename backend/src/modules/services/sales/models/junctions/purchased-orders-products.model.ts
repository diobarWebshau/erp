import { DataTypes, Model, Optional }
    from "sequelize";
import sequelize
    from "../../../../../mysql/configSequelize.js";
import {
    AppliedProductDiscountClientCreateAttributes,
    AppliedProductDiscountRangeCreateAttributes,
    PurchasedOrderCreateAttributes,
    PurchasedOrdersProductsLocationsProductionLinesCreateAttributes,
    ShippingOrderPurchaseOrderProductCreateAttributes,
    ProductionOrderCreationAttributes
} from "../../../../../modules/types.js";

interface ProductionSummary {
    production_qty: number;
    production_order_qty: number;
    purchased_order_product_qty: number;
}

interface StockAvailable {
    stock: number;
    available: number;
    product_id: number;
    location_id: number;
    product_name: string;
    location_name: string;
    maximum_stock: number;
    minimum_stock: number;
}

interface ShippingSummary {
    order_qty: number;
    shipping_qty: number;
}

interface PurchaseOrderProductAttributes {
    id: number,
    purchase_order_id: number
    product_id: number,
    qty: number,
    product_name: string,
    recorded_price: number,
    original_price: number,
    status: string,
    purchase_order?: PurchasedOrderCreateAttributes
    purchase_order_product_location_production_line?:
    PurchasedOrdersProductsLocationsProductionLinesCreateAttributes,
    shipping_order_purchase_order_product?:
    ShippingOrderPurchaseOrderProductCreateAttributes[],
    production_summary?: ProductionSummary,
    was_price_edited_manually?: boolean | null,
    applied_product_discount_client?: AppliedProductDiscountClientCreateAttributes,
    applied_product_discount_range?: AppliedProductDiscountRangeCreateAttributes,
    stock_available?: StockAvailable,
    shipping_summary?: ShippingSummary,
    production_order?: ProductionOrderCreationAttributes
}

interface PurchasedOrderProductManager {
    added: PurchaseOrderProductCreateAttributes[],
    deleted: PurchaseOrderProductAttributes[],
    modified: PurchaseOrderProductCreateAttributes[],
}

interface PurchaseOrderProductCreateAttributes extends
    Optional<PurchaseOrderProductAttributes, "id"> { }

class PurchaseOrderProductModel
    extends Model
    <PurchaseOrderProductAttributes,
        PurchaseOrderProductCreateAttributes> {
    static getEditableFields = () => {
        return [
            "purchase_order_id", "qty", "status", "recorded_price"
        ];
    }
    static getAllFields = () => {
        return [
            "id", "purchase_order_id", "product_id",
            "qty", "product_name", "recorded_price",
            "status", "original_price"
        ];
    }
}

PurchaseOrderProductModel.init(
    {
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
    },
    {
        sequelize,
        tableName: "purchased_orders_products",
        timestamps: false
    }
);

export type {
    PurchaseOrderProductAttributes,
    PurchaseOrderProductCreateAttributes,
    PurchasedOrderProductManager
};

export default PurchaseOrderProductModel;