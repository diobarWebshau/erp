import {
    DataTypes,
    Model,
    Optional
} from "sequelize";
import sequelize from
    "../../../../../mysql/configSequelize.js";
import {
    ScrapCreateAttributes,
} from "../../../../types.js";

interface ProductionAttributes {
    id: number,
    production_order_id: number,
    product_id: number,
    product_name: string,
    process_id: number,
    qty: number,
    created_at: Date,
    updated_at: Date,
    scraps?: ScrapCreateAttributes[]
}

interface ProductionCreationAttributes
    extends Optional<ProductionAttributes,
        "id" | "created_at" | "updated_at"> { }

class ProductionModel
    extends Model<
        ProductionAttributes,
        ProductionCreationAttributes> {
    static getEditableFields(): string[] {
        return [
            "qty"
        ];
    }
    static getAllFields(): string[] {
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

export type {
    ProductionAttributes,
    ProductionCreationAttributes
};

export default ProductionModel;