import {
    DataTypes,
    Model,
    Optional
} from "sequelize";
import sequelize
    from "../../../../../mysql/configSequelize.js";
import {
    ProductAttributes
} from "../../../../types.js";

interface ProductionLineProductAttributes {
    id: number,
    production_line_id: number,
    product_id: number,
    products?: ProductAttributes
}

interface ProductionLineProductCreateAttributes
    extends Optional<ProductionLineProductAttributes, "id"> { }

interface ProductionLineProductManager {
    added: ProductionLineProductCreateAttributes[];
    deleted: ProductionLineProductAttributes[];
    modified: ProductionLineProductCreateAttributes[];
}

class ProductionLineProductModel
    extends Model<
        ProductionLineProductAttributes,
        ProductionLineProductCreateAttributes> {
    static getEditableFields = () => {
        return [
            "production_line_id", "product_id"
        ];
    }
    static getAllFields() {
        return [
            "id", "production_line_id",
            "product_id"
        ];
    }
}

ProductionLineProductModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        production_line_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "production_lines",
                key: "id"
            },
        },
        product_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "products",
                key: "id"
            }
        }
    },
    {
        sequelize,
        tableName: "production_lines_products",
        timestamps: false
    }
);

export {
    ProductionLineProductAttributes,
    ProductionLineProductCreateAttributes,
    ProductionLineProductManager
}

export default ProductionLineProductModel;