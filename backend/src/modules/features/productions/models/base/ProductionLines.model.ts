import { LocationsProductionLinesCreateAttributes, LocationsProductionLinesManager } from "../junctions/locations-production-lines.model.js";
import { ProductionLineProductCreateAttributes, ProductionLineProductManager } from "../junctions/production_lines-products.model.js";
import sequelize from "../../../../../mysql/configSequelize.js";
import { Model, Optional, DataTypes } from "sequelize";

interface ProductionLineAttributes {
    id: number,
    custom_id: string | null,
    name: string | null,
    is_active: boolean,
    created_at: Date,
    updated_at: Date,
    // para la creacion de las relaciones
    location_production_line?: LocationsProductionLinesCreateAttributes,
    production_lines_products?: ProductionLineProductCreateAttributes[],
    location_production_line_updated?: LocationsProductionLinesManager,
    production_lines_products_updated?: ProductionLineProductManager
}

type ProductionLineCreationAttributes = Partial<ProductionLineAttributes>;

class ProductionLineModel extends Model<ProductionLineAttributes, ProductionLineCreationAttributes> {
    static getEditableFields(): string[] {
        return ['name', "is_active", "custom_id"];
    }
    static getAllFields(): string[] {
        return [
            "id", "custom_id", "name", "is_active",
            "created_at", "updated_at"
        ];
    }
}

ProductionLineModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    custom_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    is_active: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
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
        tableName: "production_lines",
        timestamps: false
    }
);

export type {
    ProductionLineAttributes,
    ProductionLineCreationAttributes
}


export default ProductionLineModel;