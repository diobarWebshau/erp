import { Response } from "express";
import type { ModelStatic, Model } from "sequelize";

export const getAllAsJson = async (
    res: Response,
    model: ModelStatic<Model>,
    options?: any,
    notFoundMessage = "Items not found"
) => {
    const results = await model.findAll(options);
    if (!results.length) {
        res.status(404).json([]);
        return;
    }
    const json = results.map(item => item.toJSON());
    res.status(200).json(json);
};

export const getByPkAsJson = async (
    res: Response,
    model: ModelStatic<Model>,
    id: number | string,
    notFoundMessage = "Item not found"
) => {
    const result = await model.findByPk(id);
    if (!result) {
        res.status(404).json({ validation: notFoundMessage });
        return;
    }
    res.status(200).json(result.toJSON());
};

export const getOneAsJson = async (
    res: Response,
    model: ModelStatic<Model>,
    where: any,
    notFoundMessage = "Item not found"
) => {
    const result = await model.findOne({ where });
    if (!result) {
        res.status(404).json({ validation: notFoundMessage });
        return;
    }
    res.status(200).json(result.toJSON());
};

export const createItem = async (
    res: Response,
    model: ModelStatic<Model>,
    data: any,
    successMessage = "Item created"
) => {
    const created = await model.create(data);
    res.status(201).json({ message: successMessage, data: created.toJSON() });
};

/**
 * Actualiza un registro por id
 */
export const updateItem = async (
    res: Response,
    model: ModelStatic<Model>,
    id: number | string,
    data: any,
    notFoundMessage = "Item not found",
    noChangeMessage = "No changes were made"
) => {
    const [affectedRows] = await model.update(data, {
        where: { id },
        individualHooks: true,
    });

    if (affectedRows === 0) {
        res.status(404).json({ validation: notFoundMessage });
        return;
    }

    res.status(200).json({ message: "Item updated successfully" });
};

/**
 * Elimina un registro por id
 */
export const deleteItem = async (
    res: Response,
    model: ModelStatic<Model>,
    id: number | string,
    notFoundMessage = "Item not found"
) => {
    const deletedCount = await model.destroy({
        where: { id },
        individualHooks: true,
    });

    if (deletedCount === 0) {
        res.status(404).json({ validation: notFoundMessage });
        return;
    }

    res.status(200).json({ message: "Item deleted successfully" });
};
