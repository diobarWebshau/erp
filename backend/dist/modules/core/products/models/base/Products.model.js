import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class ProductModel extends Model {
    static getEditableFields() {
        return [
            "custom_id", "name", "description", "barcode", "type", "presentation",
            "production_cost", "is_draft", "storage_conditions",
            "sku", "active", "sale_price", "photo"
        ];
    }
    static getAllFields() {
        return [
            "id", "custom_id", "name", "description", "barcode", "type",
            "sku", "active", "sale_price", "photo", "presentation",
            "production_cost", "is_draft", "storage_conditions",
            "created_at", "updated_at"
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
        type: DataTypes.INTEGER,
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
