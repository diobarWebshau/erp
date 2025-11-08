import sequelize
    from "../../../../../mysql/configSequelize.js";
import {
    DataTypes,
    Model, Optional
} from "sequelize";
import {
    PurchasedOrderProductManager,
    PurchaseOrderProductCreateAttributes
} from "../junctions/purchased-orders-products.model.js";
import {
    ClientAddressesCreateAttributes,
    ClientCreateAttributes
} from "./../../../../../modules/types.js";

interface PurchasedOrderAttributes {
    id: number,
    order_code: string,
    delivery_date: Date,
    status: string,
    // client fields
    client_id: number,
    company_name: string,
    tax_id: string,
    email: string,
    phone: string,
    city: string,
    state: string,
    country: string,
    street: string,
    street_number: number,
    neighborhood: string,
    payment_terms: string,
    zip_code: number,
    tax_regimen: string,
    cfdi: string,
    payment_method: string,
    // shipping fields(client address)
    client_address_id: number,
    shipping_street: string,
    shipping_street_number: number,
    shipping_neighborhood: string,
    shipping_city: string,
    shipping_state: string,
    shipping_country: string,
    shipping_zip_code: number,
    //
    total_price: number,
    updated_at: Date
    created_at: Date,
    purchase_order_products?: PurchaseOrderProductCreateAttributes[],
    purchase_order_product_manager?: PurchasedOrderProductManager,
    clien?: ClientCreateAttributes,
    client_address?: ClientAddressesCreateAttributes
}

interface PurchasedOrderCreateAttributes
    extends Optional<PurchasedOrderAttributes,
        "id" | "updated_at"> { }

class PurchasedOrderModel extends
    Model<PurchasedOrderAttributes,
        PurchasedOrderCreateAttributes> {
    static getEditableFields = (): string[] => {
        return [
            "order_code", "delivery_date",
            "status", "client_id", "company_name",
            "tax_id", "email", "phone", "city",
            "state", "country", "street", "street_number", "neighborhood",
            "payment_terms", "zip_code", "tax_regimen",
            "cfdi", "payment_method", "client_address_id",
            "shipping_street", "shipping_street_number", "shipping_neighborhood", "shipping_city",
            "shipping_state", "shipping_country",
            "shipping_zip_code", "total_price", "created_at"
        ];
    }
    static getAllFields(): string[] {
        return [
            "id", "order_code", "delivery_date",
            "status", "client_id", "company_name",
            "tax_id", "email", "phone", "city",
            "state", "country", "street", "street_number", "neighborhood",
            "payment_terms", "zip_code", "tax_regimen",
            "cfdi", "payment_method", "client_address_id",
            "shipping_street", "shipping_street_number", "shipping_neighborhood", "shipping_city",
            "shipping_state", "shipping_country",
            "shipping_zip_code", "total_price",
            "created_at", "updated_at"
        ];
    }
}

PurchasedOrderModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        order_code: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        delivery_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        // client fields
        client_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "clients",
                key: "id"
            },
        },
        company_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        tax_id: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        state: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        country: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        street: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        street_number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        neighborhood: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        payment_terms: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        zip_code: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        tax_regimen: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        cfdi: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        payment_method: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        // shipping fields(client address)
        client_address_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "clients_addresses",
                key: "id"
            },
        },
        shipping_street: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        shipping_street_number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        shipping_neighborhood: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        shipping_city: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        shipping_state: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        shipping_country: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        shipping_zip_code: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        //
        total_price: {
            type: DataTypes.DECIMAL(14, 4),
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE(),
            // defaultValue: DataTypes.NOW(),
            allowNull: false
        },
        updated_at: {
            type: DataTypes.DATE(),
            // defaultValue: DataTypes.NOW(),
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: "purchased_orders",
        timestamps: true,
        updatedAt: "updated_at",
        createdAt: "created_at"
    }
);

export type {
    PurchasedOrderAttributes,
    PurchasedOrderCreateAttributes
}

export default PurchasedOrderModel;
