// Importaciones de modelos con relacion con Item de manera indirecta
import { ProductModel, InputModel } from "../../../../associations.js";
import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";
class ItemModel extends Model {
    /*
        Obtenemos los nombres de las propiedades del modelo
        para poder usarlos en las consultas. Para que sequelize
        pueda acceder a ellas en tiempo de ejecución, usamos el
        contexto mismo (this) de la clase para obtener las propiedades
        del modelo, posterior casteamos el resultado a (keyof IItem)[]
        para que typescript no genere error.
    */
    static getAllAttributes() {
        const attr = this.rawAttributes;
        return Object.keys(attr);
    }
    /*
        Resuelve el item real (producto o insumo) asociado al item polimórfico.

        Este metodo es llamado por el hook "afterFind" de sequelize
        para obtener el item real asociado al item polimórfico.
    */
    async resolveItem() {
        // Si el item es un producto
        if (this.item_type === "product") {
            // Buscamos el producto por su id, junto con sus relaciones
            return await ProductModel.findByPk(this.item_id, {
                include: [
                    { association: "product_processes" },
                    { association: "product_discount_ranges" },
                    {
                        association: "products_inputs",
                        include: [
                            { association: "inputs" },
                        ]
                    }
                ]
            });
        }
        // Si el item es un insumo
        if (this.item_type === "input") {
            // Buscamos el insumo por su id, junto con sus relaciones
            return await InputModel.findByPk(this.item_id, {
                include: [{ association: "input_types" }]
            });
        }
        return null;
    }
    /*
        Funcion que convierte el modelo a JSON, añadiendo el item real
        (producto o insumo) asociado al item polimórfico.
            * this.get() devuelve SOLO los campos reales de la tabla
            * item es virtual, no es una propiedad directa de la tabla,
              por lo que no se incluye por defecto
            * Esta función añade item al JSON final para que lo reciba
              el frontend
            * Sin este método, el frontend jamás vería el producto ni
              el input.
    */
    toJSON() {
        const json = { ...this.get() };
        if (this.item !== undefined)
            json.item = this.item;
        return json;
    }
}
ItemModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    item_type: {
        type: DataTypes.ENUM("product", "input"),
        allowNull: false
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: "ItemModel",
    tableName: "items",
    timestamps: false
});
/*
    Hook para añadir producto/input real al item polimórfico
    Este hook es llamado por sequelize para obtener el item real
    asociado al item polimórfico.
*/
ItemModel.addHook("afterFind", async (rows) => {
    if (!rows)
        return;
    const list = Array.isArray(rows) ? rows : [rows];
    for (const row of list) {
        row.item = await row.resolveItem();
    }
});
export default ItemModel;
