import { DataTypes, Model, Optional }
    from "sequelize";
import sequelize
    from "../../../../../mysql/configSequelize.js";

interface AppliedProductDiscountClientAttributes {
    id: number,
    purchase_order_product_id: number,
    product_discount_client_id: number,
    discount_percentage: number,
    created_at: Date,
    updated_at: Date
}

interface AppliedProductDiscountClientCreateAttributes extends
    Optional<AppliedProductDiscountClientAttributes,
        "id" | "created_at" | "updated_at"> { }

class AppliedProductDiscountClientModel extends
    Model<AppliedProductDiscountClientAttributes,
        AppliedProductDiscountClientCreateAttributes> {
    static getEditableFields = () => {
        return [
            "purchase_order_product_id",
            "product_discount_client_id",
        ];
    }
    static getAllFields = () => {
        return [
            "id",
            "purchase_order_product_id",
            "product_discount_client_id",
            "discount_percentage",
            "created_at",
            "updated_at"
        ];
    }
}

AppliedProductDiscountClientModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    purchase_order_product_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "purchased_orders_products",
            key: "id"
        }
    },
    product_discount_client_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "product_discounts_clients",
            key: "id"
        }
    },
    discount_percentage: {
        type: DataTypes.DECIMAL(14, 4),
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
},
    {
        sequelize,
        tableName: "applied_product_discounts_client",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

export type {
    AppliedProductDiscountClientAttributes,
    AppliedProductDiscountClientCreateAttributes
}

export default AppliedProductDiscountClientModel;