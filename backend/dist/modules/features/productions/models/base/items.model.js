import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";
;
class ItemModel extends Model {
    static getAllAttributes() {
        const attr = this.rawAttributes;
        return Object.keys(attr);
    }
}
;
ItemModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    item_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'item',
    tableName: 'items'
});
export default ItemModel;
