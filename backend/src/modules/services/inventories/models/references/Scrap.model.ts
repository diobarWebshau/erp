import {
    DataTypes, Model, Optional
} from "sequelize";
import sequelize
    from "../../../../../mysql/configSequelize.js";

enum ReferenceTypeEnum {
    Production = "Production",
    Inventory = "Inventory",
    Shipping = "Shipping"
}

enum ItemTypeEnum {
    input = "input",
    product = "product"
}

interface ScrapAttributes {
    id: number;
    reference_type: ReferenceTypeEnum;
    reference_id: number | null;
    location_id?: number | null;
    location_name?: string | null;
    item_id: number;
    item_type: ItemTypeEnum;
    item_name: string;
    qty: number;
    reason: string;
    user_id?: number | null;
    user_name?: string | null;
    created_at?: Date;
}

interface ScrapCreateAttributes
    extends Optional<
        ScrapAttributes,
        "id" | "location_id" |
        "location_name" | "user_id" |
        "user_name" | "created_at"
    > {}

class ScrapModel extends Model<ScrapAttributes, ScrapCreateAttributes> {
    static getEditableFields = () => [
        "reference_type",
        "reference_id",
        "location_id",
        "location_name",
        "item_id",
        "item_type",
        "item_name",
        "qty",
        "reason",
        "user_id",
        "user_name"
    ];

    static getAllFields = () => [
        "id",
        "reference_type",
        "reference_id",
        "location_id",
        "location_name",
        "item_id",
        "item_type",
        "item_name",
        "qty",
        "reason",
        "user_id",
        "user_name",
        "created_at"
    ];
}

ScrapModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        reference_type: {
            type: DataTypes.ENUM(...Object.values(ReferenceTypeEnum)),
            allowNull: false
        },
        reference_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        location_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "locations",
                key: "id"
            },
            onDelete: "SET NULL"
        },
        location_name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        item_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        item_type: {
            type: DataTypes.ENUM(...Object.values(ItemTypeEnum)),
            allowNull: false
        },
        item_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        qty: {
            type: DataTypes.DECIMAL(14, 4),
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "users",
                key: "id"
            },
            onDelete: "SET NULL"
        },
        user_name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: "scrap",
        timestamps: false,
        createdAt: "created_at",
        updatedAt: false
    }
);

export type {
    ScrapAttributes,
    ScrapCreateAttributes
};

export default ScrapModel;
