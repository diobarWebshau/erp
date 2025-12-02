import { ProductInputProcessAttributes } from "../junctions/products_inputs_processes.model.js";
import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional } from "sequelize";

interface ProcessAttributes {
    id: number,
    name: string | null,
    description: string | null,
    created_at: Date,
    updated_at: Date,
}

type ProcessCreateAttributes = Partial<ProcessAttributes>;

class ProcessModel extends Model<ProcessAttributes, ProcessCreateAttributes> {
    static getEditableFields = (): string[] => {
        return ["name", "description"];
    }
    static getAllFields(): string[] {
        return ["id", "name", "description"];
    }
}

ProcessModel.init(
    {
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
    },
    {
        sequelize,
        tableName: "processes",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

export type {
    ProcessAttributes, ProcessCreateAttributes
}

export default ProcessModel;