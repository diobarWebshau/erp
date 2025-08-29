import { DataTypes, Model, Optional }
    from "sequelize";
import sequelize
    from "../../../../../mysql/configSequelize.js";

interface LogAttributes {
    id: number,
    operation_id: number | null,
    user_id: number | null,
    table_id: number | null,
    table_name: string | null,
    operation_name: string | null,
    user_name: string | null,
    old_data: object | null,
    new_data: object | null,
    message: string,
    created_at: Date,
    updated_at: Date,
}

interface LogCreateAttributes
    extends Optional<LogAttributes,
        "id" | "created_at" | "updated_at"> { }

class LogModel
    extends Model<LogAttributes,
        LogCreateAttributes> {

    static getEditableFields = (): string[] => [
        "message"
    ];

    static getAllFields = (): string[] => [
        "id", "operation_id", "operation_name",
        "table_id", "table_name", "user_id", "user_name",
        "old_data", "new_data", "message",
        "created_at", "updated_at",
    ];
}

LogModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        operation_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "operations",
                key: "id"
            },
            allowNull: true,
        },
        table_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "tables",
                key: "id"
            },
            allowNull: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "users",
                key: "id"
            },
            allowNull: true,
        },
        operation_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        table_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        user_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        old_data: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        new_data: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        message: {
            type: DataTypes.TEXT,
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
        tableName: "logs",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export type {
    LogAttributes,
    LogCreateAttributes
}

export default LogModel;
