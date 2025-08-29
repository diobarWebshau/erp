import {
    DataTypes,
    Model,
    Optional
} from "sequelize";
import sequelize
    from "./../../../../../mysql/configSequelize.js";
import {
    CarrierCreateAttributes,
    ShippingOrderPurchaseOrderProductCreateAttributes,
    ShippingOrderPurchaseOrderProductManager
} from "../../../../types.js";

interface LoadEvidenceItem {
    path: string;
    id: string;
}

interface PartialLoadEvidenceItem {
    path?: string;
    id?: string;
}

interface ShippingOrderAttributes {
    id: number;
    code: string;
    status: string;
    carrier_id: number;
    load_evidence: LoadEvidenceItem[];
    delivery_cost: number;
    delivery_date: Date;
    shipping_date: Date;
    created_at: Date;
    updated_at: Date;

    load_evidence_old?: PartialLoadEvidenceItem[];
    load_evidence_deleted?: PartialLoadEvidenceItem[];
    shipping_order_purchase_order_product?:
    ShippingOrderPurchaseOrderProductCreateAttributes[]
    shipping_order_purchase_order_product_manager?:
    ShippingOrderPurchaseOrderProductManager,
    carrier?: CarrierCreateAttributes

}

interface ShippingOrderCreationAttributes
    extends Optional<ShippingOrderAttributes,
        "id" | "created_at" | "updated_at"> { }

class ShippingOrderModel extends
    Model<ShippingOrderAttributes,
        ShippingOrderCreationAttributes> {
    static getEditableFields(): string[] {
        return [
            "id", "status", "carrier_id",
            "load_evidence", "delivery_cost",
            "delivery_date", "shipping_date",
            "created_at", "updated_at"
        ];
    }
    static getAllFields(): string[] {
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

export type {
    ShippingOrderAttributes,
    ShippingOrderCreationAttributes,
    LoadEvidenceItem,
    PartialLoadEvidenceItem
}

export default ShippingOrderModel;