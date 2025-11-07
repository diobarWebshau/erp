import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional } from "sequelize";

interface ClientAddressesAttributes {
    id: number,
    client_id: number,
    street: string,
    street_number: string,
    neighborhood: string,
    city: string,
    state: string,
    country: string,
    zip_code: string,
    created_at: Date,
    updated_at: Date,
}

interface ClientAddressesCreateAttributes
    extends Optional<ClientAddressesAttributes,
        "id" | "created_at" | "updated_at"> { }

interface ClientAddressesManager {
    added: ClientAddressesCreateAttributes[];
    deleted: ClientAddressesAttributes[];
    modified: ClientAddressesCreateAttributes[];
}

class ClientAddressesModel extends
    Model<
        ClientAddressesAttributes,
        ClientAddressesCreateAttributes> {
    static getEditableFields = (): string[] => {
        return [
            "client_id", "street", "street_number",
            "neighborhood", "city", "state", "country",
            "zip_code",
        ];
    }
    static getAllFields(): string[] {
        return [
            "id", "client_id", "street", "street_number",
            "neighborhood", "city", "state", "country",
            "zip_code",
            "created_at", "updated_at"
        ];
    }
}

ClientAddressesModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "clients",
            key: "id"
        },
    },
    street: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    street_number: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    neighborhood: {
        type: DataTypes.TEXT,
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
    zip_code: {
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
        tableName: "clients_addresses",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

export type {
    ClientAddressesAttributes,
    ClientAddressesCreateAttributes,
    ClientAddressesManager
}

export default ClientAddressesModel;