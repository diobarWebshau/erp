import { ProductInputProcessCreateAttributes } from "./products_inputs_processes.model.js";
import { InputCreateAttributes } from "../references/Inputs.model.js";
import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional } from "sequelize";

interface ProductInputAttributes {
    id: number,
    product_id: number
    input_id: number,
    equivalence: number,
    inputs?: InputCreateAttributes,
    product_input_process?: ProductInputProcessCreateAttributes[]
}

interface ProductInputCreateAttributes
    extends Optional<ProductInputAttributes,
        "id"> { }

interface ProductInputManager {
    added: ProductInputCreateAttributes[];
    deleted: ProductInputAttributes[];
    modified: ProductInputCreateAttributes[];
}

class ProductInputModel extends
    Model<ProductInputAttributes,
        ProductInputCreateAttributes> {
    static getEditableFields = () => {
        return [
            "input_id", "product_id",
            "equivalence"
        ];
    }
    static getAllFields = () => {
        return [
            "id", "input_id", "product_id",
            "equivalence"
        ]
    }
}

ProductInputModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    input_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "inputs",
            key: "id"
        },
    },
    product_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "products",
            key: "id"
        }
    },
    equivalence: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false
    }
},
    {
        sequelize,
        tableName: "products_inputs",
        timestamps: false
    }
);

export type {
    ProductInputAttributes,
    ProductInputCreateAttributes,
    ProductInputManager
}


export default ProductInputModel;