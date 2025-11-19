import {
    DataTypes,
    Model,
    Optional
} from "sequelize";
import sequelize
    from "../../../../../mysql/configSequelize.js";
import {
    InputTypeAttributes
} from "../base/InputTypes.model.js";

interface InputAttributes {
    id: number,
    custom_id: string,
    description: string,
    barcode: number,
    name: string,
    input_types_id: number | null,
    unit_cost: number,
    supplier: string,
    photo: string,
    status: boolean,
    created_at: Date,
    updated_at: Date
    input_types?: InputTypeAttributes
}

interface InputCreateAttributes
    extends Optional<InputAttributes,
        "id" | "created_at" | "updated_at"> { }

class InputModel extends
    Model<
        InputAttributes, InputCreateAttributes> {
    static getEditableFields = () => {
        return [
            "custom_id", "description", "barcode", "name", "input_types_id", "unit_cost",
            "supplier", "photo", "status"
        ];
    }
    static getAllFields = () => {
        return [
            "id", "custom_id", "description", "barcode", "name", "input_types_id", "unit_cost",
            "supplier", "photo", "status", "created_at",
            "updated_at"
        ];
    }
}

InputModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        custom_id: {
            type: DataTypes.STRING(50),
            allowNull: false
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
            allowNull: false
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: "inputs",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

export type {
    InputAttributes, InputCreateAttributes
}

export default InputModel;