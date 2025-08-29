import sequelize
    from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional }
    from "sequelize";

interface InputTypeAttributes {
    id: number,
    name: string,
    created_at: Date,
    updated_at: Date
}

interface InputTypeCreateAttributes
    extends Optional<InputTypeAttributes,
        "id" | "created_at" | "updated_at"> { }


class InputTypeModel
    extends Model<
        InputTypeAttributes,
        InputTypeCreateAttributes> {
    static getEditableFields = (): string[] => {
        return ["name"];
    }
    static getAllFields(): string[] {
        return [
            "id", "name",
            "created_at", "updated_at"
        ]
    }
}

InputTypeModel.init(
    {
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
    },
    {
        sequelize,
        tableName: "input_types",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

export type{
    InputTypeAttributes,
    InputTypeCreateAttributes
}


export default InputTypeModel;