import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class AppliedProductDiscountClientModel extends Model {
    static getEditableFields = () => {
        return [
            "purchase_order_product_id",
            "product_discount_client_id",
        ];
    };
    static getAllFields = () => {
        return [
            "id",
            "purchase_order_product_id",
            "product_discount_client_id",
            "discount_percentage",
            "created_at",
            "updated_at"
        ];
    };
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
}, {
    sequelize,
    tableName: "applied_product_discounts_client",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});
export default AppliedProductDiscountClientModel;
