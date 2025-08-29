import { DataTypes, Model } from "sequelize";
import sequelize from "./../../../../../mysql/configSequelize.js";
class PurchasedOrdersProductsLocationsProductionLinesModel extends Model {
    static getEditableFields = () => {
        return [
            "production_line_id",
            "purchase_order_product_id"
        ];
    };
    static getAllFields() {
        return [
            "id", "production_line_id",
            "purchase_order_product_id"
        ];
    }
}
PurchasedOrdersProductsLocationsProductionLinesModel.init({
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
    purchase_order_product_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "purchased_orders_products",
            key: "id"
        }
    }
}, {
    sequelize,
    tableName: "purchased_orders_products_locations_production_lines",
    timestamps: false
});
export default PurchasedOrdersProductsLocationsProductionLinesModel;
