import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
var ReferenceTypeEnum;
(function (ReferenceTypeEnum) {
    ReferenceTypeEnum["Production"] = "Production";
    ReferenceTypeEnum["Inventory"] = "Inventory";
    ReferenceTypeEnum["Shipping"] = "Shipping";
})(ReferenceTypeEnum || (ReferenceTypeEnum = {}));
var ItemTypeEnum;
(function (ItemTypeEnum) {
    ItemTypeEnum["input"] = "input";
    ItemTypeEnum["product"] = "product";
})(ItemTypeEnum || (ItemTypeEnum = {}));
class ScrapModel extends Model {
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
}, {
    sequelize,
    tableName: "scrap",
    timestamps: false,
    createdAt: "created_at",
    updatedAt: false
});
export default ScrapModel;
