import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class InputModel extends Model {
    static getEditableFields = () => {
        return [
            "custom_id", "description", "barcode", "name", "input_types_id", "unit_cost",
            "supplier", "photo", "status", "presentation", "storage_conditions", "is_draft"
        ];
    };
    static getAllFields = () => {
        return [
            "id", "custom_id", "description", "barcode", "name", "input_types_id", "unit_cost",
            "supplier", "photo", "status", "created_at", "presentation", "storage_conditions", "is_draft",
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
    presentation: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    storage_conditions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_draft: {
        type: DataTypes.TINYINT,
        allowNull: true
    },
    custom_id: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    barcode: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: true
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
        allowNull: true
    },
    supplier: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    photo: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE,
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
