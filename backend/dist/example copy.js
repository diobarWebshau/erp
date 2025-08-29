const obtenerComprometidoProduction = () => 0;
const obtenerComprometidoStock = () => 0;
const obtenerComprometidoProductionInsumos = (id, pop_id) => 0;
const generarAjusteDeProducto = (qty) => { };
const generarAjusteDeInsumo = (id, qty) => { };
const obtenerInsumos = () => [{ equivalencia: 0.0, id: 0 }];
const cancelarOrdenDeProduccion = (pop_id) => { };
const editarOrdenDeProduccion = (pop_id, qty) => { };
const cambiarOrden = (new_qty, pop_id) => {
    const qty_stock = obtenerComprometidoStock(); // Ej: 200
    const qty_production = obtenerComprometidoProduction(); // Ej: 300
    const insumos = obtenerInsumos();
    if (qty_production > 0) {
        // Caso 1: Todo se puede cubrir con stock, cancelar producción
        if (new_qty <= qty_stock) {
            const ajuste = -(qty_stock + qty_production - new_qty);
            generarAjusteDeProducto(ajuste);
            for (const insumo of insumos) {
                const ajuste_insumo = insumo.equivalencia * ajuste;
                const comprometido_insumo = obtenerComprometidoProductionInsumos(insumo.id, pop_id);
                generarAjusteDeInsumo(insumo.id, Math.min(ajuste_insumo, comprometido_insumo));
            }
            // Cancelar orden de producción
            cancelarOrdenDeProduccion(pop_id);
            return;
        }
        // Caso 2: Necesita producción (nueva cantidad mayor que stock comprometido)
        const diff_pendiente = new_qty - qty_stock; // cantidad a ajustar en producción
        // Caso 2.1: La cantidad a ajustar es menor o igual a la producción comprometida
        if (diff_pendiente <= qty_production) {
            // Solo reducir producción
            const ajuste = diff_pendiente - qty_production; // Negativo si reducción
            generarAjusteDeProducto(ajuste);
            for (const insumo of insumos) {
                const ajuste_insumo = insumo.equivalencia * ajuste;
                const comprometido_insumo = obtenerComprometidoProductionInsumos(insumo.id, pop_id);
                generarAjusteDeInsumo(insumo.id, Math.min(ajuste_insumo, comprometido_insumo));
            }
            // Editar orden de producción
            editarOrdenDeProduccion(pop_id, new_qty);
        }
        else {
            // Caso 2.2: La cantidad a ajustar es mayor que la producción comprometida
            // Aumentar producción
            const ajuste = diff_pendiente - qty_production; // Siempre positivo
            generarAjusteDeProducto(ajuste);
            for (const insumo of insumos) {
                const ajuste_insumo = insumo.equivalencia * ajuste;
                generarAjusteDeInsumo(insumo.id, ajuste_insumo);
            }
            // Editar orden de producción
            editarOrdenDeProduccion(pop_id, new_qty);
        }
    }
    else {
        // Caso 3: No hay producción comprometida, solo ajustar stock
        const diff = new_qty - qty_stock;
        if (diff !== 0) {
            generarAjusteDeProducto(diff);
        }
    }
};
export {};
