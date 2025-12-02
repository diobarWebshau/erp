import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class ProductModel extends Model {
    static getEditableFields() {
        return [
            "name", "storage_conditions", "description", "unit_of_measure", "presentation",
            "production_cost", "barcode", "type", "sku", "sale_price",
            "active", "photo", "is_draft", "custom_id"
        ];
    }
    static getAllFields() {
        return [
            "id", "updated_at", "created_at",
            "name", "storage_conditions", "description", "unit_of_measure", "presentation",
            "production_cost", "barcode", "type", "sku", "sale_price",
            "active", "photo", "is_draft", "custom_id"
        ];
    }
}
ProductModel.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    custom_id: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: true,
    },
    storage_conditions: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    unit_of_measure: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    name: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    presentation: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    production_cost: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: true,
    },
    is_draft: {
        type: DataTypes.TINYINT,
    },
    barcode: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    sku: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    sale_price: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: true,
    },
    active: {
        type: DataTypes.TINYINT,
        allowNull: true,
    },
    photo: {
        type: DataTypes.STRING(200),
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE(),
        defaultValue: DataTypes.NOW(),
        allowNull: true,
    },
    updated_at: {
        type: DataTypes.DATE(),
        defaultValue: DataTypes.NOW(),
        allowNull: true,
    }
}, {
    sequelize,
    timestamps: true,
    tableName: "products",
    createdAt: "created_at",
    updatedAt: "updated_at",
});
export default ProductModel;
