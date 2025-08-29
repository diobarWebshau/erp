import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class ProductionOrderModel extends Model {
    static getEditableFields() {
        return [
            "qty", "status",
        ];
    }
    static getAllFields() {
        return [
            "id", "order_type", "order_id",
            "product_name", "product_id",
            "qty", "status", "created_at",
            "updated_at"
        ];
    }
}
ProductionOrderModel.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order_type: {
        type: DataTypes.ENUM("internal", "client"),
        allowNull: false
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "products",
            key: "id"
        }
    },
    qty: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(100),
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
    tableName: "production_orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});
export default ProductionOrderModel;
