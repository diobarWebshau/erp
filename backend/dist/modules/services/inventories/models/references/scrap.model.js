import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class ScrapModel extends Model {
    static getAllFields() {
        return [
            "id", "reference_type",
            "reference_id", "location_id",
            "location_name", "item_id",
            "item_type", "item_name",
            "qty"
        ];
    }
    static getEditableFields() {
        return [
            "reference_id",
            "location_id",
            "item_type", "item_id",
            "qty"
        ];
    }
}
ScrapModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    reference_type: {
        type: DataTypes.ENUM("production"),
        allowNull: false
    },
    reference_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    location_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    location_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    item_type: {
        type: DataTypes.ENUM("product", "input"),
        allowNull: false
    },
    item_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    qty: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    tableName: "scrap",
    timestamps: true,
});
export default ScrapModel;
