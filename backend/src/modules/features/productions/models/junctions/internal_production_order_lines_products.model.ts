import { DataTypes, Model, Optional }
    from "sequelize";
import sequelize
    from "../../../../../mysql/configSequelize.js";

interface InternalProductionOrderLineProductAttributes {
    id: number,
    internal_product_production_order_id: number,
    production_line_id: number
}

interface InternalProductionOrderLineProductCreateAttributes
    extends Optional<InternalProductionOrderLineProductAttributes,
        "id"> { }

class InternalProductionOrderLineProductModel
    extends Model<
        InternalProductionOrderLineProductAttributes,
        InternalProductionOrderLineProductCreateAttributes> {
    static getEditableFields = () => {
        return [
            "production_line_id",
            "internal_product_production_order_id"
        ];
    }
    static getAllFields() {
        return [
            "id", "production_line_id",
            "internal_product_production_order_id"
        ];
    }
}

InternalProductionOrderLineProductModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        production_line_id: {
            type: DataTypes.INTEGER,
            references: {
                model:
                    "production_lines",
                key: "id"
            },
        },
        internal_product_production_order_id: {
            type: DataTypes.INTEGER,
            references: {
                model:
                    "internal_product_production_orders",
                key: "id"
            }
        }
    },
    {
        sequelize,
        tableName: "internal_production_orders_lines_products",
        timestamps: false
    }
);

export type {
    InternalProductionOrderLineProductAttributes,
    InternalProductionOrderLineProductCreateAttributes
};

export default InternalProductionOrderLineProductModel;