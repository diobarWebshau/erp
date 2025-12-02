import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class ProcessModel extends Model {
    static getEditableFields = () => {
        return ["name", "description"];
    };
    static getAllFields() {
        return ["id", "name", "description"];
    }
}
ProcessModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
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
    tableName: "processes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});
export default ProcessModel;
