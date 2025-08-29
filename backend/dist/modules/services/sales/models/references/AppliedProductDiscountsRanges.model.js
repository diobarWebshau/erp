import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class AppliedProductDiscountRangeModel extends Model {
    static getEditableFields = () => {
        return [
            "product_discount_range_id",
            "purchase_order_product_id",
            "unit_discount",
            "min_qty",
            "max_qty",
        ];
    };
    static getAllFields() {
        return [
            "id", "product_discount_range_id",
            "purchase_order_product_id",
            "unit_discount",
            "min_qty",
            "max_qty",
            "created_at",
            "updated_at",
        ];
    }
}
AppliedProductDiscountRangeModel.init({
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
    product_discount_range_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "product_discounts_ranges",
            key: "id",
        }
    },
    unit_discount: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false,
    },
    max_qty: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false,
    },
    min_qty: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    }
}, {
    sequelize,
    tableName: "applied_product_discounts_ranges",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
export default AppliedProductDiscountRangeModel;
