import { DataTypes, Model, Optional }
    from "sequelize";
import sequelize
    from "../../../../../mysql/configSequelize.js";

interface InternalProductProductionOrderAttributes {
    id: number,
    product_id: number,
    product_name: string,
    location_id: number,
    location_name: string,
    qty: number,
    status: string,
    created_at: Date,
    updated_at: Date
}

// interface OrderProductBase {
//     id: number;
//     product_id: number;
//     product_name: string;
//     qty: number;
//     status: string;
// }

// interface InternalProductProductionOrderAttributes
//     extends OrderProductBase {
//     location_id: number,
//     location_name: string, 
//     created_at: Date,
//     updated_at: Date
// }


interface InternalProductProductionOrderCreateAttributes
    extends Optional<
        InternalProductProductionOrderAttributes,
        "id" | "created_at" | "updated_at"> { }

class InternalProductProductionOrderModel
    extends Model<
        InternalProductProductionOrderAttributes,
        InternalProductProductionOrderCreateAttributes> {
    static getEditableFields = () => {
        return [
            "id", "product_id",
            "qty", "status"
        ];
    }
    static getAllFields() {
        return [
            "id", "product_name",
            "product_id", "qty",
            "location_id", "location_name",
            "status", "created_at",
            "updated_at"
        ];
    }
}

InternalProductProductionOrderModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "products",
                key: "id"
            }
        },
        product_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        location_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "locations",
                key: "id"
            }
        },
        location_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        qty: {
            type: DataTypes.DECIMAL(14, 4),
            allowNull: false
        },
        status: {
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
        tableName: "internal_product_production_orders",
        timestamps: false
    }
);

export type {
    InternalProductProductionOrderAttributes,
    InternalProductProductionOrderCreateAttributes
};

export default InternalProductProductionOrderModel;