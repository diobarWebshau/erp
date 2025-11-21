import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
import { ProductInputCreateAttributes } from "./product-Input.model.js";
import { ProductProcessAttributes } from "./products-processes.model.js";

interface ProductInputProcessAttributes {
  id: number,
  product_id: number,
  product_input_id: number,
  product_process_id: number,
  qty: string | number,
  product_input?: ProductInputCreateAttributes,
  product_process?: ProductProcessAttributes
}

interface ProductInputProcessCreateAttributes
  extends Optional<ProductInputProcessAttributes, "id"> {}

class ProductInputProcessModel
  extends Model<ProductInputProcessAttributes, ProductInputProcessCreateAttributes> {
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

ProductInputProcessModel.init(
  {
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
  },
  {
    sequelize,
    tableName: "products_inputs_processes",
    timestamps: false,
    // IMPORTANTE: no declares aquí el unique uq_pip ni otros índices
    // porque ya existen en el DDL y Sequelize intentará recrearlos.
  }
);

export type {
  ProductInputProcessAttributes,
  ProductInputProcessCreateAttributes
};

export default ProductInputProcessModel;
