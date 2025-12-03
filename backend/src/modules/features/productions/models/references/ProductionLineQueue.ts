import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";

interface ProductionLineQueueAttributes {
    id: number;
    production_line_id: number;
    production_order_id: number;
    position?: number | null;
    production_order?: string;
    created_at?: Date;
}

type ProductionLineQueueCreateAttributes = Partial<ProductionLineQueueAttributes>;

class ProductionLineQueueModel extends Model<ProductionLineQueueAttributes, ProductionLineQueueCreateAttributes> {
    static getEditableFields() {
        return [
            "production_line_id",
            "position"
        ];
    }

    static getAllFields() {
        return [
            "id",
            "production_line_id",
            "production_order_id",
            "position",
            "created_at"
        ];
    }
}

ProductionLineQueueModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        production_line_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        production_order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        position: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    },
    {
        sequelize,
        tableName: "production_line_queue",
        timestamps: false
    }
);

export type {
    ProductionLineQueueAttributes,
    ProductionLineQueueCreateAttributes
};

export default ProductionLineQueueModel;
