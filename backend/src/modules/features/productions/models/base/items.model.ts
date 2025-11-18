import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../../mysql/configSequelize.js";

interface IItem {
    id: number,
    item_name: string,
    item_id: number
};

type IPartialItem = Partial<IItem>;

class ItemModel extends Model<IItem, IPartialItem>{
    static getAllAttributes(){
        const attr = (this as any).rawAttributes;
        return Object.keys(attr) as (keyof IItem)[];
    }
};

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

export type{ IItem, IPartialItem };
