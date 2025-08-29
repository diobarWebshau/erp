import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class ProductProcessModel extends Model {
    static getEditableFields = () => {
        return ["process_id", "product_id", "sort_order"];
    };
    static getAllFields() {
        return ["id", "process_id", "product_id", "sort_order"];
    }
}
ProductProcessModel.init({
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
}, {
    sequelize,
    tableName: "products_processes",
    timestamps: false
});
export default ProductProcessModel;
