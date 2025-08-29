import { DataTypes, Model, Optional }
    from "sequelize";
import sequelize
    from "../../../../../mysql/configSequelize.js";

interface OperationAttributes {
    id: number,
    name: string,
    created_at: Date,
    updated_at: Date,
}

interface OperationCreateAttributes
    extends Optional<OperationAttributes,
        "id" | "created_at" | "updated_at"> { }

class OperationModel
    extends Model<OperationAttributes,
        OperationCreateAttributes> {

    static getEditableFields = (): string[] => [
        "name"
    ];

    static getAllFields = (): string[] => [
        "id", "name",
        "created_at", "updated_at",
    ];
}

OperationModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "operations",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export type {
    OperationAttributes,
    OperationCreateAttributes
}

export default OperationModel;
