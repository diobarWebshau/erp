import sequelize from "../../../../mysql/configSequelize.js";
import { QueryTypes } from "sequelize";
import { Request, Response, NextFunction } from "express";
import { IItem } from "../models/base/items.model.js";

interface IAuxItem {
    items: IItem[]
};

class ItemsController {
    static getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response: IAuxItem[] = await sequelize.query(
                "SELECT func_get_items() as items",
                { type: QueryTypes.SELECT }
            );
            if (response.length === 0) {
                res.status(200).json([]);
                return;
            }
            const raw = response[0].items;
            const items = typeof raw === "string" ? JSON.parse(raw) : raw;
            res.status(200).json(items);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred ${error}`);
            }
        }
    }
}

export default ItemsController;
