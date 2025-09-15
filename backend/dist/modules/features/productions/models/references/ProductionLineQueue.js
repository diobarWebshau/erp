import { DataTypes, Model, Op } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
class ProductionLineQueueModel extends Model {
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
ProductionLineQueueModel.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    production_line_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: "production_lines",
            key: "id"
        },
        onDelete: "CASCADE",
    },
    production_order_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: "production_orders",
            key: "id"
        },
        onDelete: "CASCADE",
    },
    position: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "Posición en la cola. NULL significa que la orden ya no está en cola.",
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    tableName: "production_line_queue",
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ["production_line_id", "position"],
            name: "uq_line_pos",
            where: {
                position: { [Op.ne]: null } // índice único solo aplica para position != NULL
            }
        },
        {
            unique: true,
            fields: ["production_line_id", "production_order_id"],
            name: "uq_line_order"
        },
        {
            fields: ["production_line_id"],
            name: "ix_line"
        },
        {
            fields: ["production_line_id", "position"],
            name: "ix_line_pos"
        }
    ]
});
export default ProductionLineQueueModel;
