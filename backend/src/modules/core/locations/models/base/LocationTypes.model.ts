import sequelize
    from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model, Optional }
    from "sequelize";

interface LocationTypeAttributes {
    id: number,
    name: string,
    created_at: Date,
    updated_at: Date,
}

interface LocationTypeCreateAttributes
    extends Optional<
        LocationTypeAttributes,
        "id" | "updated_at" | "created_at"> { }

class LocationTypeModel
    extends Model<
        LocationTypeAttributes,
        LocationTypeCreateAttributes> {
    static getEditableFields = () => {
        return [
            "id", "name"
        ];
    }
    static getAllFields() {
        return [
            "id", "name", "created_at",
            "updated_at"
        ];
    }
}

LocationTypeModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
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
        tableName: "location_types",
        timestamps: false
    }
);

export type {
    LocationTypeAttributes,
    LocationTypeCreateAttributes
}

export default LocationTypeModel;