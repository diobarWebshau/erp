import { DataTypes, Model, Optional }
    from "sequelize";
import sequelize
    from "../../../../../mysql/configSequelize.js";
import { ProductionAttributes } from "./Productions.model.js";
import { LocationAttributes, ProductionLineAttributes } from "src/modules/types.js";

interface ExtraData {
    scrap_qty: number;
    location: LocationAttributes;
    production_qty: number;
    production_line: ProductionLineAttributes;
}

interface ProductionOrderAttributes {
    id: number,
    order_type: "internal" | "client",
    order_id: number,
    product_id: number,
    product_name: string,
    qty: number,
    status: string,
    created_at: Date,
    updated_at: Date,
    productions?: ProductionAttributes[],
    extra_data?: ExtraData
}

interface ProductionOrderCreationAttributes
    extends Optional<ProductionOrderAttributes,
        "id" | "created_at" | "updated_at"> { }

class ProductionOrderModel
    extends Model<
        ProductionOrderAttributes,
        ProductionOrderCreationAttributes> {
    static getEditableFields(): string[] {
        return [
            "qty", "status",
        ];
    }
    static getAllFields(): string[] {
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

export type {
    ProductionOrderAttributes,
    ProductionOrderCreationAttributes
};

export default ProductionOrderModel;