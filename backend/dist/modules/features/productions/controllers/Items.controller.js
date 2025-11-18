import sequelize from "../../../../mysql/configSequelize.js";
import { QueryTypes } from "sequelize";
;
class ItemsController {
    static getAll = async (req, res, next) => {
        try {
            const response = await sequelize.query("SELECT func_get_items() as items", { type: QueryTypes.SELECT });
            if (response.length === 0) {
                res.status(200).json([]);
                return;
            }
            const raw = response[0].items;
            const items = typeof raw === "string" ? JSON.parse(raw) : raw;
            res.status(200).json(items);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred ${error}`);
            }
        }
    };
}
export default ItemsController;
