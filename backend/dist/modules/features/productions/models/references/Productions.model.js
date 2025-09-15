import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class ProductionModel extends Model {
    static getEditableFields() {
        return [
            "qty"
        ];
    }
    static getAllFields() {
        return [
            "id", "production_order_id",
            "product_name", "product_id",
            "process_id", "qty", "created_at",
            "updated_at"
        ];
    }
}
ProductionModel.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    production_order_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "production_orders",
            key: "id"
        }
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
    process_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "processes",
            key: "id"
        }
    },
    qty: {
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
    tableName: "productions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});
export default ProductionModel;
