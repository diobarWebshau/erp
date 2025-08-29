import sequelize
    from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional }
    from "sequelize";

interface ProcessAttributes {
    id: number,
    name: string,
    created_at: Date,
    updated_at: Date,
}

interface ProcessCreateAttributes
    extends Optional<ProcessAttributes,
        "id" | "created_at" | "updated_at"> { }

class ProcessModel
    extends Model<
        ProcessAttributes,
        ProcessCreateAttributes> {
    static getEditableFields = (): string[] => {
        return ["name"];
    }
    static getAllFields(): string[] {
        return ["id", "name"];
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