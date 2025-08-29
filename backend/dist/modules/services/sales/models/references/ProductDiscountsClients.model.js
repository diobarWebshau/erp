import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class ProductDiscountClientModel extends Model {
    static getEditableFields = () => {
        return [
            "product_id", "client_id",
            "discount_percentage"
        ];
    };
    static getAllFields() {
        return [
            "id", "product_id", "client_id",
            "discount_percentage", "created_at",
            "updated_at"
        ];
    }
}
ProductDiscountClientModel.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    client_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "clients",
            key: "id"
        }
    },
    product_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "products",
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
    tableName: "product_discounts_clients",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
export default ProductDiscountClientModel;
