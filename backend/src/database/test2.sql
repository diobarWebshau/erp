-- USE u482698715_shau_erp;
USE brgb5sc7hqlfhh7m;

DROP FUNCTION IF EXISTS func_get_order_progress_snapshot;
DELIMITER //
CREATE FUNCTION func_get_order_progress_snapshot(
	in_po_id INT
)
RETURNS JSON
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_json JSON;

    DECLARE v_order_qty   DECIMAL(14,4) DEFAULT 0;
    DECLARE v_product_id  INT;
    DECLARE v_order_type  VARCHAR(32);

    /* Base de la OP */
    SELECT 
        po.qty, 
        po.product_id, 
        po.order_type
    INTO v_order_qty, v_product_id, v_order_type
    FROM production_orders po
    WHERE po.id = in_po_id;

    WITH
    /* Ruta del producto (orden por sort_order) */
    route_pp AS (
        SELECT 
            pp.process_id, 
            pp.sort_order AS ord
        FROM products_processes pp
        WHERE pp.product_id = v_product_id
    ),
    /* Procesos observados en productions para esta OP */
    prods AS (
        SELECT 
            DISTINCT p.process_id
        FROM productions p
        WHERE p.production_order_id = in_po_id
    ),
    /* Universo = ruta ∪ observados (los no mapeados al final) */
    -- universo: procesos mapeados con su ord y los no mapeados con ord = NULL
    universe AS (
        SELECT process_id, ord FROM route_pp
        UNION
        SELECT 
            pr.process_id, NULL AS ord -- Dejamos ord = NULL para los procesos no mapeados, y en el ORDER BY fuerza que los NULL vayan al final:
        FROM prods pr
        LEFT JOIN route_pp rp ON rp.process_id = pr.process_id
        WHERE rp.process_id IS NULL
    ),
    /* Etapas 1..N */
    ranked AS (
        SELECT
            u.process_id,
            ROW_NUMBER() OVER ( -- Funcion ventana para generar una numeracion como id, para el obejto del stage en base al orden de los procesos
                ORDER BY (u.ord IS NULL), u.ord, u.process_id  -- ordenamos por si el proceso no esta mapeado (ord = NULL) lo mandamos al final, por el orden de la ruta (ord) y por el id del proceso
            ) AS stage
        FROM (
            SELECT process_id, MIN(ord) AS ord
            FROM universe
            GROUP BY process_id
        ) u
    ),
    /* Acumulado hecho por proceso en esta OP */
    done AS (
        SELECT 
            p.process_id, 
            SUM(p.qty) AS qty_done
        FROM productions p
        WHERE p.production_order_id = in_po_id
        GROUP BY p.process_id
    ),
    /* Mezcla ruta + cantidades hechas */
    -- aqui se mezcla el proceso con las cantidades hechas
    merged AS (
        SELECT 
            r.stage, 
            r.process_id, 
            COALESCE(d.qty_done, 0) AS qty_done -- C
        FROM ranked r
        LEFT JOIN done d USING (process_id) -- igual a LEFT JOIN done d ON r.process_id = d.process_id (como se llaman igual, se puede usar USING)
    ),
    /* Siguiente etapa para calcular métricas y detectar última */
    with_next AS (
        SELECT
            m.*,
            LEAD(m.qty_done, 1, 0) OVER (ORDER BY m.stage) AS next_qty,  -- LEAD toma el valor de una columna de la siguiente fila LEAD(columna, filas adelante, valor por defecto si no hay siguiente)
            MAX(m.stage) OVER () AS max_stage -- MAX toma el valor maximo de una columna MAX(columna)
        FROM merged m
    ),
    /* Totales */
    totals AS (
        SELECT
        COALESCE((SELECT qty_done FROM with_next ORDER BY stage DESC LIMIT 1), 0) AS finished_qty,
        COALESCE((SELECT qty_done FROM with_next ORDER BY stage ASC  LIMIT 1), 0) AS first_stage_done
    ),
    /* Etapas abiertas (todas menos la última) */
    open_stages AS (
        SELECT
        w.stage,
        w.process_id,
        GREATEST(w.qty_done - w.next_qty, 0) AS in_stage_now,
        GREATEST(w.qty_done - t.finished_qty, 0) AS passed_excluding_finished 
        FROM with_next w
        CROSS JOIN totals t
        WHERE w.stage < w.max_stage
    ),
    /* Todas las etapas (incluida la última) para diagnóstico */
    all_stages AS (
        SELECT
        w.stage,
        w.process_id,
        w.qty_done                                  AS done_at_stage,
        w.next_qty                                  AS next_stage_done,
        CASE WHEN w.stage = w.max_stage
            THEN 0
            ELSE GREATEST(w.qty_done - w.next_qty, 0)
        END                                         AS wip_at_stage
        FROM with_next w
    )

    /* JSON final en la forma solicitada */
    SELECT JSON_OBJECT(
        'order_id', in_po_id,
        'order_type', v_order_type,
        'product_id', v_product_id,
        'order_qty', COALESCE(v_order_qty, 0),
        'finished', (SELECT finished_qty FROM totals),
        'remaining_qty',
        GREATEST(COALESCE(v_order_qty, 0) - (SELECT finished_qty FROM totals), 0),
        'not_started',
        GREATEST(COALESCE(v_order_qty, 0) - (SELECT first_stage_done FROM totals), 0),
        'open_wip_total',
        COALESCE((SELECT SUM(in_stage_now) FROM open_stages), 0),
        'open_stages',
        COALESCE((
            SELECT JSON_ARRAYAGG(js.obj)
            FROM (
            SELECT JSON_OBJECT(
                    'stage', stage,
                    'process_id', process_id,
                    'in_stage_now', in_stage_now,-- piezas ya procesadas, pero que no se han movido a la siguiente.
                    'passed_excluding_finished', passed_excluding_finished -- piezas ya procesadas en esta etapa, sin contar las ya finalizadas.
                    ) AS obj
            FROM open_stages
            ORDER BY stage
            ) AS js
        ), JSON_ARRAY()),
        'all_stages',
        COALESCE((
            SELECT JSON_ARRAYAGG(js2.obj)
            FROM (
            SELECT JSON_OBJECT(
                    'stage', stage,
                    'process_id', process_id,
                    'done_at_stage', done_at_stage, -- piezas procesadas en la actual etapa
                    'next_stage_done', next_stage_done, -- piezas ya procesadas en esta etapa, pero que no se han movido a la siguiente.
                    'wip_at_stage', wip_at_stage -- piezas ya procesadas en esta etapa, pero que no se han movido a la siguiente.
                    ) AS obj
            FROM all_stages
            ORDER BY stage
            ) AS js2
        ), JSON_ARRAY())
    ) AS breakdown  
    INTO v_json;

    RETURN v_json;
END//
DELIMITER ;


-- CALL sp_get_order_progress_snapshot(1);


SELECT func_get_order_progress_snapshot(1);

