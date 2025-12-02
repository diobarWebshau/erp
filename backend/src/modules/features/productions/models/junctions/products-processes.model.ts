import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
import { ProcessCreateAttributes } from "../base/Processes.model.js";
import { ProductInputProcessCreateAttributes } from "./products_inputs_processes.model.js";

interface ProductProcessAttributes {
    id: number,
    product_id: number,
    process_id: number,
    sort_order: number,
    process?: ProcessCreateAttributes
    product_input_process?: ProductInputProcessCreateAttributes[]
    product_input_process_updated?: ProductProcessManager
}

interface ProductProcessCreateAttributes extends Optional<ProductProcessAttributes, "id"> { }

interface ProductProcessManager {
    added: ProductProcessCreateAttributes[];
    deleted: ProductProcessAttributes[];
    modified: ProductProcessCreateAttributes[];
}

class ProductProcessModel
    extends Model<
        ProductProcessAttributes,
        ProductProcessCreateAttributes> {
    static getEditableFields = () => {
        return ["process_id", "product_id", "sort_order"];
    }
    static getAllFields() {
        return ["id", "process_id", "product_id", "sort_order"];
    }
}

ProductProcessModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        process_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "processes",
                key: "id"
            },
        },
        product_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "products",
                key: "id"
            },
        },
        sort_order: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: "products_processes",
        timestamps: false
    }
);

export {
    ProductProcessAttributes,
    ProductProcessCreateAttributes,
    ProductProcessManager
}

export default ProductProcessModel;