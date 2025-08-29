import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class InputTypeModel extends Model {
    static getEditableFields = () => {
        return ["name"];
    };
    static getAllFields() {
        return [
            "id", "name",
            "created_at", "updated_at"
        ];
    }
}
InputTypeModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
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
    tableName: "input_types",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});
export default InputTypeModel;
