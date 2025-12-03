import ProductionLineQueueModel from "../models/references/ProductionLineQueue.js";
import sequelize from "../../../../mysql/configSequelize.js";
import { Transaction } from "sequelize";
import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import { Op } from "sequelize";
class ProductionLineQueueController {
    static getAll = async (req, res, next) => {
        try {
            const response = await ProductionLineQueueModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json([]);
                return;
            }
            const productionLineQueue = response.map(pl => pl.toJSON());
            res.status(200).json(productionLineQueue);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static getById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await ProductionLineQueueModel.findByPk(id);
            if (!response) {
                res.status(200).json(null);
                return;
            }
            const productionLineQueue = response.toJSON();
            res.status(200).json(productionLineQueue);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static create = async (req, res, next) => {
        const { production_line_id, production_order_id } = req.body;
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction
                .ISOLATION_LEVELS
                .REPEATABLE_READ
        });
        try {
            const responseLastPositionQueue = await ProductionLineQueueModel.findOne({
                attributes: [
                    [
                        sequelize.fn("IFNULL", sequelize.fn("MAX", sequelize.col("position")), 0),
                        "last_position"
                    ]
                ],
                where: {
                    production_line_id: production_line_id
                },
                lock: transaction.LOCK.UPDATE,
                transaction: transaction,
                raw: true
            });
            const lastPositionQueue = Number(responseLastPositionQueue
                ? responseLastPositionQueue.last_position : 0);
            let newPositionQueue = lastPositionQueue + 10;
            // Verificar si ya existe una fila en esa posición en la misma linea de produccion
            const validateProductionLineQueueSamePosition = await ProductionLineQueueModel.findOne({
                where: {
                    production_line_id: production_line_id,
                    position: newPositionQueue
                },
                transaction: transaction,
                raw: true
            });
            if (validateProductionLineQueueSamePosition) {
                newPositionQueue = lastPositionQueue + 20;
            }
            const response = await ProductionLineQueueModel.create({
                production_line_id,
                production_order_id,
                position: newPositionQueue
            }, {
                transaction: transaction
            });
            if (!response) {
                await transaction.rollback();
                res.status(400).json({
                    message: "The production line queue could not be created"
                });
                return;
            }
            const productionLineQueue = response.toJSON();
            await transaction.commit();
            res.status(200).json(productionLineQueue);
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static update = async (req, res, next) => {
        const { id } = req.params;
        const body = req.body;
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
        });
        try {
            const validateProductionLineQueue = await ProductionLineQueueModel.findByPk(id);
            const editableFields = ProductionLineQueueModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (!validateProductionLineQueue) {
                res.status(200).json({
                    validation: "Production line queue not found"
                });
                return;
            }
            const relationship = validateProductionLineQueue.toJSON();
            // 1️⃣ Bloquear todas las filas de la línea de producción
            await ProductionLineQueueModel.findAll({
                where: { production_line_id: relationship.production_line_id },
                lock: transaction.LOCK.UPDATE,
                transaction
            });
            // 1️⃣ Bloquear todas las filas de la línea de producción
            const maxPosition = await ProductionLineQueueModel.max("position", {
                where: { production_line_id: relationship.production_line_id },
                transaction
            });
            const updateData = {
                ...update_values,
                position: (maxPosition ? (Number(maxPosition) + 10) : 10)
            };
            const response = await ProductionLineQueueModel.update(updateData, {
                where: { id },
                transaction
            });
            if (response[0] === 0) {
                await transaction.rollback();
                res.status(400).json({
                    message: "The production line queue could not be updated"
                });
                return;
            }
            await transaction.commit();
            res.status(200).json({
                message: "Production line queue updated successfully"
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static reorderProductionLineQueue = async (req, res, next) => {
        const { production_line_id } = req.params;
        const { productionOrders } = req.body;
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
        });
        try {
            // 1️⃣ Leer la cola actual con FOR UPDATE
            const currentQueue = await ProductionLineQueueModel.findAll({
                where: { production_line_id },
                order: [["position", "ASC"]],
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            // 2️⃣ Construir un mapa de posiciones temporales
            // Evitamos conflictos con UNIQUE constraint
            const tempGap = 1000;
            const updates = [];
            productionOrders.forEach((item, index) => {
                if (item.production_order_id == null)
                    return; // ← narrowing seguro
                const tempPosition = (index + 1) * tempGap;
                updates.push({
                    id: item.production_order_id,
                    position: tempPosition
                });
            });
            // 3️⃣ Actualizar todas las posiciones temporales en batch
            for (const u of updates) {
                await ProductionLineQueueModel.update({ position: u.position }, { where: { production_order_id: u.id, production_line_id }, transaction });
            }
            // 4️⃣ Normalizar posiciones definitivas (ej: 10, 20, 30…)
            const normalizedGap = 10;
            for (let i = 0; i < updates.length; i++) {
                const finalPosition = (i + 1) * normalizedGap;
                await ProductionLineQueueModel.update({ position: finalPosition }, { where: { production_order_id: updates[i].id, production_line_id }, transaction });
            }
            await transaction.commit();
            res.status(200).json({ message: "Queue reordered successfully" });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static reorderProductionLineQueueOptimizadaTablaTemporal = async (req, res, next) => {
        const production_line_id = Number(req.params.production_line_id);
        const { productionOrders, mode } = req.body;
        const MODE = mode ?? "partial";
        const STEP = 10; // posiciones finales: 10, 20, 30, ...
        const TMP = "tmp_line_positions"; // tabla temporal (scope a la conexión/tx)
        const BATCH_SIZE = 2000;
        // ───────────────────────── Validaciones ─────────────────────────
        if (!Number.isFinite(production_line_id)) {
            res.status(400).json({ message: "production_line_id inválido" });
            return;
        }
        if (!Array.isArray(productionOrders) || productionOrders.length === 0) {
            res.status(400).json({ message: "productionOrders debe ser un arreglo no vacío" });
            return;
        }
        const incomingIds = [];
        const seen = new Set();
        for (const it of productionOrders) {
            const id = Number(it?.production_order_id);
            if (!Number.isFinite(id)) {
                res.status(400).json({ message: "Todos los production_order_id deben ser numéricos" });
                return;
            }
            if (seen.has(id)) {
                res.status(400).json({ message: "IDs duplicados en productionOrders" });
                return;
            }
            seen.add(id);
            incomingIds.push(id);
        }
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
        });
        try {
            // ───── 1) Leer y BLOQUEAR sólo items activos (position IS NOT NULL) ─────
            const currentRows = await ProductionLineQueueModel.findAll({
                where: { production_line_id, position: { [Op.ne]: null } },
                attributes: ["production_order_id", "position"],
                order: [["position", "ASC"]],
                transaction,
                lock: transaction.LOCK.UPDATE,
            });
            const currentIds = currentRows.map((r) => Number(r.get("production_order_id")));
            const currentSet = new Set(currentIds);
            // Validar pertenencia de TODOS los incomingIds
            for (const id of incomingIds) {
                if (!currentSet.has(id)) {
                    await transaction.rollback();
                    res.status(400).json({
                        message: `El ID ${id} no pertenece a la línea ${production_line_id} o no está en cola (position IS NULL).`,
                    });
                    return;
                }
            }
            // Construir ORDEN FINAL
            let finalOrder = [];
            if (MODE === "full") {
                if (incomingIds.length !== currentIds.length) {
                    await transaction.rollback();
                    res.status(400).json({
                        message: "En modo 'full' debes enviar TODOS los IDs de la cola activa (misma longitud).",
                    });
                    return;
                }
                const incomingSet = new Set(incomingIds);
                if (incomingSet.size !== currentSet.size ||
                    [...incomingSet].some((id) => !currentSet.has(id))) {
                    await transaction.rollback();
                    res.status(400).json({
                        message: "En modo 'full' los IDs enviados deben coincidir EXACTAMENTE con los activos de la cola.",
                    });
                    return;
                }
                finalOrder = incomingIds.slice();
            }
            else {
                // partial: subset primero + resto en su orden relativo actual
                const incomingSet = new Set(incomingIds);
                const remaining = currentIds.filter((id) => !incomingSet.has(id));
                finalOrder = [...incomingIds, ...remaining];
            }
            // Early return si no hay cambios de orden
            const isSame = currentIds.length === finalOrder.length &&
                currentIds.every((id, i) => id === finalOrder[i]);
            if (isSame) {
                await transaction.rollback();
                res.status(200).json({
                    message: "Sin cambios",
                    mode: MODE,
                    updated: currentRows.map((r) => ({
                        id: Number(r.get("production_order_id")),
                        position: Number(r.get("position")),
                    })),
                });
                return;
            }
            // ───── 2) Fase de DESPEJE: mover a zona segura (negativo) ─────
            // Evita colisiones del UNIQUE(production_line_id, position) al hacer swap masivo.
            await sequelize.query(`
            UPDATE production_line_queue
            SET position = -position
            WHERE production_line_id = ? AND position IS NOT NULL
            `, { transaction, replacements: [production_line_id] });
            // ───── 3) Preparar tabla temporal con posiciones destino (10,20,30,...) ─────
            await sequelize.query(`DROP TEMPORARY TABLE IF EXISTS ${TMP}`, { transaction });
            // Si tu columna final es BIGINT, esto machea perfecto.
            // Si sigues con DECIMAL(10,4), no hay problema: insertar enteros (10,20,...) es seguro.
            await sequelize.query(`
            CREATE TEMPORARY TABLE ${TMP} (
              production_order_id BIGINT UNSIGNED PRIMARY KEY,
              new_position BIGINT NOT NULL
            ) ENGINE=MEMORY
            `, { transaction });
            for (let i = 0; i < finalOrder.length; i += BATCH_SIZE) {
                const slice = finalOrder.slice(i, i + BATCH_SIZE);
                const valuesSql = slice.map(() => "(?, ?)").join(", ");
                const replacements = [];
                slice.forEach((id, idx) => {
                    const rank = i + idx + 1; // 1..N
                    const pos = rank * STEP; // 10,20,30,...
                    replacements.push(id, pos);
                });
                await sequelize.query(`INSERT INTO ${TMP} (production_order_id, new_position) VALUES ${valuesSql}`, { transaction, replacements });
            }
            // ───── 4) Fase FINAL: asignar posiciones destino desde la temp ─────
            // Amarramos por línea en el JOIN para mayor seguridad.
            await sequelize.query(`
            UPDATE production_line_queue q
            JOIN ${TMP} t
              ON t.production_order_id = q.production_order_id
             AND q.production_line_id = ?
            SET q.position = t.new_position
            `, { transaction, replacements: [production_line_id] });
            // Limpieza explícita
            await sequelize.query(`DROP TEMPORARY TABLE IF EXISTS ${TMP}`, { transaction });
            await transaction.commit();
            const updated = finalOrder.map((id, i) => ({ id, position: (i + 1) * STEP }));
            res.status(200).json({
                message: "Queue reordered successfully",
                mode: MODE,
                updated,
            });
        }
        catch (error) {
            try {
                await sequelize.query(`DROP TEMPORARY TABLE IF EXISTS ${TMP}`, { transaction });
            }
            catch { }
            try {
                await transaction.rollback();
            }
            catch { }
            if (error instanceof Error)
                next(error);
            console.log(error);
        }
    };
    static reorderProductionLineQueueOptimizadaTablaTemporal2 = async (req, res, next) => {
        const production_line_id = Number(req.params.production_line_id);
        const { productionOrders, mode } = req.body;
        console.log(req.body);
        const MODE = mode ?? "partial";
        const GAP = 1000000;
        // Validaciones básicas
        if (!Number.isFinite(production_line_id)) {
            res.status(400).json({ message: "production_line_id inválido" });
            return; // ← NECESARIO
        }
        if (!Array.isArray(productionOrders) || productionOrders.length === 0) {
            res.status(400).json({ message: "productionOrders debe ser un arreglo no vacío" });
            return; // ← NECESARIO
        }
        // Normalizar IDs del payload y validar duplicados/numéricos
        const incomingIds = [];
        const seen = new Set();
        for (const it of productionOrders) {
            const id = Number(it?.production_order_id);
            if (!Number.isFinite(id)) {
                res.status(400).json({
                    message: "Todos los production_order_id deben ser numéricos"
                });
                return; // ← NECESARIO
            }
            if (seen.has(id)) {
                res.status(400).json({
                    message: "IDs duplicados en productionOrders"
                });
                return; // ← NECESARIO
            }
            seen.add(id);
            incomingIds.push(id);
        }
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
        });
        try {
            // 1) Leer y BLOQUEAR la cola actual
            const currentRows = await ProductionLineQueueModel.findAll({
                where: { production_line_id },
                attributes: ["production_order_id", "position"],
                order: [["position", "ASC"]],
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            const currentIds = currentRows.map(r => Number(r.get("production_order_id")));
            const currentSet = new Set(currentIds);
            // 2) Validar pertenencia de TODOS los incomingIds
            for (const id of incomingIds) {
                if (!currentSet.has(id)) {
                    await transaction.rollback();
                    res.status(400).json({
                        message: `El ID ${id} no pertenece a la línea ${production_line_id}`
                    });
                    return; // ← NECESARIO
                }
            }
            // 3) Construir ORDEN FINAL
            let finalOrder = [];
            if (MODE === "full") {
                if (incomingIds.length !== currentIds.length) {
                    await transaction.rollback();
                    res.status(400).json({
                        message: "En modo 'full' debes enviar TODOS los IDs de la cola (misma longitud)."
                    });
                    return; // ← NECESARIO
                }
                const incomingSet = new Set(incomingIds);
                if (incomingSet.size !== currentSet.size ||
                    [...incomingSet].some(id => !currentSet.has(id))) {
                    await transaction.rollback();
                    res.status(400).json({
                        message: "En modo 'full' los IDs enviados deben coincidir EXACTAMENTE con los IDs de la cola."
                    });
                    return; // ← NECESARIO
                }
                finalOrder = incomingIds.slice();
            }
            else {
                const incomingSet = new Set(incomingIds);
                const remaining = currentIds.filter(id => !incomingSet.has(id));
                finalOrder = [...incomingIds, ...remaining];
            }
            // 4) Crear tabla temporal
            await sequelize.query(`
            DROP TEMPORARY TABLE IF EXISTS tmp_line_positions;
            CREATE TEMPORARY TABLE tmp_line_positions (
              production_order_id BIGINT UNSIGNED PRIMARY KEY,
              new_position INT NOT NULL
            ) ENGINE=MEMORY;
        `, { transaction });
            // Lotes
            const batchSize = 2000;
            for (let i = 0; i < finalOrder.length; i += batchSize) {
                const slice = finalOrder.slice(i, i + batchSize);
                const valuesSql = slice.map(() => "(?, ?)").join(", ");
                const replacements = [];
                slice.forEach((id, idx) => {
                    const pos = (i + idx + 1) * GAP;
                    replacements.push(id, pos);
                });
                await sequelize.query(`
                    INSERT INTO tmp_line_positions (production_order_id, new_position)
                    VALUES ${valuesSql};
                `, { transaction, replacements });
            }
            // 5) Update final con JOIN
            await sequelize.query(`
              UPDATE production_line_queue q
              JOIN tmp_line_positions t
                ON t.production_order_id = q.production_order_id
              SET q.position = t.new_position
              WHERE q.production_line_id = ?;
            `, { transaction, replacements: [production_line_id] });
            await sequelize.query(`DROP TEMPORARY TABLE IF EXISTS tmp_line_positions;`, { transaction });
            await transaction.commit();
            // Respuesta final
            const updated = finalOrder.map((id, i) => ({
                id,
                position: (i + 1) * GAP
            }));
            res.status(200).json({
                message: "Queue reordered successfully",
                mode: MODE,
                updated
            });
        }
        catch (error) {
            try {
                await sequelize.query(`DROP TEMPORARY TABLE IF EXISTS tmp_line_positions;`, { transaction });
            }
            catch { }
            try {
                await transaction.rollback();
            }
            catch { }
            if (error instanceof Error)
                return next(error);
        }
    };
    static delete = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await ProductionLineQueueModel.destroy({ where: { id: id } });
            if (!(response > 0)) {
                res.status(200).json({
                    validation: "Production line queue not found"
                });
                return;
            }
            res.status(200).json({
                message: "Production line queue deleted successfully"
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
}
export default ProductionLineQueueController;
