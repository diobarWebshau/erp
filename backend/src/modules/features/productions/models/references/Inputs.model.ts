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
    custom_id?: string,
    description?: string,
    presentation?: string,
    storage_conditions: string,
    is_draft?: boolean,
    barcode?: number,
    name?: string,
    input_types_id?: number | null,
    unit_cost?: number,
    supplier?: string,
    photo?: string,
    status?: boolean,
    created_at?: Date,
    updated_at?: Date
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
            "supplier", "photo", "status", "presentation", "storage_conditions", "is_draft"
        ];
    }
    static getAllFields = () => {
        return [
            "id", "custom_id", "description", "barcode", "name", "input_types_id", "unit_cost",
            "supplier", "photo", "status", "created_at", "presentation", "storage_conditions", "is_draft", 
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