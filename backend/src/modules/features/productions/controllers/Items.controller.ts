import { Request, Response, NextFunction } from "express";
import { Op, Sequelize } from "sequelize";
import { InputModel, ItemModel, ProductModel } from "../../../associations.js";
import { IPartialItem } from "../../../types.js";

class ItemsController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {

        const { filter, ...rest } = req.query as { filter?: string } & IPartialItem;

        try {
            // -------------------------------------------
            // 1. Exclusión base (igual que tu otro módulo)
            // -------------------------------------------
            const excludePerField = Object.fromEntries(
                Object.entries(rest)
                    .filter(([_, v]) => v !== undefined)
                    .map(([k, v]) => [
                        k,
                        Array.isArray(v) ? { [Op.notIn]: v } : { [Op.ne]: v }
                    ])
            );

            // -------------------------------------------
            // 2. Filtro general por nombre (product/input)
            // -------------------------------------------
            const filterConditions: any[] = [];

            if (filter && filter.trim()) {
                const f = `%${filter}%`;

                filterConditions.push(
                    // Buscar nombre en productos
                    Sequelize.literal(`
                        EXISTS (
                            SELECT 1
                            FROM products
                            WHERE products.id = ItemModel.item_id
                            AND ItemModel.item_type = 'product'
                            AND (
                                products.name LIKE '${f}'
                                OR products.description LIKE '${f}'
                            )
                        )
                    `),

                    // Buscar nombre en inputs
                    Sequelize.literal(`
                        EXISTS (
                            SELECT 1
                            FROM inputs
                            WHERE inputs.id = ItemModel.item_id
                            AND ItemModel.item_type = 'input'
                            AND (
                                inputs.name LIKE '${f}'
                                OR inputs.description LIKE '${f}'
                            )
                        )
                    `)
                );
            }

            // -------------------------------------------
            // 3. WHERE final
            // -------------------------------------------
            const where = {
                ...excludePerField,
                ...(filterConditions.length > 0 ? { [Op.or]: filterConditions } : {})
            };

            // -------------------------------------------
            // 4. Obtener items con item real incluido
            // -------------------------------------------

            const items = await ItemModel.findAll({
                where,
                attributes: ItemModel.getAllAttributes()
            });

            res.status(200).json(items.map(i => i.toJSON()));
        } catch (error) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`);
            }
        }
    };

    static getItemsByExcludeIds = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const filter = String(req.query.filter ?? "").trim().toLowerCase();
            const type = req.query.type as "product" | "input" | undefined;

            const rawExclude = req.query.excludeIds;
            const arr = Array.isArray(rawExclude) ? rawExclude : rawExclude ? [rawExclude] : [];
            const idsToExclude = arr.map(Number).filter(Number.isFinite);

            // WHERE base
            const where: any = {};

            // Filtro por tipo SOLO si el desarrollador lo pide
            if (type) where.item_type = type;

            if (idsToExclude.length > 0) {
                where.item_id = { [Op.notIn]: idsToExclude };
            }

            // Traemos items SIN includes → afterFind() resolverá producto/insumo
            const rows = await ItemModel.findAll({
                where,
                attributes: ItemModel.getAllAttributes()
            });

            // Ahora rows[i].item ya existe
            const items = rows.map(r => r.toJSON());

            // FILTRO por atributos del PRODUCTO / INPUT real
            const filtered = filter
                ? items.filter(row => {
                    const it: any = row.item;
                    if (!it) return false;

                    const f = filter.toLowerCase();

                    return (
                        it.name?.toLowerCase().includes(f) ||
                        it.description?.toLowerCase().includes(f) ||
                        it.sku?.toLowerCase().includes(f) ||
                        it.custom_id?.toLowerCase?.().includes(f)
                    );
                })
                : items;

            res.status(200).json(filtered);
        } catch (err) {
            next(err);
        }
    };


}

export default ItemsController;
