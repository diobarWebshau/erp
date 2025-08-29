import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class ProductionLineProductModel extends Model {
    static getEditableFields = () => {
        return [
            "production_line_id", "product_id"
        ];
    };
    static getAllFields() {
        return [
            "id", "production_line_id",
            "product_id"
        ];
    }
}
ProductionLineProductModel.init({
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
}, {
    sequelize,
    tableName: "production_lines_products",
    timestamps: false
});
export default ProductionLineProductModel;
