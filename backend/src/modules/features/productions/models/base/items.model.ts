import { ProductCreateAttributes, InputCreateAttributes } from "../../../../types.js";
// Importaciones de modelos con relacion con Item de manera indirecta
import { ProductModel, InputModel } from "../../../../associations.js";
import sequelize from "../../../../../mysql/configSequelize.js";
import { DataTypes, Model } from "sequelize";

/* 
    Polimorfismo: puede tener multiples formas, o se puede expresar de varias
    maneras.

    Este modelo representa una tabla polimórfica llamada items donde cada 
    fila apunta a: un producto o un insumo. Pero la tabla no tiene una 
    relación directa mediante claves foráneas porque item_id puede apuntar
    a dos tablas totalmente distintas: products o inputs.

    Por tanto, este modelo asume una lógica de “desambiguación”:

        * Dado un item con un item_type y un item_id, determina qué entidad
          real corresponde, obténla y adjúntala al resultado.    

*/ 

interface IItem {
    id: number;
    item_type: "product" | "input";
    item_id: number;
    item?: ProductCreateAttributes | InputCreateAttributes;
}

type IPartialItem = Partial<IItem>;

class ItemModel extends Model<IItem, IPartialItem> {
    
    /* 
       Declaramos explicitamente las propiedades del modelo
       para que sequelize pueda acceder a ellas en tiempo de
       ejecución. Ya que las interfaces solo trabajan en tiempo
       de compilación.
    */
    declare id: number;
    declare item_type: "product" | "input";
    declare item_id: number;
    declare item?: ProductCreateAttributes | InputCreateAttributes;

    /* 
        Obtenemos los nombres de las propiedades del modelo
        para poder usarlos en las consultas. Para que sequelize
        pueda acceder a ellas en tiempo de ejecución, usamos el
        contexto mismo (this) de la clase para obtener las propiedades
        del modelo, posterior casteamos el resultado a (keyof IItem)[]
        para que typescript no genere error.
    */
    static getAllAttributes() {
        const attr = (this as any).rawAttributes;
        return Object.keys(attr) as (keyof IItem)[];
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
        if (this.item !== undefined) json.item = this.item;
        return json;
    }
}

ItemModel.init(
    {
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
    },
    {
        sequelize,
        modelName: "ItemModel",
        tableName: "items",
        timestamps: false
    }
);

/* 
    Hook para añadir producto/input real al item polimórfico
    Este hook es llamado por sequelize para obtener el item real 
    asociado al item polimórfico.
*/
ItemModel.addHook("afterFind", async (rows: any) => {
    if (!rows) return;

    const list = Array.isArray(rows) ? rows : [rows];

    for (const row of list) {
        row.item = await row.resolveItem();
    }
});

export default ItemModel;

export type {
    IItem,
    IPartialItem
};
