import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class InputModel extends Model {
    static getEditableFields = () => {
        return [
            "name", "input_types_id", "unit_cost",
            "supplier", "photo", "status"
        ];
    };
    static getAllFields = () => {
        return [
            "id", "name", "input_types_id", "unit_cost",
            "supplier", "photo", "status", "created_at",
            "updated_at"
        ];
    };
}
InputModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    input_types_id: {
        type: DataTypes.INTEGER(),
        allowNull: true,
        references: {
            model: "input_types",
            key: "id"
        },
    },
    unit_cost: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false
    },
    supplier: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    photo: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
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
    tableName: "inputs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});
export default InputModel;
