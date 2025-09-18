import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class ProductInputProcessModel extends Model {
    static getEditableFields = () => {
        return [
            "product_id",
            "product_input_id",
            "product_process_id",
            "qty"
        ];
    };
    static getAllFields = () => {
        return [
            "id",
            "product_id",
            "product_input_id",
            "product_process_id",
            "qty"
        ];
    };
}
ProductInputProcessModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "products", key: "id" }
    },
    product_input_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "products_inputs", key: "id" }
    },
    product_process_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "products_processes", key: "id" }
    },
    qty: {
        type: DataTypes.DECIMAL(18, 6),
        allowNull: false,
        defaultValue: 0
    }
}, {
    sequelize,
    tableName: "products_inputs_processes",
    timestamps: false,
    // IMPORTANTE: no declares aquí el unique uq_pip ni otros índices
    // porque ya existen en el DDL y Sequelize intentará recrearlos.
});
export default ProductInputProcessModel;
