import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class ProductDiscountRangeModel extends Model {
    static getEditableFields = () => {
        return [
            "product_id", "unit_price", "min_qty", "max_qty"
        ];
    };
    static getAllFields() {
        return [
            "id", "product_id", "unit_price",
            "min_qty", "max_qty", "created_at",
            "updated_at"
        ];
    }
}
ProductDiscountRangeModel.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "products",
            key: "id"
        }
    },
    unit_price: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false
    },
    min_qty: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false
    },
    max_qty: {
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
    tableName: "product_discounts_ranges",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});
export default ProductDiscountRangeModel;
