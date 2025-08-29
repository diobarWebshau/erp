import { DataTypes, Model, Optional }
    from "sequelize";
import sequelize
    from "../../../../../mysql/configSequelize.js";

interface TableAttributes {
    id: number,
    name: string,
    table_name: string,
    created_at: Date,
    updated_at: Date,
}

interface TableCreateAttributes
    extends Optional<TableAttributes,
        "id" | "created_at" | "updated_at"> { }

class TableModel
    extends Model<TableAttributes,
        TableCreateAttributes> {

    static getEditableFields = (): string[] => [
        "name", "table_name"
    ];

    static getAllFields = (): string[] => [
        "id", "name", "table_name",
        "created_at", "updated_at",
    ];
}

TableModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        table_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
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
        tableName: "tables",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export type{
    TableAttributes,
    TableCreateAttributes
}

export default TableModel;
