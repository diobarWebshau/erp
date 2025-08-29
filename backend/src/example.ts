
const obtenerComprometidoProduction = () => 0;
const obtenerComprometidoStock = () => 0;
const obtenerComprometidoProductionInsumos = (id: number, pop_id: number) => 0;
const generarAjusteDeProducto = (qty: number) => { };
const generarAjusteDeInsumo = (id: number, qty: number) => { };
const obtenerInsumos = () => [{ equivalencia: 0.0, id: 0 }];
const cancelarOrdenDeProduccion = (pop_id: number) => { };
const editarOrdenDeProduccion = (pop_id: number, qty: number) => { };


const cambiarOrden = (new_qty: number, pop_id: number) => {

    // qty original = 500
    // new qty = 300

    const qty_stock = obtenerComprometidoStock(); // 200
    const qty_production = obtenerComprometidoProduction(); // 300

    if (qty_production > 0) {
        // Cuando 150 <= 200
        if (new_qty <= qty_stock) {
            // 150 - 200 = -50
            const diff = new_qty - qty_stock;
            // -(50 + 300) = 350
            const ajuste = -(diff + qty_production);
            generarAjusteDeProducto(ajuste);
            for (const insumo of obtenerInsumos()) {
                // ajuste * equivalencia
                const equtencia_insumo = insumo.equivalencia * ajuste;
                // obtener comprometido real de los insumos
                const ajuste_insumo_production = obtenerComprometidoProductionInsumos(insumo.id, pop_id);

                // significa que hubo produccion y no existe lo suficiente como para ajustar completamente(ojo quedaria en negativo si se ajusta completamente)
                if (ajuste_insumo_production <= equtencia_insumo) {
                    // ajustar lo que queda de los insumos
                    generarAjusteDeInsumo(insumo.id, ajuste_insumo_production);
                } else {
                    // ajustar la cantidad que se ajusto en el producto
                    generarAjusteDeInsumo(insumo.id, equtencia_insumo);
                }
            }
            cancelarOrdenDeProduccion(pop_id);
        } else {
            // abs(300 - 200) = 100
            const diff_pendiente = Math.abs(new_qty - qty_stock);
            // 100 <= 300
            if (diff_pendiente <= qty_production) {
                // 100 - 300 = -200
                const diff_production = Math.abs(diff_pendiente - qty_production);
                // se ajusta de menos 200
                generarAjusteDeProducto(-diff_production);
                for (const insumo of obtenerInsumos()) {
                    // ajuste * equivalencia (Por ejmplo 200 * 1 = 200)
                    const equtencia_insumo = insumo.equivalencia * diff_production;
                    // obtener comprometido real de los insumos (Se puede obtener menos por la produccion) Por ejemplo: 100pz
                    const ajuste_insumo_production = obtenerComprometidoProductionInsumos(insumo.id, pop_id);
                    // significa que hubo produccion y no existe lo suficiente como para ajustar completamente(ojo quedaria en negativo si se ajusta completamente)
                    if (ajuste_insumo_production <= equtencia_insumo) {
                        // ajustar lo que queda de los insumos
                        generarAjusteDeInsumo(insumo.id, ajuste_insumo_production);
                    } else {
                        // ajustar la cantidad que se ajusto en el producto
                        generarAjusteDeInsumo(insumo.id, equtencia_insumo);
                    }
                }
                editarOrdenDeProduccion(pop_id, new_qty);
            } else { //  cuando la cantidad nueva sea 600 por ejemplo
                // 600 - 300 = 300
                const diff_production = diff_pendiente - qty_production;
                // se ajusta 300 de mas 
                generarAjusteDeProducto(diff_production);
                for (const insumo of obtenerInsumos()) {
                    // se ajusta 300 * equivalencia de mas
                    const obtenerEquivalencia_insumo = insumo.equivalencia * diff_production;
                    generarAjusteDeInsumo(insumo.id, obtenerEquivalencia_insumo);
                }
                editarOrdenDeProduccion(pop_id, new_qty);
            }
        }
    } else {
        // Cuando 300 <= 500
        if (new_qty <= qty_stock) {
            // 300-500 = -200
            const diff = new_qty - qty_stock;
            generarAjusteDeProducto(diff);
        } else  //  Cuando 600 > 500  
        {
            // 600 - 500 = 100
            const diff = Math.abs(new_qty - qty_stock);
            generarAjusteDeProducto(diff);
        }
    }
};

export {};
