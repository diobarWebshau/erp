import sequelize from "../../../../../mysql/configSequelize.js";
import { Model, DataTypes } from "sequelize";
class ProductionLineModel extends Model {
    static getEditableFields() {
        return ['name', "is_active", "custom_id"];
    }
    static getAllFields() {
        return [
            "id", "custom_id", "name", "is_active",
            "created_at", "updated_at"
        ];
    }
}
ProductionLineModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    custom_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    is_active: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
}, {
    sequelize,
    tableName: "production_lines",
    timestamps: false
});
export default ProductionLineModel;
