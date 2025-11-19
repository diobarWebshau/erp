// src/modules/features/items/controllers/Items.controller.ts

import { Request, Response, NextFunction } from "express";
import { Op, Sequelize } from "sequelize";
import { ItemModel } from "../../../associations.js";
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

    static getByID = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const items = await ItemModel.findOne({ where: { id }, attributes: ItemModel.getAllAttributes() });
            if (!items) {
                res.status(404).json(null);
                return;
            }
            res.status(200).json(items.toJSON());
        } catch (error) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error occurred: ${error}`);
            }
        }
    };
}

export default ItemsController;
