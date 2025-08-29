import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class ProductModel extends Model {
    static getEditableFields() {
        return [
            "name", "description", "type",
            "sku", "active", "sale_price", "photo"
        ];
    }
    static getAllFields() {
        return [
            "id", "name", "description", "type",
            "sku", "active", "sale_price", "photo",
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
    name: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    sku: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    sale_price: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false
    },
    active: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    photo: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE(),
        allowNull: false,
        defaultValue: DataTypes.NOW()
    },
    updated_at: {
        type: DataTypes.DATE(),
        allowNull: false,
        defaultValue: DataTypes.NOW()
    }
}, {
    sequelize,
    timestamps: true,
    tableName: "products",
    createdAt: "created_at",
    updatedAt: "updated_at",
});
export default ProductModel;
