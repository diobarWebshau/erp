import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class ProductInputModel extends Model {
    static getEditableFields = () => {
        return [
            "input_id", "product_id",
            "equivalence"
        ];
    };
    static getAllFields = () => {
        return [
            "id", "input_id", "product_id",
            "equivalence"
        ];
    };
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
}, {
    sequelize,
    tableName: "products_inputs",
    timestamps: false
});
export default ProductInputModel;
