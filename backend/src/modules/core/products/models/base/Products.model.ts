import {
    ProductProcessCreateAttributes, ProductDiscountRangeCreateAttributes,
    ProductInputAttributes, ProductInputManager, ProductDiscountRangeManager,
    ProductProcessManager
} from "../../../../types";
import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional } from "sequelize";

interface ProductLocationAvailability {
    location_id: number;      // id de la ubicación
    location_name: string;    // nombre de la ubicación
    stock: number;            // stock
    maximum_stock: number;    // stock máximo
    minimum_stock: number;    // stock mínimo
    available: number;        // cantidad disponible
    product_id: number;       // id del producto
    product_name: string;     // nombre del producto
}

interface ProductAttributes {
    id: number,
    custom_id: string,
    name: string,
    description: string,
    type: string,
    sku: string,
    sale_price: number,
    active: boolean,
    photo: string,
    created_at: Date,
    updated_at: Date
    // para la creacion de las relaciones
    product_processes?: ProductProcessCreateAttributes[],
    product_discount_ranges?: ProductDiscountRangeCreateAttributes[],
    products_inputs?: ProductInputAttributes[],
    // para la actualizacion de las relaciones
    product_discount_ranges_updated?: ProductDiscountRangeManager[],
    products_inputs_updated?: ProductInputManager[],
    product_processes_updated?: ProductProcessManager[],
    summary_location?: ProductLocationAvailability
}

interface ProductCreateAttributes
    extends Optional<ProductAttributes,
        "id" | "created_at" | "updated_at"> { }

class ProductModel
    extends Model<
        ProductAttributes,
        ProductCreateAttributes> {
    static getEditableFields(): string[] {
        return [
            "custom_id", "name", "description", "type",
            "sku", "active", "sale_price", "photo"
        ];
    }
    static getAllFields(): string[] {
        return [
            "id", "custom_id", "name", "description", "type",
            "sku", "active", "sale_price", "photo",
            "created_at", "updated_at"
        ];
    }
}

ProductModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        custom_id: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: false,
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
    },
    {
        sequelize,
        timestamps: true,
        tableName: "products",
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export type {
    ProductAttributes,
    ProductCreateAttributes,
    ProductLocationAvailability
};

export default ProductModel;